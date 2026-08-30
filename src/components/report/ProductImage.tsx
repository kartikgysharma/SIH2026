import React, { useState } from 'react';
import { InspectionSummary, BoundingBox } from '../../types';
import { Eye, Layers, Image as ImageIcon, ZoomIn } from 'lucide-react';

interface ProductImageProps {
  inspection: InspectionSummary;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  inspection,
  className = '',
}) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(true);

  // Extract all valid bounding boxes from findings and fields
  const boxes: BoundingBox[] = [];
  inspection.findings.forEach((f) => {
    if (f.hasReliableRegion && f.evidenceRegion) {
      boxes.push(f.evidenceRegion);
    }
  });

  inspection.fields.forEach((f) => {
    if (f.boundingBox && !boxes.some((b) => b.label === f.boundingBox?.label)) {
      boxes.push(f.boundingBox);
    }
  });

  const hasBoxes = boxes.length > 0;

  return (
    <section className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-[#0B2545]" />
          <span>3. Inspected Commodity Label Evidence Image</span>
        </h2>

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

      {/* Main Image Display Box */}
      <div className="border border-slate-300 rounded bg-slate-100 p-2 sm:p-3 flex flex-col items-center">
        <div className="relative max-w-lg w-full bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
          <img
            src={inspection.imageUrl}
            alt={`${inspection.commodityName} packaging label`}
            className="w-full h-auto object-contain max-h-[460px] mx-auto block"
            referrerPolicy="no-referrer"
          />

          {/* SVG/CSS Overlay for Verified Bounding Regions */}
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
                    width={Math.min(30, box.label.length * 2.2 + 4)}
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
        <div className="w-full max-w-lg mt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 font-mono gap-1">
          <div>
            Image File: <span className="text-slate-800 font-semibold">{inspection.id}.svg</span>
          </div>
          <div>
            Optical Status:{' '}
            <span className="text-emerald-800 font-semibold">
              {hasBoxes ? `${boxes.length} Verified Evidence Regions` : 'Original Unmodified Scan'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
