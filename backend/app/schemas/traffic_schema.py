from datetime import datetime

from bson import ObjectId
from pydantic import BaseModel, Field, field_validator


class TrafficObservationCreate(BaseModel):
    junction_id: str
    vehicle_count: int = Field(..., ge=0)
    cars: int = Field(..., ge=0)
    motorcycles: int = Field(..., ge=0)
    buses: int = Field(..., ge=0)
    trucks: int = Field(..., ge=0)
    average_speed: float = Field(..., ge=0)
    queue_length: float = Field(..., ge=0)

    @field_validator("junction_id")
    @classmethod
    def validate_junction_id(cls, value: str) -> str:
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid junction ID")
        return value


class TrafficObservationResponse(BaseModel):
    id: str
    junction_id: str
    vehicle_count: int
    cars: int
    motorcycles: int
    buses: int
    trucks: int
    average_speed: float
    queue_length: float
    timestamp: datetime
