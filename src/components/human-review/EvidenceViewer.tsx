import React, { useState, useRef, useEffect } from 'react';
import { BoundingBox } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crop,
  Layers,
  Info,
  RotateCcw,
  AlertCircle,
  Eye,
  Crosshair,
} from 'lucide-react';

interface EvidenceViewerProps {
  imageUrl: string;
  evidenceRegion?: BoundingBox;
  hasReliableRegion: boolean;
  analyzedField: string;
  extractedEvidence: string;
  detectedValue: string;
  commodityName?: string;
  className?: string;
  id?: string;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  imageUrl,
  evidenceRegion,
  hasReliableRegion,
  analyzedField,
  extractedEvidence,
  detectedValue,
  commodityName,
  className = '',
  id,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isCropView, setIsCropView] = useState<boolean>(false);
  const [showHighlight, setShowHighlight] = useState<boolean>(true);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.35, 3.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.35, 0.75));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
    setIsCropView(false);
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1 && !isCropView) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Focus directly on crop if region exists and crop view toggled
  useEffect(() => {
    if (isCropView && hasReliableRegion && evidenceRegion) {
      setZoomLevel(2.2);
      // Center pan on the bounding box center
      const centerX = evidenceRegion.x + evidenceRegion.width / 2;
      const centerY = evidenceRegion.y + evidenceRegion.height / 2;
      // Normalized shift
      setPan({
        x: (50 - centerX) * 5,
        y: (50 - centerY) * 5,
      });
    } else if (!isCropView && zoomLevel > 2) {
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isCropView, hasReliableRegion, evidenceRegion]);

  return (
    <div id={id} className={`bg-white border border-slate-300 rounded-md overflow-hidden flex flex-col shadow-2xs ${className}`}>
      {/* Header Bar with Control Toolbar */}
      <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            Packaging Label Evidence
          </span>
          {hasReliableRegion && (
            <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded border border-blue-200">
              Region Mapped
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-600 px-1.5 min-w-[40px] text-center">
            {(zoomLevel * 100).toFixed(0)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom &amp; Pan"
            className="p-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {hasReliableRegion && (
            <>
              <div className="h-4 w-px bg-slate-300 mx-1" />
              <button
                type="button"
                onClick={() => setShowHighlight(!showHighlight)}
                title="Toggle Evidence Highlight"
                className={`p-1 rounded border text-[11px] font-mono flex items-center gap-1 transition-colors ${
                  showHighlight
                    ? 'bg-[#0B2545] text-white border-slate-900 font-bold'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Highlight</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCropView(!isCropView)}
                title="Crop into Evidence Area"
                className={`p-1 rounded border text-[11px] font-mono flex items-center gap-1 transition-colors ${
                  isCropView
                    ? 'bg-blue-800 text-white border-blue-900 font-bold'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Focus Region</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full aspect-4/3 min-h-[280px] sm:min-h-[340px] bg-slate-900/90 overflow-hidden flex items-center justify-center select-none ${
          zoomLevel > 1 || isCropView ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
      >
        <div
          className="relative max-w-full max-h-full transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          <img
            src={imageUrl}
            alt={commodityName || 'Inspected Product Label'}
            referrerPolicy="no-referrer"
            className="max-h-[380px] sm:max-h-[440px] w-auto object-contain rounded shadow-md pointer-events-none"
          />

          {/* Evidence Highlight Bounding Box (Only if mapped & reliable) */}
          {hasReliableRegion && evidenceRegion && showHighlight && (
            <div
              className="absolute border-2 border-rose-500 bg-rose-500/15 pointer-events-none transition-all animate-pulse"
              style={{
                left: `${evidenceRegion.x}%`,
                top: `${evidenceRegion.y}%`,
                width: `${evidenceRegion.width}%`,
                height: `${evidenceRegion.height}%`,
              }}
            >
              <div className="absolute -top-5.5 left-0 bg-rose-600 text-white text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap flex items-center gap-1">
                <span>EVIDENCE:</span>
                <span>{evidenceRegion.label || analyzedField}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pan Helper Pill if zoomed in */}
        {(zoomLevel > 1 || isCropView) && (
          <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-slate-200 text-[10px] font-mono px-2 py-1 rounded border border-slate-700 pointer-events-none">
            Drag to pan view
          </div>
        )}
      </div>

      {/* Footer Textual Evidence Region Bar */}
      <div className="bg-slate-50 border-t border-slate-200 p-3 space-y-2 text-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase text-slate-500 block">
              Extracted Evidence Text
            </span>
            <div className="font-mono font-semibold text-slate-900 mt-0.5 bg-white p-2 rounded border border-slate-200 shadow-2xs">
              {extractedEvidence || detectedValue}
            </div>
          </div>
        </div>

        {/* Note if bounding coordinates are unavailable */}
        {!hasReliableRegion && (
          <div className="flex items-start gap-1.5 text-[11px] text-slate-600 bg-amber-50/80 border border-amber-200 rounded p-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 font-semibold">Absence / Non-Spatial Evidence:</strong>{' '}
              The model scanned all visible packaging facets. The absence of the required declaration was established via comprehensive textual parsing rather than a single coordinate bounding box.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
