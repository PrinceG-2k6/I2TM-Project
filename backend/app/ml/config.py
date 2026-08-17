"""
ML pipeline configuration using Pydantic Settings.
"""
from typing import Any, Dict

from pydantic_settings import BaseSettings, SettingsConfigDict


class MLSettings(BaseSettings):
    """
    Settings for the I²TMS Adaptive Signal Intelligence ML pipeline.
    
    All settings can be overridden via environment variables prefixed with 'ML_'.
    """
    model_config = SettingsConfigDict(env_prefix='ML_', env_file='.env', extra='ignore')

    # Object Detection
    model_path: str = "models/best.pt"
    model_confidence: float = 0.25
    model_iou: float = 0.45
    model_imgsz: int = 640

    # Object Tracking
    tracker_type: str = "bytetrack"
    tracker_match_threshold: float = 0.8
    tracker_track_buffer: int = 30
    max_track_age: int = 50

    # Processing and Speed Estimation
    processing_fps: int = 10
    speed_estimation_fps: int = 10
    speed_scale_factor: float = 0.05

    # Anomaly Detection Defaults
    anomaly_heading_variance_threshold: float = 60.0
    anomaly_lateral_deviation_threshold: float = 120.0
    anomaly_min_track_age: int = 10
    anomaly_trajectory_window: int = 25

    # Congestion and Density Scoring
    density_low_threshold: float = 0.3
    density_high_threshold: float = 0.7
    congestion_warning_threshold: float = 1.9
    congestion_critical_threshold: float = 2.6

    # Class Names
    class_names: Dict[int, str] = {
        0: "person",
        1: "bicycle",
        2: "car",
        3: "motorcycle",
        4: "airplane",
        5: "bus",
        6: "train",
        7: "truck",
        8: "boat",
        9: "traffic light",
        10: "fire hydrant",
        11: "stop sign",
        12: "parking meter",
        13: "bench",
        14: "autorickshaw"
    }

    # Region of Interest
    roi_configs: Dict[str, Any] = {}


ml_settings = MLSettings()
