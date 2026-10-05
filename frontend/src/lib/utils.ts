export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getCategoryBadgeColor(category: string): string {
  switch (category) {
    case 'Fabric':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Yarn':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Trim':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Accessory':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'Healthy':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Low Stock':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Critical':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
