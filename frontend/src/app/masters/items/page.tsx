'use client';

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useItems, useCreateItem } from '@/hooks/useInventory';
import { Item, ItemCategory, ItemCreatePayload } from '@/types/inventory';
import { formatCurrency, formatNumber, getCategoryBadgeColor } from '@/lib/utils';

import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const categories: { value: ItemCategory; label: string }[] = [
  { value: 'Fabric', label: 'Fabric (meters/yards)' },
  { value: 'Yarn', label: 'Yarn (kg/cones)' },
  { value: 'Trim', label: 'Trim (pieces/zips)' },
  { value: 'Accessory', label: 'Accessory (labels/threads)' },
];

const uomOptions = [
  { value: 'Meter', label: 'Meter' },
  { value: 'Yard', label: 'Yard' },
  { value: 'Kg', label: 'Kg' },
  { value: 'Piece', label: 'Piece' },
  { value: 'Roll', label: 'Roll' },
  { value: 'Cone', label: 'Cone' },
  { value: 'Box', label: 'Box' },
];

export default function ItemMasterPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory | ''>('Fabric');
  const [uom, setUom] = useState('Meter');
  const [unitCost, setUnitCost] = useState<string>('0.00');
  const [reorderLevel, setReorderLevel] = useState<string>('100');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: items, isLoading, error, refetch } = useItems(selectedCategory || undefined, search || undefined);
  const createItemMutation = useCreateItem();

  const handleOpenModal = () => {
    setCode('');
    setName('');
    setCategory('Fabric');
    setUom('Meter');
    setUnitCost('0.00');
    setReorderLevel('100');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side validations
    if (!code.trim()) {
      setFormError('Item code is required.');
      return;
    }
    if (!name.trim()) {
      setFormError('Item name is required.');
      return;
    }
    if (!category) {
      setFormError('Category is required.');
      return;
    }
    if (!uom.trim()) {
      setFormError('Unit of Measure (UOM) is required.');
      return;
    }

    const costVal = parseFloat(unitCost);
    if (isNaN(costVal) || costVal < 0) {
      setFormError('Unit cost must be a non-negative number.');
      return;
    }

    const reorderVal = parseFloat(reorderLevel);
    if (isNaN(reorderVal) || reorderVal < 0) {
      setFormError('Reorder level must be a non-negative number.');
      return;
    }

    const payload: ItemCreatePayload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category: category as ItemCategory,
      uom: uom.trim(),
      unit_cost: costVal,
      reorder_level: reorderVal,
      is_active: isActive,
    };

    try {
      await createItemMutation.mutateAsync(payload);
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create item');
    }
  };

  const columns: Column<Item>[] = [
    {
      header: 'Item Code',
      accessor: (item) => <span className="font-mono font-semibold text-slate-900">{item.code}</span>,
      width: '15%',
    },
    {
      header: 'Item Name',
      accessor: (item) => <span className="font-semibold text-slate-800">{item.name}</span>,
      width: '25%',
    },
    {
      header: 'Category',
      accessor: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadgeColor(
            item.category
          )}`}
        >
          {item.category}
        </span>
      ),
      width: '15%',
    },
    {
      header: 'UOM',
      accessor: (item) => <span className="text-slate-600 font-mono text-xs">{item.uom}</span>,
      width: '10%',
    },
    {
      header: 'Unit Cost',
      accessor: (item) => formatCurrency(item.unit_cost),
      align: 'right',
      width: '12%',
    },
    {
      header: 'Reorder Level',
      accessor: (item) => (
        <span className="font-mono text-slate-700">
          {formatNumber(item.reorder_level)} {item.uom}
        </span>
      ),
      align: 'right',
      width: '13%',
    },
    {
      header: 'Status',
      accessor: (item) => (
        <Badge variant={item.is_active ? 'active' : 'inactive'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
      align: 'center',
      width: '10%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Item Master Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain garment manufacturing item master data, categories, unit costs, and reorder levels.
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenModal}>
          Add New Item
        </Button>
      </div>

      {/* Filter and Search Bar Card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search items by code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <div className="w-full sm:w-64">
            <Select
              options={categories}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              placeholder="All Categories"
            />
          </div>
        </div>
      </Card>

      {/* Items Table / Loading / Error States */}
      {isLoading ? (
        <LoadingSpinner label="Fetching items catalog from PostgreSQL..." />
      ) : error ? (
        <ErrorMessage
          title="Failed to load items"
          message={error instanceof Error ? error.message : 'Error fetching items'}
          onRetry={refetch}
        />
      ) : (
        <Table
          columns={columns}
          data={items || []}
          keyExtractor={(item) => item.id}
          emptyMessage="No items found in directory matching your criteria."
        />
      )}

      {/* Add Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Garment Item"
        subtitle="Create a new material item record in the ERP master catalog."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Item Code"
              placeholder="e.g. FAB-COT-001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Select
              label="Category"
              options={categories}
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory)}
              required
            />
          </div>

          <Input
            label="Item Name"
            placeholder="e.g. 100% Combed Cotton Single Jersey 180GSM"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Unit of Measure (UOM)"
              options={uomOptions}
              value={uom}
              onChange={(e) => setUom(e.target.value)}
              required
            />
            <Input
              label="Unit Cost ($)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              required
            />
            <Input
              label="Reorder Level"
              type="number"
              step="0.1"
              min="0"
              placeholder="100"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active_checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_active_checkbox" className="text-xs font-medium text-slate-700">
              Active Item (Available for Stock Receipts and Issues)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createItemMutation.isPending}>
              Save Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
