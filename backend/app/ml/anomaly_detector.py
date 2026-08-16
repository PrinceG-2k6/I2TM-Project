"""Trajectory-based anomaly detection for the I²TMS ML pipeline.

Detects risky driving patterns ('cut maarna', zig-zag, wrong-side)
from ByteTrack vehicle trajectories WITHOUT needing any additional
ML model training.
"""

from __future__ import annotations

import logging
import math
from collections import deque

import numpy as np

from app.ml.schemas import AnomalyAlert, AnomalyType, BoundingBox, Centroid

logger = logging.getLogger(__name__)


class TrajectoryAnomalyDetector:
    """Detects anomalous driving patterns from vehicle trajectories.

    Checks for zig-zag, sudden lane changes, wrong-side driving,
    abrupt stops, and excessive speed.
    """

    def __init__(
        self,
        heading_variance_threshold: float = 45.0,
        lateral_deviation_threshold: float = 50.0,
        min_track_age: int = 15,
        trajectory_window: int = 15,
        speed_change_threshold: float = 15.0,
        tailgate_distance_threshold: float = 30.0,
    ) -> None:
        self.heading_variance_threshold = heading_variance_threshold
        self.lateral_deviation_threshold = lateral_deviation_threshold
        self.min_track_age = min_track_age
        self.trajectory_window = trajectory_window
        self.speed_change_threshold = speed_change_threshold
        self.tailgate_distance_threshold = tailgate_distance_threshold

        # track_id -> deque of (frame_id, x, y, speed_kmh, heading)
        self._buffers: dict[int, deque] = {}

        # Expected heading range for wrong side detection
        self.expected_heading_range: tuple[float, float] | None = None

        # Average speed of all tracked vehicles for excessive speed detection
        self.average_speed: float = 0.0

    @property
    def active_tracks(self) -> int:
        """Returns the number of tracks being monitored."""
        return len(self._buffers)

    @property
    def buffer_sizes(self) -> dict[int, int]:
        """Returns track_id -> buffer length mapping."""
        return {tid: len(buf) for tid, buf in self._buffers.items()}

    def update(
        self,
        track_id: int,
        frame_id: int,
        centroid: tuple[float, float],
        speed_kmh: float | None,
        heading: float | None,
    ) -> None:
        """Add new position to track's trajectory buffer."""
        if track_id not in self._buffers:
            self._buffers[track_id] = deque(maxlen=self.trajectory_window)
        x, y = centroid
        self._buffers[track_id].append((frame_id, x, y, speed_kmh, heading))

    def analyze(self, track_id: int) -> AnomalyAlert | None:
        """Run all anomaly checks on a single track.

        Returns the highest-confidence anomaly, or None.
        """
        if track_id not in self._buffers or len(self._buffers[track_id]) < self.min_track_age:
            return None

        trajectory = list(self._buffers[track_id])
        anomalies: list[tuple[AnomalyType, float, float, str]] = []

        # --- Check ZIGZAG ---
        is_zigzag, conf = self._detect_zigzag(trajectory)
        if is_zigzag:
            anomalies.append((
                AnomalyType.ZIGZAG_MOVEMENT,
                conf,
                max(0.0, min(10.0, 6.0 + (conf * 4.0))),
                "Zig-zag movement detected — possible impaired driving",
            ))

        # --- Check SUDDEN LANE CHANGE ---
        is_lane_change, conf = self._detect_sudden_lane_change(trajectory)
        if is_lane_change:
            anomalies.append((
                AnomalyType.SUDDEN_LANE_CHANGE,
                conf,
                max(0.0, min(10.0, 5.0 + (conf * 5.0))),
                "Sudden lane change (cut maarna) — unsafe maneuver",
            ))

        # --- Check WRONG SIDE ---
        is_wrong_side, conf = self._detect_wrong_side(trajectory, self.expected_heading_range)
        if is_wrong_side:
            anomalies.append((
                AnomalyType.WRONG_SIDE_DRIVING,
                conf,
                9.0,
                "Wrong-side driving detected — extreme risk",
            ))

        # --- Check ABRUPT STOP ---
        is_abrupt_stop, conf = self._detect_abrupt_stop(trajectory)
        if is_abrupt_stop:
            anomalies.append((
                AnomalyType.ABRUPT_STOP,
                conf,
                4.0,
                "Vehicle stopped abruptly — possible incident or breakdown",
            ))

        # --- Check EXCESSIVE SPEED ---
        is_excessive, conf = self._detect_excessive_speed(trajectory)
        if is_excessive:
            anomalies.append((
                AnomalyType.EXCESSIVE_SPEED,
                conf,
                min(10.0, 5.0 + (conf * 2.0)),
                "Excessive speed relative to traffic flow",
            ))

        if not anomalies:
            return None

        # Return the highest confidence anomaly
        best = max(anomalies, key=lambda a: a[1])
        anomaly_type, confidence, risk_score, description = best

        last_entry = trajectory[-1]
        _, x, y, _, _ = last_entry

        # Build trajectory as list of Centroid for the schema
        traj_centroids = [Centroid(x=t[1], y=t[2]) for t in trajectory[-5:]]

        # Compute heading variance for this trajectory
        headings = [t[4] for t in trajectory if t[4] is not None]
        heading_var = self._calculate_heading_variance(headings) if headings else 0.0

        # Compute lateral deviation
        lat_dev = self._calculate_lateral_deviation(trajectory) if len(trajectory) >= 3 else 0.0

        return AnomalyAlert(
            vehicle_id=f"VEH-{track_id:04d}",
            anomaly_type=anomaly_type,
            confidence=round(min(1.0, max(0.0, confidence)), 3),
            risk_score=round(min(10.0, max(0.0, risk_score)), 1),
            bbox=BoundingBox(x1=int(x) - 20, y1=int(y) - 20, x2=int(x) + 20, y2=int(y) + 20),
            centroid=Centroid(x=x, y=y),
            trajectory_last_n=traj_centroids,
            heading_variance_deg=round(heading_var * 180.0, 1),  # Convert from [0,1] to degrees
            lateral_deviation_px=round(lat_dev, 1),
            description=description,
        )

    def analyze_all(self, active_track_ids: list[int]) -> list[AnomalyAlert]:
        """Run analysis on all active tracks."""
        # Pre-calculate average speed for EXCESSIVE_SPEED check
        speeds: list[float] = []
        for tid in active_track_ids:
            if tid in self._buffers and len(self._buffers[tid]) > 0:
                speed = self._buffers[tid][-1][3]
                if speed is not None:
                    speeds.append(speed)

        self.average_speed = sum(speeds) / len(speeds) if speeds else 0.0

        alerts: list[AnomalyAlert] = []
        for tid in active_track_ids:
            alert = self.analyze(tid)
            if alert:
                alerts.append(alert)

        return alerts

    def cleanup(self, active_track_ids: set[int]) -> None:
        """Remove trajectory buffers for tracks no longer active."""
        stale = set(self._buffers.keys()) - active_track_ids
        for tid in stale:
            del self._buffers[tid]

    # ─── Detection algorithms ───────────────────────────────────

    def _detect_zigzag(self, trajectory: list) -> tuple[bool, float]:
        """Zig-zag / potential drunk driving detection."""
        if len(trajectory) < 3:
            return False, 0.0

        reversals = 0
        prev_heading_change = None

        for i in range(1, len(trajectory)):
            _, x1, y1, _, h1 = trajectory[i - 1]
            _, x2, y2, _, h2 = trajectory[i]

            h1 = h1 if h1 is not None else self._calculate_heading_between((x1, y1), (x2, y2))
            h2 = h2 if h2 is not None else self._calculate_heading_between((x1, y1), (x2, y2))

            diff = self._angular_difference(h1, h2)

            if abs(diff) > 20.0:
                if prev_heading_change is not None:
                    if (diff > 0 and prev_heading_change < 0) or (diff < 0 and prev_heading_change > 0):
                        reversals += 1
                prev_heading_change = diff

        reversal_ratio = reversals / len(trajectory)
        threshold = 0.2
        if reversal_ratio > threshold:
            return True, min(reversal_ratio / threshold, 1.0)

        return False, 0.0

    def _detect_sudden_lane_change(self, trajectory: list) -> tuple[bool, float]:
        """'Cut maarna' / sudden lane change detection."""
        if len(trajectory) < 5:
            return False, 0.0

        window_size = 5
        max_lat_dev_ratio = 0.0

        for i in range(len(trajectory) - window_size + 1):
            window = trajectory[i : i + window_size]
            lat_dev = self._calculate_lateral_deviation(window)
            if lat_dev > self.lateral_deviation_threshold:
                ratio = (lat_dev - self.lateral_deviation_threshold) / self.lateral_deviation_threshold
                max_lat_dev_ratio = max(max_lat_dev_ratio, ratio)

        # Check rapid heading change (> 40 degrees in 3 frames)
        rapid_heading = False
        for i in range(len(trajectory) - 2):
            _, x1, y1, _, h1 = trajectory[i]
            _, x2, y2, _, h3 = trajectory[i + 2]
            h1_c = h1 if h1 is not None else self._calculate_heading_between((x1, y1), (x2, y2))
            h3_c = h3 if h3 is not None else self._calculate_heading_between((x1, y1), (x2, y2))
            if abs(self._angular_difference(h1_c, h3_c)) > 40.0:
                rapid_heading = True
                break

        if max_lat_dev_ratio > 0 or rapid_heading:
            conf = min(1.0, max_lat_dev_ratio) if max_lat_dev_ratio > 0 else 0.5
            return True, conf

        return False, 0.0

    def _detect_wrong_side(
        self,
        trajectory: list,
        expected_heading_range: tuple[float, float] | None = None,
    ) -> tuple[bool, float]:
        """Wrong-side driving detection."""
        if not expected_heading_range or len(trajectory) < 5:
            return False, 0.0

        headings: list[float] = []
        for i in range(1, len(trajectory)):
            _, x1, y1, _, _ = trajectory[i - 1]
            _, x2, y2, _, h2 = trajectory[i]
            heading = h2 if h2 is not None else self._calculate_heading_between((x1, y1), (x2, y2))
            headings.append(heading)

        if not headings:
            return False, 0.0

        # Mean heading via circular mean
        x = sum(math.cos(math.radians(h)) for h in headings)
        y = sum(math.sin(math.radians(h)) for h in headings)
        avg_heading = (math.degrees(math.atan2(y, x)) + 360) % 360

        min_h, max_h = expected_heading_range
        if max_h < min_h:
            max_h += 360
        expected_center = (min_h + max_h) / 2.0
        opposite = (expected_center + 180.0) % 360.0

        diff = abs(self._angular_difference(avg_heading, opposite))

        if diff <= 30.0:
            return True, 1.0 - (diff / 30.0)

        return False, 0.0

    def _detect_abrupt_stop(self, trajectory: list) -> tuple[bool, float]:
        """Sudden stop (potential breakdown or incident)."""
        if len(trajectory) < 10:
            return False, 0.0

        speeds = [p[3] for p in trajectory if p[3] is not None]
        if len(speeds) < 5:
            return False, 0.0

        for i in range(len(speeds) - 4):
            if speeds[i] > 15.0 and any(s < 2.0 for s in speeds[i : i + 5]):
                stationary_frames = sum(1 for s in speeds[i:] if s < 2.0)
                if stationary_frames >= min(10, len(speeds) - i):
                    conf = min(1.0, (speeds[i] - 15.0) / 30.0 + 0.5)
                    return True, conf

        return False, 0.0

    def _detect_excessive_speed(self, trajectory: list) -> tuple[bool, float]:
        """Excessive speed relative to surrounding traffic."""
        if self.average_speed <= 0 or not trajectory:
            return False, 0.0

        speed = trajectory[-1][3]
        if speed is None:
            return False, 0.0

        if speed > 2 * self.average_speed:
            conf = min(1.0, (speed - self.average_speed) / self.average_speed)
            return True, conf

        return False, 0.0

    # ─── Helper methods ─────────────────────────────────────────

    def _calculate_heading_between(self, p1: tuple[float, float], p2: tuple[float, float]) -> float:
        """Returns heading in degrees (0=North, 90=East, 180=South, 270=West)."""
        x1, y1 = p1
        x2, y2 = p2
        heading = (math.degrees(math.atan2(x2 - x1, y1 - y2)) + 360) % 360
        return heading

    def _calculate_heading_variance(self, headings: list[float]) -> float:
        """Calculate circular variance of heading angles (0 = no variance, 1 = max)."""
        if not headings:
            return 0.0
        x = sum(math.cos(math.radians(h)) for h in headings) / len(headings)
        y = sum(math.sin(math.radians(h)) for h in headings) / len(headings)
        R = math.sqrt(x * x + y * y)
        return 1.0 - R

    def _calculate_lateral_deviation(self, trajectory: list) -> float:
        """Max perpendicular distance from trajectory points to the primary travel line."""
        if len(trajectory) < 3:
            return 0.0

        points = np.array([[p[1], p[2]] for p in trajectory])
        p1 = points[0]
        p2 = points[-1]

        if np.allclose(p1, p2):
            return 0.0

        d = p2 - p1
        d_norm = np.linalg.norm(d)
        if d_norm == 0:
            return 0.0

        d = d / d_norm
        n = np.array([-d[1], d[0]])
        distances = np.abs(np.dot(points - p1, n))
        return float(np.max(distances))

    def _angular_difference(self, angle1: float, angle2: float) -> float:
        """Shortest angular difference handling wraparound."""
        return (angle1 - angle2 + 180.0) % 360.0 - 180.0
