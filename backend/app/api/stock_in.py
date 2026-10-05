from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas.stock_in import StockInCreate, StockInResponse
from app.services.inventory_service import InventoryService
from app.repositories.inventory_repository import InventoryRepository

router = APIRouter(prefix="/stock-in", tags=["Stock In"])

@router.post("", response_model=StockInResponse, status_code=status.HTTP_201_CREATED)
def create_stock_in(
    stock_in_data: StockInCreate,
    db: Session = Depends(get_db)
):
    return InventoryService.process_stock_in(db, stock_in_data)

@router.get("", response_model=List[StockInResponse])
def get_stock_ins(
    item_id: Optional[int] = Query(None),
    warehouse_id: Optional[int] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    db_records = InventoryRepository.get_stock_ins(db, item_id=item_id, warehouse_id=warehouse_id, limit=limit)
    return [StockInResponse.model_validate(rec) for rec in db_records]
