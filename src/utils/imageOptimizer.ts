/**
 * Client-side image optimization helper for high-resolution packaging label photos.
 * Ensures the image preserves sharp text legibility for Legal Metrology OCR
 * while keeping the payload well under serverless / Vercel body limits (4.5MB).
 */

export interface OptimizedImageResult {
  base64Data: string; // "data:image/jpeg;base64,..."
  mimeType: string;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  width: number;
  height: number;
}

const VERCEL_SAFE_IMAGE_LIMIT_BYTES = 2.2 * 1024 * 1024; // 2.2 MB max base64 per image

export async function optimizeImageForAnalysis(
  file: File,
  maxDimension = 1280,
  quality = 0.80
): Promise<OptimizedImageResult> {
  const originalSizeBytes = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let currentMaxDim = maxDimension;
        let currentQuality = quality;

        let width = img.width;
        let height = img.height;

        if (width > currentMaxDim || height > currentMaxDim) {
          if (width > height) {
            height = Math.round((height * currentMaxDim) / width);
            width = currentMaxDim;
          } else {
            width = Math.round((width * currentMaxDim) / height);
            height = currentMaxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          const rawBase64 = e.target?.result as string;
          resolve({
            base64Data: rawBase64,
            mimeType: file.type || "image/jpeg",
            originalSizeBytes,
            optimizedSizeBytes: originalSizeBytes,
            width: img.width,
            height: img.height,
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        let optimizedBase64 = canvas.toDataURL("image/jpeg", currentQuality);
        let approxSize = Math.round((optimizedBase64.length * 3) / 4);

        // Multi-pass compression safeguard if base64 still exceeds 2.2MB
        let passes = 0;
        while (approxSize > VERCEL_SAFE_IMAGE_LIMIT_BYTES && passes < 3) {
          passes++;
          currentMaxDim = Math.round(currentMaxDim * 0.8); // Reduce dimensions 20%
          currentQuality = Math.max(0.65, currentQuality - 0.1);

          let newWidth = img.width;
          let newHeight = img.height;
          if (newWidth > currentMaxDim || newHeight > currentMaxDim) {
            if (newWidth > newHeight) {
              newHeight = Math.round((newHeight * currentMaxDim) / newWidth);
              newWidth = currentMaxDim;
            } else {
              newWidth = Math.round((newWidth * currentMaxDim) / newHeight);
              newHeight = currentMaxDim;
            }
          }

          canvas.width = newWidth;
          canvas.height = newHeight;

          const passCtx = canvas.getContext("2d");
          if (passCtx) {
            passCtx.imageSmoothingEnabled = true;
            passCtx.imageSmoothingQuality = "high";
            passCtx.drawImage(img, 0, 0, newWidth, newHeight);
            optimizedBase64 = canvas.toDataURL("image/jpeg", currentQuality);
            approxSize = Math.round((optimizedBase64.length * 3) / 4);
            width = newWidth;
            height = newHeight;
          }
        }

        resolve({
          base64Data: optimizedBase64,
          mimeType: "image/jpeg",
          originalSizeBytes,
          optimizedSizeBytes: approxSize,
          width,
          height,
        });
      };

      img.onerror = () => {
        reject(new Error("Failed to load image for processing."));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
