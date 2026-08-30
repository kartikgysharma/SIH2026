import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import { Button } from '../../design-system/Button';

interface NoResultsStateProps {
  onClearFilters: () => void;
}

export const NoResultsState: React.FC<NoResultsStateProps> = ({ onClearFilters }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8 shadow-2xs">
      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
        <SearchX className="w-6 h-6 text-slate-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        No inspections found
      </h3>
      <p className="text-xs text-slate-500 mb-5 max-w-xs">
        Try changing your search or filters.
      </p>
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        onClick={onClearFilters}
      >
        Clear Filters
      </Button>
    </div>
  );
};
