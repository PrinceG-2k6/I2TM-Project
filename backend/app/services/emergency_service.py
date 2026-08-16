from datetime import datetime, timezone
from typing import Any

from bson import ObjectId

from app.database.connection import get_emergency_triage_collection, get_junction_collection


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _to_object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise ValueError("Invalid junction ID")
    return ObjectId(value)


def _ensure_junction_exists(junction_object_id: ObjectId) -> None:
    junction = get_junction_collection().find_one({"_id": junction_object_id})
    if junction is None:
        raise LookupError("Junction not found")


def _priority_level(patient_severity: str, congestion_risk: str) -> str:
    weight = {
        "STABLE": 1,
        "SERIOUS": 2,
        "CRITICAL": 3,
    }.get(patient_severity, 1)
    risk = {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "CRITICAL": 3}.get(congestion_risk, 1)

    if weight >= 3 or risk >= 3:
        return "RED"
    if weight >= 2 or risk >= 2:
        return "YELLOW"
    return "GREEN"


def build_triage_response(payload: dict[str, Any]) -> dict[str, Any]:
    severity = str(payload.get("patient_severity", "STABLE")).upper()
    congestion_risk = str(payload.get("congestion_risk", "MEDIUM")).upper()
    priority = _priority_level(severity, congestion_risk)
    green_corridor_active = priority == "RED" or payload.get("traffic_density", "MEDIUM").upper() in {"HIGH", "CRITICAL"}

    if priority == "RED":
        signal_action = "Activate green corridor and clear conflicting approach"
    elif priority == "YELLOW":
        signal_action = "Prepare priority phase and warn approaching vehicles"
    else:
        signal_action = "Maintain normal flow and monitor ambulance ETA"

    return {
        "id": str(ObjectId()),
        "ambulance_id": payload.get("ambulance_id", "AMB-UNKNOWN"),
        "junction_id": payload.get("junction_id", ""),
        "patient_severity": severity,
        "priority_level": priority,
        "signal_action": signal_action,
        "green_corridor_active": green_corridor_active,
        "eta_seconds": int(payload.get("eta_seconds", 0)),
        "message": payload.get("message", "Emergency triage update"),
        "created_at": utc_now(),
    }


def create_triage(junction_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    resolved_junction_id = payload.get("junction_id") or junction_id
    if not resolved_junction_id:
        raise ValueError("junction_id is required")

    junction_object_id = _to_object_id(str(resolved_junction_id))
    _ensure_junction_exists(junction_object_id)

    final_payload = {
        **payload,
        "junction_id": str(resolved_junction_id),
        "patient_severity": str(payload.get("patient_severity", "STABLE")).upper(),
        "congestion_risk": str(payload.get("congestion_risk", "MEDIUM")).upper(),
        "traffic_density": str(payload.get("traffic_density", "MEDIUM")).upper(),
    }

    response = build_triage_response(final_payload)
    collection = get_emergency_triage_collection()
    collection.insert_one({
        "ambulance_id": response["ambulance_id"],
        "junction_id": junction_object_id,
        "patient_severity": response["patient_severity"],
        "priority_level": response["priority_level"],
        "signal_action": response["signal_action"],
        "green_corridor_active": response["green_corridor_active"],
        "eta_seconds": response["eta_seconds"],
        "message": response["message"],
        "created_at": response["created_at"],
    })

    return response

import math

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def process_telemetry(payload: dict[str, Any]) -> dict[str, Any]:
    active_routes = payload.get("active_route_junction_ids", [])
    if not active_routes:
        raise ValueError("active_route_junction_ids cannot be empty")
        
    closest_junction_id = None
    min_distance = float('inf')
    
    # In a real app, query all junctions in route. Here we just query the first/closest one.
    junction_col = get_junction_collection()
    
    for jid in active_routes:
        try:
            j_obj = _to_object_id(jid)
            junction = junction_col.find_one({"_id": j_obj})
            if junction and "latitude" in junction and "longitude" in junction:
                dist = haversine_distance(
                    payload["latitude"], payload["longitude"],
                    junction["latitude"], junction["longitude"]
                )
                if dist < min_distance:
                    min_distance = dist
                    closest_junction_id = jid
        except ValueError:
            pass

    if closest_junction_id is None:
        # Fallback to the first junction in the list if no valid coordinates found
        closest_junction_id = active_routes[0]
        min_distance = 1000.0  # mock 1km

    speed_mps = max(payload.get("speed_kmh", 0) / 3.6, 1.0)
    eta_seconds = int(min_distance / speed_mps)

    from app.schemas.green_corridor_schema import GreenCorridorActivateRequest, CorridorJunctionInput
    from app.services import green_corridor_service
    
    if min_distance < 200:
        priority_level = "RED"
        signal_action = "Activate green corridor and clear conflicting approach"
    elif min_distance < 500:
        priority_level = "YELLOW"
        signal_action = "Prepare priority phase and warn approaching vehicles"
    else:
        priority_level = "GREEN"
        signal_action = "Maintain normal flow and monitor ambulance ETA"
        
    # Trigger green corridor automatically if within 500m
    if min_distance < 500:
        try:
            gc_req = GreenCorridorActivateRequest(
                ambulance_id=payload.get("ambulance_id", "AMB"),
                route=active_routes,
                upcoming_junctions=[
                    CorridorJunctionInput(
                        junction_id=closest_junction_id,
                        priority_direction="UNKNOWN"
                    )
                ]
            )
            green_corridor_service.activate_green_corridor(gc_req)
        except Exception as e:
            print(f"Failed to activate green corridor: {e}")
        
    # Trigger triage automatically based on telemetry
    triage_payload = {
        "ambulance_id": payload.get("ambulance_id", "AMB"),
        "patient_severity": payload.get("patient_severity", "STABLE"),
        "congestion_risk": "MEDIUM",
        "traffic_density": "MEDIUM",
        "eta_seconds": eta_seconds,
        "message": f"Telemetry update: {min_distance:.0f}m away"
    }
    try:
        create_triage(closest_junction_id, triage_payload)
    except Exception as e:
        print(f"Warning: Failed to create automatic triage record: {e}")

    return {
        "id": str(ObjectId()),
        "ambulance_id": payload.get("ambulance_id", "AMB"),
        "closest_junction_id": closest_junction_id,
        "distance_to_closest_m": min_distance,
        "eta_seconds": eta_seconds,
        "priority_level_triggered": priority_level,
        "signal_action": signal_action,
        "timestamp": utc_now(),
    }
