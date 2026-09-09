import { normalizeRawExtraction, type RawExtractionResult } from "./geminiExtraction.ts";
import type {
  InspectionSummary,
  ExtractedField,
  ComplianceFinding,
  ComplianceStatus,
  TamperingDetectionResult,
  PackageImage,
  PackageSide,
} from "../src/types.ts";

export interface ExtractedSideInput {
  imageId: string;
  side: PackageSide | string;
  fileName?: string;
  imageUrl: string;
  extraction: RawExtractionResult;
}

interface SideCandidate {
  imageId: string;
  side: PackageSide | string;
  fileName?: string;
  imageUrl: string;
  value: string;
  evidence?: string | null;
  confidence: number;
  raw?: any;
}

/**
 * Checks if two extracted values for the same statutory declaration conflict with each other
 */
function areDeclarationsConflicting(
  candA: SideCandidate,
  candB: SideCandidate,
  fieldType: "mrp" | "net_quantity" | "date" | "usp" | "batch" | "fssai" | "origin" | "text"
): boolean {
  if (!candA.value || !candB.value) return false;
  const strA = candA.value.toLowerCase().trim();
  const strB = candB.value.toLowerCase().trim();
  if (strA === strB) return false;

  if (fieldType === "mrp") {
    // Extract numerical value from both
    const numA = strA.replace(/[^0-9.]/g, "");
    const numB = strB.replace(/[^0-9.]/g, "");
    if (numA && numB && Math.abs(parseFloat(numA) - parseFloat(numB)) > 0.05) {
      return true;
    }
    return false;
  }

  if (fieldType === "net_quantity") {
    const numA = strA.replace(/[^0-9.]/g, "");
    const numB = strB.replace(/[^0-9.]/g, "");
    if (numA && numB && Math.abs(parseFloat(numA) - parseFloat(numB)) > 0.05) {
      return true;
    }
    return false;
  }

  if (fieldType === "date") {
    const digitsA = strA.replace(/[^0-9]/g, "");
    const digitsB = strB.replace(/[^0-9]/g, "");
    if (digitsA.length >= 4 && digitsB.length >= 4 && digitsA !== digitsB) {
      return true;
    }
    return false;
  }

  if (fieldType === "batch") {
    const cleanA = strA.replace(/[^a-z0-9]/gi, "");
    const cleanB = strB.replace(/[^a-z0-9]/gi, "");
    if (cleanA.length >= 3 && cleanB.length >= 3 && cleanA !== cleanB) {
      return true;
    }
    return false;
  }

  if (fieldType === "fssai") {
    const dA = strA.replace(/[^0-9]/g, "");
    const dB = strB.replace(/[^0-9]/g, "");
    if (dA.length === 14 && dB.length === 14 && dA !== dB) {
      return true;
    }
    return false;
  }

  if (fieldType === "origin") {
    const normOrigin = (s: string) =>
      s.includes("india") || s.includes("bharat")
        ? "india"
        : s.replace(/^(made in|country of origin:?|product of)\s*/i, "").trim();
    return normOrigin(strA) !== normOrigin(strB);
  }

  return false;
}

/**
 * Unified Multi-Image Packaging Compliance Evaluator
 * Aggregates declarations across 1 to N images of a single packaged commodity,
 * detects declaration conflicts, preserves source image traceability, and evaluates tampering across all panels.
 */
export function evaluateMultiImageInspectionCompliance(
  extractions: ExtractedSideInput[],
  inspectorName = "Field Inspection Officer",
  inspectorBadgeNumber = "LM-INSP-AUTO",
  location = "Packaged Commodity Inspection Center",
  preferredFileName?: string
): InspectionSummary {
  if (!extractions || extractions.length === 0) {
    throw new Error("No extracted package images provided for compliance evaluation.");
  }

  // Normalize each extraction safely
  const safeExtractions = extractions.map((ext, idx) => ({
    imageId: ext.imageId || `img_${idx + 1}`,
    side: (ext.side as PackageSide) || (idx === 0 ? "Front" : "Other"),
    fileName: ext.fileName || preferredFileName || `package_image_${idx + 1}.jpg`,
    imageUrl: ext.imageUrl,
    extraction: normalizeRawExtraction(ext.extraction),
  }));

  const inspectionId = `insp-${Date.now()}`;
  const inspectionNumber = `INSP-FIELD-${Math.floor(1000 + Math.random() * 9000)}`;
  const inspectedAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST";

  const fields: ExtractedField[] = [];
  const findings: ComplianceFinding[] = [];
  let hasDeclarationConflicts = false;

  const cleanConfidence = (conf: number | null | undefined): number => {
    if (typeof conf === "number" && !isNaN(conf)) {
      return Math.max(0, Math.min(1, conf));
    }
    return 0.85;
  };

  // Build packageImages list for the inspection summary
  const packageImages: PackageImage[] = safeExtractions.map((ext, idx) => ({
    id: ext.imageId,
    url: ext.imageUrl,
    side: ext.side as PackageSide,
    fileName: ext.fileName,
    isPrimary: idx === 0 || ext.side.toLowerCase() === "front",
    quality: ext.extraction.image_quality
      ? {
          isUsable: ext.extraction.image_quality.is_usable !== false,
          blurDetected: ext.extraction.image_quality.blur_detected,
          glareDetected: ext.extraction.image_quality.glare_detected,
          textLegible: ext.extraction.image_quality.text_legible,
          issue: ext.extraction.image_quality.quality_issue,
        }
      : undefined,
  }));

  // Primary display image URL (prefer Front, else first image)
  const primaryPackageImg =
    packageImages.find((p) => p.side.toLowerCase() === "front") || packageImages[0];
  const primaryImageUrl = primaryPackageImg ? primaryPackageImg.url : "";

  // Uploaded sides list formatted for messages (e.g. "Front, Back, Right Side")
  const uploadedSidesText = packageImages.map((p) => p.side).join(", ");
  const isSingleFrontImageOnly =
    packageImages.length === 1 && packageImages[0].side.toLowerCase() === "front";

  // Check for tampering across ALL images
  const allTamperingList: Array<{
    ext: (typeof safeExtractions)[0];
    tamper: NonNullable<RawExtractionResult["possible_tampering_detections"]>[0];
  }> = [];

  safeExtractions.forEach((ext) => {
    (ext.extraction.possible_tampering_detections || []).forEach((t) => {
      if (t && t.has_possible_oversticker) {
        allTamperingList.push({ ext, tamper: t });
      }
    });
  });

  const isFieldTamperedAcrossImages = (fieldNameKeywords: string[]): boolean => {
    return allTamperingList.some(({ tamper }) => {
      const target = (tamper.affected_field || "").toLowerCase();
      return fieldNameKeywords.some((kw) => target.includes(kw.toLowerCase()));
    });
  };

  // Helper to collect candidates and check conflicts for any declaration field
  const analyzeFieldAcrossSides = (
    fieldKey: string,
    fieldName: string,
    category: any,
    legalReference: string,
    fieldType: "mrp" | "net_quantity" | "date" | "usp" | "batch" | "fssai" | "origin" | "text",
    extractor: (raw: RawExtractionResult) => {
      value: string | null;
      evidence?: string | null;
      confidence?: number | null;
      raw?: any;
    }
  ) => {
    const candidates: SideCandidate[] = [];

    safeExtractions.forEach((ext) => {
      const extracted = extractor(ext.extraction);
      if (extracted.value && extracted.value.trim().length > 0) {
        candidates.push({
          imageId: ext.imageId,
          side: ext.side,
          fileName: ext.fileName,
          imageUrl: ext.imageUrl,
          value: extracted.value.trim(),
          evidence: extracted.evidence || null,
          confidence: cleanConfidence(extracted.confidence),
          raw: extracted.raw,
        });
      }
    });

    // Check for conflicts among candidates
    let conflictPair: [SideCandidate, SideCandidate] | null = null;
    if (candidates.length >= 2) {
      for (let i = 0; i < candidates.length; i++) {
        for (let j = i + 1; j < candidates.length; j++) {
          if (areDeclarationsConflicting(candidates[i], candidates[j], fieldType)) {
            conflictPair = [candidates[i], candidates[j]];
            hasDeclarationConflicts = true;
            break;
          }
        }
        if (conflictPair) break;
      }
    }

    return {
      candidates,
      conflictPair,
      hasConflict: Boolean(conflictPair),
      bestCandidate: candidates[0] || null,
    };
  };

  // -------------------------------------------------------------
  // 1. Manufacturer / Packer Details (LMPC Rule 6(1)(a))
  // -------------------------------------------------------------
  const mfgAnalysis = analyzeFieldAcrossSides(
    "manufacturer_details",
    "Manufacturer / Packer Name & Complete Address",
    "lmpc_mandatory",
    "LMPC Rules 2011 - Rule 6(1)(a)",
    "text",
    (raw) => ({
      value:
        raw.manufacturer?.full_declaration ||
        raw.manufacturer?.name ||
        raw.packer?.full_declaration ||
        raw.packer?.name ||
        raw.importer?.full_declaration ||
        raw.importer?.name ||
        null,
      evidence:
        raw.manufacturer?.evidence ||
        raw.packer?.evidence ||
        raw.importer?.evidence ||
        null,
      confidence: raw.manufacturer?.confidence || raw.packer?.confidence,
    })
  );

  const mfgTampered = isFieldTamperedAcrossImages(["manufacturer", "packer", "importer", "address"]);
  const bestMfg = mfgAnalysis.bestCandidate;
  const mfgStatus: ComplianceStatus = mfgAnalysis.hasConflict
    ? "review_required"
    : mfgTampered
    ? "review_required"
    : bestMfg
    ? "pass"
    : isSingleFrontImageOnly
    ? "review_required"
    : "non_compliant";

  fields.push({
    id: "f-mfg",
    fieldKey: "manufacturer_details",
    fieldName: "Name and Complete Address of Manufacturer / Packer / Importer",
    category: "lmpc_mandatory",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(a)",
    extractedValue: bestMfg ? bestMfg.value : "Not detected",
    confidence: bestMfg ? bestMfg.confidence : 0.85,
    isMandatory: true,
    status: mfgStatus,
    sourceImageId: bestMfg?.imageId,
    side: bestMfg?.side,
    sourceImageUrl: bestMfg?.imageUrl,
    hasConflict: mfgAnalysis.hasConflict,
    conflictingDeclarations: mfgAnalysis.hasConflict
      ? mfgAnalysis.candidates.map((c) => ({
          sourceImageId: c.imageId,
          side: c.side,
          value: c.value,
          confidence: c.confidence,
          imageUrl: c.imageUrl,
        }))
      : undefined,
    notes: mfgAnalysis.hasConflict
      ? `POSSIBLE DECLARATION CONFLICT: Conflicting manufacturer details across sides (${mfgAnalysis.conflictPair![0].side} vs ${mfgAnalysis.conflictPair![1].side})`
      : mfgTampered
      ? "Possible label overlay or sticker boundary detected near manufacturer declaration"
      : bestMfg
      ? `Found on ${bestMfg.side}`
      : isSingleFrontImageOnly
      ? "Not detected on front display panel. Check back/side panels of physical packaging."
      : `Mandatory manufacturer details missing across all ${packageImages.length} uploaded package sides (${uploadedSidesText}).`,
  });

  findings.push({
    id: "find-mfg",
    ruleCode: "LMPC-R6-1A",
    ruleTitle: "Manufacturer / Packer / Importer Name & Complete Address",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(a)",
    category: "lmpc_mandatory",
    status: mfgStatus,
    severity: mfgStatus === "pass" ? "low" : mfgStatus === "review_required" ? "medium" : "high",
    whatWasObserved: mfgAnalysis.hasConflict
      ? `Conflicting manufacturer information detected: ${mfgAnalysis.conflictPair![0].side} indicates "${mfgAnalysis.conflictPair![0].value}" while ${mfgAnalysis.conflictPair![1].side} indicates "${mfgAnalysis.conflictPair![1].value}".`
      : bestMfg
      ? `Manufacturer / Packer details declared on [${bestMfg.side}]: "${bestMfg.value}"`
      : isSingleFrontImageOnly
      ? "Manufacturer details not visible on front display panel (commonly situated on back or information panel)."
      : `Manufacturer, packer, or importer name and address was NOT detected across any of the uploaded package sides (${uploadedSidesText}).`,
    whyFlagged: mfgAnalysis.hasConflict
      ? "LMPC Rule 6 requires truthful, non-deceptive packaging declarations. Differing manufacturer particulars across panels violate statutory consistency."
      : bestMfg
      ? `Statutory declaration is visibly present on ${bestMfg.side}.`
      : isSingleFrontImageOnly
      ? "LMPC Rule 6(1)(a) requires complete postal address. Verify multi-panel packaging if only the front face was photographed."
      : "LMPC Rule 6(1)(a) strictly mandates every packaged commodity to carry the complete name and address of the manufacturer, packer, or importer.",
    extractedEvidence: mfgAnalysis.hasConflict
      ? `${mfgAnalysis.conflictPair![0].side}: "${mfgAnalysis.conflictPair![0].value}" vs ${mfgAnalysis.conflictPair![1].side}: "${mfgAnalysis.conflictPair![1].value}"`
      : bestMfg?.evidence || bestMfg?.value || "No text segment detected across package images",
    recommendedAction: mfgAnalysis.hasConflict
      ? `Inspect physical package on both ${mfgAnalysis.conflictPair![0].side} and ${mfgAnalysis.conflictPair![1].side} to verify legitimate manufacturing facility and legal entity.`
      : bestMfg
      ? `Verified on ${bestMfg.side}. No corrective action required.`
      : isSingleFrontImageOnly
      ? "Inspect physical container back/side panels or upload additional package sides to confirm complete postal address."
      : "Verify physical container or issue statutory notice for missing manufacturer details under LMPC Rule 6(1)(a).",
    analyzedField: "Manufacturer / Packer Details",
    detectedValue: bestMfg ? bestMfg.value : "Not detected",
    confidence: bestMfg ? bestMfg.confidence : 0.85,
    deterministicRule: "Package must clearly declare the complete legal name and postal address of the manufacturer, packer, or importer.",
    reasoning: bestMfg
      ? `Visible manufacturer address on ${bestMfg.side} satisfies Rule 6(1)(a) statutory requirement.`
      : "Absence of manufacturer declaration requires verification under LMPC Rule 6(1)(a).",
    ruleId: "RULE-LMPC-6-1-A",
    ruleName: "Mandatory Manufacturer Declaration",
    ruleSource: "Ministry of Consumer Affairs, Legal Metrology Division",
    ruleReference: "Rule 6(1)(a), Packaged Commodities Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: Boolean(bestMfg),
    sourceImageId: bestMfg?.imageId,
    side: bestMfg?.side,
    sourceImageUrl: bestMfg?.imageUrl,
    hasConflict: mfgAnalysis.hasConflict,
    conflictingDeclarations: mfgAnalysis.hasConflict
      ? mfgAnalysis.candidates.map((c) => ({
          sourceImageId: c.imageId,
          side: c.side,
          value: c.value,
          imageUrl: c.imageUrl,
        }))
      : undefined,
  });

  // -------------------------------------------------------------
  // 2. Generic Name / Commodity Identity (LMPC Rule 6(1)(b))
  // -------------------------------------------------------------
  const nameAnalysis = analyzeFieldAcrossSides(
    "commodity_identity",
    "Common / Generic Name of Packaged Commodity",
    "lmpc_mandatory",
    "LMPC Rules 2011 - Rule 6(1)(b)",
    "text",
    (raw) => ({
      value: raw.generic_name?.value || raw.product_name?.value || null,
      evidence: raw.generic_name?.evidence || raw.product_name?.evidence || null,
      confidence: raw.generic_name?.confidence || raw.product_name?.confidence,
    })
  );

  const bestName =
    nameAnalysis.candidates.find((c) => c.side.toLowerCase() === "front") ||
    nameAnalysis.bestCandidate;
  const nameTampered = isFieldTamperedAcrossImages(["generic", "product name", "identity"]);
  const nameStatus: ComplianceStatus = nameTampered
    ? "review_required"
    : bestName
    ? "pass"
    : "non_compliant";

  fields.push({
    id: "f-name",
    fieldKey: "commodity_identity",
    fieldName: "Common / Generic Name of Packaged Commodity",
    category: "lmpc_mandatory",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(b)",
    extractedValue: bestName ? bestName.value : "Not detected",
    confidence: bestName ? bestName.confidence : 0.85,
    isMandatory: true,
    status: nameStatus,
    sourceImageId: bestName?.imageId,
    side: bestName?.side,
    sourceImageUrl: bestName?.imageUrl,
    notes: bestName ? `Identified on ${bestName.side}` : "Generic commodity name not detected",
  });

  findings.push({
    id: "find-name",
    ruleCode: "LMPC-R6-1B",
    ruleTitle: "Generic or Common Name of Commodity",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(b)",
    category: "lmpc_mandatory",
    status: nameStatus,
    severity: nameStatus === "pass" ? "low" : "high",
    whatWasObserved: bestName
      ? `Commodity name identified on [${bestName.side}]: "${bestName.value}"`
      : `Generic or common name was NOT detected across any package sides (${uploadedSidesText}).`,
    whyFlagged: bestName
      ? `Generic commodity identity is visibly declared on ${bestName.side}.`
      : "LMPC Rule 6(1)(b) requires every package to indicate the common or generic name of the commodity contained within.",
    extractedEvidence: bestName?.evidence || bestName?.value || "No text segment detected",
    recommendedAction: bestName
      ? "No corrective action required."
      : "Verify if generic commodity name appears elsewhere on the packaging.",
    analyzedField: "Generic Commodity Name",
    detectedValue: bestName ? bestName.value : "Not detected",
    confidence: bestName ? bestName.confidence : 0.85,
    deterministicRule: "The common or generic name of the commodity contained in the package must be prominently declared.",
    reasoning: bestName
      ? "Valid commodity identification meets Rule 6(1)(b) requirement."
      : "Missing commodity identity fails Rule 6(1)(b).",
    ruleId: "RULE-LMPC-6-1-B",
    ruleName: "Generic Name of Commodity",
    ruleSource: "Ministry of Consumer Affairs",
    ruleReference: "Rule 6(1)(b), Legal Metrology Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: Boolean(bestName),
    sourceImageId: bestName?.imageId,
    side: bestName?.side,
    sourceImageUrl: bestName?.imageUrl,
  });

  // -------------------------------------------------------------
  // 3. Net Quantity Declaration (LMPC Rule 6(1)(c) & Rule 7)
  // -------------------------------------------------------------
  const qtyAnalysis = analyzeFieldAcrossSides(
    "net_quantity",
    "Net Quantity Declaration",
    "weights_measures",
    "LMPC Rules 2011 - Rule 6(1)(c) & Rule 7",
    "net_quantity",
    (raw) => ({
      value: raw.net_quantity?.value || null,
      evidence: raw.net_quantity?.evidence || null,
      confidence: raw.net_quantity?.confidence,
    })
  );

  const bestQty = qtyAnalysis.bestCandidate;
  const qtyTampered = isFieldTamperedAcrossImages(["net quantity", "net wt", "weight", "volume", "quantity"]);
  let qtyStatus: ComplianceStatus = "non_compliant";

  if (qtyAnalysis.hasConflict) {
    qtyStatus = "review_required";
  } else if (qtyTampered) {
    qtyStatus = "review_required";
  } else if (bestQty) {
    const hasMetricUnit = /(?:g|kg|gm|gms|grams|ml|l|ltr|litre|litres|mg|meter|metres|m|cm|mm|units|unit|N|numbers|pcs|count)\b/i.test(
      bestQty.value
    );
    qtyStatus = hasMetricUnit ? "pass" : "review_required";
  } else if (isSingleFrontImageOnly) {
    qtyStatus = "review_required";
  }

  fields.push({
    id: "f-qty",
    fieldKey: "net_quantity",
    fieldName: "Net Quantity Declaration (Metric Standard Units)",
    category: "weights_measures",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(c) & Rule 7",
    extractedValue: bestQty ? bestQty.value : "Not detected",
    confidence: bestQty ? bestQty.confidence : 0.85,
    isMandatory: true,
    status: qtyStatus,
    sourceImageId: bestQty?.imageId,
    side: bestQty?.side,
    sourceImageUrl: bestQty?.imageUrl,
    hasConflict: qtyAnalysis.hasConflict,
    conflictingDeclarations: qtyAnalysis.hasConflict
      ? qtyAnalysis.candidates.map((c) => ({
          sourceImageId: c.imageId,
          side: c.side,
          value: c.value,
          confidence: c.confidence,
          imageUrl: c.imageUrl,
        }))
      : undefined,
    notes: qtyAnalysis.hasConflict
      ? `POSSIBLE DECLARATION CONFLICT: Discrepant net quantity declared across sides (${qtyAnalysis.conflictPair![0].side}: "${qtyAnalysis.conflictPair![0].value}" vs ${qtyAnalysis.conflictPair![1].side}: "${qtyAnalysis.conflictPair![1].value}")`
      : qtyTampered
      ? "Possible label overlay or sticker patch near net quantity declaration"
      : bestQty
      ? `Declared on ${bestQty.side}`
      : isSingleFrontImageOnly
      ? "Net quantity not detected on visible front panel. Check lower display area or side panel."
      : `Net quantity declaration missing across all uploaded package images (${uploadedSidesText}).`,
  });

  findings.push({
    id: "find-qty",
    ruleCode: qtyAnalysis.hasConflict ? "CONFLICT-NETQTY" : "LMPC-R6-1C",
    ruleTitle: qtyAnalysis.hasConflict
      ? "Possible Declaration Conflict: Net Quantity Across Package Sides"
      : "Net Quantity in Standard Units of Weight/Measure",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(c) & Rule 7",
    category: "weights_measures",
    status: qtyStatus,
    severity: qtyStatus === "pass" ? "low" : "high",
    whatWasObserved: qtyAnalysis.hasConflict
      ? `Conflicting net quantity declarations detected: ${qtyAnalysis.conflictPair![0].side} shows "${qtyAnalysis.conflictPair![0].value}" while ${qtyAnalysis.conflictPair![1].side} shows "${qtyAnalysis.conflictPair![1].value}".`
      : bestQty
      ? `Net quantity declared on [${bestQty.side}]: "${bestQty.value}"`
      : `Net quantity declaration was NOT detected across any uploaded sides (${uploadedSidesText}).`,
    whyFlagged: qtyAnalysis.hasConflict
      ? "LMPC Rule 6 mandates uniform and truthful quantity declarations. Different package panels declaring differing net quantities is deceptive to consumers."
      : qtyStatus === "pass"
      ? `Net quantity declared in standard metric units on ${bestQty?.side}.`
      : qtyStatus === "review_required"
      ? "Net quantity requires verification under standard units of measurement."
      : "LMPC Rule 6(1)(c) mandates explicit declaration of net quantity in standard metric units on the Principal Display Panel.",
    extractedEvidence: qtyAnalysis.hasConflict
      ? `${qtyAnalysis.conflictPair![0].side}: "${qtyAnalysis.conflictPair![0].value}" vs ${qtyAnalysis.conflictPair![1].side}: "${qtyAnalysis.conflictPair![1].value}"`
      : bestQty?.evidence || bestQty?.value || "No net quantity declaration detected",
    recommendedAction: qtyAnalysis.hasConflict
      ? `Inspect physical package on both ${qtyAnalysis.conflictPair![0].side} and ${qtyAnalysis.conflictPair![1].side}. Conduct gravimetric or volumetric check of commodity.`
      : qtyStatus === "pass"
      ? "Confirm font numeral height adheres to area table in Rule 7(1) during physical inspection."
      : "Check physical label for net quantity in accordance with standard weight and measures specifications.",
    analyzedField: "Net Quantity",
    detectedValue: bestQty ? bestQty.value : "Not detected",
    confidence: bestQty ? bestQty.confidence : 0.85,
    deterministicRule: "Net quantity must be declared in standard SI metric units (kg, g, mg, L, mL, m, etc.) on the Principal Display Panel.",
    reasoning: qtyAnalysis.hasConflict
      ? "Inconsistent quantity declarations across package panels trigger statutory review under Rule 6."
      : qtyStatus === "pass"
      ? "Detected net quantity adheres to standard unit specifications."
      : "Non-compliant or ambiguous net quantity requires verification under Rule 6(1)(c).",
    ruleId: "RULE-LMPC-6-1-C",
    ruleName: "Net Quantity Declaration",
    ruleSource: "Legal Metrology Packaged Commodities Rules 2011",
    ruleReference: "Rule 6(1)(c) and Rule 7, LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: Boolean(bestQty),
    sourceImageId: bestQty?.imageId,
    side: qtyAnalysis.hasConflict ? "Multiple Sides" : bestQty?.side,
    sourceImageUrl: bestQty?.imageUrl,
    hasConflict: qtyAnalysis.hasConflict,
    conflictingDeclarations: qtyAnalysis.hasConflict
      ? qtyAnalysis.candidates.map((c) => ({
          sourceImageId: c.imageId,
          side: c.side,
          value: c.value,
          imageUrl: c.imageUrl,
        }))
      : undefined,
  });

  // -------------------------------------------------------------
  // 4. Maximum Retail Price (MRP) (LMPC Rule 6(1)(e))
  // -------------------------------------------------------------
  const mrpAnalysis = analyzeFieldAcrossSides(
    "mrp_declaration",
    "Maximum Retail Price (MRP)",
    "lmpc_mandatory",
    "LMPC Rules 2011 - Rule 6(1)(e)",
    "mrp",
    (raw) => ({
      value: raw.mrp?.value || null,
      evidence: raw.mrp?.evidence || null,
      confidence: raw.mrp?.confidence,
      raw: raw.mrp,
    })
  );

  const bestMrp = mrpAnalysis.bestCandidate;
  const mrpTampered = isFieldTamperedAcrossImages(["mrp", "price", "retail price"]);
  let mrpStatus: ComplianceStatus = "non_compliant";

  if (mrpAnalysis.hasConflict) {
    mrpStatus = "review_required";
  } else if (mrpTampered) {
    mrpStatus = "review_required";
  } else if (bestMrp) {
    const hasTaxMention =
      bestMrp.raw?.includes_taxes === true ||
      /(?:incl|inclusive|incl\.|including|taxes|all taxes)/i.test(bestMrp.value) ||
      (bestMrp.evidence && /(?:incl|inclusive|all taxes)/i.test(bestMrp.evidence));
    mrpStatus = hasTaxMention ? "pass" : "review_required";
  } else if (isSingleFrontImageOnly) {
    mrpStatus = "review_required";
  }

  fields.push({
    id: "f-mrp",
    fieldKey: "mrp_declaration",
    fieldName: "Maximum Retail Price (MRP Incl. of all taxes)",
    category: "lmpc_mandatory",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(e)",
    extractedValue: bestMrp ? bestMrp.value : "Not detected",
    confidence: bestMrp ? bestMrp.confidence : 0.85,
    isMandatory: true,
    status: mrpStatus,
    sourceImageId: bestMrp?.imageId,
    side: bestMrp?.side,
    sourceImageUrl: bestMrp?.imageUrl,
    hasConflict: mrpAnalysis.hasConflict,
    conflictingDeclarations: mrpAnalysis.hasConflict
      ? mrpAnalysis.candidates.map((c) => ({
          sourceImageId: c.imageId,
          side: c.side,
          value: c.value,
          confidence: c.confidence,
          imageUrl: c.imageUrl,
        }))
      : undefined,
    notes: mrpAnalysis.hasConflict
      ? `POSSIBLE DECLARATION CONFLICT: Discrepant MRP declared across package sides (${mrpAnalysis.conflictPair![0].side}: "${mrpAnalysis.conflictPair![0].value}" vs ${mrpAnalysis.conflictPair![1].side}: "${mrpAnalysis.conflictPair![1].value}")`
      : mrpTampered
      ? "Possible label alteration or over-sticker detected near MRP panel"
      : bestMrp
      ? `Declared on ${bestMrp.side}`
      : isSingleFrontImageOnly
      ? "MRP not detected on front face. Often situated near barcode on back panel."
      : `Maximum Retail Price declaration missing across all uploaded sides (${uploadedSidesText}).`,
  });

  findings.push({
    id: "find-mrp",
    ruleCode: mrpAnalysis.hasConflict ? "CONFLICT-MRP" : "LMPC-R6-1E",
    ruleTitle: mrpAnalysis.hasConflict
      ? "Possible Declaration Conflict: MRP Across Package Sides"
      : "Maximum Retail Price (MRP Inclusive of All Taxes)",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(e)",
    category: "lmpc_mandatory",
    status: mrpStatus,
    severity: mrpStatus === "pass" ? "low" : "high",
    whatWasObserved: mrpAnalysis.hasConflict
      ? `Price conflict detected: ${mrpAnalysis.conflictPair![0].side} declares "${mrpAnalysis.conflictPair![0].value}" while ${mrpAnalysis.conflictPair![1].side} declares "${mrpAnalysis.conflictPair![1].value}".`
      : bestMrp
      ? `MRP declared on [${bestMrp.side}]: "${bestMrp.value}"`
      : `MRP declaration was NOT detected across any uploaded sides (${uploadedSidesText}).`,
    whyFlagged: mrpAnalysis.hasConflict
      ? "LMPC Rule 6 mandates uniform and unambiguous price declarations. Dual or conflicting MRPs across package sides constitute a serious statutory violation."
      : mrpStatus === "pass"
      ? `Valid MRP with tax declaration identified on ${bestMrp?.side}.`
      : mrpStatus === "review_required"
      ? mrpTampered
        ? "Possible over-sticker or surface alteration observed in MRP region."
        : "MRP declaration requires verification of 'Inclusive of all taxes' clause."
      : "LMPC Rule 6(1)(e) mandates every packaged commodity to declare Maximum Retail Price inclusive of all taxes.",
    extractedEvidence: mrpAnalysis.hasConflict
      ? `${mrpAnalysis.conflictPair![0].side}: "${mrpAnalysis.conflictPair![0].value}" vs ${mrpAnalysis.conflictPair![1].side}: "${mrpAnalysis.conflictPair![1].value}"`
      : bestMrp?.evidence || bestMrp?.value || "No MRP detected",
    recommendedAction: mrpAnalysis.hasConflict
      ? `Inspect physical package on both ${mrpAnalysis.conflictPair![0].side} and ${mrpAnalysis.conflictPair![1].side}. Verify if unauthorized price over-stickering has taken place.`
      : mrpStatus === "pass"
      ? "No corrective action required for MRP."
      : "Verify physical packaging for explicit 'Inclusive of all taxes' declaration.",
    analyzedField: "Maximum Retail Price (MRP)",
    detectedValue: bestMrp ? bestMrp.value : "Not detected",
    confidence: bestMrp ? bestMrp.confidence : 0.85,
    deterministicRule: "The retail sale price of the package shall clearly indicate Maximum Retail Price (MRP) inclusive of all taxes.",
    reasoning: mrpAnalysis.hasConflict
      ? "Conflicting prices across packaging panels fail Rule 6 price uniformity mandate."
      : mrpStatus === "pass"
      ? "MRP declaration meets statutory format requirements."
      : "Missing or non-standard price declaration requires review.",
    ruleId: "RULE-LMPC-6-1-E",
    ruleName: "MRP Declaration Mandate",
    ruleSource: "Legal Metrology Packaged Commodities Rules 2011",
    ruleReference: "Rule 6(1)(e), LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: Boolean(bestMrp),
    sourceImageId: bestMrp?.imageId,
    side: mrpAnalysis.hasConflict ? "Multiple Sides" : bestMrp?.side,
    sourceImageUrl: bestMrp?.imageUrl,
    hasConflict: mrpAnalysis.hasConflict,
    conflictingDeclarations: mrpAnalysis.hasConflict
      ? mrpAnalysis.candidates.map((c) => ({
          sourceImageId: c.imageId,
          side: c.side,
          value: c.value,
          imageUrl: c.imageUrl,
        }))
      : undefined,
  });

  // -------------------------------------------------------------
  // 5. Unit Sale Price (USP) (LMPC Rule 6(1)(d))
  // -------------------------------------------------------------
  const uspAnalysis = analyzeFieldAcrossSides(
    "unit_sale_price",
    "Unit Sale Price (USP)",
    "weights_measures",
    "LMPC Rules 2011 - Rule 6(1)(d)",
    "usp",
    (raw) => ({
      value: raw.unit_sale_price?.value || null,
      evidence: raw.unit_sale_price?.evidence || null,
      confidence: raw.unit_sale_price?.confidence,
    })
  );

  const bestUsp = uspAnalysis.bestCandidate;
  const uspStatus: ComplianceStatus = bestUsp ? "pass" : "review_required";

  fields.push({
    id: "f-usp",
    fieldKey: "unit_sale_price",
    fieldName: "Unit Sale Price (₹ per g / ml / kg / litre / piece)",
    category: "weights_measures",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(d)",
    extractedValue: bestUsp ? bestUsp.value : "Not detected",
    confidence: bestUsp ? bestUsp.confidence : 0.8,
    isMandatory: false,
    status: uspStatus,
    sourceImageId: bestUsp?.imageId,
    side: bestUsp?.side,
    sourceImageUrl: bestUsp?.imageUrl,
    notes: bestUsp
      ? `Declared on ${bestUsp.side}`
      : "Unit sale price not explicitly detected on packaging images. Verify exemption applicability.",
  });

  findings.push({
    id: "find-usp",
    ruleCode: "LMPC-R6-1D-USP",
    ruleTitle: "Unit Sale Price Declaration",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(d)",
    category: "weights_measures",
    status: uspStatus,
    severity: uspStatus === "pass" ? "low" : "medium",
    whatWasObserved: bestUsp
      ? `Unit Sale Price declared on [${bestUsp.side}]: "${bestUsp.value}"`
      : `Unit Sale Price was NOT detected on any of the package sides (${uploadedSidesText}).`,
    whyFlagged: bestUsp
      ? `Unit Sale Price is visibly declared on ${bestUsp.side}.`
      : "Mandated for commodities where net quantity exceeds 1kg/1L or packages containing multiple units, unless exempt.",
    extractedEvidence: bestUsp?.evidence || bestUsp?.value || "Unit Sale Price not declared",
    recommendedAction: bestUsp
      ? "No corrective action required."
      : "Check package net quantity. If commodity weight exceeds threshold, ensure Unit Sale Price is declared.",
    analyzedField: "Unit Sale Price",
    detectedValue: bestUsp ? bestUsp.value : "Not detected",
    confidence: bestUsp ? bestUsp.confidence : 0.8,
    deterministicRule: "Unit Sale Price must be declared in rupees per gram, kilogram, milliliter, liter, or number.",
    reasoning: bestUsp
      ? "USP meets statutory unit pricing requirements."
      : "Review package weight to determine if USP mandate applies.",
    ruleId: "RULE-LMPC-6-1-D-USP",
    ruleName: "Unit Sale Price Requirement",
    ruleSource: "Legal Metrology Amendment Rules 2021",
    ruleReference: "Rule 6(1)(d), LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: Boolean(bestUsp),
    sourceImageId: bestUsp?.imageId,
    side: bestUsp?.side,
    sourceImageUrl: bestUsp?.imageUrl,
  });

  // -------------------------------------------------------------
  // 6. Month & Year of Manufacture / Packaging (LMPC Rule 6(1)(e))
  // -------------------------------------------------------------
  const dateAnalysis = analyzeFieldAcrossSides(
    "packaging_date",
    "Month and Year of Manufacture / Packaging",
    "lmpc_mandatory",
    "LMPC Rules 2011 - Rule 6(1)(e)",
    "date",
    (raw) => ({
      value:
        raw.date_information?.packaging_date ||
        raw.date_information?.manufacturing_date ||
        raw.date_information?.value ||
        null,
      evidence: raw.date_information?.evidence || null,
      confidence: raw.date_information?.confidence,
    })
  );

  const bestDate = dateAnalysis.bestCandidate;
  const dateTampered = isFieldTamperedAcrossImages(["date", "packaging date", "expiry", "mfg date"]);
  let dateStatus: ComplianceStatus = "non_compliant";

  if (dateAnalysis.hasConflict) {
    dateStatus = "review_required";
  } else if (dateTampered) {
    dateStatus = "review_required";
  } else if (bestDate) {
    dateStatus = "pass";
  } else if (isSingleFrontImageOnly) {
    dateStatus = "review_required";
  }

  fields.push({
    id: "f-date",
    fieldKey: "packaging_date",
    fieldName: "Month and Year of Manufacture / Packaging / Import",
    category: "lmpc_mandatory",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(e)",
    extractedValue: bestDate ? bestDate.value : "Not detected",
    confidence: bestDate ? bestDate.confidence : 0.85,
    isMandatory: true,
    status: dateStatus,
    sourceImageId: bestDate?.imageId,
    side: bestDate?.side,
    sourceImageUrl: bestDate?.imageUrl,
    hasConflict: dateAnalysis.hasConflict,
    conflictingDeclarations: dateAnalysis.hasConflict
      ? dateAnalysis.candidates.map((c) => ({
          sourceImageId: c.imageId,
          side: c.side,
          value: c.value,
          confidence: c.confidence,
          imageUrl: c.imageUrl,
        }))
      : undefined,
    notes: dateAnalysis.hasConflict
      ? `POSSIBLE DECLARATION CONFLICT: Conflicting manufacturing/packaging dates across sides (${dateAnalysis.conflictPair![0].side} vs ${dateAnalysis.conflictPair![1].side})`
      : dateTampered
      ? "Possible label alteration or over-sticker detected near date stamping region"
      : bestDate
      ? `Declared on ${bestDate.side}`
      : isSingleFrontImageOnly
      ? "Manufacturing date not observed on front panel. Check stamped bottom or side crimp."
      : `Packaging date missing across all uploaded package sides (${uploadedSidesText}).`,
  });

  findings.push({
    id: "find-date",
    ruleCode: dateAnalysis.hasConflict ? "CONFLICT-DATE" : "LMPC-R6-1E-DATE",
    ruleTitle: dateAnalysis.hasConflict
      ? "Possible Declaration Conflict: Packaging Date Across Package Sides"
      : "Month and Year of Packaging or Manufacture",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(e)",
    category: "lmpc_mandatory",
    status: dateStatus,
    severity: dateStatus === "pass" ? "low" : "high",
    whatWasObserved: dateAnalysis.hasConflict
      ? `Date conflict detected: ${dateAnalysis.conflictPair![0].side} states "${dateAnalysis.conflictPair![0].value}" while ${dateAnalysis.conflictPair![1].side} states "${dateAnalysis.conflictPair![1].value}".`
      : bestDate
      ? `Packaging date declared on [${bestDate.side}]: "${bestDate.value}"`
      : `Date of manufacture/packaging was NOT detected across package sides (${uploadedSidesText}).`,
    whyFlagged: dateAnalysis.hasConflict
      ? "Differing manufacturing or packaging dates across panels creates severe ambiguity regarding product freshness and statutory shelf-life."
      : dateStatus === "pass"
      ? `Manufacturing date visibly declared on ${bestDate?.side}.`
      : "LMPC Rule 6(1)(e) requires every package to declare month and year of packaging or manufacture.",
    extractedEvidence: dateAnalysis.hasConflict
      ? `${dateAnalysis.conflictPair![0].side}: "${dateAnalysis.conflictPair![0].value}" vs ${dateAnalysis.conflictPair![1].side}: "${dateAnalysis.conflictPair![1].value}"`
      : bestDate?.evidence || bestDate?.value || "Date not detected",
    recommendedAction: dateAnalysis.hasConflict
      ? `Inspect physical package on both ${dateAnalysis.conflictPair![0].side} and ${dateAnalysis.conflictPair![1].side} to verify true production batch date.`
      : dateStatus === "pass"
      ? "No corrective action required."
      : "Inspect physical container seal or crimp area for stamped date.",
    analyzedField: "Date of Packaging / Manufacture",
    detectedValue: bestDate ? bestDate.value : "Not detected",
    confidence: bestDate ? bestDate.confidence : 0.85,
    deterministicRule: "Every package shall bear the month and year in which the commodity is manufactured or pre-packed.",
    reasoning: bestDate ? "Packaging date is clearly indicated." : "Missing packaging date fails Rule 6(1)(e).",
    ruleId: "RULE-LMPC-6-1-E-DATE",
    ruleName: "Packaging Date Mandate",
    ruleSource: "Legal Metrology Rules 2011",
    ruleReference: "Rule 6(1)(e), LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: Boolean(bestDate),
    sourceImageId: bestDate?.imageId,
    side: dateAnalysis.hasConflict ? "Multiple Sides" : bestDate?.side,
    sourceImageUrl: bestDate?.imageUrl,
    hasConflict: dateAnalysis.hasConflict,
    conflictingDeclarations: dateAnalysis.hasConflict
      ? dateAnalysis.candidates.map((c) => ({
          sourceImageId: c.imageId,
          side: c.side,
          value: c.value,
          imageUrl: c.imageUrl,
        }))
      : undefined,
  });

  // -------------------------------------------------------------
  // 7. Consumer Care Details (LMPC Rule 6(1)(f))
  // -------------------------------------------------------------
  const careAnalysis = analyzeFieldAcrossSides(
    "consumer_care",
    "Consumer Care & Grievance Helpline",
    "consumer_protection",
    "LMPC Rules 2011 - Rule 6(1)(f)",
    "text",
    (raw) => ({
      value:
        raw.consumer_care?.value ||
        [raw.consumer_care?.phone, raw.consumer_care?.email, raw.consumer_care?.address]
          .filter(Boolean)
          .join(" • ") ||
        null,
      evidence: raw.consumer_care?.evidence || null,
      confidence: raw.consumer_care?.confidence,
    })
  );

  const bestCare = careAnalysis.bestCandidate;
  const careStatus: ComplianceStatus = bestCare
    ? "pass"
    : isSingleFrontImageOnly
    ? "review_required"
    : "non_compliant";

  fields.push({
    id: "f-care",
    fieldKey: "consumer_care",
    fieldName: "Consumer Care & Grievance Redressal (Phone, Email, Postal Address)",
    category: "consumer_protection",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(f)",
    extractedValue: bestCare ? bestCare.value : "Not detected",
    confidence: bestCare ? bestCare.confidence : 0.85,
    isMandatory: true,
    status: careStatus,
    sourceImageId: bestCare?.imageId,
    side: bestCare?.side,
    sourceImageUrl: bestCare?.imageUrl,
    notes: bestCare
      ? `Declared on ${bestCare.side}`
      : isSingleFrontImageOnly
      ? "Consumer helpline commonly placed on back/side informational panel."
      : `Consumer care details missing across all uploaded sides (${uploadedSidesText}).`,
  });

  findings.push({
    id: "find-care",
    ruleCode: "LMPC-R6-1F",
    ruleTitle: "Consumer Care & Grievance Contact Particulars",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(f)",
    category: "consumer_protection",
    status: careStatus,
    severity: careStatus === "pass" ? "low" : "high",
    whatWasObserved: bestCare
      ? `Consumer care particulars declared on [${bestCare.side}]: "${bestCare.value}"`
      : `Consumer care contact was NOT detected across package sides (${uploadedSidesText}).`,
    whyFlagged: bestCare
      ? `Consumer grievance contact is visibly declared on ${bestCare.side}.`
      : "LMPC Rule 6(1)(f) mandates name, address, telephone number, and email address of person/office for consumer complaints.",
    extractedEvidence: bestCare?.evidence || bestCare?.value || "Consumer helpline not declared",
    recommendedAction: bestCare
      ? "No corrective action required."
      : "Inspect physical container for mandatory consumer care helpline phone or email.",
    analyzedField: "Consumer Care Details",
    detectedValue: bestCare ? bestCare.value : "Not detected",
    confidence: bestCare ? bestCare.confidence : 0.85,
    deterministicRule: "Every package shall mention the name, address, telephone number, and e-mail of the consumer care contact.",
    reasoning: bestCare ? "Consumer helpline particulars comply with Rule 6(1)(f)." : "Missing helpline details fail Rule 6(1)(f).",
    ruleId: "RULE-LMPC-6-1-F",
    ruleName: "Consumer Care Contact Mandate",
    ruleSource: "Ministry of Consumer Affairs",
    ruleReference: "Rule 6(1)(f), LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: Boolean(bestCare),
    sourceImageId: bestCare?.imageId,
    side: bestCare?.side,
    sourceImageUrl: bestCare?.imageUrl,
  });

  // -------------------------------------------------------------
  // 8. Country of Origin (LMPC Rule 6(1)(h))
  // -------------------------------------------------------------
  const originAnalysis = analyzeFieldAcrossSides(
    "country_of_origin",
    "Country of Origin",
    "origin_import",
    "LMPC Rules 2011 - Rule 6(1)(h)",
    "origin",
    (raw) => ({
      value: raw.country_of_origin?.value || null,
      evidence: raw.country_of_origin?.evidence || null,
      confidence: raw.country_of_origin?.confidence,
    })
  );

  const bestOrigin = originAnalysis.bestCandidate;
  const originStatus: ComplianceStatus = originAnalysis.hasConflict
    ? "review_required"
    : bestOrigin
    ? "pass"
    : isSingleFrontImageOnly
    ? "review_required"
    : "non_compliant";

  fields.push({
    id: "f-origin",
    fieldKey: "country_of_origin",
    fieldName: "Country of Origin Declaration",
    category: "origin_import",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(h)",
    extractedValue: bestOrigin ? bestOrigin.value : "Not detected",
    confidence: bestOrigin ? bestOrigin.confidence : 0.85,
    isMandatory: true,
    status: originStatus,
    sourceImageId: bestOrigin?.imageId,
    side: bestOrigin?.side,
    sourceImageUrl: bestOrigin?.imageUrl,
    hasConflict: originAnalysis.hasConflict,
    conflictingDeclarations: originAnalysis.hasConflict
      ? originAnalysis.candidates.map((c) => ({
          sourceImageId: c.imageId,
          side: c.side,
          value: c.value,
          confidence: c.confidence,
          imageUrl: c.imageUrl,
        }))
      : undefined,
    notes: originAnalysis.hasConflict
      ? `POSSIBLE DECLARATION CONFLICT: Inconsistent Country of Origin across sides (${originAnalysis.conflictPair![0].side} vs ${originAnalysis.conflictPair![1].side})`
      : bestOrigin
      ? `Declared on ${bestOrigin.side}`
      : `Country of Origin missing across all uploaded package sides (${uploadedSidesText}).`,
  });

  findings.push({
    id: "find-origin",
    ruleCode: originAnalysis.hasConflict ? "CONFLICT-ORIGIN" : "LMPC-R6-1H",
    ruleTitle: originAnalysis.hasConflict
      ? "Possible Declaration Conflict: Country of Origin Across Package Sides"
      : "Country of Origin Declaration",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(h)",
    category: "origin_import",
    status: originStatus,
    severity: originStatus === "pass" ? "low" : "high",
    whatWasObserved: originAnalysis.hasConflict
      ? `Origin conflict detected: ${originAnalysis.conflictPair![0].side} states "${originAnalysis.conflictPair![0].value}" while ${originAnalysis.conflictPair![1].side} states "${originAnalysis.conflictPair![1].value}".`
      : bestOrigin
      ? `Country of Origin declared on [${bestOrigin.side}]: "${bestOrigin.value}"`
      : `Country of origin was NOT detected across package sides (${uploadedSidesText}).`,
    whyFlagged: originAnalysis.hasConflict
      ? "Contradictory country of origin declarations mislead consumers and violate statutory origin disclosure rules."
      : bestOrigin
      ? `Country of Origin is declared on ${bestOrigin.side}.`
      : "Every imported or domestic package must carry clear declaration of country of origin.",
    extractedEvidence: originAnalysis.hasConflict
      ? `${originAnalysis.conflictPair![0].side}: "${originAnalysis.conflictPair![0].value}" vs ${originAnalysis.conflictPair![1].side}: "${originAnalysis.conflictPair![1].value}"`
      : bestOrigin?.evidence || bestOrigin?.value || "Origin not declared",
    recommendedAction: originAnalysis.hasConflict
      ? "Review import manifest and physical batch records to determine authentic manufacturing origin."
      : bestOrigin
      ? "No corrective action required."
      : "Verify packaging reverse for 'Made in [Country]' declaration.",
    analyzedField: "Country of Origin",
    detectedValue: bestOrigin ? bestOrigin.value : "Not detected",
    confidence: bestOrigin ? bestOrigin.confidence : 0.85,
    deterministicRule: "The name of the country of origin or manufacture shall be mentioned on the package.",
    reasoning: bestOrigin ? "Country of Origin satisfies Rule 6(1)(h)." : "Missing origin requires verification.",
    ruleId: "RULE-LMPC-6-1-H",
    ruleName: "Country of Origin Mandate",
    ruleSource: "Legal Metrology Packaged Commodities Rules 2011",
    ruleReference: "Rule 6(1)(h), LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: Boolean(bestOrigin),
    sourceImageId: bestOrigin?.imageId,
    side: originAnalysis.hasConflict ? "Multiple Sides" : bestOrigin?.side,
    sourceImageUrl: bestOrigin?.imageUrl,
    hasConflict: originAnalysis.hasConflict,
    conflictingDeclarations: originAnalysis.hasConflict
      ? originAnalysis.candidates.map((c) => ({
          sourceImageId: c.imageId,
          side: c.side,
          value: c.value,
          imageUrl: c.imageUrl,
        }))
      : undefined,
  });

  // -------------------------------------------------------------
  // 9. Batch or Lot Number (FSSAI Reg 2.2.2.8 / Trade Practices)
  // -------------------------------------------------------------
  const batchAnalysis = analyzeFieldAcrossSides(
    "batch_or_lot_number",
    "Batch or Lot Number",
    "lmpc_mandatory",
    "FSSAI Reg 2.2.2.8 & LMPC General Provisions",
    "batch",
    (raw) => ({
      value: raw.batch_or_lot_number?.value || null,
      evidence: raw.batch_or_lot_number?.evidence || null,
      confidence: raw.batch_or_lot_number?.confidence,
    })
  );

  const bestBatch = batchAnalysis.bestCandidate;
  const batchStatus: ComplianceStatus = batchAnalysis.hasConflict
    ? "review_required"
    : bestBatch
    ? "pass"
    : isSingleFrontImageOnly
    ? "review_required"
    : "non_compliant";

  fields.push({
    id: "f-batch",
    fieldKey: "batch_or_lot_number",
    fieldName: "Batch or Lot Identification Code",
    category: "lmpc_mandatory",
    legalReference: "FSSAI Reg 2.2.2.8 / LMPC Packaging Norms",
    extractedValue: bestBatch ? bestBatch.value : "Not detected",
    confidence: bestBatch ? bestBatch.confidence : 0.85,
    isMandatory: true,
    status: batchStatus,
    sourceImageId: bestBatch?.imageId,
    side: bestBatch?.side,
    sourceImageUrl: bestBatch?.imageUrl,
    hasConflict: batchAnalysis.hasConflict,
    conflictingDeclarations: batchAnalysis.hasConflict
      ? batchAnalysis.candidates.map((c) => ({
          sourceImageId: c.imageId,
          side: c.side,
          value: c.value,
          confidence: c.confidence,
          imageUrl: c.imageUrl,
        }))
      : undefined,
    notes: batchAnalysis.hasConflict
      ? `POSSIBLE DECLARATION CONFLICT: Inconsistent batch codes across package sides (${batchAnalysis.conflictPair![0].side} vs ${batchAnalysis.conflictPair![1].side})`
      : bestBatch
      ? `Identified on ${bestBatch.side}`
      : `Batch or lot number missing across all uploaded package sides (${uploadedSidesText}).`,
  });

  findings.push({
    id: "find-batch",
    ruleCode: batchAnalysis.hasConflict ? "CONFLICT-BATCH" : "LMPC-BATCH-01",
    ruleTitle: batchAnalysis.hasConflict
      ? "Possible Declaration Conflict: Batch / Lot Number Across Package Sides"
      : "Batch or Lot Identification Number",
    legalAct: "FSS (Packaging and Labelling) Regulations & LMPC Traceability",
    category: "lmpc_mandatory",
    status: batchStatus,
    severity: batchStatus === "pass" ? "low" : "medium",
    whatWasObserved: batchAnalysis.hasConflict
      ? `Batch code conflict detected: ${batchAnalysis.conflictPair![0].side} states "${batchAnalysis.conflictPair![0].value}" while ${batchAnalysis.conflictPair![1].side} states "${batchAnalysis.conflictPair![1].value}".`
      : bestBatch
      ? `Batch number identified on [${bestBatch.side}]: "${bestBatch.value}"`
      : `Batch code was NOT detected across package sides (${uploadedSidesText}).`,
    whyFlagged: batchAnalysis.hasConflict
      ? "Different batch numbers across package panels break batch traceability and may indicate counterfeit or re-packaged goods."
      : bestBatch
      ? `Batch traceability code is declared on ${bestBatch.side}.`
      : "Mandatory for product batch traceability and consumer safety recall procedures.",
    extractedEvidence: batchAnalysis.hasConflict
      ? `${batchAnalysis.conflictPair![0].side}: "${batchAnalysis.conflictPair![0].value}" vs ${batchAnalysis.conflictPair![1].side}: "${batchAnalysis.conflictPair![1].value}"`
      : bestBatch?.evidence || bestBatch?.value || "Batch code not detected",
    recommendedAction: batchAnalysis.hasConflict
      ? "Physical batch trace audit required. Verify manufacturing logs to resolve differing batch stamps."
      : bestBatch
      ? "No corrective action required."
      : "Inspect physical container for dot-matrix or laser stamped lot number.",
    analyzedField: "Batch / Lot Number",
    detectedValue: bestBatch ? bestBatch.value : "Not detected",
    confidence: bestBatch ? bestBatch.confidence : 0.85,
    deterministicRule: "A batch number or code number or lot number shall be declared on the package.",
    reasoning: bestBatch ? "Batch identification verified." : "Missing batch number requires verification.",
    ruleId: "RULE-LMPC-BATCH",
    ruleName: "Batch Traceability Mandate",
    ruleSource: "Ministry of Consumer Affairs & FSSAI",
    ruleReference: "Regulation 2.2.2.8",
    ruleStatus: "Active",
    hasReliableRegion: Boolean(bestBatch),
    sourceImageId: bestBatch?.imageId,
    side: batchAnalysis.hasConflict ? "Multiple Sides" : bestBatch?.side,
    sourceImageUrl: bestBatch?.imageUrl,
    hasConflict: batchAnalysis.hasConflict,
    conflictingDeclarations: batchAnalysis.hasConflict
      ? batchAnalysis.candidates.map((c) => ({
          sourceImageId: c.imageId,
          side: c.side,
          value: c.value,
          imageUrl: c.imageUrl,
        }))
      : undefined,
  });

  // -------------------------------------------------------------
  // 10. FSSAI License Number (Food Commodities)
  // -------------------------------------------------------------
  const fssaiAnalysis = analyzeFieldAcrossSides(
    "fssai_license",
    "FSSAI Food Safety License Number",
    "fssai_food_safety",
    "FSS (Packaging and Labelling) Regulations, 2011",
    "fssai",
    (raw) => ({
      value: raw.fssai_license_number?.value || null,
      evidence: raw.fssai_license_number?.evidence || null,
      confidence: raw.fssai_license_number?.confidence,
    })
  );

  const bestFssai = fssaiAnalysis.bestCandidate;
  const isLikelyFood = safeExtractions.some(
    (ext) =>
      ext.extraction.category?.value?.toLowerCase().includes("food") ||
      ext.extraction.category?.value?.toLowerCase().includes("edible") ||
      ext.extraction.category?.value?.toLowerCase().includes("snack") ||
      ext.extraction.category?.value?.toLowerCase().includes("beverage") ||
      ext.extraction.fssai_license_number?.value
  );

  if (isLikelyFood || bestFssai) {
    const fssaiStatus: ComplianceStatus = fssaiAnalysis.hasConflict
      ? "review_required"
      : bestFssai
      ? "pass"
      : isSingleFrontImageOnly
      ? "review_required"
      : "non_compliant";

    fields.push({
      id: "f-fssai",
      fieldKey: "fssai_license",
      fieldName: "FSSAI 14-Digit Food Safety License Number & Logo",
      category: "fssai_food_safety",
      legalReference: "FSS (Packaging and Labelling) Regulations, 2011",
      extractedValue: bestFssai ? bestFssai.value : "Not detected",
      confidence: bestFssai ? bestFssai.confidence : 0.85,
      isMandatory: true,
      status: fssaiStatus,
      sourceImageId: bestFssai?.imageId,
      side: bestFssai?.side,
      sourceImageUrl: bestFssai?.imageUrl,
      hasConflict: fssaiAnalysis.hasConflict,
      conflictingDeclarations: fssaiAnalysis.hasConflict
        ? fssaiAnalysis.candidates.map((c) => ({
            sourceImageId: c.imageId,
            side: c.side,
            value: c.value,
            confidence: c.confidence,
            imageUrl: c.imageUrl,
          }))
        : undefined,
      notes: fssaiAnalysis.hasConflict
        ? `POSSIBLE DECLARATION CONFLICT: Differing FSSAI license numbers across package sides (${fssaiAnalysis.conflictPair![0].side} vs ${fssaiAnalysis.conflictPair![1].side})`
        : bestFssai
        ? `Declared on ${bestFssai.side}`
        : "FSSAI license number not detected on packaging images.",
    });

    findings.push({
      id: "find-fssai",
      ruleCode: fssaiAnalysis.hasConflict ? "CONFLICT-FSSAI" : "FSSAI-R2-3",
      ruleTitle: fssaiAnalysis.hasConflict
        ? "Possible Declaration Conflict: FSSAI License Number Across Package Sides"
        : "FSSAI Food Safety License Number",
      legalAct: "FSS (Packaging and Labelling) Regulations, 2011",
      category: "fssai_food_safety",
      status: fssaiStatus,
      severity: fssaiStatus === "pass" ? "low" : "high",
      whatWasObserved: fssaiAnalysis.hasConflict
        ? `FSSAI license conflict detected: ${fssaiAnalysis.conflictPair![0].side} states "${fssaiAnalysis.conflictPair![0].value}" while ${fssaiAnalysis.conflictPair![1].side} states "${fssaiAnalysis.conflictPair![1].value}".`
        : bestFssai
        ? `FSSAI License detected on [${bestFssai.side}]: "${bestFssai.value}"`
        : `FSSAI 14-digit License Number was NOT detected across package sides (${uploadedSidesText}).`,
      whyFlagged: fssaiAnalysis.hasConflict
        ? "Conflicting food safety license numbers indicate ambiguous regulatory authorization or improper multi-facility packaging."
        : bestFssai
        ? `Valid FSSAI license declared on ${bestFssai.side}.`
        : "Food safety regulations require the 14-digit FSSAI license number and logo on all packaged food products.",
      extractedEvidence: fssaiAnalysis.hasConflict
        ? `${fssaiAnalysis.conflictPair![0].side}: "${fssaiAnalysis.conflictPair![0].value}" vs ${fssaiAnalysis.conflictPair![1].side}: "${fssaiAnalysis.conflictPair![1].value}"`
        : bestFssai?.evidence || bestFssai?.value || "FSSAI license not detected",
      recommendedAction: fssaiAnalysis.hasConflict
        ? "Verify FSSAI license portal (FoSCoS) against manufacturing premises."
        : bestFssai
        ? "No corrective action required."
        : "Verify FSSAI license on secondary or back panel of packaging.",
      analyzedField: "FSSAI License Number",
      detectedValue: bestFssai ? bestFssai.value : "Not detected",
      confidence: bestFssai ? bestFssai.confidence : 0.85,
      deterministicRule: "Food items must declare the 14-digit FSSAI license number and logo.",
      reasoning: bestFssai ? "FSSAI license satisfies food packaging regulation." : "Missing FSSAI license requires verification.",
      ruleId: "RULE-FSSAI-2-3",
      ruleName: "FSSAI License Mandate",
      ruleSource: "Food Safety and Standards Authority of India",
      ruleReference: "FSS Regulations 2011",
      ruleStatus: "Active",
      hasReliableRegion: Boolean(bestFssai),
      sourceImageId: bestFssai?.imageId,
      side: fssaiAnalysis.hasConflict ? "Multiple Sides" : bestFssai?.side,
      sourceImageUrl: bestFssai?.imageUrl,
      hasConflict: fssaiAnalysis.hasConflict,
      conflictingDeclarations: fssaiAnalysis.hasConflict
        ? fssaiAnalysis.candidates.map((c) => ({
            sourceImageId: c.imageId,
            side: c.side,
            value: c.value,
            imageUrl: c.imageUrl,
          }))
        : undefined,
    });
  }

  // -------------------------------------------------------------
  // 11. Multi-Image Tampering & Over-Sticker Evaluation
  // -------------------------------------------------------------
  const tamperingDetections: TamperingDetectionResult[] = [];

  allTamperingList.forEach(({ ext, tamper }, idx) => {
    const region = tamper.evidence_region || { x: 25, y: 35, width: 50, height: 18 };
    tamperingDetections.push({
      id: `tamp-${ext.imageId}-${idx + 1}`,
      status: "REVIEW_REQUIRED",
      issueType: "POSSIBLE_LABEL_TAMPERING",
      affectedField: tamper.affected_field || "MRP / Statutory Declaration",
      confidence: cleanConfidence(tamper.confidence),
      indicators:
        tamper.indicators && tamper.indicators.length > 0
          ? tamper.indicators
          : ["possible sticker boundary", "surface difference", "text region partially covered"],
      evidenceRegion: region,
      message:
        tamper.message ||
        `Possible over-sticker detected on ${ext.side} around ${tamper.affected_field || "declaration"}. Human verification required.`,
      underlyingTextVisible: Boolean(tamper.underlying_text_visible),
      underlyingTextNote: tamper.underlying_text_visible
        ? tamper.underlying_text_note || "Partially visible"
        : "Underlying text is not visible in the supplied image.",
      evidenceImageUrl: ext.imageUrl,
      imageId: ext.imageId,
      side: ext.side,
      inspectorDecision: "PENDING",
    });
  });

  if (tamperingDetections.length > 0) {
    tamperingDetections.forEach((td, idx) => {
      findings.push({
        id: `find-tamper-${td.imageId}-${idx + 1}`,
        ruleCode: "LMPC-R23-TAMPER",
        ruleTitle: `Possible Over-Sticker / Overlay: ${td.affectedField} (${td.side})`,
        legalAct: "LMPC Rules 2011 - Rule 23(1) & General Provisions",
        category: "lmpc_mandatory",
        status: "review_required",
        severity: "medium",
        whatWasObserved: `Visual indicators suggest a possible sticker or overlay on [${td.side}] near ${td.affectedField}. Indicators: ${td.indicators.join(", ")}.`,
        whyFlagged:
          "Visual characteristics such as boundary seams, elevated edges, or substrate differences were detected. Under statutory guidelines, possible overlays require physical verification by an authorized inspector.",
        extractedEvidence: td.message,
        recommendedAction: `Inspect physical container on ${td.side}. Verify whether the overlay is an authorized manufacturer correction or an unauthorized over-sticker. Confirm, Reject, or Mark as Uncertain.`,
        analyzedField: td.affectedField,
        detectedValue: `Possible Over-Sticker on ${td.side}`,
        confidence: td.confidence,
        deterministicRule:
          "Statutory declarations must not be deceptively covered, modified, or altered by unverified overlays without authorized re-declaration.",
        reasoning:
          "Visual indicators warrant review to distinguish between authorized label corrections and non-compliant alterations.",
        ruleId: "RULE-LMPC-TAMPER-REVIEW",
        ruleName: "Label Over-Sticker & Overlay Verification",
        ruleSource: "Legal Metrology Department",
        ruleReference: "Rule 23(1), Packaged Commodities Rules 2011",
        ruleStatus: "Active",
        hasReliableRegion: true,
        sourceImageId: td.imageId,
        side: td.side,
        sourceImageUrl: td.evidenceImageUrl,
        uncertaintyReason: td.underlyingTextVisible
          ? undefined
          : "Underlying text is not visible in the supplied image.",
      });
    });
  }

  // Calculate compliance metrics
  const passCount = findings.filter((f) => f.status === "pass").length;
  const nonCompliantCount = findings.filter((f) => f.status === "non_compliant").length;
  const reviewRequiredCount = findings.filter((f) => f.status === "review_required").length;
  const totalRulesEvaluated = findings.length;

  const complianceScore = Math.round((passCount / totalRulesEvaluated) * 100);
  const overallStatus: ComplianceStatus =
    hasDeclarationConflicts || tamperingDetections.length > 0
      ? "review_required"
      : nonCompliantCount > 0
      ? "non_compliant"
      : reviewRequiredCount > 0
      ? "review_required"
      : "pass";

  // Derive commodity, brand, and category
  const derivedCommodityName =
    bestName?.value ||
    (preferredFileName
      ? preferredFileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
      : "Packaged Commodity Sample");

  const brandCandidate = safeExtractions.find((ext) => ext.extraction.brand_name?.value);
  const derivedBrandName = brandCandidate?.extraction.brand_name?.value || "Brand not specified";

  const derivedManufacturer = bestMfg?.value || "Manufacturer not detected";

  const categoryCandidate = safeExtractions.find((ext) => ext.extraction.category?.value);
  const derivedCategory = categoryCandidate?.extraction.category?.value || "General Packaged Commodity";

  const reportNotes = hasDeclarationConflicts
    ? `Inspected under the Legal Metrology (Packaged Commodities) Rules, 2011. Notice: POSSIBLE DECLARATION CONFLICT detected between package sides. Conflicting declarations require formal inspector review under Rule 6.`
    : tamperingDetections.length > 0
    ? `Inspected under the Legal Metrology (Packaged Commodities) Rules, 2011 and Rule 23(1). Notice: Visual indicators of possible over-stickering or label alterations detected across package sides (${tamperingDetections.map((t) => t.side).join(", ")}).`
    : isSingleFrontImageOnly
    ? `Inspected under the Legal Metrology (Packaged Commodities) Rules, 2011. Notice: Single front face uploaded. Secondary statutory declarations (complete postal address, batch details, consumer helpline) are typically situated on back/side panels.`
    : `Inspected under the Legal Metrology (Packaged Commodities) Rules, 2011 across ${packageImages.length} package sides (${uploadedSidesText}). Full multi-panel correlation completed.`;

  return {
    id: inspectionId,
    inspectionNumber,
    commodityName: derivedCommodityName,
    brandName: derivedBrandName,
    batchOrLotNumber: bestBatch?.value || "Not detected",
    manufacturerName: derivedManufacturer,
    category: derivedCategory,
    netQuantityDeclared: bestQty?.value || "Not detected",
    mrpDeclared: bestMrp?.value || "Not detected",
    unitSalePriceDeclared: bestUsp?.value || undefined,
    fssaiLicenseNo: bestFssai?.value || undefined,
    countryOfOrigin: bestOrigin?.value || "Not detected",
    packagingDate: bestDate?.value || undefined,
    expiryOrBestBefore:
      safeExtractions.find((ext) => ext.extraction.date_information?.expiry_or_best_before)
        ?.extraction.date_information?.expiry_or_best_before || undefined,
    overallStatus,
    complianceScore,
    passCount,
    nonCompliantCount,
    reviewRequiredCount,
    totalRulesEvaluated,
    inspectedAt,
    inspectorName,
    inspectorBadgeNumber,
    location,
    imageUrl: primaryImageUrl,
    fields,
    findings,
    tamperingDetections,
    packageImages,
    hasDeclarationConflicts,
    reportNotes,
  };
}

/**
 * Backward compatibility wrapper for single-image inspections
 */
export function evaluateInspectionCompliance(
  raw: RawExtractionResult,
  imageUrl: string,
  fileName?: string,
  inspectorName = "Field Inspection Officer",
  inspectorBadgeNumber = "LM-INSP-AUTO",
  location = "Packaged Commodity Inspection Center"
): InspectionSummary {
  return evaluateMultiImageInspectionCompliance(
    [
      {
        imageId: "img_1",
        side: "Front",
        fileName,
        imageUrl,
        extraction: raw,
      },
    ],
    inspectorName,
    inspectorBadgeNumber,
    location,
    fileName
  );
}
