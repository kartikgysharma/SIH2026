import type { IncomingMessage, ServerResponse } from "http";
import { extractLabelFromImage } from "../server/geminiExtraction";
import { evaluateInspectionCompliance } from "../server/complianceEngine";

// Helper for parsing body in various serverless runtimes
async function getRequestBody(req: any): Promise<any> {
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

function sendResponse(res: any, statusCode: number, payload: any) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(payload);
  }
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.end(JSON.stringify(payload));
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    return sendResponse(res, 405, {
      success: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Only POST requests are supported for /api/analyze-label.",
      },
    });
  }

  try {
    const body = await getRequestBody(req);
    const { image, mimeType = "image/jpeg", fileName, inspectorName, location } = body;

    console.log("[Vercel API] Label analysis request received");

    if (!image || typeof image !== "string") {
      return sendResponse(res, 400, {
        success: false,
        error: {
          code: "INVALID_IMAGE_PAYLOAD",
          message: "A valid base64 image payload is required for label analysis.",
        },
      });
    }

    const payloadSizeBytes = Math.round((image.length * 3) / 4);
    if (payloadSizeBytes < 100) {
      return sendResponse(res, 400, {
        success: false,
        error: {
          code: "IMAGE_CORRUPTED",
          message: "Uploaded image appears empty or corrupted. Please provide a clear packaging image.",
        },
      });
    }

    // Check Gemini API key existence
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[Vercel API Error] GEMINI_API_KEY is not defined in environment variables");
      return sendResponse(res, 401, {
        success: false,
        error: {
          code: "API_KEY_ERROR",
          message:
            "GEMINI_API_KEY environment variable is not configured in your Vercel project settings. Please add GEMINI_API_KEY in Vercel Project Settings -> Environment Variables.",
        },
      });
    }

    console.log("[Vercel API] Extracting declarations via Gemini Vision...");
    const rawExtraction = await extractLabelFromImage(image, mimeType);

    // Check image quality evaluation from Gemini
    if (rawExtraction.image_quality && rawExtraction.image_quality.is_usable === false) {
      return sendResponse(res, 422, {
        success: false,
        error: {
          code: "IMAGE_QUALITY_INSUFFICIENT",
          message:
            rawExtraction.image_quality.quality_issue ||
            "Image quality is insufficient for reliable extraction. The label text could not be clearly resolved.",
        },
      });
    }

    // Execute Deterministic Compliance Engine on real extracted data
    const inspection = evaluateInspectionCompliance(
      rawExtraction,
      image.startsWith("data:") ? image : `data:${mimeType};base64,${image}`,
      fileName,
      inspectorName,
      undefined,
      location
    );

    return sendResponse(res, 200, {
      success: true,
      inspectionId: inspection.id,
      inspection,
      extraction: rawExtraction,
    });
  } catch (error: any) {
    console.error("[Vercel API Error] Analysis failed:", error?.message || error);

    let errorMessage = error?.message || "Unable to analyze this image.";

    try {
      if (
        typeof errorMessage === "string" &&
        errorMessage.trim().startsWith("{") &&
        errorMessage.trim().endsWith("}")
      ) {
        const parsed = JSON.parse(errorMessage.trim());
        if (parsed?.error?.message) {
          errorMessage = parsed.error.message;
        }
      }
    } catch {
      // keep errorMessage as is
    }

    const isApiKeyError =
      errorMessage.toLowerCase().includes("api_key") ||
      errorMessage.toLowerCase().includes("gemini_api_key");
    const isServiceUnavailable =
      errorMessage.includes("503") ||
      errorMessage.toLowerCase().includes("high demand") ||
      errorMessage.toLowerCase().includes("unavailable");

    const statusCode = isServiceUnavailable ? 503 : isApiKeyError ? 401 : 500;
    const errorCode = isApiKeyError
      ? "API_KEY_ERROR"
      : isServiceUnavailable
      ? "SERVICE_UNAVAILABLE"
      : "ANALYSIS_FAILED";

    return sendResponse(res, statusCode, {
      success: false,
      error: {
        code: errorCode,
        message: isApiKeyError
          ? "Gemini API key is not configured or invalid on Vercel. Please configure GEMINI_API_KEY in Vercel settings."
          : errorMessage,
      },
    });
  }
}
