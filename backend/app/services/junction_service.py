from typing import Any

from bson import ObjectId

from app.database.connection import get_junction_collection
from app.models.junction_model import (
    build_junction_document,
    build_junction_update_document,
)
from app.schemas.junction_schema import JunctionCreate, JunctionUpdate


def _to_object_id(junction_id: str) -> ObjectId:
    if not ObjectId.is_valid(junction_id):
        raise ValueError("Invalid junction ID")
    return ObjectId(junction_id)


def _serialize_junction(document: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(document["_id"]),
        "name": document["name"],
        "latitude": document["latitude"],
        "longitude": document["longitude"],
        "roads": document["roads"],
        "lanes": document["lanes"],
        "status": document["status"],
        "created_at": document["created_at"],
        "updated_at": document["updated_at"],
    }


def create_junction(junction: JunctionCreate) -> dict[str, Any]:
    collection = get_junction_collection()
    document = build_junction_document(junction.model_dump())
    result = collection.insert_one(document)
    document["_id"] = result.inserted_id
    return _serialize_junction(document)


def get_all_junctions() -> list[dict[str, Any]]:
    collection = get_junction_collection()
    return [_serialize_junction(document) for document in collection.find()]


def get_junction(junction_id: str) -> dict[str, Any]:
    collection = get_junction_collection()
    object_id = _to_object_id(junction_id)
    document = collection.find_one({"_id": object_id})

    if document is None:
        raise LookupError("Junction not found")

    return _serialize_junction(document)


def update_junction(junction_id: str, junction: JunctionUpdate) -> dict[str, Any]:
    collection = get_junction_collection()
    object_id = _to_object_id(junction_id)
    update_data = junction.model_dump(exclude_unset=True, exclude_none=True)

    if not update_data:
        return get_junction(junction_id)

    update_document = build_junction_update_document(update_data)
    result = collection.update_one({"_id": object_id}, {"$set": update_document})

    if result.matched_count == 0:
        raise LookupError("Junction not found")

    updated_document = collection.find_one({"_id": object_id})
    if updated_document is None:
        raise LookupError("Junction not found")

    return _serialize_junction(updated_document)


def delete_junction(junction_id: str) -> dict[str, str]:
    collection = get_junction_collection()
    object_id = _to_object_id(junction_id)
    result = collection.delete_one({"_id": object_id})

    if result.deleted_count == 0:
        raise LookupError("Junction not found")

    return {"message": "Junction deleted successfully"}
