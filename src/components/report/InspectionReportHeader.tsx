import React from 'react';
import { InspectionSummary, ReviewWorkflowStatus } from '../../types';
import { Scale, FileText, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface InspectionReportHeaderProps {
  inspection: InspectionSummary;
  generatedAt?: string;
  className?: string;
}

export const InspectionReportHeader: React.FC<InspectionReportHeaderProps> = ({
  inspection,
  generatedAt = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }),
  className = '',
}) => {
  // Determine overall review status label
  const hasHumanAudit = inspection.findings.some(
    (f) => f.auditTrail && f.auditTrail.length > 0
  );

  let reportStatusLabel = 'Automated Assessment Complete';
  let reportStatusClass = 'bg-slate-100 text-slate-800 border-slate-300';
  let StatusIcon = Clock;

  if (hasHumanAudit) {
    reportStatusLabel = 'Human Review Verified';
    reportStatusClass = 'bg-emerald-50 text-emerald-900 border-emerald-300';
    StatusIcon = CheckCircle2;
  } else if (inspection.overallStatus === 'review_required') {
    reportStatusLabel = 'Human Verification Required';
    reportStatusClass = 'bg-amber-50 text-amber-900 border-amber-300';
    StatusIcon = AlertTriangle;
  } else if (inspection.overallStatus === 'non_compliant') {
    reportStatusLabel = 'Potential Issues Flagged';
    reportStatusClass = 'bg-rose-50 text-rose-900 border-rose-300';
    StatusIcon = AlertTriangle;
  }

  // Parse inspection date and time
  const [inspDate, inspTime] = inspection.inspectedAt.includes(' ')
    ? inspection.inspectedAt.split(' ')
    : [inspection.inspectedAt, ''];

  return (
    <header className={`border-b-2 border-slate-900 pb-5 space-y-4 ${className}`}>
      {/* Top Banner / Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#0B2545] text-white flex items-center justify-center font-extrabold text-sm shadow-2xs">
            BL
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-slate-800 uppercase flex items-center gap-1.5">
              <span>BHARATLABEL COMPLIANCE</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-sans font-normal">Inspection Platform</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Legal Metrology Act, 2009 &amp; Packaged Commodities Rules, 2011
            </div>
          </div>
        </div>

        {/* Report Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded border ${reportStatusClass}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{reportStatusLabel}</span>
          </span>
        </div>
      </div>

      {/* Main Document Title */}
      <div className="text-center space-y-1 py-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight uppercase">
          Packaged Commodity Inspection Report
        </h1>
        <p className="text-xs text-slate-600 font-medium max-w-xl mx-auto">
          Official statutory observation record generated from optical evidence analysis, deterministic legal metrology rule verification, and human inspection review.
        </p>
      </div>

      {/* Key Metadata Document Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded p-3 text-xs">
        <div>
          <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">
            Inspection ID
          </span>
          <span className="font-mono font-extrabold text-slate-900">{inspection.inspectionNumber}</span>
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">
            Inspection Date &amp; Time
          </span>
          <span className="font-semibold text-slate-800">
            {inspDate} {inspTime ? `• ${inspTime}` : ''}
          </span>
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">
            Inspector / Reviewer
          </span>
          <span className="font-semibold text-slate-800">
            {inspection.inspectorName || 'Rajesh Varma'}{' '}
            <span className="font-mono text-[11px] text-slate-500">
              ({inspection.inspectorBadgeNumber || 'LM-DEL-8492'})
            </span>
          </span>
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">
            Product Category
          </span>
          <span className="font-semibold text-slate-800">{inspection.category}</span>
        </div>
      </div>

      {/* Product Name Identifier Banner */}
      <div className="bg-slate-900 text-white rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
            Inspected Commodity
          </div>
          <div className="text-sm sm:text-base font-extrabold text-white truncate">
            {inspection.commodityName}
          </div>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
            Brand / Principal Mark
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-200">
            {inspection.brandName}
          </div>
        </div>
      </div>
    </header>
  );
};
