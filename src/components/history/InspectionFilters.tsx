import React from 'react';
import { InspectionFilterState, ComplianceStatus, ReviewWorkflowStatus } from '../../types';
import { Filter, X, Calendar, Layers, ShieldCheck, User, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '../../design-system/Button';

interface InspectionFiltersProps {
  filters: InspectionFilterState;
  onFilterChange: (filters: Partial<InspectionFilterState>) => void;
  onResetFilters: () => void;
  availableCategories: string[];
  availableInspectors: string[];
  isFilterActive: boolean;
}

export const InspectionFilters: React.FC<InspectionFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableCategories,
  availableInspectors,
  isFilterActive,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Status Filter */}
      <div className="flex items-center">
        <select
          value={filters.status}
          onChange={(e) =>
            onFilterChange({ status: e.target.value as ComplianceStatus | 'all' })
          }
          aria-label="Filter by Compliance Status"
          className="text-xs bg-white border border-slate-300 rounded-md py-2 px-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 shadow-2xs font-medium cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="pass">Passed</option>
          <option value="non_compliant">Potential Non-Compliance</option>
          <option value="review_required">Review Required</option>
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center">
        <select
          value={filters.dateRange}
          onChange={(e) =>
            onFilterChange({
              dateRange: e.target.value as InspectionFilterState['dateRange'],
            })
          }
          aria-label="Filter by Inspection Date Range"
          className="text-xs bg-white border border-slate-300 rounded-md py-2 px-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 shadow-2xs font-medium cursor-pointer"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="last_7_days">Last 7 Days</option>
          <option value="last_30_days">Last 30 Days</option>
        </select>
      </div>

      {/* Category Filter */}
      <div className="flex items-center">
        <select
          value={filters.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
          aria-label="Filter by Commodity Category"
          className="text-xs bg-white border border-slate-300 rounded-md py-2 px-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 shadow-2xs font-medium cursor-pointer max-w-[180px] truncate"
        >
          <option value="all">All Categories</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Review Status Filter */}
      <div className="flex items-center">
        <select
          value={filters.reviewStatus}
          onChange={(e) =>
            onFilterChange({
              reviewStatus: e.target.value as ReviewWorkflowStatus | 'all',
            })
          }
          aria-label="Filter by Human Review Status"
          className="text-xs bg-white border border-slate-300 rounded-md py-2 px-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 shadow-2xs font-medium cursor-pointer"
        >
          <option value="all">All Review Statuses</option>
          <option value="pending_review">Pending Review</option>
          <option value="in_review">In Review</option>
          <option value="reviewed">Reviewed</option>
          <option value="further_review_required">Needs Escalation</option>
        </select>
      </div>

      {/* Score Range Filter */}
      <div className="flex items-center">
        <select
          value={filters.scoreRange}
          onChange={(e) =>
            onFilterChange({
              scoreRange: e.target.value as InspectionFilterState['scoreRange'],
            })
          }
          aria-label="Filter by Assessment Score"
          className="text-xs bg-white border border-slate-300 rounded-md py-2 px-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 shadow-2xs font-medium cursor-pointer"
        >
          <option value="all">All Scores</option>
          <option value="high">Score ≥ 90 (High)</option>
          <option value="medium">Score 70–89 (Moderate)</option>
          <option value="low">Score &lt; 70 (Low)</option>
        </select>
      </div>

      {/* Inspector Filter */}
      {availableInspectors.length > 0 && (
        <div className="flex items-center">
          <select
            value={filters.inspector}
            onChange={(e) => onFilterChange({ inspector: e.target.value })}
            aria-label="Filter by Assigned Inspector"
            className="text-xs bg-white border border-slate-300 rounded-md py-2 px-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 shadow-2xs font-medium cursor-pointer max-w-[170px] truncate"
          >
            <option value="all">All Inspectors</option>
            {availableInspectors.map((insp) => (
              <option key={insp} value={insp}>
                {insp}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Clear Filters Button */}
      {isFilterActive && (
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1.5 rounded transition-colors"
          title="Reset all active search and filter constraints"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  );
};
