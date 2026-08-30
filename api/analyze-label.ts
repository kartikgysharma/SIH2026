import { GoogleGenAI } from "@google/genai";

// Self-contained types for Vercel Serverless runtime
export interface RawExtractionResult {
  product_name: { value: string | null; confidence: number | null; evidence: string | null };
  brand_name: { value: string | null; confidence: number | null; evidence: string | null };
  generic_name: { value: string | null; confidence: number | null; evidence: string | null };
  category: { value: string | null; confidence: number | null; evidence: string | null };
  net_quantity: { value: string | null; raw_numeral: string | null; raw_unit: string | null; confidence: number | null; evidence: string | null };
  mrp: { value: string | null; raw_amount: string | null; includes_taxes: boolean | null; confidence: number | null; evidence: string | null };
  unit_sale_price: { value: string | null; confidence: number | null; evidence: string | null };
  manufacturer: { name: string | null; address: string | null; full_declaration: string | null; confidence: number | null; evidence: string | null };
  packer: { name: string | null; address: string | null; full_declaration: string | null; confidence: number | null; evidence: string | null };
  importer: { name: string | null; address: string | null; full_declaration: string | null; confidence: number | null; evidence: string | null };
  country_of_origin: { value: string | null; confidence: number | null; evidence: string | null };
  date_information: { value: string | null; manufacturing_date: string | null; packaging_date: string | null; expiry_or_best_before: string | null; confidence: number | null; evidence: string | null };
  batch_or_lot_number: { value: string | null; confidence: number | null; evidence: string | null };
  consumer_care: { value: string | null; phone: string | null; email: string | null; address: string | null; confidence: number | null; evidence: string | null };
  fssai_license_number: { value: string | null; confidence: number | null; evidence: string | null };
  other_declarations: Array<{ label: string; value: string; evidence: string }>;
  image_quality: { is_usable: boolean; quality_issue: string | null; blur_detected: boolean; glare_detected: boolean; text_legible: boolean };
  overall_extraction_confidence: number | null;
}

const EXTRACTION_SYSTEM_PROMPT = `You are a specialized legal metrology vision extraction system analyzing a real packaged commodity label image.

OBJECTIVE:
Extract ONLY information that is VISIBLY PRESENT in the supplied image.
Preserve the exact text as it appears on the package as closely as possible.

STRICT EXTRACTION RULES:
1. DO NOT GUESS.
2. DO NOT INFER MISSING VALUES.
3. DO NOT USE PRIOR EXAMPLES OR DUMMY DATA.
4. DO NOT INVENT PRODUCT NAMES, PRICES, QUANTITIES, ADDRESSES, OR DATES.
5. If a field is not visible, obscured, or cannot be reliably read from the image, set its "value" to null and provide confidence 0 or null.
6. For every extracted field, provide the exact verbatim "evidence" string found on the label.
7. Under "image_quality", check if the image is readable. If it is severely blurred, pitch black, unreadable, or does not contain a packaged commodity label, set "is_usable" to false and describe the "quality_issue".
8. DO NOT make legal compliance decisions. Your sole job is accurate textual and visual extraction from the image.

Output must strictly be valid JSON matching this schema:
{
  "product_name": { "value": string | null, "confidence": number (0-1) | null, "evidence": string | null },
  "brand_name": { "value": string | null, "confidence": number (0-1) | null, "evidence": string | null },
  "generic_name": { "value": string | null, "confidence": number (0-1) | null, "evidence": string | null },
  "category": { "value": string | null, "confidence": number (0-1) | null, "evidence": string | null },
  "net_quantity": { "value": string | null, "raw_numeral": string | null, "raw_unit": string | null, "confidence": number (0-1) | null, "evidence": string | null },
  "mrp": { "value": string | null, "raw_amount": string | null, "includes_taxes": boolean | null, "confidence": number (0-1) | null, "evidence": string | null },
  "unit_sale_price": { "value": string | null, "confidence": number (0-1) | null, "evidence": string | null },
  "manufacturer": { "name": string | null, "address": string | null, "full_declaration": string | null, "confidence": number (0-1) | null, "evidence": string | null },
  "packer": { "name": string | null, "address": string | null, "full_declaration": string | null, "confidence": number (0-1) | null, "evidence": string | null },
  "importer": { "name": string | null, "address": string | null, "full_declaration": string | null, "confidence": number (0-1) | null, "evidence": string | null },
  "country_of_origin": { "value": string | null, "confidence": number (0-1) | null, "evidence": string | null },
  "date_information": { "value": string | null, "manufacturing_date": string | null, "packaging_date": string | null, "expiry_or_best_before": string | null, "confidence": number (0-1) | null, "evidence": string | null },
  "batch_or_lot_number": { "value": string | null, "confidence": number (0-1) | null, "evidence": string | null },
  "consumer_care": { "value": string | null, "phone": string | null, "email": string | null, "address": string | null, "confidence": number (0-1) | null, "evidence": string | null },
  "fssai_license_number": { "value": string | null, "confidence": number (0-1) | null, "evidence": string | null },
  "other_declarations": [ { "label": string, "value": string, "evidence": string } ],
  "image_quality": { "is_usable": boolean, "quality_issue": string | null, "blur_detected": boolean, "glare_detected": boolean, "text_legible": boolean },
  "overall_extraction_confidence": number (0-1) | null
}`;

function getGeminiApiKey(): string {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_GENAI_API_KEY,
    process.env.VITE_GEMINI_API_KEY,
    process.env.VITE_GOOGLE_API_KEY,
    process.env.AI_STUDIO_API_KEY,
    process.env.API_KEY,
  ];

  for (const key of candidates) {
    if (key && typeof key === "string" && key.trim().length > 0) {
      // Remove any accidental leading/trailing quotes or whitespace
      return key.trim().replace(/^["']|["']$/g, "");
    }
  }

  return "";
}

async function extractLabelWithGemini(
  base64Data: string,
  mimeType = "image/jpeg"
): Promise<RawExtractionResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY (or GOOGLE_API_KEY) is not configured in Vercel environment variables. Please add GEMINI_API_KEY in Vercel Project Settings -> Environment Variables."
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "bharatlabel-compliance",
      },
    },
  });

  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");

  const imagePart = {
    inlineData: {
      mimeType: mimeType || "image/jpeg",
      data: cleanBase64,
    },
  };

  const textPart = {
    text: "Extract all visible packaged commodity declarations, text blocks, and label particulars from this packaging image according to the system instructions. Remember: DO NOT GUESS. If not visible, return null.",
  };

  const candidateModels = [
    "gemini-3.1-flash-lite",
    "gemini-3.7-flash",
    "gemini-3.1-pro-preview",
    "gemini-flash-latest",
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini Extraction] Trying model: ${model} (attempt ${attempt})`);
        const response = await ai.models.generateContent({
          model,
          contents: { parts: [imagePart, textPart] },
          config: {
            systemInstruction: EXTRACTION_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error("Empty response received from Gemini Vision model");
        }

        const parsed: RawExtractionResult = JSON.parse(responseText.trim());
        return parsed;
      } catch (err: any) {
        lastError = err;
        const errString = String(err?.message || err);
        const isRetryable =
          errString.includes("503") ||
          errString.includes("UNAVAILABLE") ||
          errString.includes("high demand") ||
          errString.includes("429") ||
          errString.includes("RESOURCE_EXHAUSTED");

        console.warn(
          `[Gemini Attempt ${attempt} on ${model} failed]:`,
          errString.slice(0, 180)
        );

        if (isRetryable && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
        } else {
          break;
        }
      }
    }
  }

  let cleanMsg = "AI Vision service is temporarily experiencing high load. Please try again.";
  if (lastError) {
    const rawMsg = lastError.message || String(lastError);
    if (rawMsg.includes("API key not valid") || rawMsg.includes("API_KEY_INVALID")) {
      cleanMsg = "The GEMINI_API_KEY configured in Vercel is invalid. Please verify the key in Google AI Studio.";
    } else if (rawMsg.includes("503") || rawMsg.includes("high demand")) {
      cleanMsg = "Gemini Vision service is experiencing temporary high traffic. Please retry in a few moments.";
    } else {
      cleanMsg = rawMsg;
    }
  }

  throw new Error(cleanMsg);
}

function evaluateCompliance(
  raw: RawExtractionResult,
  imageUrl: string,
  fileName?: string,
  inspectorName = "Field Inspection Officer",
  inspectorBadgeNumber = "LM-INSP-AUTO",
  location = "Packaged Commodity Inspection Center"
) {
  const inspectionId = `insp-${Date.now()}`;
  const inspectionNumber = `INSP-FIELD-${Math.floor(1000 + Math.random() * 9000)}`;
  const inspectedAt =
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST";

  const fields: any[] = [];
  const findings: any[] = [];

  const cleanConfidence = (conf: number | null | undefined): number => {
    if (typeof conf === "number" && !isNaN(conf)) {
      return Math.max(0, Math.min(1, conf));
    }
    return 0.85;
  };

  // 1. Manufacturer / Packer Details
  const mfgValue =
    raw.manufacturer.full_declaration ||
    raw.manufacturer.name ||
    raw.packer.full_declaration ||
    raw.packer.name ||
    raw.importer.full_declaration ||
    raw.importer.name ||
    null;
  const mfgEvidence =
    raw.manufacturer.evidence || raw.packer.evidence || raw.importer.evidence || null;
  const mfgStatus = mfgValue ? "pass" : "non_compliant";

  fields.push({
    id: "f-mfg",
    fieldKey: "manufacturer_details",
    fieldName: "Name and Complete Address of Manufacturer / Packer / Importer",
    category: "lmpc_mandatory",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(a)",
    extractedValue: mfgValue || "Not detected",
    confidence: cleanConfidence(raw.manufacturer.confidence || raw.packer.confidence),
    isMandatory: true,
    status: mfgStatus,
    notes: mfgValue ? undefined : "Mandatory manufacturer / packer name & address missing from visible label",
  });

  findings.push({
    id: "find-mfg",
    ruleCode: "LMPC-R6-1A",
    ruleTitle: "Manufacturer / Packer / Importer Name & Complete Address",
    legalAct: "LMPC Rules 2011 - Rule 6(1)(a)",
    category: "lmpc_mandatory",
    status: mfgStatus,
    severity: mfgStatus === "pass" ? "low" : "high",
    whatWasObserved: mfgValue
      ? `Manufacturer / Packer details detected: "${mfgValue}"`
      : "Manufacturer, packer, or importer name and address declaration was NOT detected on the package surface.",
    whyFlagged: mfgValue
      ? "Statutory declaration is visibly present."
      : "LMPC Rule 6(1)(a) strictly mandates every packaged commodity to carry the complete name and address of the manufacturer, packer, or importer.",
    extractedEvidence: mfgEvidence || (mfgValue ? mfgValue : "No text segment detected on package"),
    recommendedAction: mfgValue
      ? "No corrective action required for manufacturer declaration."
      : "Verify physical container or issue statutory notice for missing manufacturer details under LMPC Rule 6(1)(a).",
    analyzedField: "Manufacturer / Packer Details",
    detectedValue: mfgValue || "Not detected",
    confidence: cleanConfidence(raw.manufacturer.confidence),
    deterministicRule: "Package must clearly declare the complete legal name and postal address of the manufacturer, packer, or importer.",
    reasoning: mfgValue
      ? "Visible manufacturer/packer address satisfies Rule 6(1)(a) statutory requirement."
      : "Absence of manufacturer/packer declaration violates mandatory LMPC Rule 6(1)(a).",
    ruleId: "RULE-LMPC-6-1-A",
    ruleName: "Mandatory Manufacturer Declaration",
    ruleSource: "Ministry of Consumer Affairs, Legal Metrology Division",
    ruleReference: "Rule 6(1)(a), Packaged Commodities Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: false,
  });

  // 2. Generic Name
  const genericValue = raw.generic_name.value || raw.product_name.value || null;
  const genericEvidence = raw.generic_name.evidence || raw.product_name.evidence || null;
  const genericStatus = genericValue ? "pass" : "non_compliant";

  fields.push({
    id: "f-name",
    fieldKey: "commodity_identity",
    fieldName: "Common / Generic Name of Packaged Commodity",
    category: "lmpc_mandatory",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(b)",
    extractedValue: genericValue || "Not detected",
    confidence: cleanConfidence(raw.generic_name.confidence || raw.product_name.confidence),
    isMandatory: true,
    status: genericStatus,
    notes: genericValue ? undefined : "Generic or common name of commodity not declared on principal display panel",
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
    confidence: cleanConfidence(raw.generic_name.confidence),
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

  // 3. Net Quantity
  const netQtyValue = raw.net_quantity.value || null;
  const netQtyEvidence = raw.net_quantity.evidence || null;
  let netQtyStatus = "non_compliant";
  if (netQtyValue) {
    const hasMetricUnit = /(?:g|kg|gm|gms|grams|ml|l|ltr|litre|litres|mg|meter|metres|m|cm|mm|units|unit|N|numbers|pcs|count)\b/i.test(
      netQtyValue
    );
    netQtyStatus = hasMetricUnit ? "pass" : "review_required";
  }

  fields.push({
    id: "f-qty",
    fieldKey: "net_quantity",
    fieldName: "Net Quantity Declaration (Metric Standard Units)",
    category: "weights_measures",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(c) & Rule 7",
    extractedValue: netQtyValue || "Not detected",
    confidence: cleanConfidence(raw.net_quantity.confidence),
    isMandatory: true,
    status: netQtyStatus,
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
      : "Net quantity declaration was NOT detected on the package.",
    whyFlagged:
      netQtyStatus === "pass"
        ? "Net quantity is declared in standard metric units."
        : netQtyStatus === "review_required"
        ? "Net quantity was detected but unit of measurement requires physical verification."
        : "LMPC Rule 6(1)(c) mandates explicit declaration of net quantity in standard metric units.",
    extractedEvidence: netQtyEvidence || (netQtyValue ? netQtyValue : "No net quantity declaration detected"),
    recommendedAction:
      netQtyStatus === "pass"
        ? "Confirm font height adheres to area table in Rule 7(1)."
        : "Check physical label for net quantity in accordance with standard weight and measures specifications.",
    analyzedField: "Net Quantity",
    detectedValue: netQtyValue || "Not detected",
    confidence: cleanConfidence(raw.net_quantity.confidence),
    deterministicRule: "Net quantity must be declared in standard SI metric units (kg, g, mg, L, mL, etc.).",
    reasoning:
      netQtyStatus === "pass"
        ? "Detected net quantity adheres to standard unit specifications."
        : "Non-compliant or ambiguous net quantity violates Rule 6(1)(c).",
    ruleId: "RULE-LMPC-6-1-C",
    ruleName: "Net Quantity Declaration",
    ruleSource: "Legal Metrology Packaged Commodities Rules 2011",
    ruleReference: "Rule 6(1)(c) and Rule 7, LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: false,
  });

  // 4. MRP
  const mrpValue = raw.mrp.value || null;
  const mrpEvidence = raw.mrp.evidence || null;
  let mrpStatus = "non_compliant";
  if (mrpValue) {
    const hasTaxMention =
      raw.mrp.includes_taxes === true ||
      /(?:incl|inclusive|incl\.|including|taxes|all taxes)/i.test(mrpValue) ||
      (mrpEvidence && /(?:incl|inclusive|all taxes)/i.test(mrpEvidence));
    mrpStatus = hasTaxMention ? "pass" : "review_required";
  }

  fields.push({
    id: "f-mrp",
    fieldKey: "mrp_declaration",
    fieldName: "Maximum Retail Price (MRP Incl. of all taxes)",
    category: "lmpc_mandatory",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(d)",
    extractedValue: mrpValue || "Not detected",
    confidence: cleanConfidence(raw.mrp.confidence),
    isMandatory: true,
    status: mrpStatus,
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
      : "Maximum Retail Price (MRP) was NOT detected on the package.",
    whyFlagged:
      mrpStatus === "pass"
        ? "MRP is declared with inclusive tax wording or currency symbol."
        : mrpStatus === "review_required"
        ? "MRP is declared, but explicit 'Inclusive of all taxes' statement could not be fully confirmed."
        : "LMPC Rule 6(1)(d) strictly prohibits sale of packaged commodities without MRP.",
    extractedEvidence: mrpEvidence || (mrpValue ? mrpValue : "No price text detected"),
    recommendedAction:
      mrpStatus === "pass"
        ? "No corrective action required."
        : "Inspect package to ensure '(Inclusive of all taxes)' appears with the price.",
    analyzedField: "Maximum Retail Price (MRP)",
    detectedValue: mrpValue || "Not detected",
    confidence: cleanConfidence(raw.mrp.confidence),
    deterministicRule: "Maximum Retail Price must be declared in Indian Rupees as 'MRP ₹... (inclusive of all taxes)'.",
    reasoning:
      mrpStatus === "pass"
        ? "Declared retail price satisfies Rule 6(1)(d)."
        : "Missing or incomplete MRP fails mandatory price declaration rule.",
    ruleId: "RULE-LMPC-6-1-D",
    ruleName: "Maximum Retail Price Declaration",
    ruleSource: "Ministry of Consumer Affairs",
    ruleReference: "Rule 6(1)(d), LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: false,
  });

  // 5. Manufacturing Date
  const dateValue =
    raw.date_information.packaging_date ||
    raw.date_information.manufacturing_date ||
    raw.date_information.value ||
    null;
  const dateEvidence = raw.date_information.evidence || null;
  const dateStatus = dateValue ? "pass" : "non_compliant";

  fields.push({
    id: "f-date",
    fieldKey: "packaging_date",
    fieldName: "Month and Year of Manufacture or Packaging",
    category: "lmpc_mandatory",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(e)",
    extractedValue: dateValue || "Not detected",
    confidence: cleanConfidence(raw.date_information.confidence),
    isMandatory: true,
    status: dateStatus,
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
      : "Month and year of manufacture or packaging was NOT detected on the package.",
    whyFlagged: dateValue
      ? "Date declaration is visibly present."
      : "LMPC Rule 6(1)(e) requires the month and year of manufacture, packing, or import to be declared.",
    extractedEvidence: dateEvidence || (dateValue ? dateValue : "No date text detected"),
    recommendedAction: dateValue
      ? "No corrective action required."
      : "Examine batch coding area or crimp for laser-etched/stamped manufacturing date.",
    analyzedField: "Month & Year of Packaging",
    detectedValue: dateValue || "Not detected",
    confidence: cleanConfidence(raw.date_information.confidence),
    deterministicRule: "Month and year in which the commodity is manufactured or packed must be declared.",
    reasoning: dateValue
      ? "Date declaration satisfies statutory requirements."
      : "Absence of manufacturing date violates Rule 6(1)(e).",
    ruleId: "RULE-LMPC-6-1-E",
    ruleName: "Manufacturing Date Declaration",
    ruleSource: "Legal Metrology Rules 2011",
    ruleReference: "Rule 6(1)(e), LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: false,
  });

  // 6. Unit Sale Price (USP)
  const uspValue = raw.unit_sale_price.value || null;
  const uspEvidence = raw.unit_sale_price.evidence || null;
  const uspStatus = uspValue ? "pass" : mrpValue ? "review_required" : "non_compliant";

  fields.push({
    id: "f-usp",
    fieldKey: "unit_sale_price",
    fieldName: "Unit Sale Price (USP per g / ml / unit)",
    category: "weights_measures",
    legalReference: "LMPC (Amendment) Rules 2021 - Rule 6(11)",
    extractedValue: uspValue || "Not detected",
    confidence: cleanConfidence(raw.unit_sale_price.confidence),
    isMandatory: false,
    status: uspStatus,
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
      : "Under amended Legal Metrology Rules, packages with quantities > 1 unit/kg/L must declare unit price.",
    extractedEvidence: uspEvidence || (uspValue ? uspValue : "USP declaration not found"),
    recommendedAction: uspValue
      ? "No corrective action required."
      : "Review package net quantity to determine whether mandatory USP exemption applies.",
    analyzedField: "Unit Sale Price",
    detectedValue: uspValue || "Not detected",
    confidence: cleanConfidence(raw.unit_sale_price.confidence),
    deterministicRule: "Unit Sale Price (USP) must be declared in rupees and paise per g, ml, or number.",
    reasoning: uspValue
      ? "USP declaration complies with 2021 amended statutory rules."
      : "Missing USP requires inspector confirmation regarding package net volume.",
    ruleId: "RULE-LMPC-6-USP",
    ruleName: "Unit Sale Price Requirement",
    ruleSource: "Legal Metrology Division Notification",
    ruleReference: "Rule 6(11), LMPC (Amendment) Rules 2021",
    ruleStatus: "Active",
    hasReliableRegion: false,
  });

  // 7. Consumer Care Details
  const careValue =
    raw.consumer_care.value ||
    [raw.consumer_care.phone, raw.consumer_care.email, raw.consumer_care.address]
      .filter(Boolean)
      .join(" • ") ||
    null;
  const careEvidence = raw.consumer_care.evidence || null;
  const careStatus = careValue ? "pass" : "non_compliant";

  fields.push({
    id: "f-care",
    fieldKey: "consumer_care",
    fieldName: "Consumer Care & Grievance Redressal Mechanism",
    category: "consumer_protection",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(g)",
    extractedValue: careValue || "Not detected",
    confidence: cleanConfidence(raw.consumer_care.confidence),
    isMandatory: true,
    status: careStatus,
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
      : "Consumer care telephone, email, or contact address was NOT detected.",
    whyFlagged: careValue
      ? "Consumer care details are visibly provided."
      : "LMPC Rule 6(1)(g) mandates contact details for consumer grievance redressal.",
    extractedEvidence: careEvidence || (careValue ? careValue : "No consumer care text detected"),
    recommendedAction: careValue
      ? "No corrective action required."
      : "Verify whether consumer helpline is located on back or side panel.",
    analyzedField: "Consumer Care Contact",
    detectedValue: careValue || "Not detected",
    confidence: cleanConfidence(raw.consumer_care.confidence),
    deterministicRule: "Package must state the name, address, phone number, and email of grievance redressal.",
    reasoning: careValue
      ? "Consumer care details satisfy Rule 6(1)(g)."
      : "Missing consumer care information violates Rule 6(1)(g).",
    ruleId: "RULE-LMPC-6-1-G",
    ruleName: "Consumer Care Mandate",
    ruleSource: "Ministry of Consumer Affairs",
    ruleReference: "Rule 6(1)(g), LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: false,
  });

  // 8. Country of Origin
  const originValue = raw.country_of_origin.value || null;
  const originEvidence = raw.country_of_origin.evidence || null;
  const originStatus = originValue ? "pass" : "non_compliant";

  fields.push({
    id: "f-origin",
    fieldKey: "country_of_origin",
    fieldName: "Country of Origin Declaration",
    category: "origin_import",
    legalReference: "LMPC Rules 2011 - Rule 6(1)(h)",
    extractedValue: originValue || "Not detected",
    confidence: cleanConfidence(raw.country_of_origin.confidence),
    isMandatory: true,
    status: originStatus,
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
      : "LMPC Rule 6(1)(h) mandates Country of Origin on all goods.",
    extractedEvidence: originEvidence || (originValue ? originValue : "No origin text detected"),
    recommendedAction: originValue
      ? "No corrective action required."
      : "Check package for 'Made in [Country]' or 'Country of Origin' declaration.",
    analyzedField: "Country of Origin",
    detectedValue: originValue || "Not detected",
    confidence: cleanConfidence(raw.country_of_origin.confidence),
    deterministicRule: "Every package must clearly state the Country of Origin.",
    reasoning: originValue
      ? "Country of origin declaration satisfies Rule 6(1)(h)."
      : "Missing Country of Origin fails Rule 6(1)(h).",
    ruleId: "RULE-LMPC-6-1-H",
    ruleName: "Country of Origin Requirement",
    ruleSource: "Legal Metrology Rules 2011",
    ruleReference: "Rule 6(1)(h), LMPC Rules 2011",
    ruleStatus: "Active",
    hasReliableRegion: false,
  });

  // 9. FSSAI License Number (if Food)
  const isFoodCategory =
    raw.category.value &&
    /(?:food|beverage|snack|oil|edible|spice|tea|coffee|dairy|sweet|confectionery|grain|cereal|atta|rice|pulses|sauce|pickle)/i.test(
      raw.category.value
    );
  const fssaiValue = raw.fssai_license_number.value || null;
  const fssaiEvidence = raw.fssai_license_number.evidence || null;

  if (isFoodCategory || fssaiValue) {
    const fssaiStatus = fssaiValue ? "pass" : "review_required";
    fields.push({
      id: "f-fssai",
      fieldKey: "fssai_license",
      fieldName: "FSSAI 14-Digit License & Logo",
      category: "fssai_food_safety",
      legalReference: "FSS (Packaging and Labelling) Regulations, 2011",
      extractedValue: fssaiValue || "Not detected",
      confidence: cleanConfidence(raw.fssai_license_number.confidence),
      isMandatory: isFoodCategory || false,
      status: fssaiStatus,
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
        : "FSSAI 14-digit License Number was NOT detected on food commodity label.",
      whyFlagged: fssaiValue
        ? "Valid FSSAI license is declared."
        : "Food safety regulations require the 14-digit FSSAI license number and logo.",
      extractedEvidence: fssaiEvidence || (fssaiValue ? fssaiValue : "FSSAI license not detected"),
      recommendedAction: fssaiValue
        ? "No corrective action required."
        : "Verify FSSAI license on secondary or back panel of packaging.",
      analyzedField: "FSSAI License Number",
      detectedValue: fssaiValue || "Not detected",
      confidence: cleanConfidence(raw.fssai_license_number.confidence),
      deterministicRule: "Food items must declare the 14-digit FSSAI license number and logo.",
      reasoning: fssaiValue
        ? "FSSAI license satisfies food packaging regulation."
        : "Missing FSSAI license requires inspector verification.",
      ruleId: "RULE-FSSAI-2-3",
      ruleName: "FSSAI License Mandate",
      ruleSource: "Food Safety and Standards Authority of India",
      ruleReference: "FSS Regulations 2011",
      ruleStatus: "Active",
      hasReliableRegion: false,
    });
  }

  const passCount = findings.filter((f) => f.status === "pass").length;
  const nonCompliantCount = findings.filter((f) => f.status === "non_compliant").length;
  const reviewRequiredCount = findings.filter((f) => f.status === "review_required").length;
  const totalRulesEvaluated = findings.length;

  const complianceScore = Math.round((passCount / totalRulesEvaluated) * 100);
  const overallStatus =
    nonCompliantCount > 0 ? "non_compliant" : reviewRequiredCount > 0 ? "review_required" : "pass";

  const derivedCommodityName =
    raw.product_name.value ||
    raw.generic_name.value ||
    (fileName ? fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : "Packaged Commodity Sample");

  return {
    id: inspectionId,
    inspectionNumber,
    commodityName: derivedCommodityName,
    brandName: raw.brand_name.value || "Brand not specified",
    batchOrLotNumber: raw.batch_or_lot_number.value || "Not detected",
    manufacturerName:
      raw.manufacturer.name ||
      raw.manufacturer.full_declaration ||
      raw.packer.name ||
      raw.importer.name ||
      "Manufacturer not detected",
    category: raw.category.value || "General Packaged Commodity",
    netQuantityDeclared: raw.net_quantity.value || "Not detected",
    mrpDeclared: raw.mrp.value || "Not detected",
    unitSalePriceDeclared: raw.unit_sale_price.value || undefined,
    fssaiLicenseNo: raw.fssai_license_number.value || undefined,
    countryOfOrigin: raw.country_of_origin.value || "Not detected",
    packagingDate:
      raw.date_information.packaging_date ||
      raw.date_information.manufacturing_date ||
      raw.date_information.value ||
      undefined,
    expiryOrBestBefore: raw.date_information.expiry_or_best_before || undefined,
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
    reportNotes: `Inspected under the Legal Metrology (Packaged Commodities) Rules, 2011 and FSSAI statutory regulations. Extraction performed from high-resolution visual label image.`,
  };
}

// Safely parse request body across all serverless environments
async function parseBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  if (typeof req.on === "function" && req.readable) {
    return new Promise((resolve) => {
      let data = "";
      req.on("data", (chunk: any) => {
        data += chunk;
      });
      req.on("end", () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch {
          resolve({});
        }
      });
      req.on("error", () => resolve({}));
    });
  }

  return {};
}

function respondJson(res: any, status: number, data: any) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(status).json(data);
  }

  res.statusCode = status;
  res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.statusCode = 200;
      res.end();
      return;
    }

    if (req.method !== "POST") {
      return respondJson(res, 405, {
        success: false,
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "Only POST requests are supported for /api/analyze-label",
        },
      });
    }

    const body = await parseBody(req);
    const { image, mimeType = "image/jpeg", fileName, inspectorName, location } = body;

    if (!image || typeof image !== "string") {
      return respondJson(res, 400, {
        success: false,
        error: {
          code: "INVALID_IMAGE_PAYLOAD",
          message: "A valid base64 image string is required for label analysis.",
        },
      });
    }

    // Check Gemini API key existence
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return respondJson(res, 401, {
        success: false,
        error: {
          code: "API_KEY_ERROR",
          message:
            "GEMINI_API_KEY (or GOOGLE_API_KEY) is not configured in Vercel Environment Variables. Please go to Vercel Dashboard -> Settings -> Environment Variables and add GEMINI_API_KEY.",
        },
      });
    }

    const rawExtraction = await extractLabelWithGemini(image, mimeType);

    if (rawExtraction.image_quality && rawExtraction.image_quality.is_usable === false) {
      return respondJson(res, 422, {
        success: false,
        error: {
          code: "IMAGE_QUALITY_INSUFFICIENT",
          message:
            rawExtraction.image_quality.quality_issue ||
            "The image quality is insufficient for statutory OCR. Please provide a clear, well-lit label photo.",
        },
      });
    }

    const inspection = evaluateCompliance(
      rawExtraction,
      image.startsWith("data:") ? image : `data:${mimeType};base64,${image}`,
      fileName,
      inspectorName,
      undefined,
      location
    );

    return respondJson(res, 200, {
      success: true,
      inspectionId: inspection.id,
      inspection,
      extraction: rawExtraction,
    });
  } catch (error: any) {
    console.error("[Vercel Handler Error]:", error?.message || error);

    const errorMessage = error?.message || "An unexpected error occurred during label analysis.";
    const isApiKeyError =
      errorMessage.toLowerCase().includes("api_key") ||
      errorMessage.toLowerCase().includes("gemini_api_key");

    return respondJson(res, isApiKeyError ? 401 : 500, {
      success: false,
      error: {
        code: isApiKeyError ? "API_KEY_ERROR" : "ANALYSIS_FAILED",
        message: isApiKeyError
          ? "GEMINI_API_KEY is missing or invalid in Vercel Environment Variables. Add GEMINI_API_KEY under Vercel Settings -> Environment Variables."
          : errorMessage,
      },
    });
  }
}
