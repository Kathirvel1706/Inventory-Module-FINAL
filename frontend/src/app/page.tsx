'use client';

import React from 'react';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  Warehouse,
  Boxes,
  AlertTriangle,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

import { useDashboardSummary } from '@/hooks/useInventory';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { StockIn, StockOut } from '@/types/inventory';
import { formatDate, formatNumber } from '@/lib/utils';

export default function DashboardPage() {
  const { data: summary, isLoading, error, refetch } = useDashboardSummary();

  if (isLoading) {
    return <LoadingSpinner label="Loading dashboard summary metrics..." />;
  }

  if (error || !summary) {
    return (
      <ErrorMessage
        title="Failed to load inventory dashboard"
        message={error instanceof Error ? error.message : 'Unable to connect to FastAPI backend service.'}
        onRetry={refetch}
      />
    );
  }

  const stockInColumns: Column<StockIn>[] = [
    {
      header: 'Date',
      accessor: (item) => formatDate(item.date),
      width: '15%',
    },
    {
      header: 'Item',
      accessor: (item) => (
        <div>
          <span className="font-semibold text-slate-900">{item.item?.name || `Item #${item.item_id}`}</span>
          <span className="block text-[11px] text-slate-400 font-mono">{item.item?.code}</span>
        </div>
      ),
    },
    {
      header: 'Warehouse',
      accessor: (item) => item.warehouse?.name || `Warehouse #${item.warehouse_id}`,
    },
    {
      header: 'Quantity',
      accessor: (item) => (
        <span className="font-semibold text-emerald-600">
          +{formatNumber(item.qty)} {item.item?.uom}
        </span>
      ),
      align: 'right',
    },
    {
      header: 'Supplier Ref',
      accessor: (item) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs text-slate-700">
          {item.supplier_reference}
        </span>
      ),
    },
  ];

  const stockOutColumns: Column<StockOut>[] = [
    {
      header: 'Date',
      accessor: (item) => formatDate(item.date),
      width: '15%',
    },
    {
      header: 'Item',
      accessor: (item) => (
        <div>
          <span className="font-semibold text-slate-900">{item.item?.name || `Item #${item.item_id}`}</span>
          <span className="block text-[11px] text-slate-400 font-mono">{item.item?.code}</span>
        </div>
      ),
    },
    {
      header: 'Warehouse',
      accessor: (item) => item.warehouse?.name || `Warehouse #${item.warehouse_id}`,
    },
    {
      header: 'Quantity',
      accessor: (item) => (
        <span className="font-semibold text-rose-600">
          -{formatNumber(item.qty)} {item.item?.uom}
        </span>
      ),
      align: 'right',
    },
    {
      header: 'Remarks',
      accessor: (item) => <span className="text-xs text-slate-500 italic">{item.remarks || '-'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Garment Export Inventory Control</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock balance, warehouse tracking, and material issuance monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/stock-in">
            <Button variant="primary" size="sm" icon={<ArrowDownLeft className="w-4 h-4" />}>
              Record Stock In
            </Button>
          </Link>
          <Link href="/stock-out">
            <Button variant="outline" size="sm" icon={<ArrowUpRight className="w-4 h-4" />}>
              Record Stock Out
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Stock Warning Alert if critical items > 0 */}
      {summary.critical_stock_items_count > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">Critical Stock Alert</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                {summary.critical_stock_items_count} item(s) have reached zero or negative calculated stock balance.
              </p>
            </div>
          </div>
          <Link href="/current-stock">
            <Button variant="danger" size="sm">
              View Critical Items
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total Items"
          value={summary.total_items}
          subtitle="Registered catalog items"
          icon={<Package className="w-4 h-4" />}
        />
        <StatsCard
          title="Active Items"
          value={summary.active_items}
          subtitle="Available for transactions"
          icon={<CheckCircle2 className="w-4 h-4" />}
          trend="ACTIVE"
          trendType="positive"
        />
        <StatsCard
          title="Warehouses"
          value={summary.total_warehouses}
          subtitle="Storage facilities"
          icon={<Warehouse className="w-4 h-4" />}
        />
        <StatsCard
          title="Current Stock"
          value={formatNumber(summary.total_current_stock, 0)}
          subtitle="Total material units in stock"
          icon={<Boxes className="w-4 h-4" />}
        />
        <StatsCard
          title="Low Stock"
          value={summary.low_stock_items_count}
          subtitle="At or below reorder level"
          icon={<AlertTriangle className="w-4 h-4" />}
          trend={summary.low_stock_items_count > 0 ? 'WARNING' : 'HEALTHY'}
          trendType={summary.low_stock_items_count > 0 ? 'warning' : 'positive'}
        />
        <StatsCard
          title="Critical"
          value={summary.critical_stock_items_count}
          subtitle="Depleted inventory pairs"
          icon={<XCircle className="w-4 h-4" />}
          trend={summary.critical_stock_items_count > 0 ? 'CRITICAL' : 'OK'}
          trendType={summary.critical_stock_items_count > 0 ? 'negative' : 'positive'}
        />
      </div>

      {/* Recent Movements Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stock In Card */}
        <Card
          title="Recent Stock In Receipts"
          subtitle="Materials received from mills & suppliers"
          action={
            <Link href="/stock-in">
              <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                View All &rarr;
              </span>
            </Link>
          }
        >
          <Table
            columns={stockInColumns}
            data={summary.recent_stock_ins}
            keyExtractor={(item) => item.id}
            emptyMessage="No recent stock in receipts recorded."
          />
        </Card>

        {/* Recent Stock Out Card */}
        <Card
          title="Recent Stock Out Issuances"
          subtitle="Materials issued to cutting & assembly"
          action={
            <Link href="/stock-out">
              <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                View All &rarr;
              </span>
            </Link>
          }
        >
          <Table
            columns={stockOutColumns}
            data={summary.recent_stock_outs}
            keyExtractor={(item) => item.id}
            emptyMessage="No recent stock out issuances recorded."
          />
        </Card>
      </div>
    </div>
  );
}
