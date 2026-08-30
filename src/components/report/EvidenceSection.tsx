import React from 'react';
import { ComplianceFinding, InspectionSummary } from '../../types';
import { Crop, FileSearch, Sparkles, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

interface EvidenceSectionProps {
  inspection: InspectionSummary;
  className?: string;
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  inspection,
  className = '',
}) => {
  // Focus on findings that have potential issues or review requirements
  const evidenceFindings = inspection.findings.filter(
    (f) => f.status === 'non_compliant' || f.status === 'review_required'
  );

  return (
    <section className={`space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
          <FileSearch className="w-4 h-4 text-[#0B2545]" />
          <span>6. Supporting Evidence &amp; Optical Region Analysis</span>
        </h2>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          {evidenceFindings.length} Evidence Dossier(s)
        </span>
      </div>

      {evidenceFindings.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-slate-600">
          No non-compliant or review-required evidence regions flagged for this commodity.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidenceFindings.map((finding) => {
            const hasRegion = finding.hasReliableRegion && finding.evidenceRegion;

            return (
              <div
                key={finding.id}
                className="border border-slate-300 rounded bg-white p-4 space-y-3 shadow-2xs text-xs flex flex-col justify-between"
              >
                {/* Top: Finding Title & Code */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#0B2545] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {finding.ruleCode}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        finding.status === 'non_compliant'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {finding.status === 'non_compliant' ? 'Potential Issue' : 'Review Required'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mt-1">{finding.ruleTitle}</h3>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Analyzed Field: <strong className="text-slate-700">{finding.analyzedField}</strong>
                  </div>
                </div>

                {/* Evidence Region Visual / Box Indicator */}
                <div className="bg-slate-100 border border-slate-200 rounded p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Crop className="w-3.5 h-3.5 text-slate-500" />
                      Spatial Packaging Region:
                    </span>
                    <span className="text-slate-600">
                      {hasRegion ? finding.evidenceRegion?.label : 'Coordinate Scan'}
                    </span>
                  </div>

                  {hasRegion ? (
                    <div className="bg-white border border-blue-300 rounded p-2 text-xs font-mono space-y-1">
                      <div className="flex justify-between text-slate-600 text-[10px]">
                        <span>Bounding Box [X, Y, W, H]:</span>
                        <span className="font-bold text-slate-900">
                          [{finding.evidenceRegion?.x}%, {finding.evidenceRegion?.y}%,{' '}
                          {finding.evidenceRegion?.width}%, {finding.evidenceRegion?.height}%]
                        </span>
                      </div>
                      <div className="text-blue-950 font-bold text-[11px]">
                        Region: {finding.evidenceRegion?.label}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-300 rounded p-2.5 text-[11px] text-slate-600 italic">
                      Specific evidence region unavailable. Evaluated globally across label text transcript.
                    </div>
                  )}
                </div>

                {/* Extracted Optical Text & Rationale */}
                <div className="space-y-2">
                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] space-y-0.5">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">
                      Observed Label Snippet
                    </span>
                    <p className="font-mono font-medium text-slate-900">{finding.extractedEvidence}</p>
                  </div>

                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Deterministic Rationale:</strong>{' '}
                    {finding.reasoning}
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500">Optical Detection Confidence:</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded ${
                      finding.confidence >= 0.9
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {(finding.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
