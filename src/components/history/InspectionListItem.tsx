import React from 'react';
import { InspectionSummary } from '../../types';
import { InspectionComplianceBadge, ReviewStatusBadge } from './InspectionStatus';
import { Button } from '../../design-system/Button';
import { Calendar, User, ChevronRight, FileText, Package } from 'lucide-react';

interface InspectionListItemProps {
  inspection: InspectionSummary;
  onOpenInspection: (id: string) => void;
  onViewReport: (id: string) => void;
}

export const InspectionListItem: React.FC<InspectionListItemProps> = ({
  inspection,
  onOpenInspection,
  onViewReport,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 transition-all hover:border-slate-300 hover:shadow-xs flex flex-col gap-3">
      {/* Top Header: ID, Date, Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {inspection.inspectionNumber}
            </span>
            <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
              {inspection.category}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">
            {inspection.commodityName}
          </h4>
          <p className="text-xs text-slate-500 truncate">
            {inspection.brandName} • {inspection.manufacturerName.split(',')[0]}
          </p>
        </div>

        {/* Score Pill */}
        <div className="text-right shrink-0">
          <div className="text-base font-bold font-mono text-slate-900 leading-tight">
            {inspection.complianceScore}
            <span className="text-slate-400 text-xs font-normal">/100</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Assessment
          </span>
        </div>
      </div>

      {/* Meta Bar: Statuses and Inspector */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <InspectionComplianceBadge status={inspection.overallStatus} size="sm" />
          <ReviewStatusBadge status={inspection.reviewStatus} size="sm" />
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{inspection.inspectedAt.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[110px]">{inspection.inspectorName}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onOpenInspection(inspection.id)}
          className="flex-1 justify-center"
        >
          <span>Open Inspection</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<FileText className="w-3.5 h-3.5 text-slate-500" />}
          onClick={() => onViewReport(inspection.id)}
          className="px-3"
          title="View Official Report"
        >
          <span>Report</span>
        </Button>
      </div>
    </div>
  );
};
