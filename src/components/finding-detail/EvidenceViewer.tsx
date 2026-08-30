import React, { useState, useRef } from 'react';
import { BoundingBox, ComplianceStatus } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Contrast,
  Crosshair,
  Eye,
  AlertCircle,
  Crop,
  Search,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
} from 'lucide-react';

interface EvidenceViewerProps {
  imageUrl: string;
  commodityName: string;
  evidenceRegion?: BoundingBox;
  hasReliableRegion?: boolean;
  status: ComplianceStatus;
  analyzedField: string;
  detectedValue: string;
  textualExplanation: string;
  allBoundingBoxes?: {
    id: string;
    box: BoundingBox;
    status: ComplianceStatus;
    text: string;
  }[];
  className?: string;
  id?: string;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  imageUrl,
  commodityName,
  evidenceRegion,
  hasReliableRegion = true,
  status,
  analyzedField,
  detectedValue,
  textualExplanation,
  allBoundingBoxes = [],
  className = '',
  id,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isCropFocus, setIsCropFocus] = useState<boolean>(false);
  const [showAllRegions, setShowAllRegions] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setIsCropFocus(false);
  };

  const getRegionBorder = () => {
    if (status === 'pass') {
      return 'border-emerald-500 bg-emerald-500/25 ring-4 ring-emerald-400/40 shadow-lg';
    }
    if (status === 'non_compliant') {
      return 'border-rose-500 bg-rose-500/25 ring-4 ring-rose-500/40 shadow-lg';
    }
    return 'border-amber-500 bg-amber-500/25 ring-4 ring-amber-400/40 shadow-lg';
  };

  const getRegionBadge = () => {
    if (status === 'pass') {
      return 'bg-emerald-700 text-white';
    }
    if (status === 'non_compliant') {
      return 'bg-rose-700 text-white';
    }
    return 'bg-amber-600 text-white';
  };

  // Determine if we should show the region
  const hasCoordinates = hasReliableRegion && !!evidenceRegion;

  return (
    <div
      id={id}
      className={`flex flex-col bg-slate-900 border border-slate-700 rounded-md overflow-hidden shadow-sm ${className}`}
    >
      {/* Evidence Viewer Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2 min-w-0">
          <Eye className="w-4 h-4 text-blue-300 shrink-0" />
          <div className="truncate">
            <span className="font-semibold text-slate-200">
              Primary Evidence Workspace
            </span>
            <span className="text-[11px] text-slate-400 ml-1.5 hidden sm:inline">
              ({analyzedField})
            </span>
          </div>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Crop focus toggle */}
          {hasCoordinates && (
            <button
              type="button"
              title="Toggle Spot Focus on Evidence Region"
              onClick={() => {
                setIsCropFocus(!isCropFocus);
                if (!isCropFocus) setZoomLevel(1.8);
                else setZoomLevel(1);
              }}
              className={`p-1.5 rounded transition-colors text-xs flex items-center gap-1 ${
                isCropFocus
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Region Focus</span>
            </button>
          )}

          {/* High Contrast / Grayscale Toggle */}
          <button
            type="button"
            title="Toggle High-Contrast / Grayscale Filter for Micro-text"
            onClick={() => setIsHighContrast(!isHighContrast)}
            className={`p-1.5 rounded transition-colors ${
              isHighContrast
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Contrast className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Zoom Out */}
          <button
            type="button"
            title="Zoom Out"
            disabled={zoomLevel <= 1}
            onClick={handleZoomOut}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-[11px] text-slate-400 w-8 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>

          {/* Zoom In */}
          <button
            type="button"
            title="Zoom In"
            disabled={zoomLevel >= 3}
            onClick={handleZoomIn}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {zoomLevel > 1 && (
            <button
              type="button"
              title="Reset Zoom"
              onClick={handleResetZoom}
              className="p-1.5 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 ml-1"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas / Image Canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[360px] max-h-[560px] bg-slate-950 overflow-auto flex items-center justify-center p-4"
      >
        <div
          className="relative inline-block transition-transform duration-200 origin-center max-w-full"
          style={{
            transform: `scale(${zoomLevel})`,
            filter: isHighContrast ? 'contrast(160%) grayscale(80%)' : 'none',
          }}
        >
          {/* Packaging Image */}
          <img
            src={imageUrl}
            alt={`Evidence for ${commodityName}`}
            className="max-h-[460px] w-auto object-contain rounded border border-slate-800 bg-slate-900 select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Targeted Evidence Bounding Box Overlay */}
          {hasCoordinates && evidenceRegion && (
            <div
              style={{
                left: `${evidenceRegion.x}%`,
                top: `${evidenceRegion.y}%`,
                width: `${evidenceRegion.width}%`,
                height: `${evidenceRegion.height}%`,
              }}
              className={`absolute border-2 cursor-pointer transition-all duration-200 rounded-[2px] z-20 ${getRegionBorder()}`}
            >
              {/* Region Label Tag */}
              <div
                className={`absolute -top-5 left-0 z-30 whitespace-nowrap text-[9px] font-mono px-1.5 py-0.5 rounded shadow font-bold flex items-center gap-1 ${getRegionBadge()}`}
              >
                <Crosshair className="w-2.5 h-2.5" />
                <span>{evidenceRegion.label || analyzedField}</span>
              </div>

              {/* Pulse Indicator on Target Area */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    status === 'pass'
                      ? 'bg-emerald-400'
                      : status === 'non_compliant'
                      ? 'bg-rose-400'
                      : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    status === 'pass'
                      ? 'bg-emerald-500'
                      : status === 'non_compliant'
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Region Status Bottom Strip */}
      <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 text-xs">
        {hasCoordinates ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
              <span className="font-semibold text-slate-200">
                Target Region Highlighted:
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                ({evidenceRegion?.x.toFixed(0)}%, {evidenceRegion?.y.toFixed(0)}%) • {evidenceRegion?.label}
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              Where the system located evidence anchors
            </span>
          </div>
        ) : (
          /* When no reliable region is available */
          <div className="flex items-start gap-2.5 text-slate-300 bg-slate-900/90 border border-slate-800 rounded p-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200 block text-xs">
                Specific evidence region could not be determined.
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The optical recognition pipeline evaluated the entire label area and did not detect localized spatial bounding coordinates for &quot;{analyzedField}&quot;. {textualExplanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
