import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export interface RawExtractionResult {
  product_name: {
    value: string | null;
    confidence: number | null;
    evidence: string | null;
  };
  brand_name: {
    value: string | null;
    confidence: number | null;
    evidence: string | null;
  };
  generic_name: {
    value: string | null;
    confidence: number | null;
    evidence: string | null;
  };
  category: {
    value: string | null;
    confidence: number | null;
    evidence: string | null;
  };
  net_quantity: {
    value: string | null;
    raw_numeral: string | null;
    raw_unit: string | null;
    confidence: number | null;
    evidence: string | null;
  };
  mrp: {
    value: string | null;
    raw_amount: string | null;
    includes_taxes: boolean | null;
    confidence: number | null;
    evidence: string | null;
  };
  unit_sale_price: {
    value: string | null;
    confidence: number | null;
    evidence: string | null;
  };
  manufacturer: {
    name: string | null;
    address: string | null;
    full_declaration: string | null;
    confidence: number | null;
    evidence: string | null;
  };
  packer: {
    name: string | null;
    address: string | null;
    full_declaration: string | null;
    confidence: number | null;
    evidence: string | null;
  };
  importer: {
    name: string | null;
    address: string | null;
    full_declaration: string | null;
    confidence: number | null;
    evidence: string | null;
  };
  country_of_origin: {
    value: string | null;
    confidence: number | null;
    evidence: string | null;
  };
  date_information: {
    value: string | null;
    manufacturing_date: string | null;
    packaging_date: string | null;
    expiry_or_best_before: string | null;
    confidence: number | null;
    evidence: string | null;
  };
  batch_or_lot_number: {
    value: string | null;
    confidence: number | null;
    evidence: string | null;
  };
  consumer_care: {
    value: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    confidence: number | null;
    evidence: string | null;
  };
  fssai_license_number: {
    value: string | null;
    confidence: number | null;
    evidence: string | null;
  };
  other_declarations: Array<{
    label: string;
    value: string;
    evidence: string;
  }>;
  possible_tampering_detections?: Array<{
    affected_field: string;
    has_possible_oversticker: boolean;
    confidence: number | null;
    indicators: string[];
    evidence_region: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null;
    message: string;
    underlying_text_visible: boolean;
    underlying_text_note: string;
  }>;
  image_quality: {
    is_usable: boolean;
    quality_issue: string | null;
    blur_detected: boolean;
    glare_detected: boolean;
    text_legible: boolean;
  };
  overall_extraction_confidence: number | null;
}

let aiClient: GoogleGenAI | null = null;

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
      return key.trim().replace(/^["']|["']$/g, "");
    }
  }

  return "";
}

export function normalizeRawExtraction(parsed: any): RawExtractionResult {
  const normField = (field: any) => {
    if (field === null || field === undefined) {
      return { value: null, confidence: null, evidence: null };
    }
    if (typeof field === "string" || typeof field === "number" || typeof field === "boolean") {
      const s = String(field);
      return { value: s, confidence: 0.9, evidence: s };
    }
    return {
      value: field.value !== undefined && field.value !== null ? String(field.value) : null,
      confidence: typeof field.confidence === "number" && !isNaN(field.confidence) ? field.confidence : null,
      evidence: field.evidence ? String(field.evidence) : null,
    };
  };

  const normEntity = (entity: any) => {
    if (entity === null || entity === undefined) {
      return { name: null, address: null, full_declaration: null, confidence: null, evidence: null };
    }
    if (typeof entity === "string") {
      return { name: entity, address: null, full_declaration: entity, confidence: 0.9, evidence: entity };
    }
    return {
      name: entity.name ? String(entity.name) : null,
      address: entity.address ? String(entity.address) : null,
      full_declaration: entity.full_declaration ? String(entity.full_declaration) : null,
      confidence: typeof entity.confidence === "number" && !isNaN(entity.confidence) ? entity.confidence : null,
      evidence: entity.evidence ? String(entity.evidence) : null,
    };
  };

  const normNetQty = (qty: any) => {
    if (qty === null || qty === undefined) {
      return { value: null, raw_numeral: null, raw_unit: null, confidence: null, evidence: null };
    }
    if (typeof qty === "string") {
      return { value: qty, raw_numeral: null, raw_unit: null, confidence: 0.9, evidence: qty };
    }
    return {
      value: qty.value !== undefined && qty.value !== null ? String(qty.value) : null,
      raw_numeral: qty.raw_numeral ? String(qty.raw_numeral) : null,
      raw_unit: qty.raw_unit ? String(qty.raw_unit) : null,
      confidence: typeof qty.confidence === "number" && !isNaN(qty.confidence) ? qty.confidence : null,
      evidence: qty.evidence ? String(qty.evidence) : null,
    };
  };

  const normMrp = (mrp: any) => {
    if (mrp === null || mrp === undefined) {
      return { value: null, raw_amount: null, includes_taxes: null, confidence: null, evidence: null };
    }
    if (typeof mrp === "string" || typeof mrp === "number") {
      const valStr = String(mrp);
      const incl = /(?:incl|inclusive|tax)/i.test(valStr);
      return { value: valStr, raw_amount: valStr, includes_taxes: incl, confidence: 0.9, evidence: valStr };
    }
    return {
      value: mrp.value !== undefined && mrp.value !== null ? String(mrp.value) : null,
      raw_amount: mrp.raw_amount ? String(mrp.raw_amount) : null,
      includes_taxes: typeof mrp.includes_taxes === "boolean" ? mrp.includes_taxes : null,
      confidence: typeof mrp.confidence === "number" && !isNaN(mrp.confidence) ? mrp.confidence : null,
      evidence: mrp.evidence ? String(mrp.evidence) : null,
    };
  };

  const normDate = (date: any) => {
    if (date === null || date === undefined) {
      return { value: null, manufacturing_date: null, packaging_date: null, expiry_or_best_before: null, confidence: null, evidence: null };
    }
    if (typeof date === "string") {
      return { value: date, manufacturing_date: date, packaging_date: null, expiry_or_best_before: null, confidence: 0.9, evidence: date };
    }
    return {
      value: date.value !== undefined && date.value !== null ? String(date.value) : null,
      manufacturing_date: date.manufacturing_date ? String(date.manufacturing_date) : null,
      packaging_date: date.packaging_date ? String(date.packaging_date) : null,
      expiry_or_best_before: date.expiry_or_best_before ? String(date.expiry_or_best_before) : null,
      confidence: typeof date.confidence === "number" && !isNaN(date.confidence) ? date.confidence : null,
      evidence: date.evidence ? String(date.evidence) : null,
    };
  };

  const normConsumerCare = (care: any) => {
    if (care === null || care === undefined) {
      return { value: null, phone: null, email: null, address: null, confidence: null, evidence: null };
    }
    if (typeof care === "string") {
      return { value: care, phone: null, email: null, address: null, confidence: 0.9, evidence: care };
    }
    return {
      value: care.value !== undefined && care.value !== null ? String(care.value) : null,
      phone: care.phone ? String(care.phone) : null,
      email: care.email ? String(care.email) : null,
      address: care.address ? String(care.address) : null,
      confidence: typeof care.confidence === "number" && !isNaN(care.confidence) ? care.confidence : null,
      evidence: care.evidence ? String(care.evidence) : null,
    };
  };

  const normTampering = (detections: any) => {
    if (!Array.isArray(detections)) return [];
    return detections
      .filter((d: any) => d && typeof d === "object")
      .map((d: any) => ({
        affected_field: d.affected_field ? String(d.affected_field) : "Statutory Declaration",
        has_possible_oversticker: Boolean(d.has_possible_oversticker ?? true),
        confidence: typeof d.confidence === "number" && !isNaN(d.confidence) ? d.confidence : null,
        indicators: Array.isArray(d.indicators) ? d.indicators.map(String) : [],
        evidence_region: d.evidence_region && typeof d.evidence_region === "object" ? d.evidence_region : null,
        message: d.message ? String(d.message) : "Possible over-sticker or label tampering detected.",
        underlying_text_visible: Boolean(d.underlying_text_visible),
        underlying_text_note: d.underlying_text_note ? String(d.underlying_text_note) : "",
      }));
  };

  const normQuality = (quality: any) => {
    if (!quality || typeof quality !== "object") {
      return { is_usable: true, quality_issue: null, blur_detected: false, glare_detected: false, text_legible: true };
    }
    return {
      is_usable: quality.is_usable !== false,
      quality_issue: quality.quality_issue ? String(quality.quality_issue) : null,
      blur_detected: Boolean(quality.blur_detected),
      glare_detected: Boolean(quality.glare_detected),
      text_legible: quality.text_legible !== false,
    };
  };

  const safe = parsed && typeof parsed === "object" ? parsed : {};

  return {
    product_name: normField(safe.product_name),
    brand_name: normField(safe.brand_name),
    generic_name: normField(safe.generic_name),
    category: normField(safe.category),
    net_quantity: normNetQty(safe.net_quantity),
    mrp: normMrp(safe.mrp),
    unit_sale_price: normField(safe.unit_sale_price),
    manufacturer: normEntity(safe.manufacturer),
    packer: normEntity(safe.packer),
    importer: normEntity(safe.importer),
    country_of_origin: normField(safe.country_of_origin),
    date_information: normDate(safe.date_information),
    batch_or_lot_number: normField(safe.batch_or_lot_number),
    consumer_care: normConsumerCare(safe.consumer_care),
    fssai_license_number: normField(safe.fssai_license_number),
    other_declarations: Array.isArray(safe.other_declarations) ? safe.other_declarations : [],
    possible_tampering_detections: normTampering(safe.possible_tampering_detections),
    image_quality: normQuality(safe.image_quality),
    overall_extraction_confidence:
      typeof safe.overall_extraction_confidence === "number" && !isNaN(safe.overall_extraction_confidence)
        ? safe.overall_extraction_confidence
        : null,
  };
}

function getAiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is not configured on the server");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
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
9. LABEL TAMPERING & OVER-STICKER DETECTION:
Carefully inspect the image for visual indicators that a label declaration has been covered, modified, or replaced by an over-sticker, sticker patch, tape, or printed overlay.
Visual indicators include:
- Rectangular or irregular sticker boundaries or border seams
- Sudden changes in color, texture, or substrate sheen/gloss
- Surface inconsistencies, elevated edges, or shadows along sticker borders
- Text appearing on a visually distinct surface/overlay
- Important declarations (MRP, Net Quantity, Dates, Manufacturer Details, Consumer Care) being partially or fully obscured
CAUTIOUS LANGUAGE: Always use cautious terminology ('Possible Over-Sticker', 'Possible Label Tampering', 'Suspicious Overlay', 'Review Required'). NEVER state 'Fraud Confirmed' or 'Tampering Confirmed'.
UNDERLYING TEXT: A standard RGB photograph cannot reliably recover text hidden underneath an opaque sticker. If the original text is not visible, DO NOT guess or hallucinate it. Set "underlying_text_visible" to false and "underlying_text_note" to "Underlying text is not visible in the supplied image."
If no over-sticker is detected, return an empty array [] for "possible_tampering_detections".

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
  "possible_tampering_detections": [
    {
      "affected_field": string,
      "has_possible_oversticker": boolean,
      "confidence": number (0-1) | null,
      "indicators": [string],
      "evidence_region": { "x": number, "y": number, "width": number, "height": number } | null,
      "message": string,
      "underlying_text_visible": boolean,
      "underlying_text_note": string
    }
  ],
  "image_quality": { "is_usable": boolean, "quality_issue": string | null, "blur_detected": boolean, "glare_detected": boolean, "text_legible": boolean },
  "overall_extraction_confidence": number (0-1) | null
}`;

export async function extractLabelFromImage(
  base64Data: string,
  mimeType: string = "image/jpeg"
): Promise<RawExtractionResult> {
  const ai = getAiClient();

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

  // Supported model candidates with fallback priority (prioritizing fast, high-availability flash vision models)
  const candidateModels = [
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-flash-latest",
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    // Attempt extraction on candidate model
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Extraction Attempt] Model: ${model}, Attempt: ${attempt}`);
        const response = await ai.models.generateContent({
          model,
          contents: { parts: [imagePart, textPart] },
          config: {
            systemInstruction: EXTRACTION_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            temperature: 0.1, // low temperature for precise factual extraction
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error("Empty response received from Gemini Vision model");
        }

        const parsedJson = JSON.parse(responseText.trim());
        const normalized = normalizeRawExtraction(parsedJson);
        return normalized;
      } catch (err: any) {
        lastError = err;
        const errString = String(err?.message || err);
        const isHighDemandOrUnavailable =
          errString.includes("503") ||
          errString.includes("UNAVAILABLE") ||
          errString.includes("high demand");
        const isRateLimited =
          errString.includes("429") ||
          errString.includes("RESOURCE_EXHAUSTED") ||
          errString.includes("quota");
        const isNotFoundOrDeprecated =
          errString.includes("404") ||
          errString.includes("NOT_FOUND") ||
          errString.includes("no longer available");

        console.warn(
          `[Extraction Warning] Attempt ${attempt} on ${model} failed (${isHighDemandOrUnavailable ? "high-demand" : isRateLimited ? "rate-limited" : isNotFoundOrDeprecated ? "deprecated" : "error"}):`,
          errString.slice(0, 200)
        );

        // If the model is experiencing high demand (503), rate-limiting (429), or is deprecated (404),
        // fail over immediately to the next candidate model to avoid stalling the user.
        if (isHighDemandOrUnavailable || isRateLimited || isNotFoundOrDeprecated) {
          console.log(`[Failover] Model ${model} is unavailable or exhausted. Failing over immediately to next model candidate.`);
          break;
        }

        if (attempt < 2) {
          // Brief 300ms micro-pause before single retry for transient socket errors
          await new Promise((resolve) => setTimeout(resolve, 300));
        } else {
          break;
        }
      }
    }
  }

  // If all candidate models and retries failed, parse and rethrow with clean message
  let cleanMsg = "AI Vision service is temporarily experiencing high load. Please try again.";
  if (lastError) {
    try {
      const rawMsg = lastError.message || String(lastError);
      if (rawMsg.startsWith("{") && rawMsg.endsWith("}")) {
        const parsed = JSON.parse(rawMsg);
        if (parsed?.error?.message) {
          cleanMsg = parsed.error.message;
        }
      } else if (rawMsg.includes("503") || rawMsg.includes("high demand")) {
        cleanMsg = "Gemini Vision service is experiencing temporary high traffic. Please retry in a few moments.";
      } else {
        cleanMsg = rawMsg;
      }
    } catch {
      cleanMsg = lastError.message || "Failed to analyze packaging label.";
    }
  }

  throw new Error(cleanMsg);
}
