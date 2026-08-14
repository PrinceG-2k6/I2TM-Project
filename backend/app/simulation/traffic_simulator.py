from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from enum import Enum
from math import floor
from random import Random
from types import MappingProxyType
from typing import Any, Final

from app.models.traffic_model import utc_now
from app.schemas.traffic_schema import TrafficObservationCreate
from app.services import traffic_service


class TrafficScenario(str, Enum):
    NORMAL = "NORMAL"
    BUSY = "BUSY"
    CRITICAL = "CRITICAL"


@dataclass(frozen=True)
class ScenarioProfile:
    vehicle_count_range: tuple[int, int]
    average_speed_range: tuple[float, float]
    queue_length_range: tuple[float, float]


SCENARIO_PROFILES: Final[Mapping[TrafficScenario, ScenarioProfile]] = MappingProxyType(
    {
        TrafficScenario.NORMAL: ScenarioProfile(
            vehicle_count_range=(40, 90),
            average_speed_range=(35.0, 50.0),
            queue_length_range=(10.0, 50.0),
        ),
        TrafficScenario.BUSY: ScenarioProfile(
            vehicle_count_range=(90, 160),
            average_speed_range=(20.0, 35.0),
            queue_length_range=(50.0, 150.0),
        ),
        TrafficScenario.CRITICAL: ScenarioProfile(
            vehicle_count_range=(160, 250),
            average_speed_range=(5.0, 20.0),
            queue_length_range=(150.0, 300.0),
        ),
    },
)


def generate_vehicle_distribution(
    vehicle_count: int,
    rng: Random | None = None,
) -> dict[str, int]:
    """Split a vehicle count into realistic vehicle type counts."""
    if vehicle_count < 0:
        raise ValueError("vehicle_count must be non-negative")

    if vehicle_count == 0:
        return {"cars": 0, "motorcycles": 0, "buses": 0, "trucks": 0}

    rng = rng or Random()
    shares = {
        "cars": rng.uniform(0.45, 0.60),
        "motorcycles": rng.uniform(0.25, 0.40),
        "buses": rng.uniform(0.03, 0.08),
        "trucks": rng.uniform(0.05, 0.12),
    }
    total_share = sum(shares.values())
    raw_counts = {
        vehicle_type: (share / total_share) * vehicle_count
        for vehicle_type, share in shares.items()
    }
    distribution = {
        vehicle_type: floor(raw_count)
        for vehicle_type, raw_count in raw_counts.items()
    }

    remaining = vehicle_count - sum(distribution.values())
    by_fraction = sorted(
        raw_counts,
        key=lambda vehicle_type: raw_counts[vehicle_type] - distribution[vehicle_type],
        reverse=True,
    )
    for vehicle_type in by_fraction[:remaining]:
        distribution[vehicle_type] += 1

    return distribution


def generate_scenario_data(
    scenario: TrafficScenario | str,
    rng: Random | None = None,
) -> dict[str, int | float]:
    """Generate correlated traffic volume, speed, and queue values."""
    rng = rng or Random()
    profile = SCENARIO_PROFILES[_normalize_scenario(scenario)]
    intensity = rng.random()

    vehicle_count = round(
        _scale(
            profile.vehicle_count_range[0],
            profile.vehicle_count_range[1],
            intensity,
        ),
    )
    average_speed = _scale(
        profile.average_speed_range[1],
        profile.average_speed_range[0],
        intensity,
    )
    queue_length = _scale(
        profile.queue_length_range[0],
        profile.queue_length_range[1],
        intensity,
    )

    average_speed = _clamp(
        average_speed + rng.uniform(-2.0, 2.0),
        profile.average_speed_range[0],
        profile.average_speed_range[1],
    )
    queue_length = _clamp(
        queue_length + rng.uniform(-8.0, 8.0),
        profile.queue_length_range[0],
        profile.queue_length_range[1],
    )

    return {
        "vehicle_count": vehicle_count,
        "average_speed": round(average_speed, 1),
        "queue_length": round(queue_length, 1),
    }


def generate_traffic_observation(
    junction_id: str,
    scenario: TrafficScenario | str,
    rng: Random | None = None,
) -> dict[str, Any]:
    """Generate a complete fake traffic observation for a junction."""
    if not junction_id:
        raise ValueError("junction_id is required")

    rng = rng or Random()
    scenario_data = generate_scenario_data(scenario, rng)
    distribution = generate_vehicle_distribution(
        int(scenario_data["vehicle_count"]),
        rng,
    )

    return {
        "junction_id": junction_id,
        **scenario_data,
        **distribution,
        "timestamp": utc_now(),
    }


def generate_traffic_observations(
    junction_id: str,
    scenarios: Sequence[TrafficScenario | str],
    rng: Random | None = None,
) -> list[dict[str, Any]]:
    """Generate multiple fake traffic observations for the same junction."""
    rng = rng or Random()
    return [
        generate_traffic_observation(junction_id, scenario, rng)
        for scenario in scenarios
    ]


def create_simulated_traffic_observation(
    junction_id: str,
    scenario: TrafficScenario | str,
    rng: Random | None = None,
) -> dict[str, Any]:
    """Create a simulated observation through the existing traffic service."""
    observation = generate_traffic_observation(junction_id, scenario, rng)
    traffic_payload = TrafficObservationCreate(
        junction_id=observation["junction_id"],
        vehicle_count=observation["vehicle_count"],
        cars=observation["cars"],
        motorcycles=observation["motorcycles"],
        buses=observation["buses"],
        trucks=observation["trucks"],
        average_speed=observation["average_speed"],
        queue_length=observation["queue_length"],
    )
    return traffic_service.create_traffic_observation(traffic_payload)


def create_simulated_traffic_observations(
    junction_id: str,
    scenarios: Sequence[TrafficScenario | str],
    rng: Random | None = None,
) -> list[dict[str, Any]]:
    """Create multiple simulated observations through the traffic service."""
    rng = rng or Random()
    return [
        create_simulated_traffic_observation(junction_id, scenario, rng)
        for scenario in scenarios
    ]


def _normalize_scenario(scenario: TrafficScenario | str) -> TrafficScenario:
    if isinstance(scenario, TrafficScenario):
        return scenario

    try:
        return TrafficScenario(scenario.upper())
    except ValueError as error:
        raise ValueError("Invalid traffic scenario") from error


def _scale(start: float, end: float, intensity: float) -> float:
    return start + ((end - start) * intensity)


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))
