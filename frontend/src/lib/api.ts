import {
  Item,
  ItemCreatePayload,
  Warehouse,
  WarehouseCreatePayload,
  StockIn,
  StockInCreatePayload,
  StockOut,
  StockOutCreatePayload,
  CurrentStockItem,
  AvailableStockResponse,
  DashboardSummary,
} from '@/types/inventory';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorDetail = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorDetail = errorData.detail.map((err: { msg?: string }) => err.msg || JSON.stringify(err)).join(', ');
        }
      }
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  // Items
  getItems: async (category?: string, search?: string): Promise<Item[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/items${query}`, { cache: 'no-store' });
    return handleResponse<Item[]>(res);
  },

  createItem: async (payload: ItemCreatePayload): Promise<Item> => {
    const res = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Item>(res);
  },

  // Warehouses
  getWarehouses: async (search?: string): Promise<Warehouse[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/warehouses${query}`, { cache: 'no-store' });
    return handleResponse<Warehouse[]>(res);
  },

  createWarehouse: async (payload: WarehouseCreatePayload): Promise<Warehouse> => {
    const res = await fetch(`${API_BASE_URL}/warehouses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Warehouse>(res);
  },

  // Stock In
  createStockIn: async (payload: StockInCreatePayload): Promise<StockIn> => {
    const res = await fetch(`${API_BASE_URL}/stock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<StockIn>(res);
  },

  getStockIns: async (itemId?: number, warehouseId?: number): Promise<StockIn[]> => {
    const params = new URLSearchParams();
    if (itemId) params.append('item_id', itemId.toString());
    if (warehouseId) params.append('warehouse_id', warehouseId.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/stock-in${query}`, { cache: 'no-store' });
    return handleResponse<StockIn[]>(res);
  },

  // Stock Out
  createStockOut: async (payload: StockOutCreatePayload): Promise<StockOut> => {
    const res = await fetch(`${API_BASE_URL}/stock-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<StockOut>(res);
  },

  getStockOuts: async (itemId?: number, warehouseId?: number): Promise<StockOut[]> => {
    const params = new URLSearchParams();
    if (itemId) params.append('item_id', itemId.toString());
    if (warehouseId) params.append('warehouse_id', warehouseId.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/stock-out${query}`, { cache: 'no-store' });
    return handleResponse<StockOut[]>(res);
  },

  // Current Stock
  getCurrentStock: async (itemId?: number, warehouseId?: number, category?: string): Promise<CurrentStockItem[]> => {
    const params = new URLSearchParams();
    if (itemId) params.append('item_id', itemId.toString());
    if (warehouseId) params.append('warehouse_id', warehouseId.toString());
    if (category) params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/current-stock${query}`, { cache: 'no-store' });
    return handleResponse<CurrentStockItem[]>(res);
  },

  getAvailableStock: async (itemId: number, warehouseId: number): Promise<AvailableStockResponse> => {
    const res = await fetch(`${API_BASE_URL}/current-stock/available?item_id=${itemId}&warehouse_id=${warehouseId}`, { cache: 'no-store' });
    return handleResponse<AvailableStockResponse>(res);
  },

  getCSVExportUrl: (itemId?: number, warehouseId?: number, category?: string): string => {
    const params = new URLSearchParams();
    if (itemId) params.append('item_id', itemId.toString());
    if (warehouseId) params.append('warehouse_id', warehouseId.toString());
    if (category) params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return `${API_BASE_URL}/current-stock/export${query}`;
  },

  // Dashboard
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await fetch(`${API_BASE_URL}/dashboard`, { cache: 'no-store' });
    return handleResponse<DashboardSummary>(res);
  },
};
