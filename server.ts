import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { extractLabelFromImage } from "./server/geminiExtraction";
import { evaluateInspectionCompliance } from "./server/complianceEngine";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser with generous limit for high-res label images (up to 50MB)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Label Analysis Endpoint using Gemini Vision
  app.post("/api/analyze-label", async (req: Request, res: Response) => {
    try {
      const { image, mimeType = "image/jpeg", fileName, inspectorName, location } = req.body;

      console.log("[1] Label analysis request received");

      if (!image || typeof image !== "string") {
        console.warn("[Validation] Missing or invalid image payload in request");
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_IMAGE_PAYLOAD",
            message: "A valid base64 image payload is required for label analysis.",
          },
        });
        return;
      }

      console.log(`[2] Image MIME type: ${mimeType}`);
      const payloadSizeBytes = Math.round((image.length * 3) / 4);
      console.log(`[3] Image payload size: ~${Math.round(payloadSizeBytes / 1024)} KB`);

      if (payloadSizeBytes < 100) {
        res.status(400).json({
          success: false,
          error: {
            code: "IMAGE_CORRUPTED",
            message: "Uploaded image appears empty or corrupted. Please provide a clear packaging image.",
          },
        });
        return;
      }

      console.log("[4] Image successfully verified on backend. Forwarding to Gemini Vision...");
      console.log("[5] Gemini request started (Model: gemini-3.7-flash)");

      const rawExtraction = await extractLabelFromImage(image, mimeType);

      console.log("[6] Gemini response received successfully");
      console.log("[7] Structured JSON parsed and validated");

      // Check image quality evaluation from Gemini
      if (rawExtraction.image_quality && rawExtraction.image_quality.is_usable === false) {
        console.warn(`[Quality Alert] Image unusable: ${rawExtraction.image_quality.quality_issue}`);
        res.status(422).json({
          success: false,
          error: {
            code: "IMAGE_QUALITY_INSUFFICIENT",
            message:
              rawExtraction.image_quality.quality_issue ||
              "Image quality is insufficient for reliable extraction. The label text could not be clearly resolved.",
          },
        });
        return;
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

      console.log(`[8] Extracted fields & findings calculated for commodity: "${inspection.commodityName}"`);

      res.json({
        success: true,
        inspectionId: inspection.id,
        inspection,
        extraction: rawExtraction,
      });
    } catch (error: any) {
      console.error("[Error] Label extraction failed:", error?.message || error);

      let errorMessage = error?.message || "Unable to analyze this image.";
      
      // If error message is a serialized JSON object, parse it cleanly
      try {
        if (typeof errorMessage === "string" && errorMessage.trim().startsWith("{") && errorMessage.trim().endsWith("}")) {
          const parsed = JSON.parse(errorMessage.trim());
          if (parsed?.error?.message) {
            errorMessage = parsed.error.message;
          }
        }
      } catch {
        // keep errorMessage as is
      }

      const isApiKeyError = errorMessage.toLowerCase().includes("api_key") || errorMessage.toLowerCase().includes("gemini_api_key");
      const isServiceUnavailable = errorMessage.includes("503") || errorMessage.toLowerCase().includes("high demand") || errorMessage.toLowerCase().includes("unavailable");

      const statusCode = isServiceUnavailable ? 503 : isApiKeyError ? 401 : 500;
      const errorCode = isApiKeyError ? "API_KEY_ERROR" : isServiceUnavailable ? "SERVICE_UNAVAILABLE" : "ANALYSIS_FAILED";

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: isApiKeyError
            ? "Gemini API key is not configured or invalid on the server."
            : errorMessage,
        },
      });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BharatLabel AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start BharatLabel AI server:", err);
  process.exit(1);
});
