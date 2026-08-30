import React, { useState } from 'react';
import {
  InspectionSummary,
  ComplianceFinding,
  ComplianceStatus,
  UserRole,
  ReviewWorkflowStatus,
} from '../../types';
import { EvidenceViewer } from './EvidenceViewer';
import { DecisionPanel } from './DecisionPanel';
import { ReviewTimeline } from './ReviewTimeline';
import { ReviewStatusBadge } from './ReviewStatus';
import { Button } from '../../design-system/Button';
import { StatusIndicator } from '../../design-system/StatusIndicator';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  User,
  Sliders,
} from 'lucide-react';

interface ReviewWorkspaceProps {
  inspection: InspectionSummary;
  finding: ComplianceFinding;
  allFindings?: ComplianceFinding[];
  userRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  onBackToQueue: () => void;
  onSelectFinding: (findingId: string) => void;
  onRecordDecision: (
    findingId: string,
    decision: 'marked_reviewed' | 'confirmed_issue' | 'dismissed_compliant' | 'edited_value' | 'needs_further_review',
    newStatus: ComplianceStatus,
    note: string,
    newValue?: string
  ) => void;
  className?: string;
  id?: string;
}

export const ReviewWorkspace: React.FC<ReviewWorkspaceProps> = ({
  inspection,
  finding,
  allFindings = [],
  userRole,
  onChangeUserRole,
  onBackToQueue,
  onSelectFinding,
  onRecordDecision,
  className = '',
  id,
}) => {
  // Mobile sequential review step tracker
  const [mobileStep, setMobileStep] = useState<number>(1);

  // Finding index for previous/next navigation
  const currentIndex = allFindings.findIndex((f) => f.id === finding.id);
  const prevFinding = currentIndex > 0 ? allFindings[currentIndex - 1] : null;
  const nextFinding = currentIndex < allFindings.length - 1 ? allFindings[currentIndex + 1] : null;

  // Determine finding review status
  const currentReviewStatus: ReviewWorkflowStatus =
    finding.auditTrail && finding.auditTrail.length > 0
      ? 'reviewed'
      : finding.status === 'review_required'
      ? 'further_review_required'
      : 'pending_review';

  // Low confidence explanation
  const isLowConfidence = finding.confidence < 0.85;

  return (
    <div id={id} className={`space-y-4 ${className}`}>
      {/* Top Header Bar */}
      <div className="bg-white border border-slate-300 rounded-md p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          {/* Back & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToQueue}
              className="gap-1 text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Review Queue</span>
            </Button>

            <div className="border-l border-slate-300 pl-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  Inspection #{inspection.inspectionNumber}
                </span>
                <span className="text-slate-400">•</span>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-950 truncate max-w-[280px] sm:max-w-md">
                  {inspection.commodityName}
                </h1>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Brand: <strong className="text-slate-700 font-sans">{inspection.brandName}</strong> | Category:{' '}
                <span className="text-slate-700 font-sans">{inspection.category}</span>
              </div>
            </div>
          </div>

          {/* Top Right: Status & Role Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            <ReviewStatusBadge status={currentReviewStatus} size="md" />

            {/* Role Simulation Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded border border-slate-300 text-xs font-mono">
              <User className="w-3.5 h-3.5 text-slate-600 ml-1" />
              <span className="text-[11px] text-slate-500 font-medium">Role:</span>
              <select
                value={userRole}
                onChange={(e) => onChangeUserRole(e.target.value as UserRole)}
                className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-900 font-bold focus:outline-none"
              >
                <option value="inspector">Inspector</option>
                <option value="reviewer">Senior Reviewer</option>
                <option value="admin">System Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Finding Switcher Strip across this inspection */}
        {allFindings.length > 1 && (
          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 font-mono text-slate-600">
              <span className="font-bold text-slate-900">Case {currentIndex + 1} of {allFindings.length}:</span>
              <span className="font-sans font-semibold text-slate-800 truncate max-w-[220px] sm:max-w-md">
                {finding.ruleTitle}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={!prevFinding}
                onClick={() => prevFinding && onSelectFinding(prevFinding.id)}
                className="text-xs p-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev Finding</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!nextFinding}
                onClick={() => nextFinding && onSelectFinding(nextFinding.id)}
                className="text-xs p-1.5"
              >
                <span className="hidden sm:inline">Next Finding</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sequential Stepper (Visible on Mobile only) */}
      <div className="lg:hidden bg-white border border-slate-300 rounded-md p-3 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
          <span>Sequential Review Step {mobileStep} of 4</span>
          <span className="text-[#0B2545]">
            {mobileStep === 1
              ? '1. Evidence & Image'
              : mobileStep === 2
              ? '2. Finding & Rule'
              : mobileStep === 3
              ? '3. Determination & Notes'
              : '4. Audit History'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => setMobileStep(step)}
              className={`h-1.5 rounded-full transition-all ${
                mobileStep === step
                  ? 'bg-[#0B2545]'
                  : mobileStep > step
                  ? 'bg-emerald-600'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main 3-Pane Desktop Layout (Responsive on Mobile via stepper) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANE: Product label image with evidence regions (4 cols on lg) */}
        <div
          className={`lg:col-span-4 space-y-3 ${
            mobileStep !== 1 ? 'hidden lg:block' : 'block'
          }`}
        >
          <EvidenceViewer
            imageUrl={inspection.imageUrl}
            evidenceRegion={finding.evidenceRegion}
            hasReliableRegion={finding.hasReliableRegion}
            analyzedField={finding.analyzedField}
            extractedEvidence={finding.extractedEvidence}
            detectedValue={finding.detectedValue}
            commodityName={inspection.commodityName}
          />

          {/* Quick packaging reference */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1.5 font-mono">
            <div className="text-[10px] uppercase font-bold text-slate-500">
              Packaging Metadata
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Declared Qty:</span>
              <strong className="text-slate-800">{inspection.netQuantityDeclared}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Declared MRP:</span>
              <strong className="text-slate-800">{inspection.mrpDeclared}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Batch / Lot:</span>
              <span className="text-slate-800">{inspection.batchOrLotNumber}</span>
            </div>
          </div>

          {/* Mobile step advance button */}
          <div className="lg:hidden pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => setMobileStep(2)}
              className="w-full bg-[#0B2545] text-white"
            >
              Continue to Finding Details →
            </Button>
          </div>
        </div>

        {/* CENTER PANE: Extracted Information & Relevant Compliance Checks (5 cols on lg) */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            mobileStep !== 2 ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Main Finding Overview Card */}
          <div className="bg-white border border-slate-300 rounded-md p-4 space-y-4 shadow-2xs">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                    {finding.ruleCode}
                  </span>
                  <StatusIndicator status={finding.status} size="sm" />
                </div>
                <h2 className="text-base font-extrabold text-slate-950 mt-1">
                  {finding.ruleTitle}
                </h2>
                <div className="text-xs text-slate-600 font-mono mt-0.5">
                  Legal Act: <strong className="text-slate-800">{finding.legalAct}</strong>
                </div>
              </div>

              {/* Confidence badge */}
              <div className="text-right shrink-0">
                <div className="text-[10px] uppercase font-mono text-slate-500">
                  AI Confidence
                </div>
                <div
                  className={`text-sm font-extrabold font-mono px-2 py-0.5 rounded mt-0.5 inline-block ${
                    finding.confidence >= 0.9
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : finding.confidence >= 0.8
                      ? 'bg-blue-50 text-blue-800 border border-blue-300'
                      : 'bg-amber-50 text-amber-900 border border-amber-300'
                  }`}
                >
                  {(finding.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Low Confidence Case Specific Banner if applicable */}
            {isLowConfidence && (
              <div className="bg-amber-50/90 border border-amber-300 rounded p-3 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-950 font-mono">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  Low Confidence AI Assessment (Human Judgment Essential)
                </div>
                <p className="text-amber-900 leading-relaxed">
                  {finding.uncertaintyReason ||
                    'Optical character extraction encountered surface curvature, packaging glare, or borderline edge contrast in this region. The product must not be penalized automatically.'}
                </p>
                <div className="text-[11px] text-amber-800 font-mono font-semibold pt-1 border-t border-amber-200">
                  Recommendation: Verify the physical packaging pouch in daylight before finalizing status.
                </div>
              </div>
            )}

            {/* The 4 Core Explanatory Dimensions */}
            <div className="space-y-3 text-xs">
              {/* WHAT was detected */}
              <div className="bg-slate-50 rounded p-3 border border-slate-200 space-y-1">
                <span className="font-mono text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                  1. What Was Detected (Observed Evidence)
                </span>
                <p className="text-slate-900 font-semibold leading-relaxed">
                  {finding.whatWasObserved}
                </p>
              </div>

              {/* WHY was it flagged */}
              <div className="bg-slate-50 rounded p-3 border border-slate-200 space-y-1">
                <span className="font-mono text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                  2. Why It Was Flagged (Statutory Rationale)
                </span>
                <p className="text-slate-800 leading-relaxed">
                  {finding.whyFlagged}
                </p>
              </div>

              {/* WHAT does the statutory rule say */}
              <div className="bg-blue-50/50 rounded p-3 border border-blue-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase text-blue-900 tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-blue-700" />
                    3. What The Rule Mandates
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded">
                    {finding.ruleStatus || 'Active Rule'}
                  </span>
                </div>
                <p className="text-blue-950 font-medium leading-relaxed italic bg-white p-2 rounded border border-blue-200/70">
                  "{finding.deterministicRule}"
                </p>
                <div className="text-[11px] text-blue-800 font-mono">
                  Source: {finding.ruleSource || 'Ministry of Consumer Affairs (Legal Metrology)'}
                </div>
              </div>

              {/* Recommended Action for Reviewer */}
              <div className="bg-slate-900 text-slate-100 rounded p-3 space-y-1 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-amber-300">
                  <Sparkles className="w-3 h-3" />
                  Recommended Inspector Action
                </div>
                <p className="text-slate-200 leading-relaxed font-medium">
                  {finding.recommendedAction}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile step advance buttons */}
          <div className="lg:hidden flex gap-2 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setMobileStep(1)}
              className="flex-1"
            >
              ← Back to Image
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setMobileStep(3)}
              className="flex-1 bg-[#0B2545] text-white"
            >
              Make Decision →
            </Button>
          </div>
        </div>

        {/* RIGHT PANE: Review Decision Panel & Compact Timeline (3 cols on lg) */}
        <div
          className={`lg:col-span-3 space-y-4 ${
            mobileStep === 1 || mobileStep === 2 ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Decision Panel (Visible in step 3 or desktop) */}
          <div className={mobileStep === 4 ? 'hidden lg:block' : 'block'}>
            <DecisionPanel
              finding={finding}
              userRole={userRole}
              currentReviewerName={inspection.inspectorName || 'Rajesh Varma'}
              currentReviewerBadge={inspection.inspectorBadgeNumber || 'LM-DEL-8492'}
              onRecordDecision={onRecordDecision}
            />
          </div>

          {/* Audit History Timeline (Visible in step 4 or desktop) */}
          <div
            className={`bg-white border border-slate-300 rounded-md p-4 shadow-2xs ${
              mobileStep === 3 ? 'hidden lg:block' : 'block'
            }`}
          >
            <ReviewTimeline
              auditTrail={finding.auditTrail || []}
              initialCreatedAt={inspection.inspectedAt}
              initialConfidence={finding.confidence}
            />
          </div>

          {/* Mobile step nav */}
          <div className="lg:hidden flex gap-2 pt-2">
            {mobileStep === 3 ? (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setMobileStep(2)}
                  className="flex-1"
                >
                  ← Back to Details
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setMobileStep(4)}
                  className="flex-1"
                >
                  View Audit Trail →
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="md"
                onClick={() => setMobileStep(3)}
                className="w-full"
              >
                ← Back to Decision Panel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
