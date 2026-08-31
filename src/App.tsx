import React, { useState } from 'react';
import { SAMPLE_INSPECTIONS } from './data/sampleInspections';
import {
  InspectionSummary,
  ComplianceFinding,
  ComplianceStatus,
  UserRole,
} from './types';
import { Badge } from './design-system/Badge';
import { Button } from './design-system/Button';
import { Panel } from './design-system/Panel';
import { ScoreMeter } from './design-system/ScoreMeter';
import { Table, Column } from './design-system/Table';
import { SegmentedControl, Input } from './design-system/Input';
import { InspectionImageViewer } from './components/InspectionImageViewer';
import { RuleFindingCard } from './components/RuleFindingCard';
import { FindingDetailView } from './components/finding-detail/FindingDetailView';
import { ReviewQueue } from './components/human-review/ReviewQueue';
import { ReviewWorkspace } from './components/human-review/ReviewWorkspace';
import { ScanModal } from './components/ScanModal';
import { InspectionReportModal } from './components/InspectionReportModal';
import { InspectionReportView } from './components/report/InspectionReportView';
import { InspectionHistoryView } from './components/history/InspectionHistoryView';
import { DashboardView } from './components/dashboard/DashboardView';
import { RuleMasterView } from './components/RuleMasterView';
import { DesignSystemShowcase } from './components/DesignSystemShowcase';
import {
  Scan,
  FileCheck2,
  Scale,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Printer,
  ChevronRight,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building2,
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  Sliders,
  ExternalLink,
  Inbox,
  User,
  History,
  FolderOpen,
  LayoutDashboard,
  BookOpen,
} from 'lucide-react';

export default function App() {
  const [inspections, setInspections] = useState<InspectionSummary[]>(SAMPLE_INSPECTIONS);
  const [currentInspectionId, setCurrentInspectionId] = useState<string>(SAMPLE_INSPECTIONS[0].id);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inspections' | 'inspection' | 'human-review' | 'report' | 'rule-master' | 'design-system'>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('inspector');
  const [selectedReviewInspectionId, setSelectedReviewInspectionId] = useState<string | null>(null);
  const [selectedReviewFindingId, setSelectedReviewFindingId] = useState<string | null>(null);
  const [viewSubTab, setViewSubTab] = useState<string>('findings');
  const [findingFilter, setFindingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFindingId, setSelectedFindingId] = useState<string | undefined>(undefined);
  const [detailFindingId, setDetailFindingId] = useState<string | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const activeInspection = inspections.find((i) => i.id === currentInspectionId) || inspections[0];

  // Active finding for detail view if selected
  const activeDetailFinding = detailFindingId
    ? activeInspection.findings.find((f) => f.id === detailFindingId) || null
    : null;

  // For Human Review Workspace
  const reviewInspection = selectedReviewInspectionId
    ? inspections.find((i) => i.id === selectedReviewInspectionId) || activeInspection
    : activeInspection;

  const reviewFinding = selectedReviewFindingId
    ? reviewInspection.findings.find((f) => f.id === selectedReviewFindingId) || null
    : null;

  // Calculate pending items count across all inspections for top badge
  const totalPendingReviews = inspections.reduce((acc, insp) => {
    return (
      acc +
      insp.findings.filter((f) => !(f.auditTrail && f.auditTrail.length > 0)).length
    );
  }, 0);

  // Handle detailed review decision recording
  const handleRecordDecision = (
    findingId: string,
    decision: 'marked_reviewed' | 'confirmed_issue' | 'dismissed_compliant' | 'edited_value' | 'needs_further_review',
    newStatus: ComplianceStatus,
    note: string,
    newValue?: string
  ) => {
    setInspections((prev) =>
      prev.map((insp) => {
        // Find if this inspection has the finding
        const hasFinding = insp.findings.some((f) => f.id === findingId);
        if (!hasFinding) return insp;

        const updatedFindings = insp.findings.map((f) => {
          if (f.id !== findingId) return f;

          const decisionLabelMap: Record<string, string> = {
            confirmed_issue: 'CONFIRMED POTENTIAL ISSUE',
            dismissed_compliant: 'DISMISSED AS COMPLIANT',
            marked_reviewed: 'MARKED AS REVIEWED',
            edited_value: 'CORRECTED EXTRACTED VALUE',
            needs_further_review: 'REFERRED FOR FURTHER REVIEW',
          };

          const roleLabelMap: Record<UserRole, string> = {
            inspector: 'Legal Metrology Officer',
            reviewer: 'Senior Compliance Reviewer',
            admin: 'Chief Metrology Administrator',
          };

          const newAuditEntry = {
            id: `aud-${Date.now()}`,
            reviewer: insp.inspectorName || 'Rajesh Varma',
            reviewerBadge: insp.inspectorBadgeNumber || 'LM-DEL-8492',
            role: roleLabelMap[userRole] || 'Legal Metrology Officer',
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            decision,
            decisionLabel: decisionLabelMap[decision] || 'INSPECTOR REVIEW',
            note: note.trim() || 'Inspector reviewed and confirmed verification status.',
            previousValue: f.detectedValue,
            newValue: newValue || f.detectedValue,
          };

          const updatedAuditTrail = [newAuditEntry, ...(f.auditTrail || [])];

          return {
            ...f,
            status: newStatus,
            detectedValue: newValue !== undefined ? newValue : f.detectedValue,
            auditTrail: updatedAuditTrail,
            inspectorOverride: {
              overridden: true,
              inspectorStatus: newStatus,
              inspectorNotes: note,
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              inspectorId: `${insp.inspectorName} (${insp.inspectorBadgeNumber})`,
            },
          };
        });

        // Recalculate summary metrics
        const passCount = updatedFindings.filter((f) => f.status === 'pass').length;
        const nonCompliantCount = updatedFindings.filter((f) => f.status === 'non_compliant').length;
        const reviewRequiredCount = updatedFindings.filter((f) => f.status === 'review_required').length;
        const total = updatedFindings.length;
        const score = Math.round((passCount / total) * 100);
        const overall: ComplianceStatus =
          nonCompliantCount > 0 ? 'non_compliant' : reviewRequiredCount > 0 ? 'review_required' : 'pass';

        return {
          ...insp,
          findings: updatedFindings,
          passCount,
          nonCompliantCount,
          reviewRequiredCount,
          complianceScore: score,
          overallStatus: overall,
        };
      })
    );
  };

  // Open review workspace directly for a finding
  const handleOpenReviewWorkspace = (inspectionId: string, findingId: string) => {
    setSelectedReviewInspectionId(inspectionId);
    setSelectedReviewFindingId(findingId);
    setActiveTab('human-review');
  };

  // Handle inspector override from card
  const handleOverrideStatus = (findingId: string, newStatus: ComplianceStatus, notes: string) => {
    handleRecordDecision(
      findingId,
      newStatus === 'pass' ? 'dismissed_compliant' : 'confirmed_issue',
      newStatus,
      notes
    );
  };

  const handleInspectionReady = (newInspection: InspectionSummary) => {
    const exists = inspections.find((i) => i.id === newInspection.id);
    if (!exists) {
      setInspections([newInspection, ...inspections]);
    }
    setCurrentInspectionId(newInspection.id);
    setActiveTab('inspection');
    setSelectedFindingId(undefined);
    setDetailFindingId(null);
  };

  // Filter findings based on category and search
  const filteredFindings = activeInspection.findings.filter((f) => {
    if (findingFilter === 'violations' && f.status !== 'non_compliant') return false;
    if (findingFilter === 'review' && f.status !== 'review_required') return false;
    if (findingFilter === 'pass' && f.status !== 'pass') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.ruleCode.toLowerCase().includes(q) ||
        f.ruleTitle.toLowerCase().includes(q) ||
        f.legalAct.toLowerCase().includes(q) ||
        f.extractedEvidence.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Prepare bounding box overlays for image viewer
  const imageBoundingBoxes = activeInspection.fields
    .filter((f) => f.boundingBox)
    .map((f) => ({
      id: f.id,
      box: f.boundingBox!,
      status: f.status,
      text: f.extractedValue,
    }));

  // Declaration table columns
  const declarationColumns: Column<any>[] = [
    {
      key: 'fieldName',
      header: 'Mandatory Declaration (LMPC 2011)',
      width: '260px',
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-900 block">{item.fieldName}</span>
          <span className="font-mono text-[10px] text-slate-500">{item.legalReference}</span>
        </div>
      ),
    },
    {
      key: 'extractedValue',
      header: 'Extracted Label Declaration',
      render: (item) => (
        <div className="space-y-0.5">
          <span className="font-mono text-xs text-slate-900 block">{item.extractedValue}</span>
          {item.notes && <span className="text-[11px] text-rose-700 block">{item.notes}</span>}
        </div>
      ),
    },
    {
      key: 'confidence',
      header: 'Extraction Confidence',
      width: '120px',
      align: 'center',
      render: (item) => (
        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          {(item.confidence * 100).toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Deterministic Status',
      width: '140px',
      align: 'center',
      render: (item) => (
        <Badge status={item.status} size="sm" withDot>
          {item.status === 'pass' ? 'PASS' : item.status === 'non_compliant' ? 'VIOLATION' : 'REVIEW'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Persistent Enterprise Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Positioning */}
            <div className="flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-md bg-[#0B2545] flex items-center justify-center text-white shadow-xs border border-slate-800 cursor-pointer"
                onClick={() => setDetailFindingId(null)}
              >
                <Scale className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="text-base sm:text-lg font-extrabold tracking-tight text-slate-950 cursor-pointer flex items-center gap-1.5"
                    onClick={() => setDetailFindingId(null)}
                  >
                    <span>BHARATLABEL</span>
                    <span className="text-[#0B2545] font-black text-xs sm:text-sm tracking-wide bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded border border-blue-200">
                      COMPLIANCE
                    </span>
                  </h1>
                </div>
                <p className="text-[11px] text-slate-500 font-medium tracking-tight hidden md:block">
                  AI-Powered Packaged Commodity Compliance &amp; Inspection Platform
                </p>
              </div>
            </div>

            {/* Middle Nav Switcher: Dashboard vs Inspections vs Active Inspection vs Human Review vs Report vs Design System */}
            <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-medium">
              <button
                id="nav-tab-dashboard"
                onClick={() => {
                  setActiveTab('dashboard');
                  setDetailFindingId(null);
                }}
                className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#0B2545]" />
                <span>Dashboard</span>
              </button>

              <button
                id="nav-tab-inspections"
                onClick={() => {
                  setActiveTab('inspections');
                  setDetailFindingId(null);
                }}
                className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                  activeTab === 'inspections'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-blue-900" />
                <span>Inspections</span>
              </button>

              <button
                id="nav-tab-workspace"
                onClick={() => {
                  setActiveTab('inspection');
                  setDetailFindingId(null);
                }}
                className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                  activeTab === 'inspection'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5 text-[#0B2545]" />
                <span>Workspace</span>
              </button>

              <button
                id="nav-tab-human-review"
                onClick={() => {
                  setActiveTab('human-review');
                  // Keep current selected finding or go to queue
                }}
                className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                  activeTab === 'human-review'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Inbox className="w-3.5 h-3.5 text-amber-700" />
                <span>Review Queue</span>
                {totalPendingReviews > 0 && (
                  <span className="font-mono text-[10px] font-bold bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded-full">
                    {totalPendingReviews}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-rules"
                onClick={() => {
                  setActiveTab('rule-master');
                  setDetailFindingId(null);
                }}
                className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                  activeTab === 'rule-master'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#0B2545]" />
                <span>Rule Master</span>
              </button>

              <button
                id="nav-tab-report"
                onClick={() => setActiveTab('report')}
                className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                  activeTab === 'report'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-800" />
                <span>Report</span>
              </button>

              <button
                id="nav-tab-design-system"
                onClick={() => setActiveTab('design-system')}
                className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                  activeTab === 'design-system'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-slate-600" />
                <span>Design System</span>
              </button>
            </div>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2.5">
              {/* Primary Action Button: Scan Product */}
              <Button
                id="btn-scan-product"
                variant="primary"
                size="md"
                leftIcon={<Scan className="w-4 h-4 text-blue-300" />}
                onClick={() => setIsScanModalOpen(true)}
              >
                Scan Product
              </Button>

              <Button
                variant="secondary"
                size="md"
                leftIcon={<FileText className="w-4 h-4 text-slate-600" />}
                onClick={() => setActiveTab('report')}
                className="hidden sm:inline-flex"
              >
                Official Report
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center border-t border-slate-200 bg-slate-50 px-3 py-1.5 overflow-x-auto gap-1 text-xs">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setDetailFindingId(null);
            }}
            className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-950 font-bold border border-slate-300 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#0B2545]" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('inspections');
              setDetailFindingId(null);
            }}
            className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'inspections'
                ? 'bg-white text-slate-950 font-bold border border-slate-300 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            <History className="w-3.5 h-3.5 text-blue-900" />
            <span>Inspections</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('inspection');
              setDetailFindingId(null);
            }}
            className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'inspection'
                ? 'bg-white text-slate-950 font-bold border border-slate-300 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#0B2545]" />
            <span>Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('human-review')}
            className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'human-review'
                ? 'bg-white text-slate-950 font-bold border border-slate-300 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-amber-700" />
            <span>Review Queue</span>
            {totalPendingReviews > 0 && (
              <span className="font-mono text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 rounded-full">
                {totalPendingReviews}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('rule-master');
              setDetailFindingId(null);
            }}
            className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'rule-master'
                ? 'bg-white text-slate-950 font-bold border border-slate-300 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0B2545]" />
            <span>Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'report'
                ? 'bg-white text-slate-950 font-bold border border-slate-300 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-800" />
            <span>Report</span>
          </button>

          <button
            onClick={() => setActiveTab('design-system')}
            className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'design-system'
                ? 'bg-white text-slate-950 font-bold border border-slate-300 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-600" />
            <span>Design</span>
          </button>
        </div>

        {/* Sub-Header: Active Inspection Metadata Strip */}
        {activeTab === 'inspection' && (
          <div className="bg-slate-100/90 border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-2 text-xs">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700">
                <span className="font-mono text-[11px] font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                  {activeInspection.inspectionNumber}
                </span>
                <span className="font-semibold text-slate-900 truncate">
                  {activeInspection.commodityName}
                </span>
                <span className="text-slate-400 hidden sm:inline">•</span>
                <span className="text-slate-600 truncate hidden md:inline">
                  {activeInspection.brandName}
                </span>
                <span className="text-slate-400 hidden lg:inline">•</span>
                <span className="text-slate-500 font-mono text-[11px] hidden lg:inline">
                  Officer: {activeInspection.inspectorName} ({activeInspection.inspectorBadgeNumber})
                </span>
              </div>

              {/* Sample switcher dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-mono uppercase hidden sm:inline">
                  Sample Case:
                </span>
                <select
                  value={activeInspection.id}
                  onChange={(e) => {
                    setCurrentInspectionId(e.target.value);
                    setSelectedFindingId(undefined);
                    setDetailFindingId(null);
                  }}
                  className="bg-white border border-slate-300 text-slate-800 text-xs rounded px-2 py-1 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  {inspections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.commodityName.split('(')[0]} ({s.overallStatus === 'pass' ? 'PASS' : s.overallStatus === 'non_compliant' ? 'VIOLATION' : 'REVIEW'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' ? (
          /* Operational Dashboard View */
          <DashboardView
            inspections={inspections}
            userRole={userRole}
            onScanProduct={() => setIsScanModalOpen(true)}
            onOpenInspection={(id) => {
              setCurrentInspectionId(id);
              setActiveTab('inspection');
              setSelectedFindingId(undefined);
              setDetailFindingId(null);
            }}
            onViewReport={(id) => {
              setCurrentInspectionId(id);
              setActiveTab('report');
            }}
            onViewAllInspections={() => setActiveTab('inspections')}
            onViewReviewQueue={() => setActiveTab('human-review')}
            onViewRules={() => setActiveTab('rule-master')}
            onReviewFinding={(inspId, findingId) => {
              setSelectedReviewInspectionId(inspId);
              setSelectedReviewFindingId(findingId || null);
              setActiveTab('human-review');
            }}
          />
        ) : activeTab === 'inspections' ? (
          /* Historical Inspections View */
          <InspectionHistoryView
            inspections={inspections}
            onSelectInspection={(id) => {
              setCurrentInspectionId(id);
              setActiveTab('inspection');
              setSelectedFindingId(undefined);
              setDetailFindingId(null);
            }}
            onViewReport={(id) => {
              setCurrentInspectionId(id);
              setActiveTab('report');
            }}
            onScanNew={() => setIsScanModalOpen(true)}
          />
        ) : activeTab === 'rule-master' ? (
          /* Statutory Rule Master & Legal Compendium View */
          <RuleMasterView
            onScanNewRule={() => setIsScanModalOpen(true)}
            onOpenInspectionSample={() => {
              setActiveTab('inspection');
            }}
          />
        ) : activeTab === 'design-system' ? (
          <DesignSystemShowcase />
        ) : activeTab === 'report' ? (
          /* Official Inspection Report Document View */
          <InspectionReportView
            inspection={activeInspection}
            onBackToInspection={() => setActiveTab('inspection')}
          />
        ) : activeTab === 'human-review' ? (
          reviewFinding ? (
            /* Dedicated Human Review Workspace */
            <ReviewWorkspace
              inspection={reviewInspection}
              finding={reviewFinding}
              allFindings={reviewInspection.findings}
              userRole={userRole}
              onChangeUserRole={setUserRole}
              onBackToQueue={() => setSelectedReviewFindingId(null)}
              onSelectFinding={(fid) => setSelectedReviewFindingId(fid)}
              onRecordDecision={handleRecordDecision}
            />
          ) : (
            /* Comprehensive Human Review Queue */
            <ReviewQueue
              inspections={inspections}
              onSelectReviewItem={(inspId, findingId) => {
                setSelectedReviewInspectionId(inspId);
                setSelectedReviewFindingId(findingId);
              }}
            />
          )
        ) : activeDetailFinding ? (
          /* Dedicated Finding & Evidence Detail Experience */
          <FindingDetailView
            inspection={activeInspection}
            finding={activeDetailFinding}
            allFindings={activeInspection.findings}
            onBackToOverview={() => setDetailFindingId(null)}
            onSelectFinding={(fid) => setDetailFindingId(fid)}
            onRecordDecision={handleRecordDecision}
          />
        ) : (
          <div className="space-y-6">
            {/* Top Quick Understandability & Instruction Banner for 10-Second Comprehension */}
            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-[#0B2545]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Statutory Packaged Commodity Inspection Dashboard
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    AI assists with OCR and information extraction. Statutory compliance verdicts are governed by deterministic software rules under the <strong className="text-slate-800">Legal Metrology (Packaged Commodities) Rules 2011</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                <Badge status={activeInspection.overallStatus} withDot size="lg">
                  {activeInspection.overallStatus === 'pass'
                    ? 'STATUTORY PASS'
                    : activeInspection.overallStatus === 'non_compliant'
                    ? 'POTENTIAL VIOLATION'
                    : 'REVIEW REQUIRED'}
                </Badge>
              </div>
            </div>

            {/* Core Split Inspection Layout: Left Image Canvas & Right Evidence Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Label Evidence Viewer (5 cols on lg) */}
              <div className="lg:col-span-5 space-y-4">
                <InspectionImageViewer
                  imageUrl={activeInspection.imageUrl}
                  commodityName={activeInspection.commodityName}
                  boundingBoxes={imageBoundingBoxes}
                  activeBoxId={selectedFindingId}
                  onSelectBox={(boxId) => {
                    setSelectedFindingId(boxId);
                    setViewSubTab('declarations');
                  }}
                />

                {/* Packaging & Batch Particulars Card */}
                <Panel title="Commodity &amp; Packaging Particulars" isCompact>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 font-medium">Commodity:</span>
                      <span className="font-semibold text-slate-900 text-right">{activeInspection.commodityName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 font-medium">Brand &amp; Packer:</span>
                      <span className="text-slate-800 text-right truncate max-w-[200px]">{activeInspection.brandName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 font-medium">Declared Net Qty:</span>
                      <span className="font-mono font-bold text-slate-900">{activeInspection.netQuantityDeclared}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 font-medium">Declared MRP:</span>
                      <span className="font-mono font-bold text-slate-900">{activeInspection.mrpDeclared}</span>
                    </div>
                    <div className="flex justify-between pb-0.5">
                      <span className="text-slate-500 font-medium">Batch / Lot No:</span>
                      <span className="font-mono text-slate-800">{activeInspection.batchOrLotNumber}</span>
                    </div>
                  </div>
                </Panel>
              </div>

              {/* Right Column: Deterministic Compliance Metrics & Findings (7 cols on lg) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Score Meter Component */}
                <ScoreMeter
                  score={activeInspection.complianceScore}
                  status={activeInspection.overallStatus}
                  passCount={activeInspection.passCount}
                  nonCompliantCount={activeInspection.nonCompliantCount}
                  reviewRequiredCount={activeInspection.reviewRequiredCount}
                  totalRules={activeInspection.totalRulesEvaluated}
                />

                {/* Sub-Tabs: Findings vs Mandatory Declarations Table */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewSubTab('findings')}
                        className={`text-xs font-bold uppercase tracking-wider font-mono pb-2 -mb-2.5 transition-colors border-b-2 ${
                          viewSubTab === 'findings'
                            ? 'border-slate-900 text-slate-950'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Potential Findings &amp; Evidence ({activeInspection.findings.length})
                      </button>
                      <button
                        onClick={() => setViewSubTab('declarations')}
                        className={`text-xs font-bold uppercase tracking-wider font-mono pb-2 -mb-2.5 transition-colors border-b-2 ${
                          viewSubTab === 'declarations'
                            ? 'border-slate-900 text-slate-950'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Mandatory Declarations Table ({activeInspection.fields.length})
                      </button>
                    </div>

                    {/* Filter & Search for Findings */}
                    {viewSubTab === 'findings' && (
                      <div className="flex items-center gap-2">
                        <SegmentedControl
                          value={findingFilter}
                          onChange={setFindingFilter}
                          options={[
                            { label: 'All', value: 'all', count: activeInspection.findings.length },
                            { label: 'Violations', value: 'violations', count: activeInspection.nonCompliantCount },
                            { label: 'Review', value: 'review', count: activeInspection.reviewRequiredCount },
                          ]}
                        />
                      </div>
                    )}
                  </div>

                  {/* Sub-Tab View 1: Rule-by-rule Findings */}
                  {viewSubTab === 'findings' && (
                    <div className="space-y-3">
                      {filteredFindings.length === 0 ? (
                        <div className="p-8 text-center bg-white border border-slate-200 rounded-md text-slate-400 text-xs">
                          No findings match the selected filter criteria.
                        </div>
                      ) : (
                        filteredFindings.map((finding) => (
                          <RuleFindingCard
                            key={finding.id}
                            finding={finding}
                            isSelected={selectedFindingId === finding.boundingBoxId}
                            onSelect={() => setSelectedFindingId(finding.boundingBoxId)}
                            onInspectDetail={() => setDetailFindingId(finding.id)}
                            onOverrideStatus={handleOverrideStatus}
                          />
                        ))
                      )}
                    </div>
                  )}

                  {/* Sub-Tab View 2: High-Density Declarations Table */}
                  {viewSubTab === 'declarations' && (
                    <Table
                      columns={declarationColumns}
                      data={activeInspection.fields}
                      keyExtractor={(item) => item.id}
                      selectedRowKey={selectedFindingId}
                      onRowClick={(item) => setSelectedFindingId(item.id)}
                      isStriped
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Bar */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">BharatLabel AI</span>
            <span>• Packaged Commodity Compliance &amp; Inspection Platform</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Legal Metrology (Packaged Commodities) Rules, 2011 • FSSAI Regulations • BIS Act
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onInspectionReady={handleInspectionReady}
      />

      <InspectionReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        inspection={activeInspection}
      />
    </div>
  );
}

