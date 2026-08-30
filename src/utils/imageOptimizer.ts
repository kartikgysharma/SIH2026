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

export async function optimizeImageForAnalysis(
  file: File,
  maxDimension = 2048,
  quality = 0.88
): Promise<OptimizedImageResult> {
  const originalSizeBytes = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate proportional downscaling if dimensions exceed maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw base64 if canvas context fails
          const rawBase64 = e.target?.result as string;
          resolve({
            base64Data: rawBase64,
            mimeType: file.type || 'image/jpeg',
            originalSizeBytes,
            optimizedSizeBytes: originalSizeBytes,
            width: img.width,
            height: img.height,
          });
          return;
        }

        // Draw with high quality interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-quality JPEG
        const optimizedBase64 = canvas.toDataURL('image/jpeg', quality);
        const approxSize = Math.round((optimizedBase64.length * 3) / 4);

        resolve({
          base64Data: optimizedBase64,
          mimeType: 'image/jpeg',
          originalSizeBytes,
          optimizedSizeBytes: approxSize,
          width,
          height,
        });
      };

      img.onerror = (err) => {
        reject(new Error('Failed to load image for processing.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
