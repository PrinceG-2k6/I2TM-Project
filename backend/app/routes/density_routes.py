from fastapi import APIRouter

from app.controllers import density_controller
from app.schemas.density_schema import JunctionDensityResponse


router = APIRouter(prefix="/traffic", tags=["Traffic Density"])


@router.get("/density/{junction_id}", response_model=JunctionDensityResponse)
def get_density(junction_id: str) -> dict:
    return density_controller.get_density(junction_id)
