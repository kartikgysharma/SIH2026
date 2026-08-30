import React, { useState } from 'react';
import { ComplianceFinding, ComplianceStatus, UserRole } from '../../types';
import { Button } from '../../design-system/Button';
import { ReviewerNotes } from './ReviewerNotes';
import {
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Edit3,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Lock,
  ArrowRight,
  X,
} from 'lucide-react';

interface DecisionPanelProps {
  finding: ComplianceFinding;
  userRole: UserRole;
  currentReviewerName: string;
  currentReviewerBadge: string;
  onRecordDecision: (
    findingId: string,
    decision: 'marked_reviewed' | 'confirmed_issue' | 'dismissed_compliant' | 'edited_value' | 'needs_further_review',
    newStatus: ComplianceStatus,
    note: string,
    newValue?: string
  ) => void;
  className?: string;
  id?: string;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  finding,
  userRole,
  currentReviewerName,
  currentReviewerBadge,
  onRecordDecision,
  className = '',
  id,
}) => {
  const [reviewerNote, setReviewerNote] = useState<string>('');
  const [isEditingValue, setIsEditingValue] = useState<boolean>(false);
  const [correctedValue, setCorrectedValue] = useState<string>(finding.detectedValue || '');
  const [correctionReason, setCorrectionReason] = useState<string>('OCR character misread on curved surface');

  // Confirmation Modal State
  const [pendingDecision, setPendingDecision] = useState<{
    decisionType: 'confirmed_issue' | 'dismissed_compliant' | 'needs_further_review' | 'edited_value';
    decisionLabel: string;
    newStatus: ComplianceStatus;
    newValue?: string;
  } | null>(null);

  // Role permissions check
  const canModifyDecision = userRole === 'reviewer' || userRole === 'admin' || userRole === 'inspector';
  const canCorrectValue = userRole === 'reviewer' || userRole === 'admin';

  const handleInitiateDecision = (
    decisionType: 'confirmed_issue' | 'dismissed_compliant' | 'needs_further_review',
    decisionLabel: string,
    newStatus: ComplianceStatus
  ) => {
    setPendingDecision({
      decisionType,
      decisionLabel,
      newStatus,
    });
  };

  const handleInitiateCorrection = () => {
    if (!correctedValue.trim()) return;
    setPendingDecision({
      decisionType: 'edited_value',
      decisionLabel: 'CORRECTED EXTRACTED VALUE',
      newStatus: finding.status,
      newValue: correctedValue.trim(),
    });
  };

  const handleConfirmSubmission = () => {
    if (!pendingDecision) return;

    const fullNote =
      pendingDecision.decisionType === 'edited_value'
        ? `Value corrected from "${finding.detectedValue}" to "${pendingDecision.newValue}". Reason: ${correctionReason}. ${reviewerNote}`.trim()
        : reviewerNote.trim();

    onRecordDecision(
      finding.id,
      pendingDecision.decisionType,
      pendingDecision.newStatus,
      fullNote,
      pendingDecision.newValue
    );

    setPendingDecision(null);
    setIsEditingValue(false);
    setReviewerNote('');
  };

  return (
    <div id={id} className={`bg-white border border-slate-300 rounded-md p-4 space-y-4 shadow-2xs ${className}`}>
      {/* Header & Role Indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs">
            <UserCheck className="w-4 h-4 text-blue-200" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 font-mono">
              Reviewer Determination
            </h3>
            <div className="text-[11px] text-slate-500 font-mono">
              {currentReviewerName} ({currentReviewerBadge})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded text-[11px] font-mono font-bold text-slate-700 border border-slate-200">
          <ShieldCheck className="w-3 h-3 text-slate-600" />
          <span className="capitalize">{userRole} Mode</span>
        </div>
      </div>

      {/* Principle Reminder Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] text-slate-600 space-y-1">
        <div className="font-bold text-slate-800 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0B2545]" />
          Statutory Verification Principle
        </div>
        <p className="leading-relaxed">
          AI assists the inspector with optical recognition. <strong className="text-slate-800">You make the final statutory determination.</strong>
        </p>
      </div>

      {/* Reviewer Note Input */}
      <ReviewerNotes
        value={reviewerNote}
        onChange={setReviewerNote}
        placeholder="Add an inspection observation or verification note..."
      />

      {/* Primary Decision Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono">
          Select Verification Action
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* Action 1: Confirm Finding (Confirm Issue) */}
          <button
            type="button"
            onClick={() =>
              handleInitiateDecision(
                'confirmed_issue',
                'CONFIRM STATUTORY FINDING / ISSUE',
                'non_compliant'
              )
            }
            className="w-full flex items-center justify-between p-3 rounded-md border border-rose-300 bg-rose-50/60 hover:bg-rose-100/80 text-rose-950 text-left transition-all group cursor-pointer shadow-2xs"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-extrabold font-mono tracking-tight text-rose-900 group-hover:text-rose-950">
                  Confirm Finding
                </div>
                <div className="text-[11px] text-rose-800/80 leading-snug">
                  Statutory violation confirmed on packaging. Issue inspection notice.
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Action 2: Mark as Pass (Dismiss as Compliant) */}
          <button
            type="button"
            onClick={() =>
              handleInitiateDecision(
                'dismissed_compliant',
                'MARK AS STATUTORY PASS (COMPLIANT)',
                'pass'
              )
            }
            className="w-full flex items-center justify-between p-3 rounded-md border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-950 text-left transition-all group cursor-pointer shadow-2xs"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-extrabold font-mono tracking-tight text-emerald-900 group-hover:text-emerald-950">
                  Mark as Pass
                </div>
                <div className="text-[11px] text-emerald-800/80 leading-snug">
                  Declaration complies with LMPC rules. Clear false positive.
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Action 3: Needs Further Review */}
          <button
            type="button"
            onClick={() =>
              handleInitiateDecision(
                'needs_further_review',
                'FLAG FOR FURTHER REVIEW',
                'review_required'
              )
            }
            className="w-full flex items-center justify-between p-2.5 rounded-md border border-amber-300 bg-amber-50/50 hover:bg-amber-100/70 text-amber-950 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold font-mono text-amber-900">
                  Needs Further Review
                </div>
                <div className="text-[11px] text-amber-800/80">
                  Requires physical sample verification or laboratory metric test.
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Action 4: Correct Extracted Value */}
          <div className="pt-1">
            {!isEditingValue ? (
              <button
                type="button"
                disabled={!canCorrectValue}
                onClick={() => setIsEditingValue(true)}
                className={`w-full flex items-center justify-center gap-1.5 p-2 rounded border border-slate-300 text-xs font-bold font-mono transition-colors ${
                  canCorrectValue
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Correct Extracted Value (OCR Correction)
              </button>
            ) : (
              <div className="bg-slate-100 border border-slate-300 rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    Manual Value Correction
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingValue(false)}
                    className="text-slate-500 hover:text-slate-800 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                    Original Detected Value:
                  </label>
                  <div className="text-xs font-mono bg-white p-1.5 rounded border border-slate-200 text-slate-600 line-through">
                    {finding.detectedValue || 'Not detected'}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-700 font-bold block mb-0.5">
                    Corrected Value:
                  </label>
                  <input
                    type="text"
                    value={correctedValue}
                    onChange={(e) => setCorrectedValue(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                    placeholder="Enter true observed value on package..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingValue(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleInitiateCorrection}
                  >
                    Apply Correction
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal Summary (Concise & Safe) */}
      {pendingDecision && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0B2545]" />
                <h3 className="text-sm font-bold text-slate-950">
                  Confirm Review Determination
                </h3>
              </div>
              <button
                onClick={() => setPendingDecision(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Decision:</span>
                  <strong className="text-slate-900">{pendingDecision.decisionLabel}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Finding:</span>
                  <span className="text-slate-800 text-right truncate max-w-[200px]">{finding.ruleTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reviewer:</span>
                  <span className="text-slate-800">{currentReviewerName} ({currentReviewerBadge})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-800">
                    {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
                  </span>
                </div>
                {pendingDecision.newValue && (
                  <div className="flex justify-between pt-1 border-t border-slate-200 text-emerald-800">
                    <span>New Value:</span>
                    <strong className="truncate max-w-[200px]">{pendingDecision.newValue}</strong>
                  </div>
                )}
              </div>

              {reviewerNote && (
                <div className="text-slate-700 italic bg-amber-50/60 p-2.5 rounded border border-amber-200/80">
                  <span className="font-bold font-mono text-[10px] text-amber-900 uppercase block not-italic">
                    Attached Note:
                  </span>
                  "{reviewerNote}"
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed">
                This verification will be logged in the permanent audit trail with your inspector badge credentials.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingDecision(null)}
              >
                Back to Edit
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmSubmission}
                className="bg-[#0B2545] hover:bg-slate-900 text-white font-bold"
              >
                Submit Determination
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
