import React from 'react';
import { Button } from '../../design-system/Button';
import { Scan, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DashboardEmptyStateProps {
  onScanProduct: () => void;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ onScanProduct }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-8 sm:p-12 text-center shadow-2xs space-y-5 max-w-xl mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center mx-auto shadow-2xs">
        <Scan className="w-8 h-8 text-blue-900" />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
          Start your first inspection
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Upload a packaged commodity label to begin real-time statutory verification under Legal Metrology Rules 2011 & FSSAI.
        </p>
      </div>

      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          leftIcon={<Scan className="w-4 h-4 text-blue-300" />}
          onClick={onScanProduct}
          className="shadow-sm font-bold mx-auto px-6 py-2.5"
        >
          Scan Product
        </Button>
      </div>

      <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <div className="flex items-start gap-2 text-xs text-slate-600">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span>Automated 9-Rule Legal Metrology audit</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-slate-600">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span>FSSAI & Unit Sale Price calculations</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-slate-600">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span>Official PDF Inspection Report generation</span>
        </div>
      </div>
    </div>
  );
};
