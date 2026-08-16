"""
Data contract schemas for the I²TMS Adaptive Signal Intelligence ML pipeline.
"""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class BoundingBox(BaseModel):
    """Pixel coordinates for bounding box."""
    model_config = ConfigDict(from_attributes=True)
    
    x1: int
    y1: int
    x2: int
    y2: int


class Centroid(BaseModel):
    """Pixel coordinates for centroid."""
    model_config = ConfigDict(from_attributes=True)
    
    x: float
    y: float


class Detection(BaseModel):
    """Single vehicle detection data."""
    model_config = ConfigDict(from_attributes=True)
    
    vehicle_id: str
    class_name: str
    class_id: int
    confidence: float = Field(ge=0.0, le=1.0)
    bbox: BoundingBox
    centroid: Centroid
    speed_kmh: Optional[float] = None
    heading_degrees: Optional[float] = Field(None, ge=0.0, le=360.0)
    in_roi: Optional[str] = None
    track_age_frames: int


class VehicleBreakdown(BaseModel):
    """Counts per vehicle type."""
    model_config = ConfigDict(from_attributes=True)
    
    cars: int = 0
    motorcycles: int = 0
    bicycles: int = 0
    buses: int = 0
    trucks: int = 0
    autorickshaws: int = 0
    ambulances: int = 0
    persons: int = 0

    @property
    def total(self) -> int:
        """Sum of all vehicle counts."""
        return (
            self.cars
            + self.motorcycles
            + self.bicycles
            + self.buses
            + self.trucks
            + self.autorickshaws
            + self.ambulances
            + self.persons
        )


class DirectionAnalytics(BaseModel):
    """Analytics for one direction/approach at a junction."""
    model_config = ConfigDict(from_attributes=True)
    
    direction: str
    vehicle_count: int
    vehicle_breakdown: VehicleBreakdown
    density_ratio: float = Field(ge=0.0, le=1.0)
    density_level: str
    average_speed_kmh: float
    queue_length_meters: float
    flow_rate_veh_per_min: float
    occupancy_percent: float = Field(ge=0.0, le=100.0)


class AnomalyType(str, Enum):
    """Types of traffic anomalies."""
    ZIGZAG_MOVEMENT = "ZIGZAG_MOVEMENT"
    SUDDEN_LANE_CHANGE = "SUDDEN_LANE_CHANGE"
    WRONG_SIDE_DRIVING = "WRONG_SIDE_DRIVING"
    ABRUPT_STOP = "ABRUPT_STOP"
    EXCESSIVE_SPEED = "EXCESSIVE_SPEED"
    TAILGATING = "TAILGATING"
    UNSAFE_OVERTAKING = "UNSAFE_OVERTAKING"


class DensityLevel(str, Enum):
    """Traffic density classification levels."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class AnomalyAlert(BaseModel):
    """Detected anomaly."""
    model_config = ConfigDict(from_attributes=True)
    
    vehicle_id: str
    anomaly_type: AnomalyType
    confidence: float = Field(ge=0.0, le=1.0)
    risk_score: float = Field(ge=0.0, le=10.0)
    bbox: BoundingBox
    centroid: Centroid
    trajectory_last_n: List[Centroid]
    heading_variance_deg: float
    lateral_deviation_px: float
    description: str


class AggregateStats(BaseModel):
    """Frame-level aggregated statistics."""
    model_config = ConfigDict(from_attributes=True)
    
    total_vehicles: int
    total_by_class: VehicleBreakdown
    avg_speed_kmh: float
    max_density_direction: str
    overall_congestion_score: float
    overall_congestion_level: str
    active_tracks: int
    new_tracks_this_frame: int
    lost_tracks_this_frame: int


class FrameMetadata(BaseModel):
    """Processing performance metadata for a frame."""
    model_config = ConfigDict(from_attributes=True)
    
    resolution_width: int
    resolution_height: int
    inference_time_ms: float
    tracking_time_ms: float
    analytics_time_ms: float
    total_processing_time_ms: float
    model_name: str
    tracker_name: str


class FrameAnalysis(BaseModel):
    """The COMPLETE output for one frame/tick (top-level contract)."""
    model_config = ConfigDict(from_attributes=True)
    
    frame_id: int
    timestamp: datetime
    source: str
    junction_id: Optional[str] = None
    detections: List[Detection]
    direction_analytics: Dict[str, DirectionAnalytics]
    anomalies: List[AnomalyAlert]
    aggregate_stats: AggregateStats
    frame_metadata: FrameMetadata

    def to_backend_payload(self) -> dict:
        """
        Serialize to the JSON contract expected by the backend.
        Includes all comprehensive data.
        """
        return self.model_dump(mode="json")

    def to_websocket_payload(self) -> dict:
        """
        Serialize to a dictionary optimized for WebSocket transmission.
        Reduces size by omitting large data elements like full trajectories.
        """
        payload = self.model_dump(mode="json")
        for anomaly in payload.get("anomalies", []):
            if "trajectory_last_n" in anomaly:
                del anomaly["trajectory_last_n"]
        return payload
