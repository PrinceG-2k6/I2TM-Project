from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class DensityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class DirectionDensityResponse(BaseModel):
    direction: str
    vehicle_count: int = Field(..., ge=0)
    lane_count: int = Field(..., gt=0)
    density: float = Field(..., ge=0)
    density_level: DensityLevel
    timestamp: datetime


class JunctionDensityResponse(BaseModel):
    junction_id: str
    densities: list[DirectionDensityResponse]
