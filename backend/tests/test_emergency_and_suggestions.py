from fastapi.testclient import TestClient

from app.main import app


def test_emergency_triage_priority_and_green_corridor() -> None:
    client = TestClient(app)
    junction_response = client.post(
        "/api/v1/junctions",
        json={
            "name": "Junction Emergency",
            "latitude": 21.146,
            "longitude": 79.088,
            "roads": ["Main Road", "Hospital Road", "Market Road"],
            "lanes": 4,
        },
    )
    assert junction_response.status_code == 201
    junction_id = junction_response.json()["id"]

    response = client.post(
        "/api/v1/emergency/triage",
        json={
            "ambulance_id": "AMB-01",
            "junction_id": junction_id,
            "patient_severity": "CRITICAL",
            "distance_to_junction_km": 0.8,
            "eta_seconds": 35,
            "route": ["North", "East"],
            "traffic_density": "HIGH",
            "congestion_risk": "HIGH",
            "message": "Critical trauma patient",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["priority_level"] in {"RED", "YELLOW", "GREEN"}
    assert payload["green_corridor_active"] in {True, False}
    assert payload["signal_action"]


def test_signal_suggestion_generation() -> None:
    client = TestClient(app)
    junction_response = client.post(
        "/api/v1/junctions",
        json={
            "name": "Junction Suggestion",
            "latitude": 21.147,
            "longitude": 79.089,
            "roads": ["Main Road", "School Road", "Market Road"],
            "lanes": 3,
        },
    )
    assert junction_response.status_code == 201
    junction_id = junction_response.json()["id"]

    response = client.post(
        "/api/v1/suggestions",
        json={
            "junction_id": junction_id,
            "current_density": "HIGH",
            "ambulance_approaching": True,
            "patient_severity": "CRITICAL",
            "road_priority": "HOSPITAL",
            "display_message": "Ambulance approaching. Keep clear.",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["action"]
    assert payload["priority"] in {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
    assert payload["display_message"]
