import { extractMultiSidePackage, type InputPackageImage } from "../server/geminiExtraction.ts";
import { evaluateMultiImageInspectionCompliance, type ExtractedSideInput } from "../server/complianceEngine.ts";

async function parseBody(req: any): Promise<any> {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string" && req.body.length > 0) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  // If body is a stream (Node IncomingMessage in custom serverless)
  if (typeof req.on === "function") {
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
    const {
      images,
      image,
      mimeType = "image/jpeg",
      fileName,
      side = "Front",
      inspectorName = "Field Metrology Officer",
      location = "Field Inspection Unit",
    } = body;

    // Normalize images into an array of package sides (supports both multi-image array and single-image legacy formats)
    let rawImageItems: Array<{
      id: string;
      side: string;
      base64Data: string;
      mimeType?: string;
      fileName?: string;
    }> = [];

    if (Array.isArray(images) && images.length > 0) {
      rawImageItems = images.map((img: any, idx: number) => ({
        id: img.id || `img_${idx + 1}`,
        side: img.side || (idx === 0 ? "Front" : "Other"),
        base64Data: img.base64Data || img.image || img.dataUrl || "",
        mimeType: img.mimeType || "image/jpeg",
        fileName: img.fileName || `package_side_${idx + 1}.jpg`,
      }));
    } else if (image && typeof image === "string") {
      rawImageItems = [
        {
          id: "img_1",
          side: side || "Front",
          base64Data: image,
          mimeType: mimeType || "image/jpeg",
          fileName: fileName || "package_front.jpg",
        },
      ];
    }

    // Filter out any empty payload items
    const validImages: InputPackageImage[] = rawImageItems.filter(
      (img) => img.base64Data && img.base64Data.length > 50
    );

    if (validImages.length === 0) {
      console.warn("[Validation] Missing or invalid image payload in Vercel request");
      return respondJson(res, 400, {
        success: false,
        error: {
          code: "INVALID_IMAGE_PAYLOAD",
          message: "At least one valid packaging image payload is required for inspection.",
        },
      });
    }

    console.log(
      `[Vercel Handler] Processing ${validImages.length} package image(s): ${validImages.map((v) => v.side).join(", ")}`
    );

    // Extract all sides concurrently using fast vision extraction
    const sideResults = await extractMultiSidePackage(validImages);

    // Prepare inputs for deterministic compliance engine
    const complianceInputs: ExtractedSideInput[] = sideResults.map((sr) => ({
      imageId: sr.imageId,
      side: sr.side,
      fileName: sr.fileName,
      imageUrl: sr.imageUrl,
      extraction: sr.extraction,
    }));

    // Evaluate holistic compliance across all package faces
    const inspection = evaluateMultiImageInspectionCompliance(
      complianceInputs,
      inspectorName,
      "LM-INSP-STATUTORY",
      location,
      validImages[0]?.fileName
    );

    return respondJson(res, 200, {
      success: true,
      inspectionId: inspection.id,
      inspection,
      sideResults,
      extraction: sideResults[0]?.extraction,
    });
  } catch (error: any) {
    console.error("[Vercel Handler Error]:", error?.message || error);

    const rawError = error?.message || String(error || "");
    const isApiKeyError =
      rawError.toLowerCase().includes("api_key") ||
      rawError.toLowerCase().includes("gemini_api_key") ||
      rawError.toLowerCase().includes("google_api_key") ||
      rawError.toLowerCase().includes("key is missing") ||
      rawError.toLowerCase().includes("not configured") ||
      rawError.includes("API key not valid") ||
      rawError.includes("API_KEY_INVALID");

    const isQuotaOrRateLimit =
      rawError.includes("429") ||
      rawError.includes("RESOURCE_EXHAUSTED") ||
      rawError.toLowerCase().includes("quota");

    let statusCode = 500;
    let errorCode = "ANALYSIS_FAILED";
    let userMessage = rawError || "An unexpected error occurred during package analysis.";

    if (isApiKeyError) {
      statusCode = 401;
      errorCode = "API_KEY_ERROR";
      userMessage =
        "The API Key (GEMINI_API_KEY) in your Vercel Environment Variables is missing or invalid. Please check your Vercel Project Settings > Environment Variables, save the key, and Redeploy.";
    } else if (isQuotaOrRateLimit) {
      statusCode = 429;
      errorCode = "RATE_LIMIT_EXCEEDED";
      userMessage =
        "The upstream vision processing quota was temporarily exceeded. Please retry in a few moments.";
    }

    return respondJson(res, statusCode, {
      success: false,
      error: {
        code: errorCode,
        message: userMessage,
        details: rawError,
      },
    });
  }
}
