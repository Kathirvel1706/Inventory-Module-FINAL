from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
import csv
import io

from app.repositories.inventory_repository import InventoryRepository
from app.schemas.item import ItemCreate, ItemUpdate, ItemResponse
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseResponse
from app.schemas.stock_in import StockInCreate, StockInResponse
from app.schemas.stock_out import StockOutCreate, StockOutResponse
from app.schemas.current_stock import CurrentStockItem, AvailableStockResponse
from app.schemas.dashboard import DashboardSummary

class InventoryService:

    @staticmethod
    def create_item(db: Session, item_in: ItemCreate) -> ItemResponse:
        existing = InventoryRepository.get_item_by_code(db, item_in.code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item code '{item_in.code}' already exists."
            )
        db_item = InventoryRepository.create_item(db, item_in)
        return ItemResponse.model_validate(db_item)

    @staticmethod
    def get_items(db: Session, category: Optional[str] = None, search: Optional[str] = None) -> List[ItemResponse]:
        items = InventoryRepository.get_items(db, category=category, search=search)
        return [ItemResponse.model_validate(itm) for itm in items]

    @staticmethod
    def create_warehouse(db: Session, wh_in: WarehouseCreate) -> WarehouseResponse:
        existing = InventoryRepository.get_warehouse_by_name(db, wh_in.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Warehouse with name '{wh_in.name}' already exists."
            )
        db_wh = InventoryRepository.create_warehouse(db, wh_in)
        return WarehouseResponse.model_validate(db_wh)

    @staticmethod
    def get_warehouses(db: Session, search: Optional[str] = None) -> List[WarehouseResponse]:
        warehouses = InventoryRepository.get_warehouses(db, search=search)
        return [WarehouseResponse.model_validate(wh) for wh in warehouses]

    @staticmethod
    def get_available_stock(db: Session, item_id: int, warehouse_id: int) -> AvailableStockResponse:
        item = InventoryRepository.get_item_by_id(db, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        wh = InventoryRepository.get_warehouse_by_id(db, warehouse_id)
        if not wh:
            raise HTTPException(status_code=404, detail="Warehouse not found")

        # Total in
        total_in = InventoryRepository.get_available_stock(db, item_id, warehouse_id)
        # Re-calc stock in and stock out breakdown
        stock_ins = InventoryRepository.get_stock_ins(db, item_id=item_id, warehouse_id=warehouse_id, limit=10000)
        stock_outs = InventoryRepository.get_stock_outs(db, item_id=item_id, warehouse_id=warehouse_id, limit=10000)

        tot_in = sum(si.qty for si in stock_ins)
        tot_out = sum(so.qty for so in stock_outs)
        avail = tot_in - tot_out

        return AvailableStockResponse(
            item_id=item_id,
            warehouse_id=warehouse_id,
            total_stock_in=tot_in,
            total_stock_out=tot_out,
            available_stock=max(0.0, avail)
        )

    @staticmethod
    def process_stock_in(db: Session, stock_in_data: StockInCreate) -> StockInResponse:
        item = InventoryRepository.get_item_by_id(db, stock_in_data.item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with ID {stock_in_data.item_id} does not exist."
            )
        if not item.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot record Stock In for inactive item '{item.name}'."
            )

        wh = InventoryRepository.get_warehouse_by_id(db, stock_in_data.warehouse_id)
        if not wh:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Warehouse with ID {stock_in_data.warehouse_id} does not exist."
            )
        if not wh.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot record Stock In for inactive warehouse '{wh.name}'."
            )

        db_stock_in = InventoryRepository.create_stock_in(db, stock_in_data)
        return StockInResponse.model_validate(db_stock_in)

    @staticmethod
    def process_stock_out(db: Session, stock_out_data: StockOutCreate) -> StockOutResponse:
        item = InventoryRepository.get_item_by_id(db, stock_out_data.item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with ID {stock_out_data.item_id} does not exist."
            )
        wh = InventoryRepository.get_warehouse_by_id(db, stock_out_data.warehouse_id)
        if not wh:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Warehouse with ID {stock_out_data.warehouse_id} does not exist."
            )

        # CRITICAL BUSINESS RULE ENFORCEMENT
        available_qty = InventoryRepository.get_available_stock(
            db, item_id=stock_out_data.item_id, warehouse_id=stock_out_data.warehouse_id
        )

        if stock_out_data.qty > available_qty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock. Requested: {stock_out_data.qty} {item.uom}, Available: {available_qty} {item.uom} in '{wh.name}'."
            )

        db_stock_out = InventoryRepository.create_stock_out(db, stock_out_data)
        return StockOutResponse.model_validate(db_stock_out)

    @staticmethod
    def get_current_stock(
        db: Session,
        item_id: Optional[int] = None,
        warehouse_id: Optional[int] = None,
        category: Optional[str] = None
    ) -> List[CurrentStockItem]:
        raw_records = InventoryRepository.get_current_stock_records(
            db, item_id=item_id, warehouse_id=warehouse_id, category=category
        )
        return [CurrentStockItem(**rec) for rec in raw_records]

    @staticmethod
    def export_current_stock_csv(
        db: Session,
        item_id: Optional[int] = None,
        warehouse_id: Optional[int] = None,
        category: Optional[str] = None
    ) -> str:
        records = InventoryRepository.get_current_stock_records(
            db, item_id=item_id, warehouse_id=warehouse_id, category=category
        )
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header required fields:
        # Item Code, Item Name, Category, Warehouse, Current Qty, UOM, Reorder Level
        writer.writerow([
            "Item Code", "Item Name", "Category", "Warehouse", "Current Qty", "UOM", "Reorder Level"
        ])
        
        for r in records:
            writer.writerow([
                r["item_code"],
                r["item_name"],
                r["category"],
                r["warehouse_name"],
                r["current_qty"],
                r["uom"],
                r["reorder_level"]
            ])
            
        return output.getvalue()

    @staticmethod
    def get_dashboard_summary(db: Session) -> DashboardSummary:
        items = InventoryRepository.get_items(db)
        warehouses = InventoryRepository.get_warehouses(db)
        
        total_items = len(items)
        active_items = len([i for i in items if i.is_active])
        total_warehouses = len(warehouses)
        
        stock_records = InventoryRepository.get_current_stock_records(db)
        
        total_current_stock = sum(r["current_qty"] for r in stock_records)
        low_stock_count = len([r for r in stock_records if r["status"] == "Low Stock"])
        critical_stock_count = len([r for r in stock_records if r["status"] == "Critical"])
        
        recent_ins = InventoryRepository.get_stock_ins(db, limit=5)
        recent_outs = InventoryRepository.get_stock_outs(db, limit=5)
        
        return DashboardSummary(
            total_items=total_items,
            active_items=active_items,
            total_warehouses=total_warehouses,
            total_current_stock=round(total_current_stock, 2),
            low_stock_items_count=low_stock_count,
            critical_stock_items_count=critical_stock_count,
            recent_stock_ins=[StockInResponse.model_validate(si) for si in recent_ins],
            recent_stock_outs=[StockOutResponse.model_validate(so) for so in recent_outs]
        )
