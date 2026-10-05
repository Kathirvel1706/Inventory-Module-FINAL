'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileSpreadsheet, Search } from 'lucide-react';

import { useCurrentStock, useItems, useWarehouses } from '@/hooks/useInventory';
import { CurrentStockItem } from '@/types/inventory';
import { formatNumber, getCategoryBadgeColor } from '@/lib/utils';
import { api } from '@/lib/api';

import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const categories = [
  { value: 'Fabric', label: 'Fabric' },
  { value: 'Yarn', label: 'Yarn' },
  { value: 'Trim', label: 'Trim' },
  { value: 'Accessory', label: 'Accessory' },
];

function CurrentStockContent() {
  const searchParams = useSearchParams();

  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedWh, setSelectedWh] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const itemNum = selectedItem ? parseInt(selectedItem) : undefined;
  const whNum = selectedWh ? parseInt(selectedWh) : undefined;

  const { data: items } = useItems();
  const { data: warehouses } = useWarehouses();
  const { data: stockRecords, isLoading, error, refetch } = useCurrentStock(
    itemNum,
    whNum,
    selectedCategory || undefined
  );

  const itemOptions = (items || []).map((i) => ({ value: i.id, label: `${i.code} - ${i.name}` }));
  const whOptions = (warehouses || []).map((w) => ({ value: w.id, label: w.name }));

  const filteredRecords = (stockRecords || []).filter((rec) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      rec.item_code.toLowerCase().includes(q) ||
      rec.item_name.toLowerCase().includes(q) ||
      rec.warehouse_name.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = useCallback(() => {
    const exportUrl = api.getCSVExportUrl(itemNum, whNum, selectedCategory || undefined);
    window.open(exportUrl, '_blank');
  }, [itemNum, whNum, selectedCategory]);

  // Auto trigger export if query param export=true is present
  useEffect(() => {
    if (searchParams.get('export') === 'true') {
      handleExportCSV();
    }
  }, [searchParams, handleExportCSV]);

  const columns: Column<CurrentStockItem>[] = [
    {
      header: 'Item Code',
      accessor: (rec) => <span className="font-mono font-semibold text-slate-900">{rec.item_code}</span>,
      width: '12%',
    },
    {
      header: 'Item Name',
      accessor: (rec) => <span className="font-semibold text-slate-800">{rec.item_name}</span>,
      width: '22%',
    },
    {
      header: 'Category',
      accessor: (rec) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadgeColor(
            rec.category
          )}`}
        >
          {rec.category}
        </span>
      ),
      width: '12%',
    },
    {
      header: 'Warehouse Location',
      accessor: (rec) => <span className="text-slate-700">{rec.warehouse_name}</span>,
      width: '18%',
    },
    {
      header: 'Current Stock Qty',
      accessor: (rec) => (
        <span
          className={`font-mono font-bold text-sm ${
            rec.status === 'Critical'
              ? 'text-rose-600'
              : rec.status === 'Low Stock'
              ? 'text-amber-600'
              : 'text-slate-900'
          }`}
        >
          {formatNumber(rec.current_qty)} {rec.uom}
        </span>
      ),
      align: 'right',
      width: '14%',
    },
    {
      header: 'Reorder Level',
      accessor: (rec) => (
        <span className="font-mono text-slate-500 text-xs">
          {formatNumber(rec.reorder_level)} {rec.uom}
        </span>
      ),
      align: 'right',
      width: '12%',
    },
    {
      header: 'Stock Status',
      accessor: (rec) => (
        <Badge
          variant={
            rec.status === 'Healthy'
              ? 'healthy'
              : rec.status === 'Low Stock'
              ? 'low'
              : 'critical'
          }
        >
          {rec.status}
        </Badge>
      ),
      align: 'center',
      width: '10%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Current Stock & Reorder Levels</h1>
          <p className="text-xs text-slate-500 mt-1">
            Calculated as Total Stock In minus Total Stock Out per item per warehouse location.
          </p>
        </div>
        <Button
          variant="outline"
          icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          onClick={handleExportCSV}
        >
          Export CSV
        </Button>
      </div>

      {/* Filter and Search Bar Card */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <Select
            options={itemOptions}
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            placeholder="All Items"
          />

          <Select
            options={whOptions}
            value={selectedWh}
            onChange={(e) => setSelectedWh(e.target.value)}
            placeholder="All Warehouses"
          />

          <Select
            options={categories}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            placeholder="All Categories"
          />
        </div>
      </Card>

      {/* Main Table / Loading / Error */}
      {isLoading ? (
        <LoadingSpinner label="Calculating real-time inventory balances..." />
      ) : error ? (
        <ErrorMessage
          title="Failed to load current stock"
          message={error instanceof Error ? error.message : 'Error fetching inventory balances'}
          onRetry={refetch}
        />
      ) : (
        <Table
          columns={columns}
          data={filteredRecords}
          keyExtractor={(rec) => `${rec.item_id}-${rec.warehouse_id}`}
          emptyMessage="No stock records found for the selected filters."
        />
      )}
    </div>
  );
}

export default function CurrentStockPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Initializing current stock module..." />}>
      <CurrentStockContent />
    </Suspense>
  );
}
