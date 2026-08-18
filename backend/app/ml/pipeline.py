"""Master ML pipeline orchestrator for the I²TMS system.

This module ties together all ML components into a single coherent
pipeline: video frames → YOLO detection → ByteTrack tracking →
ROI-based analytics → anomaly detection → FrameAnalysis output.

This is the ONE module that the backend team imports and calls.
"""

from __future__ import annotations

import logging
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np

from app.ml.analytics import TrafficAnalyzer
from app.ml.anomaly_detector import TrajectoryAnomalyDetector
from app.ml.config import MLSettings
from app.ml.detector import YOLODetector, TrackedDetection
from app.ml.roi_manager import ROIManager
from app.ml.schemas import (
    AggregateStats,
    AnomalyAlert,
    BoundingBox,
    Centroid,
    Detection,
    DirectionAnalytics,
    FrameAnalysis,
    FrameMetadata,
    VehicleBreakdown,
)
from app.ml.video_processor import FramePacket, VideoProcessor, VideoSourceConfig

logger = logging.getLogger(__name__)


class TrafficMLPipeline:
    """End-to-end ML pipeline for traffic analysis.

    Orchestrates:
        1. YOLO detection (vehicle bounding boxes + classes)
        2. ByteTrack tracking (persistent vehicle IDs across frames)
        3. ROI-based direction analytics (per-direction counts, density, speed)
        4. Trajectory anomaly detection (zig-zag, cut maarna, wrong-side)
        5. Aggregate statistics and congestion scoring

    Usage:
        pipeline = TrafficMLPipeline(model_path="models/best.pt")
        pipeline.setup()

        # Single frame processing
        result = pipeline.process_frame(frame, frame_id=1, source="cam_5.mp4")
        backend_json = result.to_backend_payload()

        # Or run on a video file end-to-end
        for result in pipeline.run_on_video("cam_5.mp4", junction_id="junc_1"):
            print(result.aggregate_stats.overall_congestion_level)
    """

    def __init__(
        self,
        model_path: str = "app/models/best_final.pt",
        settings: MLSettings | None = None,
        roboflow_api_key: str | None = None,
    ) -> None:
        """Initialise the pipeline.

        Args:
            model_path: Path to the YOLO model weights file.
            settings: Optional ML settings. If None, default settings are used.
            roboflow_api_key: Optional Roboflow API key for secondary verification.
        """
        self._settings = settings or MLSettings()
        self._model_path = model_path
        self._roboflow_api_key = roboflow_api_key
        self._detector: YOLODetector | None = None
        self._analyzer: TrafficAnalyzer | None = None
        self._anomaly_detector: TrajectoryAnomalyDetector | None = None
        self._roi_managers: dict[str, ROIManager] = {}
        self._default_roi_manager: ROIManager | None = None
        self._previous_track_ids: set[int] = set()
        self._is_setup = False
        self._frame_count = 0
        self._total_processing_time = 0.0

    def setup(self) -> None:
        """Initialise all ML components.

        Must be called before processing any frames. Loads the YOLO model,
        creates the analyzer and anomaly detector instances.
        """
        logger.info("Setting up TrafficMLPipeline...")
        start = time.time()

        # 1. Load YOLO detector
        self._detector = YOLODetector(
            model_path=self._model_path,
            confidence=self._settings.model_confidence,
            iou_threshold=self._settings.model_iou,
            imgsz=self._settings.model_imgsz,
        )
        self._detector.warmup()

        if self._roboflow_api_key:
            self._detector.setup_roboflow(api_key=self._roboflow_api_key)

        # 2. Create a default ROI manager (will be overridden per-source if configured)
        self._default_roi_manager = ROIManager.from_quadrant_split(640, 640)

        # 3. Create traffic analyzer
        self._analyzer = TrafficAnalyzer(
            roi_manager=self._default_roi_manager,
            fps=self._settings.processing_fps,
            speed_scale_factor=self._settings.speed_scale_factor,
        )
        self._analyzer.set_default_homography()

        # 4. Create anomaly detector
        self._anomaly_detector = TrajectoryAnomalyDetector(
            heading_variance_threshold=self._settings.anomaly_heading_variance_threshold,
            lateral_deviation_threshold=self._settings.anomaly_lateral_deviation_threshold,
            min_track_age=self._settings.anomaly_min_track_age,
            trajectory_window=self._settings.anomaly_trajectory_window,
        )

        self._is_setup = True
        elapsed = time.time() - start
        logger.info("TrafficMLPipeline setup complete in %.2fs", elapsed)
        logger.info("Model: %s", self._detector.model_info)
        logger.info("Device: %s", self._detector.device_info)

    def set_roi_for_source(
        self,
        source_key: str,
        roi_manager: ROIManager,
    ) -> None:
        """Set a specific ROI configuration for a video source.

        Args:
            source_key: The source identifier (e.g., camera name or file stem).
            roi_manager: The ROI manager with configured zones for this source.
        """
        self._roi_managers[source_key] = roi_manager
        logger.info(
            "Set ROI for source '%s' with %d zones: %s",
            source_key,
            len(roi_manager.directions),
            roi_manager.directions,
        )

    def load_aic21_roi(self, camera_name: str, roi_file: str, frame_shape: tuple[int, int]) -> None:
        """Load an AIC21-format ROI file for a specific camera.

        Args:
            camera_name: The camera/source key (e.g., 'cam_5').
            roi_file: Path to the AIC21 ROI text file.
            frame_shape: (height, width) of the video frames.
        """
        roi_manager = ROIManager.from_aic21_roi_file(roi_file, frame_shape)
        self.set_roi_for_source(camera_name, roi_manager)

    def _get_roi_manager(self, source: str, frame_shape: tuple[int, int]) -> ROIManager:
        """Get the ROI manager for a given source, creating default if needed.

        Args:
            source: The source identifier.
            frame_shape: (height, width) for creating default quadrant split.

        Returns:
            The appropriate ROIManager for this source.
        """
        source_stem = Path(source).stem if source else ""

        # Check for exact match or stem match
        if source in self._roi_managers:
            return self._roi_managers[source]
        if source_stem in self._roi_managers:
            return self._roi_managers[source_stem]

        # Create default quadrant-based ROI for this frame size
        if self._default_roi_manager is None:
            h, w = frame_shape
            self._default_roi_manager = ROIManager.from_quadrant_split(w, h)

        return self._default_roi_manager

    def process_frame(
        self,
        frame: np.ndarray,
        frame_id: int,
        source: str = "unknown",
        junction_id: str | None = None,
        verify_emergency: bool = False,
    ) -> FrameAnalysis:
        """Process a single frame through the complete ML pipeline.

        This is the core method. It runs:
            1. YOLO detection + ByteTrack tracking
            2. ROI zone classification for each detection
            3. Speed/heading estimation per vehicle
            4. Direction-level analytics computation
            5. Trajectory anomaly detection
            6. Aggregate statistics and congestion scoring

        Args:
            frame: BGR image as numpy array.
            frame_id: Sequential frame number.
            source: Source identifier (filename or camera ID).
            junction_id: Optional junction identifier for backend correlation.
            verify_emergency: Trigger secondary Roboflow inference for emergency vehicles.

        Returns:
            Complete FrameAnalysis with all extracted data.

        Raises:
            RuntimeError: If setup() has not been called.
        """
        if not self._is_setup:
            raise RuntimeError("Pipeline not set up. Call setup() first.")

        pipeline_start = time.time()
        self._frame_count += 1

        h, w = frame.shape[:2]
        roi_manager = self._get_roi_manager(source, (h, w))

        # --- Step 1: Detection + Tracking ---
        t0 = time.time()
        tracked_detections = self._detector.detect_and_track(frame, verify_emergency=verify_emergency)
        inference_time = (time.time() - t0) * 1000

        # --- Step 2: Classify detections into ROI zones + estimate speed/heading ---
        t1 = time.time()
        current_track_ids: set[int] = set()
        enriched_detections: list[Detection] = []

        for td in tracked_detections:
            current_track_ids.add(td.track_id)

            # Determine ROI zone
            in_roi = roi_manager.point_in_zone(td.centroid)

            # Estimate speed and heading
            speed = self._analyzer.estimate_speed(td.track_id, td.centroid, frame_id)
            heading = self._analyzer.estimate_heading(td.track_id, td.centroid)

            # Determine vehicle class name
            class_name = td.class_name

            enriched_detections.append(
                Detection(
                    vehicle_id=f"VEH-{td.track_id:04d}",
                    class_name=class_name,
                    class_id=td.class_id,
                    confidence=round(td.confidence, 3),
                    bbox=BoundingBox(x1=td.bbox[0], y1=td.bbox[1], x2=td.bbox[2], y2=td.bbox[3]),
                    centroid=Centroid(x=td.centroid[0], y=td.centroid[1]),
                    speed_kmh=round(speed, 1) if speed is not None else None,
                    heading_degrees=round(heading, 1) if heading is not None else None,
                    in_roi=in_roi,
                    track_age_frames=frame_id,  # Simplified; full age requires track store
                )
            )

            # Update anomaly detector with new position
            self._anomaly_detector.update(
                track_id=td.track_id,
                frame_id=frame_id,
                centroid=td.centroid,
                speed_kmh=speed,
                heading=heading,
            )

        tracking_time = (time.time() - t1) * 1000

        # --- Step 3: Direction analytics ---
        t2 = time.time()
        direction_analytics = self._analyzer.update(frame_id, tracked_detections, roi_manager)

        # Convert raw dicts from analyzer to schema DirectionAnalytics objects
        direction_schemas: dict[str, DirectionAnalytics] = {}
        for direction, da_dict in direction_analytics.items():
            # Build VehicleBreakdown from the raw dict
            vb_raw = da_dict.get("vehicle_breakdown", {})
            dir_breakdown = VehicleBreakdown(
                cars=vb_raw.get("car", 0),
                motorcycles=vb_raw.get("motorcycle", 0),
                buses=vb_raw.get("bus", 0),
                trucks=vb_raw.get("truck", 0),
                autorickshaws=vb_raw.get("autorickshaw", 0),
                persons=vb_raw.get("person", 0),
            )
            direction_schemas[direction] = DirectionAnalytics(
                direction=direction,
                vehicle_count=da_dict.get("vehicle_count", 0),
                vehicle_breakdown=dir_breakdown,
                density_ratio=round(da_dict.get("density_ratio", 0.0), 4),
                density_level=da_dict.get("density_level", "LOW"),
                average_speed_kmh=round(da_dict.get("average_speed_kmh", 0.0), 1),
                queue_length_meters=round(da_dict.get("queue_length_meters", 0.0), 1),
                flow_rate_veh_per_min=round(da_dict.get("flow_rate_veh_per_min", 0.0), 1),
                occupancy_percent=round(da_dict.get("occupancy_percent", 0.0), 1),
            )

        analytics_time = (time.time() - t2) * 1000

        # --- Step 4: Anomaly detection ---
        raw_anomalies = self._anomaly_detector.analyze_all(list(current_track_ids))

        # anomaly_detector now returns proper AnomalyAlert schema objects directly
        anomaly_alerts: list[AnomalyAlert] = raw_anomalies

        # Cleanup stale tracks
        self._anomaly_detector.cleanup(current_track_ids)

        # --- Step 5: Aggregate statistics ---
        new_tracks = current_track_ids - self._previous_track_ids
        lost_tracks = self._previous_track_ids - current_track_ids
        self._previous_track_ids = current_track_ids.copy()

        # Count vehicles by class
        class_counts: dict[str, int] = {}
        for det in enriched_detections:
            cn = det.class_name.lower()
            class_counts[cn] = class_counts.get(cn, 0) + 1

        vehicle_breakdown = VehicleBreakdown(
            cars=class_counts.get("car", 0),
            motorcycles=class_counts.get("motorcycle", 0),
            buses=class_counts.get("bus", 0),
            trucks=class_counts.get("truck", 0) + class_counts.get("lcv", 0) + class_counts.get("multiaxle", 0) + class_counts.get("tractor", 0),
            autorickshaws=class_counts.get("autorickshaw", 0) + class_counts.get("auto", 0),
            persons=class_counts.get("person", 0),
        )

        # Calculate overall congestion from direction analytics
        max_density_dir = "UNKNOWN"
        max_density = 0.0
        total_speed = 0.0
        speed_count = 0
        max_congestion_score = 0.0
        max_congestion_level = "WARNING"

        for direction, da in direction_schemas.items():
            if da.density_ratio > max_density:
                max_density = da.density_ratio
                max_density_dir = direction
            if da.average_speed_kmh > 0:
                total_speed += da.average_speed_kmh
                speed_count += 1
            # Use the congestion score from each direction
            cong_score = self._analyzer.calculate_congestion_score(
                da.density_ratio, da.average_speed_kmh, da.queue_length_meters
            )
            if cong_score > max_congestion_score:
                max_congestion_score = cong_score
                max_congestion_level = self._analyzer.classify_congestion(cong_score)

        avg_speed = total_speed / speed_count if speed_count > 0 else 0.0

        aggregate_stats = AggregateStats(
            total_vehicles=len(enriched_detections),
            total_by_class=vehicle_breakdown,
            avg_speed_kmh=round(avg_speed, 1),
            max_density_direction=max_density_dir,
            overall_congestion_score=round(max_congestion_score, 2),
            overall_congestion_level=max_congestion_level,
            active_tracks=len(current_track_ids),
            new_tracks_this_frame=len(new_tracks),
            lost_tracks_this_frame=len(lost_tracks),
        )

        # --- Step 6: Assemble FrameAnalysis ---
        total_time = (time.time() - pipeline_start) * 1000
        self._total_processing_time += total_time

        frame_metadata = FrameMetadata(
            resolution_width=w,
            resolution_height=h,
            inference_time_ms=round(inference_time, 1),
            tracking_time_ms=round(tracking_time, 1),
            analytics_time_ms=round(analytics_time, 1),
            total_processing_time_ms=round(total_time, 1),
            model_name=self._detector.model_info.get("model_type", "yolov8"),
            tracker_name="bytetrack",
        )

        frame_analysis = FrameAnalysis(
            frame_id=frame_id,
            timestamp=datetime.now(timezone.utc),
            source=source,
            junction_id=junction_id,
            detections=enriched_detections,
            direction_analytics=direction_schemas,
            anomalies=anomaly_alerts,
            aggregate_stats=aggregate_stats,
            frame_metadata=frame_metadata,
        )

        # Log summary every 100 frames
        if self._frame_count % 100 == 0:
            avg_fps = 1000 / (self._total_processing_time / self._frame_count)
            logger.info(
                "Pipeline stats @ frame %d: %.1fms/frame (%.1f FPS), "
                "%d vehicles, congestion=%s (%.2f)",
                frame_id,
                total_time,
                avg_fps,
                len(enriched_detections),
                max_congestion_level,
                max_congestion_score,
            )

        return frame_analysis

    def process_frame_packet(self, packet: FramePacket, verify_emergency: bool = False) -> FrameAnalysis:
        """Process a FramePacket from the VideoProcessor.

        Convenience method that unpacks the FramePacket fields.

        Args:
            packet: FramePacket from VideoProcessor.read_frames().
            verify_emergency: Trigger secondary Roboflow inference for emergency vehicles.

        Returns:
            Complete FrameAnalysis.
        """
        return self.process_frame(
            frame=packet.frame,
            frame_id=packet.frame_id,
            source=packet.source,
            junction_id=packet.junction_id,
            verify_emergency=verify_emergency,
        )

    def run_on_video(
        self,
        video_path: str,
        junction_id: str | None = None,
        max_frames: int | None = None,
        callback: Any = None,
    ):
        """Run the full pipeline on a video file.

        This is the highest-level convenience method for processing an
        entire video file and yielding FrameAnalysis results.

        Args:
            video_path: Path to the video file.
            junction_id: Optional junction identifier.
            max_frames: Optional limit on number of frames to process.
            callback: Optional callable(FrameAnalysis) called after each frame.

        Yields:
            FrameAnalysis for each processed frame.
        """
        processor = VideoProcessor()
        processor.add_source(
            VideoSourceConfig(
                source_path=video_path,
                junction_id=junction_id,
                target_fps=self._settings.processing_fps,
                loop_video=False,
                frame_skip=4,
            )
        )

        with processor:
            frames_processed = 0
            for packet in processor.read_frames(round_robin=False):
                if max_frames and frames_processed >= max_frames:
                    break

                result = self.process_frame_packet(packet)
                frames_processed += 1

                if callback:
                    callback(result)

                yield result

        logger.info(
            "Video processing complete: %s (%d frames)",
            video_path,
            frames_processed,
        )

    def run_on_multiple_videos(
        self,
        video_configs: list[VideoSourceConfig],
        max_frames_per_source: int | None = None,
    ):
        """Run the pipeline on multiple video sources simultaneously.

        Sources are read in round-robin fashion, simulating multiple
        junction cameras feeding into a single ICCC dashboard.

        Args:
            video_configs: List of VideoSourceConfig for each camera.
            max_frames_per_source: Optional per-source frame limit.

        Yields:
            FrameAnalysis for each processed frame from any source.
        """
        processor = VideoProcessor()
        for config in video_configs:
            processor.add_source(config)

        with processor:
            frames_per_source: dict[str, int] = {}
            for packet in processor.read_frames(round_robin=True):
                source_key = Path(packet.source).stem
                count = frames_per_source.get(source_key, 0)

                if max_frames_per_source and count >= max_frames_per_source:
                    continue

                result = self.process_frame_packet(packet)
                frames_per_source[source_key] = count + 1

                yield result

    def get_annotated_frame(
        self,
        frame: np.ndarray,
        analysis: FrameAnalysis,
        draw_roi: bool = True,
        draw_detections: bool = True,
        draw_tracks: bool = True,
        draw_anomalies: bool = True,
    ) -> np.ndarray:
        """Draw detection overlays on a frame for visualization.

        Args:
            frame: Original BGR frame.
            analysis: The FrameAnalysis result for this frame.
            draw_roi: Whether to draw ROI zone overlays.
            draw_detections: Whether to draw bounding boxes.
            draw_tracks: Whether to draw track ID labels.
            draw_anomalies: Whether to highlight anomalous vehicles.

        Returns:
            Annotated frame as numpy array.
        """
        import cv2

        annotated = frame.copy()
        h, w = frame.shape[:2]

        # Draw ROI zones
        if draw_roi:
            roi_manager = self._get_roi_manager(analysis.source, (h, w))
            annotated = roi_manager.draw_zones(annotated, alpha=0.2)

        # Draw detections
        if draw_detections:
            for det in analysis.detections:
                bbox = det.bbox
                color = (0, 255, 0)  # Green for normal

                # Red for anomalous vehicles
                is_anomalous = any(a.vehicle_id == det.vehicle_id for a in analysis.anomalies)
                if is_anomalous and draw_anomalies:
                    color = (0, 0, 255)

                # Draw bounding box
                cv2.rectangle(annotated, (bbox.x1, bbox.y1), (bbox.x2, bbox.y2), color, 2)

                # Draw label
                if draw_tracks:
                    label = f"{det.vehicle_id} {det.class_name}"
                    if det.speed_kmh is not None:
                        label += f" {det.speed_kmh:.0f}km/h"

                    label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]
                    cv2.rectangle(
                        annotated,
                        (bbox.x1, bbox.y1 - label_size[1] - 8),
                        (bbox.x1 + label_size[0] + 4, bbox.y1),
                        color,
                        -1,
                    )
                    cv2.putText(
                        annotated,
                        label,
                        (bbox.x1 + 2, bbox.y1 - 4),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        (255, 255, 255),
                        1,
                    )

        # Draw anomaly markers
        if draw_anomalies:
            for anomaly in analysis.anomalies:
                cx, cy = int(anomaly.centroid.x), int(anomaly.centroid.y)
                cv2.circle(annotated, (cx, cy), 25, (0, 0, 255), 3)
                cv2.putText(
                    annotated,
                    f"! {anomaly.anomaly_type.value}",
                    (cx + 30, cy),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 0, 255),
                    2,
                )

        # Draw stats overlay
        stats_lines = [
            f"Vehicles: {analysis.aggregate_stats.total_vehicles}",
            f"Congestion: {analysis.aggregate_stats.overall_congestion_level} "
            f"({analysis.aggregate_stats.overall_congestion_score:.2f})",
            f"FPS: {1000 / analysis.frame_metadata.total_processing_time_ms:.1f}"
            if analysis.frame_metadata.total_processing_time_ms > 0
            else "FPS: --",
        ]
        y_offset = 30
        for line in stats_lines:
            cv2.putText(
                annotated, line, (10, y_offset),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2,
            )
            y_offset += 28

        return annotated

    def reset(self) -> None:
        """Reset all internal state for a fresh run."""
        if self._analyzer:
            self._analyzer.reset()
        if self._anomaly_detector:
            self._anomaly_detector.cleanup(set())
        self._previous_track_ids.clear()
        self._frame_count = 0
        self._total_processing_time = 0.0
        logger.info("Pipeline state reset")

    @property
    def stats(self) -> dict[str, Any]:
        """Current pipeline statistics."""
        avg_time = (
            self._total_processing_time / self._frame_count
            if self._frame_count > 0
            else 0
        )
        return {
            "frames_processed": self._frame_count,
            "total_processing_time_ms": round(self._total_processing_time, 1),
            "avg_processing_time_ms": round(avg_time, 1),
            "avg_fps": round(1000 / avg_time, 1) if avg_time > 0 else 0,
            "is_setup": self._is_setup,
            "model": self._detector.model_info if self._detector else None,
            "device": self._detector.device_info if self._detector else None,
            "active_tracks": len(self._previous_track_ids),
            "anomaly_tracks": (
                self._anomaly_detector.active_tracks
                if self._anomaly_detector
                else 0
            ),
        }
