import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'healthy' | 'low' | 'critical' | 'fabric' | 'yarn' | 'trim' | 'accessory' | 'neutral' | 'active' | 'inactive';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variantStyles = {
    healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    low: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    fabric: 'bg-blue-50 text-blue-700 border-blue-200',
    yarn: 'bg-purple-50 text-purple-700 border-purple-200',
    trim: 'bg-amber-50 text-amber-700 border-amber-200',
    accessory: 'bg-teal-50 text-teal-700 border-teal-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
