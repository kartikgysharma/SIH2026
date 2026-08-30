import React from 'react';
import { InspectionSummary, ReviewAuditEntry } from '../../types';
import { UserCheck, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

interface ReviewInformationProps {
  inspection: InspectionSummary;
  className?: string;
}

export const ReviewInformation: React.FC<ReviewInformationProps> = ({
  inspection,
  className = '',
}) => {
  // Collect all audit entries across findings
  const allAuditEntries: Array<
    ReviewAuditEntry & { findingTitle: string; ruleCode: string }
  > = [];

  inspection.findings.forEach((f) => {
    if (f.auditTrail && f.auditTrail.length > 0) {
      f.auditTrail.forEach((entry) => {
        allAuditEntries.push({
          ...entry,
          findingTitle: f.ruleTitle,
          ruleCode: f.ruleCode,
        });
      });
    }
  });

  const hasHumanReview = allAuditEntries.length > 0;

  return (
    <section className={`space-y-3 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-[#0B2545]" />
          <span>8. Human Review &amp; Statutory Officer Determinations</span>
        </h2>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          {hasHumanReview ? `${allAuditEntries.length} Recorded Review Action(s)` : 'Verification Pending'}
        </span>
      </div>

      {!hasHumanReview ? (
        <div className="bg-slate-50 border border-slate-300 rounded p-4 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-900 font-mono">
            <Clock className="w-4 h-4 text-slate-500" />
            Automated assessment — human verification pending
          </div>
          <p className="text-slate-600 leading-relaxed">
            This observation record was generated directly from automated optical character extraction and rule engine evaluation. Official enforcement or statutory notices require physical verification by an authorized Legal Metrology Officer.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="border border-slate-200 rounded overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-600">
                  <th className="py-2 px-2.5 w-1/4">Reviewer / Officer</th>
                  <th className="py-2 px-2.5 w-1/4">Finding / Rule</th>
                  <th className="py-2 px-2.5 w-1/5">Determination</th>
                  <th className="py-2 px-2.5">Officer Note / Statutory Rationale</th>
                  <th className="py-2 px-2 text-right font-mono">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allAuditEntries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {/* Reviewer & Role */}
                    <td className="py-2.5 px-2.5 align-top">
                      <div className="font-bold text-slate-900">{entry.reviewer}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {entry.role || 'Legal Metrology Officer'}
                      </div>
                      {entry.reviewerBadge && (
                        <div className="font-mono text-[10px] text-slate-400">
                          Badge: {entry.reviewerBadge}
                        </div>
                      )}
                    </td>

                    {/* Finding */}
                    <td className="py-2.5 px-2.5 align-top">
                      <div className="font-mono text-[10px] font-bold text-[#0B2545]">
                        {entry.ruleCode}
                      </div>
                      <div className="text-[11px] text-slate-800 font-medium leading-tight mt-0.5">
                        {entry.findingTitle}
                      </div>
                    </td>

                    {/* Determination */}
                    <td className="py-2.5 px-2.5 align-top">
                      <span className="font-mono text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-300 inline-block">
                        {entry.decisionLabel}
                      </span>
                    </td>

                    {/* Note */}
                    <td className="py-2.5 px-2.5 align-top text-[11px] text-slate-700 leading-relaxed">
                      {entry.note ? `"${entry.note}"` : 'Declaration manually verified by officer.'}
                    </td>

                    {/* Timestamp */}
                    <td className="py-2.5 px-2 text-right align-top font-mono text-[10px] text-slate-500 whitespace-nowrap">
                      {entry.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
