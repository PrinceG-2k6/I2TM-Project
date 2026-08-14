from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field

from app.schemas.density_schema import DensityLevel


class CongestionLevel(str, Enum):
    WARNING = "WARNING"
    CONGESTED = "CONGESTED"
    CRITICAL = "CRITICAL"


class CongestionAlertResponse(BaseModel):
    id: str
    junction_id: str
    direction: str
    congestion_level: CongestionLevel
    density_level: DensityLevel
    density: float = Field(..., ge=0)
    average_speed: float = Field(..., ge=0)
    queue_length: float = Field(..., ge=0)
    congestion_score: float = Field(..., ge=0)
    message: str
    created_at: datetime
