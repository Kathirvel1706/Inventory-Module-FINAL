export type ItemCategory = 'Fabric' | 'Yarn' | 'Trim' | 'Accessory';

export interface Item {
  id: number;
  code: string;
  name: string;
  category: ItemCategory;
  uom: string;
  unit_cost: number;
  reorder_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemCreatePayload {
  code: string;
  name: string;
  category: ItemCategory;
  uom: string;
  unit_cost: number;
  reorder_level: number;
  is_active: boolean;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WarehouseCreatePayload {
  name: string;
  location: string;
  is_active: boolean;
}

export interface StockIn {
  id: number;
  item_id: number;
  warehouse_id: number;
  qty: number;
  date: string;
  supplier_reference: string;
  remarks?: string;
  created_at: string;
  item?: Item;
  warehouse?: Warehouse;
}

export interface StockInCreatePayload {
  item_id: number;
  warehouse_id: number;
  qty: number;
  date: string;
  supplier_reference: string;
  remarks?: string;
}

export interface StockOut {
  id: number;
  item_id: number;
  warehouse_id: number;
  qty: number;
  date: string;
  remarks?: string;
  created_at: string;
  item?: Item;
  warehouse?: Warehouse;
}

export interface StockOutCreatePayload {
  item_id: number;
  warehouse_id: number;
  qty: number;
  date: string;
  remarks?: string;
}

export type StockStatus = 'Healthy' | 'Low Stock' | 'Critical';

export interface CurrentStockItem {
  item_id: number;
  item_code: string;
  item_name: string;
  category: ItemCategory;
  warehouse_id: number;
  warehouse_name: string;
  current_qty: number;
  uom: string;
  reorder_level: number;
  unit_cost: number;
  total_value: number;
  status: StockStatus;
}

export interface AvailableStockResponse {
  item_id: number;
  warehouse_id: number;
  total_stock_in: number;
  total_stock_out: number;
  available_stock: number;
}

export interface DashboardSummary {
  total_items: number;
  active_items: number;
  total_warehouses: number;
  total_current_stock: number;
  low_stock_items_count: number;
  critical_stock_items_count: number;
  recent_stock_ins: StockIn[];
  recent_stock_outs: StockOut[];
}
