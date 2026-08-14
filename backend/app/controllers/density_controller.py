from typing import Any

from fastapi import HTTPException, status

from app.services import density_service


def get_density(junction_id: str) -> dict[str, Any]:
    try:
        return density_service.get_latest_density_by_direction(junction_id)
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
