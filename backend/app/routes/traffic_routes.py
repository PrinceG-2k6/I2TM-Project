from fastapi import APIRouter, status

from app.controllers import traffic_controller
from app.schemas.traffic_schema import (
    TrafficObservationCreate,
    TrafficObservationResponse,
)


router = APIRouter(prefix="/traffic", tags=["Traffic Observations"])


@router.post(
    "",
    response_model=TrafficObservationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_traffic_observation(traffic: TrafficObservationCreate) -> dict:
    return traffic_controller.create_traffic_observation(traffic)


@router.get(
    "/current/{junction_id}",
    response_model=TrafficObservationResponse,
)
def get_current_traffic(junction_id: str) -> dict:
    return traffic_controller.get_current_traffic(junction_id)


@router.get(
    "/history/{junction_id}",
    response_model=list[TrafficObservationResponse],
)
def get_traffic_history(junction_id: str) -> list[dict]:
    return traffic_controller.get_traffic_history(junction_id)
