import React, { useState, useRef } from 'react';
import { Button } from '../design-system/Button';
import { FileDropzone } from '../design-system/Input';
import { InspectionSummary } from '../types';
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
} from 'lucide-react';

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const stageIntervalRef = useRef<any>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const pipelineStages = [
    {
      title: 'Label Preprocessing & Optical Clarity Check',
      desc: 'Validating resolution, orientation, readability & perspective',
      icon: Layers,
    },
    {
      title: 'Gemini Multimodal Vision Extraction',
      desc: 'Extracting manufacturer, MRP, net quantity, dates, and mandatory panels',
      icon: Cpu,
    },
    {
      title: 'Deterministic Statutory Rule Engine',
      desc: 'Evaluating Legal Metrology 2011 (Rule 6, 7), Unit Sale Price & FSSAI',
      icon: FileCheck,
    },
    {
      title: 'Evidence Correlation & Compliance Synthesis',
      desc: 'Building inspector audit log and statutory determination',
      icon: ShieldCheck,
    },
  ];

  const resetModalState = () => {
    if (stageIntervalRef.current) {
      clearInterval(stageIntervalRef.current);
    }
    setActiveStep('select');
    setPipelineStage(0);
    setErrorMessage('');
    setErrorCode('');
    setUploadedFile(null);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  // Analyze custom user uploaded image
  const handleCustomFileUpload = async (file: File) => {
    // 1. Diagnostic logging: image selected
    console.log(`[1] Image selected: "${file.name}"`);
    console.log(`[2] Image MIME type: ${file.type || 'unknown'}`);
    console.log(`[3] Image size: ~${Math.round(file.size / 1024)} KB`);

    // MIME type check
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (file.type && !validMimes.includes(file.type.toLowerCase())) {
      setErrorCode('UNSUPPORTED_FORMAT');
      setErrorMessage(`The selected file format (${file.type || 'unknown'}) is not supported. Please upload a JPEG, PNG, or WebP image.`);
      setActiveStep('error');
      return;
    }

    setUploadedFile(file);
    const targetLabel = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Uploaded Packaging Label';
    setAnalyzingTargetName(targetLabel);
    setActiveStep('analyzing');
    setPipelineStage(0);

    // Start progress stage visual progression
    stageIntervalRef.current = setInterval(() => {
      setPipelineStage((prev) => (prev < 2 ? prev + 1 : prev));
    }, 1200);

    try {
      // Convert File to base64 Data URL
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      console.log('[4] Image successfully prepared and sent to backend (/api/analyze-label)');
      console.log('[5] Gemini request started...');

      const response = await fetch('/api/analyze-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType: file.type || 'image/jpeg',
          fileName: file.name,
          inspectorName: 'Field Metrology Officer',
          location: 'Field Inspection Unit',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
        const err = result?.error;
        console.error('[API Error] Backend returned error:', err);
        setErrorCode(err?.code || 'ANALYSIS_FAILED');
        setErrorMessage(
          err?.message ||
            'Unable to analyze this image. Please check image quality and try again.'
        );
        setActiveStep('error');
        return;
      }

      console.log('[6] Gemini response received');
      console.log('[7] Structured JSON parsed');
      console.log(`[8] Extracted fields returned to frontend for "${result.inspection.commodityName}"`);

      // Complete stages
      setPipelineStage(3);

      setTimeout(() => {
        if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
        onInspectionReady(result.inspection);
        resetModalState();
        onClose();
      }, 500);
    } catch (err: any) {
      if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
      console.error('[Network Error] Failed to complete analysis:', err);
      setErrorCode('NETWORK_ERROR');
      setErrorMessage(
        err?.message ||
          'Failed to connect to inspection server. Please ensure the server is running and try again.'
      );
      setActiveStep('error');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleCustomFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Hidden Camera & File Inputs */}
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
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-blue-500/20 text-blue-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {activeStep === 'select'
                  ? 'Scan Packaged Commodity Label'
                  : activeStep === 'analyzing'
                  ? 'Automated Verification Pipeline'
                  : 'Inspection Analysis Status'}
              </h3>
              <p className="text-xs text-slate-300">
                {activeStep === 'select'
                  ? 'Upload or capture a label photo for real-time statutory vision extraction'
                  : activeStep === 'analyzing'
                  ? 'Extracting actual declarations & checking Legal Metrology Rules 2011'
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
        <div className="p-6">
          {activeStep === 'select' ? (
            <div className="space-y-6">
              {/* Dropzone for user file upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono font-semibold uppercase text-slate-700 tracking-wider">
                    Upload Real Product Packaging Label
                  </label>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Live Gemini Vision
                  </span>
                </div>
                <FileDropzone
                  onFileSelect={handleCustomFileUpload}
                  label="Drop label photo here or click to browse"
                  sublabel="Upload JPEG, PNG, or WebP photo of the packaging surface. Real label text will be extracted automatically."
                />
              </div>

              {/* Action Buttons: Camera Capture and File Browse */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full justify-center"
                  leftIcon={<Camera className="w-4 h-4 text-blue-700" />}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  Take Photo with Camera
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  leftIcon={<Upload className="w-4 h-4" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Image Files
                </Button>
              </div>

              {/* Inspection Guidelines */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Info className="w-4 h-4 text-blue-800 shrink-0" />
                  <span>Guidelines for Accurate Statutory Verification:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Include the Principal Display Panel (PDP) clearly</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Ensure MRP and Net Quantity numerals are legible</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Avoid direct flash reflection or heavy lens glare</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Capture manufacturer name & complete address panel</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : activeStep === 'analyzing' ? (
            /* Analysis Pipeline In Progress */
            <div className="py-8 px-4 space-y-6">
              <div className="text-center space-y-1.5">
                <div className="inline-flex p-3 rounded-full bg-blue-50 text-[#0B2545] border border-blue-100 animate-pulse">
                  <Cpu className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Executing Real Label Vision Extraction &amp; Verification
                </h4>
                <p className="text-xs text-slate-600 font-mono">
                  Target: {analyzingTargetName}
                </p>
              </div>

              {/* Progress Steps List */}
              <div className="space-y-3 max-w-md mx-auto">
                {pipelineStages.map((stage, idx) => {
                  const isDone = idx < pipelineStage;
                  const isCurrent = idx === pipelineStage;
                  const Icon = stage.icon;

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded border transition-all ${
                        isDone
                          ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                          : isCurrent
                          ? 'border-[#0B2545] bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 bg-slate-50/60 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Icon
                            className={`w-4 h-4 ${
                              isCurrent ? 'text-[#0B2545] animate-spin' : 'text-slate-400'
                            }`}
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold ${
                              isCurrent ? 'text-[#0B2545]' : isDone ? 'text-slate-900' : 'text-slate-500'
                            }`}
                          >
                            {stage.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-[11px] text-slate-400 font-mono">
                Statutory Rule Evaluation is deterministic. Only visibly present declarations are extracted.
              </p>
            </div>
          ) : (
            /* Error State */
            <div className="py-6 px-4 space-y-5">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  <AlertOctagon className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  {errorCode === 'IMAGE_QUALITY_INSUFFICIENT'
                    ? 'Image Quality Insufficient'
                    : errorCode === 'API_KEY_ERROR'
                    ? 'Gemini API Key Configuration Required'
                    : errorCode === 'SERVICE_UNAVAILABLE'
                    ? 'Service Temporarily Busy'
                    : 'Label Analysis Unsuccessful'}
                </h4>
                <div className="max-w-md mx-auto bg-rose-50 border border-rose-200 rounded p-3 text-left">
                  <p className="text-xs text-rose-900 leading-relaxed font-medium">
                    {errorMessage}
                  </p>
                </div>
              </div>

              {errorCode === 'SERVICE_UNAVAILABLE' && (
                <div className="max-w-md mx-auto text-xs text-slate-600 space-y-1 bg-amber-50 p-3 rounded border border-amber-200">
                  <p className="font-semibold text-amber-900">High Demand Spike Detected:</p>
                  <p className="text-[11px] text-amber-800">
                    The vision model is experiencing temporary traffic load. Retrying now will automatically attempt fallback model routing.
                  </p>
                </div>
              )}

              {errorCode === 'IMAGE_QUALITY_INSUFFICIENT' && (
                <div className="max-w-md mx-auto text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded border border-slate-200">
                  <p className="font-semibold text-slate-800">Inspection Guidelines for Label Capture:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                    <li>Ensure adequate lighting without heavy glare or flash reflection</li>
                    <li>Align the camera parallel to the Principal Display Panel (PDP)</li>
                    <li>Ensure fine print (mfg address, net quantity, MRP) is sharply focused</li>
                  </ul>
                </div>
              )}

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setActiveStep('select')} leftIcon={<Upload className="w-4 h-4" />}>
                  Choose Another Image
                </Button>
                {uploadedFile && (
                  <Button
                    variant="primary"
                    onClick={() => handleCustomFileUpload(uploadedFile)}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    Retake / Retry Analysis
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
