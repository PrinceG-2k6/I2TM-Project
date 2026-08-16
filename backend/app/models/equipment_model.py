from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def build_equipment_document(equipment_data: dict[str, Any]) -> dict[str, Any]:
    now = utc_now()
    document = equipment_data.copy()
    document.setdefault("status", "ONLINE")
    document["created_at"] = now
    document["updated_at"] = now
    return document


def build_equipment_update_document(update_data: dict[str, Any]) -> dict[str, Any]:
    document = update_data.copy()
    document["updated_at"] = utc_now()
    return document
