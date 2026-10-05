from pydantic import BaseModel, ConfigDict
from typing import Optional

class CurrentStockItem(BaseModel):
    item_id: int
    item_code: str
    item_name: str
    category: str
    warehouse_id: int
    warehouse_name: str
    current_qty: float
    uom: str
    reorder_level: float
    unit_cost: float
    total_value: float
    status: str  # "Healthy" | "Low Stock" | "Critical"

    model_config = ConfigDict(from_attributes=True)

class AvailableStockResponse(BaseModel):
    item_id: int
    warehouse_id: int
    total_stock_in: float
    total_stock_out: float
    available_stock: float
