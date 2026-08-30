import React from 'react';
import { ComplianceStatus } from '../../types';
import { CheckSquare, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface RecommendedActionProps {
  status: ComplianceStatus;
  recommendedAction: string;
  confidence: number;
  uncertaintyReason?: string;
  className?: string;
  id?: string;
}

export const RecommendedAction: React.FC<RecommendedActionProps> = ({
  status,
  recommendedAction,
  confidence,
  uncertaintyReason,
  className = '',
  id,
}) => {
  const isReviewRequired = status === 'review_required';
  const isNonCompliant = status === 'non_compliant';
  const isPass = status === 'pass';
  const isLowConfidence = confidence < 0.85;

  return (
    <div
      id={id}
      className={`rounded-md p-4 sm:p-5 border shadow-2xs space-y-3 ${
        isPass
          ? 'bg-emerald-50/40 border-emerald-200'
          : isNonCompliant
          ? 'bg-rose-50/30 border-rose-200'
          : 'bg-amber-50/40 border-amber-200'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded ${
              isPass
                ? 'bg-emerald-100 text-emerald-800'
                : isNonCompliant
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
              Recommended Inspector Action
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Standard operating procedure for this finding
            </span>
          </div>
        </div>

        {(isLowConfidence || isReviewRequired) && (
          <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
            Manual Verification Recommended
          </span>
        )}
      </div>

      {/* Main Action Instruction */}
      <div className="bg-white border border-slate-200/90 rounded p-3 text-xs text-slate-800 leading-relaxed space-y-2">
        <div className="flex items-start gap-2">
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="font-medium text-slate-900">
            {recommendedAction}
          </p>
        </div>

        {uncertaintyReason && (
          <div className="pt-2 border-t border-slate-100 text-slate-600 text-[11px]">
            <span className="font-semibold text-slate-800">Cause for Automated Uncertainty: </span>
            {uncertaintyReason}
          </div>
        )}
      </div>

      {/* Practical SOP Guidance Bullet Checklist */}
      <div className="text-[11px] text-slate-600 space-y-1.5 pt-1">
        <span className="font-mono text-[10px] uppercase font-semibold text-slate-500 block">
          Field Inspection Steps:
        </span>
        <ul className="list-disc list-inside space-y-1 pl-1">
          {isNonCompliant && (
            <>
              <li>Inspect physical specimen for potential secondary or underside declaration panels.</li>
              <li>If missing on all visible packaging facets, record digital photograph for the statutory memo.</li>
              <li>Officer may proceed to <strong>Confirm Finding</strong> or <strong>Dismiss Finding</strong> below.</li>
            </>
          )}
          {isReviewRequired && (
            <>
              <li>Physically inspect the commodity packaging under uniform diffuse lighting.</li>
              <li>If measuring numeral font dimensions, verify with calibrated optical micrometer or vernier caliper.</li>
              <li>Document physical measurement in Inspector Notes before endorsing verdict.</li>
            </>
          )}
          {isPass && (
            <>
              <li>Declaration complies with statutory requirements. No remedial notice required.</li>
              <li>Verify that batch number matches manufacturing plant delivery challan.</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};
