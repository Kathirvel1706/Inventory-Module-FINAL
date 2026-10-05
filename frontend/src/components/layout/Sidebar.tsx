'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  FileSpreadsheet,
  Shirt,
} from 'lucide-react';

const navigation = [
  { name: 'Inventory Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Item Master', href: '/masters/items', icon: Package },
  { name: 'Warehouse Master', href: '/masters/warehouses', icon: Warehouse },
  { name: 'Stock In', href: '/stock-in', icon: ArrowDownLeft },
  { name: 'Stock Out', href: '/stock-out', icon: ArrowUpRight },
  { name: 'Current Stock', href: '/current-stock', icon: Boxes },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-sm">
          <Shirt className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">TexERP Inventory</h1>
          <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-medium">Garment Export Module</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Main Menu</span>
        </div>
        {navigation.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-900/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="px-3 pt-6 pb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reports & Data</span>
        </div>
        <Link
          href="/current-stock?export=true"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          <span>Export Stock CSV</span>
        </Link>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px]">PostgreSQL 15+</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/50">
            ONLINE
          </span>
        </div>
      </div>
    </aside>
  );
};
