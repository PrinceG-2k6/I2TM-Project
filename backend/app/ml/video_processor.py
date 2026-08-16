"""Video processor module for the I²TMS ML pipeline.

Handles frame-by-frame video ingestion from multiple source types
(MP4 files, RTSP streams, webcam indices) and orchestrates the
detection → tracking → analytics → anomaly detection pipeline.

This module is source-agnostic: whether the frame comes from a
recorded AIC21 dataset video or a live RTSP camera, the downstream
pipeline produces identical FrameAnalysis output.
"""

from __future__ import annotations

import logging
import time
from collections.abc import Generator
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from app.ml.detector import YOLODetector, TrackedDetection

logger = logging.getLogger(__name__)


class SourceType(str, Enum):
    """Type of video source being processed."""

    VIDEO_FILE = "VIDEO_FILE"
    RTSP_STREAM = "RTSP_STREAM"
    WEBCAM = "WEBCAM"
    IMAGE_DIRECTORY = "IMAGE_DIRECTORY"


@dataclass
class VideoSourceConfig:
    """Configuration for a single video source."""

    source_path: str
    junction_id: str | None = None
    source_type: SourceType = SourceType.VIDEO_FILE
    target_fps: int = 10
    roi_config_path: str | None = None
    camera_name: str | None = None
    loop_video: bool = True  # Loop MP4 files for continuous demo

    @property
    def display_name(self) -> str:
        """Human-readable name for this source."""
        if self.camera_name:
            return self.camera_name
        return Path(self.source_path).stem if self.source_type == SourceType.VIDEO_FILE else self.source_path


@dataclass
class FramePacket:
    """A single frame with its metadata, ready for processing."""

    frame: np.ndarray
    frame_id: int
    timestamp: float  # Unix timestamp
    source: str
    junction_id: str | None
    resolution: tuple[int, int]  # (width, height)
    source_fps: float


@dataclass
class VideoSourceState:
    """Runtime state for a single video source."""

    config: VideoSourceConfig
    capture: cv2.VideoCapture | None = None
    frame_count: int = 0
    total_frames: int = 0
    source_fps: float = 0.0
    resolution: tuple[int, int] = (0, 0)
    is_open: bool = False
    loop_count: int = 0
    last_frame_time: float = 0.0
    errors: int = 0
    max_errors: int = 50


class VideoProcessor:
    """Reads video frames from various sources and yields FramePackets.

    Supports multiple simultaneous video sources (e.g., multiple junction
    cameras), frame rate control, and graceful error recovery.

    Usage:
        processor = VideoProcessor()
        processor.add_source(VideoSourceConfig(
            source_path="cam_5.mp4",
            junction_id="junction_nagpur_sitabuldi",
            target_fps=10,
        ))
        processor.open_all()

        for packet in processor.read_frames():
            # Process the frame with YOLO, analytics, etc.
            pass

        processor.release_all()
    """

    def __init__(self) -> None:
        """Initialise the video processor with an empty source list."""
        self._sources: dict[str, VideoSourceState] = {}

    def add_source(self, config: VideoSourceConfig) -> str:
        """Register a video source for processing.

        Args:
            config: Configuration for the video source.

        Returns:
            The source key used to identify this source internally.

        Raises:
            ValueError: If the source path is empty or source already registered.
        """
        if not config.source_path:
            raise ValueError("source_path must not be empty")

        source_key = config.display_name
        if source_key in self._sources:
            raise ValueError(f"Source '{source_key}' already registered")

        self._sources[source_key] = VideoSourceState(config=config)
        logger.info("Registered video source: %s (%s)", source_key, config.source_type.value)
        return source_key

    def open_all(self) -> dict[str, bool]:
        """Open all registered video sources.

        Returns:
            Dict mapping source keys to whether they opened successfully.
        """
        results: dict[str, bool] = {}
        for key, state in self._sources.items():
            results[key] = self._open_source(state)
        return results

    def _open_source(self, state: VideoSourceState) -> bool:
        """Open a single video source.

        Args:
            state: The VideoSourceState to open.

        Returns:
            True if the source was opened successfully.
        """
        config = state.config
        try:
            if config.source_type == SourceType.WEBCAM:
                cap = cv2.VideoCapture(int(config.source_path))
            elif config.source_type == SourceType.RTSP_STREAM:
                cap = cv2.VideoCapture(config.source_path, cv2.CAP_FFMPEG)
                # Set RTSP-specific buffer settings for lower latency
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            elif config.source_type == SourceType.VIDEO_FILE:
                source_path = Path(config.source_path)
                if not source_path.exists():
                    logger.error("Video file not found: %s", source_path)
                    return False
                cap = cv2.VideoCapture(str(source_path))
            else:
                logger.error("Unsupported source type: %s", config.source_type)
                return False

            if not cap.isOpened():
                logger.error("Failed to open video source: %s", config.source_path)
                return False

            state.capture = cap
            state.source_fps = cap.get(cv2.CAP_PROP_FPS) or config.target_fps
            state.total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            state.resolution = (width, height)
            state.is_open = True
            state.frame_count = 0
            state.errors = 0

            logger.info(
                "Opened source '%s': %dx%d @ %.1f FPS, %d total frames",
                config.display_name,
                width,
                height,
                state.source_fps,
                state.total_frames,
            )
            return True

        except Exception:
            logger.exception("Error opening video source: %s", config.source_path)
            return False

    def read_frames(self, round_robin: bool = True) -> Generator[FramePacket, None, None]:
        """Yield frames from all open sources.

        Args:
            round_robin: If True, alternate between sources. If False,
                exhaust each source sequentially.

        Yields:
            FramePacket for each successfully read frame.
        """
        active_sources = {k: v for k, v in self._sources.items() if v.is_open}
        if not active_sources:
            logger.warning("No open video sources available")
            return

        if round_robin:
            yield from self._read_round_robin(active_sources)
        else:
            for key, state in active_sources.items():
                yield from self._read_single_source(key, state)

    def _read_round_robin(
        self, sources: dict[str, VideoSourceState]
    ) -> Generator[FramePacket, None, None]:
        """Read one frame from each source in rotation."""
        active_keys = list(sources.keys())

        while active_keys:
            keys_to_remove: list[str] = []

            for key in active_keys:
                state = sources[key]
                packet = self._read_one_frame(key, state)

                if packet is not None:
                    # Frame rate control: sleep to match target FPS
                    self._apply_frame_rate_control(state)
                    yield packet
                else:
                    # Source exhausted or errored
                    if state.config.loop_video and state.config.source_type == SourceType.VIDEO_FILE:
                        if self._loop_source(state):
                            state.loop_count += 1
                            logger.info(
                                "Looping source '%s' (loop #%d)",
                                key,
                                state.loop_count,
                            )
                            continue
                    keys_to_remove.append(key)

            for key in keys_to_remove:
                active_keys.remove(key)
                logger.info("Source '%s' exhausted after %d frames", key, sources[key].frame_count)

    def _read_single_source(
        self, key: str, state: VideoSourceState
    ) -> Generator[FramePacket, None, None]:
        """Read all frames from a single source."""
        while True:
            packet = self._read_one_frame(key, state)
            if packet is None:
                if state.config.loop_video and state.config.source_type == SourceType.VIDEO_FILE:
                    if self._loop_source(state):
                        state.loop_count += 1
                        continue
                break
            self._apply_frame_rate_control(state)
            yield packet

    def _read_one_frame(self, key: str, state: VideoSourceState) -> FramePacket | None:
        """Read a single frame from a source.

        Returns:
            FramePacket if successful, None if source is exhausted or errored.
        """
        if state.capture is None or not state.capture.isOpened():
            return None

        try:
            ret, frame = state.capture.read()
            if not ret or frame is None:
                return None

            state.frame_count += 1
            state.errors = 0  # Reset error counter on success

            return FramePacket(
                frame=frame,
                frame_id=state.frame_count,
                timestamp=time.time(),
                source=state.config.source_path,
                junction_id=state.config.junction_id,
                resolution=state.resolution,
                source_fps=state.source_fps,
            )

        except Exception:
            state.errors += 1
            logger.exception(
                "Error reading frame from '%s' (error %d/%d)",
                key,
                state.errors,
                state.max_errors,
            )
            if state.errors >= state.max_errors:
                logger.error("Max errors reached for source '%s', marking as closed", key)
                state.is_open = False
                return None
            return None

    def _loop_source(self, state: VideoSourceState) -> bool:
        """Reset a video file source to the beginning.

        Returns:
            True if the source was successfully reset.
        """
        if state.capture is None:
            return False
        try:
            state.capture.set(cv2.CAP_PROP_POS_FRAMES, 0)
            state.frame_count = 0
            return True
        except Exception:
            logger.exception("Failed to loop video source")
            return False

    def _apply_frame_rate_control(self, state: VideoSourceState) -> None:
        """Sleep to maintain target frame rate."""
        target_interval = 1.0 / state.config.target_fps
        now = time.time()
        elapsed = now - state.last_frame_time if state.last_frame_time > 0 else target_interval

        if elapsed < target_interval:
            sleep_time = target_interval - elapsed
            time.sleep(sleep_time)

        state.last_frame_time = time.time()

    def release_all(self) -> None:
        """Release all video sources."""
        for key, state in self._sources.items():
            self._release_source(key, state)

    def _release_source(self, key: str, state: VideoSourceState) -> None:
        """Release a single video source."""
        if state.capture is not None:
            state.capture.release()
            state.capture = None
            state.is_open = False
            logger.info(
                "Released source '%s' after %d frames (%d loops)",
                key,
                state.frame_count,
                state.loop_count,
            )

    def get_source_info(self) -> dict[str, dict[str, Any]]:
        """Get current status of all registered sources.

        Returns:
            Dict mapping source keys to their status information.
        """
        info: dict[str, dict[str, Any]] = {}
        for key, state in self._sources.items():
            info[key] = {
                "source_path": state.config.source_path,
                "source_type": state.config.source_type.value,
                "junction_id": state.config.junction_id,
                "is_open": state.is_open,
                "resolution": state.resolution,
                "source_fps": state.source_fps,
                "target_fps": state.config.target_fps,
                "frames_processed": state.frame_count,
                "total_frames": state.total_frames,
                "loop_count": state.loop_count,
                "progress_pct": (
                    round(state.frame_count / state.total_frames * 100, 1)
                    if state.total_frames > 0
                    else 0.0
                ),
            }
        return info

    @property
    def source_count(self) -> int:
        """Number of registered sources."""
        return len(self._sources)

    @property
    def open_source_count(self) -> int:
        """Number of currently open sources."""
        return sum(1 for s in self._sources.values() if s.is_open)

    def __enter__(self) -> VideoProcessor:
        """Context manager entry."""
        self.open_all()
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Context manager exit — release all sources."""
        self.release_all()
