from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pymongo.collection import Collection

from app.controllers import equipment_controller
from app.database.connection import get_equipment_collection
from app.schemas.equipment_schema import EquipmentCreate, EquipmentResponse

router = APIRouter(prefix="/equipment", tags=["Equipment"])


@router.get("/", response_model=List[EquipmentResponse])
def get_equipment(
    junction_id: Optional[str] = Query(None, description="Filter by junction ID"),
    device_type: Optional[str] = Query(None, description="Filter by device type (CAMERA/SIGNAL)"),
    collection: Collection = Depends(get_equipment_collection)
):
    return equipment_controller.get_all_equipment(
        junction_id=junction_id, 
        device_type=device_type, 
        collection=collection
    )


@router.post("/", response_model=EquipmentResponse, status_code=201)
def add_equipment(
    equipment_data: EquipmentCreate,
    collection: Collection = Depends(get_equipment_collection)
):
    return equipment_controller.create_equipment(equipment_data, collection)
