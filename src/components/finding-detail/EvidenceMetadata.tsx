import React from 'react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { FileText, Eye, Info, AlertCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface EvidenceMetadataProps {
  analyzedField: string;
  detectedValue: string;
  confidence: number;
  whatWasObserved: string;
  extractedEvidenceSnippet?: string;
  hasReliableRegion?: boolean;
  className?: string;
  id?: string;
}

export const EvidenceMetadata: React.FC<EvidenceMetadataProps> = ({
  analyzedField,
  detectedValue,
  confidence,
  whatWasObserved,
  extractedEvidenceSnippet,
  hasReliableRegion = true,
  className = '',
  id,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = extractedEvidenceSnippet || detectedValue;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isNotDetected =
    detectedValue.toLowerCase().includes('not detected') ||
    detectedValue.toLowerCase().includes('missing') ||
    detectedValue.toLowerCase().includes('absent');

  return (
    <div
      id={id}
      className={`bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-2xs space-y-4 ${className}`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-slate-100 text-slate-700">
            <Eye className="w-4 h-4 text-[#0B2545]" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
              Evidence &amp; System Observation
            </h3>
            <p className="text-[11px] text-slate-500">
              Extracted optical particulars from the submitted packaging image
            </p>
          </div>
        </div>
      </div>

      {/* Structured Key Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Analyzed Field */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded p-3 space-y-1">
          <span className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
            Analyzed Field
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 block">
            {analyzedField}
          </span>
        </div>

        {/* Detected Value */}
        <div
          className={`border rounded p-3 space-y-1 ${
            isNotDetected
              ? 'bg-rose-50/60 border-rose-200'
              : 'bg-slate-50/80 border-slate-200/80'
          }`}
        >
          <span className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
            Detected Value
          </span>
          <span
            className={`text-xs sm:text-sm font-bold block ${
              isNotDetected ? 'text-rose-700 font-mono' : 'text-slate-900 font-mono'
            }`}
          >
            {detectedValue}
          </span>
        </div>
      </div>

      {/* Confidence Indicator Widget */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded p-3.5">
        <ConfidenceIndicator confidence={confidence} />
      </div>

      {/* What the system observed */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
          What The System Observed
        </span>
        <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 rounded p-3">
          {whatWasObserved}
        </p>
      </div>

      {/* Extracted Evidence Text Snippet (if available) */}
      {extractedEvidenceSnippet && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-semibold text-slate-500">
              Optical Character Extraction (OCR)
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 hover:text-slate-900"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Snippet
                </>
              )}
            </button>
          </div>
          <div className="p-2.5 bg-slate-900 text-slate-100 rounded font-mono text-xs overflow-x-auto border border-slate-800 break-words select-all">
            {extractedEvidenceSnippet}
          </div>
        </div>
      )}

      {/* Crucial Statutory / Technical Limitation Disclaimer */}
      <div className="flex items-start gap-2.5 bg-amber-50/70 border border-amber-200 rounded p-3 text-[11px] text-amber-900 leading-normal">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">Important Inspection Safeguard:</span>
          <span>
            <strong>&quot;Not detected&quot;</strong> does not automatically prove legal non-existence on physical packaging. Automated optical scans may be constrained by lighting glare, panel curvature, fold seams, or declarations printed on secondary surfaces. Physical label verification remains authoritative.
          </span>
        </div>
      </div>
    </div>
  );
};
