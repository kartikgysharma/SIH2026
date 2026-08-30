export type ComplianceStatus = 'pass' | 'non_compliant' | 'review_required' | 'pending';

export type ReviewWorkflowStatus = 'pending_review' | 'in_review' | 'reviewed' | 'further_review_required';

export type UserRole = 'inspector' | 'reviewer' | 'admin';

export type RuleCategory = 
  | 'lmpc_mandatory' // Legal Metrology (Packaged Commodities) Rules, 2011
  | 'fssai_food_safety' // Food Safety and Standards Authority of India
  | 'weights_measures' // Net Quantity & Unit Sale Price
  | 'consumer_protection' // Consumer Care & Grievance Redressal
  | 'origin_import'; // Country of Origin & Importer Declarations

export interface BoundingBox {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage
  height: number; // percentage
  label: string;
}

export interface ExtractedField {
  id: string;
  fieldKey: string;
  fieldName: string;
  category: RuleCategory;
  legalReference: string;
  extractedValue: string;
  expectedPattern?: string;
  confidence: number; // 0 to 1
  isMandatory: boolean;
  status: ComplianceStatus;
  boundingBox?: BoundingBox;
  notes?: string;
}

export interface ReviewAuditEntry {
  id: string;
  reviewer: string;
  reviewerBadge?: string;
  role?: string;
  timestamp: string;
  decision: 'marked_reviewed' | 'confirmed_issue' | 'dismissed_compliant' | 'edited_value' | 'needs_further_review';
  decisionLabel: string;
  previousStatus?: ComplianceStatus;
  newStatus?: ComplianceStatus;
  note?: string;
  editedField?: string;
  previousValue?: string;
  newValue?: string;
}

export interface ComplianceFinding {
  id: string;
  ruleCode: string;
  ruleTitle: string;
  legalAct: string; // e.g., "LMPC Rules 2011 - Rule 6(1)(b)"
  category: RuleCategory;
  status: ComplianceStatus;
  severity: 'high' | 'medium' | 'low';
  
  // The 4 Core Finding Dimensions
  whatWasObserved: string; // Plain observation: WHAT was detected
  whyFlagged: string; // Statutory logic: WHY it was flagged
  extractedEvidence: string; // Concrete extracted text / measurement
  recommendedAction: string; // Actionable next step for inspector: WHAT to do next
  
  // Specific Evidence & Rule Details
  analyzedField: string;
  detectedValue: string;
  confidence: number; // 0 to 1
  deterministicRule: string;
  reasoning: string;
  
  // Rule Registry Reference
  ruleId: string;
  ruleName: string;
  ruleSource: string;
  ruleReference: string;
  ruleStatus: 'Active' | 'Under Review' | 'Draft';
  officialSourceUrl?: string;
  
  // Evidence Region
  hasReliableRegion: boolean;
  boundingBoxId?: string;
  evidenceRegion?: BoundingBox;
  
  // State-specific explanation
  uncertaintyReason?: string; // For review_required
  passVerificationNote?: string; // For pass
  
  // Review Status for this finding
  reviewStatus?: ReviewWorkflowStatus;

  // Human Verification Trail
  inspectorOverride?: {
    overridden: boolean;
    inspectorStatus?: ComplianceStatus;
    inspectorNotes?: string;
    timestamp?: string;
    inspectorId?: string;
  };
  auditTrail?: ReviewAuditEntry[];
}

export interface InspectionSummary {
  id: string;
  inspectionNumber: string;
  commodityName: string;
  brandName: string;
  batchOrLotNumber: string;
  manufacturerName: string;
  category: string;
  netQuantityDeclared: string;
  mrpDeclared: string;
  unitSalePriceDeclared?: string;
  fssaiLicenseNo?: string;
  countryOfOrigin: string;
  packagingDate?: string;
  expiryOrBestBefore?: string;
  overallStatus: ComplianceStatus;
  complianceScore: number; // 0 to 100
  passCount: number;
  nonCompliantCount: number;
  reviewRequiredCount: number;
  totalRulesEvaluated: number;
  inspectedAt: string;
  inspectorName: string;
  inspectorBadgeNumber: string;
  location: string;
  imageUrl: string;
  fields: ExtractedField[];
  findings: ComplianceFinding[];
  reportNotes?: string;
  
  // Human Review Workflow metadata
  reviewStatus?: ReviewWorkflowStatus;
  priority?: 'high' | 'medium' | 'low';
  assignedReviewer?: string;
  lastReviewedAt?: string;
}

export interface ReviewQueueItem {
  id: string;
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
  severity: 'high' | 'medium' | 'low';
  inspectedAt: string;
  uncertaintyReason?: string;
  whatWasObserved: string;
  hasReliableRegion: boolean;
}

export type ActiveTab = 'dashboard' | 'inspections' | 'inspection' | 'human-review' | 'report' | 'design-system';

export type DashboardDateRange = 'all' | 'today' | 'last_7_days' | 'last_30_days' | 'custom';

export interface InspectionFilterState {
  searchQuery: string;
  status: ComplianceStatus | 'all';
  dateRange: 'all' | 'today' | 'last_7_days' | 'last_30_days' | 'custom';
  customDateStart?: string;
  customDateEnd?: string;
  category: string | 'all';
  reviewStatus: ReviewWorkflowStatus | 'all';
  scoreRange: 'all' | 'high' | 'medium' | 'low';
  inspector: string | 'all';
}

export type SortField = 'date' | 'score' | 'inspectionNumber' | 'commodityName' | 'category' | 'status' | 'reviewStatus';
export type SortDirection = 'asc' | 'desc';


