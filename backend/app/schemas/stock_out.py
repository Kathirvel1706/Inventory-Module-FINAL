from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import date as DateType, datetime
from typing import Optional
from app.schemas.item import ItemResponse
from app.schemas.warehouse import WarehouseResponse

class StockOutCreate(BaseModel):
    item_id: int = Field(..., gt=0, description="ID of the item")
    warehouse_id: int = Field(..., gt=0, description="ID of the warehouse")
    qty: float = Field(..., gt=0.0, description="Quantity issued (must be > 0)")
    date: DateType = Field(..., description="Transaction date")
    remarks: Optional[str] = Field(None, max_length=500, description="Optional remarks")

class StockOutResponse(BaseModel):
    id: int
    item_id: int
    warehouse_id: int
    qty: float
    date: DateType
    remarks: Optional[str] = None
    created_at: datetime
    item: Optional[ItemResponse] = None
    warehouse: Optional[WarehouseResponse] = None

    model_config = ConfigDict(from_attributes=True)
