from typing import Optional

from fastapi import APIRouter, status

from app.controllers import emergency_controller
from app.schemas.emergency_schema import EmergencyTriageCreate, EmergencyTriageResponse, AmbulanceTelemetryCreate, AmbulanceTelemetryResponse


router = APIRouter(prefix="/emergency", tags=["Emergency Triage"])


@router.post(
    "/telemetry",
    response_model=AmbulanceTelemetryResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_telemetry(payload: AmbulanceTelemetryCreate) -> dict:
    return emergency_controller.process_telemetry(payload.model_dump())


@router.post(
    "/triage",
    response_model=EmergencyTriageResponse,
    status_code=status.HTTP_201_CREATED,
)
def triage_ambulance(payload: EmergencyTriageCreate) -> dict:
    junction_id = payload.junction_id
    return emergency_controller.create_triage(junction_id, payload.model_dump())


@router.post(
    "/triage/{junction_id}",
    response_model=EmergencyTriageResponse,
    status_code=status.HTTP_201_CREATED,
)
def triage_ambulance_with_path(
    junction_id: str,
    payload: EmergencyTriageCreate,
) -> dict:
    payload_data = payload.model_dump()
    if not payload_data.get("junction_id"):
        payload_data["junction_id"] = junction_id
    return emergency_controller.create_triage(junction_id, payload_data)
