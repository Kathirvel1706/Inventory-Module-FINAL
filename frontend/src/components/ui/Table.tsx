import React from 'react';

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found',
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center border border-slate-200 rounded-xl bg-white">
        <p className="text-sm text-slate-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-600 border-collapse">
        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className={`px-4 py-3.5 text-xs uppercase tracking-wider ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left'
                }`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-slate-50/70 transition-colors">
              {columns.map((col, index) => (
                <td
                  key={index}
                  className={`px-4 py-3.5 ${
                    col.align === 'right'
                      ? 'text-right font-mono text-slate-800'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {col.accessor(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
