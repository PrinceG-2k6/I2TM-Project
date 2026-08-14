from copy import deepcopy

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient

from app.main import app
from app.services import junction_service, traffic_service


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
                self.documents[document_id] = {
                    **document,
                    **update.get("$set", {}),
                }
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

    monkeypatch.setattr(
        junction_service,
        "get_junction_collection",
        lambda: junctions,
    )
    monkeypatch.setattr(
        traffic_service,
        "get_junction_collection",
        lambda: junctions,
    )
    monkeypatch.setattr(
        traffic_service,
        "get_traffic_collection",
        lambda: traffic_observations,
    )

    return TestClient(app)


def junction_payload() -> dict:
    return {
        "name": "Junction A",
        "latitude": 21.1458,
        "longitude": 79.0882,
        "roads": ["Main Road", "Airport Road", "Station Road", "Ring Road"],
        "lanes": 4,
    }


def traffic_payload(junction_id: str) -> dict:
    return {
        "junction_id": junction_id,
        "vehicle_count": 128,
        "cars": 72,
        "motorcycles": 43,
        "buses": 5,
        "trucks": 8,
        "average_speed": 18,
        "queue_length": 120,
    }


def create_junction(client: TestClient) -> dict:
    response = client.post("/api/v1/junctions", json=junction_payload())
    assert response.status_code == 201
    return response.json()


def create_traffic_observation(client: TestClient, junction_id: str) -> dict:
    response = client.post("/api/v1/traffic", json=traffic_payload(junction_id))
    assert response.status_code == 201
    return response.json()


def test_health_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_junction(client: TestClient) -> None:
    response = client.post("/api/v1/junctions", json=junction_payload())

    assert response.status_code == 201
    data = response.json()
    assert data["id"]
    assert data["name"] == "Junction A"
    assert data["status"] == "ACTIVE"


def test_get_junction(client: TestClient) -> None:
    junction = create_junction(client)

    response = client.get(f"/api/v1/junctions/{junction['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == junction["id"]


def test_update_junction(client: TestClient) -> None:
    junction = create_junction(client)

    response = client.put(
        f"/api/v1/junctions/{junction['id']}",
        json={"name": "Updated Junction", "lanes": 6},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Junction"
    assert data["lanes"] == 6


def test_delete_junction(client: TestClient) -> None:
    junction = create_junction(client)

    delete_response = client.delete(f"/api/v1/junctions/{junction['id']}")
    get_response = client.get(f"/api/v1/junctions/{junction['id']}")

    assert delete_response.status_code == 200
    assert delete_response.json() == {"message": "Junction deleted successfully"}
    assert get_response.status_code == 404


def test_create_traffic_observation(client: TestClient) -> None:
    junction = create_junction(client)

    response = client.post("/api/v1/traffic", json=traffic_payload(junction["id"]))

    assert response.status_code == 201
    data = response.json()
    assert data["junction_id"] == junction["id"]
    assert data["vehicle_count"] == 128


def test_get_current_traffic(client: TestClient) -> None:
    junction = create_junction(client)
    create_traffic_observation(client, junction["id"])

    latest_payload = traffic_payload(junction["id"])
    latest_payload["vehicle_count"] = 150
    client.post("/api/v1/traffic", json=latest_payload)

    response = client.get(f"/api/v1/traffic/current/{junction['id']}")

    assert response.status_code == 200
    assert response.json()["vehicle_count"] == 150


def test_get_traffic_history(client: TestClient) -> None:
    junction = create_junction(client)
    create_traffic_observation(client, junction["id"])
    create_traffic_observation(client, junction["id"])

    response = client.get(f"/api/v1/traffic/history/{junction['id']}")

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_invalid_junction(client: TestClient) -> None:
    invalid_id_response = client.get("/api/v1/junctions/not-a-valid-id")
    missing_id_response = client.post(
        "/api/v1/traffic",
        json=traffic_payload(str(ObjectId())),
    )

    assert invalid_id_response.status_code == 400
    assert missing_id_response.status_code == 404


def test_negative_traffic_values(client: TestClient) -> None:
    junction = create_junction(client)
    payload = traffic_payload(junction["id"])
    payload["vehicle_count"] = -1

    response = client.post("/api/v1/traffic", json=payload)

    assert response.status_code == 422
