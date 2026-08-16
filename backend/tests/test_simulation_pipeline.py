from fastapi.testclient import TestClient

from app.main import app


def test_simulated_traffic_ingestion_and_dashboard_state() -> None:
    client = TestClient(app)

    junction_response = client.post(
        "/api/v1/junctions",
        json={
            "name": "Simulation Junction",
            "latitude": 21.200,
            "longitude": 79.100,
            "roads": ["North Road", "South Road", "East Road"],
            "lanes": 4,
        },
    )
    assert junction_response.status_code == 201
    junction_id = junction_response.json()["id"]

    response = client.post(
        "/api/v1/simulation/traffic",
        json={"junction_id": junction_id, "scenario": "BUSY"},
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["junction_id"] == junction_id
    assert payload["vehicle_count"] >= 0

    dashboard_response = client.get(f"/api/v1/simulation/dashboard/{junction_id}")
    assert dashboard_response.status_code == 200
    dashboard = dashboard_response.json()
    assert dashboard["junction_id"] == junction_id
    assert "density" in dashboard
    assert "congestion_alerts" in dashboard
    assert "status" in dashboard

    with client.websocket_connect(f"/api/v1/simulation/live/{junction_id}") as websocket:
        websocket.send_text("snapshot")
        live_snapshot = websocket.receive_json()
        assert live_snapshot["junction_id"] == junction_id
        assert "density" in live_snapshot
        assert "status" in live_snapshot
