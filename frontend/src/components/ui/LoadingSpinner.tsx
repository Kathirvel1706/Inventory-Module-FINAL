import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading inventory data...',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
      <div
        className={`${sizeMap[size]} border-indigo-600 border-t-transparent rounded-full animate-spin mb-3`}
      ></div>
      {label && <p className="text-sm font-medium text-slate-600">{label}</p>}
    </div>
  );
};
