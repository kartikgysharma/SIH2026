import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  selectedRowKey?: string;
  isStriped?: boolean;
  isCompact?: boolean;
  emptyMessage?: string;
  className?: string;
  id?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  selectedRowKey,
  isStriped = false,
  isCompact = false,
  emptyMessage = 'No records found',
  className = '',
  id,
}: TableProps<T>) {
  return (
    <div id={id} className={`w-full overflow-x-auto border border-slate-200 rounded-md bg-white ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold tracking-wider text-slate-600 uppercase font-mono">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`${isCompact ? 'px-3 py-2' : 'px-4 py-2.5'} ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left'
                } ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-slate-400 text-xs font-medium"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const rowKey = keyExtractor(item, index);
              const isSelected = selectedRowKey === rowKey;

              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-blue-50/80 font-medium text-slate-900 border-l-2 border-l-[#0B2545]'
                      : isStriped && index % 2 === 1
                      ? 'bg-slate-50/40 hover:bg-slate-100/60'
                      : 'hover:bg-slate-50/80'
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${isCompact ? 'px-3 py-2' : 'px-4 py-2.5'} ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render ? col.render(item, index) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
