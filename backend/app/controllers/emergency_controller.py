from typing import Any

from fastapi import HTTPException, status

from app.services import emergency_service


def create_triage(junction_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    try:
        return emergency_service.create_triage(junction_id, payload)
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


def process_telemetry(payload: dict[str, Any]) -> dict[str, Any]:
    try:
        return emergency_service.process_telemetry(payload)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error
