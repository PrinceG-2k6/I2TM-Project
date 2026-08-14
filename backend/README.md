# Adaptive Signal Intelligence — Backend

## Project Setup

adaptive-signal-intelligence/
├── backend/
│   ├── app/
│   ├── tests/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   └── README.md
└── docker-compose.yml

## Tech Stack

- Python 3.13
- FastAPI
- MongoDB
- PyMongo
- Pydantic
- Pytest
- Docker
- Docker Compose

## Completed

### Task 1 — Backend Foundation

Created the basic FastAPI backend structure with:

- Controllers
- Database
- Models
- Routes
- Schemas
- Services
- Simulation
- ML
- Utils
- Configuration
- FastAPI entry point

### Task 2 — Junction + Traffic APIs

Implemented Junction APIs:

- `POST /api/v1/junctions`
- `GET /api/v1/junctions`
- `GET /api/v1/junctions/{id}`
- `PUT /api/v1/junctions/{id}`
- `DELETE /api/v1/junctions/{id}`

Implemented Traffic APIs:

- `POST /api/v1/traffic`
- `GET /api/v1/traffic/current/{junction_id}`
- `GET /api/v1/traffic/history/{junction_id}`
- `GET /api/v1/traffic/density/{junction_id}`
- `POST /api/v1/traffic/congestion/alerts/{junction_id}`
- `GET /api/v1/traffic/congestion/alerts/{junction_id}`

MongoDB connection and basic database operations are also configured.

### Task 4 — Traffic Density

- Direction-aware density snapshot for each junction using latest observation per direction.
- Density formula: `vehicle_count / lanes`.
- Density levels:
  - LOW: `< 20`
  - MEDIUM: `>= 20` and `< 40`
  - HIGH: `>= 40`

### Task 5 — Congestion Detection

- Congestion score combines density, speed, and queue length:
  - `score = 0.40*density_score + 0.35*speed_score + 0.25*queue_score`
- Congestion levels:
  - WARNING: `< 1.9`
  - CONGESTED: `>= 1.9` and `< 2.6`
  - CRITICAL: `>= 2.6`
- Alert history is persisted in MongoDB collection `congestion_alerts`.

## Docker Setup

Docker is configured for the backend and MongoDB.

Backend:

- Python 3.13
- FastAPI
- Uvicorn

Database:

- MongoDB 8

Start the project:

```bash
docker compose up --build