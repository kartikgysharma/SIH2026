import React from 'react';
import { HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ConfidenceIndicatorProps {
  confidence: number; // 0 to 1
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
  id?: string;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  label = 'AI Extraction Confidence',
  size = 'md',
  showDetails = true,
  className = '',
  id,
}) => {
  const percentage = Math.round(confidence * 100);

  const getTier = () => {
    if (confidence >= 0.9) {
      return {
        level: 'High Optical Confidence',
        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        barColor: 'bg-emerald-600',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        explanation: 'Character extraction clarity is high with distinct edge contrast.',
      };
    }
    if (confidence >= 0.75) {
      return {
        level: 'Moderate Optical Confidence',
        badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        barColor: 'bg-amber-500',
        icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
        explanation: 'Characters detected with acceptable fidelity; minor angle or contrast variance.',
      };
    }
    return {
      level: 'Low Confidence / Uncertainty',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      barColor: 'bg-rose-500',
      icon: <HelpCircle className="w-3.5 h-3.5 text-rose-600" />,
      explanation: 'Visual occlusion, curvature, or lighting gradient limits automated OCR accuracy.',
    };
  };

  const tier = getTier();

  return (
    <div id={id} className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600 flex items-center gap-1.5">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-900 text-xs">
            {percentage}%
          </span>
          <span
            className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${tier.badgeColor}`}
          >
            {tier.icon}
            <span>{tier.level}</span>
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
        <div
          className={`h-full transition-all duration-300 rounded-full ${tier.barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showDetails && (
        <p className="text-[11px] text-slate-500 leading-normal">
          {tier.explanation}
        </p>
      )}
    </div>
  );
};
