import React, { useState, useRef } from 'react';
import { BoundingBox, ComplianceStatus } from '../types';
import { ZoomIn, ZoomOut, Maximize2, Contrast, Crosshair, Eye } from 'lucide-react';
import { Badge } from '../design-system/Badge';

interface InspectionImageViewerProps {
  imageUrl: string;
  commodityName: string;
  boundingBoxes: {
    id: string;
    box: BoundingBox;
    status: ComplianceStatus;
    text: string;
  }[];
  activeBoxId?: string;
  onSelectBox?: (id: string) => void;
  className?: string;
  id?: string;
}

export const InspectionImageViewer: React.FC<InspectionImageViewerProps> = ({
  imageUrl,
  commodityName,
  boundingBoxes,
  activeBoxId,
  onSelectBox,
  className = '',
  id,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [hoveredBox, setHoveredBox] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => setZoomLevel(1);

  const getStatusBorder = (status: ComplianceStatus, isSelected: boolean, isHovered: boolean) => {
    if (isSelected || isHovered) {
      if (status === 'pass') return 'border-emerald-500 bg-emerald-500/20 ring-2 ring-emerald-400';
      if (status === 'non_compliant') return 'border-rose-600 bg-rose-500/25 ring-2 ring-rose-500';
      return 'border-amber-500 bg-amber-500/25 ring-2 ring-amber-400';
    }

    if (status === 'pass') return 'border-emerald-500/80 bg-emerald-500/10 hover:bg-emerald-500/20';
    if (status === 'non_compliant') return 'border-rose-600/90 bg-rose-500/15 hover:bg-rose-500/30';
    return 'border-amber-500/90 bg-amber-500/15 hover:bg-amber-500/30';
  };

  return (
    <div
      id={id}
      className={`flex flex-col bg-slate-900 border border-slate-700 rounded-md overflow-hidden shadow-sm ${className}`}
    >
      {/* Viewer Header / Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-200 truncate max-w-[200px]">
            Label Image Evidence
          </span>
          <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
            {boundingBoxes.length} Regions
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Toggle Bounding Overlays"
            onClick={() => setShowOverlays(!showOverlays)}
            className={`p-1.5 rounded transition-colors ${
              showOverlays
                ? 'bg-slate-800 text-blue-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

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
              onClick={handleResetZoom}
              className="p-1.5 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 ml-1"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas / Image Area */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[340px] max-h-[520px] bg-slate-950/90 overflow-auto flex items-center justify-center p-3"
      >
        <div
          className="relative inline-block transition-transform duration-200 origin-center max-w-full"
          style={{
            transform: `scale(${zoomLevel})`,
            filter: isHighContrast ? 'contrast(160%) grayscale(80%)' : 'none',
          }}
        >
          <img
            src={imageUrl}
            alt={`Packaged label inspection: ${commodityName}`}
            className="max-h-[460px] w-auto object-contain rounded border border-slate-800 bg-slate-900 select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Bounding Box Overlays */}
          {showOverlays &&
            boundingBoxes.map((item) => {
              const isSelected = activeBoxId === item.id;
              const isHovered = hoveredBox === item.id;
              const boxStyle = getStatusBorder(item.status, isSelected, isHovered);

              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBox && onSelectBox(item.id);
                  }}
                  onMouseEnter={() => setHoveredBox(item.id)}
                  onMouseLeave={() => setHoveredBox(null)}
                  style={{
                    left: `${item.box.x}%`,
                    top: `${item.box.y}%`,
                    width: `${item.box.width}%`,
                    height: `${item.box.height}%`,
                  }}
                  className={`absolute border-2 cursor-pointer transition-all duration-150 rounded-[2px] ${boxStyle}`}
                  title={`${item.box.label}: ${item.text}`}
                >
                  <div
                    className={`absolute -top-5 left-0 z-10 whitespace-nowrap text-[9px] font-mono px-1 py-0.2 rounded shadow-xs font-semibold ${
                      item.status === 'pass'
                        ? 'bg-emerald-700 text-white'
                        : item.status === 'non_compliant'
                        ? 'bg-rose-700 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {item.box.label}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Pass
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Review Required
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Potential Violation
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">
          Click highlighted box to jump to rule evidence
        </span>
      </div>
    </div>
  );
};
