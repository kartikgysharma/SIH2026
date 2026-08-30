import React, { useState } from 'react';
import { ComplianceStatus, ReviewAuditEntry } from '../../types';
import { Button } from '../../design-system/Button';
import {
  UserCheck,
  CheckCircle2,
  AlertOctagon,
  XCircle,
  Edit3,
  Clock,
  History,
  Shield,
  FileCheck,
} from 'lucide-react';

interface ReviewActionsProps {
  findingId: string;
  currentStatus: ComplianceStatus;
  currentValue: string;
  fieldName: string;
  inspectorName: string;
  inspectorBadgeNumber: string;
  auditTrail?: ReviewAuditEntry[];
  onRecordDecision: (
    decision: 'marked_reviewed' | 'confirmed_issue' | 'dismissed_compliant' | 'edited_value',
    newStatus: ComplianceStatus,
    note: string,
    newValue?: string
  ) => void;
  className?: string;
  id?: string;
}

export const ReviewActions: React.FC<ReviewActionsProps> = ({
  findingId,
  currentStatus,
  currentValue,
  fieldName,
  inspectorName,
  inspectorBadgeNumber,
  auditTrail = [],
  onRecordDecision,
  className = '',
  id,
}) => {
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editedValueText, setEditedValueText] = useState(currentValue);
  const [activeAction, setActiveAction] = useState<
    'mark_reviewed' | 'confirm_issue' | 'dismiss_finding' | null
  >(null);
  const [inspectorNote, setInspectorNote] = useState('');

  const handleExecuteAction = (actionType: 'mark_reviewed' | 'confirm_issue' | 'dismiss_finding') => {
    let targetStatus: ComplianceStatus = currentStatus;
    let decisionType: ReviewAuditEntry['decision'] = 'marked_reviewed';

    if (actionType === 'mark_reviewed') {
      decisionType = 'marked_reviewed';
      targetStatus = currentStatus;
    } else if (actionType === 'confirm_issue') {
      decisionType = 'confirmed_issue';
      targetStatus = 'non_compliant';
    } else if (actionType === 'dismiss_finding') {
      decisionType = 'dismissed_compliant';
      targetStatus = 'pass';
    }

    onRecordDecision(decisionType, targetStatus, inspectorNote.trim() || 'Reviewed and endorsed during field inspection.');
    setActiveAction(null);
    setInspectorNote('');
  };

  const handleSaveEditedValue = () => {
    onRecordDecision(
      'edited_value',
      currentStatus,
      inspectorNote.trim() || `Corrected extracted text manually from "${currentValue}" to "${editedValueText}".`,
      editedValueText
    );
    setIsEditingValue(false);
    setInspectorNote('');
  };

  return (
    <div
      id={id}
      className={`bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-2xs space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-slate-100 text-slate-700">
            <UserCheck className="w-4 h-4 text-[#0B2545]" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
              Human Review &amp; Statutory Endorsement
            </h3>
            <p className="text-[11px] text-slate-500">
              Officer: <strong className="text-slate-800">{inspectorName}</strong> ({inspectorBadgeNumber})
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons (Calm, disciplined styling) */}
      {!activeAction && !isEditingValue && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Mark as Reviewed */}
            <Button
              variant="outline"
              size="md"
              leftIcon={<FileCheck className="w-4 h-4 text-slate-600" />}
              onClick={() => setActiveAction('mark_reviewed')}
              className="justify-start text-xs font-medium"
            >
              Mark as Reviewed
            </Button>

            {/* Edit Extracted Information */}
            <Button
              variant="outline"
              size="md"
              leftIcon={<Edit3 className="w-4 h-4 text-slate-600" />}
              onClick={() => {
                setEditedValueText(currentValue);
                setIsEditingValue(true);
              }}
              className="justify-start text-xs font-medium"
            >
              Edit Extracted Information
            </Button>

            {/* Confirm Finding */}
            <Button
              variant="outline"
              size="md"
              leftIcon={<AlertOctagon className="w-4 h-4 text-rose-600" />}
              onClick={() => setActiveAction('confirm_issue')}
              className="justify-start text-xs font-medium text-rose-900 border-rose-200 hover:bg-rose-50"
            >
              Confirm Potential Issue
            </Button>

            {/* Dismiss Finding (Compliant) */}
            <Button
              variant="outline"
              size="md"
              leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              onClick={() => setActiveAction('dismiss_finding')}
              className="justify-start text-xs font-medium text-emerald-900 border-emerald-200 hover:bg-emerald-50"
            >
              Dismiss (Mark Compliant)
            </Button>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            All human verifications are logged with officer timestamp and appended to the statutory inspection memo.
          </p>
        </div>
      )}

      {/* Confirmation & Note Entry Sub-Form */}
      {activeAction && (
        <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase font-mono">
              {activeAction === 'mark_reviewed' && 'Record Review Endorsement'}
              {activeAction === 'confirm_issue' && 'Confirm Finding (Potential Non-Compliance)'}
              {activeAction === 'dismiss_finding' && 'Dismiss Finding (Confirm Statutory Pass)'}
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveAction(null);
                setInspectorNote('');
              }}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-semibold text-slate-600 uppercase mb-1">
              Inspector Verification Note (Optional)
            </label>
            <textarea
              rows={2}
              value={inspectorNote}
              onChange={(e) => setInspectorNote(e.target.value)}
              placeholder="Enter physical sample notes, calibrated tool measurement, or official justification..."
              className="w-full text-xs rounded border border-slate-300 bg-white p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveAction(null);
                setInspectorNote('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleExecuteAction(activeAction)}
            >
              Save &amp; Endorse Decision
            </Button>
          </div>
        </div>
      )}

      {/* Edit Extracted Information Sub-Form */}
      {isEditingValue && (
        <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase font-mono">
              Manual OCR Text Correction
            </span>
            <button
              type="button"
              onClick={() => setIsEditingValue(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-600 uppercase mb-1">
                Target Field: {fieldName}
              </label>
              <input
                type="text"
                value={editedValueText}
                onChange={(e) => setEditedValueText(e.target.value)}
                placeholder="Enter corrected declaration value observed on physical label"
                className="w-full text-xs font-mono rounded border border-slate-300 bg-white p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-600 uppercase mb-1">
                Correction Reason / Note
              </label>
              <input
                type="text"
                value={inspectorNote}
                onChange={(e) => setInspectorNote(e.target.value)}
                placeholder="e.g. Corrected character misread due to package fold seam"
                className="w-full text-xs rounded border border-slate-300 bg-white p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingValue(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveEditedValue}
            >
              Update Value &amp; Re-evaluate
            </Button>
          </div>
        </div>
      )}

      {/* Decision Audit Trail History */}
      {auditTrail.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-600 uppercase">
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Inspection Audit History</span>
          </div>

          <div className="space-y-2">
            {auditTrail.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-50/80 border border-slate-200/80 rounded p-2.5 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-[#0B2545]" />
                    {entry.reviewer}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {entry.timestamp}
                  </span>
                </div>

                <div className="text-[11px]">
                  <span className="font-mono font-bold text-slate-700 bg-slate-200/70 px-1.5 py-0.5 rounded text-[10px]">
                    {entry.decisionLabel}
                  </span>
                  {entry.note && (
                    <span className="text-slate-600 ml-2 italic">
                      &quot;{entry.note}&quot;
                    </span>
                  )}
                </div>

                {entry.previousValue && entry.newValue && (
                  <div className="text-[10px] font-mono text-slate-600 pt-0.5">
                    Updated from <span className="text-rose-700">{entry.previousValue}</span> →{' '}
                    <span className="text-emerald-700">{entry.newValue}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
