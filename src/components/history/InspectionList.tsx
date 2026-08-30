import React from 'react';
import { InspectionSummary, SortField, SortDirection } from '../../types';
import { InspectionTable } from './InspectionTable';
import { InspectionListItem } from './InspectionListItem';
import { PaginationControls } from './PaginationControls';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { NoResultsState } from './NoResultsState';
import { ErrorState } from './ErrorState';

interface InspectionListProps {
  inspections: InspectionSummary[];
  totalFilteredCount: number;
  isLoading: boolean;
  isError: boolean;
  hasNoTotalInspections: boolean;
  hasNoFilteredResults: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onOpenInspection: (id: string) => void;
  onViewReport: (id: string) => void;
  onScanClick: () => void;
  onClearFilters: () => void;
  onRetry: () => void;
}

export const InspectionList: React.FC<InspectionListProps> = ({
  inspections,
  totalFilteredCount,
  isLoading,
  isError,
  hasNoTotalInspections,
  hasNoFilteredResults,
  sortField,
  sortDirection,
  onSort,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onOpenInspection,
  onViewReport,
  onScanClick,
  onClearFilters,
  onRetry,
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (hasNoTotalInspections) {
    return <EmptyState onScanClick={onScanClick} />;
  }

  if (hasNoFilteredResults) {
    return <NoResultsState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="space-y-4">
      {/* Desktop & Tablet Table View */}
      <div className="hidden sm:block">
        <InspectionTable
          inspections={inspections}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
          onOpenInspection={onOpenInspection}
          onViewReport={onViewReport}
        />
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden space-y-3">
        {inspections.map((inspection) => (
          <InspectionListItem
            key={inspection.id}
            inspection={inspection}
            onOpenInspection={onOpenInspection}
            onViewReport={onViewReport}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalFilteredCount > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalFilteredCount}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </div>
  );
};
