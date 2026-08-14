from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def build_congestion_alert_document(alert_data: dict[str, Any]) -> dict[str, Any]:
    document = alert_data.copy()
    document["created_at"] = utc_now()
    return document
