import React, { useState } from 'react';
import { InspectionSummary } from '../../types';
import { Button } from '../../design-system/Button';
import {
  Printer,
  Download,
  Share2,
  ArrowLeft,
  Check,
  FileCode,
  ExternalLink,
} from 'lucide-react';

interface ReportActionsProps {
  inspection: InspectionSummary;
  onBackToInspection?: () => void;
  className?: string;
}

export const ReportActions: React.FC<ReportActionsProps> = ({
  inspection,
  onBackToInspection,
  className = '',
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [exportedJson, setExportedJson] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Primary Action: trigger browser print dialog formatted for A4 PDF export
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `BharatLabel AI Inspection Report: ${inspection.inspectionNumber} (${inspection.commodityName}) - Score: ${inspection.complianceScore}/100`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(inspection, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Inspection-Report-${inspection.inspectionNumber}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportedJson(true);
    setTimeout(() => setExportedJson(false), 2500);
  };

  return (
    <div
      className={`bg-white border border-slate-300 rounded-md p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print ${className}`}
    >
      {/* Left: Back Navigation */}
      <div>
        {onBackToInspection && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToInspection}
            className="text-slate-700 hover:bg-slate-100 gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inspection Workspace</span>
          </Button>
        )}
      </div>

      {/* Right: Actions (Download PDF, Print, Export) */}
      <div className="flex flex-wrap items-center gap-2 justify-end">
        {/* Share Link Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="text-slate-700 hover:bg-slate-100 gap-1.5"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
          <span>{copied ? 'Copied Summary' : 'Share Summary'}</span>
        </Button>

        {/* JSON Export */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJSON}
          className="text-slate-700 hover:bg-slate-100 gap-1.5"
        >
          {exportedJson ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <FileCode className="w-4 h-4 text-slate-500" />
          )}
          <span>{exportedJson ? 'Exported JSON' : 'Export JSON'}</span>
        </Button>

        {/* Print Report */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="text-slate-800 border-slate-300 hover:bg-slate-100 gap-1.5"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Print Report</span>
        </Button>

        {/* Primary Action: Download PDF */}
        <Button
          variant="primary"
          size="sm"
          onClick={handleDownloadPDF}
          className="bg-[#0B2545] hover:bg-[#123769] text-white gap-1.5 shadow-2xs font-bold"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </Button>
      </div>
    </div>
  );
};
