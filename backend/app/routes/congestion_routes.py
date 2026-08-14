from fastapi import APIRouter, status

from app.controllers import congestion_controller
from app.schemas.congestion_schema import CongestionAlertResponse


router = APIRouter(prefix="/traffic/congestion", tags=["Congestion Alerts"])


@router.post(
    "/alerts/{junction_id}",
    response_model=list[CongestionAlertResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_congestion_alerts(junction_id: str) -> list[dict]:
    return congestion_controller.create_congestion_alerts(junction_id)


@router.get(
    "/alerts/{junction_id}",
    response_model=list[CongestionAlertResponse],
)
def get_congestion_alert_history(junction_id: str) -> list[dict]:
    return congestion_controller.get_congestion_alert_history(junction_id)
