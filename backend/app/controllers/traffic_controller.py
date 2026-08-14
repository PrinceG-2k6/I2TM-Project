from typing import Any

from fastapi import HTTPException, status

from app.schemas.traffic_schema import TrafficObservationCreate
from app.services import traffic_service


def create_traffic_observation(
    traffic: TrafficObservationCreate,
) -> dict[str, Any]:
    try:
        return traffic_service.create_traffic_observation(traffic)
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


def get_current_traffic(junction_id: str) -> dict[str, Any]:
    try:
        return traffic_service.get_current_traffic(junction_id)
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


def get_traffic_history(junction_id: str) -> list[dict[str, Any]]:
    try:
        return traffic_service.get_traffic_history(junction_id)
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
