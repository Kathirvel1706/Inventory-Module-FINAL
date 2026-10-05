'use client';

import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import {
  useItems,
  useWarehouses,
  useStockOuts,
  useCreateStockOut,
  useAvailableStock,
} from '@/hooks/useInventory';
import { StockOut, StockOutCreatePayload } from '@/types/inventory';
import { formatDate, formatNumber } from '@/lib/utils';

import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function StockOutPage() {
  const todayStr = new Date().toISOString().split('T')[0];

  const [itemId, setItemId] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [qty, setQty] = useState<string>('');
  const [date, setDate] = useState<string>(todayStr);
  const [remarks, setRemarks] = useState<string>('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: items, isLoading: isItemsLoading } = useItems();
  const { data: warehouses, isLoading: isWhLoading } = useWarehouses();
  const { data: stockOuts, isLoading: isStockOutLoading, error, refetch } = useStockOuts();

  // Query real-time available stock for selected Item & Warehouse
  const selectedItemNum = itemId ? parseInt(itemId) : undefined;
  const selectedWhNum = warehouseId ? parseInt(warehouseId) : undefined;

  const { data: availableStockData, isLoading: isAvailLoading } = useAvailableStock(
    selectedItemNum,
    selectedWhNum
  );

  const createStockOutMutation = useCreateStockOut();

  const activeItems = items?.filter((i) => i.is_active) || [];
  const activeWarehouses = warehouses?.filter((w) => w.is_active) || [];

  const itemOptions = activeItems.map((i) => ({
    value: i.id,
    label: `${i.code} - ${i.name} (${i.uom})`,
  }));

  const whOptions = activeWarehouses.map((w) => ({
    value: w.id,
    label: `${w.name} (${w.location})`,
  }));

  const availableQty = availableStockData ? availableStockData.available_stock : 0;
  const selectedItemObj = activeItems.find((i) => i.id === selectedItemNum);

  const qtyNum = parseFloat(qty);
  const isExceedingStock =
    Boolean(selectedItemNum && selectedWhNum && !isNaN(qtyNum) && qtyNum > availableQty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!itemId) {
      setFormError('Please select a valid item.');
      return;
    }
    if (!warehouseId) {
      setFormError('Please select a source warehouse.');
      return;
    }

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setFormError('Quantity issued must be a number greater than 0.');
      return;
    }

    if (!date) {
      setFormError('Issuance date is required.');
      return;
    }

    // Client-side guard against negative stock
    if (qtyNum > availableQty) {
      setFormError(
        `Insufficient stock protection: Available quantity in warehouse is ${availableQty} ${
          selectedItemObj?.uom || ''
        }. Transaction rejected.`
      );
      return;
    }

    const payload: StockOutCreatePayload = {
      item_id: parseInt(itemId),
      warehouse_id: parseInt(warehouseId),
      qty: qtyNum,
      date: date,
      remarks: remarks.trim() || undefined,
    };

    try {
      await createStockOutMutation.mutateAsync(payload);
      setSuccessMsg(
        `Successfully issued ${formatNumber(qtyNum)} ${selectedItemObj?.uom || 'units'} from warehouse.`
      );

      // Reset Form fields
      setQty('');
      setRemarks('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to record stock out issuance');
    }
  };

  const columns: Column<StockOut>[] = [
    {
      header: 'Date',
      accessor: (rec) => <span className="font-mono text-xs text-slate-600">{formatDate(rec.date)}</span>,
      width: '12%',
    },
    {
      header: 'Item',
      accessor: (rec) => (
        <div>
          <span className="font-semibold text-slate-900">{rec.item?.name || `Item #${rec.item_id}`}</span>
          <span className="block text-[11px] text-slate-400 font-mono">{rec.item?.code}</span>
        </div>
      ),
      width: '28%',
    },
    {
      header: 'Source Warehouse',
      accessor: (rec) => <span className="text-slate-700">{rec.warehouse?.name || `WH #${rec.warehouse_id}`}</span>,
      width: '22%',
    },
    {
      header: 'Qty Issued',
      accessor: (rec) => (
        <span className="font-semibold text-rose-600 font-mono">
          -{formatNumber(rec.qty)} {rec.item?.uom}
        </span>
      ),
      align: 'right',
      width: '15%',
    },
    {
      header: 'Issuance Purpose / Remarks',
      accessor: (rec) => <span className="text-xs text-slate-600 italic">{rec.remarks || '-'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Stock Out Issuance Entry</h1>
        <p className="text-xs text-slate-500 mt-1">
          Issue materials to cutting tables, sewing lines, or record written-off inventory with strict negative stock validation.
        </p>
      </div>

      {/* Form Card */}
      <Card title="Record Material Issuance" subtitle="Submitting will decrement calculated inventory balance for the item in the selected warehouse">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select Item to Issue"
              options={itemOptions}
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder={isItemsLoading ? 'Loading items...' : '-- Choose Item --'}
              required
            />
            <Select
              label="Select Source Warehouse"
              options={whOptions}
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              placeholder={isWhLoading ? 'Loading warehouses...' : '-- Choose Warehouse --'}
              required
            />
          </div>

          {/* Real-time Available Stock Live Indicator Card */}
          {selectedItemNum && selectedWhNum && (
            <div className={`p-4 rounded-xl border transition-colors ${
              isExceedingStock
                ? 'bg-rose-50 border-rose-200'
                : availableQty === 0
                ? 'bg-amber-50 border-amber-200'
                : 'bg-indigo-50/60 border-indigo-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    isExceedingStock ? 'bg-rose-500 animate-ping' : availableQty === 0 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <span className="text-xs font-semibold text-slate-700">
                    Available Stock Balance:
                  </span>
                </div>
                {isAvailLoading ? (
                  <span className="text-xs text-slate-500 animate-pulse">Calculating available balance...</span>
                ) : (
                  <span className={`text-base font-bold font-mono ${
                    isExceedingStock ? 'text-rose-700' : availableQty === 0 ? 'text-amber-700' : 'text-indigo-900'
                  }`}>
                    {formatNumber(availableQty)} {selectedItemObj?.uom}
                  </span>
                )}
              </div>
              {isExceedingStock && (
                <p className="mt-2 text-xs font-semibold text-rose-700">
                  CRITICAL: Requested quantity ({qty}) exceeds available stock ({availableQty}). Submission will be rejected!
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Quantity to Issue"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 250"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
            <Input
              label="Issuance Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Issuance Purpose / Order Remarks"
            placeholder="e.g. Issued to Cutting Table 2 for Export Order #PO-9402"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="danger"
              disabled={isExceedingStock}
              isLoading={createStockOutMutation.isPending}
              icon={<ArrowUpRight className="w-4 h-4" />}
            >
              Post Stock Out
            </Button>
          </div>
        </form>
      </Card>

      {/* Recent Stock Out Table */}
      <Card title="Recent Stock Out Issuances" subtitle="Audit log of recent material issuances and write-offs">
        {isStockOutLoading ? (
          <LoadingSpinner label="Loading recent stock issuances..." />
        ) : error ? (
          <ErrorMessage
            title="Failed to load stock issuances"
            message={error instanceof Error ? error.message : 'Error'}
            onRetry={refetch}
          />
        ) : (
          <Table
            columns={columns}
            data={stockOuts || []}
            keyExtractor={(rec) => rec.id}
            emptyMessage="No stock out issuances recorded yet."
          />
        )}
      </Card>
    </div>
  );
}
