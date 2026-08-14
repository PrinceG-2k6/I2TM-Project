from typing import Any

from bson import ObjectId
from pymongo import DESCENDING

from app.database.connection import get_junction_collection, get_traffic_collection
from app.models.traffic_model import build_traffic_observation_document
from app.schemas.traffic_schema import TrafficObservationCreate


def _to_object_id(junction_id: str) -> ObjectId:
    if not ObjectId.is_valid(junction_id):
        raise ValueError("Invalid junction ID")
    return ObjectId(junction_id)


def _ensure_junction_exists(junction_object_id: ObjectId) -> None:
    junction = get_junction_collection().find_one({"_id": junction_object_id})
    if junction is None:
        raise LookupError("Junction not found")


def _serialize_traffic_observation(document: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(document["_id"]),
        "junction_id": str(document["junction_id"]),
        "vehicle_count": document["vehicle_count"],
        "cars": document["cars"],
        "motorcycles": document["motorcycles"],
        "buses": document["buses"],
        "trucks": document["trucks"],
        "average_speed": document["average_speed"],
        "queue_length": document["queue_length"],
        "timestamp": document["timestamp"],
    }


def create_traffic_observation(
    traffic: TrafficObservationCreate,
) -> dict[str, Any]:
    junction_object_id = _to_object_id(traffic.junction_id)
    _ensure_junction_exists(junction_object_id)

    traffic_data = traffic.model_dump()
    traffic_data.pop("junction_id")
    document = build_traffic_observation_document(traffic_data, junction_object_id)

    collection = get_traffic_collection()
    result = collection.insert_one(document)
    document["_id"] = result.inserted_id
    return _serialize_traffic_observation(document)


def get_current_traffic(junction_id: str) -> dict[str, Any]:
    junction_object_id = _to_object_id(junction_id)
    _ensure_junction_exists(junction_object_id)

    collection = get_traffic_collection()
    document = collection.find_one(
        {"junction_id": junction_object_id},
        sort=[("timestamp", DESCENDING)],
    )

    if document is None:
        raise LookupError("Traffic observation not found")

    return _serialize_traffic_observation(document)


def get_traffic_history(junction_id: str) -> list[dict[str, Any]]:
    junction_object_id = _to_object_id(junction_id)
    _ensure_junction_exists(junction_object_id)

    collection = get_traffic_collection()
    observations = collection.find({"junction_id": junction_object_id}).sort(
        "timestamp",
        DESCENDING,
    )
    return [_serialize_traffic_observation(document) for document in observations]
