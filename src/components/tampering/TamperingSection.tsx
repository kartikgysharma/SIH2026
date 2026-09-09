import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowRightLeft,
  Info,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Eye,
  Layers,
  PlusCircle,
} from 'lucide-react';
import { InspectionSummary, TamperingDetectionResult, TamperingReviewStatus, ReferenceComparisonResult } from '../../types';
import { TamperingEvidenceCard } from './TamperingEvidenceCard';
import { ReferenceComparisonModal } from './ReferenceComparisonModal';

interface TamperingSectionProps {
  inspection: InspectionSummary;
  onRecordDecision: (detectionId: string, decision: TamperingReviewStatus, notes: string) => void;
  onSaveComparison?: (result: ReferenceComparisonResult) => void;
  onAddManualDetection?: (detection: TamperingDetectionResult) => void;
  isReadOnly?: boolean;
}

export const TamperingSection: React.FC<TamperingSectionProps> = ({
  inspection,
  onRecordDecision,
  onSaveComparison,
  onAddManualDetection,
  isReadOnly = false,
}) => {
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const detections = inspection.tamperingDetections || [];

  // Summary counts
  const totalDetections = detections.length;
  const pendingCount = detections.filter(
    (d) => !d.inspectorDecision || d.inspectorDecision === 'PENDING'
  ).length;
  const confirmedCount = detections.filter((d) => d.inspectorDecision === 'CONFIRMED').length;
  const rejectedCount = detections.filter((d) => d.inspectorDecision === 'REJECTED').length;
  const uncertainCount = detections.filter((d) => d.inspectorDecision === 'UNCERTAIN').length;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="bg-white border border-amber-300 rounded-lg p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-md bg-amber-500/10 text-amber-800 shrink-0 mt-0.5 border border-amber-300">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Possible Tampering / Over-Sticker
                </h3>
                {totalDetections > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300">
                    {totalDetections} Case{totalDetections > 1 ? 's' : ''} Flagged • Review Required
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                    No Over-Stickers Detected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Assists human inspectors in detecting stickers, overlays, or substrate alterations covering MRP, quantity, dates, or manufacturer details. Results are visual indicators only and do NOT claim confirmed fraud or non-compliance.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setIsReferenceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-2xs transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#0B2545]" />
              <span>Reference Comparison</span>
            </button>
          </div>
        </div>

        {/* Cautious Language Protocol Notice */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-md p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-[11px] leading-relaxed">
            <span className="font-bold uppercase tracking-wider text-amber-950 block">
              Inspection Governance &amp; Protocol:
            </span>
            <p className="text-slate-700">
              The system employs cautious terminology (<strong className="text-slate-900">Possible Over-Sticker</strong>, <strong className="text-slate-900">Review Required</strong>). A physical verification by an authorized inspector is required before issuing any statutory notice under Rule 23 of the Legal Metrology (Packaged Commodities) Rules, 2011.
            </p>
          </div>
        </div>

        {/* Status Counters if any detections exist */}
        {totalDetections > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">Pending Review</span>
              <span className="text-sm font-extrabold text-amber-700">{pendingCount}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">Confirmed Over-Sticker</span>
              <span className="text-sm font-extrabold text-red-700">{confirmedCount}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">Rejected (Compliant)</span>
              <span className="text-sm font-extrabold text-emerald-700">{rejectedCount}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">Uncertain / Lab Review</span>
              <span className="text-sm font-extrabold text-slate-700">{uncertainCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Detections List */}
      {detections.length > 0 ? (
        <div className="space-y-4">
          {detections.map((detection) => (
            <TamperingEvidenceCard
              key={detection.id}
              detection={detection}
              onRecordDecision={onRecordDecision}
              onViewFullScreenEvidence={(imgUrl) => setFullscreenImage(imgUrl)}
              inspectorName={inspection.inspectorName}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-6 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto opacity-80" />
          <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
            No Suspicious Over-Stickers Detected
          </h4>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Visual inspection did not identify obvious surface elevation seams, sticker borders, or substrate discontinuities on the principal display panel.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsReferenceModalOpen(true)}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold underline underline-offset-2"
            >
              Verify with Reference Package Comparison &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Reference Comparison Modal */}
      <ReferenceComparisonModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
        inspection={inspection}
        onSaveComparison={onSaveComparison}
      />

      {/* Lightbox / Fullscreen Modal for Evidence */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 cursor-zoom-out"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg p-2 overflow-hidden shadow-2xl">
            <img
              src={fullscreenImage}
              alt="Enlarged Tampering Evidence"
              className="max-h-[85vh] max-w-full object-contain rounded"
            />
            <div className="p-2 text-center text-xs text-slate-600 font-mono">
              Click anywhere to close evidence view
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
