import React from 'react';
import { ComplianceFinding, ComplianceStatus } from '../../types';
import { StatusIndicator } from '../../design-system/StatusIndicator';
import {
  AlertTriangle,
  ShieldAlert,
  FileText,
  CheckCircle2,
  UserCheck,
  BookOpen,
  Layers,
  ArrowRight,
} from 'lucide-react';

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
        <div>
          <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-[#0B2545]" />
            <span>6. Possible Violations &amp; Statutory Assessment</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
            Evaluated by issue, package side, physical evidence, and compliance status.
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          {displayFindings.length} Assessment Record(s)
        </span>
      </div>

      {nonPassFindings.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-4 text-xs text-emerald-950 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <div className="font-bold">No Statutory Violations or Review Flags Identified</div>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              All declarations across uploaded package sides met deterministic threshold criteria with sufficient optical confidence.
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

            const isConflict = Boolean(finding.hasConflict);

            return (
              <div
                key={finding.id}
                className={`border rounded-md overflow-hidden bg-white shadow-2xs space-y-0 ${
                  isConflict
                    ? 'border-amber-400 ring-1 ring-amber-300'
                    : finding.status === 'non_compliant'
                    ? 'border-rose-300'
                    : 'border-slate-300'
                }`}
              >
                {/* Finding Header Strip */}
                <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                      Record #{(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <StatusIndicator status={finding.status} size="sm" />
                    <span className="font-mono text-xs font-bold text-[#0B2545]">
                      {finding.ruleCode}
                    </span>

                    {/* Package Side Tag */}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        isConflict
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      Side: {finding.side || (isConflict ? 'Multiple Sides' : 'Front')}
                      {finding.sourceImageId && (
                        <span className="text-slate-500 font-normal">({finding.sourceImageId})</span>
                      )}
                    </span>

                    {isConflict && (
                      <span className="font-mono text-[10px] font-bold uppercase bg-amber-500 text-white px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Possible Declaration Conflict
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold text-slate-700">
                      Confidence: {(finding.confidence * 100).toFixed(0)}%
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

                  {/* Declaration Conflict Comparison Box (if multi-image conflict) */}
                  {isConflict && finding.conflictingDeclarations && finding.conflictingDeclarations.length > 0 && (
                    <div className="bg-amber-50 border border-amber-300 rounded p-3 space-y-2">
                      <div className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Conflicting Declarations Across Package Sides:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {finding.conflictingDeclarations.map((cd, cidx) => (
                          <div
                            key={cidx}
                            className="bg-white border border-amber-200 rounded p-2 text-xs font-mono space-y-1"
                          >
                            <div className="flex items-center justify-between text-slate-500 text-[10px]">
                              <span className="font-bold text-slate-900">Side: {cd.side}</span>
                              <span>Image: {cd.sourceImageId || (cd as any).imageId}</span>
                            </div>
                            <div className="text-slate-900 font-bold text-xs bg-slate-50 p-1 rounded border border-slate-200">
                              {cd.value}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-amber-900 leading-relaxed">
                        Rule 6 &amp; Rule 23 of LMPC Rules 2011 prohibit conflicting or deceptive declarations across packaging panels. Both panels are preserved as evidence for enforcement determination.
                      </p>
                    </div>
                  )}

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
                    <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                      <span>Extracted Evidence Snippet</span>
                      <span>Side: {finding.side || 'Front'}</span>
                    </div>
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
