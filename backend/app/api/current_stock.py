from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas.current_stock import CurrentStockItem, AvailableStockResponse
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/current-stock", tags=["Current Stock"])

@router.get("", response_model=List[CurrentStockItem])
def get_current_stock(
    item_id: Optional[int] = Query(None, description="Filter by item ID"),
    warehouse_id: Optional[int] = Query(None, description="Filter by warehouse ID"),
    category: Optional[str] = Query(None, description="Filter by item category"),
    db: Session = Depends(get_db)
):
    return InventoryService.get_current_stock(
        db, item_id=item_id, warehouse_id=warehouse_id, category=category
    )

@router.get("/available", response_model=AvailableStockResponse)
def get_available_stock(
    item_id: int = Query(..., gt=0),
    warehouse_id: int = Query(..., gt=0),
    db: Session = Depends(get_db)
):
    return InventoryService.get_available_stock(db, item_id=item_id, warehouse_id=warehouse_id)

@router.get("/export")
def export_current_stock_csv(
    item_id: Optional[int] = Query(None),
    warehouse_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    csv_content = InventoryService.export_current_stock_csv(
        db, item_id=item_id, warehouse_id=warehouse_id, category=category
    )
    headers = {
        "Content-Disposition": "attachment; filename=current-stock.csv"
    }
    return Response(content=csv_content, media_type="text/csv", headers=headers)
