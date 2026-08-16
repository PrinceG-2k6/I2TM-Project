"""ML pipeline for the I²TMS Adaptive Signal Intelligence system.

This package provides the complete AI/ML pipeline for traffic analysis:

Modules:
    - schemas: Data contract Pydantic models (FrameAnalysis, Detection, etc.)
    - config: ML pipeline configuration settings
    - detector: YOLOv8 detection and ByteTrack tracking wrapper
    - roi_manager: Region of Interest polygon management
    - analytics: Direction-level traffic analytics computation
    - anomaly_detector: Trajectory-based anomaly detection
    - video_processor: Multi-source video frame ingestion
    - pipeline: Master orchestrator tying all components together

Quick start:
    >>> from app.ml.pipeline import TrafficMLPipeline
    >>> pipeline = TrafficMLPipeline(model_path="models/best.pt")
    >>> pipeline.setup()
    >>> for result in pipeline.run_on_video("cam_5.mp4"):
    ...     backend_json = result.to_backend_payload()
"""

from app.ml.schemas import (
    AggregateStats,
    AnomalyAlert,
    AnomalyType,
    BoundingBox,
    Centroid,
    DensityLevel,
    Detection,
    DirectionAnalytics,
    FrameAnalysis,
    FrameMetadata,
    VehicleBreakdown,
)

__all__ = [
    "AggregateStats",
    "AnomalyAlert",
    "AnomalyType",
    "BoundingBox",
    "Centroid",
    "DensityLevel",
    "Detection",
    "DirectionAnalytics",
    "FrameAnalysis",
    "FrameMetadata",
    "VehicleBreakdown",
]
