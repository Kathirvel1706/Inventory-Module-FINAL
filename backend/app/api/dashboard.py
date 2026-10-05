from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.dashboard import DashboardSummary
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return InventoryService.get_dashboard_summary(db)
