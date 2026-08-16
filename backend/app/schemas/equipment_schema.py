from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class EquipmentCreate(BaseModel):
    device_id: str = Field(..., description="Unique device identifier (e.g., NGP-CAM-01)")
    device_type: str = Field(..., description="CAMERA or SIGNAL")
    name: str = Field(..., min_length=1)
    city_name: str
    junction_id: str
    junction_name: str
    approach: str
    latitude: float
    longitude: float
    status: str = "ONLINE"


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None


class EquipmentResponse(BaseModel):
    id: str
    device_id: str
    device_type: str
    name: str
    city_name: str
    junction_id: str
    junction_name: str
    approach: str
    latitude: float
    longitude: float
    status: str
    created_at: datetime
    updated_at: datetime
