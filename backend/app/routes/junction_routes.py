from fastapi import APIRouter, status

from app.controllers import junction_controller
from app.schemas.junction_schema import (
    JunctionCreate,
    JunctionDeleteResponse,
    JunctionResponse,
    JunctionUpdate,
)


router = APIRouter(prefix="/junctions", tags=["Junctions"])


@router.post(
    "",
    response_model=JunctionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_junction(junction: JunctionCreate) -> dict:
    return junction_controller.create_junction(junction)


@router.get("", response_model=list[JunctionResponse])
def get_all_junctions() -> list[dict]:
    return junction_controller.get_all_junctions()


@router.get("/{junction_id}", response_model=JunctionResponse)
def get_junction(junction_id: str) -> dict:
    return junction_controller.get_junction(junction_id)


@router.put("/{junction_id}", response_model=JunctionResponse)
def update_junction(junction_id: str, junction: JunctionUpdate) -> dict:
    return junction_controller.update_junction(junction_id, junction)


@router.delete("/{junction_id}", response_model=JunctionDeleteResponse)
def delete_junction(junction_id: str) -> dict:
    return junction_controller.delete_junction(junction_id)
