import React from 'react';
import { InspectionSummary, ComplianceStatus } from '../../types';
import { CheckCircle2, AlertTriangle, HelpCircle, ShieldCheck, AlertOctagon } from 'lucide-react';

interface ReportSummaryProps {
  inspection: InspectionSummary;
  className?: string;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({
  inspection,
  className = '',
}) => {
  const {
    complianceScore,
    passCount,
    nonCompliantCount,
    reviewRequiredCount,
    totalRulesEvaluated,
    overallStatus,
  } = inspection;

  // Final Assessment Status Terminology
  let finalStatusTitle = 'Assessment Passed';
  let finalStatusClass = 'bg-emerald-50 text-emerald-950 border-emerald-300';
  let FinalStatusIcon = CheckCircle2;
  let finalStatusDesc =
    'All evaluated statutory declarations conform to active Legal Metrology rules with high optical confidence.';

  if (overallStatus === 'non_compliant' || nonCompliantCount > 0) {
    finalStatusTitle = 'Potential Issues Detected';
    finalStatusClass = 'bg-rose-50 text-rose-950 border-rose-300';
    FinalStatusIcon = AlertOctagon;
    finalStatusDesc = `${nonCompliantCount} potential statutory deviation(s) flagged during rule evaluation requiring inspector action or packaging correction.`;
  } else if (overallStatus === 'review_required' || reviewRequiredCount > 0) {
    finalStatusTitle = 'Review Required';
    finalStatusClass = 'bg-amber-50 text-amber-950 border-amber-300';
    FinalStatusIcon = AlertTriangle;
    finalStatusDesc = `${reviewRequiredCount} declaration(s) have borderline confidence or physical curvature factors requiring manual inspector verification.`;
  }

  return (
    <section className={`space-y-3.5 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#0B2545]" />
          <span>1. Executive Summary &amp; Assessment Score</span>
        </h2>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          {totalRulesEvaluated} Statutory Rules Evaluated
        </span>
      </div>

      {/* Main Score & Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
        {/* Compliance Assessment Score Box (5 Cols) */}
        <div className="md:col-span-5 bg-slate-900 text-white rounded p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              AI-Assisted Compliance Assessment
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {complianceScore}
              </span>
              <span className="text-lg font-mono text-slate-400 font-bold">/ 100</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2 text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-amber-300 font-mono">Notice:</strong> This index reflects automated optical extraction and deterministic legal metrology rule scoring. It is an <span className="underline decoration-slate-600">AI-assisted assessment aid</span>, not a statutory certification.
          </div>
        </div>

        {/* Breakdown Metric Tiles (7 Cols) */}
        <div className="md:col-span-7 grid grid-cols-3 gap-2.5">
          {/* Checks Passed */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase font-bold text-emerald-900">
              <span>Checks Passed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-950 mt-2">
              {passCount}
            </div>
            <div className="text-[10px] text-emerald-800 mt-1 font-medium">
              Conforms to Rule
            </div>
          </div>

          {/* Potential Issues */}
          <div className="bg-rose-50/70 border border-rose-200 rounded p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase font-bold text-rose-900">
              <span>Potential Issues</span>
              <AlertOctagon className="w-3.5 h-3.5 text-rose-700" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-rose-950 mt-2">
              {nonCompliantCount}
            </div>
            <div className="text-[10px] text-rose-800 mt-1 font-medium">
              Flagged Deviations
            </div>
          </div>

          {/* Review Required */}
          <div className="bg-amber-50/70 border border-amber-200 rounded p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase font-bold text-amber-900">
              <span>Review Required</span>
              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-amber-950 mt-2">
              {reviewRequiredCount}
            </div>
            <div className="text-[10px] text-amber-800 mt-1 font-medium">
              Human Check Needed
            </div>
          </div>
        </div>
      </div>

      {/* Overall Assessment Status Banner */}
      <div className={`border rounded p-3 flex items-start gap-3 ${finalStatusClass}`}>
        <FinalStatusIcon className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <div className="font-extrabold uppercase font-mono tracking-wide">
            Final Inspection Status: {finalStatusTitle}
          </div>
          <p className="leading-relaxed text-slate-800">{finalStatusDesc}</p>
        </div>
      </div>
    </section>
  );
};
