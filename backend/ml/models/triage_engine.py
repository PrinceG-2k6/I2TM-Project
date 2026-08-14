"""
Emergency Triage & Green Corridor Engine
Combines patient medical severity, ambulance ETA, and route density to assign triage and roadside warnings.
"""
from typing import Dict, Any
from core.config import MLConfig

class EmergencyTriageEngine:
    @staticmethod
    def evaluate_triage(
        ambulance_id: str,
        patient_severity: str,
        distance_to_junction_m: float,
        current_speed_kmh: float,
        route_congestion_pct: float
    ) -> Dict[str, Any]:
        """
        Evaluates triage level, countdown timer, roadside display message, and signal priority override.
        """
        severity_norm = patient_severity.upper()
        if severity_norm not in MLConfig.TRIAGE_LEVELS:
            severity_norm = "SERIOUS"

        config = MLConfig.TRIAGE_LEVELS[severity_norm]
        
        # Calculate ETA in seconds
        speed_mps = max(5.0, (current_speed_kmh * 1000.0) / 3600.0)
        calculated_eta_sec = int(round(distance_to_junction_m / speed_mps))

        # Adjust for route congestion
        if route_congestion_pct > 75.0:
            congestion_factor = 1.4
            calculated_eta_sec = int(round(calculated_eta_sec * congestion_factor))

        # Triage determination
        if severity_norm == "CRITICAL" or (severity_norm == "SERIOUS" and distance_to_junction_m < 700):
            triage_state = "RED"
            corridor_active = True
            display_wait_time = 90 if calculated_eta_sec > 60 else 60
            roadside_msg = f"EMERGENCY CORRIDOR: Ambulance approaching ({calculated_eta_sec}s ETA). Keep LEFT lane clear. Wait time: {display_wait_time}s."
            signal_command = "PRE_CLEAR_AND_HOLD_CONFLICTING"
        elif severity_norm == "SERIOUS" or distance_to_junction_m < 1200:
            triage_state = "YELLOW"
            corridor_active = True
            display_wait_time = 60
            roadside_msg = f"Ambulance approaching in {calculated_eta_sec} seconds. Prepare to yield left."
            signal_command = "EXTEND_APPROACH_GREEN"
        else:
            triage_state = "GREEN"
            corridor_active = False
            display_wait_time = 0
            roadside_msg = "Adaptive Signal Active. Maintain normal speed and lane discipline."
            signal_command = "NORMAL_ADAPTIVE"

        return {
            "ambulance_id": ambulance_id,
            "patient_severity": severity_norm,
            "triage_state": triage_state,
            "corridor_active": corridor_active,
            "eta_seconds": calculated_eta_sec,
            "distance_meters": distance_to_junction_m,
            "route_congestion_pct": route_congestion_pct,
            "roadside_display": {
                "headline": "AMBULANCE GREEN CORRIDOR ACTIVE" if corridor_active else "NORMAL TRAFFIC",
                "message": roadside_msg,
                "suggested_wait_seconds": display_wait_time,
                "target_lane": "LEFT_LANE_CLEAR"
            },
            "signal_override": {
                "action": signal_command,
                "hold_conflicting_sec": config["default_hold_sec"],
                "target_approach": "EAST_TO_WEST_CORRIDOR"
            }
        }
