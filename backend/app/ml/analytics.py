from __future__ import annotations
import logging
import math
import time
from collections import deque
from typing import Dict, List, Optional, Tuple, Any

import cv2
import numpy as np

from app.ml.schemas import DirectionAnalytics, DensityLevel
from app.ml.detector import TrackedDetection
from app.ml.roi_manager import ROIManager, ROIZone

logger = logging.getLogger(__name__)


class TrafficAnalyzer:
    def __init__(self, roi_manager: ROIManager, fps: int = 10, speed_scale_factor: float = 0.05) -> None:
        self.roi_manager = roi_manager
        self.fps = fps
        self.speed_scale_factor = speed_scale_factor
        
        # State per track_id
        self._prev_centroids: Dict[int, Tuple[float, float]] = {}
        self._prev_frames: Dict[int, int] = {}
        self._speed_history: Dict[int, deque] = {}
        
        # State for flow rate
        self._zone_entry_times: Dict[str, deque] = {d: deque() for d in roi_manager.directions}
        self._zone_occupants: Dict[str, set] = {d: set() for d in roi_manager.directions}

    def reset(self) -> None:
        """Clear all internal state."""
        self._prev_centroids.clear()
        self._prev_frames.clear()
        self._speed_history.clear()
        self._zone_entry_times = {d: deque() for d in self.roi_manager.directions}
        self._zone_occupants = {d: set() for d in self.roi_manager.directions}
        self.homography_matrix = None
        
    def set_default_homography(self, frame_width: int = 1280, frame_height: int = 960) -> None:
        """Set a default perspective transform assuming a standard intersection CCTV."""
        import cv2
        import numpy as np
        
        # Assume a trapazoid in the image maps to a rectangle on the ground.
        # Image points (approximate view of a road segment)
        src = np.array([
            [frame_width * 0.3, frame_height * 0.4],  # top-left
            [frame_width * 0.7, frame_height * 0.4],  # top-right
            [frame_width * 0.9, frame_height * 0.9],  # bottom-right
            [frame_width * 0.1, frame_height * 0.9]   # bottom-left
        ], dtype=np.float32)
        
        # Ground points in meters (assuming 3 lanes of 3.5m = 10.5m width, and 30m length)
        dst = np.array([
            [0, 30],
            [10.5, 30],
            [10.5, 0],
            [0, 0]
        ], dtype=np.float32)
        
        self.homography_matrix = cv2.getPerspectiveTransform(src, dst)

    def estimate_speed(self, track_id: int, current_centroid: Tuple[float, float], frame_id: int) -> Optional[float]:
        if track_id not in self._prev_centroids or track_id not in self._prev_frames:
            return None
            
        prev_centroid = self._prev_centroids[track_id]
        prev_frame = self._prev_frames[track_id]
        frames_elapsed = frame_id - prev_frame
        
        if frames_elapsed <= 0:
            return None
            
        if self.homography_matrix is not None:
            import cv2
            import numpy as np
            
            # Project points to ground plane
            pts = np.array([[prev_centroid], [current_centroid]], dtype=np.float32)
            projected = cv2.perspectiveTransform(pts, self.homography_matrix)
            
            dx = projected[1][0][0] - projected[0][0][0]
            dy = projected[1][0][1] - projected[0][0][1]
            dist_meters = math.sqrt(dx**2 + dy**2)
            
            # Speed = dist / time * 3.6
            speed = (dist_meters / frames_elapsed) * self.fps * 3.6
        else:
            dx = current_centroid[0] - prev_centroid[0]
            dy = current_centroid[1] - prev_centroid[1]
            dist_pixels = math.sqrt(dx**2 + dy**2)
            
            # pixel_displacement * scale_factor * fps * 3.6 (to km/h)
            speed = (dist_pixels / frames_elapsed) * self.speed_scale_factor * self.fps * 3.6
        
        if track_id not in self._speed_history:
            self._speed_history[track_id] = deque(maxlen=10)
        self._speed_history[track_id].append(speed)
        
        return sum(self._speed_history[track_id]) / len(self._speed_history[track_id])

    def estimate_heading(self, track_id: int, current_centroid: Tuple[float, float]) -> Optional[float]:
        if track_id not in self._prev_centroids:
            return None
            
        prev_centroid = self._prev_centroids[track_id]
        dx = current_centroid[0] - prev_centroid[0]
        dy = current_centroid[1] - prev_centroid[1]
        
        # Angle in degrees (0=North, 90=East, 180=South, 270=West)
        angle = math.degrees(math.atan2(dy, dx))
        
        # Rotate 90 degrees and normalize
        heading = (angle + 90) % 360
        return heading

    def estimate_queue_length(self, detections_in_zone: List[TrackedDetection], zone: ROIZone) -> float:
        if not detections_in_zone:
            return 0.0
            
        # Find zone centroid
        M = cv2.moments(zone.polygon)
        if M["m00"] != 0:
            cx = M["m10"] / M["m00"]
            cy = M["m01"] / M["m00"]
        else:
            cx, cy = zone.polygon[0][0], zone.polygon[0][1]
            
        max_dist = 0.0
        for det in detections_in_zone:
            dx = det.centroid[0] - cx
            dy = det.centroid[1] - cy
            dist = math.sqrt(dx**2 + dy**2)
            if dist > max_dist:
                max_dist = dist
                
        return max_dist * self.speed_scale_factor

    def calculate_flow_rate(self, direction: str) -> float:
        current_time = time.time()
        window_size = 60.0
        
        times = self._zone_entry_times.get(direction, deque())
        # Remove entries older than 60s
        while times and (current_time - times[0] > window_size):
            times.popleft()
            
        return len(times)

    def calculate_congestion_score(self, density_ratio: float, avg_speed: float, queue_length: float) -> float:
        # density_score
        if density_ratio < 0.3:
            density_score = 1
        elif density_ratio <= 0.7:
            density_score = 2
        else:
            density_score = 3
            
        # speed_score
        if avg_speed <= 20:
            speed_score = 3
        elif avg_speed <= 35:
            speed_score = 2
        else:
            speed_score = 1
            
        # queue_score
        if queue_length >= 150:
            queue_score = 3
        elif queue_length >= 50:
            queue_score = 2
        else:
            queue_score = 1
            
        return 0.40 * density_score + 0.35 * speed_score + 0.25 * queue_score

    def classify_congestion(self, score: float) -> str:
        if score >= 2.6:
            return "CRITICAL"
        elif score >= 1.9:
            return "CONGESTED"
        return "WARNING"

    def update(self, frame_id: int, detections: List[TrackedDetection], roi_manager: ROIManager) -> Dict[str, Any]: # Dict[str, DirectionAnalytics]
        current_time = time.time()

        # Ensure tracking dicts have entries for all directions in the given roi_manager
        for d in roi_manager.directions:
            if d not in self._zone_entry_times:
                self._zone_entry_times[d] = deque()
            if d not in self._zone_occupants:
                self._zone_occupants[d] = set()

        direction_dets: Dict[str, List[TrackedDetection]] = {d: [] for d in roi_manager.directions}
        direction_speeds: Dict[str, List[float]] = {d: [] for d in roi_manager.directions}
        
        current_occupants = {d: set() for d in roi_manager.directions}

        for det in detections:
            zone = roi_manager.point_in_zone(det.centroid)
            if zone:
                direction_dets[zone].append(det)
                current_occupants[zone].add(det.track_id)
                
                # Flow rate tracking
                if zone in self._zone_occupants and det.track_id not in self._zone_occupants[zone]:
                    self._zone_entry_times[zone].append(current_time)
                
                speed = self.estimate_speed(det.track_id, det.centroid, frame_id)
                if speed is not None:
                    direction_speeds[zone].append(speed)
                    
            # Update state
            self._prev_centroids[det.track_id] = det.centroid
            self._prev_frames[det.track_id] = frame_id
            
        # Update occupants
        self._zone_occupants = current_occupants
            
        results = {}
        for direction in roi_manager.directions:
            dets = direction_dets[direction]
            zone = roi_manager.zones[direction]
            
            vehicle_count = len(dets)
            vehicle_breakdown = {}
            bboxes = []
            centroids = []
            for d in dets:
                vehicle_breakdown[d.class_name] = vehicle_breakdown.get(d.class_name, 0) + 1
                bboxes.append(d.bbox)
                centroids.append(d.centroid)
                
            density_ratio = roi_manager.density_ratio(bboxes, centroids, direction)
            density_level = DensityLevel.HIGH.value if density_ratio > 0.7 else (DensityLevel.LOW.value if density_ratio < 0.3 else DensityLevel.MEDIUM.value)
            
            speeds = direction_speeds[direction]
            average_speed_kmh = sum(speeds) / len(speeds) if speeds else 0.0
            
            queue_length_meters = self.estimate_queue_length(dets, zone)
            flow_rate_veh_per_min = float(self.calculate_flow_rate(direction))
            
            score = self.calculate_congestion_score(density_ratio, average_speed_kmh, queue_length_meters)
            congestion_level = self.classify_congestion(score)
            
            results[direction] = {
                "vehicle_count": vehicle_count,
                "vehicle_breakdown": vehicle_breakdown,
                "density_ratio": density_ratio,
                "density_level": density_level,
                "average_speed_kmh": average_speed_kmh,
                "queue_length_meters": queue_length_meters,
                "flow_rate_veh_per_min": flow_rate_veh_per_min,
                "occupancy_percent": density_ratio * 100,
                "congestion_level": congestion_level,
                "congestion_score": score
            }
            
        return results
