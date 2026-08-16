from datetime import datetime, timezone
from typing import Any

from app.services import congestion_service, density_service, traffic_service
from app.simulation.traffic_simulator import TrafficScenario, generate_traffic_observation


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_simulated_traffic(junction_id: str, scenario: str | None = None) -> dict[str, Any]:
    normalized_scenario = scenario.upper() if scenario else "NORMAL"
    try:
        scenario_value = TrafficScenario(normalized_scenario)
    except ValueError as error:
        raise ValueError("Invalid traffic scenario") from error

    observation = generate_traffic_observation(junction_id, scenario_value)
    payload = {
        "junction_id": observation["junction_id"],
        "direction": observation.get("direction", "UNKNOWN"),
        "vehicle_count": observation["vehicle_count"],
        "cars": observation["cars"],
        "motorcycles": observation["motorcycles"],
        "buses": observation["buses"],
        "trucks": observation["trucks"],
        "average_speed": observation["average_speed"],
        "queue_length": observation["queue_length"],
    }
    return traffic_service.create_traffic_observation(
        traffic_service.TrafficObservationCreate(
            junction_id=payload["junction_id"],
            direction=payload["direction"],
            vehicle_count=payload["vehicle_count"],
            cars=payload["cars"],
            motorcycles=payload["motorcycles"],
            buses=payload["buses"],
            trucks=payload["trucks"],
            average_speed=payload["average_speed"],
            queue_length=payload["queue_length"],
        )
    )


def _to_serializable_value(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    if hasattr(value, "value"):
        return value.value
    if isinstance(value, dict):
        return {key: _to_serializable_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_to_serializable_value(item) for item in value]
    return value


def get_simulation_dashboard(junction_id: str) -> dict[str, Any]:
    density_snapshot = density_service.get_latest_density_by_direction(junction_id)
    alert_history = congestion_service.get_congestion_alert_history(junction_id)

    status_level_map = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
    current_status = "NORMAL"
    for density in density_snapshot.get("densities", []):
        level = density["density_level"].value if hasattr(density["density_level"], "value") else str(density["density_level"])
        if status_level_map.get(level, 0) > status_level_map.get(current_status, 0):
            current_status = level

    if alert_history:
        highest_alert = max(
            alert_history,
            key=lambda item: status_level_map.get(item["congestion_level"].value if hasattr(item["congestion_level"], "value") else str(item["congestion_level"]), 0),
        )
        current_status = highest_alert["congestion_level"]

    payload = {
        "junction_id": junction_id,
        "density": density_snapshot,
        "congestion_alerts": alert_history[-5:],
        "status": current_status,
        "generated_at": utc_now(),
    }
    return _to_serializable_value(payload)
