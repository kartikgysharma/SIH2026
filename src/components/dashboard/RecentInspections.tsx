import React from 'react';
import { InspectionSummary } from '../../types';
import { InspectionComplianceBadge, ReviewStatusBadge } from '../history/InspectionStatus';
import { ScoreMeter } from '../../design-system/ScoreMeter';
import { Button } from '../../design-system/Button';
import { History, ChevronRight, FileText, Calendar, User, Package } from 'lucide-react';

interface RecentInspectionsProps {
  inspections: InspectionSummary[];
  onOpenInspection: (id: string) => void;
  onViewReport: (id: string) => void;
  onViewAllInspections: () => void;
}

export const RecentInspections: React.FC<RecentInspectionsProps> = ({
  inspections,
  onOpenInspection,
  onViewReport,
  onViewAllInspections,
}) => {
  // Sort latest inspections by date descending and show top 5
  const sortedRecent = [...inspections]
    .sort((a, b) => new Date(b.inspectedAt).getTime() - new Date(a.inspectedAt).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
      {/* Header with Title and "View All Inspections" link */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-900" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Recent Inspections
          </h2>
          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            Latest {sortedRecent.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onViewAllInspections}
          className="text-xs font-semibold text-blue-900 hover:text-blue-950 hover:underline flex items-center gap-1"
        >
          <span>View All Inspections</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {sortedRecent.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No recent inspections found for this period.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th scope="col" className="py-2.5 px-3">Product</th>
                  <th scope="col" className="py-2.5 px-3">Inspection ID</th>
                  <th scope="col" className="py-2.5 px-3">Date</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Score</th>
                  <th scope="col" className="py-2.5 px-3">Status</th>
                  <th scope="col" className="py-2.5 px-3">Review Status</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sortedRecent.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onOpenInspection(item.id)}
                  >
                    {/* Product */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                        {item.commodityName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.brandName} • {item.category}
                      </div>
                    </td>

                    {/* Inspection ID */}
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {item.inspectionNumber}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {item.inspectedAt.split(' ')[0]}
                    </td>

                    {/* Score */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-900">
                        <span>{item.complianceScore}</span>
                        <span className="text-slate-400 text-[10px]">/100</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <InspectionComplianceBadge status={item.overallStatus} size="sm" />
                    </td>

                    {/* Review Status */}
                    <td className="py-3 px-3">
                      <ReviewStatusBadge status={item.reviewStatus} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onOpenInspection(item.id)}
                          className="px-2.5 py-1 text-xs"
                        >
                          View
                        </Button>
                        <button
                          type="button"
                          onClick={() => onViewReport(item.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="View Official Report"
                          aria-label="View Official Report"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {sortedRecent.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenInspection(item.id)}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] font-bold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      {item.inspectionNumber}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">
                      {item.commodityName}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.brandName} • {item.category}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold font-mono text-slate-900">
                      {item.complianceScore}<span className="text-slate-400 text-[10px]">/100</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px] flex-wrap">
                  <InspectionComplianceBadge status={item.overallStatus} size="sm" />
                  <div className="text-slate-500 font-mono text-[10px]">
                    {item.inspectedAt.split(' ')[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
