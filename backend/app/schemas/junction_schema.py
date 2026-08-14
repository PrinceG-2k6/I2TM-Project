from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class JunctionCreate(BaseModel):
    name: str = Field(..., min_length=1)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    roads: list[str] = Field(..., min_length=1)
    lanes: int = Field(..., gt=0)
    status: str = "ACTIVE"


class JunctionUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    roads: Optional[list[str]] = Field(default=None, min_length=1)
    lanes: Optional[int] = Field(default=None, gt=0)
    status: Optional[str] = Field(default=None, min_length=1)


class JunctionResponse(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    roads: list[str]
    lanes: int
    status: str
    created_at: datetime
    updated_at: datetime


class JunctionDeleteResponse(BaseModel):
    message: str
