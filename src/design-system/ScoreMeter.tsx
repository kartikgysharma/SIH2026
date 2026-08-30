import React from 'react';
import { ComplianceStatus } from '../types';
import { Badge } from './Badge';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface ScoreMeterProps {
  score: number; // 0 to 100
  status: ComplianceStatus;
  passCount: number;
  nonCompliantCount: number;
  reviewRequiredCount: number;
  totalRules: number;
  subscores?: {
    category: string;
    passed: number;
    total: number;
    weight: string;
  }[];
  isCompact?: boolean;
  className?: string;
  id?: string;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  status,
  passCount,
  nonCompliantCount,
  reviewRequiredCount,
  totalRules,
  subscores = [
    { category: 'LMPC Mandatory Declarations', passed: 6, total: 8, weight: '40%' },
    { category: 'Net Quantity & Unit Sale Price', passed: 1, total: 2, weight: '25%' },
    { category: 'FSSAI & Standards Compliance', passed: 2, total: 2, weight: '20%' },
    { category: 'Consumer Care Helpline Details', passed: 1, total: 1, weight: '15%' },
  ],
  isCompact = false,
  className = '',
  id,
}) => {
  const getStatusColor = () => {
    if (status === 'pass') {
      return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-500',
        bgSubtle: 'bg-emerald-50',
        border: 'border-emerald-200',
        label: 'COMPLIANT (PASS)',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      };
    }
    if (status === 'non_compliant') {
      return {
        text: 'text-rose-700',
        bg: 'bg-rose-500',
        bgSubtle: 'bg-rose-50',
        border: 'border-rose-200',
        label: 'POTENTIAL NON-COMPLIANCE',
        icon: <XCircle className="w-5 h-5 text-rose-600" />,
      };
    }
    return {
      text: 'text-amber-800',
      bg: 'bg-amber-500',
      bgSubtle: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'REVIEW REQUIRED',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    };
  };

  const statusConfig = getStatusColor();

  if (isCompact) {
    return (
      <div id={id} className={`flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-md ${className}`}>
        <div className="flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Compliance Score</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-slate-900">{score}</span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200 mx-1" />
        <Badge status={status} withDot size="sm">
          {statusConfig.label}
        </Badge>
      </div>
    );
  }

  return (
    <div
      id={id}
      className={`bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-2xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Deterministic Evaluation Verdict
            </span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            {statusConfig.icon}
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {statusConfig.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded border border-slate-200 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Compliance Index
            </div>
            <div className="flex items-baseline justify-end gap-1">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${statusConfig.text}`}>
                {score}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Rule Breakdown Bar */}
      <div className="py-4 border-b border-slate-100">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="font-medium text-slate-700">Rule Verification Summary</span>
          <span className="font-mono text-slate-500 text-[11px]">
            {totalRules} Statutory Rules Evaluated
          </span>
        </div>

        {/* Progress Multi-Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${(passCount / totalRules) * 100}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`Passed: ${passCount}`}
          />
          <div
            style={{ width: `${(reviewRequiredCount / totalRules) * 100}%` }}
            className="bg-amber-500 h-full transition-all duration-500"
            title={`Review Required: ${reviewRequiredCount}`}
          />
          <div
            style={{ width: `${(nonCompliantCount / totalRules) * 100}%` }}
            className="bg-rose-500 h-full transition-all duration-500"
            title={`Non-Compliant: ${nonCompliantCount}`}
          />
        </div>

        {/* Legend Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-1 text-center">
          <div className="bg-emerald-50/70 border border-emerald-100 p-2 rounded">
            <div className="text-xs font-semibold text-emerald-800 uppercase font-mono">Pass</div>
            <div className="text-lg font-bold text-emerald-900 font-mono mt-0.5">{passCount}</div>
            <div className="text-[10px] text-emerald-600">rules fully verified</div>
          </div>

          <div className="bg-amber-50/70 border border-amber-100 p-2 rounded">
            <div className="text-xs font-semibold text-amber-900 uppercase font-mono">Review</div>
            <div className="text-lg font-bold text-amber-900 font-mono mt-0.5">{reviewRequiredCount}</div>
            <div className="text-[10px] text-amber-700">inspector review needed</div>
          </div>

          <div className="bg-rose-50/70 border border-rose-100 p-2 rounded">
            <div className="text-xs font-semibold text-rose-800 uppercase font-mono">Potential Violations</div>
            <div className="text-lg font-bold text-rose-900 font-mono mt-0.5">{nonCompliantCount}</div>
            <div className="text-[10px] text-rose-600">breach identified</div>
          </div>
        </div>
      </div>

      {/* Subcategory Statutory Breakdown */}
      <div className="pt-4 space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
          Statutory Breakdown by Rule Framework
        </span>
        <div className="space-y-2">
          {subscores.map((sub, idx) => {
            const pct = Math.round((sub.passed / sub.total) * 100);
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-700 truncate pr-2 font-medium">{sub.category}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full ${pct === 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    />
                  </div>
                  <span className="font-mono text-slate-600 text-[11px] w-12 text-right">
                    {sub.passed}/{sub.total}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
