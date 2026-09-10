import express from "express";
import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { extractLabelFromImage, extractMultiSidePackage, type InputPackageImage } from "./server/geminiExtraction.js";
import { evaluateInspectionCompliance, evaluateMultiImageInspectionCompliance, type ExtractedSideInput } from "./server/complianceEngine.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser with generous limit for high-res label images (up to 50MB)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // CORS Preflight Handler for API endpoints
  app.options("/api/*", (_req: Request, res: Response) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.sendStatus(200);
  });

  // Health check endpoint
  app.get(["/api/health", "/api/health/", "/api/health.ts"], (_req: Request, res: Response) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Label Analysis Endpoint using Gemini Vision (supports single or multi-image packages)
  app.all(["/api/analyze-label", "/api/analyze-label/", "/api/analyze-label.ts"], async (req: Request, res: Response) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({
        success: false,
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "Only POST requests are supported for this endpoint.",
        },
      });
      return;
    }
    try {
      const {
        images,
        image,
        mimeType = "image/jpeg",
        fileName,
        side = "Front",
        inspectorName = "Field Metrology Officer",
        location = "Field Inspection Unit",
      } = req.body;

      console.log("[1] Package inspection request received");

      // Normalize images into an array of package sides
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
        console.warn("[Validation] Missing or invalid image payload in request");
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_IMAGE_PAYLOAD",
            message: "At least one valid packaging image payload is required for inspection.",
          },
        });
        return;
      }

      console.log(`[2] Processing ${validImages.length} package image(s): ${validImages.map((v) => v.side).join(", ")}`);

      // Extract all sides concurrently using Gemini Vision
      const sideResults = await extractMultiSidePackage(validImages);

      console.log(`[3] Gemini responses received for all ${sideResults.length} package image(s)`);

      // Prepare inputs for deterministic compliance engine
      const complianceInputs: ExtractedSideInput[] = sideResults.map((sr) => ({
        imageId: sr.imageId,
        side: sr.side,
        fileName: sr.fileName,
        imageUrl: sr.imageUrl,
        extraction: sr.extraction,
      }));

      // Execute Deterministic Compliance Engine on real extracted data
      const inspection = evaluateMultiImageInspectionCompliance(
        complianceInputs,
        inspectorName,
        undefined,
        location,
        validImages[0]?.fileName
      );

      console.log(`[4] Inspection compiled: "${inspection.commodityName}" - Score: ${inspection.complianceScore}% - Overall: ${inspection.overallStatus} (Conflicts: ${inspection.hasDeclarationConflicts ? "YES" : "NO"})`);

      res.json({
        success: true,
        inspectionId: inspection.id,
        inspection,
        extractions: sideResults.map((s) => ({ imageId: s.imageId, side: s.side, extraction: s.extraction })),
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
            ? "Vision analysis service key is not configured or invalid on the server."
            : errorMessage,
        },
      });
    }
  });

  // Catch-all handler for unmatched /api/* endpoints to ensure JSON error response instead of index.html
  app.all("/api/*", (_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: "API_ENDPOINT_NOT_FOUND",
        message: "The requested API endpoint does not exist on the server.",
      },
    });
  });

  // Robust production vs development static handling
  const candidateDistDirs = [
    path.join(process.cwd(), "dist"),
    process.cwd(),
    typeof __dirname !== "undefined" ? __dirname : "",
    typeof __dirname !== "undefined" ? path.join(__dirname, "dist") : "",
    typeof __dirname !== "undefined" ? path.resolve(__dirname, "..", "dist") : "",
  ].filter(Boolean);

  let staticDistPath: string | null = null;
  for (const dir of candidateDistDirs) {
    if (fs.existsSync(path.join(dir, "index.html"))) {
      staticDistPath = dir;
      break;
    }
  }

  const isCompiledBundle = typeof __filename !== "undefined" && __filename.endsWith(".cjs");
  const isProduction =
    isCompiledBundle ||
    process.env.NODE_ENV === "production" ||
    (staticDistPath !== null && process.env.NODE_ENV !== "development");

  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("[Server] Vite middleware mounted for development mode");
    } catch (err) {
      console.warn("[Server] Vite dev server failed to load, falling back to static assets:", err);
      if (staticDistPath) {
        app.use(express.static(staticDistPath));
        app.get("*", (_req: Request, res: Response) => {
          res.sendFile(path.join(staticDistPath!, "index.html"));
        });
      }
    }
  } else if (staticDistPath) {
    console.log(`[Server] Serving static production files from: ${staticDistPath}`);
    app.use(express.static(staticDistPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(staticDistPath!, "index.html"));
    });
  } else {
    console.warn("[Server] Dist path with index.html not found, using fallback");
    const fallbackPath = path.join(process.cwd(), "dist");
    app.use(express.static(fallbackPath));
    app.get("*", (_req: Request, res: Response) => {
      const fallbackFile = path.join(fallbackPath, "index.html");
      if (fs.existsSync(fallbackFile)) {
        res.sendFile(fallbackFile);
      } else {
        res.status(200).send("BharatLabel AI Compliance Platform is running.");
      }
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
