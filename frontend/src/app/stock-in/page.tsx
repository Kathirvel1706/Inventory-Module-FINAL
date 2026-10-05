'use client';

import React, { useState } from 'react';
import { ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { useItems, useWarehouses, useStockIns, useCreateStockIn } from '@/hooks/useInventory';
import { StockIn, StockInCreatePayload } from '@/types/inventory';
import { formatDate, formatNumber } from '@/lib/utils';

import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function StockInPage() {
  const todayStr = new Date().toISOString().split('T')[0];

  const [itemId, setItemId] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [qty, setQty] = useState<string>('');
  const [date, setDate] = useState<string>(todayStr);
  const [supplierRef, setSupplierRef] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: items, isLoading: isItemsLoading } = useItems();
  const { data: warehouses, isLoading: isWhLoading } = useWarehouses();
  const { data: stockIns, isLoading: isStockInLoading, error, refetch } = useStockIns();

  const createStockInMutation = useCreateStockIn();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!itemId) {
      setFormError('Please select a valid item.');
      return;
    }
    if (!warehouseId) {
      setFormError('Please select a destination warehouse.');
      return;
    }

    const qtyNum = parseFloat(qty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setFormError('Quantity received must be a number greater than 0.');
      return;
    }

    if (!date) {
      setFormError('Receipt date is required.');
      return;
    }

    if (!supplierRef.trim()) {
      setFormError('Supplier invoice / Delivery note reference is required.');
      return;
    }

    const payload: StockInCreatePayload = {
      item_id: parseInt(itemId),
      warehouse_id: parseInt(warehouseId),
      qty: qtyNum,
      date: date,
      supplier_reference: supplierRef.trim(),
      remarks: remarks.trim() || undefined,
    };

    try {
      await createStockInMutation.mutateAsync(payload);
      const selectedItemObj = activeItems.find((i) => i.id === parseInt(itemId));
      setSuccessMsg(
        `Successfully recorded Stock In of ${formatNumber(qtyNum)} ${selectedItemObj?.uom || 'units'}.`
      );

      // Reset Form fields
      setQty('');
      setSupplierRef('');
      setRemarks('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to record stock in entry');
    }
  };

  const columns: Column<StockIn>[] = [
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
      header: 'Destination Warehouse',
      accessor: (rec) => <span className="text-slate-700">{rec.warehouse?.name || `WH #${rec.warehouse_id}`}</span>,
      width: '22%',
    },
    {
      header: 'Qty Received',
      accessor: (rec) => (
        <span className="font-semibold text-emerald-600 font-mono">
          +{formatNumber(rec.qty)} {rec.item?.uom}
        </span>
      ),
      align: 'right',
      width: '15%',
    },
    {
      header: 'Supplier Reference',
      accessor: (rec) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 font-mono text-xs text-slate-700 border border-slate-200">
          {rec.supplier_reference}
        </span>
      ),
      width: '13%',
    },
    {
      header: 'Remarks',
      accessor: (rec) => <span className="text-xs text-slate-500 italic">{rec.remarks || '-'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Stock In Receipt Entry</h1>
        <p className="text-xs text-slate-500 mt-1">
          Record raw material receipts from suppliers, spinning mills, and external dye houses into PostgreSQL storage.
        </p>
      </div>

      {/* Stock In Entry Form Card */}
      <Card title="New Stock Receipt Entry" subtitle="Fill in transaction details to update calculated inventory levels">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {formError}
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
              label="Select Item"
              options={itemOptions}
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder={isItemsLoading ? 'Loading items...' : '-- Choose Item --'}
              required
            />
            <Select
              label="Select Warehouse"
              options={whOptions}
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              placeholder={isWhLoading ? 'Loading warehouses...' : '-- Choose Warehouse --'}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Quantity Received"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 500"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
            <Input
              label="Receipt Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              label="Supplier Reference / Invoice #"
              placeholder="e.g. INV-2026-880"
              value={supplierRef}
              onChange={(e) => setSupplierRef(e.target.value)}
              required
            />
          </div>

          <Input
            label="Transaction Remarks"
            placeholder="e.g. Batch quality inspected. Passed shade matching test."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={createStockInMutation.isPending}
              icon={<ArrowDownLeft className="w-4 h-4" />}
            >
              Post Stock Receipt
            </Button>
          </div>
        </form>
      </Card>

      {/* Recent Stock In Transactions Table */}
      <Card title="Recent Stock In Receipts" subtitle="Audit log of recent material stock entries">
        {isStockInLoading ? (
          <LoadingSpinner label="Loading recent stock receipts..." />
        ) : error ? (
          <ErrorMessage
            title="Failed to load stock receipts"
            message={error instanceof Error ? error.message : 'Error'}
            onRetry={refetch}
          />
        ) : (
          <Table
            columns={columns}
            data={stockIns || []}
            keyExtractor={(rec) => rec.id}
            emptyMessage="No stock in receipts recorded yet."
          />
        )}
      </Card>
    </div>
  );
}
