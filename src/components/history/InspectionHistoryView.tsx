import React, { useState, useMemo } from 'react';
import {
  InspectionSummary,
  InspectionFilterState,
  SortField,
  SortDirection,
  ComplianceStatus,
  UserRole,
} from '../../types';
import { InspectionHistorySummary } from './InspectionHistorySummary';
import { InspectionSearch } from './InspectionSearch';
import { InspectionFilters } from './InspectionFilters';
import { InspectionList } from './InspectionList';
import { InspectionDetailModal } from './InspectionDetailModal';
import { Button } from '../../design-system/Button';
import { Scan, Filter, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface InspectionHistoryViewProps {
  inspections: InspectionSummary[];
  onOpenInspection: (id: string) => void;
  onViewReport: (id: string) => void;
  onOpenReviewQueue: (inspectionId: string, findingId?: string) => void;
  onScanNewProduct: () => void;
  userRole?: UserRole;
}

const DEFAULT_FILTERS: InspectionFilterState = {
  searchQuery: '',
  status: 'all',
  dateRange: 'all',
  category: 'all',
  reviewStatus: 'all',
  scoreRange: 'all',
  inspector: 'all',
};

export const InspectionHistoryView: React.FC<InspectionHistoryViewProps> = ({
  inspections,
  onOpenInspection,
  onViewReport,
  onOpenReviewQueue,
  onScanNewProduct,
  userRole = 'inspector',
}) => {
  const [filters, setFilters] = useState<InspectionFilterState>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [selectedInspectionForDetail, setSelectedInspectionForDetail] = useState<InspectionSummary | null>(
    null
  );

  // Extract unique categories and inspectors for filter dropdowns
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    inspections.forEach((i) => {
      if (i.category) cats.add(i.category);
    });
    return Array.from(cats).sort();
  }, [inspections]);

  const availableInspectors = useMemo(() => {
    const inspectors = new Set<string>();
    inspections.forEach((i) => {
      if (i.inspectorName) inspectors.add(i.inspectorName);
    });
    return Array.from(inspectors).sort();
  }, [inspections]);

  // Check if any filter is active
  const isFilterActive = useMemo(() => {
    return (
      filters.searchQuery.trim() !== '' ||
      filters.status !== 'all' ||
      filters.dateRange !== 'all' ||
      filters.category !== 'all' ||
      filters.reviewStatus !== 'all' ||
      filters.scoreRange !== 'all' ||
      filters.inspector !== 'all'
    );
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<InspectionFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  // Handle sorting toggles
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filtered Inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter((item) => {
      // 1. Search Query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesId = item.inspectionNumber.toLowerCase().includes(query);
        const matchesProduct = item.commodityName.toLowerCase().includes(query);
        const matchesBrand = item.brandName.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesManufacturer = item.manufacturerName.toLowerCase().includes(query);
        const matchesInspector = item.inspectorName.toLowerCase().includes(query);

        if (
          !matchesId &&
          !matchesProduct &&
          !matchesBrand &&
          !matchesCategory &&
          !matchesManufacturer &&
          !matchesInspector
        ) {
          return false;
        }
      }

      // 2. Status Filter
      if (filters.status !== 'all' && item.overallStatus !== filters.status) {
        return false;
      }

      // 3. Category Filter
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }

      // 4. Review Status Filter
      if (filters.reviewStatus !== 'all') {
        const currentRev = item.reviewStatus || 'pending_review';
        if (currentRev !== filters.reviewStatus) {
          return false;
        }
      }

      // 5. Score Range Filter
      if (filters.scoreRange !== 'all') {
        if (filters.scoreRange === 'high' && item.complianceScore < 90) return false;
        if (
          filters.scoreRange === 'medium' &&
          (item.complianceScore < 70 || item.complianceScore >= 90)
        )
          return false;
        if (filters.scoreRange === 'low' && item.complianceScore >= 70) return false;
      }

      // 6. Inspector Filter
      if (filters.inspector !== 'all' && item.inspectorName !== filters.inspector) {
        return false;
      }

      // 7. Date Range Filter
      if (filters.dateRange !== 'all') {
        // Parse inspection date (formats like "2026-08-28 10:15 IST")
        const dateStr = item.inspectedAt.split(' ')[0]; // e.g. "2026-08-28"
        if (filters.dateRange === 'today') {
          if (!dateStr.startsWith('2026-08-28')) return false;
        } else if (filters.dateRange === 'last_7_days') {
          // Dates on or after 2026-08-21
          if (dateStr < '2026-08-21') return false;
        } else if (filters.dateRange === 'last_30_days') {
          // Dates on or after 2026-07-28
          if (dateStr < '2026-07-28') return false;
        }
      }

      return true;
    });
  }, [inspections, filters]);

  // Sorted Inspections
  const sortedInspections = useMemo(() => {
    const list = [...filteredInspections];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = a.inspectedAt.localeCompare(b.inspectedAt);
          break;
        case 'score':
          comparison = a.complianceScore - b.complianceScore;
          break;
        case 'inspectionNumber':
          comparison = a.inspectionNumber.localeCompare(b.inspectionNumber);
          break;
        case 'commodityName':
          comparison = a.commodityName.localeCompare(b.commodityName);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'status':
          comparison = a.overallStatus.localeCompare(b.overallStatus);
          break;
        case 'reviewStatus':
          comparison = (a.reviewStatus || 'pending_review').localeCompare(
            b.reviewStatus || 'pending_review'
          );
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredInspections, sortField, sortDirection]);

  // Paginated Slices
  const totalFilteredCount = sortedInspections.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / itemsPerPage));
  const paginatedInspections = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedInspections.slice(start, start + itemsPerPage);
  }, [sortedInspections, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Inspections
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View and manage previous product inspections.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Scan className="w-4 h-4" />}
            onClick={onScanNewProduct}
            className="shadow-2xs whitespace-nowrap"
          >
            Scan New Product
          </Button>
        </div>
      </div>

      {/* Summary Strip */}
      <InspectionHistorySummary
        inspections={inspections}
        activeStatusFilter={filters.status}
        onSelectStatusFilter={(status) => handleFilterChange({ status })}
      />

      {/* Search & Filter Toolbar */}
      <div className="space-y-3 bg-white p-3.5 sm:p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Prominent Search Field */}
          <InspectionSearch
            searchQuery={filters.searchQuery}
            onSearchChange={(query) => handleFilterChange({ searchQuery: query })}
            placeholder="Search inspections by ID, product, category, manufacturer, or inspector..."
          />
        </div>

        {/* Filters Row */}
        <div className="pt-2 border-t border-slate-100">
          <InspectionFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            availableCategories={availableCategories}
            availableInspectors={availableInspectors}
            isFilterActive={isFilterActive}
          />
        </div>
      </div>

      {/* Table / List with Pagination & States */}
      <InspectionList
        inspections={paginatedInspections}
        totalFilteredCount={totalFilteredCount}
        isLoading={isLoading}
        isError={isError}
        hasNoTotalInspections={inspections.length === 0}
        hasNoFilteredResults={totalFilteredCount === 0 && inspections.length > 0}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={(p) => setCurrentPage(p)}
        onItemsPerPageChange={(count) => {
          setItemsPerPage(count);
          setCurrentPage(1);
        }}
        onOpenInspection={(id) => {
          const target = inspections.find((i) => i.id === id);
          if (target) {
            setSelectedInspectionForDetail(target);
          }
        }}
        onViewReport={onViewReport}
        onScanClick={onScanNewProduct}
        onClearFilters={handleResetFilters}
        onRetry={() => {
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
            setIsError(false);
          }, 300);
        }}
      />

      {/* Detailed Inspection Modal View */}
      {selectedInspectionForDetail && (
        <InspectionDetailModal
          inspection={selectedInspectionForDetail}
          isOpen={Boolean(selectedInspectionForDetail)}
          onClose={() => setSelectedInspectionForDetail(null)}
          onOpenInWorkspace={(id) => {
            setSelectedInspectionForDetail(null);
            onOpenInspection(id);
          }}
          onOpenInReview={(inspectionId, findingId) => {
            setSelectedInspectionForDetail(null);
            onOpenReviewQueue(inspectionId, findingId);
          }}
          onOpenReport={(id) => {
            setSelectedInspectionForDetail(null);
            onViewReport(id);
          }}
        />
      )}
    </div>
  );
};
