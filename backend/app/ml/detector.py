from __future__ import annotations

import logging
import os
import time
from dataclasses import dataclass
from typing import Any, Tuple, List, Dict

import numpy as np

# Set up logging
logger = logging.getLogger(__name__)

@dataclass(frozen=True)
class RawDetection:
    bbox: Tuple[int, int, int, int]  # x1, y1, x2, y2
    confidence: float
    class_id: int
    class_name: str
    centroid: Tuple[float, float]

@dataclass(frozen=True)
class TrackedDetection:
    bbox: Tuple[int, int, int, int]
    confidence: float
    class_id: int
    class_name: str
    centroid: Tuple[float, float]
    track_id: int

class YOLODetector:
    def __init__(
        self,
        model_path: str,
        confidence: float = 0.25,
        iou_threshold: float = 0.45,
        imgsz: int = 640,
        device: str = "auto"
    ):
        # We let ultralytics handle model existence check, 
        # as it can auto-download standard models like yolov8n.pt

        self.model_path = model_path
        self.confidence = confidence
        self.iou_threshold = iou_threshold
        self.imgsz = imgsz

        from ultralytics import YOLO
        import torch

        if device == "auto":
            if torch.backends.mps.is_available():
                self._device = "mps"
            elif torch.cuda.is_available():
                self._device = "cuda"
            else:
                self._device = "cpu"
        else:
            self._device = device

        self.enable_roboflow = False
        self.roboflow_model = None

        logger.info(f"Loading YOLO model from {model_path} on device {self._device}")
        try:
            self.model = YOLO(model_path)
            # Send to device
            self.model.to(self._device)
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            raise

        self._is_single_class = len(self.model.names) == 1
        
        logger.info(
            f"Loaded YOLO model. Type: {self.model.task}, "
            f"Classes: {len(self.model.names)} ({'Single-class' if self._is_single_class else 'Multi-class'})"
        )

    def setup_roboflow(self, api_key: str, model_id: str = "indian-emergency-vehicles-bceta/1") -> None:
        try:
            from inference import get_model
            logger.info(f"Downloading/loading Roboflow model {model_id} locally...")
            self.roboflow_model = get_model(
                model_id=model_id, 
                api_key=api_key
            )
            self.enable_roboflow = True
            logger.info("Roboflow secondary model initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to load Roboflow model: {e}")

    def _get_centroid(self, x1: int, y1: int, x2: int, y2: int) -> Tuple[float, float]:
        return (x1 + x2) / 2.0, (y1 + y2) / 2.0

    def get_class_name(self, class_id: int, bbox: Tuple[int, int, int, int] = None, frame_height: int = 1080) -> str:
        name = self.model.names.get(class_id, "unknown").lower()
        return name

    def estimate_vehicle_type(self, bbox: Tuple[int, int, int, int], frame_height: int) -> str:
        """Estimate vehicle type based on bounding box dimensions."""
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        area = w * h
        aspect_ratio = w / float(h) if h > 0 else 1.0
        
        # Simple heuristic based on bbox size and shape
        if area > (frame_height * frame_height * 0.05):
            return "bus" if aspect_ratio < 1.0 else "truck"
        elif area < (frame_height * frame_height * 0.01) and aspect_ratio < 0.8:
            return "motorcycle"
        return "car"

    def _calculate_iou(self, box1: Tuple[int, int, int, int], box2: Tuple[int, int, int, int]) -> float:
        x_left = max(box1[0], box2[0])
        y_top = max(box1[1], box2[1])
        x_right = min(box1[2], box2[2])
        y_bottom = min(box1[3], box2[3])

        if x_right < x_left or y_bottom < y_top:
            return 0.0

        intersection_area = (x_right - x_left) * (y_bottom - y_top)
        box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
        box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])
        iou = intersection_area / float(box1_area + box2_area - intersection_area)
        return iou

    def detect(self, frame: np.ndarray) -> List[RawDetection]:
        if frame is None or frame.size == 0:
            logger.warning("Empty frame passed to detect.")
            return []

        start_time = time.time()
        try:
            # We don't filter classes here because the model is trained specifically on AIC21 traffic.
            results = self.model.predict(
                frame,
                conf=self.confidence,
                iou=self.iou_threshold,
                imgsz=self.imgsz,
                device=self._device,
                verbose=False
            )
        except RuntimeError as e:
            if "out of memory" in str(e).lower() and self._device == "cuda":
                logger.warning("CUDA OOM detected. Falling back to CPU for this frame.")
                import torch
                torch.cuda.empty_cache()
                results = self.model.predict(
                    frame,
                    conf=self.confidence,
                    iou=self.iou_threshold,
                    imgsz=self.imgsz,
                    device="cpu",
                    verbose=False
                )
            else:
                logger.error(f"Inference error: {e}")
                return []
        except Exception as e:
            logger.error(f"Error during detection: {e}")
            return []

        inference_time = time.time() - start_time
        logger.debug(f"Detection took {inference_time * 1000:.2f} ms")

        detections = []
        if not results:
            return detections

        result = results[0]
        if result.boxes is None or len(result.boxes) == 0:
            return detections

        boxes = result.boxes.xyxy.cpu().numpy()
        confs = result.boxes.conf.cpu().numpy()
        class_ids = result.boxes.cls.cpu().numpy().astype(int)
        
        frame_height = frame.shape[0]

        for box, conf, cls_id in zip(boxes, confs, class_ids):
            x1, y1, x2, y2 = map(int, box)
            bbox = (x1, y1, x2, y2)
            centroid = self._get_centroid(x1, y1, x2, y2)
            class_name = self.get_class_name(cls_id, bbox, frame_height)
            
            detections.append(RawDetection(
                bbox=bbox,
                confidence=float(conf),
                class_id=int(cls_id),
                class_name=class_name,
                centroid=centroid
            ))

        return detections

    def detect_and_track(self, frame: np.ndarray, verify_emergency: bool = False) -> List[TrackedDetection]:
        if frame is None or frame.size == 0:
            logger.warning("Empty frame passed to detect_and_track.")
            return []

        start_time = time.time()
        traffic_classes = [0, 1, 2, 3, 5, 7]
        try:
            results = self.model.track(
                frame,
                persist=True,
                conf=self.confidence,
                iou=self.iou_threshold,
                imgsz=self.imgsz,
                device=self._device,
                classes=traffic_classes,
                tracker="bytetrack.yaml",
                verbose=False
            )
        except RuntimeError as e:
            if "out of memory" in str(e).lower() and self._device == "cuda":
                logger.warning("CUDA OOM detected during tracking. Falling back to CPU for this frame.")
                import torch
                torch.cuda.empty_cache()
                results = self.model.track(
                    frame,
                    persist=True,
                    conf=self.confidence,
                    iou=self.iou_threshold,
                    imgsz=self.imgsz,
                    device="cpu",
                    tracker="bytetrack.yaml",
                    verbose=False
                )
            else:
                logger.error(f"Tracking error: {e}")
                return []
        except Exception as e:
            logger.error(f"Error during tracking: {e}")
            return []

        inference_time = time.time() - start_time
        logger.debug(f"Tracking took {inference_time * 1000:.2f} ms")

        detections = []
        if not results:
            return detections

        result = results[0]
        if result.boxes is None or len(result.boxes) == 0:
            return detections

        boxes = result.boxes.xyxy.cpu().numpy()
        confs = result.boxes.conf.cpu().numpy()
        class_ids = result.boxes.cls.cpu().numpy().astype(int)
        
        if result.boxes.id is not None:
            track_ids = result.boxes.id.cpu().numpy().astype(int)
        else:
            track_ids = [-1] * len(boxes)
            
        frame_height = frame.shape[0]

        # Process primary detections
        for box, conf, cls_id, track_id in zip(boxes, confs, class_ids, track_ids):
            if track_id == -1:
                pass
                
            x1, y1, x2, y2 = map(int, box)
            bbox = (x1, y1, x2, y2)
            centroid = self._get_centroid(x1, y1, x2, y2)
            class_name = self.get_class_name(cls_id, bbox, frame_height)
            
            detections.append(TrackedDetection(
                bbox=bbox,
                confidence=float(conf),
                class_id=int(cls_id),
                class_name=class_name,
                centroid=centroid,
                track_id=int(track_id)
            ))

        # Secondary verification for emergency vehicles
        if verify_emergency and self.enable_roboflow and self.roboflow_model is not None:
            try:
                robo_results = self.roboflow_model.infer(frame)
                # Roboflow inference returns a list or dict. Typically: dict with 'predictions' key
                if isinstance(robo_results, list) and len(robo_results) > 0:
                    preds = robo_results[0].predictions
                else:
                    preds = getattr(robo_results, 'predictions', []) or robo_results.get('predictions', [])

                for pred in preds:
                    p_class = pred.get('class', '').lower()
                    if p_class in ['ambulance', 'police', 'fire']:
                        # Convert center coordinates to xyxy
                        x, y = pred['x'], pred['y']
                        w, h = pred['width'], pred['height']
                        rx1, ry1 = int(x - w/2), int(y - h/2)
                        rx2, ry2 = int(x + w/2), int(y + h/2)
                        r_box = (rx1, ry1, rx2, ry2)

                        # Find matching track
                        best_match_idx = -1
                        best_iou = 0.5 # Minimum IoU to match
                        for i, det in enumerate(detections):
                            if det.class_name in ['car', 'bus', 'truck']:
                                iou = self._calculate_iou(r_box, det.bbox)
                                if iou > best_iou:
                                    best_iou = iou
                                    best_match_idx = i
                        
                        if best_match_idx >= 0:
                            # Update the class of the matched tracked detection
                            old = detections[best_match_idx]
                            detections[best_match_idx] = TrackedDetection(
                                bbox=old.bbox,
                                confidence=max(old.confidence, pred.get('confidence', 0.8)),
                                class_id=old.class_id,
                                class_name=p_class,
                                centroid=old.centroid,
                                track_id=old.track_id
                            )
            except Exception as e:
                logger.error(f"Roboflow verification failed: {e}")

        return detections

    def warmup(self, imgsz: Tuple[int, int] = (640, 640)) -> None:
        """
        Run a dummy inference to warm up the model.
        """
        logger.info("Warming up YOLO model...")
        dummy_img = np.zeros((imgsz[1], imgsz[0], 3), dtype=np.uint8)
        self.detect(dummy_img)
        logger.info("YOLO model warmup complete.")

    @property
    def device_info(self) -> str:
        return self._device

    @property
    def model_info(self) -> Dict[str, Any]:
        return {
            "path": self.model_path,
            "classes": self.model.names,
            "is_single_class": self._is_single_class,
            "device": self._device,
            "imgsz": self.imgsz,
            "task": self.model.task
        }
