"""
Traffic Density Calculation Module
Computes density percentage, vehicle count, and congestion status for junction approaches.
"""
from typing import Dict, List, Any
from core.config import MLConfig

class DensityDetector:
    @staticmethod
    def calculate_approach_density(vehicle_count: int, road_capacity: int = 50, avg_speed_kmh: float = 25.0) -> Dict[str, Any]:
        """
        Calculates density percentage and congestion categorization.
        """
        density_pct = min(100.0, round((vehicle_count / max(1, road_capacity)) * 100.0, 1))
        
        if density_pct >= MLConfig.CRITICAL_DENSITY_THRESHOLD or avg_speed_kmh < 8.0:
            status = "CRITICAL"
            severity = "critical"
            queue_status = "Severe Gridlock / Queue Spilling"
            suggested_green_delta = 35
        elif density_pct >= MLConfig.HIGH_DENSITY_THRESHOLD:
            status = "HIGH"
            severity = "warning"
            queue_status = "Heavy Congestion"
            suggested_green_delta = 20
        elif density_pct >= MLConfig.MEDIUM_DENSITY_THRESHOLD:
            status = "MEDIUM"
            severity = "moderate"
            queue_status = "Steady Movement"
            suggested_green_delta = 5
        else:
            status = "LOW"
            severity = "healthy"
            queue_status = "Free Flow"
            suggested_green_delta = -10

        return {
            "vehicle_count": vehicle_count,
            "density_percentage": density_pct,
            "status": status,
            "severity": severity,
            "queue_status": queue_status,
            "suggested_green_delta": suggested_green_delta
        }

    @classmethod
    def evaluate_junction_approaches(cls, approaches: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Evaluates 4 approaches (North, South, East, West) of a junction.
        """
        results = {}
        total_vehicles = 0
        total_density = 0.0

        for name, data in approaches.items():
            res = cls.calculate_approach_density(
                vehicle_count=data.get("vehicle_count", 0),
                road_capacity=data.get("capacity", 50),
                avg_speed_kmh=data.get("avg_speed_kmh", 30.0)
            )
            results[name] = res
            total_vehicles += res["vehicle_count"]
            total_density += res["density_percentage"]

        avg_density = round(total_density / max(1, len(approaches)), 1)
        
        # Sort approaches by highest density
        highest_load_approach = max(results.items(), key=lambda x: x[1]["density_percentage"])[0]

        return {
            "approaches": results,
            "total_vehicles": total_vehicles,
            "average_density_pct": avg_density,
            "highest_load_approach": highest_load_approach
        }
