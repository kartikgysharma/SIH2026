import React from 'react';
import { InspectionSummary } from '../../types';
import { TrendingUp, BarChart2 } from 'lucide-react';

interface InspectionTrendsProps {
  inspections: InspectionSummary[];
}

export const InspectionTrends: React.FC<InspectionTrendsProps> = ({ inspections }) => {
  const hasEnoughData = inspections.length >= 5;

  // Group by date
  const dateMap = new Map<string, { total: number; passed: number; issues: number }>();
  inspections.forEach((insp) => {
    const dateKey = insp.inspectedAt.split(' ')[0];
    const curr = dateMap.get(dateKey) || { total: 0, passed: 0, issues: 0 };
    curr.total += 1;
    if (insp.overallStatus === 'pass') curr.passed += 1;
    if (insp.overallStatus === 'non_compliant') curr.issues += 1;
    dateMap.set(dateKey, curr);
  });

  const trendData = Array.from(dateMap.entries())
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7); // Last 7 days with data

  const maxTotal = Math.max(...trendData.map((d) => d.total), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-900" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Inspection Activity Trends
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {hasEnoughData ? `${inspections.length} recorded inspections` : 'Insufficient dataset'}
        </span>
      </div>

      {!hasEnoughData ? (
        <div className="py-8 px-4 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
          <BarChart2 className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">
            More inspection data is needed to display trends.
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Complete at least 5 inspections to unlock activity timeline visualizations.
          </p>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1">
            <span className="font-semibold text-slate-700">Recent Inspection Volumes</span>
            <div className="flex items-center gap-3 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0B2545]" /> Total
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Passed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Issues
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 items-end h-24 pt-2 border-b border-slate-100 pb-2">
            {trendData.map((item) => {
              const heightPct = Math.max(Math.round((item.total / maxTotal) * 100), 15);
              const passPct = (item.passed / item.total) * 100;
              const issuePct = (item.issues / item.total) * 100;

              return (
                <div key={item.date} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[24px] bg-slate-200 rounded-t overflow-hidden flex flex-col-reverse relative group cursor-pointer"
                    title={`${item.date}: ${item.total} inspections (${item.passed} pass, ${item.issues} issues)`}
                  >
                    {item.passed > 0 && (
                      <div
                        style={{ height: `${passPct}%` }}
                        className="w-full bg-emerald-500"
                      />
                    )}
                    {item.issues > 0 && (
                      <div
                        style={{ height: `${issuePct}%` }}
                        className="w-full bg-rose-500"
                      />
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                    {item.date.split('-').slice(1).join('/')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
