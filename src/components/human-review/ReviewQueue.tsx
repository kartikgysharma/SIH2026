import React, { useState, useMemo } from 'react';
import { InspectionSummary, ReviewWorkflowStatus, ComplianceStatus } from '../../types';
import { ReviewStatusBadge } from './ReviewStatus';
import { StatusIndicator } from '../../design-system/StatusIndicator';
import { Input, SegmentedControl } from '../../design-system/Input';
import {
  Inbox,
  Filter,
  ArrowUpDown,
  Search,
  ChevronRight,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Percent,
  CheckCircle2,
} from 'lucide-react';

interface ReviewQueueProps {
  inspections: InspectionSummary[];
  onSelectReviewItem: (inspectionId: string, findingId: string) => void;
  className?: string;
  id?: string;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  inspections,
  onSelectReviewItem,
  className = '',
  id,
}) => {
  const [filterMode, setFilterMode] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'priority' | 'confidence' | 'date'>('priority');

  // Flatten inspections into review queue items for each finding requiring review / potential issue
  const queueItems = useMemo(() => {
    const items: Array<{
      inspectionId: string;
      inspectionNumber: string;
      commodityName: string;
      brandName: string;
      category: string;
      findingId: string;
      findingTitle: string;
      analyzedField: string;
      status: ComplianceStatus;
      reviewStatus: ReviewWorkflowStatus;
      confidence: number;
      priority: 'high' | 'medium' | 'low';
      inspectedAt: string;
      hasAudit: boolean;
      uncertaintyReason?: string;
      whatWasObserved: string;
    }> = [];

    inspections.forEach((insp) => {
      insp.findings.forEach((finding) => {
        // Derive item review status
        let revStatus: ReviewWorkflowStatus = 'pending_review';
        if (finding.auditTrail && finding.auditTrail.length > 0) {
          revStatus = 'reviewed';
        } else if (finding.status === 'review_required') {
          revStatus = 'further_review_required';
        } else if (finding.status === 'non_compliant') {
          revStatus = 'pending_review';
        } else {
          revStatus = 'reviewed';
        }

        // Priority calculation
        let priority: 'high' | 'medium' | 'low' = 'low';
        if (finding.status === 'non_compliant' || finding.severity === 'high') {
          priority = 'high';
        } else if (finding.status === 'review_required' || finding.confidence < 0.85) {
          priority = 'medium';
        }

        items.push({
          inspectionId: insp.id,
          inspectionNumber: insp.inspectionNumber,
          commodityName: insp.commodityName,
          brandName: insp.brandName,
          category: insp.category,
          findingId: finding.id,
          findingTitle: finding.ruleTitle,
          analyzedField: finding.analyzedField,
          status: finding.status,
          reviewStatus: revStatus,
          confidence: finding.confidence,
          priority,
          inspectedAt: insp.inspectedAt,
          hasAudit: !!(finding.auditTrail && finding.auditTrail.length > 0),
          uncertaintyReason: finding.uncertaintyReason,
          whatWasObserved: finding.whatWasObserved,
        });
      });
    });

    return items;
  }, [inspections]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(queueItems.map((i) => i.category));
    return ['all', ...Array.from(set)];
  }, [queueItems]);

  // Filter & Sort
  const filteredItems = useMemo(() => {
    return queueItems
      .filter((item) => {
        // Status mode filter
        if (filterMode === 'pending' && item.reviewStatus === 'reviewed') return false;
        if (filterMode === 'high_priority' && item.priority !== 'high') return false;
        if (filterMode === 'low_confidence' && item.confidence >= 0.85) return false;
        if (filterMode === 'reviewed' && item.reviewStatus !== 'reviewed') return false;

        // Category filter
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            item.commodityName.toLowerCase().includes(q) ||
            item.brandName.toLowerCase().includes(q) ||
            item.findingTitle.toLowerCase().includes(q) ||
            item.analyzedField.toLowerCase().includes(q) ||
            item.inspectionNumber.toLowerCase().includes(q)
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'priority') {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        if (sortField === 'confidence') {
          return a.confidence - b.confidence; // Ascending: lowest confidence first
        }
        return b.inspectedAt.localeCompare(a.inspectedAt);
      });
  }, [queueItems, filterMode, categoryFilter, searchQuery, sortField]);

  // Quick stats
  const pendingCount = queueItems.filter((i) => i.reviewStatus !== 'reviewed').length;
  const highPriorityCount = queueItems.filter((i) => i.priority === 'high' && i.reviewStatus !== 'reviewed').length;
  const lowConfidenceCount = queueItems.filter((i) => i.confidence < 0.85).length;
  const reviewedCount = queueItems.filter((i) => i.reviewStatus === 'reviewed').length;

  return (
    <div id={id} className={`space-y-4 ${className}`}>
      {/* Header & Metrics Strip */}
      <div className="bg-white border border-slate-300 rounded-md p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-[#0B2545]" />
              Human Review &amp; Verification Queue
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Cases requiring human inspection due to potential non-compliance, low optical confidence, or statutory judgment requirements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded border border-slate-200">
              {pendingCount} Pending Action
            </span>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => setFilterMode('pending')}
            className={`p-3 rounded border transition-all cursor-pointer ${
              filterMode === 'pending'
                ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-400'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="text-[11px] font-mono uppercase font-bold text-amber-900 flex items-center justify-between">
              <span>Pending Review</span>
              <Clock className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
              {pendingCount}
            </div>
          </div>

          <div
            onClick={() => setFilterMode('high_priority')}
            className={`p-3 rounded border transition-all cursor-pointer ${
              filterMode === 'high_priority'
                ? 'bg-rose-50/80 border-rose-400 ring-1 ring-rose-400'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="text-[11px] font-mono uppercase font-bold text-rose-900 flex items-center justify-between">
              <span>High Priority</span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
            </div>
            <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
              {highPriorityCount}
            </div>
          </div>

          <div
            onClick={() => setFilterMode('low_confidence')}
            className={`p-3 rounded border transition-all cursor-pointer ${
              filterMode === 'low_confidence'
                ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-400'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="text-[11px] font-mono uppercase font-bold text-blue-900 flex items-center justify-between">
              <span>Low AI Confidence</span>
              <Percent className="w-3.5 h-3.5 text-blue-700" />
            </div>
            <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
              {lowConfidenceCount}
            </div>
          </div>

          <div
            onClick={() => setFilterMode('reviewed')}
            className={`p-3 rounded border transition-all cursor-pointer ${
              filterMode === 'reviewed'
                ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="text-[11px] font-mono uppercase font-bold text-emerald-900 flex items-center justify-between">
              <span>Completed Reviews</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
              {reviewedCount}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search product, finding, or inspection #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<Search className="w-4 h-4 text-slate-400" />}
              isClearable
              onClear={() => setSearchQuery('')}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-slate-900"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono ml-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-slate-900"
              >
                <option value="priority">Priority</option>
                <option value="confidence">Lowest Confidence First</option>
                <option value="date">Recently Added</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Items Table / List */}
      <div className="bg-white border border-slate-300 rounded-md overflow-hidden shadow-2xs">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">No items match the selected filter</div>
            <p className="text-xs text-slate-500">
              Try adjusting your search criteria or switching filter tabs.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredItems.map((item) => (
              <div
                key={`${item.inspectionId}-${item.findingId}`}
                onClick={() => onSelectReviewItem(item.inspectionId, item.findingId)}
                className="p-4 hover:bg-slate-50/90 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left: Product & Finding Particulars */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {item.inspectionNumber}
                    </span>
                    <h3 className="text-sm font-bold text-slate-950 truncate">
                      {item.commodityName}
                    </h3>
                    <span className="text-xs text-slate-500">• {item.brandName}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <strong className="text-[#0B2545] font-semibold">{item.findingTitle}</strong>
                    <span className="text-slate-400">—</span>
                    <span className="text-slate-600 font-mono text-[11px] truncate">
                      Field: {item.analyzedField}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {item.whatWasObserved}
                  </p>
                </div>

                {/* Right: Confidence, Priority, Status & Action button */}
                <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2 justify-end">
                      {/* Priority Tag */}
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          item.priority === 'high'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : item.priority === 'medium'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.priority} Priority
                      </span>

                      {/* Confidence Meter */}
                      <span
                        className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          item.confidence >= 0.9
                            ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                            : item.confidence >= 0.8
                            ? 'text-blue-800 bg-blue-50 border border-blue-200'
                            : 'text-amber-800 bg-amber-50 border border-amber-200'
                        }`}
                      >
                        {(item.confidence * 100).toFixed(0)}% Conf.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <ReviewStatusBadge status={item.reviewStatus} size="sm" />
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.inspectedAt.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-full bg-slate-100 group-hover:bg-[#0B2545] group-hover:text-white transition-colors text-slate-500">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
