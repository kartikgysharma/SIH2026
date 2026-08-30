import React from 'react';
import { InspectionSummary } from '../types';
import { InspectionReportView } from './report/InspectionReportView';
import { Button } from '../design-system/Button';
import { X, ShieldCheck, Printer, Download } from 'lucide-react';

interface InspectionReportModalProps {
  inspection: InspectionSummary;
  isOpen: boolean;
  onClose: () => void;
}

export const InspectionReportModal: React.FC<InspectionReportModalProps> = ({
  inspection,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-slate-100 border border-slate-300 rounded-lg shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Modal Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900 text-white no-print shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-semibold tracking-wide">
                Packaged Commodity Inspection Report
              </h3>
              <p className="text-[11px] text-slate-300 font-mono">
                {inspection.inspectionNumber} • {inspection.commodityName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-white border-slate-700 hover:bg-slate-800 gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Close Report View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-100">
          <InspectionReportView
            inspection={inspection}
            onBackToInspection={onClose}
          />
        </div>
      </div>
    </div>
  );
};
