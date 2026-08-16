from __future__ import annotations
import logging
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
import numpy as np
import cv2

logger = logging.getLogger(__name__)

DIRECTION_COLORS = {
    'NORTH': (255, 100, 100),   # Blue-ish
    'SOUTH': (100, 100, 255),   # Red-ish
    'EAST':  (100, 255, 100),   # Green-ish  
    'WEST':  (100, 255, 255),   # Yellow-ish
}

@dataclass
class ROIZone:
    direction: str
    polygon: np.ndarray
    area_pixels: float
    color: tuple[int, int, int]


class ROIManager:
    def __init__(self, roi_config: Optional[dict] = None) -> None:
        self._zones: Dict[str, ROIZone] = {}
        if roi_config:
            for direction, points in roi_config.items():
                self.add_zone(direction, points)

    def add_zone(self, direction: str, polygon_points: List[Tuple[int, int]]) -> None:
        """Create ROIZone from list of (x, y) vertex coordinates."""
        polygon = np.array(polygon_points, dtype=np.int32)
        area = cv2.contourArea(polygon)
        color = DIRECTION_COLORS.get(direction.upper(), (255, 255, 255))
        self._zones[direction.upper()] = ROIZone(
            direction=direction.upper(),
            polygon=polygon,
            area_pixels=float(area),
            color=color
        )
        logger.info(f"Added ROI zone for {direction} with area {area:.2f}")

    def point_in_zone(self, point: Tuple[float, float]) -> Optional[str]:
        """Given a centroid (x, y), return which direction zone it falls in."""
        for direction, zone in self._zones.items():
            # cv2.pointPolygonTest returns >0 if inside, 0 if on contour, <0 if outside
            result = cv2.pointPolygonTest(zone.polygon, (float(point[0]), float(point[1])), False)
            if result >= 0:
                return direction
        return None

    def detections_per_zone(self, centroids: List[Tuple[float, float]]) -> Dict[str, int]:
        """Count how many centroids fall in each zone."""
        counts = {direction: 0 for direction in self._zones}
        for centroid in centroids:
            zone = self.point_in_zone(centroid)
            if zone:
                counts[zone] += 1
        return counts

    def vehicle_area_in_zone(self, bboxes: List[Tuple[int, int, int, int]], direction: str) -> float:
        """Sum bbox areas for all vehicles in a given zone. Bboxes are (x1,y1,x2,y2)."""
        zone = self._zones.get(direction.upper())
        if not zone:
            return 0.0

        total_area = 0.0
        for bbox in bboxes:
            x1, y1, x2, y2 = bbox
            centroid = ((x1 + x2) / 2, (y1 + y2) / 2)
            if self.point_in_zone(centroid) == direction.upper():
                total_area += abs((x2 - x1) * (y2 - y1))
        return total_area

    def density_ratio(self, bboxes: List[Tuple[int, int, int, int]], centroids: List[Tuple[float, float]], direction: str) -> float:
        """Calculate total vehicle bbox area in zone / zone polygon area."""
        zone = self._zones.get(direction.upper())
        if not zone or zone.area_pixels == 0:
            return 0.0

        total_vehicle_area = 0.0
        for bbox, centroid in zip(bboxes, centroids):
            if self.point_in_zone(centroid) == direction.upper():
                x1, y1, x2, y2 = bbox
                total_vehicle_area += abs((x2 - x1) * (y2 - y1))

        ratio = total_vehicle_area / zone.area_pixels
        return max(0.0, min(1.0, ratio))

    def draw_zones(self, frame: np.ndarray, alpha: float = 0.3) -> np.ndarray:
        """Draw semi-transparent colored polygons on frame for visualization."""
        overlay = frame.copy()
        
        for direction, zone in self._zones.items():
            cv2.fillPoly(overlay, [zone.polygon], zone.color)
            
            # Add text
            M = cv2.moments(zone.polygon)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
            else:
                cx, cy = zone.polygon[0][0], zone.polygon[0][1]
                
            cv2.putText(overlay, direction, (cx, cy), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
        cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)
        return frame

    @classmethod
    def from_aic21_roi_file(cls, roi_path: str, frame_shape: Tuple[int, int]) -> ROIManager:
        """Parse AIC21 ROI file format (one 'x,y' per line)."""
        manager = cls()
        points = []
        try:
            with open(roi_path, 'r') as f:
                for line in f:
                    parts = line.strip().split(',')
                    if len(parts) == 2:
                        points.append((int(parts[0]), int(parts[1])))
        except Exception as e:
            logger.error(f"Failed to read ROI file {roi_path}: {e}")
            return cls.from_quadrant_split(frame_shape[1], frame_shape[0])

        if not points:
            return cls.from_quadrant_split(frame_shape[1], frame_shape[0])

        # For single-polygon ROIs, create a single zone called 'CENTER' or split it.
        # Since requirements mention creating a single zone for cam_1 or attempting quadrant split:
        # We will do a simple implementation for now.
        manager.add_zone('CENTER', points)
        return manager

    @classmethod
    def from_quadrant_split(cls, frame_width: int, frame_height: int) -> ROIManager:
        """Create default 4-quadrant ROI zones."""
        manager = cls()
        cx, cy = frame_width // 2, frame_height // 2
        
        # Top-left = NORTH
        manager.add_zone('NORTH', [(0, 0), (cx, 0), (cx, cy), (0, cy)])
        # Top-right = EAST
        manager.add_zone('EAST', [(cx, 0), (frame_width, 0), (frame_width, cy), (cx, cy)])
        # Bottom-right = SOUTH
        manager.add_zone('SOUTH', [(cx, cy), (frame_width, cy), (frame_width, frame_height), (cx, frame_height)])
        # Bottom-left = WEST
        manager.add_zone('WEST', [(0, cy), (cx, cy), (cx, frame_height), (0, frame_height)])
        
        return manager

    @property
    def zones(self) -> Dict[str, ROIZone]:
        return self._zones

    @property
    def directions(self) -> List[str]:
        return list(self._zones.keys())
