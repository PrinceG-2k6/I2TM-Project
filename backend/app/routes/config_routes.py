from fastapi import APIRouter
from app.database.seed import seed_database, get_config

router = APIRouter(prefix="/config", tags=["Configuration"])

@router.get("")
def get_dashboard_config() -> dict:
    return get_config()

@router.post("/seed")
def seed_dashboard_config() -> dict:
    return seed_database()
