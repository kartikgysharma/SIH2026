import React from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import { DashboardDateRange } from '../../types';

interface DateRangeFilterProps {
  dateRange: DashboardDateRange;
  customStartDate?: string;
  customEndDate?: string;
  onChangeDateRange: (range: DashboardDateRange) => void;
  onChangeCustomDates: (start?: string, end?: string) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  dateRange,
  customStartDate,
  customEndDate,
  onChangeDateRange,
  onChangeCustomDates,
}) => {
  const options: { id: DashboardDateRange; label: string }[] = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'last_7_days', label: 'Last 7 Days' },
    { id: 'last_30_days', label: 'Last 30 Days' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
        <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
        <span>Period:</span>
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChangeDateRange(opt.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                dateRange === opt.id
                  ? 'bg-[#0B2545] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker when active */}
      {dateRange === 'custom' && (
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 text-xs">
          <input
            type="date"
            value={customStartDate || ''}
            onChange={(e) => onChangeCustomDates(e.target.value, customEndDate)}
            className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            aria-label="Start date"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={customEndDate || ''}
            onChange={(e) => onChangeCustomDates(customStartDate, e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            aria-label="End date"
          />
          {(customStartDate || customEndDate) && (
            <button
              type="button"
              onClick={() => onChangeCustomDates('', '')}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Clear custom dates"
              aria-label="Clear custom dates"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
