from typing import Any

from fastapi import HTTPException, status

from app.services import simulation_service


def create_simulated_traffic(junction_id: str, scenario: str | None = None) -> dict[str, Any]:
    try:
        return simulation_service.create_simulated_traffic(junction_id, scenario)
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


def get_dashboard_state(junction_id: str) -> dict[str, Any]:
    try:
        return simulation_service.get_simulation_dashboard(junction_id)
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
