import React from 'react';
import { ReviewAuditEntry, ComplianceStatus } from '../../types';
import { StatusIndicator } from '../../design-system/StatusIndicator';
import { History, UserCheck, Edit3, CheckCircle, AlertTriangle, HelpCircle, Bot } from 'lucide-react';

interface ReviewTimelineProps {
  auditTrail?: ReviewAuditEntry[];
  initialCreatedAt?: string;
  initialConfidence?: number;
  className?: string;
  id?: string;
}

export const ReviewTimeline: React.FC<ReviewTimelineProps> = ({
  auditTrail = [],
  initialCreatedAt = 'Today, 10:15 IST',
  initialConfidence = 0.85,
  className = '',
  id,
}) => {
  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'confirmed_issue':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />;
      case 'dismissed_compliant':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />;
      case 'needs_further_review':
        return <HelpCircle className="w-3.5 h-3.5 text-amber-700" />;
      case 'edited_value':
        return <Edit3 className="w-3.5 h-3.5 text-blue-700" />;
      case 'marked_reviewed':
      default:
        return <UserCheck className="w-3.5 h-3.5 text-slate-700" />;
    }
  };

  return (
    <div id={id} className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-mono">
          <History className="w-3.5 h-3.5 text-slate-500" />
          Review Activity &amp; Audit Trail
        </h4>
        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {auditTrail.length + 1} {auditTrail.length === 0 ? 'entry' : 'entries'}
        </span>
      </div>

      <div className="relative pl-5 border-l-2 border-slate-200 space-y-4 text-xs font-sans mt-2">
        {/* Newest reviewer entries first if available */}
        {auditTrail.map((entry, index) => (
          <div key={entry.id || index} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-[27px] top-0.5 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-2xs">
              {getDecisionIcon(entry.decision)}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 space-y-1.5 transition-colors group-hover:border-slate-300">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900 font-mono text-[11px] tracking-tight flex items-center gap-1.5">
                  {entry.decisionLabel}
                </span>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {entry.timestamp}
                </span>
              </div>

              <div className="text-[11px] text-slate-600 flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-800">
                  {entry.reviewer}
                </span>
                {entry.reviewerBadge && (
                  <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                    {entry.reviewerBadge}
                  </span>
                )}
                {entry.role && (
                  <span className="text-slate-500">• {entry.role}</span>
                )}
              </div>

              {/* Status Transition if recorded */}
              {(entry.previousStatus || entry.newStatus) && (
                <div className="flex items-center gap-2 pt-1 text-[11px] border-t border-slate-200/60 font-mono">
                  <span className="text-slate-400">Status transition:</span>
                  {entry.previousStatus && (
                    <StatusIndicator status={entry.previousStatus as ComplianceStatus} size="sm" />
                  )}
                  <span className="text-slate-400">→</span>
                  {entry.newStatus && (
                    <StatusIndicator status={entry.newStatus as ComplianceStatus} size="sm" />
                  )}
                </div>
              )}

              {/* Value modification diff if recorded */}
              {entry.editedField && (
                <div className="bg-white border border-slate-200 rounded p-1.5 text-[11px] font-mono space-y-0.5">
                  <div className="text-slate-500">Modified: <strong className="text-slate-800">{entry.editedField}</strong></div>
                  {entry.previousValue && (
                    <div className="text-rose-700 line-through truncate">- {entry.previousValue}</div>
                  )}
                  {entry.newValue && (
                    <div className="text-emerald-700 font-semibold truncate">+ {entry.newValue}</div>
                  )}
                </div>
              )}

              {/* Inspector note */}
              {entry.note && (
                <div className="text-xs text-slate-700 italic bg-white p-2 rounded border border-slate-200/80 leading-relaxed">
                  "{entry.note}"
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Initial Automated Extraction Entry (Foundation) */}
        <div className="relative">
          <div className="absolute -left-[27px] top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shadow-2xs">
            <Bot className="w-3.5 h-3.5 text-slate-600" />
          </div>

          <div className="bg-slate-50/70 border border-slate-200/70 rounded-md p-2.5 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-800 font-mono text-[11px]">
                Finding Extracted by Automated Analysis
              </span>
              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                {initialCreatedAt}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              AI model scanned packaging label. Confidence assessed at{' '}
              <strong className="font-mono text-slate-800">
                {(initialConfidence * 100).toFixed(0)}%
              </strong>
              . Pending human verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
