import React from 'react';
import { InspectionSummary } from '../../types';
import { InspectionReportHeader } from './InspectionReportHeader';
import { ReportSummary } from './ReportSummary';
import { ProductInformation } from './ProductInformation';
import { ProductImage } from './ProductImage';
import { ComplianceCheckTable } from './ComplianceCheckTable';
import { FindingSection } from './FindingSection';
import { EvidenceSection } from './EvidenceSection';
import { RuleReference } from './RuleReference';
import { ReviewInformation } from './ReviewInformation';
import { AuditTimeline } from './AuditTimeline';
import { ReportActions } from './ReportActions';
import { Scale, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';

interface InspectionReportViewProps {
  inspection: InspectionSummary;
  onBackToInspection?: () => void;
  className?: string;
  id?: string;
}

export const InspectionReportView: React.FC<InspectionReportViewProps> = ({
  inspection,
  onBackToInspection,
  className = '',
  id,
}) => {
  const generatedDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div id={id} className={`space-y-6 max-w-5xl mx-auto ${className}`}>
      {/* Top Floating Actions Bar (Excluded from Print) */}
      <ReportActions
        inspection={inspection}
        onBackToInspection={onBackToInspection}
      />

      {/* Main Centered Document Container (Optimized for Screen & Print) */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6 sm:p-10 lg:p-12 space-y-8 text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* 1. Report Header */}
        <InspectionReportHeader
          inspection={inspection}
          generatedAt={generatedDate}
        />

        {/* 2. Executive Summary & Assessment Score */}
        <ReportSummary inspection={inspection} />

        {/* 3. Structured Product Declarations */}
        <ProductInformation inspection={inspection} />

        {/* 4. Inspected Product Label Evidence Image */}
        <ProductImage inspection={inspection} />

        {/* 5. Compliance Check Table */}
        <ComplianceCheckTable inspection={inspection} />

        {/* 6. Findings Section */}
        <FindingSection findings={inspection.findings} />

        {/* 7. Evidence Dossier Section */}
        <EvidenceSection inspection={inspection} />

        {/* 8. Statutory Rule References */}
        <RuleReference inspection={inspection} />

        {/* 9. Human Review Information */}
        <ReviewInformation inspection={inspection} />

        {/* 10. Audit Lifecycle Timeline */}
        <AuditTimeline inspection={inspection} />

        {/* 11. Official Verification & Digital Attestation Block */}
        <div className="border-t-2 border-slate-900 pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
            {/* Left: Statutory Notice & Subtle Disclaimer */}
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 font-mono uppercase text-[11px]">
                <Scale className="w-3.5 h-3.5 text-[#0B2545]" />
                <span>Statutory Notice &amp; Platform Disclaimer</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                BharatLabel AI provides AI-assisted inspection and compliance assessment. Automated results may require human verification and should not be treated as a substitute for an authorized legal or regulatory determination.
              </p>
            </div>

            {/* Right: Digital Signature / Officer Endorsement Box */}
            <div className="border border-slate-300 rounded p-3.5 bg-slate-50 space-y-2 text-xs text-right sm:text-right">
              <div className="font-mono text-[10px] uppercase font-bold text-slate-500">
                Official Digital Attestation
              </div>
              <div className="font-extrabold text-slate-900 text-sm">
                {inspection.inspectorName || 'Rajesh Varma'}
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                Badge / Reg No: <strong className="text-slate-800">{inspection.inspectorBadgeNumber || 'LM-DEL-8492'}</strong>
              </div>
              <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Record ID: {inspection.id} • Digitally Traceable</span>
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono text-slate-400 gap-1">
            <span>BharatLabel AI • Legal Metrology Packaged Commodities Inspection System</span>
            <span>Report Generated on: {generatedDate}</span>
          </div>
        </div>
      </div>

      {/* Bottom Floating Actions Bar (Repeated for convenience on long scroll, No-print) */}
      <ReportActions
        inspection={inspection}
        onBackToInspection={onBackToInspection}
      />
    </div>
  );
};
