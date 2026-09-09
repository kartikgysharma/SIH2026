import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, XCircle, HelpCircle, Info } from 'lucide-react';
import { InspectionSummary } from '../../types';

interface TamperingReportSectionProps {
  inspection: InspectionSummary;
  className?: string;
}

export const TamperingReportSection: React.FC<TamperingReportSectionProps> = ({
  inspection,
  className = '',
}) => {
  const detections = inspection.tamperingDetections || [];

  if (detections.length === 0) {
    return (
      <section className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Possible Tampering / Over-Sticker Assessment</span>
          </h2>
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            No Over-Stickers Detected
          </span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-600">
          Visual inspection did not identify suspicious overlays or sticker boundaries over mandatory declarations.
        </div>
      </section>
    );
  }

  return (
    <section className={`space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Possible Tampering / Over-Sticker Assessment</span>
        </h2>
        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
          {detections.length} Case(s) Flagged for Review
        </span>
      </div>

      {/* Cautious Notice */}
      <div className="bg-amber-50/60 border border-amber-200 rounded p-3 text-xs text-amber-950 flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed text-slate-700">
          <strong>Cautious Language Protocol:</strong> Flags visual indicators of potential overlays or label replacements. Under Rule 23 of the Legal Metrology (Packaged Commodities) Rules 2011, this assessment assists human inspection and does not constitute confirmed fraud without independent physical inspection.
        </p>
      </div>

      {/* Flagged Cases */}
      <div className="space-y-3">
        {detections.map((d) => (
          <div
            key={d.id}
            className="border-2 border-amber-300 rounded-md bg-white p-4 space-y-3 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-amber-800 block">
                  Affected Mandatory Field:
                </span>
                <span className="font-extrabold text-slate-900 text-sm">{d.affectedField}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-slate-500">
                  Confidence: <strong className="text-slate-800">{Math.round(d.confidence * 100)}%</strong>
                </span>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                  Review Required
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-700 block text-[11px] mb-1">
                  Reason for Flagging:
                </span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
                  {d.message}
                </p>

                <div className="mt-2.5">
                  <span className="font-bold text-slate-700 block text-[11px] mb-1">
                    Visual Indicators Observed:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {d.indicators.map((ind, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-medium"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 block text-[11px]">
                  Underlying Text Limitation Status:
                </span>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-600 leading-relaxed text-[11px]">
                  {d.underlyingTextVisible ? (
                    <span className="text-emerald-800 font-medium">
                      Underlying text partially visible: {d.underlyingTextNote}
                    </span>
                  ) : (
                    <span className="text-amber-900 font-medium">
                      Underlying text is not visible in the supplied image. No speculative text hallucinated.
                    </span>
                  )}
                </div>

                <div className="pt-1">
                  <span className="font-bold text-slate-700 block text-[11px] mb-1">
                    Inspector Verdict:
                  </span>
                  <div className="flex items-center gap-2">
                    {d.inspectorDecision && d.inspectorDecision !== 'PENDING' ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold uppercase font-mono ${
                          d.inspectorDecision === 'CONFIRMED'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : d.inspectorDecision === 'REJECTED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {d.inspectorDecision === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3 text-red-600" />}
                        {d.inspectorDecision === 'REJECTED' && <XCircle className="w-3 h-3 text-emerald-600" />}
                        {d.inspectorDecision === 'UNCERTAIN' && <HelpCircle className="w-3 h-3 text-amber-600" />}
                        {d.inspectorDecision}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-700 italic">Pending physical verification</span>
                    )}
                  </div>
                  {d.inspectorNotes && (
                    <p className="mt-1 text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200">
                      &ldquo;{d.inspectorNotes}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
