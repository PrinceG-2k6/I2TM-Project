from datetime import datetime

from bson import ObjectId
from pydantic import BaseModel, Field, field_validator


class TrafficObservationCreate(BaseModel):
    junction_id: str
    direction: str = "UNKNOWN"
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

    @field_validator("direction")
    @classmethod
    def validate_direction(cls, value: str) -> str:
        allowed_directions = {"NORTH", "SOUTH", "EAST", "WEST", "UNKNOWN"}
        normalized_value = value.strip().upper()
        if normalized_value not in allowed_directions:
            raise ValueError("Direction must be NORTH, SOUTH, EAST, WEST, or UNKNOWN")
        return normalized_value


class TrafficObservationResponse(BaseModel):
    id: str
    junction_id: str
    direction: str
    vehicle_count: int
    cars: int
    motorcycles: int
    buses: int
    trucks: int
    average_speed: float
    queue_length: float
    timestamp: datetime
