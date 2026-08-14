"""
Risky Driving Pattern & Cut-Maarna Recognition Module
Analyzes trajectory coordinates, swerving behavior, and lane violations.
"""
from typing import List, Dict, Any
import math
from core.config import MLConfig

class RiskPatternAnalyzer:
    @staticmethod
    def analyze_trajectory(vehicle_id: str, trajectory_points: List[Dict[str, float]], speed_kmh: float = 45.0) -> Dict[str, Any]:
        """
        Analyzes trajectory points [{x, y, timestamp}] for sudden swerving, zig-zag, or cut-maarna patterns.
        """
        if len(trajectory_points) < 3:
            return {
                "vehicle_id": vehicle_id,
                "risk_detected": False,
                "risk_score": 12.0,
                "pattern_type": "NORMAL_MOVEMENT",
                "alert_level": "NORMAL",
                "reason": "Insufficient trajectory history"
            }

        # Calculate lateral deviations and angular changes
        angular_changes = []
        for i in range(1, len(trajectory_points) - 1):
            p0 = trajectory_points[i-1]
            p1 = trajectory_points[i]
            p2 = trajectory_points[i+1]

            angle1 = math.atan2(p1.get("y", 0) - p0.get("y", 0), p1.get("x", 0) - p0.get("x", 0))
            angle2 = math.atan2(p2.get("y", 0) - p1.get("y", 0), p2.get("x", 0) - p1.get("x", 0))
            diff_deg = abs(math.degrees(angle2 - angle1))
            angular_changes.append(diff_deg)

        max_swerve = max(angular_changes) if angular_changes else 0.0
        avg_swerve = sum(angular_changes) / max(1, len(angular_changes))

        # Compute risk score (0 - 100)
        risk_score = min(100.0, round((avg_swerve * 1.8) + (max_swerve * 0.9) + (speed_kmh * 0.3), 1))

        if risk_score >= MLConfig.RISK_SCORE_CRITICAL:
            risk_detected = True
            pattern_type = "AGGRESSIVE_LANE_CUTTING"
            alert_level = "CRITICAL"
            reason = f"Erratic trajectory ({max_swerve:.1f}° swerve at {speed_kmh} km/h). Suspected aggressive lane cut near junction."
            action = "Mark vehicle trajectory in operator view and alert intersection marshal."
        elif risk_score >= MLConfig.RISK_SCORE_WARNING:
            risk_detected = True
            pattern_type = "SUSPICIOUS_ZIG_ZAG"
            alert_level = "WARNING"
            reason = f"Unstable lateral deviation ({avg_swerve:.1f}° average drift). Unsafe overtaking pattern."
            action = "Monitor upcoming lane merge."
        else:
            risk_detected = False
            pattern_type = "STABLE_FLOW"
            alert_level = "NORMAL"
            reason = "Vehicle moving along standard lane path."
            action = "None"

        return {
            "vehicle_id": vehicle_id,
            "risk_detected": risk_detected,
            "risk_score": risk_score,
            "pattern_type": pattern_type,
            "alert_level": alert_level,
            "reason": reason,
            "suggested_action": action,
            "metrics": {
                "max_swerve_deg": round(max_swerve, 1),
                "avg_swerve_deg": round(avg_swerve, 1),
                "speed_kmh": speed_kmh
            }
        }
