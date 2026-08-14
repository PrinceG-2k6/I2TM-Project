"""
Route Congestion Predictor Module
Estimates congestion probability and clearance time across multiple connected junctions.
"""
from typing import List, Dict, Any

class RoutePredictor:
    @staticmethod
    def predict_multi_junction_corridor(junction_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates end-to-end ambulance transit time and pre-clearing schedule across junctions.
        """
        schedule = []
        cumulative_time = 0
        total_bottlenecks = 0

        for j in junction_list:
            j_id = j.get("id", "J-01")
            j_name = j.get("name", "Main Junction")
            density = j.get("density_pct", 50.0)
            distance_m = j.get("distance_from_prev_m", 500)
            
            # Baseline transit speed 40 km/h = ~11 m/s
            transit_time = int(distance_m / 11.0)
            
            # Pre-clear delay depending on density
            if density > 80.0:
                pre_clear_lead_sec = 45
                total_bottlenecks += 1
                clearance_status = "URGENT_PRE_CLEAR"
            elif density > 50.0:
                pre_clear_lead_sec = 25
                clearance_status = "STAGED_CLEAR"
            else:
                pre_clear_lead_sec = 10
                clearance_status = "READY"

            arrival_eta_sec = cumulative_time + transit_time
            cumulative_time = arrival_eta_sec

            schedule.append({
                "junction_id": j_id,
                "junction_name": j_name,
                "density_pct": density,
                "distance_m": distance_m,
                "expected_arrival_sec": arrival_eta_sec,
                "pre_clear_lead_sec": pre_clear_lead_sec,
                "clearance_status": clearance_status
            })

        return {
            "total_route_distance_m": sum(j.get("distance_from_prev_m", 500) for j in junction_list),
            "estimated_total_seconds": cumulative_time,
            "bottlenecks_detected": total_bottlenecks,
            "corridor_schedule": schedule
        }
