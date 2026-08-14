from typing import Any

from bson import ObjectId
from pymongo import DESCENDING

from app.config import settings
from app.database.connection import get_junction_collection, get_traffic_collection
from app.schemas.density_schema import DensityLevel


def _to_object_id(junction_id: str) -> ObjectId:
    if not ObjectId.is_valid(junction_id):
        raise ValueError("Invalid junction ID")
    return ObjectId(junction_id)


def _get_junction(junction_object_id: ObjectId) -> dict[str, Any]:
    junction = get_junction_collection().find_one({"_id": junction_object_id})
    if junction is None:
        raise LookupError("Junction not found")
    return junction


def calculate_density(vehicle_count: int, lane_count: int) -> float:
    if vehicle_count < 0:
        raise ValueError("vehicle_count must be non-negative")
    if lane_count <= 0:
        raise ValueError("lane_count must be greater than zero")
    return round(vehicle_count / lane_count, 2)


def classify_density(density: float) -> DensityLevel:
    if density < 0:
        raise ValueError("density must be non-negative")
    if density < settings.density_low_max:
        return DensityLevel.LOW
    if density < settings.density_medium_max:
        return DensityLevel.MEDIUM
    return DensityLevel.HIGH


def get_latest_density_by_direction(junction_id: str) -> dict[str, Any]:
    junction_object_id = _to_object_id(junction_id)
    junction = _get_junction(junction_object_id)
    lane_count = junction["lanes"]

    documents = get_traffic_collection().find({"junction_id": junction_object_id}).sort(
        "timestamp",
        DESCENDING,
    )

    latest_by_direction: dict[str, dict[str, Any]] = {}
    for document in documents:
        direction = document.get("direction", "UNKNOWN")
        if direction not in latest_by_direction:
            latest_by_direction[direction] = document

    if not latest_by_direction:
        raise LookupError("Traffic observation not found")

    densities = []
    for direction, document in latest_by_direction.items():
        density = calculate_density(document["vehicle_count"], lane_count)
        densities.append(
            {
                "direction": direction,
                "vehicle_count": document["vehicle_count"],
                "lane_count": lane_count,
                "density": density,
                "density_level": classify_density(density),
                "timestamp": document["timestamp"],
            },
        )

    densities.sort(key=lambda item: item["direction"])
    return {
        "junction_id": junction_id,
        "densities": densities,
    }
