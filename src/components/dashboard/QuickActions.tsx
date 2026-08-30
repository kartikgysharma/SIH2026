import React from 'react';
import { Button } from '../../design-system/Button';
import { Scan, History, FileText, Sparkles, Inbox } from 'lucide-react';

interface QuickActionsProps {
  onScanProduct: () => void;
  onViewInspections: () => void;
  onViewReports: () => void;
  onViewReviewQueue: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onScanProduct,
  onViewInspections,
  onViewReports,
  onViewReviewQueue,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Sparkles className="w-4 h-4 text-blue-900" />
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Quick Actions
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Primary Action: Scan Product */}
        <Button
          variant="primary"
          size="md"
          leftIcon={<Scan className="w-4 h-4 text-blue-300" />}
          onClick={onScanProduct}
          className="font-bold shadow-xs"
        >
          Scan Product
        </Button>

        {/* Secondary: View Inspections */}
        <Button
          variant="secondary"
          size="md"
          leftIcon={<History className="w-4 h-4 text-slate-600" />}
          onClick={onViewInspections}
        >
          View All Inspections
        </Button>

        {/* Optional: Review Queue */}
        <Button
          variant="outline"
          size="md"
          leftIcon={<Inbox className="w-4 h-4 text-amber-700" />}
          onClick={onViewReviewQueue}
        >
          Human Review Queue
        </Button>

        {/* Optional: View Reports */}
        <Button
          variant="outline"
          size="md"
          leftIcon={<FileText className="w-4 h-4 text-slate-600" />}
          onClick={onViewReports}
        >
          Official Reports
        </Button>
      </div>
    </div>
  );
};
