import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_items_api():
    # 1. Create item
    item_payload = {
        "code": "TEST-FAB-999",
        "name": "Test Silk Fabric",
        "category": "Fabric",
        "uom": "Meter",
        "unit_cost": 12.50,
        "reorder_level": 100.0,
        "is_active": True
    }
    response = client.post("/items", json=item_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["code"] == "TEST-FAB-999"
    item_id = data["id"]

    # 2. Get items list
    response = client.get("/items")
    assert response.status_code == 200
    items = response.json()
    assert any(i["id"] == item_id for i in items)

def test_warehouses_api():
    wh_payload = {
        "name": "Test Finishing Warehouse",
        "location": "Building D - Room 101",
        "is_active": True
    }
    response = client.post("/warehouses", json=wh_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Finishing Warehouse"

def test_negative_stock_rejection():
    # Fetch item and warehouse
    items = client.get("/items").json()
    whs = client.get("/warehouses").json()
    
    item_id = items[0]["id"]
    wh_id = whs[0]["id"]

    # Try to issue an impossible quantity (e.g. 9999999 units)
    stock_out_payload = {
        "item_id": item_id,
        "warehouse_id": wh_id,
        "qty": 9999999.0,
        "date": "2026-10-05",
        "remarks": "Invalid test attempt"
    }
    response = client.post("/stock-out", json=stock_out_payload)
    assert response.status_code == 400
    assert "Insufficient stock" in response.json()["detail"]

def test_dashboard_api():
    response = client.get("/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "total_items" in data
    assert "total_warehouses" in data
    assert "total_current_stock" in data

def test_csv_export():
    response = client.get("/current-stock/export")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "Item Code,Item Name,Category,Warehouse,Current Qty,UOM,Reorder Level" in response.text
