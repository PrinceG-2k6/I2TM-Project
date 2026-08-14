# Adaptive Signal Intelligence Backend

FastAPI backend for managing traffic junctions and traffic observations for an
adaptive signal intelligence system. The service stores data in MongoDB and
exposes REST APIs under `/api/v1`.

## Tech Stack

- Python
- FastAPI
- MongoDB
- PyMongo
- Pydantic
- Pytest

## Project Structure

```text
backend/
+-- app/
|   +-- controllers/     # HTTP error handling and controller layer
|   +-- database/        # MongoDB connection helpers
|   +-- models/          # MongoDB document builders
|   +-- routes/          # FastAPI route definitions
|   +-- schemas/         # Pydantic request/response schemas
|   +-- services/        # Business logic and persistence operations
|   +-- config.py        # Application settings
|   +-- main.py          # FastAPI app entry point
+-- tests/               # API tests
+-- requirements.txt
+-- README.md
```

## Requirements

- Python 3.11+
- MongoDB running locally or available through a connection URI

## Setup

Create and activate a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a local `.env` file:

```bash
cp .env.example .env
```

Example configuration:

```env
APP_NAME=Adaptive Signal Intelligence
API_V1_PREFIX=/api/v1
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=adaptive_signal_intelligence
CORS_ORIGINS=["http://localhost:5173"]
```

## Run

Start the API server:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API docs:

```text
http://127.0.0.1:8000/docs
```

## API Endpoints

### Health

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/health` | Check API health |

### Junctions

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/junctions` | Create a junction |
| GET | `/api/v1/junctions` | List all junctions |
| GET | `/api/v1/junctions/{junction_id}` | Get a junction by ID |
| PUT | `/api/v1/junctions/{junction_id}` | Update a junction |
| DELETE | `/api/v1/junctions/{junction_id}` | Delete a junction |

Create junction payload:

```json
{
  "name": "Junction A",
  "latitude": 21.1458,
  "longitude": 79.0882,
  "roads": ["Main Road", "Airport Road", "Station Road", "Ring Road"],
  "lanes": 4,
  "status": "ACTIVE"
}
```

### Traffic Observations

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/traffic` | Create a traffic observation |
| GET | `/api/v1/traffic/current/{junction_id}` | Get latest traffic for a junction |
| GET | `/api/v1/traffic/history/{junction_id}` | Get traffic history for a junction |

Create traffic observation payload:

```json
{
  "junction_id": "64f1a8f7e4b0c2a1d9e8f123",
  "vehicle_count": 128,
  "cars": 72,
  "motorcycles": 43,
  "buses": 5,
  "trucks": 8,
  "average_speed": 18,
  "queue_length": 120
}
```

## Testing

Run the test suite:

```bash
pytest
```

The tests use fake in-memory collections, so MongoDB is not required for the
current test suite.

## Git Notes

This backend directory is part of the parent repository:

```text
adaptive-signal-intelligence/
+-- backend/
```

Local files such as `.env`, `venv/`, `.pytest_cache/`, and `__pycache__/` are
ignored by the parent `.gitignore`.
