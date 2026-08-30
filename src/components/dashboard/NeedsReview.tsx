import React from 'react';
import { InspectionSummary, ComplianceFinding } from '../../types';
import { Button } from '../../design-system/Button';
import { InspectionComplianceBadge } from '../history/InspectionStatus';
import { Inbox, CheckCircle2, ChevronRight, AlertTriangle, HelpCircle, Calendar, Sparkles } from 'lucide-react';

interface NeedsReviewProps {
  inspections: InspectionSummary[];
  onReviewItem: (inspectionId: string, findingId?: string) => void;
  onViewAllInReviewQueue: () => void;
}

export const NeedsReview: React.FC<NeedsReviewProps> = ({
  inspections,
  onReviewItem,
  onViewAllInReviewQueue,
}) => {
  // Collect all findings that require review or have potential issues not yet reviewed
  const reviewItems: {
    inspection: InspectionSummary;
    finding: ComplianceFinding;
  }[] = [];

  inspections.forEach((insp) => {
    insp.findings.forEach((finding) => {
      const isReviewed = finding.auditTrail && finding.auditTrail.length > 0;
      if (!isReviewed && (finding.status === 'review_required' || finding.status === 'non_compliant')) {
        reviewItems.push({ inspection: insp, finding });
      }
    });
  });

  // Limit to top 5 items for concise operational focus
  const displayedItems = reviewItems.slice(0, 5);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-amber-700" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Needs Review
          </h2>
          {reviewItems.length > 0 && (
            <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
              {reviewItems.length} pending
            </span>
          )}
        </div>
        {reviewItems.length > 5 && (
          <button
            type="button"
            onClick={onViewAllInReviewQueue}
            className="text-xs font-semibold text-blue-900 hover:text-blue-950 hover:underline flex items-center gap-0.5"
          >
            <span>View all in Review Queue ({reviewItems.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {displayedItems.length === 0 ? (
        /* Empty State: You're all caught up */
        <div className="py-8 px-4 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">You're all caught up</h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
            No inspections currently require review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedItems.map(({ inspection, finding }) => (
            <div
              key={`${inspection.id}-${finding.id}`}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {inspection.commodityName}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    ({inspection.brandName})
                  </span>
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                    {inspection.inspectionNumber}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium line-clamp-1">
                  <span className="font-semibold text-slate-900">{finding.ruleTitle}:</span>{' '}
                  {finding.whatWasObserved || finding.reasoning}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap pt-0.5">
                  <div className="flex items-center gap-1 font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    <span>{(finding.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{inspection.inspectedAt.split(' ')[0]}</span>
                  </div>
                  <InspectionComplianceBadge status={finding.status} size="sm" />
                </div>
              </div>

              {/* Action Button: Review */}
              <div className="shrink-0 flex items-center justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onReviewItem(inspection.id, finding.id)}
                  className="w-full sm:w-auto justify-center"
                >
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
