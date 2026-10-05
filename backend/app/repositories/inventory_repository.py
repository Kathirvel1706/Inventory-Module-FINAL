from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func, and_, or_
from typing import List, Optional, Tuple
from app.models.item import Item
from app.models.warehouse import Warehouse
from app.models.stock_in import StockIn
from app.models.stock_out import StockOut
from app.schemas.item import ItemCreate, ItemUpdate
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate
from app.schemas.stock_in import StockInCreate
from app.schemas.stock_out import StockOutCreate

class InventoryRepository:

    # --- ITEM CRUD ---
    @staticmethod
    def get_items(db: Session, category: Optional[str] = None, search: Optional[str] = None) -> List[Item]:
        query = select(Item)
        if category:
            query = query.where(Item.category == category)
        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.where(or_(Item.code.ilike(search_pattern), Item.name.ilike(search_pattern)))
        query = query.order_by(Item.id.desc())
        return list(db.scalars(query).all())

    @staticmethod
    def get_item_by_id(db: Session, item_id: int) -> Optional[Item]:
        return db.scalar(select(Item).where(Item.id == item_id))

    @staticmethod
    def get_item_by_code(db: Session, code: str) -> Optional[Item]:
        return db.scalar(select(Item).where(Item.code == code.upper().strip()))

    @staticmethod
    def create_item(db: Session, item_in: ItemCreate) -> Item:
        db_item = Item(
            code=item_in.code,
            name=item_in.name,
            category=item_in.category,
            uom=item_in.uom,
            unit_cost=item_in.unit_cost,
            reorder_level=item_in.reorder_level,
            is_active=item_in.is_active
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    # --- WAREHOUSE CRUD ---
    @staticmethod
    def get_warehouses(db: Session, search: Optional[str] = None) -> List[Warehouse]:
        query = select(Warehouse)
        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.where(or_(Warehouse.name.ilike(search_pattern), Warehouse.location.ilike(search_pattern)))
        query = query.order_by(Warehouse.id.desc())
        return list(db.scalars(query).all())

    @staticmethod
    def get_warehouse_by_id(db: Session, warehouse_id: int) -> Optional[Warehouse]:
        return db.scalar(select(Warehouse).where(Warehouse.id == warehouse_id))

    @staticmethod
    def get_warehouse_by_name(db: Session, name: str) -> Optional[Warehouse]:
        return db.scalar(select(Warehouse).where(Warehouse.name == name.strip()))

    @staticmethod
    def create_warehouse(db: Session, warehouse_in: WarehouseCreate) -> Warehouse:
        db_wh = Warehouse(
            name=warehouse_in.name,
            location=warehouse_in.location,
            is_active=warehouse_in.is_active
        )
        db.add(db_wh)
        db.commit()
        db.refresh(db_wh)
        return db_wh

    # --- STOCK CALCULATIONS ---
    @staticmethod
    def get_available_stock(db: Session, item_id: int, warehouse_id: int) -> float:
        """Calculate total_stock_in - total_stock_out for a specific item and warehouse."""
        total_in = db.scalar(
            select(func.coalesce(func.sum(StockIn.qty), 0.0))
            .where(and_(StockIn.item_id == item_id, StockIn.warehouse_id == warehouse_id))
        ) or 0.0

        total_out = db.scalar(
            select(func.coalesce(func.sum(StockOut.qty), 0.0))
            .where(and_(StockOut.item_id == item_id, StockOut.warehouse_id == warehouse_id))
        ) or 0.0

        return float(total_in - total_out)

    # --- STOCK IN ---
    @staticmethod
    def create_stock_in(db: Session, stock_in_data: StockInCreate) -> StockIn:
        db_stock_in = StockIn(
            item_id=stock_in_data.item_id,
            warehouse_id=stock_in_data.warehouse_id,
            qty=stock_in_data.qty,
            date=stock_in_data.date,
            supplier_reference=stock_in_data.supplier_reference,
            remarks=stock_in_data.remarks
        )
        db.add(db_stock_in)
        db.commit()
        db.refresh(db_stock_in)
        # Fetch with relationships loaded
        return db.scalar(
            select(StockIn)
            .options(joinedload(StockIn.item), joinedload(StockIn.warehouse))
            .where(StockIn.id == db_stock_in.id)
        )

    @staticmethod
    def get_stock_ins(
        db: Session,
        item_id: Optional[int] = None,
        warehouse_id: Optional[int] = None,
        limit: int = 100
    ) -> List[StockIn]:
        query = select(StockIn).options(joinedload(StockIn.item), joinedload(StockIn.warehouse))
        if item_id:
            query = query.where(StockIn.item_id == item_id)
        if warehouse_id:
            query = query.where(StockIn.warehouse_id == warehouse_id)
        query = query.order_by(StockIn.date.desc(), StockIn.id.desc()).limit(limit)
        return list(db.scalars(query).all())

    # --- STOCK OUT ---
    @staticmethod
    def create_stock_out(db: Session, stock_out_data: StockOutCreate) -> StockOut:
        db_stock_out = StockOut(
            item_id=stock_out_data.item_id,
            warehouse_id=stock_out_data.warehouse_id,
            qty=stock_out_data.qty,
            date=stock_out_data.date,
            remarks=stock_out_data.remarks
        )
        db.add(db_stock_out)
        db.commit()
        db.refresh(db_stock_out)
        return db.scalar(
            select(StockOut)
            .options(joinedload(StockOut.item), joinedload(StockOut.warehouse))
            .where(StockOut.id == db_stock_out.id)
        )

    @staticmethod
    def get_stock_outs(
        db: Session,
        item_id: Optional[int] = None,
        warehouse_id: Optional[int] = None,
        limit: int = 100
    ) -> List[StockOut]:
        query = select(StockOut).options(joinedload(StockOut.item), joinedload(StockOut.warehouse))
        if item_id:
            query = query.where(StockOut.item_id == item_id)
        if warehouse_id:
            query = query.where(StockOut.warehouse_id == warehouse_id)
        query = query.order_by(StockOut.date.desc(), StockOut.id.desc()).limit(limit)
        return list(db.scalars(query).all())

    # --- CURRENT STOCK CALCULATION PER ITEM / WAREHOUSE ---
    @staticmethod
    def get_current_stock_records(
        db: Session,
        item_id: Optional[int] = None,
        warehouse_id: Optional[int] = None,
        category: Optional[str] = None
    ) -> List[dict]:
        """
        Calculates Current Stock per (Item, Warehouse) combination for which stock exists,
        or across all active item-warehouse combinations.
        Formula: Current Stock = Total Stock In - Total Stock Out
        """
        # Fetch items
        items_query = select(Item)
        if item_id:
            items_query = items_query.where(Item.id == item_id)
        if category:
            items_query = items_query.where(Item.category == category)
        items = db.scalars(items_query).all()

        # Fetch warehouses
        wh_query = select(Warehouse)
        if warehouse_id:
            wh_query = wh_query.where(Warehouse.id == warehouse_id)
        warehouses = db.scalars(wh_query).all()

        # Fetch totals per item and warehouse
        stock_ins = db.execute(
            select(StockIn.item_id, StockIn.warehouse_id, func.sum(StockIn.qty).label("total_in"))
            .group_by(StockIn.item_id, StockIn.warehouse_id)
        ).all()
        in_map = {(r.item_id, r.warehouse_id): float(r.total_in or 0.0) for r in stock_ins}

        stock_outs = db.execute(
            select(StockOut.item_id, StockOut.warehouse_id, func.sum(StockOut.qty).label("total_out"))
            .group_by(StockOut.item_id, StockOut.warehouse_id)
        ).all()
        out_map = {(r.item_id, r.warehouse_id): float(r.total_out or 0.0) for r in stock_outs}

        records = []
        for itm in items:
            for wh in warehouses:
                key = (itm.id, wh.id)
                tot_in = in_map.get(key, 0.0)
                tot_out = out_map.get(key, 0.0)
                current_qty = tot_in - tot_out

                # Only include pairs that have transaction history or if filter specifically requested item/wh
                # Or include all if no specific filter
                if tot_in > 0 or tot_out > 0 or item_id or warehouse_id:
                    status = "Healthy"
                    if current_qty <= 0:
                        status = "Critical"
                    elif current_qty <= itm.reorder_level:
                        status = "Low Stock"

                    total_val = round(current_qty * itm.unit_cost, 2)

                    records.append({
                        "item_id": itm.id,
                        "item_code": itm.code,
                        "item_name": itm.name,
                        "category": itm.category,
                        "warehouse_id": wh.id,
                        "warehouse_name": wh.name,
                        "current_qty": round(current_qty, 2),
                        "uom": itm.uom,
                        "reorder_level": itm.reorder_level,
                        "unit_cost": itm.unit_cost,
                        "total_value": total_val,
                        "status": status
                    })

        return records
