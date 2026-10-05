import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  ItemCreatePayload,
  WarehouseCreatePayload,
  StockInCreatePayload,
  StockOutCreatePayload,
} from '@/types/inventory';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.getDashboardSummary(),
  });
}

export function useItems(category?: string, search?: string) {
  return useQuery({
    queryKey: ['items', category, search],
    queryFn: () => api.getItems(category, search),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ItemCreatePayload) => api.createItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useWarehouses(search?: string) {
  return useQuery({
    queryKey: ['warehouses', search],
    queryFn: () => api.getWarehouses(search),
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WarehouseCreatePayload) => api.createWarehouse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useStockIns(itemId?: number, warehouseId?: number) {
  return useQuery({
    queryKey: ['stock-ins', itemId, warehouseId],
    queryFn: () => api.getStockIns(itemId, warehouseId),
  });
}

export function useCreateStockIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StockInCreatePayload) => api.createStockIn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-ins'] });
      queryClient.invalidateQueries({ queryKey: ['current-stock'] });
      queryClient.invalidateQueries({ queryKey: ['available-stock'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useStockOuts(itemId?: number, warehouseId?: number) {
  return useQuery({
    queryKey: ['stock-outs', itemId, warehouseId],
    queryFn: () => api.getStockOuts(itemId, warehouseId),
  });
}

export function useCreateStockOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StockOutCreatePayload) => api.createStockOut(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-outs'] });
      queryClient.invalidateQueries({ queryKey: ['current-stock'] });
      queryClient.invalidateQueries({ queryKey: ['available-stock'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useCurrentStock(itemId?: number, warehouseId?: number, category?: string) {
  return useQuery({
    queryKey: ['current-stock', itemId, warehouseId, category],
    queryFn: () => api.getCurrentStock(itemId, warehouseId, category),
  });
}

export function useAvailableStock(itemId?: number, warehouseId?: number) {
  return useQuery({
    queryKey: ['available-stock', itemId, warehouseId],
    queryFn: () => (itemId && warehouseId ? api.getAvailableStock(itemId, warehouseId) : null),
    enabled: Boolean(itemId && warehouseId),
  });
}
