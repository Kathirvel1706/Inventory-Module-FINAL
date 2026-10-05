from fastapi import APIRouter
from app.api.items import router as items_router
from app.api.warehouses import router as warehouses_router
from app.api.stock_in import router as stock_in_router
from app.api.stock_out import router as stock_out_router
from app.api.current_stock import router as current_stock_router
from app.api.dashboard import router as dashboard_router

api_router = APIRouter()

api_router.include_router(dashboard_router)
api_router.include_router(items_router)
api_router.include_router(warehouses_router)
api_router.include_router(stock_in_router)
api_router.include_router(stock_out_router)
api_router.include_router(current_stock_router)
