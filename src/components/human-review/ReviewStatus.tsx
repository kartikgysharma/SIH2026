import React from 'react';
import { ReviewWorkflowStatus } from '../../types';
import { Clock, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReviewStatusProps {
  status?: ReviewWorkflowStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  id?: string;
}

export const ReviewStatusBadge: React.FC<ReviewStatusProps> = ({
  status = 'pending_review',
  size = 'md',
  showIcon = true,
  className = '',
  id,
}) => {
  const configs: Record<
    ReviewWorkflowStatus,
    {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      bg: string;
      text: string;
      border: string;
      dot: string;
    }
  > = {
    pending_review: {
      label: 'Pending Review',
      icon: Clock,
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-300',
      dot: 'bg-amber-500',
    },
    in_review: {
      label: 'In Review',
      icon: Eye,
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-300',
      dot: 'bg-blue-500 animate-pulse',
    },
    reviewed: {
      label: 'Reviewed',
      icon: CheckCircle2,
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-emerald-300',
      dot: 'bg-emerald-600',
    },
    further_review_required: {
      label: 'Further Review Required',
      icon: AlertCircle,
      bg: 'bg-rose-50',
      text: 'text-rose-900',
      border: 'border-rose-300',
      dot: 'bg-rose-600',
    },
  };

  const current = configs[status] || configs.pending_review;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center font-bold tracking-tight rounded-md border shadow-2xs ${current.bg} ${current.text} ${current.border} ${sizeClasses[size]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
      {showIcon && <Icon className={`${iconSizes[size]} shrink-0`} />}
      <span>{current.label}</span>
    </span>
  );
};
