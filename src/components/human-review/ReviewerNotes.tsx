import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

interface ReviewerNotesProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const ReviewerNotes: React.FC<ReviewerNotesProps> = ({
  value,
  onChange,
  placeholder = 'Add a note explaining the verification decision...',
  className = '',
  id,
}) => {
  const quickNotes = [
    'Physical package verified in depot',
    'Numeral font height confirmed with optical gauge',
    'Consumer helpline and email verified active',
    'Label glare confirmed; manual read passed',
    'Unit sale price absent on all packaging facets',
  ];

  const handleAppendPreset = (preset: string) => {
    if (!value.trim()) {
      onChange(preset);
    } else if (!value.includes(preset)) {
      onChange(`${value.trim()}; ${preset}`);
    }
  };

  return (
    <div id={id} className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          Reviewer Note &amp; Verification Observations
        </label>
        <span className="text-[11px] text-slate-400 font-mono">Optional</span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-white border border-slate-300 rounded-md p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B2545] focus:border-[#0B2545] transition-all resize-none shadow-2xs"
      />

      {/* Practical quick-tag presets */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-slate-400" />
          Practical Inspection Quick Notes
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickNotes.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleAppendPreset(preset)}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded border border-slate-200 transition-colors text-left"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
