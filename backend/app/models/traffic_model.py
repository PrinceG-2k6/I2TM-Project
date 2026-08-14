from datetime import datetime, timezone
from typing import Any

from bson import ObjectId


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def build_traffic_observation_document(
    traffic_data: dict[str, Any],
    junction_object_id: ObjectId,
) -> dict[str, Any]:
    document = traffic_data.copy()
    document["junction_id"] = junction_object_id
    document["timestamp"] = utc_now()
    return document
