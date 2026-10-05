from pydantic import BaseModel
from typing import List
from app.schemas.stock_in import StockInResponse
from app.schemas.stock_out import StockOutResponse

class DashboardSummary(BaseModel):
    total_items: int
    active_items: int
    total_warehouses: int
    total_current_stock: float
    low_stock_items_count: int
    critical_stock_items_count: int
    recent_stock_ins: List[StockInResponse]
    recent_stock_outs: List[StockOutResponse]
