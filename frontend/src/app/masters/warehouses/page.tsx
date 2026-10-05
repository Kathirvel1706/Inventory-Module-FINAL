'use client';

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useWarehouses, useCreateWarehouse } from '@/hooks/useInventory';
import { Warehouse, WarehouseCreatePayload } from '@/types/inventory';

import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function WarehouseMasterPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: warehouses, isLoading, error, refetch } = useWarehouses(search || undefined);
  const createWarehouseMutation = useCreateWarehouse();

  const handleOpenModal = () => {
    setName('');
    setLocation('');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Warehouse name is required.');
      return;
    }
    if (!location.trim()) {
      setFormError('Physical location details are required.');
      return;
    }

    const payload: WarehouseCreatePayload = {
      name: name.trim(),
      location: location.trim(),
      is_active: isActive,
    };

    try {
      await createWarehouseMutation.mutateAsync(payload);
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create warehouse');
    }
  };

  const columns: Column<Warehouse>[] = [
    {
      header: 'Warehouse ID',
      accessor: (wh) => <span className="font-mono text-xs text-slate-500">WH-{wh.id}</span>,
      width: '15%',
    },
    {
      header: 'Warehouse Name',
      accessor: (wh) => <span className="font-semibold text-slate-900">{wh.name}</span>,
      width: '35%',
    },
    {
      header: 'Physical Location',
      accessor: (wh) => <span className="text-slate-600">{wh.location}</span>,
      width: '35%',
    },
    {
      header: 'Status',
      accessor: (wh) => (
        <Badge variant={wh.is_active ? 'active' : 'inactive'}>
          {wh.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
      align: 'center',
      width: '15%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Warehouse Master Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure storage facilities, raw material depots, and production floor stores.
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenModal}>
          Add Warehouse
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search warehouses by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>
      </Card>

      {/* Warehouses Table / States */}
      {isLoading ? (
        <LoadingSpinner label="Loading warehouse list..." />
      ) : error ? (
        <ErrorMessage
          title="Failed to load warehouses"
          message={error instanceof Error ? error.message : 'Error fetching warehouses'}
          onRetry={refetch}
        />
      ) : (
        <Table
          columns={columns}
          data={warehouses || []}
          keyExtractor={(wh) => wh.id}
          emptyMessage="No warehouses configured yet."
        />
      )}

      {/* Add Warehouse Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Warehouse"
        subtitle="Register a physical storage location or plant floor store."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <Input
            label="Warehouse Name"
            placeholder="e.g. Main Fabric Store"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Physical Location"
            placeholder="e.g. Block A - Ground Floor, Plant Unit 1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="wh_active_checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="wh_active_checkbox" className="text-xs font-medium text-slate-700">
              Active Warehouse (Operational for In/Out Movements)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createWarehouseMutation.isPending}>
              Save Warehouse
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
