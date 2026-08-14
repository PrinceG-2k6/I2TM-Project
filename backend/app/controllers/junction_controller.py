from typing import Any

from fastapi import HTTPException, status

from app.schemas.junction_schema import JunctionCreate, JunctionUpdate
from app.services import junction_service


def create_junction(junction: JunctionCreate) -> dict[str, Any]:
    return junction_service.create_junction(junction)


def get_all_junctions() -> list[dict[str, Any]]:
    return junction_service.get_all_junctions()


def get_junction(junction_id: str) -> dict[str, Any]:
    try:
        return junction_service.get_junction(junction_id)
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


def update_junction(junction_id: str, junction: JunctionUpdate) -> dict[str, Any]:
    try:
        return junction_service.update_junction(junction_id, junction)
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


def delete_junction(junction_id: str) -> dict[str, str]:
    try:
        return junction_service.delete_junction(junction_id)
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
