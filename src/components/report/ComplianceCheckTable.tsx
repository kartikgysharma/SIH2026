import React from 'react';
import { InspectionSummary, ComplianceFinding, ComplianceStatus } from '../../types';
import { StatusIndicator } from '../../design-system/StatusIndicator';
import { ClipboardCheck, AlertTriangle, Layers } from 'lucide-react';

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
        fld.fieldKey.toLowerCase().includes(f.analyzedField.toLowerCase()) ||
        f.id.replace('find-', '') === fld.id.replace('f-', '')
    );

    const side = f.side || associatedField?.side || (f.hasConflict ? 'Multiple Sides' : 'Front');
    const sourceImageId = f.sourceImageId || associatedField?.sourceImageId || 'img_1';
    const hasConflict = Boolean(f.hasConflict || associatedField?.hasConflict);
    const conflictingDeclarations = f.conflictingDeclarations || associatedField?.conflictingDeclarations;

    // Determine evidence summary label
    let evidenceLabel = `Panel: ${side}`;
    if (f.hasReliableRegion && f.evidenceRegion) {
      evidenceLabel = `${side} (${f.evidenceRegion.label})`;
    } else if (f.status === 'non_compliant') {
      evidenceLabel = 'Missing across uploaded sides';
    }

    return {
      id: f.id,
      index: index + 1,
      declaration: f.analyzedField || f.ruleTitle,
      ruleTitle: f.ruleTitle,
      ruleCode: f.ruleCode,
      status: f.status,
      value: f.detectedValue || f.extractedEvidence,
      side,
      sourceImageId,
      confidence: f.confidence,
      hasConflict,
      conflictingDeclarations,
      evidence: evidenceLabel,
      ruleReference: f.ruleReference || f.legalAct,
    };
  });

  return (
    <section className={`space-y-3 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div>
          <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
            <ClipboardCheck className="w-4 h-4 text-[#0B2545]" />
            <span>5. Extracted Declarations &amp; Statutory Compliance</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
            Traceable to source package panels and optical extraction confidence.
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          {checksList.length} Declarations Verified
        </span>
      </div>

      {/* Table Container */}
      <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-600">
                <th className="py-2.5 px-3 w-1/4">Declaration</th>
                <th className="py-2.5 px-3 w-1/4">Extracted Value</th>
                <th className="py-2.5 px-2.5 text-center w-28">Package Side</th>
                <th className="py-2.5 px-2.5 text-center w-24">Source Image</th>
                <th className="py-2.5 px-2 text-center w-18">Confidence</th>
                <th className="py-2.5 px-2.5 text-center w-28">Status</th>
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
                      chk.hasConflict
                        ? 'bg-amber-50/70 hover:bg-amber-50'
                        : isViolation
                        ? 'bg-rose-50/40 hover:bg-rose-50/70'
                        : isReview
                        ? 'bg-amber-50/30 hover:bg-amber-50/60'
                        : idx % 2 === 0
                        ? 'bg-white hover:bg-slate-50/70'
                        : 'bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    {/* Declaration */}
                    <td className="py-3 px-3 align-top">
                      <div className="font-bold text-slate-900 leading-tight">
                        {chk.declaration}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-[#0B2545]">{chk.ruleCode}</span>
                        <span>•</span>
                        <span>Check #{chk.index.toString().padStart(2, '0')}</span>
                      </div>
                    </td>

                    {/* Extracted Value */}
                    <td className="py-3 px-3 align-top">
                      {chk.hasConflict ? (
                        <div className="space-y-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3 text-amber-700" />
                            Possible Declaration Conflict
                          </span>
                          <div className="font-mono text-[11px] text-amber-950 font-bold bg-white p-2 rounded border border-amber-200">
                            {chk.value}
                          </div>
                          {chk.conflictingDeclarations && chk.conflictingDeclarations.length > 0 && (
                            <div className="space-y-1 text-[10px] font-mono text-slate-600">
                              {chk.conflictingDeclarations.map((cd, cidx) => (
                                <div key={cidx} className="flex items-center gap-1">
                                  <span className="font-bold text-slate-800">[{cd.side}]:</span>
                                  <span>&quot;{cd.value}&quot;</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="font-mono text-[11px] text-slate-900 leading-relaxed break-words font-medium">
                          {chk.value}
                        </div>
                      )}
                    </td>

                    {/* Package Side */}
                    <td className="py-3 px-2.5 text-center align-top whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          chk.side === 'Front'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : chk.side === 'Back'
                            ? 'bg-slate-100 text-slate-800 border border-slate-300'
                            : chk.side === 'Multiple Sides'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {chk.side}
                      </span>
                    </td>

                    {/* Source Image */}
                    <td className="py-3 px-2.5 text-center align-top whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-500" />
                        {chk.sourceImageId}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-2 text-center font-mono text-[11px] font-bold text-slate-700 align-top">
                      {(chk.confidence * 100).toFixed(0)}%
                    </td>

                    {/* Status Indicator */}
                    <td className="py-3 px-2.5 text-center align-top whitespace-nowrap">
                      <StatusIndicator status={chk.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
