from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class SimulationScenario(str, Enum):
    NORMAL = "NORMAL"
    BUSY = "BUSY"
    CRITICAL = "CRITICAL"


class SimulationTrafficInput(BaseModel):
    junction_id: str = Field(..., min_length=1)
    scenario: SimulationScenario = SimulationScenario.NORMAL


class SimulationDashboardResponse(BaseModel):
    junction_id: str
    density: dict
    congestion_alerts: list[dict]
    status: str
    generated_at: datetime
