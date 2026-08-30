import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'brand-accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  id?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  id,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none whitespace-nowrap active:scale-[0.99]';

  const variantStyles = {
    primary:
      'bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 shadow-xs focus:ring-slate-900',
    'brand-accent':
      'bg-[#0B2545] hover:bg-[#123769] text-white border border-[#0B2545] shadow-xs focus:ring-[#0B2545]',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs focus:ring-slate-400',
    outline:
      'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 focus:ring-slate-400',
    danger:
      'bg-rose-700 hover:bg-rose-800 text-white border border-rose-700 shadow-xs focus:ring-rose-600',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300',
  };

  // Horizontal padding is 2x vertical padding for balanced optical weight
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
  };

  return (
    <button
      id={id}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
