import React from 'react';
import { ComplianceFinding, InspectionSummary } from '../../types';
import { Crop, FileSearch, Sparkles, CheckCircle2, AlertOctagon, HelpCircle, Layers, Image as ImageIcon } from 'lucide-react';

interface EvidenceSectionProps {
  inspection: InspectionSummary;
  className?: string;
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  inspection,
  className = '',
}) => {
  // Focus on findings that have potential issues, review requirements, or conflicts
  const evidenceFindings = inspection.findings.filter(
    (f) => f.status === 'non_compliant' || f.status === 'review_required' || f.hasConflict
  );

  // Helper to find image URL by ID or side
  const getImageForFinding = (sourceImageId?: string, side?: string) => {
    if (!inspection.packageImages || inspection.packageImages.length === 0) {
      return inspection.imageUrl;
    }
    const match = inspection.packageImages.find(
      (img) => img.id === sourceImageId || img.side === side
    );
    return match?.url || inspection.imageUrl;
  };

  return (
    <section className={`space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div>
          <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
            <FileSearch className="w-4 h-4 text-[#0B2545]" />
            <span>7. Supporting Evidence &amp; Optical Region Analysis</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
            Every evidence item is directly linked to its source package image and panel side.
          </p>
        </div>
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
            const side = finding.side || (finding.hasConflict ? 'Multiple Sides' : 'Front');
            const sourceImageId = finding.sourceImageId || 'img_1';
            const imgUrl = getImageForFinding(finding.sourceImageId, finding.side);

            return (
              <div
                key={finding.id}
                className="border border-slate-300 rounded-lg bg-white p-4 space-y-3 shadow-2xs text-xs flex flex-col justify-between"
              >
                {/* Top: Finding Title & Code & Source Image Tag */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-[#0B2545] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {finding.ruleCode}
                      </span>
                      {/* Explicit Package Side & Image ID Tag */}
                      <span className="font-mono text-[10px] font-bold uppercase bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300 inline-flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-600" />
                        {side} • {sourceImageId}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        finding.hasConflict
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : finding.status === 'non_compliant'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {finding.hasConflict
                        ? 'Declaration Conflict'
                        : finding.status === 'non_compliant'
                        ? 'Potential Issue'
                        : 'Review Required'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 mt-1">{finding.ruleTitle}</h3>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Analyzed Field: <strong className="text-slate-700">{finding.analyzedField}</strong>
                  </div>
                </div>

                {/* Conflict Multi-Image Comparison (if conflict) */}
                {finding.hasConflict && finding.conflictingDeclarations && (
                  <div className="bg-amber-50/80 border border-amber-300 rounded p-2.5 space-y-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-900 block">
                      Multi-Image Evidence Comparison
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      {finding.conflictingDeclarations.map((cd, cidx) => (
                        <div key={cidx} className="bg-white p-2 rounded border border-amber-200 space-y-1">
                          <div className="font-bold text-slate-800 flex items-center justify-between">
                            <span>Panel: {cd.side}</span>
                            <span className="text-slate-500">{cd.sourceImageId || (cd as any).imageId}</span>
                          </div>
                          <div className="text-slate-900 font-bold bg-slate-50 p-1 rounded">
                            {cd.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence Region Visual / Box Indicator */}
                <div className="bg-slate-100 border border-slate-200 rounded p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Crop className="w-3.5 h-3.5 text-slate-500" />
                      Evidence Region on {side} ({sourceImageId}):
                    </span>
                    <span className="text-slate-600">
                      {hasRegion ? finding.evidenceRegion?.label : 'Optical Text Scan'}
                    </span>
                  </div>

                  {hasRegion ? (
                    <div className="bg-white border border-blue-300 rounded p-2 text-xs font-mono space-y-1">
                      <div className="flex justify-between text-slate-600 text-[10px]">
                        <span>Spatial Bounds [X, Y, W, H]:</span>
                        <span className="font-bold text-slate-900">
                          [{finding.evidenceRegion?.x}%, {finding.evidenceRegion?.y}%,{' '}
                          {finding.evidenceRegion?.width}%, {finding.evidenceRegion?.height}%]
                        </span>
                      </div>
                      <div className="text-blue-950 font-bold text-[11px] flex items-center justify-between">
                        <span>Label: {finding.evidenceRegion?.label}</span>
                        <span className="text-slate-500 text-[10px]">Source Panel: {side}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-300 rounded p-2.5 text-[11px] text-slate-600 italic">
                      Identified in label transcript across {side} panel.
                    </div>
                  )}
                </div>

                {/* Extracted Optical Text & Rationale */}
                <div className="space-y-2">
                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono uppercase font-bold">
                      <span>Observed Label Quote</span>
                      <span>{side}</span>
                    </div>
                    <p className="font-mono font-medium text-slate-900">{finding.extractedEvidence}</p>
                  </div>

                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Deterministic Rationale:</strong>{' '}
                    {finding.reasoning}
                  </div>
                </div>

                {/* Footer: Optical Confidence & Source Traceability */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500">
                    Source: <strong className="text-slate-800">{sourceImageId}</strong> ({side})
                  </span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded ${
                      finding.confidence >= 0.9
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    Optical Conf: {(finding.confidence * 100).toFixed(0)}%
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
