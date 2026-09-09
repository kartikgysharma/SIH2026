import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  ShieldAlert,
  Info,
  Layers,
  ZoomIn,
} from 'lucide-react';
import { TamperingDetectionResult, TamperingReviewStatus } from '../../types';

interface TamperingEvidenceCardProps {
  detection: TamperingDetectionResult;
  onRecordDecision: (detectionId: string, decision: TamperingReviewStatus, notes: string) => void;
  onViewFullScreenEvidence?: (imageUrl: string) => void;
  inspectorName?: string;
  isReadOnly?: boolean;
}

export const TamperingEvidenceCard: React.FC<TamperingEvidenceCardProps> = ({
  detection,
  onRecordDecision,
  onViewFullScreenEvidence,
  inspectorName = 'Field Inspector',
  isReadOnly = false,
}) => {
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<TamperingReviewStatus | null>(null);
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);

  const confidencePercentage = Math.round(detection.confidence * 100);

  const handleActionClick = (action: TamperingReviewStatus) => {
    setSelectedAction(action);
    setShowNotesForm(true);
  };

  const handleSaveDecision = () => {
    if (!selectedAction) return;
    onRecordDecision(detection.id, selectedAction, inspectorNotes);
    setShowNotesForm(false);
  };

  return (
    <div className="bg-white border-2 border-amber-300 rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:border-amber-400">
      {/* Top Warning Banner with Cautious Language */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-4 py-3 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-amber-800/40 text-amber-100">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide uppercase font-mono">
                Possible Over-Sticker / Overlay
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-900/60 text-amber-100 border border-amber-300/40">
                Review Required
              </span>
            </div>
            <p className="text-xs text-amber-100/90 font-medium">
              Affected Declaration Field: <strong className="text-white underline underline-offset-2">{detection.affectedField}</strong>
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-900/50 px-2.5 py-1 rounded border border-amber-300/30 text-xs font-mono">
          <span className="text-amber-200">AI Visual Confidence:</span>
          <span className="font-extrabold text-white">{confidencePercentage}%</span>
        </div>
      </div>

      {/* Main Grid: Evidence Visual vs. Forensic Findings */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Column: Evidence Image & Inspection Region */}
        <div className="md:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              Flagged Evidence Region
            </span>
            {detection.evidenceImageUrl && (
              <button
                type="button"
                onClick={() => {
                  if (onViewFullScreenEvidence) {
                    onViewFullScreenEvidence(detection.evidenceImageUrl!);
                  } else {
                    setIsZoomed(!isZoomed);
                  }
                }}
                className="text-[11px] text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 hover:underline"
              >
                <ZoomIn className="w-3 h-3" />
                {isZoomed ? 'Reset View' : 'Enlarge Evidence'}
              </button>
            )}
          </div>

          <div className="relative border border-amber-200 rounded-md overflow-hidden bg-slate-950/5 group aspect-[4/3] flex items-center justify-center">
            {detection.evidenceImageUrl ? (
              <img
                src={detection.evidenceImageUrl}
                alt={`Evidence region for ${detection.affectedField}`}
                className={`w-full h-full object-contain transition-transform duration-300 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
            ) : (
              <div className="text-center p-6 text-slate-400 space-y-1">
                <Layers className="w-8 h-8 mx-auto text-amber-500 opacity-60" />
                <p className="text-xs font-medium text-slate-600">Region Coordinates:</p>
                <p className="font-mono text-[11px] text-slate-500">
                  x: {detection.evidenceRegion.x.toFixed(1)}%, y: {detection.evidenceRegion.y.toFixed(1)}%, w: {detection.evidenceRegion.width.toFixed(1)}%, h: {detection.evidenceRegion.height.toFixed(1)}%
                </p>
              </div>
            )}

            <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
              Region: {detection.affectedField}
            </div>
          </div>

          {/* Underlying Text Limitation Notice */}
          <div className="bg-amber-50/80 border border-amber-200 rounded p-2.5 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block text-[11px] uppercase tracking-wide">
                Underlying Declaration Visibility:
              </span>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {detection.underlyingTextVisible ? (
                  <span className="text-emerald-700 font-medium">
                    Partially visible through substrate: {detection.underlyingTextNote}
                  </span>
                ) : (
                  <span className="font-medium text-amber-950">
                    Underlying text is not visible in the supplied image. No speculative text will be hallucinated.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Reasoning, Indicators & Human Verification Controls */}
        <div className="md:col-span-7 space-y-4">
          {/* Reason for Flagging */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
              Reason for Flagging
            </h4>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
              {detection.message}
            </p>
          </div>

          {/* Visual Indicators Observed */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider mb-1.5">
              Visual Indicators Observed
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {detection.indicators.map((ind, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-medium"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                  {ind}
                </span>
              ))}
            </div>
          </div>

          {/* Statutory Protocol Note */}
          <div className="text-[11px] text-slate-600 bg-slate-100 p-2.5 rounded border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 font-mono uppercase text-[10px]">
              Statutory Inspection Instruction (LMPC 2011 / Legal Metrology):
            </div>
            <p>
              An over-sticker does not automatically indicate an offense if it is an authorized factory correction (such as revised MSP under Rule 6 notifications) or authorized importer declaration. The inspector must review the physical commodity before issuing statutory notice.
            </p>
          </div>

          {/* Inspector Decision Status Block */}
          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                Human-in-the-Loop Verdict
              </span>
              {detection.inspectorDecision && detection.inspectorDecision !== 'PENDING' ? (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold uppercase font-mono ${
                    detection.inspectorDecision === 'CONFIRMED'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : detection.inspectorDecision === 'REJECTED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {detection.inspectorDecision === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3 text-red-600" />}
                  {detection.inspectorDecision === 'REJECTED' && <XCircle className="w-3 h-3 text-emerald-600" />}
                  {detection.inspectorDecision === 'UNCERTAIN' && <HelpCircle className="w-3 h-3 text-amber-600" />}
                  {detection.inspectorDecision}
                </span>
              ) : (
                <span className="text-xs text-amber-700 font-mono font-semibold">
                  Action Pending Inspector Review
                </span>
              )}
            </div>

            {detection.inspectorNotes && (
              <div className="bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-700 mb-3">
                <span className="font-semibold text-slate-900 block text-[11px]">Inspector Assessment Note:</span>
                <p className="mt-0.5 italic">{detection.inspectorNotes}</p>
                {detection.reviewedBy && (
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    Recorded by: {detection.reviewedBy} {detection.reviewedAt ? `• ${detection.reviewedAt}` : ''}
                  </span>
                )}
              </div>
            )}

            {/* Interactive Decision Actions */}
            {!isReadOnly && (
              <div>
                {!showNotesForm ? (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleActionClick('CONFIRMED')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded bg-red-50 text-red-800 border border-red-300 hover:bg-red-100 transition-colors"
                      title="Mark that inspector verified an unauthorized over-sticker"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Confirm Sticker</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleActionClick('REJECTED')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors"
                      title="Dismiss indicator: legitimate packaging or authorized barcode"
                    >
                      <XCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Reject (Compliant)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleActionClick('UNCERTAIN')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors"
                      title="Mark as uncertain: requires physical lab inspection"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Mark Uncertain</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-300 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Recording Verdict: <strong className="text-[#0B2545] uppercase">{selectedAction}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowNotesForm(false)}
                        className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    <textarea
                      value={inspectorNotes}
                      onChange={(e) => setInspectorNotes(e.target.value)}
                      placeholder={
                        selectedAction === 'CONFIRMED'
                          ? 'Detail observed sticker seam, underlying text if visible, or suspected price alteration...'
                          : selectedAction === 'REJECTED'
                          ? 'State why this is compliant (e.g., standard manufacturer barcode, permitted discount sticker)...'
                          : 'Describe physical packaging ambiguity or why lab inspection is needed...'
                      }
                      rows={2}
                      className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowNotesForm(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveDecision}
                        className="px-3.5 py-1.5 text-xs font-bold rounded bg-[#0B2545] text-white hover:bg-[#134074] shadow-xs"
                      >
                        Save Inspector Verdict
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
