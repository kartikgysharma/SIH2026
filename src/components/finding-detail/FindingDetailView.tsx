import React from 'react';
import { ComplianceFinding, InspectionSummary, ComplianceStatus } from '../../types';
import { FindingHeader } from './FindingHeader';
import { EvidenceViewer } from './EvidenceViewer';
import { EvidenceMetadata } from './EvidenceMetadata';
import { RuleReference } from './RuleReference';
import { RecommendedAction } from './RecommendedAction';
import { ReviewActions } from './ReviewActions';
import { Panel } from '../../design-system/Panel';
import { Button } from '../../design-system/Button';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface FindingDetailViewProps {
  inspection: InspectionSummary;
  finding: ComplianceFinding;
  allFindings: ComplianceFinding[];
  onBackToOverview: () => void;
  onSelectFinding: (findingId: string) => void;
  onRecordDecision: (
    findingId: string,
    decision: 'marked_reviewed' | 'confirmed_issue' | 'dismissed_compliant' | 'edited_value',
    newStatus: ComplianceStatus,
    note: string,
    newValue?: string
  ) => void;
  id?: string;
}

export const FindingDetailView: React.FC<FindingDetailViewProps> = ({
  inspection,
  finding,
  allFindings,
  onBackToOverview,
  onSelectFinding,
  onRecordDecision,
  id,
}) => {
  const currentIndex = allFindings.findIndex((f) => f.id === finding.id);
  const totalFindings = allFindings.length;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSelectFinding(allFindings[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalFindings - 1) {
      onSelectFinding(allFindings[currentIndex + 1].id);
    }
  };

  // Find corresponding field if present
  const relatedField = inspection.fields.find(
    (f) => f.fieldKey === finding.analyzedField.toLowerCase().replace(/\s+/g, '_') || f.fieldName.includes(finding.analyzedField)
  );

  // Prepare bounding box
  const evidenceRegion = finding.evidenceRegion || relatedField?.boundingBox;

  return (
    <div id={id} className="space-y-6">
      {/* Top Breadcrumb & Quick Switch Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4 text-slate-700" />}
            onClick={onBackToOverview}
            className="text-xs font-semibold"
          >
            Compliance Overview
          </Button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="text-xs text-slate-600 truncate">
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 mr-2">
              {inspection.inspectionNumber}
            </span>
            <span className="font-medium text-slate-800 hidden md:inline">
              {inspection.commodityName}
            </span>
          </div>
        </div>

        {/* Finding Quick Switch Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-mono uppercase font-semibold text-slate-500 mr-1 shrink-0">
            Findings:
          </span>
          {allFindings.map((f, idx) => {
            const isSelected = f.id === finding.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelectFinding(f.id)}
                title={`${f.ruleCode}: ${f.ruleTitle}`}
                className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : f.status === 'non_compliant'
                    ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    : f.status === 'review_required'
                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.status === 'non_compliant' && <AlertOctagon className="w-3 h-3 text-rose-600" />}
                {f.status === 'review_required' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                {f.status === 'pass' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                <span>{f.ruleCode}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Responsive Layout: Left Image Evidence / Right Finding Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Primary Evidence Viewer (5 Cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <EvidenceViewer
            imageUrl={inspection.imageUrl}
            commodityName={inspection.commodityName}
            evidenceRegion={evidenceRegion}
            hasReliableRegion={finding.hasReliableRegion}
            status={finding.status}
            analyzedField={finding.analyzedField}
            detectedValue={finding.detectedValue}
            textualExplanation={finding.whatWasObserved}
            allBoundingBoxes={inspection.fields
              .filter((f) => f.boundingBox)
              .map((f) => ({
                id: f.id,
                box: f.boundingBox!,
                status: f.status,
                text: f.extractedValue,
              }))}
          />

          {/* Commodity Particulars Reference Card */}
          <Panel title="Commodity &amp; Packaging Reference" isCompact>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">Commodity:</span>
                <span className="font-semibold text-slate-900 text-right truncate max-w-[220px]">
                  {inspection.commodityName}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">Brand &amp; Packer:</span>
                <span className="text-slate-800 text-right truncate max-w-[220px]">
                  {inspection.brandName}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">Net Qty / MRP:</span>
                <span className="font-mono font-bold text-slate-900">
                  {inspection.netQuantityDeclared} • {inspection.mrpDeclared}
                </span>
              </div>
              <div className="flex justify-between pb-0.5">
                <span className="text-slate-500 font-medium">Batch / Lot No:</span>
                <span className="font-mono text-slate-800">{inspection.batchOrLotNumber}</span>
              </div>
            </div>
          </Panel>

          {/* Philosophical Differentiator Banner */}
          <div className="bg-slate-100/90 border border-slate-200 rounded p-3 text-[11px] text-slate-600 leading-relaxed">
            <div className="font-mono font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#0B2545]" />
              <span>Inspection Framework Standard</span>
            </div>
            <span>
              <strong>AI understands the label. Rules validate the requirement. Evidence explains the result. Humans handle uncertainty.</strong>
            </span>
          </div>
        </div>

        {/* Right Column: Finding Details (7 Cols on lg) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Finding Header */}
          <FindingHeader
            status={finding.status}
            ruleTitle={finding.ruleTitle}
            conciseExplanation={finding.reasoning}
            ruleCode={finding.ruleCode}
            category={finding.category}
            severity={finding.severity}
            currentIndex={currentIndex}
            totalFindings={totalFindings}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />

          {/* 2. Structured Evidence Information */}
          <EvidenceMetadata
            analyzedField={finding.analyzedField}
            detectedValue={finding.detectedValue}
            confidence={finding.confidence}
            whatWasObserved={finding.whatWasObserved}
            extractedEvidenceSnippet={finding.extractedEvidence}
            hasReliableRegion={finding.hasReliableRegion}
          />

          {/* 3. Statutory Rule Information */}
          <RuleReference
            ruleName={finding.ruleName || finding.ruleTitle}
            ruleId={finding.ruleId || finding.ruleCode}
            ruleSource={finding.ruleSource || 'Ministry of Consumer Affairs (Legal Metrology Division)'}
            ruleReference={finding.ruleReference || finding.legalAct}
            ruleStatus={finding.ruleStatus || 'Active'}
            deterministicRule={finding.deterministicRule}
            officialSourceUrl={finding.officialSourceUrl}
          />

          {/* 4. Plain-Language Explanation & Why It Was Flagged */}
          <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
              Plain-Language Explanation
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {finding.whyFlagged}
            </p>
          </div>

          {/* 5. Recommended Action for the Inspector */}
          <RecommendedAction
            status={finding.status}
            recommendedAction={finding.recommendedAction}
            confidence={finding.confidence}
            uncertaintyReason={finding.uncertaintyReason}
          />

          {/* 6. Human Review & Verification Controls */}
          <ReviewActions
            findingId={finding.id}
            currentStatus={finding.status}
            currentValue={finding.detectedValue}
            fieldName={finding.analyzedField}
            inspectorName={inspection.inspectorName}
            inspectorBadgeNumber={inspection.inspectorBadgeNumber}
            auditTrail={finding.auditTrail}
            onRecordDecision={(decision, newStatus, note, newValue) => {
              onRecordDecision(finding.id, decision, newStatus, note, newValue);
            }}
          />
        </div>
      </div>
    </div>
  );
};
