import React from 'react';
import { ComplianceFinding, ComplianceStatus } from '../../types';
import { StatusIndicator } from '../../design-system/StatusIndicator';
import { AlertTriangle, ShieldAlert, FileText, CheckCircle2, UserCheck, BookOpen } from 'lucide-react';

interface FindingSectionProps {
  findings: ComplianceFinding[];
  className?: string;
}

export const FindingSection: React.FC<FindingSectionProps> = ({
  findings,
  className = '',
}) => {
  // Filter for findings that represent potential issues or review requirements, or all findings
  const nonPassFindings = findings.filter((f) => f.status !== 'pass');
  const displayFindings = nonPassFindings.length > 0 ? nonPassFindings : findings;

  return (
    <section className={`space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-[#0B2545]" />
          <span>5. Detailed Findings &amp; Statutory Assessment</span>
        </h2>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          {displayFindings.length} Detailed Record(s)
        </span>
      </div>

      {nonPassFindings.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-4 text-xs text-emerald-950 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <div className="font-bold">No Statutory Violations or Review Flags Identified</div>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              All declarations met the deterministic threshold criteria for this commodity category with sufficient optical confidence.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayFindings.map((finding, idx) => {
            // Determine reviewer determination status label
            let reviewerStatusLabel = 'Automated Assessment — Human Review Pending';
            let reviewerStatusClass = 'bg-slate-100 text-slate-700 border-slate-300';

            if (finding.auditTrail && finding.auditTrail.length > 0) {
              const lastAudit = finding.auditTrail[finding.auditTrail.length - 1];
              reviewerStatusLabel = `Review Complete: ${lastAudit.decisionLabel} by ${lastAudit.reviewer}`;
              reviewerStatusClass = 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold';
            } else if (finding.inspectorOverride?.overridden) {
              reviewerStatusLabel = `Inspector Override: ${finding.inspectorOverride.inspectorStatus?.toUpperCase()}`;
              reviewerStatusClass = 'bg-blue-50 text-blue-900 border-blue-300 font-bold';
            }

            return (
              <div
                key={finding.id}
                className="border border-slate-300 rounded-md overflow-hidden bg-white shadow-2xs space-y-0"
              >
                {/* Finding Header Strip */}
                <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                      Finding #{(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <StatusIndicator status={finding.status} size="sm" />
                    <span className="font-mono text-xs font-bold text-[#0B2545]">
                      {finding.ruleCode}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold text-slate-700">
                      AI Optical Confidence: {(finding.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Finding Title & Content Body */}
                <div className="p-4 space-y-3 text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">
                      {finding.ruleTitle}
                    </h3>
                    <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                      Statutory Act: <strong className="text-slate-800">{finding.legalAct}</strong>
                    </p>
                  </div>

                  {/* 2-Column Findings Detail Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Left: What Was Observed */}
                    <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                        What Was Observed (Label Text / Measurement)
                      </span>
                      <p className="text-slate-900 font-medium leading-relaxed">
                        {finding.whatWasObserved}
                      </p>
                    </div>

                    {/* Right: Why Flagged (Statutory Rationale) */}
                    <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                        Why It Was Flagged (Rule Mandate)
                      </span>
                      <p className="text-slate-800 leading-relaxed">
                        {finding.whyFlagged}
                      </p>
                    </div>
                  </div>

                  {/* Concrete Extracted Evidence */}
                  <div className="bg-slate-900 text-slate-100 rounded p-2.5 font-mono text-[11px] space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Extracted Evidence Snippet
                    </span>
                    <div className="text-slate-100 font-semibold">{finding.extractedEvidence}</div>
                  </div>

                  {/* Statutory Rule & Human Review Status Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>Rule Source: {finding.ruleSource || 'Ministry of Consumer Affairs'}</span>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono ${reviewerStatusClass}`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{reviewerStatusLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
