import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../../design-system/Button';

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => {
  return (
    <div className="bg-white border border-rose-200 rounded-lg p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8 shadow-2xs">
      <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-3">
        <AlertCircle className="w-6 h-6 text-rose-600" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        Unable to load inspections
      </h3>
      <p className="text-xs text-slate-500 mb-5 max-w-xs">
        Please try again.
      </p>
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  );
};
