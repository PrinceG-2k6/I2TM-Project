"""
Adaptive Signal Intelligence - ML Configuration
"""
from pydantic import BaseModel
from typing import Dict, List

class MLConfig:
    # Density Thresholds (%)
    LOW_DENSITY_THRESHOLD = 30.0
    MEDIUM_DENSITY_THRESHOLD = 65.0
    HIGH_DENSITY_THRESHOLD = 80.0
    CRITICAL_DENSITY_THRESHOLD = 90.0

    # Risky Driving / Aggressive Lane Cut Parameters
    LATERAL_ACCELERATION_THRESHOLD = 2.8 # m/s^2 lateral variance
    LANE_CUT_ANGLE_DEGREES = 32.0 # Sudden swerve angle
    RISK_SCORE_WARNING = 60.0
    RISK_SCORE_CRITICAL = 80.0

    # Green Corridor Triage
    TRIAGE_LEVELS = {
        "CRITICAL": {"triage": "RED", "priority": 1, "clear_distance_meters": 1200, "default_hold_sec": 90},
        "SERIOUS": {"triage": "YELLOW", "priority": 2, "clear_distance_meters": 800, "default_hold_sec": 60},
        "STABLE": {"triage": "GREEN", "priority": 3, "clear_distance_meters": 400, "default_hold_sec": 30}
    }

    # Signal Timing Bounds (seconds)
    MIN_GREEN_TIME = 15
    MAX_GREEN_TIME = 90
    DEFAULT_CYCLE_TIME = 120
