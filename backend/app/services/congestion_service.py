from typing import Any

from bson import ObjectId
from pymongo import DESCENDING

from app.database.connection import (
    get_congestion_alert_collection,
    get_junction_collection,
    get_traffic_collection,
)
from app.models.congestion_model import build_congestion_alert_document
from app.schemas.congestion_schema import CongestionLevel
from app.services import density_service


def _to_object_id(junction_id: str) -> ObjectId:
    if not ObjectId.is_valid(junction_id):
        raise ValueError("Invalid junction ID")
    return ObjectId(junction_id)


def _ensure_junction_exists(junction_object_id: ObjectId) -> None:
    junction = get_junction_collection().find_one({"_id": junction_object_id})
    if junction is None:
        raise LookupError("Junction not found")


def _speed_score(average_speed: float) -> int:
    if average_speed < 0:
        raise ValueError("average_speed must be non-negative")
    if average_speed <= 20:
        return 3
    if average_speed <= 35:
        return 2
    return 1


def _queue_score(queue_length: float) -> int:
    if queue_length < 0:
        raise ValueError("queue_length must be non-negative")
    if queue_length >= 150:
        return 3
    if queue_length >= 50:
        return 2
    return 1


def calculate_congestion_score(
    density: float,
    average_speed: float,
    queue_length: float,
) -> float:
    density_level = density_service.classify_density(density)
    density_score = {
        "LOW": 1,
        "MEDIUM": 2,
        "HIGH": 3,
    }[density_level.value]
    score = (
        (0.40 * density_score)
        + (0.35 * _speed_score(average_speed))
        + (0.25 * _queue_score(queue_length))
    )
    return round(score, 2)


def classify_congestion(
    density: float,
    average_speed: float,
    queue_length: float,
) -> CongestionLevel:
    score = calculate_congestion_score(density, average_speed, queue_length)
    if score >= 2.6:
        return CongestionLevel.CRITICAL
    if score >= 1.9:
        return CongestionLevel.CONGESTED
    return CongestionLevel.WARNING


def _build_message(level: CongestionLevel, direction: str) -> str:
    if level == CongestionLevel.CRITICAL:
        return f"CRITICAL congestion detected on {direction} direction"
    if level == CongestionLevel.CONGESTED:
        return f"CONGESTED traffic detected on {direction} direction"
    return f"WARNING: rising congestion on {direction} direction"


def generate_congestion_alerts(junction_id: str) -> list[dict[str, Any]]:
    density_snapshot = density_service.get_latest_density_by_direction(junction_id)
    alerts: list[dict[str, Any]] = []
    collection = get_congestion_alert_collection()
    junction_object_id = _to_object_id(junction_id)
    _ensure_junction_exists(junction_object_id)

    for density_data in density_snapshot["densities"]:
        direction_observation = _get_latest_direction_observation(
            junction_object_id,
            density_data["direction"],
        )
        congestion_score = calculate_congestion_score(
            density_data["density"],
            direction_observation["average_speed"],
            direction_observation["queue_length"],
        )
        congestion_level = classify_congestion(
            density_data["density"],
            direction_observation["average_speed"],
            direction_observation["queue_length"],
        )
        alert_document = build_congestion_alert_document(
            {
                "junction_id": junction_object_id,
                "direction": density_data["direction"],
                "congestion_level": congestion_level.value,
                "density_level": density_data["density_level"].value,
                "density": density_data["density"],
                "average_speed": direction_observation["average_speed"],
                "queue_length": direction_observation["queue_length"],
                "congestion_score": congestion_score,
                "message": _build_message(congestion_level, density_data["direction"]),
            },
        )
        result = collection.insert_one(alert_document)
        alert_document["_id"] = result.inserted_id
        alerts.append(_serialize_alert(alert_document))

    return alerts


def get_congestion_alert_history(junction_id: str) -> list[dict[str, Any]]:
    junction_object_id = _to_object_id(junction_id)
    _ensure_junction_exists(junction_object_id)
    collection = get_congestion_alert_collection()
    documents = collection.find({"junction_id": junction_object_id}).sort(
        "created_at",
        DESCENDING,
    )
    return [_serialize_alert(document) for document in documents]


def _serialize_alert(document: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(document["_id"]),
        "junction_id": str(document["junction_id"]),
        "direction": document["direction"],
        "congestion_level": document["congestion_level"],
        "density_level": document["density_level"],
        "density": document["density"],
        "average_speed": document["average_speed"],
        "queue_length": document["queue_length"],
        "congestion_score": document["congestion_score"],
        "message": document["message"],
        "created_at": document["created_at"],
    }


def _get_latest_direction_observation(
    junction_object_id: ObjectId,
    direction: str,
) -> dict[str, Any]:
    documents = get_traffic_collection().find(
        {
            "junction_id": junction_object_id,
            "direction": direction,
        },
    ).sort(
        "timestamp",
        DESCENDING,
    )
    for document in documents:
        return document
    raise LookupError("Traffic observation not found")
