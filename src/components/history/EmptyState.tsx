import React from 'react';
import { Package, Scan } from 'lucide-react';
import { Button } from '../../design-system/Button';

interface EmptyStateProps {
  onScanClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onScanClick }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8 shadow-2xs">
      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
        <Package className="w-6 h-6 text-slate-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        No inspections yet
      </h3>
      <p className="text-xs text-slate-500 mb-5 max-w-xs">
        Your completed product inspections will appear here.
      </p>
      <Button
        variant="primary"
        size="md"
        leftIcon={<Scan className="w-4 h-4" />}
        onClick={onScanClick}
      >
        Scan Your First Product
      </Button>
    </div>
  );
};
