import React from 'react';
import { Scale, ExternalLink, ShieldAlert, CheckCircle, BookOpen } from 'lucide-react';

interface RuleReferenceProps {
  ruleName: string;
  ruleId: string;
  ruleSource: string;
  ruleReference: string;
  ruleStatus: 'Active' | 'Under Review' | 'Draft';
  deterministicRule: string;
  officialSourceUrl?: string;
  className?: string;
  id?: string;
}

export const RuleReference: React.FC<RuleReferenceProps> = ({
  ruleName,
  ruleId,
  ruleSource,
  ruleReference,
  ruleStatus = 'Active',
  deterministicRule,
  officialSourceUrl,
  className = '',
  id,
}) => {
  return (
    <div
      id={id}
      className={`bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-2xs space-y-4 ${className}`}
    >
      {/* Section Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-slate-100 text-slate-700">
            <Scale className="w-4 h-4 text-[#0B2545]" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
              Evaluated Statutory Rule
            </h3>
            <p className="text-[11px] text-slate-500">
              Deterministic rule criteria from gazetted Indian regulatory frameworks
            </p>
          </div>
        </div>

        <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
          Status: {ruleStatus}
        </span>
      </div>

      {/* Structured Rule Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Rule Checked */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded p-2.5 space-y-0.5">
          <span className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
            Rule Checked
          </span>
          <span className="font-semibold text-slate-900 block">
            {ruleName}
          </span>
        </div>

        {/* Rule ID */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded p-2.5 space-y-0.5">
          <span className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
            Rule ID
          </span>
          <span className="font-mono font-bold text-slate-900 block">
            {ruleId}
          </span>
        </div>

        {/* Source */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded p-2.5 space-y-0.5">
          <span className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
            Regulatory Authority / Source
          </span>
          <span className="text-slate-800 block truncate">
            {ruleSource}
          </span>
        </div>

        {/* Reference / Clause */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded p-2.5 space-y-0.5">
          <span className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
            Legal Clause / Notification
          </span>
          <span className="font-mono text-slate-800 block truncate">
            {ruleReference}
          </span>
        </div>
      </div>

      {/* Deterministic Rule Logic Requirement Box */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
          Deterministic Mandate Specification
        </span>
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-800 leading-relaxed font-normal">
          {deterministicRule}
        </div>
      </div>

      {/* Clickable Gazette / Official Reference */}
      {officialSourceUrl && (
        <div className="pt-1">
          <a
            href={officialSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B2545] hover:text-blue-900 transition-colors group"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="underline decoration-slate-300 group-hover:decoration-blue-700 underline-offset-2">
              View Official Gazette / Regulatory Reference
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-700" />
          </a>
        </div>
      )}
    </div>
  );
};
