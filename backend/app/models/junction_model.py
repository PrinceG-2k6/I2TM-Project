from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def build_junction_document(junction_data: dict[str, Any]) -> dict[str, Any]:
    now = utc_now()
    document = junction_data.copy()
    document.setdefault("status", "ACTIVE")
    document["created_at"] = now
    document["updated_at"] = now
    return document


def build_junction_update_document(update_data: dict[str, Any]) -> dict[str, Any]:
    document = update_data.copy()
    document["updated_at"] = utc_now()
    return document
