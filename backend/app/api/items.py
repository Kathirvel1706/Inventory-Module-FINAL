from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas.item import ItemCreate, ItemResponse
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/items", tags=["Items"])

@router.get("", response_model=List[ItemResponse])
def list_items(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by code or name"),
    db: Session = Depends(get_db)
):
    return InventoryService.get_items(db, category=category, search=search)

@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    item_in: ItemCreate,
    db: Session = Depends(get_db)
):
    return InventoryService.create_item(db, item_in)
