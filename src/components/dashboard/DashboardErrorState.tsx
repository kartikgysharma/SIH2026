import React from 'react';
import { Button } from '../../design-system/Button';
import { AlertOctagon, RotateCw } from 'lucide-react';

interface DashboardErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({
  onRetry,
  message = 'Please try again.',
}) => {
  return (
    <div className="bg-white border border-rose-200 rounded-lg p-8 text-center shadow-2xs space-y-4 max-w-md mx-auto my-12">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
        <AlertOctagon className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h2 className="text-base font-bold text-slate-900">
          Unable to load dashboard data
        </h2>
        <p className="text-xs text-slate-600">{message}</p>
      </div>

      <div className="pt-2">
        <Button
          variant="secondary"
          size="md"
          leftIcon={<RotateCw className="w-4 h-4" />}
          onClick={onRetry}
          className="mx-auto"
        >
          Retry
        </Button>
      </div>
    </div>
  );
};
