import React, { useState, useRef } from 'react';
import { Button } from '../design-system/Button';
import { InspectionSummary, PackageSide } from '../types';
import { optimizeImageForAnalysis, OptimizedImageResult } from '../utils/imageOptimizer';
import { SAMPLE_INSPECTIONS } from '../data/sampleInspections';
import {
  Scan,
  CheckCircle2,
  AlertOctagon,
  FileCheck,
  ShieldCheck,
  X,
  Layers,
  Cpu,
  RefreshCw,
  Upload,
  Camera,
  Check,
  Info,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Image as ImageIcon,
  Tag,
  Zap,
} from 'lucide-react';

interface QueuedImage {
  id: string;
  file: File;
  previewUrl: string;
  side: PackageSide;
  sizeKb: number;
  optimizedPromise?: Promise<OptimizedImageResult>;
}

const PACKAGE_SIDES: PackageSide[] = [
  'Front',
  'Back',
  'Left Side',
  'Right Side',
  'Top',
  'Bottom',
  'Other',
];

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInspectionReady: (inspection: InspectionSummary) => void;
}

export const ScanModal: React.FC<ScanModalProps> = ({
  isOpen,
  onClose,
  onInspectionReady,
}) => {
  const [activeStep, setActiveStep] = useState<'select' | 'analyzing' | 'error'>('select');
  const [pipelineStage, setPipelineStage] = useState<number>(0);
  const [analyzingTargetName, setAnalyzingTargetName] = useState<string>('Packaged Commodity Label');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorCode, setErrorCode] = useState<string>('');
  const [modalMode, setModalMode] = useState<'upload' | 'samples'>('upload');

  // Multi-image state: all images belong to ONE inspection
  const [queuedImages, setQueuedImages] = useState<QueuedImage[]>([]);

  const stageIntervalRef = useRef<any>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const pipelineStages = [
    {
      title: 'Image Preprocessing & Panel Normalization',
      desc: 'High-speed resolution optimization and orientation alignment',
      icon: Layers,
    },
    {
      title: 'Multimodal Vision Statutory Extraction',
      desc: 'High-throughput parallel OCR & statutory declaration extraction',
      icon: Cpu,
    },
    {
      title: 'Deterministic Statutory Rule Engine & Conflict Check',
      desc: 'Verifying Legal Metrology Rules 2011 across all package panels',
      icon: FileCheck,
    },
    {
      title: 'Unified Dossier Synthesis & Audit Log',
      desc: 'Correlating evidence across panels into a single compliance dossier',
      icon: ShieldCheck,
    },
  ];

  const resetModalState = () => {
    if (stageIntervalRef.current) {
      clearInterval(stageIntervalRef.current);
    }
    // Revoke object URLs to avoid memory leaks
    queuedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setActiveStep('select');
    setPipelineStage(0);
    setErrorMessage('');
    setErrorCode('');
    setQueuedImages([]);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const handleSelectSample = (sample: InspectionSummary) => {
    onInspectionReady(sample);
    resetModalState();
    onClose();
  };

  // Assign a sensible default side based on how many are already queued
  const getNextSuggestedSide = (currentCount: number): PackageSide => {
    const sideSequence: PackageSide[] = [
      'Front',
      'Back',
      'Left Side',
      'Right Side',
      'Top',
      'Bottom',
      'Other',
    ];
    return sideSequence[currentCount % sideSequence.length];
  };

  // Add files to queue with background pre-compression
  const addFilesToQueue = (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    const newItems: QueuedImage[] = [];
    let currentTotal = queuedImages.length;

    for (const file of fileArr) {
      if (file.type && !validMimes.includes(file.type.toLowerCase())) {
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      const suggestedSide = getNextSuggestedSide(currentTotal);
      currentTotal++;

      // Pre-optimize image in background immediately upon selection
      const optPromise = optimizeImageForAnalysis(file, 1000, 0.75);

      newItems.push({
        id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl,
        side: suggestedSide,
        sizeKb: Math.round(file.size / 1024),
        optimizedPromise: optPromise,
      });
    }

    if (newItems.length > 0) {
      setQueuedImages((prev) => [...prev, ...newItems]);
    }
  };

  const removeQueuedImage = (id: string) => {
    setQueuedImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const updateImageSide = (id: string, newSide: PackageSide) => {
    setQueuedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, side: newSide } : img))
    );
  };

  // Run multi-image inspection with high-speed Turbo pipeline
  const handleStartInspection = async () => {
    if (queuedImages.length === 0) return;

    console.log(`[1] Starting unified package inspection with ${queuedImages.length} image(s)`);
    queuedImages.forEach((img, idx) => {
      console.log(` - Side ${idx + 1}: ${img.side} ("${img.file.name}", ${img.sizeKb} KB)`);
    });

    const primaryName =
      queuedImages[0]?.file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') ||
      'Packaged Commodity';
    setAnalyzingTargetName(primaryName);

    setActiveStep('analyzing');
    setPipelineStage(0);

    try {
      // Step 1: Rapid concurrent image pre-compression (uses pre-computed promise if ready)
      const optimizedResults = await Promise.all(
        queuedImages.map(async (img) => {
          const opt = img.optimizedPromise
            ? await img.optimizedPromise
            : await optimizeImageForAnalysis(img.file, 1280, 0.82);
          return {
            id: img.id,
            side: img.side,
            fileName: img.file.name,
            base64Data: opt.base64Data,
            mimeType: opt.mimeType,
          };
        })
      );

      setPipelineStage(1); // Multimodal Vision Extraction

      console.log(`[2] Sending ${optimizedResults.length} package image(s) to /api/analyze-label`);

      const response = await fetch('/api/analyze-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: optimizedResults,
          inspectorName: 'Field Metrology Officer',
          location: 'Field Inspection Unit',
        }),
      });

      setPipelineStage(2); // Statutory Rule Engine & Conflict Detection

      const contentType = response.headers.get('content-type') || '';
      let result: any = null;

      if (contentType.includes('application/json')) {
        try {
          result = await response.json();
        } catch (jsonErr) {
          console.error('[Response Parse Error] Failed to parse JSON:', jsonErr);
        }
      } else {
        const rawText = await response.text();
        console.warn(`[Non-JSON Response] Status: ${response.status}:`, rawText.slice(0, 300));
        try {
          result = JSON.parse(rawText);
        } catch {
          // Received HTML page (e.g. index.html from SPA fallback) instead of JSON
          result = {
            success: false,
            error: {
              code: 'NON_JSON_RESPONSE',
              message:
                'The server returned an HTML fallback page instead of a JSON response. Please check backend API server configuration and route.',
            },
          };
        }
      }

      if (!response.ok || !result?.success) {
        const err = result?.error;
        console.error('[API Error] Backend returned error:', err || result);
        const resolvedErrorCode =
          err?.code || (result?.code ? String(result.code) : `HTTP_${response.status}`);
        const resolvedErrorMessage =
          err?.message ||
          result?.message ||
          err?.details ||
          (response.status === 500
            ? 'Server encountered an internal error during image processing. Please verify your API key and retry.'
            : `Server returned an unexpected response (HTTP ${response.status}).`);

        setErrorCode(resolvedErrorCode);
        setErrorMessage(resolvedErrorMessage);
        setActiveStep('error');
        return;
      }

      console.log('[3] Unified inspection result received from server');
      console.log(`[4] Commodity: "${result.inspection.commodityName}" - Score: ${result.inspection.complianceScore}%`);

      setPipelineStage(3); // Unified dossier synthesis
      await new Promise((resolve) => setTimeout(resolve, 150));

      onInspectionReady(result.inspection);
      resetModalState();
      onClose();
    } catch (err: any) {
      console.error('[Inspection Error]', err);
      setErrorCode('NETWORK_ERROR');
      setErrorMessage(
        err?.message || 'Failed to complete package inspection. Please retry.'
      );
      setActiveStep('error');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(e.target.files);
      e.target.value = ''; // Reset input to allow re-selecting
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Hidden Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
        <input
          ref={addMoreInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-blue-500/20 text-blue-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {activeStep === 'select'
                  ? 'Multi-Side Package Inspection'
                  : activeStep === 'analyzing'
                  ? 'Unified Package Verification Pipeline'
                  : 'Inspection Analysis Status'}
              </h3>
              <p className="text-xs text-slate-300">
                {activeStep === 'select'
                  ? 'Upload one or multiple package sides (Front, Back, Sides) for comprehensive compliance check'
                  : activeStep === 'analyzing'
                  ? `Analyzing ${queuedImages.length} package side(s) under Legal Metrology Rules 2011`
                  : 'Diagnosis and statutory verification issue report'}
              </p>
            </div>
          </div>
          {activeStep !== 'analyzing' && (
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {activeStep === 'select' ? (
            <div className="space-y-5">
              {/* Mode Switcher Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setModalMode('upload')}
                  className={`flex-1 py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    modalMode === 'upload'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-blue-700" />
                  <span>Upload Package Images</span>
                  {queuedImages.length > 0 && (
                    <span className="ml-1 bg-blue-700 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {queuedImages.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode('samples')}
                  className={`flex-1 py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    modalMode === 'samples'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pre-loaded Test Cases ({SAMPLE_INSPECTIONS.length})</span>
                </button>
              </div>

              {modalMode === 'upload' ? (
                <div className="space-y-5">
                  {/* Empty state: Dropzone */}
                  {queuedImages.length === 0 ? (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-8 text-center transition-colors bg-slate-50/50 hover:bg-blue-50/20">
                        <div className="mx-auto w-12 h-12 rounded-full bg-blue-100/80 text-blue-700 flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">
                          Drop Package Images Here
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                          Select one or multiple photos of the package (e.g. Front, Back, Left, Right).
                          All photos will be correlated into a single inspection report.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <Button
                            variant="primary"
                            size="md"
                            leftIcon={<Upload className="w-4 h-4" />}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Browse Package Photos
                          </Button>
                          <Button
                            variant="secondary"
                            size="md"
                            leftIcon={<Camera className="w-4 h-4 text-blue-700" />}
                            onClick={() => cameraInputRef.current?.click()}
                          >
                            Take Photo with Camera
                          </Button>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-600 flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <div className="space-y-1 text-[11px] leading-relaxed">
                          <strong>Multi-Image Package Rule:</strong> Mandatory particulars (e.g. MRP, Net Quantity, Manufacturer details, Batch &amp; FSSAI) are often distributed across different panels of a container. You can upload 1 to N images; the system correlates declarations and detects any discrepancies across sides.
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Package Images Section (with 1+ images queued) */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                              Package Images ({queuedImages.length})
                            </h4>
                            <span className="text-[10px] font-mono font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              Single Package Inspection
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Assign panel sides below. All images belong to this package inspection.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setQueuedImages([])}
                          className="text-xs text-slate-500 hover:text-rose-600 transition-colors font-medium"
                        >
                          Clear All
                        </button>
                      </div>

                      {/* Queued Images Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                        {queuedImages.map((img, idx) => (
                          <div
                            key={img.id}
                            className="flex items-center gap-3 p-3 bg-white border border-slate-300 rounded-lg shadow-2xs hover:border-slate-400 transition-all"
                          >
                            {/* Thumbnail Preview */}
                            <div className="relative w-18 h-18 rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                              <img
                                src={img.previewUrl}
                                alt={img.side}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-0 inset-x-0 bg-slate-900/75 text-[9px] text-white text-center font-mono py-0.5 truncate">
                                #{idx + 1}
                              </span>
                            </div>

                            {/* Details & Side Assignment */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-slate-900 truncate block">
                                  {img.file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeQueuedImage(img.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors shrink-0"
                                  title="Remove image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                                  Side:
                                </span>
                                <select
                                  value={img.side}
                                  onChange={(e) =>
                                    updateImageSide(img.id, e.target.value as PackageSide)
                                  }
                                  className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  {PACKAGE_SIDES.map((side) => (
                                    <option key={side} value={side}>
                                      {side}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                <span>{img.sizeKb} KB</span>
                                {img.side === 'Front' && (
                                  <span className="text-blue-700 font-bold">Principal Display (PDP)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Another Image Button */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Plus className="w-4 h-4 text-blue-700" />}
                            onClick={() => addMoreInputRef.current?.click()}
                          >
                            + Add Another Image
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Camera className="w-3.5 h-3.5 text-slate-600" />}
                            onClick={() => cameraInputRef.current?.click()}
                          >
                            Snap More
                          </Button>
                        </div>

                        <span className="text-xs font-mono text-slate-500">
                          {queuedImages.length} image{queuedImages.length === 1 ? '' : 's'} ready
                        </span>
                      </div>

                      {/* Main Call to Action */}
                      <div className="pt-2 space-y-2">
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full justify-center text-sm font-bold shadow-md"
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                          onClick={handleStartInspection}
                        >
                          Run Compliance Inspection on {queuedImages.length} Image{queuedImages.length === 1 ? '' : 's'}
                        </Button>
                        <p className="text-[11px] text-slate-500 text-center">
                          Correlates all {queuedImages.length} panel(s) into one consolidated Legal Metrology audit report.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Preloaded Test Cases / Samples */
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  <p className="text-xs text-slate-600">
                    Select a reference commodity inspection to evaluate statutory rules, multi-side evidence, and conflict detection:
                  </p>
                  <div className="space-y-2">
                    {SAMPLE_INSPECTIONS.map((sample) => {
                      const imageCount = sample.packageImages?.length || 1;
                      return (
                        <div
                          key={sample.id}
                          onClick={() => handleSelectSample(sample)}
                          className="p-3.5 bg-white border border-slate-300 rounded-lg hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900">
                                {sample.commodityName}
                              </span>
                              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                                {sample.category}
                              </span>
                              {sample.hasDeclarationConflicts && (
                                <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                                  Conflict Test Case
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200">
                                {imageCount} Side{imageCount === 1 ? '' : 's'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">
                              Brand: <strong>{sample.brandName}</strong> • MRP: {sample.mrpDeclared} • Net Qty: {sample.netQuantityDeclared}
                            </p>
                          </div>
                          <Button variant="secondary" size="sm">
                            Inspect
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : activeStep === 'analyzing' ? (
            /* Analysis Progress View */
            <div className="space-y-6 py-4">
              <div className="text-center space-y-1">
                <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-700 mb-2 animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Inspecting {analyzingTargetName}
                </h4>
                <p className="text-xs text-slate-500">
                  Processing {queuedImages.length} package image{queuedImages.length === 1 ? '' : 's'} across panels ({queuedImages.map((i) => i.side).join(', ')})
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium shadow-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    Extracting statutory declarations & verifying Legal Metrology Rules...
                  </span>
                </div>
              </div>

              {/* Side Panels Preview Strip */}
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
                {queuedImages.map((img, idx) => (
                  <div
                    key={img.id}
                    className="flex flex-col items-center gap-1 p-1.5 bg-slate-50 border border-slate-200 rounded"
                  >
                    <img
                      src={img.previewUrl}
                      alt={img.side}
                      className="w-14 h-14 object-cover rounded border border-slate-300"
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-700">
                      {img.side}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pipeline Stages Tracker */}
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
                {pipelineStages.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isDone = pipelineStage > idx;
                  const isCurrent = pipelineStage === idx;

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 transition-opacity ${
                        isDone
                          ? 'text-emerald-900'
                          : isCurrent
                          ? 'text-blue-900 font-medium'
                          : 'text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isDone ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center animate-spin">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold leading-tight">{stage.title}</div>
                        <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          {stage.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Error View */
            <div className="space-y-4 py-4">
              <div className="text-center space-y-1">
                <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-700 mb-2">
                  <AlertOctagon className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Package Analysis Notice
                </h4>
                <p className="text-xs text-slate-500">
                  Error Code: <span className="font-mono font-bold text-rose-700">{errorCode}</span>
                </p>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-md p-4 text-xs text-rose-900 space-y-2">
                <p className="font-semibold">{errorMessage}</p>
                <p className="text-[11px] text-rose-800">
                  Ensure all uploaded photos are well-lit, sharp, and depict visible label particulars.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="secondary" size="md" onClick={() => setActiveStep('select')}>
                  Back to Package Images
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleStartInspection}
                  disabled={queuedImages.length === 0}
                >
                  Retry Inspection
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
