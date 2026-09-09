import React, { useState } from 'react';
import { InspectionSummary, BoundingBox, PackageImage } from '../../types';
import { Eye, Layers, Image as ImageIcon, ZoomIn, Tag, Layers2 } from 'lucide-react';

interface ProductImageProps {
  inspection: InspectionSummary;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  inspection,
  className = '',
}) => {
  const packageImages: PackageImage[] =
    inspection.packageImages && inspection.packageImages.length > 0
      ? inspection.packageImages
      : [
          {
            id: 'img_1',
            url: inspection.imageUrl,
            side: 'Front',
            fileName: 'primary_label.jpg',
            isPrimary: true,
          },
        ];

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);

  const activeImage = packageImages[selectedImageIndex] || packageImages[0];

  // Extract all valid bounding boxes from findings and fields that match active image
  const boxes: BoundingBox[] = [];
  inspection.findings.forEach((f) => {
    // If finding matches this image ID or this side, or has general region
    const matchesImage =
      !f.sourceImageId ||
      f.sourceImageId === activeImage.id ||
      f.side === activeImage.side;
    if (matchesImage && f.hasReliableRegion && f.evidenceRegion) {
      boxes.push(f.evidenceRegion);
    }
  });

  inspection.fields.forEach((f) => {
    const matchesImage =
      !f.sourceImageId ||
      f.sourceImageId === activeImage.id ||
      f.side === activeImage.side;
    if (matchesImage && f.boundingBox && !boxes.some((b) => b.label === f.boundingBox?.label)) {
      boxes.push(f.boundingBox);
    }
  });

  const hasBoxes = boxes.length > 0;

  // Count declarations found on each side
  const getDeclarationsCountForSide = (sideName: string, imageId: string) => {
    return inspection.fields.filter(
      (f) =>
        (f.side === sideName || f.sourceImageId === imageId) &&
        f.extractedValue &&
        f.extractedValue !== 'Not detected'
    ).length;
  };

  return (
    <section className={`space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div>
          <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#0B2545]" />
            <span>4. Package Images ({packageImages.length} Panel{packageImages.length === 1 ? '' : 's'})</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
            All images belong to this single package inspection session.
          </p>
        </div>

        {/* View Toggle (No-print) */}
        {hasBoxes && (
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-xs no-print">
            <button
              type="button"
              onClick={() => setShowOverlay(true)}
              className={`px-2 py-0.5 rounded font-mono text-[11px] transition-all flex items-center gap-1 ${
                showOverlay
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Evidence Overlay</span>
            </button>
            <button
              type="button"
              onClick={() => setShowOverlay(false)}
              className={`px-2 py-0.5 rounded font-mono text-[11px] transition-all flex items-center gap-1 ${
                !showOverlay
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Original Image</span>
            </button>
          </div>
        )}
      </div>

      {/* Side Selector Tabs (if multi-image) */}
      {packageImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-print">
          {packageImages.map((pkgImg, idx) => {
            const isSelected = idx === selectedImageIndex;
            const declCount = getDeclarationsCountForSide(pkgImg.side, pkgImg.id);

            return (
              <button
                key={pkgImg.id || idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden border border-slate-300/60 shrink-0">
                  <img
                    src={pkgImg.url}
                    alt={pkgImg.side}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold font-mono">
                      {pkgImg.side}
                    </span>
                    {pkgImg.isPrimary && (
                      <span
                        className={`text-[9px] font-mono px-1 rounded ${
                          isSelected
                            ? 'bg-blue-500/30 text-blue-200'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        PDP
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[10px] font-mono ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {declCount} declaration{declCount === 1 ? '' : 's'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Active Image Display Box */}
      <div className="border border-slate-300 rounded-lg bg-slate-100 p-2 sm:p-4 flex flex-col items-center">
        <div className="w-full max-w-xl flex items-center justify-between mb-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded text-[11px]">
              Panel: {activeImage.side}
            </span>
            {activeImage.isPrimary && (
              <span className="text-blue-800 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[10px]">
                Principal Display Panel (PDP)
              </span>
            )}
          </div>
          <span className="text-slate-500 text-[11px]">
            Image ID: {activeImage.id}
          </span>
        </div>

        <div className="relative max-w-xl w-full bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
          <img
            src={activeImage.url}
            alt={`${inspection.commodityName} - ${activeImage.side} panel`}
            className="w-full h-auto object-contain max-h-[460px] mx-auto block"
            referrerPolicy="no-referrer"
          />

          {/* SVG/CSS Overlay for Verified Bounding Regions on this image */}
          {hasBoxes && showOverlay && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {boxes.map((box, idx) => (
                <g key={idx}>
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    fill="#3b82f6"
                    fillOpacity="0.12"
                    stroke="#1d4ed8"
                    strokeWidth="0.8"
                    strokeDasharray="2 1"
                    rx="1"
                  />
                  <rect
                    x={box.x}
                    y={Math.max(0, box.y - 4.5)}
                    width={Math.min(32, box.label.length * 2.2 + 4)}
                    height="4"
                    fill="#1e3a8a"
                    rx="0.5"
                  />
                  <text
                    x={box.x + 1}
                    y={Math.max(0, box.y - 4.5) + 3}
                    fill="#ffffff"
                    fontSize="2.4"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {box.label}
                  </text>
                </g>
              ))}
            </svg>
          )}
        </div>

        {/* Caption & Reference Information */}
        <div className="w-full max-w-xl mt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 font-mono gap-1">
          <div>
            Source File: <span className="text-slate-800 font-semibold">{activeImage.fileName || `${activeImage.side.toLowerCase()}.jpg`}</span>
          </div>
          <div>
            Optical Status:{' '}
            <span className="text-emerald-800 font-semibold">
              {hasBoxes ? `${boxes.length} Verified Evidence Regions on this panel` : 'Clear Panel Evidence'}
            </span>
          </div>
        </div>
      </div>

      {/* Print-Only Multi-Panel Grid: In PDF / Print view, all package sides are printed */}
      {packageImages.length > 1 && (
        <div className="hidden print:grid grid-cols-2 gap-4 pt-2">
          {packageImages.map((pkgImg, idx) => (
            <div key={idx} className="border border-slate-300 rounded p-2 text-center">
              <span className="font-mono font-bold text-xs block mb-1">
                Panel: {pkgImg.side} {pkgImg.isPrimary ? '(Principal Display)' : ''}
              </span>
              <img
                src={pkgImg.url}
                alt={pkgImg.side}
                className="w-full max-h-48 object-contain mx-auto"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
