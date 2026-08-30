import React, { useState, useMemo } from 'react';
import { InspectionSummary, UserRole, DashboardDateRange } from '../../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSummary } from './DashboardSummary';
import { InspectionStatusOverview } from './InspectionStatusOverview';
import { RecentInspections } from './RecentInspections';
import { NeedsReview } from './NeedsReview';
import { QuickActions } from './QuickActions';
import { DateRangeFilter } from './DateRangeFilter';
import { CategoryBreakdown } from './CategoryBreakdown';
import { InspectionTrends } from './InspectionTrends';
import { DashboardEmptyState } from './DashboardEmptyState';
import { DashboardLoadingState } from './DashboardLoadingState';
import { DashboardErrorState } from './DashboardErrorState';

interface DashboardViewProps {
  inspections: InspectionSummary[];
  isLoading?: boolean;
  error?: string | null;
  userRole?: UserRole;
  onScanProduct: () => void;
  onOpenInspection: (id: string) => void;
  onViewReport: (id: string) => void;
  onViewAllInspections: () => void;
  onViewReviewQueue: () => void;
  onReviewFinding: (inspectionId: string, findingId?: string) => void;
  onRetryLoad?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  inspections,
  isLoading = false,
  error = null,
  userRole = 'inspector',
  onScanProduct,
  onOpenInspection,
  onViewReport,
  onViewAllInspections,
  onViewReviewQueue,
  onReviewFinding,
  onRetryLoad,
}) => {
  const [dateRange, setDateRange] = useState<DashboardDateRange>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Handle Loading & Error States
  if (isLoading) {
    return <DashboardLoadingState />;
  }

  if (error) {
    return (
      <DashboardErrorState
        onRetry={onRetryLoad || (() => window.location.reload())}
        message={error}
      />
    );
  }

  // Handle Empty State when there are no inspections at all
  if (inspections.length === 0) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          onScanProduct={onScanProduct}
          userRole={userRole}
          totalCount={0}
        />
        <DashboardEmptyState onScanProduct={onScanProduct} />
      </div>
    );
  }

  // Filter inspections based on selected Date Range
  const filteredInspections = useMemo(() => {
    if (dateRange === 'all') return inspections;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return inspections.filter((insp) => {
      // Parse insp.inspectedAt (format: 'YYYY-MM-DD HH:MM' or similar)
      const inspDate = new Date(insp.inspectedAt.replace(' ', 'T'));
      if (isNaN(inspDate.getTime())) return true;

      if (dateRange === 'today') {
        return inspDate >= todayStart;
      }

      if (dateRange === 'last_7_days') {
        const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        return inspDate >= sevenDaysAgo;
      }

      if (dateRange === 'last_30_days') {
        const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);
        return inspDate >= thirtyDaysAgo;
      }

      if (dateRange === 'custom') {
        if (customStartDate && inspDate < new Date(customStartDate)) return false;
        if (customEndDate) {
          const endOfDay = new Date(new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000);
          if (inspDate > endOfDay) return false;
        }
        return true;
      }

      return true;
    });
  }, [inspections, dateRange, customStartDate, customEndDate]);

  // Derived real stats from filtered inspections
  const totalInspections = filteredInspections.length;
  const passedCount = filteredInspections.filter((i) => i.overallStatus === 'pass').length;
  const potentialIssuesCount = filteredInspections.filter(
    (i) => i.overallStatus === 'non_compliant'
  ).length;
  const reviewRequiredCount = filteredInspections.filter(
    (i) => i.overallStatus === 'review_required' || i.reviewStatus === 'pending'
  ).length;

  const averageScore =
    totalInspections > 0
      ? Math.round(
          filteredInspections.reduce((acc, curr) => acc + curr.complianceScore, 0) /
            totalInspections
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Primary "Scan Product" Action */}
      <DashboardHeader
        onScanProduct={onScanProduct}
        userRole={userRole}
        totalCount={totalInspections}
      />

      {/* 2. Date Range Filter Controls */}
      <DateRangeFilter
        dateRange={dateRange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onChangeDateRange={setDateRange}
        onChangeCustomDates={(start, end) => {
          if (start !== undefined) setCustomStartDate(start);
          if (end !== undefined) setCustomEndDate(end);
        }}
      />

      {/* 3. Compact Operational Summary Section (Total, Pass, Issues, Review) */}
      <DashboardSummary
        totalInspections={totalInspections}
        passedCount={passedCount}
        potentialIssuesCount={potentialIssuesCount}
        reviewRequiredCount={reviewRequiredCount}
      />

      {/* 4. Primary Inspection Status Overview */}
      <InspectionStatusOverview
        totalInspections={totalInspections}
        passedCount={passedCount}
        potentialIssuesCount={potentialIssuesCount}
        reviewRequiredCount={reviewRequiredCount}
        averageScore={averageScore}
      />

      {/* 5. Main Operational Grid: Needs Review, Recent Inspections, Categories & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Needs Review & Recent Inspections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Needs Review Section */}
          <NeedsReview
            inspections={filteredInspections}
            onReviewItem={onReviewFinding}
            onViewAllInReviewQueue={onViewReviewQueue}
          />

          {/* Recent Inspections Table */}
          <RecentInspections
            inspections={filteredInspections}
            onOpenInspection={onOpenInspection}
            onViewReport={onViewReport}
            onViewAllInspections={onViewAllInspections}
          />
        </div>

        {/* Right 1 Column: Quick Actions, Category Breakdown, Activity Trends */}
        <div className="space-y-6">
          {/* Quick Actions (Minimalist) */}
          <QuickActions
            onScanProduct={onScanProduct}
            onViewInspections={onViewAllInspections}
            onViewReports={() => {
              if (filteredInspections.length > 0) {
                onViewReport(filteredInspections[0].id);
              }
            }}
            onViewReviewQueue={onViewReviewQueue}
          />

          {/* Real Category Breakdown */}
          <CategoryBreakdown inspections={filteredInspections} />

          {/* Activity Trends (Only if sufficient data exists) */}
          <InspectionTrends inspections={inspections} />
        </div>
      </div>
    </div>
  );
};
