from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas.stock_out import StockOutCreate, StockOutResponse
from app.services.inventory_service import InventoryService
from app.repositories.inventory_repository import InventoryRepository

router = APIRouter(prefix="/stock-out", tags=["Stock Out"])

@router.post("", response_model=StockOutResponse, status_code=status.HTTP_201_CREATED)
def create_stock_out(
    stock_out_data: StockOutCreate,
    db: Session = Depends(get_db)
):
    return InventoryService.process_stock_out(db, stock_out_data)

@router.get("", response_model=List[StockOutResponse])
def get_stock_outs(
    item_id: Optional[int] = Query(None),
    warehouse_id: Optional[int] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    db_records = InventoryRepository.get_stock_outs(db, item_id=item_id, warehouse_id=warehouse_id, limit=limit)
    return [StockOutResponse.model_validate(rec) for rec in db_records]
