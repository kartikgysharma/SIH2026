import React from 'react';
import { ComplianceStatus, RuleCategory } from '../../types';
import { Badge } from '../../design-system/Badge';
import { Button } from '../../design-system/Button';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Scale,
  Sparkles,
} from 'lucide-react';

interface FindingHeaderProps {
  status: ComplianceStatus;
  ruleTitle: string;
  conciseExplanation: string;
  ruleCode: string;
  category: RuleCategory;
  severity?: 'high' | 'medium' | 'low';
  currentIndex?: number;
  totalFindings?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  id?: string;
}

export const FindingHeader: React.FC<FindingHeaderProps> = ({
  status,
  ruleTitle,
  conciseExplanation,
  ruleCode,
  category,
  severity = 'medium',
  currentIndex,
  totalFindings,
  onPrevious,
  onNext,
  id,
}) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'pass':
        return {
          label: 'PASS',
          subLabel: 'Statutory Declaration Verified',
          badgeVariant: 'pass' as const,
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          borderColor: 'border-emerald-200',
          bgHeader: 'bg-emerald-50/50',
        };
      case 'non_compliant':
        return {
          label: 'POTENTIAL NON-COMPLIANCE',
          subLabel: 'Potential Issue Detected by Rule Evaluation',
          badgeVariant: 'non_compliant' as const,
          icon: <AlertOctagon className="w-5 h-5 text-rose-600" />,
          borderColor: 'border-rose-200',
          bgHeader: 'bg-rose-50/40',
        };
      case 'review_required':
      default:
        return {
          label: 'REVIEW REQUIRED',
          subLabel: 'Ambiguous or Low Confidence Evidence',
          badgeVariant: 'review_required' as const,
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          borderColor: 'border-amber-200',
          bgHeader: 'bg-amber-50/40',
        };
    }
  };

  const getCategoryLabel = (cat: RuleCategory) => {
    switch (cat) {
      case 'lmpc_mandatory':
        return 'LMPC Mandatory Declaration';
      case 'fssai_food_safety':
        return 'FSSAI Food Safety';
      case 'weights_measures':
        return 'Net Qty & Unit Sale Price';
      case 'consumer_protection':
        return 'Consumer Care & Grievance';
      case 'origin_import':
        return 'Country of Origin';
      default:
        return 'Statutory Compliance';
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <div
      id={id}
      className={`bg-white border ${statusInfo.borderColor} rounded-md shadow-2xs overflow-hidden`}
    >
      {/* Top Meta Status Strip */}
      <div
        className={`px-4 sm:px-6 py-3 ${statusInfo.bgHeader} border-b ${statusInfo.borderColor} flex flex-wrap items-center justify-between gap-3`}
      >
        <div className="flex items-center gap-2.5">
          {statusInfo.icon}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-wide text-slate-900 uppercase">
                {statusInfo.label}
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-[11px] text-slate-600 hidden sm:inline">
                {statusInfo.subLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Previous / Next Finding Navigation */}
        {currentIndex !== undefined && totalFindings !== undefined && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px] font-mono text-slate-500">
              Finding <strong className="text-slate-900">{currentIndex + 1}</strong> of {totalFindings}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onPrevious}
                disabled={currentIndex <= 0}
                aria-label="Previous finding"
                className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={currentIndex >= totalFindings - 1}
                aria-label="Next finding"
                className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Title & Concise Explanation */}
      <div className="p-4 sm:p-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
            {ruleCode}
          </span>
          <span className="text-xs font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            {getCategoryLabel(category)}
          </span>
          {status === 'non_compliant' && (
            <span className="font-mono text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Severity: {severity.toUpperCase()}
            </span>
          )}
          <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 ml-auto">
            AI-assisted assessment
          </span>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight leading-snug">
            {ruleTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
            {conciseExplanation}
          </p>
        </div>
      </div>
    </div>
  );
};
