from typing import List, Optional

from fastapi import HTTPException
from pymongo.collection import Collection

from app.database.connection import get_equipment_collection
from app.models.equipment_model import build_equipment_document, build_equipment_update_document
from app.schemas.equipment_schema import EquipmentCreate, EquipmentResponse, EquipmentUpdate


def get_all_equipment(
    junction_id: Optional[str] = None,
    device_type: Optional[str] = None,
    collection: Collection = None
) -> List[dict]:
    if collection is None:
        collection = get_equipment_collection()
    
    query = {}
    if junction_id:
        query["junction_id"] = junction_id
    if device_type:
        query["device_type"] = device_type
        
    cursor = collection.find(query).sort("created_at", -1)
    results = []
    for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        results.append(doc)
    return results


def create_equipment(equipment_data: EquipmentCreate, collection: Collection = None) -> dict:
    if collection is None:
        collection = get_equipment_collection()
        
    # Check if device_id already exists
    if collection.find_one({"device_id": equipment_data.device_id}):
        raise HTTPException(status_code=400, detail="Equipment with this device_id already exists")
        
    doc = build_equipment_document(equipment_data.model_dump())
    result = collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc
