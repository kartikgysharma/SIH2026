import React, { useState } from 'react';
import { InspectionSummary, ComplianceFinding, UserRole } from '../../types';
import { InspectionComplianceBadge, ReviewStatusBadge } from './InspectionStatus';
import { ScoreMeter } from '../../design-system/ScoreMeter';
import { Button } from '../../design-system/Button';
import { ProductInformation } from '../report/ProductInformation';
import { ProductImage } from '../report/ProductImage';
import { ComplianceCheckTable } from '../report/ComplianceCheckTable';
import { FindingSection } from '../report/FindingSection';
import { EvidenceSection } from '../report/EvidenceSection';
import { RuleReference } from '../report/RuleReference';
import { ReviewInformation } from '../report/ReviewInformation';
import { AuditTimeline } from '../report/AuditTimeline';
import { ReportSummary } from '../report/ReportSummary';
import {
  X,
  FileText,
  Scan,
  ShieldCheck,
  Calendar,
  User,
  MapPin,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  ArrowLeft,
  Printer,
} from 'lucide-react';

interface InspectionDetailModalProps {
  inspection: InspectionSummary;
  isOpen: boolean;
  onClose: () => void;
  onOpenInWorkspace: (id: string) => void;
  onOpenInReview: (inspectionId: string, findingId?: string) => void;
  onOpenReport: (id: string) => void;
}

export const InspectionDetailModal: React.FC<InspectionDetailModalProps> = ({
  inspection,
  isOpen,
  onClose,
  onOpenInWorkspace,
  onOpenInReview,
  onOpenReport,
}) => {
  const [activeSection, setActiveSection] = useState<
    'overview' | 'declarations' | 'findings' | 'evidence' | 'rules' | 'audit'
  >('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-slate-50 border border-slate-300 rounded-lg shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                  {inspection.inspectionNumber}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {inspection.category}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white truncate max-w-md mt-0.5">
                {inspection.commodityName}
              </h3>
            </div>
          </div>

          {/* Quick Actions & Close */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileText className="w-3.5 h-3.5 text-slate-300" />}
              onClick={() => {
                onClose();
                onOpenReport(inspection.id);
              }}
              className="text-white border-slate-700 hover:bg-slate-800"
            >
              <span className="hidden sm:inline">Official Report</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => {
                onClose();
                onOpenInWorkspace(inspection.id);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <span className="hidden sm:inline">Open Workspace</span>
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors ml-1"
              title="Close inspection detail"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Inspection Header Sub-strip */}
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                <strong>Inspected:</strong> {inspection.inspectedAt}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>
                <strong>Inspector:</strong> {inspection.inspectorName} ({inspection.inspectorBadgeNumber})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[200px]">{inspection.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <InspectionComplianceBadge status={inspection.overallStatus} size="sm" />
            <ReviewStatusBadge status={inspection.reviewStatus} size="sm" />
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 flex items-center gap-1 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveSection('overview')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'overview'
                ? 'border-slate-900 text-slate-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Inspection Overview
          </button>
          <button
            onClick={() => setActiveSection('declarations')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'declarations'
                ? 'border-slate-900 text-slate-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Declarations & Checks ({inspection.fields.length})
          </button>
          <button
            onClick={() => setActiveSection('findings')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'findings'
                ? 'border-slate-900 text-slate-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Findings</span>
            <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-mono text-[10px]">
              {inspection.findings.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection('evidence')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'evidence'
                ? 'border-slate-900 text-slate-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Evidence & Bounding Regions
          </button>
          <button
            onClick={() => setActiveSection('rules')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'rules'
                ? 'border-slate-900 text-slate-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Rule Traceability
          </button>
          <button
            onClick={() => setActiveSection('audit')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'audit'
                ? 'border-slate-900 text-slate-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Human Review & Audit Trail
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary Cards */}
              <ReportSummary inspection={inspection} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Product Information */}
                <div className="lg:col-span-7">
                  <ProductInformation inspection={inspection} />
                </div>

                {/* Product Image */}
                <div className="lg:col-span-5">
                  <ProductImage
                    imageUrl={inspection.imageUrl}
                    commodityName={inspection.commodityName}
                    fields={inspection.fields}
                  />
                </div>
              </div>

              {/* Compliance Checks Quick Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Summary Compliance Checks
                </h4>
                <ComplianceCheckTable fields={inspection.fields} />
              </div>
            </div>
          )}

          {activeSection === 'declarations' && (
            <div className="space-y-6">
              <ProductInformation inspection={inspection} />
              <ComplianceCheckTable fields={inspection.fields} />
            </div>
          )}

          {activeSection === 'findings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Statutory Compliance Findings ({inspection.findings.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Rule evaluations, observations, and recommendations
                  </p>
                </div>
                {inspection.findings.some((f) => f.status === 'review_required') && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onOpenInReview(inspection.id);
                    }}
                  >
                    Open Review Workspace
                  </Button>
                )}
              </div>

              <FindingSection
                findings={inspection.findings}
                onOpenReviewQueue={(findingId) => {
                  onClose();
                  onOpenInReview(inspection.id, findingId);
                }}
              />
            </div>
          )}

          {activeSection === 'evidence' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                  <ProductImage
                    imageUrl={inspection.imageUrl}
                    commodityName={inspection.commodityName}
                    fields={inspection.fields}
                  />
                </div>
                <div className="lg:col-span-6">
                  <EvidenceSection findings={inspection.findings} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'rules' && (
            <div className="space-y-4">
              <RuleReference findings={inspection.findings} />
            </div>
          )}

          {activeSection === 'audit' && (
            <div className="space-y-6">
              <ReviewInformation inspection={inspection} />
              <AuditTimeline inspection={inspection} />
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between gap-3 text-xs shrink-0">
          <span className="text-slate-500 font-mono">
            Record ID: {inspection.id} • Registered in BharatLabel Audit Ledger
          </span>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => {
                onClose();
                onOpenInWorkspace(inspection.id);
              }}
            >
              Open Full Inspection Workspace
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
