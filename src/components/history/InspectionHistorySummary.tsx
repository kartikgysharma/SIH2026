import React from 'react';
import { InspectionSummary, ComplianceStatus } from '../../types';
import { FileCheck2, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface InspectionHistorySummaryProps {
  inspections: InspectionSummary[];
  activeStatusFilter: ComplianceStatus | 'all';
  onSelectStatusFilter: (status: ComplianceStatus | 'all') => void;
}

export const InspectionHistorySummary: React.FC<InspectionHistorySummaryProps> = ({
  inspections,
  activeStatusFilter,
  onSelectStatusFilter,
}) => {
  const total = inspections.length;
  const passed = inspections.filter((i) => i.overallStatus === 'pass').length;
  const potentialIssues = inspections.filter((i) => i.overallStatus === 'non_compliant').length;
  const reviewRequired = inspections.filter((i) => i.overallStatus === 'review_required').length;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-2xs">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {/* Total Inspections */}
        <button
          onClick={() => onSelectStatusFilter('all')}
          className={`flex items-center gap-3 p-1.5 sm:p-2 rounded text-left transition-colors ${
            activeStatusFilter === 'all'
              ? 'bg-slate-100 ring-1 ring-slate-300'
              : 'hover:bg-slate-50'
          }`}
          title="Filter all inspections"
        >
          <div className="w-9 h-9 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <FileCheck2 className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Inspections
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono">
              {total}
            </div>
          </div>
        </button>

        {/* Passed */}
        <button
          onClick={() => onSelectStatusFilter('pass')}
          className={`flex items-center gap-3 p-1.5 sm:p-2 rounded text-left pt-3 sm:pt-1.5 transition-colors ${
            activeStatusFilter === 'pass'
              ? 'bg-emerald-50 ring-1 ring-emerald-300'
              : 'hover:bg-slate-50'
          }`}
          title="Filter passed inspections"
        >
          <div className="w-9 h-9 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider">
              Passed
            </div>
            <div className="text-xl font-bold text-emerald-900 font-mono">
              {passed}
            </div>
          </div>
        </button>

        {/* Potential Issues */}
        <button
          onClick={() => onSelectStatusFilter('non_compliant')}
          className={`flex items-center gap-3 p-1.5 sm:p-2 rounded text-left pt-3 sm:pt-1.5 transition-colors ${
            activeStatusFilter === 'non_compliant'
              ? 'bg-rose-50 ring-1 ring-rose-300'
              : 'hover:bg-slate-50'
          }`}
          title="Filter potential issue inspections"
        >
          <div className="w-9 h-9 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-700" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-rose-800 uppercase tracking-wider">
              Potential Issues
            </div>
            <div className="text-xl font-bold text-rose-900 font-mono">
              {potentialIssues}
            </div>
          </div>
        </button>

        {/* Review Required */}
        <button
          onClick={() => onSelectStatusFilter('review_required')}
          className={`flex items-center gap-3 p-1.5 sm:p-2 rounded text-left pt-3 sm:pt-1.5 transition-colors ${
            activeStatusFilter === 'review_required'
              ? 'bg-amber-50 ring-1 ring-amber-300'
              : 'hover:bg-slate-50'
          }`}
          title="Filter review required inspections"
        >
          <div className="w-9 h-9 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <HelpCircle className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-amber-800 uppercase tracking-wider">
              Review Required
            </div>
            <div className="text-xl font-bold text-amber-900 font-mono">
              {reviewRequired}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
