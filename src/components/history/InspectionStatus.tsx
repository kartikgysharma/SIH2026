import React from 'react';
import { ComplianceStatus, ReviewWorkflowStatus } from '../../types';
import { CheckCircle2, AlertTriangle, HelpCircle, Clock, ShieldCheck, UserCheck, Search } from 'lucide-react';

interface InspectionComplianceBadgeProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const InspectionComplianceBadge: React.FC<InspectionComplianceBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3 py-1.5 gap-2 font-bold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  switch (status) {
    case 'pass':
      return (
        <span
          className={`inline-flex items-center rounded border border-emerald-300 bg-emerald-50 text-emerald-800 ${sizeClasses[size]} ${className}`}
        >
          {showIcon && <CheckCircle2 className={`${iconSizes[size]} text-emerald-700 shrink-0`} />}
          <span>PASS</span>
        </span>
      );
    case 'non_compliant':
      return (
        <span
          className={`inline-flex items-center rounded border border-rose-300 bg-rose-50 text-rose-800 ${sizeClasses[size]} ${className}`}
        >
          {showIcon && <AlertTriangle className={`${iconSizes[size]} text-rose-700 shrink-0`} />}
          <span>POTENTIAL NON-COMPLIANCE</span>
        </span>
      );
    case 'review_required':
      return (
        <span
          className={`inline-flex items-center rounded border border-amber-300 bg-amber-50 text-amber-900 ${sizeClasses[size]} ${className}`}
        >
          {showIcon && <HelpCircle className={`${iconSizes[size]} text-amber-700 shrink-0`} />}
          <span>REVIEW REQUIRED</span>
        </span>
      );
    case 'pending':
    default:
      return (
        <span
          className={`inline-flex items-center rounded border border-slate-300 bg-slate-100 text-slate-700 ${sizeClasses[size]} ${className}`}
        >
          {showIcon && <Clock className={`${iconSizes[size]} text-slate-500 shrink-0`} />}
          <span>PENDING</span>
        </span>
      );
  }
};

interface ReviewStatusBadgeProps {
  status?: ReviewWorkflowStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const ReviewStatusBadge: React.FC<ReviewStatusBadgeProps> = ({
  status = 'pending_review',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  switch (status) {
    case 'reviewed':
      return (
        <span
          className={`inline-flex items-center rounded bg-blue-50 text-blue-800 border border-blue-200 ${sizeClasses[size]} ${className}`}
        >
          <UserCheck className="w-3 h-3 text-blue-700 shrink-0" />
          <span>Reviewed</span>
        </span>
      );
    case 'in_review':
      return (
        <span
          className={`inline-flex items-center rounded bg-indigo-50 text-indigo-800 border border-indigo-200 ${sizeClasses[size]} ${className}`}
        >
          <Search className="w-3 h-3 text-indigo-700 shrink-0" />
          <span>In Review</span>
        </span>
      );
    case 'further_review_required':
      return (
        <span
          className={`inline-flex items-center rounded bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses[size]} ${className}`}
        >
          <HelpCircle className="w-3 h-3 text-amber-700 shrink-0" />
          <span>Needs Escalation</span>
        </span>
      );
    case 'pending_review':
    default:
      return (
        <span
          className={`inline-flex items-center rounded bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses[size]} ${className}`}
        >
          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Pending Review</span>
        </span>
      );
  }
};
