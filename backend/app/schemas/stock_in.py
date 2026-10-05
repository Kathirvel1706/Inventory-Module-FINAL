from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import date as DateType, datetime
from typing import Optional
from app.schemas.item import ItemResponse
from app.schemas.warehouse import WarehouseResponse

class StockInCreate(BaseModel):
    item_id: int = Field(..., gt=0, description="ID of the item")
    warehouse_id: int = Field(..., gt=0, description="ID of the warehouse")
    qty: float = Field(..., gt=0.0, description="Quantity received (must be > 0)")
    date: DateType = Field(..., description="Transaction date")
    supplier_reference: str = Field(..., min_length=1, max_length=200, description="Supplier reference / Invoice #")
    remarks: Optional[str] = Field(None, max_length=500, description="Optional remarks")

    @field_validator("supplier_reference")
    @classmethod
    def validate_supplier_ref(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Supplier reference is required")
        return v

class StockInResponse(BaseModel):
    id: int
    item_id: int
    warehouse_id: int
    qty: float
    date: DateType
    supplier_reference: str
    remarks: Optional[str] = None
    created_at: datetime
    item: Optional[ItemResponse] = None
    warehouse: Optional[WarehouseResponse] = None

    model_config = ConfigDict(from_attributes=True)
