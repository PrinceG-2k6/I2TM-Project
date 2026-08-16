from typing import Any

from fastapi import HTTPException, status

from app.services import suggestion_service


def create_suggestion(payload: dict[str, Any]) -> dict[str, Any]:
    try:
        return suggestion_service.generate_signal_suggestion(payload)
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
