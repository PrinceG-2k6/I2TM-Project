from typing import Any

from fastapi import HTTPException, status

from app.services import congestion_service


def create_congestion_alerts(junction_id: str) -> list[dict[str, Any]]:
    try:
        return congestion_service.generate_congestion_alerts(junction_id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error
    except LookupError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


def get_congestion_alert_history(junction_id: str) -> list[dict[str, Any]]:
    try:
        return congestion_service.get_congestion_alert_history(junction_id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error
    except LookupError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
