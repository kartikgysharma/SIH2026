import React, { useState } from 'react';
import {
  X,
  Split,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Upload,
  Info,
} from 'lucide-react';
import { InspectionSummary, ReferenceComparisonResult } from '../../types';
import { compareWithReferencePackage } from '../../utils/tamperingVision';

interface ReferenceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: InspectionSummary;
  onSaveComparison?: (result: ReferenceComparisonResult) => void;
}

export const ReferenceComparisonModal: React.FC<ReferenceComparisonModalProps> = ({
  isOpen,
  onClose,
  inspection,
  onSaveComparison,
}) => {
  const [activeTab, setActiveTab] = useState<'side-by-side' | 'difference-table'>('side-by-side');

  // Preloaded reference specifications
  const referenceTemplates = [
    {
      name: 'Approved Brand Standard Pack (Standard MRP ₹ 120, Batch 2026)',
      mrp: '₹ 120.00 (Incl. of all taxes)',
      netQuantity: '1 Litre (880g)',
      packagingDate: '01/2026',
      expiryDate: 'Best before 9 months from packaging',
      manufacturer: 'Suraj Agro Food & Oils Pvt Ltd, Ahmedabad, Gujarat 382330',
      consumerCare: 'care@surajoil.in, Tel: 1800-233-9900',
    },
    {
      name: 'Alternative Regional Master Pack (Export / Revised USP MRP ₹ 135)',
      mrp: '₹ 135.00 (Incl. of all taxes)',
      netQuantity: '1 Litre (880g)',
      packagingDate: '01/2026',
      expiryDate: 'Best before 9 months from packaging',
      manufacturer: 'Suraj Agro Food & Oils Pvt Ltd, Ahmedabad, Gujarat 382330',
      consumerCare: 'care@surajoil.in, Tel: 1800-233-9900',
    },
  ];

  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const selectedTemplate = referenceTemplates[selectedTemplateIndex];

  // Run dynamic comparison
  const comparisonResult: ReferenceComparisonResult = compareWithReferencePackage(
    selectedTemplate.name,
    inspection.imageUrl,
    selectedTemplate,
    {
      mrp: inspection.mrpDeclared || '',
      netQuantity: inspection.netQuantityDeclared || '',
      packagingDate: inspection.packagingDate || '',
      expiryDate: inspection.expiryOrBestBefore || '',
      manufacturer: inspection.manufacturerName || '',
      consumerCare: 'care@surajoil.in, Tel: 1800-233-9900',
    }
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0B2545] to-[#134074] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-white/10 text-white">
              <ArrowRightLeft className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Reference Package vs. Inspected Sample Comparison
              </h3>
              <p className="text-xs text-slate-300">
                Compare approved brand master declarations against the active sample to identify price stickers, altered dates, or overlay modifications.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 font-mono uppercase text-[11px]">
              Master Template:
            </span>
            <select
              value={selectedTemplateIndex}
              onChange={(e) => setSelectedTemplateIndex(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
            >
              {referenceTemplates.map((t, idx) => (
                <option key={idx} value={idx}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-300 text-amber-900 font-mono font-bold text-[11px]">
              <span>Similarity: {comparisonResult.similarityScore}%</span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex rounded border border-slate-300 bg-slate-200 p-0.5">
              <button
                onClick={() => setActiveTab('side-by-side')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  activeTab === 'side-by-side' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Visual Side-by-Side
              </button>
              <button
                onClick={() => setActiveTab('difference-table')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  activeTab === 'difference-table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Differences ({comparisonResult.differencesDetected.filter((d) => d.status !== 'MATCH').length})
              </button>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'side-by-side' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Approved Reference Spec */}
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 text-xs font-mono uppercase flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      Approved Master Specification
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      Brand Baseline
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500 font-medium">Standard MRP:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedTemplate.mrp}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500 font-medium">Net Quantity:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedTemplate.netQuantity}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500 font-medium">Pkg / Mfg Date:</span>
                      <span className="font-mono text-slate-800">{selectedTemplate.packagingDate}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500 font-medium">Expiry / Use-By:</span>
                      <span className="text-slate-800 text-right">{selectedTemplate.expiryDate}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-slate-500 font-medium">Registered Packer:</span>
                      <span className="text-slate-800 text-right max-w-[200px] truncate">
                        {selectedTemplate.manufacturer}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Inspected Sample Value */}
                <div className="border border-amber-300 rounded-lg p-4 bg-amber-50/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <span className="font-bold text-slate-900 text-xs font-mono uppercase flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-600" />
                      Field Sample Under Inspection
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                      Sample Data
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-amber-200/60 pb-1.5">
                      <span className="text-slate-600 font-medium">Observed MRP:</span>
                      <span className={`font-mono font-bold ${
                        inspection.mrpDeclared !== selectedTemplate.mrp
                          ? 'text-red-700 bg-red-100 px-1 rounded'
                          : 'text-slate-900'
                      }`}>
                        {inspection.mrpDeclared || 'Not Detected'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-amber-200/60 pb-1.5">
                      <span className="text-slate-600 font-medium">Observed Net Qty:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {inspection.netQuantityDeclared || 'Not Detected'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-amber-200/60 pb-1.5">
                      <span className="text-slate-600 font-medium">Pkg / Mfg Date:</span>
                      <span className="font-mono text-slate-800">
                        {inspection.packagingDate || 'Not Detected'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-amber-200/60 pb-1.5">
                      <span className="text-slate-600 font-medium">Expiry / Use-By:</span>
                      <span className="text-slate-800 text-right">
                        {inspection.expiryOrBestBefore || 'Not Detected'}
                      </span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-slate-600 font-medium">Observed Packer:</span>
                      <span className="text-slate-800 text-right max-w-[200px] truncate">
                        {inspection.manufacturerName || 'Not Detected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual image preview of inspected sample */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                <span className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider block">
                  Inspected Package Evidence Visual
                </span>
                <div className="h-64 rounded bg-slate-950/5 flex items-center justify-center overflow-hidden border border-slate-200">
                  <img
                    src={inspection.imageUrl}
                    alt="Inspected package visual"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Differences & Overlays Table */
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-mono font-semibold uppercase text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Mandatory Field</th>
                      <th className="p-3">Master Reference</th>
                      <th className="p-3">Sample Observation</th>
                      <th className="p-3">Discrepancy / Alignment</th>
                      <th className="p-3">Forensic Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {comparisonResult.differencesDetected.map((diff) => (
                      <tr key={diff.id} className={diff.status !== 'MATCH' ? 'bg-amber-50/50' : ''}>
                        <td className="p-3 font-semibold text-slate-900">{diff.field}</td>
                        <td className="p-3 font-mono text-slate-600">{diff.referenceValue}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">{diff.inspectionValue}</td>
                        <td className="p-3">
                          {diff.status === 'MATCH' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Match
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-amber-100 text-amber-800 border border-amber-300">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              {diff.discrepancyType}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 text-[11px] leading-relaxed max-w-xs">
                          {diff.evidenceNote}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Legal / Inspection Disclaimer */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Comparison against reference packaging assists the inspector in evaluating whether price corrections, stickers, or revised declarations are authorized by notification or warrant formal sampling under Section 15 of the Legal Metrology Act, 2009.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-mono">
            Analyzed: {comparisonResult.comparedAt}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded text-slate-700 bg-white border border-slate-300 hover:bg-slate-100"
            >
              Close
            </button>
            {onSaveComparison && (
              <button
                onClick={() => {
                  onSaveComparison(comparisonResult);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold rounded text-white bg-[#0B2545] hover:bg-[#134074] shadow-xs"
              >
                Attach Comparison to Dossier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
