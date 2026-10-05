from datetime import date
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.repositories.inventory_repository import InventoryRepository
from app.schemas.item import ItemCreate
from app.schemas.warehouse import WarehouseCreate
from app.schemas.stock_in import StockInCreate
from app.schemas.stock_out import StockOutCreate
from app.services.inventory_service import InventoryService

def seed_database():
    db: Session = SessionLocal()
    try:
        print("Seeding initial ERP data...")
        
        # Check if items already exist
        existing_items = InventoryRepository.get_items(db)
        if existing_items:
            print("Database already contains item data. Skipping seed.")
            return

        # 1. Create Items
        items_data = [
            ItemCreate(code="FAB-COT-001", name="Combed Cotton Jersey 180GSM", category="Fabric", uom="Meter", unit_cost=4.50, reorder_level=500.0, is_active=True),
            ItemCreate(code="FAB-DEN-002", name="Indigo Denim Fabric 12oz", category="Fabric", uom="Meter", unit_cost=7.20, reorder_level=300.0, is_active=True),
            ItemCreate(code="FAB-PLY-003", name="Polyester Chiffon Printed", category="Fabric", uom="Meter", unit_cost=3.80, reorder_level=200.0, is_active=True),
            ItemCreate(code="YRN-COT-30S", name="30/1 Combed Cotton Yarn", category="Yarn", uom="Kg", unit_cost=5.10, reorder_level=150.0, is_active=True),
            ItemCreate(code="YRN-PLY-150", name="150D Polyester Filament Yarn", category="Yarn", uom="Kg", unit_cost=3.20, reorder_level=100.0, is_active=True),
            ItemCreate(code="TRM-ZIP-001", name="YKK #5 Metal Zipper 20cm", category="Trim", uom="Piece", unit_cost=0.45, reorder_level=1000.0, is_active=True),
            ItemCreate(code="TRM-BTN-002", name="Resin Horn Buttons 18L", category="Trim", uom="Piece", unit_cost=0.08, reorder_level=5000.0, is_active=True),
            ItemCreate(code="ACC-LBL-001", name="Woven Main Brand Label", category="Accessory", uom="Piece", unit_cost=0.05, reorder_level=2000.0, is_active=True),
            ItemCreate(code="ACC-THD-002", name="40/2 Spun Polyester Thread Cone", category="Accessory", uom="Cone", unit_cost=1.80, reorder_level=50.0, is_active=True),
        ]
        created_items = {}
        for item_in in items_data:
            created = InventoryService.create_item(db, item_in)
            created_items[created.code] = created
            print(f"Created Item: {created.code} - {created.name}")

        # 2. Create Warehouses
        warehouses_data = [
            WarehouseCreate(name="Main Fabric Store", location="Block A - Ground Floor", is_active=True),
            WarehouseCreate(name="Yarn & Accessories Depot", location="Block B - Mezzanine", is_active=True),
            WarehouseCreate(name="Cutting & Trims Store", location="Block C - Floor 1", is_active=True),
        ]
        created_whs = {}
        for wh_in in warehouses_data:
            created = InventoryService.create_warehouse(db, wh_in)
            created_whs[created.name] = created
            print(f"Created Warehouse: {created.name}")

        today = date.today()

        # 3. Create Stock In Transactions
        stock_ins = [
            StockInCreate(item_id=created_items["FAB-COT-001"].id, warehouse_id=created_whs["Main Fabric Store"].id, qty=1200.0, date=today, supplier_reference="INV-2026-001", remarks="Initial batch delivery from TexFab Ltd"),
            StockInCreate(item_id=created_items["FAB-DEN-002"].id, warehouse_id=created_whs["Main Fabric Store"].id, qty=800.0, date=today, supplier_reference="INV-2026-002", remarks="High grade denim roll batch"),
            StockInCreate(item_id=created_items["FAB-PLY-003"].id, warehouse_id=created_whs["Main Fabric Store"].id, qty=150.0, date=today, supplier_reference="INV-2026-003", remarks="Sample roll shipment"),
            StockInCreate(item_id=created_items["YRN-COT-30S"].id, warehouse_id=created_whs["Yarn & Accessories Depot"].id, qty=400.0, date=today, supplier_reference="INV-2026-004", remarks="Spinning mill yarn delivery"),
            StockInCreate(item_id=created_items["TRM-BTN-002"].id, warehouse_id=created_whs["Cutting & Trims Store"].id, qty=8000.0, date=today, supplier_reference="INV-2026-005", remarks="Bulk button box delivery"),
            StockInCreate(item_id=created_items["ACC-THD-002"].id, warehouse_id=created_whs["Yarn & Accessories Depot"].id, qty=120.0, date=today, supplier_reference="INV-2026-006", remarks="Sewing thread cones"),
        ]
        for si in stock_ins:
            InventoryService.process_stock_in(db, si)
            print(f"Recorded Stock In for Item ID {si.item_id}, Qty: {si.qty}")

        # 4. Create Stock Out Transactions (within available limits)
        stock_outs = [
            StockOutCreate(item_id=created_items["FAB-COT-001"].id, warehouse_id=created_whs["Main Fabric Store"].id, qty=350.0, date=today, remarks="Issued to Cutting Order #PO-4501"),
            StockOutCreate(item_id=created_items["TRM-BTN-002"].id, warehouse_id=created_whs["Cutting & Trims Store"].id, qty=1200.0, date=today, remarks="Issued to Assembly Floor #PO-4501"),
        ]
        for so in stock_outs:
            InventoryService.process_stock_out(db, so)
            print(f"Recorded Stock Out for Item ID {so.item_id}, Qty: {so.qty}")

        print("Seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
