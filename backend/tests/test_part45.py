from copy import deepcopy

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient

from app.main import app
from app.services import (
    congestion_service,
    density_service,
    junction_service,
    traffic_service,
)


class InsertOneResult:
    def __init__(self, inserted_id: ObjectId) -> None:
        self.inserted_id = inserted_id


class UpdateResult:
    def __init__(self, matched_count: int) -> None:
        self.matched_count = matched_count


class DeleteResult:
    def __init__(self, deleted_count: int) -> None:
        self.deleted_count = deleted_count


class FakeCursor:
    def __init__(self, documents: list[dict]) -> None:
        self.documents = documents

    def sort(self, key: str, direction: int) -> "FakeCursor":
        self.documents.sort(
            key=lambda document: document.get(key),
            reverse=direction == -1,
        )
        return self

    def __iter__(self):
        return iter(deepcopy(self.documents))


class FakeCollection:
    def __init__(self) -> None:
        self.documents: dict[ObjectId, dict] = {}

    def insert_one(self, document: dict) -> InsertOneResult:
        stored_document = deepcopy(document)
        stored_document["_id"] = stored_document.get("_id", ObjectId())
        self.documents[stored_document["_id"]] = stored_document
        return InsertOneResult(stored_document["_id"])

    def find(self, filter_query: dict | None = None) -> FakeCursor:
        filter_query = filter_query or {}
        documents = [
            document
            for document in self.documents.values()
            if self._matches(document, filter_query)
        ]
        return FakeCursor(deepcopy(documents))

    def find_one(self, filter_query: dict, sort: list[tuple[str, int]] | None = None):
        cursor = self.find(filter_query)
        if sort:
            key, direction = sort[0]
            cursor.sort(key, direction)
        for document in cursor:
            return document
        return None

    def update_one(self, filter_query: dict, update: dict) -> UpdateResult:
        for document_id, document in self.documents.items():
            if self._matches(document, filter_query):
                self.documents[document_id] = {**document, **update.get("$set", {})}
                return UpdateResult(1)
        return UpdateResult(0)

    def delete_one(self, filter_query: dict) -> DeleteResult:
        for document_id, document in list(self.documents.items()):
            if self._matches(document, filter_query):
                del self.documents[document_id]
                return DeleteResult(1)
        return DeleteResult(0)

    @staticmethod
    def _matches(document: dict, filter_query: dict) -> bool:
        return all(document.get(key) == value for key, value in filter_query.items())


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    junctions = FakeCollection()
    traffic_observations = FakeCollection()
    congestion_alerts = FakeCollection()

    monkeypatch.setattr(junction_service, "get_junction_collection", lambda: junctions)
    monkeypatch.setattr(traffic_service, "get_junction_collection", lambda: junctions)
    monkeypatch.setattr(
        traffic_service,
        "get_traffic_collection",
        lambda: traffic_observations,
    )
    monkeypatch.setattr(density_service, "get_junction_collection", lambda: junctions)
    monkeypatch.setattr(
        density_service,
        "get_traffic_collection",
        lambda: traffic_observations,
    )
    monkeypatch.setattr(
        congestion_service,
        "get_junction_collection",
        lambda: junctions,
    )
    monkeypatch.setattr(
        congestion_service,
        "get_traffic_collection",
        lambda: traffic_observations,
    )
    monkeypatch.setattr(
        congestion_service,
        "get_congestion_alert_collection",
        lambda: congestion_alerts,
    )

    return TestClient(app)


def create_junction(client: TestClient, lanes: int = 4) -> str:
    response = client.post(
        "/api/v1/junctions",
        json={
            "name": "Junction Density Test",
            "latitude": 21.1458,
            "longitude": 79.0882,
            "roads": ["Main", "Second"],
            "lanes": lanes,
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


def create_traffic(
    client: TestClient,
    junction_id: str,
    direction: str,
    vehicle_count: int,
    average_speed: float,
    queue_length: float,
) -> None:
    cars = int(vehicle_count * 0.6)
    motorcycles = int(vehicle_count * 0.25)
    buses = int(vehicle_count * 0.05)
    trucks = vehicle_count - cars - motorcycles - buses

    response = client.post(
        "/api/v1/traffic",
        json={
            "junction_id": junction_id,
            "direction": direction,
            "vehicle_count": vehicle_count,
            "cars": cars,
            "motorcycles": motorcycles,
            "buses": buses,
            "trucks": trucks,
            "average_speed": average_speed,
            "queue_length": queue_length,
        },
    )
    assert response.status_code == 201


def test_density_calculation() -> None:
    assert density_service.calculate_density(vehicle_count=80, lane_count=4) == 20.0


def test_density_low_classification() -> None:
    assert density_service.classify_density(19.99).value == "LOW"


def test_density_medium_classification() -> None:
    assert density_service.classify_density(20.0).value == "MEDIUM"


def test_density_high_classification() -> None:
    assert density_service.classify_density(40.0).value == "HIGH"


def test_density_boundary_values() -> None:
    assert density_service.classify_density(0).value == "LOW"
    assert density_service.classify_density(39.99).value == "MEDIUM"
    assert density_service.classify_density(120).value == "HIGH"


def test_density_invalid_values() -> None:
    with pytest.raises(ValueError):
        density_service.calculate_density(vehicle_count=-1, lane_count=4)
    with pytest.raises(ValueError):
        density_service.calculate_density(vehicle_count=10, lane_count=0)
    with pytest.raises(ValueError):
        density_service.classify_density(-1)


def test_density_per_junction_direction(client: TestClient) -> None:
    junction_id = create_junction(client)
    create_traffic(client, junction_id, "NORTH", 100, 30, 70)
    create_traffic(client, junction_id, "SOUTH", 200, 15, 190)

    response = client.get(f"/api/v1/traffic/density/{junction_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["junction_id"] == junction_id
    assert len(data["densities"]) == 2
    north = next(item for item in data["densities"] if item["direction"] == "NORTH")
    south = next(item for item in data["densities"] if item["direction"] == "SOUTH")
    assert north["density"] == 25.0
    assert north["density_level"] == "MEDIUM"
    assert south["density"] == 50.0
    assert south["density_level"] == "HIGH"


def test_density_api_invalid_junction_id(client: TestClient) -> None:
    response = client.get("/api/v1/traffic/density/not-a-valid-id")
    assert response.status_code == 400


def test_congestion_warning_classification() -> None:
    level = congestion_service.classify_congestion(
        density=15.0,
        average_speed=45.0,
        queue_length=20.0,
    )
    assert level.value == "WARNING"


def test_congestion_congested_classification() -> None:
    level = congestion_service.classify_congestion(
        density=25.0,
        average_speed=30.0,
        queue_length=100.0,
    )
    assert level.value == "CONGESTED"


def test_congestion_critical_classification() -> None:
    level = congestion_service.classify_congestion(
        density=50.0,
        average_speed=12.0,
        queue_length=220.0,
    )
    assert level.value == "CRITICAL"


def test_congestion_speed_impact() -> None:
    slower = congestion_service.calculate_congestion_score(
        density=25.0,
        average_speed=18.0,
        queue_length=70.0,
    )
    faster = congestion_service.calculate_congestion_score(
        density=25.0,
        average_speed=45.0,
        queue_length=70.0,
    )
    assert slower > faster


def test_congestion_queue_impact() -> None:
    longer_queue = congestion_service.calculate_congestion_score(
        density=25.0,
        average_speed=30.0,
        queue_length=180.0,
    )
    shorter_queue = congestion_service.calculate_congestion_score(
        density=25.0,
        average_speed=30.0,
        queue_length=20.0,
    )
    assert longer_queue > shorter_queue


def test_congestion_density_impact() -> None:
    high_density = congestion_service.calculate_congestion_score(
        density=50.0,
        average_speed=30.0,
        queue_length=80.0,
    )
    low_density = congestion_service.calculate_congestion_score(
        density=10.0,
        average_speed=30.0,
        queue_length=80.0,
    )
    assert high_density > low_density


def test_congestion_boundary_values() -> None:
    assert (
        congestion_service.classify_congestion(
            density=20.0,
            average_speed=35.0,
            queue_length=50.0,
        ).value
        == "CONGESTED"
    )
    assert (
        congestion_service.classify_congestion(
            density=40.0,
            average_speed=20.0,
            queue_length=150.0,
        ).value
        == "CRITICAL"
    )


def test_congestion_alert_creation_and_history_api(client: TestClient) -> None:
    junction_id = create_junction(client)
    create_traffic(client, junction_id, "NORTH", 120, 28, 90)
    create_traffic(client, junction_id, "SOUTH", 210, 10, 230)

    create_response = client.post(f"/api/v1/traffic/congestion/alerts/{junction_id}")
    history_response = client.get(f"/api/v1/traffic/congestion/alerts/{junction_id}")

    assert create_response.status_code == 201
    created_alerts = create_response.json()
    assert len(created_alerts) == 2
    assert all(alert["id"] for alert in created_alerts)
    assert all(alert["junction_id"] == junction_id for alert in created_alerts)
    assert {alert["direction"] for alert in created_alerts} == {"NORTH", "SOUTH"}

    assert history_response.status_code == 200
    history = history_response.json()
    assert len(history) == 2
    assert history[0]["created_at"] >= history[1]["created_at"]


def test_congestion_alert_api_invalid_junction(client: TestClient) -> None:
    response = client.post("/api/v1/traffic/congestion/alerts/not-a-valid-id")
    assert response.status_code == 400
