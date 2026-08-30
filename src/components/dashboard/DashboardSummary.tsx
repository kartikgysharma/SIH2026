import React from 'react';
import { Package, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface DashboardSummaryProps {
  totalInspections: number;
  passedCount: number;
  potentialIssuesCount: number;
  reviewRequiredCount: number;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  totalInspections,
  passedCount,
  potentialIssuesCount,
  reviewRequiredCount,
}) => {
  const passPercentage =
    totalInspections > 0 ? Math.round((passedCount / totalInspections) * 100) : 0;
  const issuesPercentage =
    totalInspections > 0 ? Math.round((potentialIssuesCount / totalInspections) * 100) : 0;
  const reviewPercentage =
    totalInspections > 0 ? Math.round((reviewRequiredCount / totalInspections) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Inspections */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Total Inspections
          </span>
          <div className="p-1.5 rounded bg-slate-100 text-slate-700">
            <Package className="w-4 h-4 text-slate-700" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
            {totalInspections}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {totalInspections === 1 ? '1 commodity evaluated' : `${totalInspections} commodities evaluated`}
          </p>
        </div>
      </div>

      {/* 2. Passed */}
      <div className="bg-white border border-emerald-200/80 rounded-lg p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Passed
          </span>
          <div className="p-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 tracking-tight">
            {passedCount}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center text-[10px] font-mono font-bold bg-emerald-100/70 text-emerald-800 px-1.5 py-0.2 rounded">
              {passPercentage}%
            </span>
            <span className="text-[11px] text-slate-500 font-medium">statutory compliant</span>
          </div>
        </div>
      </div>

      {/* 3. Potential Issues */}
      <div className="bg-white border border-rose-200/80 rounded-lg p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
            Potential Issues
          </span>
          <div className="p-1.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-700 tracking-tight">
            {potentialIssuesCount}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center text-[10px] font-mono font-bold bg-rose-100/70 text-rose-800 px-1.5 py-0.2 rounded">
              {issuesPercentage}%
            </span>
            <span className="text-[11px] text-slate-500 font-medium">non-compliant label</span>
          </div>
        </div>
      </div>

      {/* 4. Review Required */}
      <div className="bg-white border border-amber-200/80 rounded-lg p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
            Review Required
          </span>
          <div className="p-1.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-700 tracking-tight">
            {reviewRequiredCount}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center text-[10px] font-mono font-bold bg-amber-100/70 text-amber-800 px-1.5 py-0.2 rounded">
              {reviewPercentage}%
            </span>
            <span className="text-[11px] text-slate-500 font-medium">pending verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};
