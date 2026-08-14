"""
Dynamic Traffic Signal Timing Optimizer
Computes optimal green time per approach using real-time density and queue parameters.
"""
from typing import Dict, Any, List
from core.config import MLConfig

class SignalOptimizer:
    @staticmethod
    def calculate_phase_allocation(
        approaches: Dict[str, Dict[str, Any]],
        cycle_time_sec: int = 120,
        emergency_override: bool = False,
        emergency_approach: str = "EAST"
    ) -> Dict[str, Any]:
        """
        Calculates green phase durations for North, South, East, West.
        """
        if emergency_override:
            # Emergency priority allocation
            allocations = {}
            for app_name in approaches.keys():
                if app_name.upper() == emergency_approach.upper():
                    allocations[app_name] = {
                        "green_sec": 75,
                        "yellow_sec": 5,
                        "red_sec": 40,
                        "state": "PRIORITY_GREEN",
                        "reason": "Emergency Green Corridor active"
                    }
                else:
                    allocations[app_name] = {
                        "green_sec": 15,
                        "yellow_sec": 5,
                        "red_sec": 100,
                        "state": "HELD_RED",
                        "reason": "Conflicting lane held for emergency corridor"
                    }
            return {
                "mode": "EMERGENCY_OVERRIDE",
                "total_cycle_sec": cycle_time_sec,
                "phases": allocations,
                "suggestion": f"Hold conflicting lanes, grant 75s continuous priority to {emergency_approach}."
            }

        # Adaptive density-based weighting
        total_density = sum(app.get("density_percentage", 25.0) for app in approaches.values())
        total_density = max(1.0, total_density)

        usable_green_budget = cycle_time_sec - (len(approaches) * 4) # Reserve 4s yellow per phase
        allocations = {}
        suggestions = []

        for app_name, app_data in approaches.items():
            density = app_data.get("density_percentage", 25.0)
            weight = density / total_density
            raw_green = int(round(usable_green_budget * weight))
            # Clamp between MIN and MAX green
            green_sec = max(MLConfig.MIN_GREEN_TIME, min(MLConfig.MAX_GREEN_TIME, raw_green))

            if density >= MLConfig.CRITICAL_DENSITY_THRESHOLD:
                state = "EXTENDED_GREEN"
                suggestions.append(f"Extend green phase on {app_name} (+{green_sec - 30}s) due to severe queue.")
            elif density <= MLConfig.LOW_DENSITY_THRESHOLD:
                state = "MINIMAL_GREEN"
            else:
                state = "BALANCED_GREEN"

            allocations[app_name] = {
                "green_sec": green_sec,
                "yellow_sec": 4,
                "red_sec": cycle_time_sec - green_sec - 4,
                "state": state,
                "density_pct": density
            }

        return {
            "mode": "ADAPTIVE_DENSITY_CONTROL",
            "total_cycle_sec": cycle_time_sec,
            "phases": allocations,
            "suggestions": suggestions if suggestions else ["Maintain balanced adaptive signal cycle."]
        }
