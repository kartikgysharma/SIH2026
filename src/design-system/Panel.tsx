import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  isCompact?: boolean;
  borderAccent?: 'none' | 'brand' | 'warning' | 'danger' | 'success';
  id?: string;
}

export const Panel: React.FC<PanelProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  className = '',
  bodyClassName = '',
  isCompact = false,
  borderAccent = 'none',
  id,
}) => {
  const accentBorders = {
    none: 'border-slate-200',
    brand: 'border-slate-200 border-t-2 border-t-[#0B2545]',
    warning: 'border-slate-200 border-t-2 border-t-amber-500',
    danger: 'border-slate-200 border-t-2 border-t-rose-600',
    success: 'border-slate-200 border-t-2 border-t-emerald-600',
  };

  return (
    <div
      id={id}
      className={`bg-white border rounded-md shadow-2xs overflow-hidden flex flex-col ${accentBorders[borderAccent]} ${className}`}
    >
      {(title || headerAction) && (
        <div
          className={`flex items-center justify-between border-b border-slate-100 bg-slate-50/75 ${
            isCompact ? 'px-3 py-2.5' : 'px-4 py-3 sm:px-5'
          }`}
        >
          <div className="min-w-0 pr-2">
            {typeof title === 'string' ? (
              <h3 className="text-sm font-semibold tracking-tight text-slate-900 truncate">
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed truncate">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0 flex items-center gap-2">{headerAction}</div>}
        </div>
      )}

      <div
        className={`flex-1 ${
          bodyClassName || (isCompact ? 'p-3' : 'p-4 sm:p-5')
        }`}
      >
        {children}
      </div>

      {footer && (
        <div
          className={`border-t border-slate-100 bg-slate-50/60 flex items-center justify-between ${
            isCompact ? 'px-3 py-2' : 'px-4 py-3 sm:px-5'
          }`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
