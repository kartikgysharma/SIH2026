import React from 'react';
import { ComplianceStatus } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface StatusIndicatorProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  id?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = true,
  className = '',
  id,
}) => {
  const configs = {
    pass: {
      color: 'text-emerald-700',
      bg: 'bg-emerald-500',
      label: 'Pass',
      icon: CheckCircle2,
    },
    non_compliant: {
      color: 'text-rose-700',
      bg: 'bg-rose-500',
      label: 'Potential Non-Compliance',
      icon: XCircle,
    },
    review_required: {
      color: 'text-amber-800',
      bg: 'bg-amber-500',
      label: 'Review Required',
      icon: AlertTriangle,
    },
    pending: {
      color: 'text-slate-600',
      bg: 'bg-slate-400',
      label: 'Pending',
      icon: Clock,
    },
  };

  const current = configs[status] || configs.pending;
  const Icon = current.icon;

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 font-medium ${current.color} ${className}`}
    >
      <Icon className={`${iconSizes[size]} shrink-0`} />
      {showLabel && <span className="text-xs font-semibold">{current.label}</span>}
    </span>
  );
};
