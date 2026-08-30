import React from 'react';
import { InspectionSummary, ComplianceFinding, ComplianceStatus } from '../../types';
import { StatusIndicator } from '../../design-system/StatusIndicator';
import { ClipboardCheck } from 'lucide-react';

interface ComplianceCheckTableProps {
  inspection: InspectionSummary;
  className?: string;
}

export const ComplianceCheckTable: React.FC<ComplianceCheckTableProps> = ({
  inspection,
  className = '',
}) => {
  const { findings, fields } = inspection;

  // Build a consolidated list of evaluated checks across findings and fields
  const checksList = findings.map((f, index) => {
    // Check if there is an associated field
    const associatedField = fields.find(
      (fld) =>
        fld.fieldName.toLowerCase() === f.analyzedField.toLowerCase() ||
        fld.fieldKey.toLowerCase().includes(f.analyzedField.toLowerCase())
    );

    // Determine evidence summary label
    let evidenceLabel = 'Detected in Label Text';
    if (f.hasReliableRegion && f.evidenceRegion) {
      evidenceLabel = `Region Highlighted: ${f.evidenceRegion.label}`;
    } else if (f.status === 'non_compliant') {
      evidenceLabel = 'Absence Observed on Panel';
    } else if (f.status === 'review_required') {
      evidenceLabel = 'Borderline Optical Contrast';
    }

    return {
      id: f.id,
      index: index + 1,
      checkTitle: f.analyzedField || f.ruleTitle,
      ruleCode: f.ruleCode,
      status: f.status,
      extractedValue: f.detectedValue || f.extractedEvidence,
      confidence: f.confidence,
      evidence: evidenceLabel,
      ruleReference: f.ruleReference || f.legalAct,
    };
  });

  return (
    <section className={`space-y-3 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
          <ClipboardCheck className="w-4 h-4 text-[#0B2545]" />
          <span>4. Deterministic Statutory Compliance Table</span>
        </h2>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          {checksList.length} Checks Documented
        </span>
      </div>

      {/* Table Container */}
      <div className="border border-slate-200 rounded overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-600">
              <th className="py-2 px-2.5 w-1/4">Evaluated Requirement</th>
              <th className="py-2 px-2 text-center w-28">Result</th>
              <th className="py-2 px-2.5 w-1/4">Extracted Packaging Value</th>
              <th className="py-2 px-2 text-center w-16">Conf.</th>
              <th className="py-2 px-2.5 w-1/5">Evidence Location</th>
              <th className="py-2 px-2.5 text-right font-mono">Rule Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {checksList.map((chk, idx) => {
              const isViolation = chk.status === 'non_compliant';
              const isReview = chk.status === 'review_required';

              return (
                <tr
                  key={chk.id}
                  className={`${
                    isViolation
                      ? 'bg-rose-50/40 hover:bg-rose-50/70'
                      : isReview
                      ? 'bg-amber-50/40 hover:bg-amber-50/70'
                      : idx % 2 === 0
                      ? 'bg-white hover:bg-slate-50/70'
                      : 'bg-slate-50/40 hover:bg-slate-50'
                  }`}
                >
                  {/* Evaluated Requirement */}
                  <td className="py-2.5 px-2.5 align-top">
                    <div className="font-bold text-slate-900 leading-tight">
                      {chk.checkTitle}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                      Check #{chk.index.toString().padStart(2, '0')}
                    </div>
                  </td>

                  {/* Result Indicator */}
                  <td className="py-2.5 px-2 text-center align-top whitespace-nowrap">
                    <StatusIndicator status={chk.status} size="sm" />
                  </td>

                  {/* Extracted Packaging Value */}
                  <td className="py-2.5 px-2.5 font-mono text-[11px] text-slate-900 align-top leading-relaxed break-words">
                    {chk.extractedValue}
                  </td>

                  {/* Confidence */}
                  <td className="py-2.5 px-2 text-center font-mono text-[11px] font-bold text-slate-700 align-top">
                    {(chk.confidence * 100).toFixed(0)}%
                  </td>

                  {/* Evidence Location */}
                  <td className="py-2.5 px-2.5 text-[11px] text-slate-600 align-top leading-tight">
                    {chk.evidence}
                  </td>

                  {/* Rule Reference */}
                  <td className="py-2.5 px-2.5 text-right font-mono text-[10px] font-bold text-[#0B2545] align-top whitespace-nowrap">
                    {chk.ruleCode}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
