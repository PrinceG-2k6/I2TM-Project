from datetime import datetime, timezone
from typing import Any

from bson import ObjectId

from app.database.connection import get_congestion_alert_collection, get_junction_collection


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


def generate_signal_suggestion(payload: dict[str, Any]) -> dict[str, Any]:
    junction_id = str(payload.get("junction_id", ""))
    junction_object_id = _to_object_id(junction_id)
    _ensure_junction_exists(junction_object_id)

    current_density = str(payload.get("current_density", "MEDIUM")).upper()
    ambulance_approaching = bool(payload.get("ambulance_approaching", False))
    patient_severity = str(payload.get("patient_severity", "STABLE")).upper()
    road_priority = str(payload.get("road_priority", "NORMAL")).upper()
    display_message = str(payload.get("display_message") or "Traffic flow is stable.")

    if ambulance_approaching and patient_severity in {"SERIOUS", "CRITICAL"}:
        action = "Activate green corridor for ambulance route"
        priority = "CRITICAL"
        display_message = display_message or "Ambulance approaching. Keep the emergency corridor clear."
    elif current_density in {"HIGH", "CRITICAL"}:
        action = "Extend green time for high-density approach"
        priority = "HIGH"
    elif road_priority == "HOSPITAL":
        action = "Prioritize hospital corridor and reduce conflicting movement"
        priority = "MEDIUM"
    else:
        action = "Maintain adaptive signal cycle with monitored flow"
        priority = "LOW"

    return {
        "id": str(ObjectId()),
        "junction_id": junction_id,
        "action": action,
        "priority": priority,
        "display_message": display_message,
        "created_at": utc_now(),
    }
