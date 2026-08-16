from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class SuggestionPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SignalSuggestionCreate(BaseModel):
    junction_id: str = Field(..., min_length=1)
    current_density: str = Field(default="MEDIUM")
    ambulance_approaching: bool = False
    patient_severity: str = Field(default="STABLE")
    road_priority: str = Field(default="NORMAL")
    display_message: str = Field(default="")


class SignalSuggestionResponse(BaseModel):
    id: str
    junction_id: str
    action: str
    priority: SuggestionPriority
    display_message: str
    created_at: datetime
