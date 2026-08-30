import React from 'react';
import { InspectionSummary, SortField, SortDirection } from '../../types';
import { InspectionComplianceBadge, ReviewStatusBadge } from './InspectionStatus';
import { ScoreMeter } from '../../design-system/ScoreMeter';
import { Button } from '../../design-system/Button';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  ChevronRight,
  User,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface InspectionTableProps {
  inspections: InspectionSummary[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onOpenInspection: (id: string) => void;
  onViewReport: (id: string) => void;
}

export const InspectionTable: React.FC<InspectionTableProps> = ({
  inspections,
  sortField,
  sortDirection,
  onSort,
  onOpenInspection,
  onViewReport,
}) => {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-800" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-800" />
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              {/* Inspection ID */}
              <th scope="col" className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => onSort('inspectionNumber')}
                  className="group flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                >
                  <span>Inspection ID</span>
                  {renderSortIcon('inspectionNumber')}
                </button>
              </th>

              {/* Product */}
              <th scope="col" className="py-3 px-4 min-w-[200px]">
                <button
                  type="button"
                  onClick={() => onSort('commodityName')}
                  className="group flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                >
                  <span>Product</span>
                  {renderSortIcon('commodityName')}
                </button>
              </th>

              {/* Category */}
              <th scope="col" className="py-3 px-4 hidden md:table-cell">
                <button
                  type="button"
                  onClick={() => onSort('category')}
                  className="group flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                >
                  <span>Category</span>
                  {renderSortIcon('category')}
                </button>
              </th>

              {/* Date */}
              <th scope="col" className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => onSort('date')}
                  className="group flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                >
                  <span>Date</span>
                  {renderSortIcon('date')}
                </button>
              </th>

              {/* Score */}
              <th scope="col" className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => onSort('score')}
                  className="group flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                >
                  <span>Score</span>
                  {renderSortIcon('score')}
                </button>
              </th>

              {/* Status */}
              <th scope="col" className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => onSort('status')}
                  className="group flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                >
                  <span>Status</span>
                  {renderSortIcon('status')}
                </button>
              </th>

              {/* Review Status */}
              <th scope="col" className="py-3 px-4 hidden lg:table-cell">
                <button
                  type="button"
                  onClick={() => onSort('reviewStatus')}
                  className="group flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                >
                  <span>Review Status</span>
                  {renderSortIcon('reviewStatus')}
                </button>
              </th>

              {/* Inspector */}
              <th scope="col" className="py-3 px-4 hidden xl:table-cell">
                <span>Inspector</span>
              </th>

              {/* Action */}
              <th scope="col" className="py-3 px-4 text-right">
                <span className="sr-only">Actions</span>
                <span>Action</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {inspections.map((inspection) => (
              <tr
                key={inspection.id}
                onClick={() => onOpenInspection(inspection.id)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                {/* Inspection ID */}
                <td className="py-3.5 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span>{inspection.inspectionNumber}</span>
                  </div>
                </td>

                {/* Product */}
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900 truncate max-w-[220px]">
                    {inspection.commodityName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                    {inspection.brandName} • {inspection.manufacturerName.split(',')[0]}
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4 hidden md:table-cell whitespace-nowrap">
                  <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                    {inspection.category}
                  </span>
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{inspection.inspectedAt.split(' ')[0]}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {inspection.inspectedAt.split(' ').slice(1).join(' ')}
                  </div>
                </td>

                {/* Score */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8">
                      <ScoreMeter score={inspection.complianceScore} size="sm" showLabel={false} />
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {inspection.complianceScore}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <InspectionComplianceBadge status={inspection.overallStatus} size="sm" />
                </td>

                {/* Review Status */}
                <td className="py-3.5 px-4 hidden lg:table-cell whitespace-nowrap">
                  <ReviewStatusBadge status={inspection.reviewStatus} size="sm" />
                </td>

                {/* Inspector */}
                <td className="py-3.5 px-4 hidden xl:table-cell whitespace-nowrap text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-[10px] font-bold">
                      {inspection.inspectorName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 text-xs">
                        {inspection.inspectorName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {inspection.inspectorBadgeNumber}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Action Buttons */}
                <td
                  className="py-3.5 px-4 text-right whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<FileText className="w-3.5 h-3.5 text-slate-500" />}
                      onClick={() => onViewReport(inspection.id)}
                      className="px-2 py-1 h-7 text-xs"
                      title="View Official Report"
                    >
                      Report
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onOpenInspection(inspection.id)}
                      className="px-2.5 py-1 h-7 text-xs font-semibold group-hover:bg-slate-900 group-hover:text-white transition-colors"
                      title="Open Complete Inspection Record"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
