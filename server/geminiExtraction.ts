import { GoogleGenAI } from "@google/genai";

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

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server");
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

  // Supported model candidates with fallback priority (using active Gemini models)
  const candidateModels = [
    "gemini-3.1-flash-lite",
    "gemini-3.7-flash",
    "gemini-3.1-pro-preview",
    "gemini-flash-latest",
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    // Retry up to 2 times per model for transient errors (503, 429, UNAVAILABLE)
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
          `[Extraction Warning] Attempt ${attempt} on ${model} failed (${isRetryable ? "retryable" : "non-retryable"}):`,
          errString.slice(0, 200)
        );

        if (isRetryable && attempt < 2) {
          // Exponential backoff before retrying same model
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        } else {
          // Move to next candidate model in list
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
