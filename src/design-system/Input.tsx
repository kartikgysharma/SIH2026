import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Check, X } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  isClearable?: boolean;
  onClear?: () => void;
  id?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  prefix,
  suffix,
  isClearable,
  onClear,
  className = '',
  id,
  value,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const leadingIcon = leftIcon || prefix;
  const trailingIcon = rightIcon || suffix;
  const showClear = Boolean(isClearable && value && onClear);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-2xs">
        {leadingIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {leadingIcon}
          </div>
        )}
        <input
          id={inputId}
          value={value}
          className={`block w-full rounded-md border text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
            leadingIcon ? 'pl-9' : 'pl-3'
          } ${showClear || trailingIcon ? 'pr-9' : 'pr-3'} py-2 ${
            error
              ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-600'
              : 'border-slate-300 bg-white hover:border-slate-400'
          } ${className}`}
          {...props}
        />
        {showClear ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label="Clear search input"
          >
            <X className="w-4 h-4" />
          </button>
        ) : trailingIcon ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            {trailingIcon}
          </div>
        ) : null}
      </div>
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { label: string; value: string }[];
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  hint,
  error,
  options,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
          error
            ? 'border-rose-400 bg-rose-50/20'
            : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
};

interface SegmentedControlProps {
  options: { label: string; value: string; count?: number; badgeVariant?: string }[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  id,
  className = '',
}) => {
  return (
    <div
      id={id}
      role="tablist"
      className={`inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-medium ${className}`}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-[4px] transition-all flex items-center gap-1.5 select-none ${
              isSelected
                ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  sublabel?: string;
  id?: string;
  className?: string;
  isProcessing?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  accept = 'image/*',
  label = 'Upload product packaging label',
  sublabel = 'Drag & drop high-resolution label image or capture from field camera (JPEG, PNG, WebP up to 25MB)',
  id,
  className = '',
  isProcessing = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      id={id}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all ${
        isDragOver
          ? 'border-slate-900 bg-slate-100/80 scale-[0.995]'
          : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-400'
      } ${isProcessing ? 'pointer-events-none opacity-60' : ''} ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-700">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-normal">{sublabel}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700 shadow-2xs">
          <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>Browse File or Camera Capture</span>
        </div>
      </div>
    </div>
  );
};
