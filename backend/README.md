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

MongoDB connection and basic database operations are also configured.

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