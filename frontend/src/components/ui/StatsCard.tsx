import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'warning' | 'neutral';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'neutral',
}) => {
  const trendStyles = {
    positive: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    negative: 'text-rose-700 bg-rose-50 border-rose-200',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
    neutral: 'text-slate-600 bg-slate-100 border-slate-200',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {icon && <div className="p-2 bg-slate-50 rounded-lg text-indigo-600 border border-slate-100">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{value}</span>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${trendStyles[trendType]}`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
