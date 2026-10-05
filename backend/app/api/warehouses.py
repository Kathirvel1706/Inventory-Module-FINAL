from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas.warehouse import WarehouseCreate, WarehouseResponse
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])

@router.get("", response_model=List[WarehouseResponse])
def list_warehouses(
    search: Optional[str] = Query(None, description="Search by name or location"),
    db: Session = Depends(get_db)
):
    return InventoryService.get_warehouses(db, search=search)

@router.post("", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
def create_warehouse(
    warehouse_in: WarehouseCreate,
    db: Session = Depends(get_db)
):
    return InventoryService.create_warehouse(db, warehouse_in)
