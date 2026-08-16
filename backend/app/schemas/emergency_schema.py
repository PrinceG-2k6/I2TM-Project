from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class SeverityLevel(str, Enum):
    STABLE = "STABLE"
    SERIOUS = "SERIOUS"
    CRITICAL = "CRITICAL"


class TrafficDensityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class EmergencyPriority(str, Enum):
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    RED = "RED"


class EmergencyTriageCreate(BaseModel):
    ambulance_id: str = Field(..., min_length=1)
    junction_id: str = Field(..., min_length=1)
    patient_severity: SeverityLevel
    distance_to_junction_km: float = Field(..., ge=0)
    eta_seconds: int = Field(..., ge=0)
    route: list[str] = Field(default_factory=list)
    traffic_density: TrafficDensityLevel = TrafficDensityLevel.MEDIUM
    congestion_risk: TrafficDensityLevel = TrafficDensityLevel.MEDIUM
    message: str = Field(default="")


class EmergencyTriageResponse(BaseModel):
    id: str
    ambulance_id: str
    junction_id: str
    patient_severity: str
    priority_level: str
    signal_action: str
    green_corridor_active: bool
    eta_seconds: int
    message: str
    created_at: datetime


class AmbulanceTelemetryCreate(BaseModel):
    ambulance_id: str = Field(..., min_length=1)
    latitude: float
    longitude: float
    speed_kmh: float = Field(..., ge=0)
    heading_degrees: float = Field(..., ge=0, le=360)
    active_route_junction_ids: list[str] = Field(default_factory=list)
    patient_severity: SeverityLevel = SeverityLevel.STABLE


class AmbulanceTelemetryResponse(BaseModel):
    id: str
    ambulance_id: str
    closest_junction_id: str
    distance_to_closest_m: float
    eta_seconds: int
    priority_level_triggered: str
    signal_action: str
    timestamp: datetime
