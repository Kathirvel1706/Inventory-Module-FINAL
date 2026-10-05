'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Factory, Calendar } from 'lucide-react';

const titleMap: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Inventory Dashboard',
    subtitle: 'Overview of garment factory stock, movements, and stock health metrics',
  },
  '/masters/items': {
    title: 'Item Master',
    subtitle: 'Manage fabrics, yarns, trims, and accessories catalog',
  },
  '/masters/warehouses': {
    title: 'Warehouse Master',
    subtitle: 'Manage physical storage locations and facilities',
  },
  '/stock-in': {
    title: 'Stock In Entry',
    subtitle: 'Record raw material receipts from suppliers and external mills',
  },
  '/stock-out': {
    title: 'Stock Out Entry',
    subtitle: 'Issue materials to cutting floor, production, or record write-offs',
  },
  '/current-stock': {
    title: 'Current Stock & Reorder Levels',
    subtitle: 'Real-time calculated inventory levels per warehouse and reorder alerts',
  },
};

export const Header: React.FC = () => {
  const pathname = usePathname();
  const currentNav = titleMap[pathname] || {
    title: 'Inventory ERP',
    subtitle: 'Garment Manufacturing & Export Management System',
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-xs">
      <div>
        <h2 className="text-base font-bold text-slate-900">{currentNav.title}</h2>
        <p className="text-xs text-slate-500">{currentNav.subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDateStr}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-semibold text-indigo-700">
          <Factory className="w-3.5 h-3.5 text-indigo-600" />
          <span>Unit 1 - Export Plant</span>
        </div>
      </div>
    </header>
  );
};
