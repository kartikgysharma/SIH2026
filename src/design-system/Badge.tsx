import React from 'react';
import { ComplianceStatus } from '../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pass' | 'non_compliant' | 'review_required' | 'neutral' | 'brand' | 'outline' | 'info';
  status?: ComplianceStatus;
  size?: 'sm' | 'md' | 'lg';
  withDot?: boolean;
  className?: string;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  size = 'md',
  withDot = false,
  className = '',
  id,
}) => {
  // Map compliance status to variant if status is provided
  let activeVariant = variant || 'neutral';
  if (status) {
    if (status === 'pass') activeVariant = 'pass';
    else if (status === 'non_compliant') activeVariant = 'non_compliant';
    else if (status === 'review_required') activeVariant = 'review_required';
    else activeVariant = 'neutral';
  }

  const variantStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    pass: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-600',
    },
    non_compliant: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      dot: 'bg-rose-600',
    },
    review_required: {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-200',
      dot: 'bg-amber-600',
    },
    brand: {
      bg: 'bg-slate-900',
      text: 'text-slate-50',
      border: 'border-slate-800',
      dot: 'bg-blue-400',
    },
    neutral: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-600',
    },
    outline: {
      bg: 'bg-transparent',
      text: 'text-slate-700',
      border: 'border-slate-300',
      dot: 'bg-slate-500',
    },
  };

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-0.5 text-xs font-semibold tracking-wide',
    lg: 'px-3 py-1 text-sm font-semibold tracking-wide',
  };

  const currentStyle = variantStyles[activeVariant] || variantStyles.neutral;

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 rounded-sm border whitespace-nowrap uppercase tracking-wider font-mono ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border} ${sizeStyles[size]} ${className}`}
    >
      {withDot && (
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${currentStyle.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};
