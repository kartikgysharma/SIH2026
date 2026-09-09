import { normalizeRawExtraction, type RawExtractionResult } from "./geminiExtraction.ts";
import type {
  InspectionSummary,
  ExtractedField,
  ComplianceFinding,
  ComplianceStatus,
  TamperingDetectionResult,
} from "../src/types.ts";

export function evaluateInspectionCompliance(
  raw: RawExtractionResult,
  imageUrl: string,
  fileName?: string,
  inspectorName = "Field Inspection Officer",
  inspectorBadgeNumber = "LM-INSP-AUTO",
  location = "Packaged Commodity Inspection Center"
): InspectionSummary {
  // Normalize raw extraction data to ensure every single nested object and property is defined
  const rawSafe = normalizeRawExtraction(raw);

  const inspectionId = `insp-${Date.now()}`;
  const inspectionNumber = `INSP-FIELD-${Math.floor(1000 + Math.random() * 9000)}`;
  const inspectedAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST";

  const fields: ExtractedField[] = [];
  const findings: ComplianceFinding[] = [];

  // Helper to safely format confidence (0 to 1) or null
  const cleanConfidence = (conf: number | null | undefined): number => {
    if (typeof conf === "number" && !isNaN(conf)) {
      return Math.max(0, Math.min(1, conf));
    }
    return 0.85; // Default sensible confidence if unspecified
  };

  // Check if image represents only a front / face label
  const hasFaceIdentity = Boolean(rawSafe.product_name?.value || rawSafe.brand_name?.value);
  const mfgValueCandidate =
    rawSafe.manufacturer?.full_declaration ||
    rawSafe.manufacturer?.name ||
    rawSafe.packer?.full_declaration ||
    rawSafe.packer?.name ||
    rawSafe.importer?.full_declaration ||
    rawSafe.importer?.name ||
    null;
  const careValueCandidate =
    rawSafe.consumer_care?.value ||
    [rawSafe.consumer_care?.phone, rawSafe.consumer_care?.email, rawSafe.consumer_care?.address]
      .filter(Boolean)
      .join(" • ") ||
    null;
  const isFrontFaceOnly = Boolean(hasFaceIdentity && !mfgValueCandidate && !careValueCandidate);

  // Check for any tampering detected on specific fields
  const tamperingList = (rawSafe.possible_tampering_detections || []).filter(
    (d) => d && d.has_possible_oversticker
  );
  const isFieldTampered = (fieldNameKeywords: string[]): boolean => {
    return tamperingList.some((t) => {
      const target = (t.affected_field || "").toLowerCase();
      return fieldNameKeywords.some((kw) => target.includes(kw.toLowerCase()));
    });
  };

  // 1. Manufacturer / Packer Details
  const mfgValue = mfgValueCandidate;
  const mfgEvidence =
    rawSafe.manufacturer?.evidence ||
    rawSafe.packer?.evidence ||
    rawSafe.importer?.evidence ||
    null;
  const mfgTampered = isFieldTampered(["manufacturer", "packer", "importer", "address"]);
  const mfgStatus: ComplianceStatus = mfgTampered
    ? "review_required"
    : mfgValue
    ? "pass"
    : isFrontFaceOnly
    ? "review_required"
    : "non_compliant";

  fields.push({
    id: "f-mfg",
    fieldKey: "manufacturer_details",
    fieldName: "Name and Complete Address of Manufacturer / Packer / Importer",
    category: "lmpc_mandatory",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(a)",
    extractedValue: mfgValue || "Not detected",
    confidence: cleanConfidence(rawSafe.manufacturer?.confidence || rawSafe.packer?.confidence),
    isMandatory: true,
    status: mfgStatus,
    notes: mfgTampered
      ? "Possible label overlay or sticker boundary detected near manufacturer declaration"
      : mfgValue
      ? undefined
      : isFrontFaceOnly
      ? "Not detected on front display panel. Check back/side panel of physical packaging."
      : "Mandatory manufacturer / packer name & address missing from visible label",
  });

  findings.push({
    id: "find-mfg",
    ruleCode: "LMPC-R6-1A",
    ruleTitle: "Manufacturer / Packer / Importer Name & Complete Address",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(a)",
    category: "lmpc_mandatory",
    status: mfgStatus,
    severity: mfgStatus === "pass" ? "low" : mfgStatus === "review_required" ? "medium" : "high",
    whatWasObserved: mfgValue
      ? `Manufacturer / Packer details detected: "${mfgValue}"`
      : isFrontFaceOnly
      ? "Manufacturer details not visible on front display panel (commonly situated on back or information panel)."
      : "Manufacturer, packer, or importer name and address declaration was NOT detected on the package surface.",
    whyFlagged: mfgValue
      ? "Statutory declaration is visibly present."
      : isFrontFaceOnly
      ? "LMPC Rule 6(1)(a) requires complete postal address. Verify multi-panel packaging if only the front face was photographed."
      : "LMPC Rule 6(1)(a) strictly mandates every packaged commodity to carry the complete name and address of the manufacturer, packer, or importer.",
    extractedEvidence: mfgEvidence || (mfgValue ? mfgValue : "No text segment detected on package"),
    recommendedAction: mfgValue
      ? "No corrective action required for manufacturer declaration."
      : isFrontFaceOnly
      ? "Inspect physical container back/side panels to confirm complete postal address."
      : "Verify physical container or issue statutory notice for missing manufacturer details under LMPC Rule 6(1)(a).",
    analyzedField: "Manufacturer / Packer Details",
    detectedValue: mfgValue || "Not detected",
    confidence: cleanConfidence(rawSafe.manufacturer?.confidence),
    deterministicRule: "Package must clearly declare the complete legal name and postal address of the manufacturer, packer, or importer.",
    reasoning: mfgValue
      ? "Visible manufacturer/packer address satisfies Rule 6(1)(a) statutory requirement."
      : "Absence of manufacturer/packer declaration requires verification under LMPC Rule 6(1)(a).",
    ruleId: "RULE-LMPC-6-1-A",
    ruleName: "Mandatory Manufacturer Declaration",
    ruleSource: "Ministry of Consumer Affairs, Legal Metrology Division",
    ruleReference: "Rule 6(1)(a), Packaged Commodities Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: false,
    passVerificationNote: mfgValue ? "Declaration visibly identified on packaging." : undefined,
    uncertaintyReason: !mfgValue ? (isFrontFaceOnly ? "Panel appears to be front face." : "Declaration not found on visible label.") : undefined,
  });

  // 2. Generic Name / Commodity Identity
  const genericValue = rawSafe.generic_name?.value || rawSafe.product_name?.value || null;
  const genericEvidence = rawSafe.generic_name?.evidence || rawSafe.product_name?.evidence || null;
  const genericTampered = isFieldTampered(["generic", "product name", "identity"]);
  const genericStatus: ComplianceStatus = genericTampered
    ? "review_required"
    : genericValue
    ? "pass"
    : "non_compliant";

  fields.push({
    id: "f-name",
    fieldKey: "commodity_identity",
    fieldName: "Common / Generic Name of Packaged Commodity",
    category: "lmpc_mandatory",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(b)",
    extractedValue: genericValue || "Not detected",
    confidence: cleanConfidence(rawSafe.generic_name?.confidence || rawSafe.product_name?.confidence),
    isMandatory: true,
    status: genericStatus,
    notes: genericTampered
      ? "Possible label overlay detected near product name"
      : genericValue
      ? undefined
      : "Generic or common name of commodity not declared on principal display panel",
  });

  findings.push({
    id: "find-name",
    ruleCode: "LMPC-R6-1B",
    ruleTitle: "Generic or Common Name of Commodity",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(b)",
    category: "lmpc_mandatory",
    status: genericStatus,
    severity: genericStatus === "pass" ? "low" : "high",
    whatWasObserved: genericValue
      ? `Commodity name identified: "${genericValue}"`
      : "Generic or common name of the commodity was NOT detected on the package.",
    whyFlagged: genericValue
      ? "Generic commodity identity is visibly declared."
      : "LMPC Rule 6(1)(b) requires every package to indicate the common or generic name of the commodity contained within.",
    extractedEvidence: genericEvidence || (genericValue ? genericValue : "No text segment detected"),
    recommendedAction: genericValue
      ? "No corrective action required."
      : "Verify if generic commodity name appears elsewhere on the packaging.",
    analyzedField: "Generic Commodity Name",
    detectedValue: genericValue || "Not detected",
    confidence: cleanConfidence(rawSafe.generic_name?.confidence),
    deterministicRule: "The common or generic name of the commodity contained in the package must be prominently declared.",
    reasoning: genericValue
      ? "Valid commodity identification meets Rule 6(1)(b) requirement."
      : "Missing commodity identity fails Rule 6(1)(b).",
    ruleId: "RULE-LMPC-6-1-B",
    ruleName: "Generic Name of Commodity",
    ruleSource: "Ministry of Consumer Affairs",
    ruleReference: "Rule 6(1)(b), Legal Metrology Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: false,
  });

  // 3. Net Quantity Declaration
  const netQtyValue = rawSafe.net_quantity?.value || null;
  const netQtyEvidence = rawSafe.net_quantity?.evidence || null;
  const netQtyTampered = isFieldTampered(["net quantity", "net wt", "weight", "volume", "quantity"]);
  let netQtyStatus: ComplianceStatus = "non_compliant";
  if (netQtyTampered) {
    netQtyStatus = "review_required";
  } else if (netQtyValue) {
    const hasMetricUnit = /(?:g|kg|gm|gms|grams|ml|l|ltr|litre|litres|mg|meter|metres|m|cm|mm|units|unit|N|numbers|pcs|count)\b/i.test(
      netQtyValue
    );
    netQtyStatus = hasMetricUnit ? "pass" : "review_required";
  } else if (isFrontFaceOnly) {
    netQtyStatus = "review_required";
  }

  fields.push({
    id: "f-qty",
    fieldKey: "net_quantity",
    fieldName: "Net Quantity Declaration (Metric Standard Units)",
    category: "weights_measures",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(c) & Rule 7",
    extractedValue: netQtyValue || "Not detected",
    confidence: cleanConfidence(rawSafe.net_quantity?.confidence),
    isMandatory: true,
    status: netQtyStatus,
    notes: netQtyTampered
      ? "Possible label overlay or sticker patch near net quantity declaration"
      : !netQtyValue
      ? isFrontFaceOnly
        ? "Net quantity not detected on visible front panel. Check lower display area or side panel."
        : "Net quantity declaration not found on packaging"
      : netQtyStatus === "review_required"
      ? "Metric unit format or numeral height requires verification"
      : undefined,
  });

  findings.push({
    id: "find-qty",
    ruleCode: "LMPC-R6-1C",
    ruleTitle: "Net Quantity in Standard Units of Weight/Measure",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(c) & Rule 7",
    category: "weights_measures",
    status: netQtyStatus,
    severity: netQtyStatus === "pass" ? "low" : "high",
    whatWasObserved: netQtyValue
      ? `Net quantity declared: "${netQtyValue}"`
      : "Net quantity declaration was NOT detected on the visible package surface.",
    whyFlagged:
      netQtyStatus === "pass"
        ? "Net quantity is declared in standard metric units."
        : netQtyStatus === "review_required"
        ? netQtyTampered
          ? "Possible sticker or surface alteration observed in net quantity region."
          : "Net quantity requires verification under standard units of measurement."
        : "LMPC Rule 6(1)(c) mandates explicit declaration of net quantity in standard metric units on the Principal Display Panel.",
    extractedEvidence: netQtyEvidence || (netQtyValue ? netQtyValue : "No net quantity declaration detected"),
    recommendedAction:
      netQtyStatus === "pass"
        ? "Confirm font height adheres to area table in Rule 7(1) during physical inspection."
        : "Check physical label for net quantity in accordance with standard weight and measures specifications.",
    analyzedField: "Net Quantity",
    detectedValue: netQtyValue || "Not detected",
    confidence: cleanConfidence(rawSafe.net_quantity?.confidence),
    deterministicRule: "Net quantity must be declared in standard SI metric units (kg, g, mg, L, mL, m, etc.) on the Principal Display Panel.",
    reasoning:
      netQtyStatus === "pass"
        ? "Detected net quantity adheres to standard unit specifications."
        : "Non-compliant or ambiguous net quantity requires verification under Rule 6(1)(c).",
    ruleId: "RULE-LMPC-6-1-C",
    ruleName: "Net Quantity Declaration",
    ruleSource: "Legal Metrology Packaged Commodities Rules 2011",
    ruleReference: "Rule 6(1)(c) and Rule 7, LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: false,
  });

  // 4. Maximum Retail Price (MRP)
  const mrpValue = rawSafe.mrp?.value || null;
  const mrpEvidence = rawSafe.mrp?.evidence || null;
  const mrpTampered = isFieldTampered(["mrp", "price", "retail price"]);
  let mrpStatus: ComplianceStatus = "non_compliant";
  if (mrpTampered) {
    mrpStatus = "review_required";
  } else if (mrpValue) {
    const hasTaxMention =
      rawSafe.mrp?.includes_taxes === true ||
      /(?:incl|inclusive|incl\.|including|taxes|all taxes)/i.test(mrpValue) ||
      (mrpEvidence && /(?:incl|inclusive|all taxes)/i.test(mrpEvidence));
    mrpStatus = hasTaxMention ? "pass" : "review_required";
  } else if (isFrontFaceOnly) {
    mrpStatus = "review_required";
  }

  fields.push({
    id: "f-mrp",
    fieldKey: "mrp_declaration",
    fieldName: "Maximum Retail Price (MRP Incl. of all taxes)",
    category: "lmpc_mandatory",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(d)",
    extractedValue: mrpValue || "Not detected",
    confidence: cleanConfidence(rawSafe.mrp?.confidence),
    isMandatory: true,
    status: mrpStatus,
    notes: mrpTampered
      ? "Possible over-sticker detected near MRP declaration. Review required."
      : !mrpValue
      ? isFrontFaceOnly
        ? "MRP not printed on front face (customarily placed on back/top panel)"
        : "Maximum Retail Price declaration not detected"
      : mrpStatus === "review_required"
      ? "MRP found but 'Inclusive of all taxes' declaration needs verification"
      : undefined,
  });

  findings.push({
    id: "find-mrp",
    ruleCode: "LMPC-R6-1D",
    ruleTitle: "Maximum Retail Price (MRP) Declaration",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(d)",
    category: "lmpc_mandatory",
    status: mrpStatus,
    severity: mrpStatus === "pass" ? "low" : "high",
    whatWasObserved: mrpValue
      ? `MRP declared: "${mrpValue}"`
      : isFrontFaceOnly
      ? "Maximum Retail Price not detected on front display panel."
      : "Maximum Retail Price (MRP) was NOT detected on the package.",
    whyFlagged:
      mrpStatus === "pass"
        ? "MRP is declared with inclusive tax wording or currency symbol."
        : mrpTampered
        ? "Visual indicators suggest a possible sticker patch over the price panel."
        : mrpStatus === "review_required"
        ? "MRP is declared, but explicit 'Inclusive of all taxes' statement could not be fully confirmed from label view."
        : "LMPC Rule 6(1)(d) strictly prohibits sale of packaged commodities without a clearly stated Maximum Retail Price.",
    extractedEvidence: mrpEvidence || (mrpValue ? mrpValue : "No price text detected"),
    recommendedAction:
      mrpStatus === "pass"
        ? "No corrective action required."
        : mrpTampered
        ? "Inspect physical container to verify if price overlay is an authorized re-declaration or unauthorized alteration."
        : isFrontFaceOnly
        ? "Inspect top crimp or back panel for laser-printed MRP declaration."
        : "Inspect package to ensure '(Inclusive of all taxes)' appears with the price.",
    analyzedField: "Maximum Retail Price (MRP)",
    detectedValue: mrpValue || "Not detected",
    confidence: cleanConfidence(rawSafe.mrp?.confidence),
    deterministicRule: "Maximum Retail Price must be declared in Indian Rupees as 'MRP ₹... (inclusive of all taxes)'.",
    reasoning:
      mrpStatus === "pass"
        ? "Declared retail price satisfies Rule 6(1)(d)."
        : "Price declaration requires verification under Rule 6(1)(d).",
    ruleId: "RULE-LMPC-6-1-D",
    ruleName: "Maximum Retail Price Declaration",
    ruleSource: "Ministry of Consumer Affairs",
    ruleReference: "Rule 6(1)(d), LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: false,
  });

  // 5. Month and Year of Manufacture / Packaging
  const dateValue =
    rawSafe.date_information?.packaging_date ||
    rawSafe.date_information?.manufacturing_date ||
    rawSafe.date_information?.value ||
    null;
  const dateEvidence = rawSafe.date_information?.evidence || null;
  const dateTampered = isFieldTampered(["date", "mfg", "pkd", "expiry", "best before"]);
  const dateStatus: ComplianceStatus = dateTampered
    ? "review_required"
    : dateValue
    ? "pass"
    : isFrontFaceOnly
    ? "review_required"
    : "non_compliant";

  fields.push({
    id: "f-date",
    fieldKey: "packaging_date",
    fieldName: "Month and Year of Manufacture or Packaging",
    category: "lmpc_mandatory",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(e)",
    extractedValue: dateValue || "Not detected",
    confidence: cleanConfidence(rawSafe.date_information?.confidence),
    isMandatory: true,
    status: dateStatus,
    notes: dateTampered
      ? "Possible date alteration or over-sticker detected"
      : dateValue
      ? undefined
      : isFrontFaceOnly
      ? "Date not on front face. Often stamped on crimp, seal, or back panel."
      : "Month & year of manufacture/packaging declaration not detected",
  });

  findings.push({
    id: "find-date",
    ruleCode: "LMPC-R6-1E",
    ruleTitle: "Month and Year of Manufacture / Packaging",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(e)",
    category: "lmpc_mandatory",
    status: dateStatus,
    severity: dateStatus === "pass" ? "low" : "high",
    whatWasObserved: dateValue
      ? `Manufacturing/Packaging date detected: "${dateValue}"`
      : isFrontFaceOnly
      ? "Manufacturing date not detected on front display panel."
      : "Month and year of manufacture or packaging was NOT detected on the package.",
    whyFlagged: dateValue
      ? "Date declaration is visibly present."
      : isFrontFaceOnly
      ? "Manufacturing/packaging dates are typically stamped on package crimps, seals, or back panels."
      : "LMPC Rule 6(1)(e) requires the month and year of manufacture, packing, or import to be declared on every package.",
    extractedEvidence: dateEvidence || (dateValue ? dateValue : "No date text detected"),
    recommendedAction: dateValue
      ? "No corrective action required."
      : "Examine batch coding area, crimp, or back panel for laser-etched/stamped manufacturing date.",
    analyzedField: "Month & Year of Packaging",
    detectedValue: dateValue || "Not detected",
    confidence: cleanConfidence(rawSafe.date_information?.confidence),
    deterministicRule: "Month and year in which the commodity is manufactured, packed, or imported must be declared on the package.",
    reasoning: dateValue
      ? "Date declaration satisfies statutory requirements."
      : "Absence of manufacturing date requires verification under Rule 6(1)(e).",
    ruleId: "RULE-LMPC-6-1-E",
    ruleName: "Manufacturing Date Declaration",
    ruleSource: "Legal Metrology Rules 2011",
    ruleReference: "Rule 6(1)(e), LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: false,
  });

  // 6. Unit Sale Price (USP)
  const uspValue = rawSafe.unit_sale_price?.value || null;
  const uspEvidence = rawSafe.unit_sale_price?.evidence || null;
  let uspStatus: ComplianceStatus = "review_required";
  if (uspValue) {
    uspStatus = "pass";
  } else {
    uspStatus = mrpValue ? "review_required" : "review_required";
  }

  fields.push({
    id: "f-usp",
    fieldKey: "unit_sale_price",
    fieldName: "Unit Sale Price (USP per g / ml / unit)",
    category: "weights_measures",
    legalReference: "LMPC (Amendment) Rules 2021 - Rule 6(11)",
    extractedValue: uspValue || "Not detected",
    confidence: cleanConfidence(rawSafe.unit_sale_price?.confidence),
    isMandatory: false,
    status: uspStatus,
    notes: !uspValue ? "Unit Sale Price (USP) not found alongside declared MRP" : undefined,
  });

  findings.push({
    id: "find-usp",
    ruleCode: "LMPC-R6-USP",
    ruleTitle: "Unit Sale Price (USP) Declaration",
    legalAct: "LMPC (Amendment) Rules 2021 - Rule 6(11)",
    category: "weights_measures",
    status: uspStatus,
    severity: uspStatus === "pass" ? "low" : "medium",
    whatWasObserved: uspValue
      ? `Unit Sale Price detected: "${uspValue}"`
      : "Unit Sale Price (USP) was NOT detected adjacent to the MRP declaration.",
    whyFlagged: uspValue
      ? "Unit Sale Price is clearly declared."
      : "Under amended Legal Metrology Rules, packages with quantities > 1 unit/kg/L must declare unit price in ₹ per g/ml/piece.",
    extractedEvidence: uspEvidence || (uspValue ? uspValue : "USP declaration not found"),
    recommendedAction: uspValue
      ? "No corrective action required."
      : "Review package net quantity to determine whether mandatory USP exemption applies.",
    analyzedField: "Unit Sale Price",
    detectedValue: uspValue || "Not detected",
    confidence: cleanConfidence(rawSafe.unit_sale_price?.confidence),
    deterministicRule: "Unit Sale Price (USP) must be declared in rupees and paise per g, ml, cm, or number.",
    reasoning: uspValue
      ? "USP declaration complies with 2021 amended statutory rules."
      : "Missing USP requires inspector confirmation regarding package net volume applicability.",
    ruleId: "RULE-LMPC-6-USP",
    ruleName: "Unit Sale Price Requirement",
    ruleSource: "Legal Metrology Division Notification",
    ruleReference: "Rule 6(11), LMPC (Amendment) Rules 2021",
    ruleStatus: "Active",
    hasReliableRegion: false,
  });

  // 7. Consumer Care Details
  const careValue = careValueCandidate;
  const careEvidence = rawSafe.consumer_care?.evidence || null;
  const careTampered = isFieldTampered(["consumer", "care", "helpline", "email"]);
  const careStatus: ComplianceStatus = careTampered
    ? "review_required"
    : careValue
    ? "pass"
    : isFrontFaceOnly
    ? "review_required"
    : "non_compliant";

  fields.push({
    id: "f-care",
    fieldKey: "consumer_care",
    fieldName: "Consumer Care & Grievance Redressal Mechanism",
    category: "consumer_protection",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(g)",
    extractedValue: careValue || "Not detected",
    confidence: cleanConfidence(rawSafe.consumer_care?.confidence),
    isMandatory: true,
    status: careStatus,
    notes: careTampered
      ? "Possible label overlay detected near consumer helpline contact"
      : careValue
      ? undefined
      : isFrontFaceOnly
      ? "Consumer helpline details not on front face; inspect packaging back panel."
      : "Consumer grievance helpline, email, or address not found on visible label",
  });

  findings.push({
    id: "find-care",
    ruleCode: "LMPC-R6-1G",
    ruleTitle: "Consumer Care Contact Information",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(g)",
    category: "consumer_protection",
    status: careStatus,
    severity: careStatus === "pass" ? "low" : "high",
    whatWasObserved: careValue
      ? `Consumer care contact detected: "${careValue}"`
      : isFrontFaceOnly
      ? "Consumer helpline contact details not visible on front display panel."
      : "Consumer care telephone, email, or contact address was NOT detected.",
    whyFlagged: careValue
      ? "Consumer care details are visibly provided."
      : isFrontFaceOnly
      ? "Consumer care details are typically located on information or back panels of packaged commodities."
      : "LMPC Rule 6(1)(g) mandates the name, address, telephone number, and email address of the grievance redressal person/office.",
    extractedEvidence: careEvidence || (careValue ? careValue : "No consumer care text detected"),
    recommendedAction: careValue
      ? "No corrective action required."
      : "Verify whether consumer helpline is located on back or side panel.",
    analyzedField: "Consumer Care Contact",
    detectedValue: careValue || "Not detected",
    confidence: cleanConfidence(rawSafe.consumer_care?.confidence),
    deterministicRule: "Package must state the name, address, phone number, and email of the consumer grievance redressal officer.",
    reasoning: careValue
      ? "Consumer care details satisfy Rule 6(1)(g)."
      : "Consumer care information requires verification under Rule 6(1)(g).",
    ruleId: "RULE-LMPC-6-1-G",
    ruleName: "Consumer Care Mandate",
    ruleSource: "Ministry of Consumer Affairs",
    ruleReference: "Rule 6(1)(g), LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: false,
  });

  // 8. Country of Origin
  const originValue = rawSafe.country_of_origin?.value || null;
  const originEvidence = rawSafe.country_of_origin?.evidence || null;
  const originStatus: ComplianceStatus = originValue
    ? "pass"
    : isFrontFaceOnly
    ? "review_required"
    : "non_compliant";

  fields.push({
    id: "f-origin",
    fieldKey: "country_of_origin",
    fieldName: "Country of Origin Declaration",
    category: "origin_import",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(h)",
    extractedValue: originValue || "Not detected",
    confidence: cleanConfidence(rawSafe.country_of_origin?.confidence),
    isMandatory: true,
    status: originStatus,
    notes: originValue
      ? undefined
      : isFrontFaceOnly
      ? "Country of Origin not detected on front panel (check manufacturer details on back)."
      : "Country of origin declaration not detected on package label",
  });

  findings.push({
    id: "find-origin",
    ruleCode: "LMPC-R6-1H",
    ruleTitle: "Country of Origin Declaration",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(h)",
    category: "origin_import",
    status: originStatus,
    severity: originStatus === "pass" ? "low" : "high",
    whatWasObserved: originValue
      ? `Country of Origin declared: "${originValue}"`
      : "Country of Origin declaration was NOT detected on the package.",
    whyFlagged: originValue
      ? "Country of Origin is declared."
      : "LMPC Rule 6(1)(h) mandates Country of Origin on all imported and domestic goods.",
    extractedEvidence: originEvidence || (originValue ? originValue : "No origin text detected"),
    recommendedAction: originValue
      ? "No corrective action required."
      : "Check package for 'Made in [Country]' or 'Country of Origin' declaration.",
    analyzedField: "Country of Origin",
    detectedValue: originValue || "Not detected",
    confidence: cleanConfidence(rawSafe.country_of_origin?.confidence),
    deterministicRule: "Every package must clearly state the Country of Origin or 'Made in [Country]'.",
    reasoning: originValue
      ? "Country of origin declaration satisfies Rule 6(1)(h)."
      : "Missing Country of Origin requires verification under Rule 6(1)(h).",
    ruleId: "RULE-LMPC-6-1-H",
    ruleName: "Country of Origin Requirement",
    ruleSource: "Legal Metrology Rules 2011",
    ruleReference: "Rule 6(1)(h), LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: false,
  });

  // 9. FSSAI License Number (if Food/Beverage/Edible or detected)
  const isFoodCategory =
    Boolean(rawSafe.category?.value) &&
    /(?:food|beverage|snack|oil|edible|spice|tea|coffee|dairy|sweet|confectionery|grain|cereal|atta|rice|pulses|sauce|pickle|biscuit|chocolate)/i.test(
      rawSafe.category?.value || ""
    );
  const fssaiValue = rawSafe.fssai_license_number?.value || null;
  const fssaiEvidence = rawSafe.fssai_license_number?.evidence || null;

  if (isFoodCategory || fssaiValue) {
    const fssaiStatus: ComplianceStatus = fssaiValue
      ? "pass"
      : isFrontFaceOnly
      ? "review_required"
      : "review_required";

    fields.push({
      id: "f-fssai",
      fieldKey: "fssai_license",
      fieldName: "FSSAI 14-Digit License & Logo",
      category: "fssai_food_safety",
      legalReference: "FSS (Packaging and Labelling) Regulations, 2011",
      extractedValue: fssaiValue || "Not detected",
      confidence: cleanConfidence(rawSafe.fssai_license_number?.confidence),
      isMandatory: isFoodCategory || false,
      status: fssaiStatus,
      notes: !fssaiValue
        ? isFrontFaceOnly
          ? "FSSAI license usually printed adjacent to nutrition/manufacturer table on back"
          : "Food item missing 14-digit FSSAI License Number"
        : undefined,
    });

    findings.push({
      id: "find-fssai",
      ruleCode: "FSSAI-R2-3",
      ruleTitle: "FSSAI Food Safety License Number",
      legalAct: "FSS (Packaging and Labelling) Regulations, 2011",
      category: "fssai_food_safety",
      status: fssaiStatus,
      severity: fssaiStatus === "pass" ? "low" : "high",
      whatWasObserved: fssaiValue
        ? `FSSAI License detected: "${fssaiValue}"`
        : "FSSAI 14-digit License Number was NOT detected on the visible label.",
      whyFlagged: fssaiValue
        ? "Valid FSSAI license is declared."
        : "Food safety regulations require the 14-digit FSSAI license number and logo on all packaged food products.",
      extractedEvidence: fssaiEvidence || (fssaiValue ? fssaiValue : "FSSAI license not detected"),
      recommendedAction: fssaiValue
        ? "No corrective action required."
        : "Verify FSSAI license on secondary or back panel of packaging.",
      analyzedField: "FSSAI License Number",
      detectedValue: fssaiValue || "Not detected",
      confidence: cleanConfidence(rawSafe.fssai_license_number?.confidence),
      deterministicRule: "Food items must declare the 14-digit FSSAI license number and logo.",
      reasoning: fssaiValue
        ? "FSSAI license satisfies food packaging regulation."
        : "Missing FSSAI license requires inspector verification on package reverse.",
      ruleId: "RULE-FSSAI-2-3",
      ruleName: "FSSAI License Mandate",
      ruleSource: "Food Safety and Standards Authority of India",
      ruleReference: "FSS Regulations 2011",
      ruleStatus: "Active",
      hasReliableRegion: false,
    });
  }

  // 10. Label Tampering / Over-Sticker Evaluation
  const tamperingDetections: TamperingDetectionResult[] = tamperingList.map((t, idx) => {
    const region = t.evidence_region || { x: 25, y: 35, width: 50, height: 18 };
    return {
      id: `tamp-${Date.now()}-${idx + 1}`,
      status: "REVIEW_REQUIRED",
      issueType: "POSSIBLE_LABEL_TAMPERING",
      affectedField: t.affected_field || "MRP / Statutory Declaration",
      confidence: cleanConfidence(t.confidence),
      indicators:
        t.indicators && t.indicators.length > 0
          ? t.indicators
          : ["possible sticker boundary", "surface difference", "text region partially covered"],
      evidenceRegion: region,
      message:
        t.message ||
        `Possible over-sticker detected around the ${t.affected_field || "declaration"}. Human verification required.`,
      underlyingTextVisible: Boolean(t.underlying_text_visible),
      underlyingTextNote: t.underlying_text_visible
        ? t.underlying_text_note || "Partially visible"
        : "Underlying text is not visible in the supplied image.",
      inspectorDecision: "PENDING",
    };
  });

  if (tamperingDetections.length > 0) {
    tamperingDetections.forEach((td, idx) => {
      findings.push({
        id: `find-tamper-${idx + 1}`,
        ruleCode: "LMPC-R23-TAMPER",
        ruleTitle: `Possible Over-Sticker / Overlay: ${td.affectedField}`,
        legalAct: "LMPC Rules 2011 - Rule 23(1) & General Provisions",
        category: "lmpc_mandatory",
        status: "review_required",
        severity: "medium",
        whatWasObserved: `Visual indicators suggest a possible sticker or overlay near ${td.affectedField}. Indicators: ${td.indicators.join(", ")}.`,
        whyFlagged:
          "Visual characteristics such as boundary seams, elevated edges, or substrate differences were detected. Under statutory guidelines, possible overlays require physical verification by an authorized inspector.",
        extractedEvidence: td.message,
        recommendedAction:
          "Inspect physical container. Verify whether the overlay is an authorized manufacturer correction or an unauthorized over-sticker. Confirm, Reject, or Mark as Uncertain.",
        analyzedField: td.affectedField,
        detectedValue: "Possible Over-Sticker Flagged",
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
        uncertaintyReason: td.underlyingTextVisible
          ? undefined
          : "Underlying text is not visible in the supplied image.",
      });
    });
  }

  // Calculate stats
  const passCount = findings.filter((f) => f.status === "pass").length;
  const nonCompliantCount = findings.filter((f) => f.status === "non_compliant").length;
  const reviewRequiredCount = findings.filter((f) => f.status === "review_required").length;
  const totalRulesEvaluated = findings.length;

  const complianceScore = Math.round((passCount / totalRulesEvaluated) * 100);
  const overallStatus: ComplianceStatus =
    tamperingDetections.length > 0
      ? "review_required"
      : nonCompliantCount > 0
      ? "non_compliant"
      : reviewRequiredCount > 0
      ? "review_required"
      : "pass";

  // Derive commodity & brand names directly from the real extraction
  const derivedCommodityName =
    rawSafe.product_name?.value ||
    rawSafe.generic_name?.value ||
    (fileName ? fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : "Packaged Commodity Sample");

  const derivedBrandName = rawSafe.brand_name?.value || "Brand not specified";
  const derivedManufacturer =
    rawSafe.manufacturer?.name ||
    rawSafe.manufacturer?.full_declaration ||
    rawSafe.packer?.name ||
    rawSafe.importer?.name ||
    "Manufacturer not detected";
  const derivedCategory = rawSafe.category?.value || "General Packaged Commodity";

  const reportNotes = isFrontFaceOnly
    ? `Inspected under the Legal Metrology (Packaged Commodities) Rules, 2011. Notice: The captured image appears to represent a front/face display panel. Secondary statutory declarations (complete postal address, batch details, consumer helpline) are typically situated on back/side panels. Review physical package for comprehensive verification.`
    : tamperingDetections.length > 0
    ? `Inspected under the Legal Metrology (Packaged Commodities) Rules, 2011 and Rule 23(1). Notice: Visual indicators of possible over-stickering or label alterations were detected. Human physical inspection required to verify statutory declarations.`
    : `Inspected under the Legal Metrology (Packaged Commodities) Rules, 2011 and FSSAI statutory regulations. Extraction performed from high-resolution visual label image.`;

  return {
    id: inspectionId,
    inspectionNumber,
    commodityName: derivedCommodityName,
    brandName: derivedBrandName,
    batchOrLotNumber: rawSafe.batch_or_lot_number?.value || "Not detected",
    manufacturerName: derivedManufacturer,
    category: derivedCategory,
    netQuantityDeclared: rawSafe.net_quantity?.value || "Not detected",
    mrpDeclared: rawSafe.mrp?.value || "Not detected",
    unitSalePriceDeclared: rawSafe.unit_sale_price?.value || undefined,
    fssaiLicenseNo: rawSafe.fssai_license_number?.value || undefined,
    countryOfOrigin: rawSafe.country_of_origin?.value || "Not detected",
    packagingDate:
      rawSafe.date_information?.packaging_date ||
      rawSafe.date_information?.manufacturing_date ||
      rawSafe.date_information?.value ||
      undefined,
    expiryOrBestBefore: rawSafe.date_information?.expiry_or_best_before || undefined,
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
    imageUrl,
    fields,
    findings,
    tamperingDetections,
    reportNotes,
  };
}
