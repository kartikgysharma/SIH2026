import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface InspectionStatusOverviewProps {
  totalInspections: number;
  passedCount: number;
  potentialIssuesCount: number;
  reviewRequiredCount: number;
  averageScore: number;
}

export const InspectionStatusOverview: React.FC<InspectionStatusOverviewProps> = ({
  totalInspections,
  passedCount,
  potentialIssuesCount,
  reviewRequiredCount,
  averageScore,
}) => {
  const passPct = totalInspections > 0 ? (passedCount / totalInspections) * 100 : 0;
  const issuesPct = totalInspections > 0 ? (potentialIssuesCount / totalInspections) * 100 : 0;
  const reviewPct = totalInspections > 0 ? (reviewRequiredCount / totalInspections) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-900" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Primary Inspection Status
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
          <span>Avg Compliance Score:</span>
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {totalInspections > 0 ? `${averageScore}/100` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Outcome Distribution Bar */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
          {totalInspections > 0 ? (
            <>
              {passedCount > 0 && (
                <div
                  style={{ width: `${passPct}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Pass: ${passedCount} (${passPct.toFixed(1)}%)`}
                />
              )}
              {potentialIssuesCount > 0 && (
                <div
                  style={{ width: `${issuesPct}%` }}
                  className="bg-rose-500 transition-all duration-500"
                  title={`Potential Non-Compliance: ${potentialIssuesCount} (${issuesPct.toFixed(1)}%)`}
                />
              )}
              {reviewRequiredCount > 0 && (
                <div
                  style={{ width: `${reviewPct}%` }}
                  className="bg-amber-400 transition-all duration-500"
                  title={`Review Required: ${reviewRequiredCount} (${reviewPct.toFixed(1)}%)`}
                />
              )}
            </>
          ) : (
            <div className="w-full bg-slate-200" title="No inspection data" />
          )}
        </div>

        {/* Legend / Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Pass */}
          <div className="flex items-center justify-between p-2.5 rounded bg-emerald-50/60 border border-emerald-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-semibold text-emerald-950">PASS</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-emerald-900">{passedCount}</span>
              <span className="text-[10px] text-emerald-700 ml-1 font-mono">
                ({totalInspections > 0 ? `${passPct.toFixed(0)}%` : '0%'})
              </span>
            </div>
          </div>

          {/* Potential Issues */}
          <div className="flex items-center justify-between p-2.5 rounded bg-rose-50/60 border border-rose-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="font-semibold text-rose-950">POTENTIAL NON-COMPLIANCE</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-rose-900">{potentialIssuesCount}</span>
              <span className="text-[10px] text-rose-700 ml-1 font-mono">
                ({totalInspections > 0 ? `${issuesPct.toFixed(0)}%` : '0%'})
              </span>
            </div>
          </div>

          {/* Review Required */}
          <div className="flex items-center justify-between p-2.5 rounded bg-amber-50/60 border border-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span className="font-semibold text-amber-950">REVIEW REQUIRED</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-amber-900">{reviewRequiredCount}</span>
              <span className="text-[10px] text-amber-700 ml-1 font-mono">
                ({totalInspections > 0 ? `${reviewPct.toFixed(0)}%` : '0%'})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
