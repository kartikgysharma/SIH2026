import React, { useState } from 'react';
import { ComplianceFinding, ComplianceStatus } from '../types';
import { Badge } from '../design-system/Badge';
import { Button } from '../design-system/Button';
import {
  FileText,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Scale,
  Sparkles,
  UserCheck,
  Edit3,
} from 'lucide-react';

interface RuleFindingCardProps {
  finding: ComplianceFinding;
  isSelected?: boolean;
  onSelect?: () => void;
  onInspectDetail?: () => void;
  onOverrideStatus?: (findingId: string, newStatus: ComplianceStatus, notes: string) => void;
  id?: string;
}

export const RuleFindingCard: React.FC<RuleFindingCardProps> = ({
  finding,
  isSelected = false,
  onSelect,
  onInspectDetail,
  onOverrideStatus,
  id,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(isSelected);
  const [isEditingOverride, setIsEditingOverride] = useState<boolean>(false);
  const [overrideStatus, setOverrideStatus] = useState<ComplianceStatus>(
    finding.inspectorOverride?.inspectorStatus || finding.status
  );
  const [overrideNotes, setOverrideNotes] = useState<string>(
    finding.inspectorOverride?.inspectorNotes || ''
  );

  const getBorderColor = () => {
    if (isSelected) return 'border-[#0B2545] ring-2 ring-[#0B2545]/20';
    if (finding.status === 'non_compliant') return 'border-rose-200 hover:border-rose-300';
    if (finding.status === 'review_required') return 'border-amber-200 hover:border-amber-300';
    return 'border-slate-200 hover:border-slate-300';
  };

  const handleSaveOverride = () => {
    if (onOverrideStatus) {
      onOverrideStatus(finding.id, overrideStatus, overrideNotes);
    }
    setIsEditingOverride(false);
  };

  return (
    <div
      id={id}
      className={`bg-white border rounded-md transition-all shadow-2xs ${getBorderColor()} ${
        isSelected ? 'bg-slate-50/50' : ''
      }`}
    >
      {/* Header Bar */}
      <div
        className="p-3.5 sm:p-4 flex items-start justify-between gap-3 cursor-pointer select-none"
        onClick={() => {
          if (onSelect) onSelect();
          setIsExpanded(!isExpanded);
        }}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 shrink-0">
            {finding.status === 'pass' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
            {finding.status === 'non_compliant' && (
              <AlertOctagon className="w-5 h-5 text-rose-600" />
            )}
            {finding.status === 'review_required' && (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {finding.ruleCode}
              </span>
              <span className="font-mono text-[11px] text-slate-500 truncate">
                {finding.legalAct}
              </span>
            </div>

            <h4 className="text-sm font-semibold text-slate-900 mt-1 leading-snug">
              {finding.ruleTitle}
            </h4>

            <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
              {finding.reasoning}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge status={finding.status} withDot size="sm">
            {finding.status === 'pass'
              ? 'PASS'
              : finding.status === 'non_compliant'
              ? 'POTENTIAL VIOLATION'
              : 'REVIEW REQUIRED'}
          </Badge>

          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label={isExpanded ? 'Collapse finding details' : 'Expand finding details'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Action Strip: Direct link to Evidence & Finding Detail */}
      <div className="px-3.5 sm:px-4 py-2 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span>Confidence: {(finding.confidence * 100).toFixed(0)}%</span>
          {finding.auditTrail && finding.auditTrail.length > 0 && (
            <>
              <span>•</span>
              <span className="text-blue-800 font-semibold flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Reviewed
              </span>
            </>
          )}
        </div>

        {onInspectDetail && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onInspectDetail();
            }}
            className="text-xs font-semibold text-[#0B2545] hover:bg-slate-200/60"
          >
            Inspect Finding &amp; Evidence →
          </Button>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-3.5 sm:p-4 space-y-3 text-xs">
          {/* Statutory Rule Citation */}
          <div className="bg-white border border-slate-200 rounded p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-600 uppercase mb-1">
              <Scale className="w-3.5 h-3.5 text-slate-500" />
              <span>Deterministic Rule Requirement</span>
            </div>
            <p className="text-slate-800 leading-relaxed font-normal">
              {finding.deterministicRule}
            </p>
          </div>

          {/* Extracted Label Evidence */}
          <div className="bg-white border border-slate-200 rounded p-3">
            <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-600 uppercase mb-1">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Extracted Label Evidence</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Extraction Confidence: {(finding.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200 font-mono text-slate-900 text-xs mt-1.5 break-words">
              {finding.extractedEvidence || 'No text segment extracted'}
            </div>
          </div>

          {/* Inspector Override & Verification Trail */}
          <div className="bg-white border border-slate-200 rounded p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-700 uppercase">
                <UserCheck className="w-3.5 h-3.5 text-[#0B2545]" />
                <span>Inspector Verification</span>
              </div>

              {!isEditingOverride && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit3 className="w-3 h-3" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingOverride(true);
                  }}
                >
                  {finding.inspectorOverride?.overridden ? 'Edit Note' : 'Review & Verify'}
                </Button>
              )}
            </div>

            {finding.inspectorOverride?.overridden && !isEditingOverride && (
              <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">
                    Status Endorsed: <span className="uppercase font-mono">{finding.inspectorOverride.inspectorStatus}</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {finding.inspectorOverride.inspectorId} • {finding.inspectorOverride.timestamp}
                  </span>
                </div>
                {finding.inspectorOverride.inspectorNotes && (
                  <p className="text-slate-600 italic">
                    "{finding.inspectorOverride.inspectorNotes}"
                  </p>
                )}
              </div>
            )}

            {isEditingOverride && (
              <div className="mt-3 space-y-2.5 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                <div>
                  <label className="block text-[11px] font-mono font-semibold text-slate-700 uppercase mb-1">
                    Set Inspector Determination
                  </label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value as ComplianceStatus)}
                    className="w-full text-xs rounded border border-slate-300 bg-white p-1.5 font-medium text-slate-900"
                  >
                    <option value="pass">CONFIRM COMPLIANT (PASS)</option>
                    <option value="non_compliant">CONFIRM POTENTIAL NON-COMPLIANCE</option>
                    <option value="review_required">FLAG FOR SENIOR INSPECTOR REVIEW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold text-slate-700 uppercase mb-1">
                    Inspector Observation Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={overrideNotes}
                    onChange={(e) => setOverrideNotes(e.target.value)}
                    placeholder="Enter physical sample verification notes, vernier caliper measurements, or legal reasoning..."
                    className="w-full text-xs rounded border border-slate-300 bg-white p-2 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingOverride(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveOverride}
                  >
                    Save Endorsement
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
