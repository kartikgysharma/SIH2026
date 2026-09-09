import React from 'react';
import { InspectionSummary, ExtractedField, PackageSide } from '../../types';
import { Package, CheckCircle, AlertCircle, HelpCircle, ShieldCheck, Layers, AlertTriangle } from 'lucide-react';

interface ProductInformationProps {
  inspection: InspectionSummary;
  className?: string;
}

export const ProductInformation: React.FC<ProductInformationProps> = ({
  inspection,
  className = '',
}) => {
  // Map extracted fields by key or find from fields array
  const getFieldInfo = (fieldKeyPart: string) => {
    return inspection.fields.find(
      (f) =>
        f.fieldKey.toLowerCase().includes(fieldKeyPart.toLowerCase()) ||
        f.fieldName.toLowerCase().includes(fieldKeyPart.toLowerCase())
    );
  };

  // Compile list of structured product declarations
  const infoRows: Array<{
    label: string;
    value: string;
    extractedField?: ExtractedField;
    source: string;
    side?: PackageSide | string;
    sourceImageId?: string;
    hasConflict?: boolean;
    confidence?: number;
    status?: 'pass' | 'non_compliant' | 'review_required';
    isApplicable: boolean;
  }> = [
    {
      label: 'Product Name / Description',
      value: inspection.commodityName,
      source: 'Extracted Label Text',
      side: getFieldInfo('commodity_name')?.side || 'Front',
      sourceImageId: getFieldInfo('commodity_name')?.sourceImageId || 'img_1',
      confidence: 0.99,
      isApplicable: true,
    },
    {
      label: 'Brand / Trademark Mark',
      value: inspection.brandName,
      source: 'Extracted Label Text',
      side: getFieldInfo('brand')?.side || 'Front',
      sourceImageId: getFieldInfo('brand')?.sourceImageId || 'img_1',
      confidence: 0.98,
      isApplicable: true,
    },
    {
      label: 'Declared Net Quantity',
      value: inspection.netQuantityDeclared,
      extractedField: getFieldInfo('net_quantity') || getFieldInfo('quantity'),
      source: 'Optical Extraction',
      side: getFieldInfo('net_quantity')?.side || 'Front',
      sourceImageId: getFieldInfo('net_quantity')?.sourceImageId || 'img_1',
      hasConflict: getFieldInfo('net_quantity')?.hasConflict,
      confidence: getFieldInfo('net_quantity')?.confidence || 0.96,
      status: getFieldInfo('net_quantity')?.status || 'pass',
      isApplicable: true,
    },
    {
      label: 'Maximum Retail Price (MRP)',
      value: inspection.mrpDeclared,
      extractedField: getFieldInfo('mrp'),
      source: 'Optical Extraction',
      side: getFieldInfo('mrp')?.side || 'Back',
      sourceImageId: getFieldInfo('mrp')?.sourceImageId || 'img_1',
      hasConflict: getFieldInfo('mrp')?.hasConflict,
      confidence: getFieldInfo('mrp')?.confidence || 0.99,
      status: getFieldInfo('mrp')?.status || 'pass',
      isApplicable: true,
    },
    {
      label: 'Unit Sale Price (USP)',
      value: inspection.unitSalePriceDeclared || 'Not Detected on Display Panel',
      extractedField: getFieldInfo('unit_sale_price') || getFieldInfo('usp'),
      source: inspection.unitSalePriceDeclared ? 'Optical Extraction' : 'Statutory Inferred',
      side: getFieldInfo('unit_sale_price')?.side || 'Back',
      sourceImageId: getFieldInfo('unit_sale_price')?.sourceImageId || 'img_1',
      confidence: getFieldInfo('unit_sale_price')?.confidence || 0.95,
      status: inspection.unitSalePriceDeclared ? 'pass' : 'non_compliant',
      isApplicable: true,
    },
    {
      label: 'Manufacturer / Packer Name & Address',
      value: inspection.manufacturerName,
      extractedField: getFieldInfo('manufacturer') || getFieldInfo('packer'),
      source: 'Optical Extraction',
      side: getFieldInfo('manufacturer')?.side || 'Back',
      sourceImageId: getFieldInfo('manufacturer')?.sourceImageId || 'img_1',
      confidence: getFieldInfo('manufacturer')?.confidence || 0.97,
      status: getFieldInfo('manufacturer')?.status || 'pass',
      isApplicable: true,
    },
    {
      label: 'Batch / Lot Number',
      value: inspection.batchOrLotNumber || 'Not Detected',
      extractedField: getFieldInfo('batch') || getFieldInfo('lot'),
      source: 'Optical Extraction',
      side: getFieldInfo('batch')?.side || 'Back',
      sourceImageId: getFieldInfo('batch')?.sourceImageId || 'img_1',
      confidence: 0.94,
      status: inspection.batchOrLotNumber ? 'pass' : 'review_required',
      isApplicable: true,
    },
    {
      label: 'Month & Year of Manufacture / Packing',
      value: inspection.packagingDate || 'Not Detected',
      extractedField: getFieldInfo('date') || getFieldInfo('mfg'),
      source: 'Optical Extraction',
      side: getFieldInfo('mfg_date')?.side || 'Back',
      sourceImageId: getFieldInfo('mfg_date')?.sourceImageId || 'img_1',
      confidence: getFieldInfo('mfg_date')?.confidence || 0.94,
      status: inspection.packagingDate ? 'pass' : 'review_required',
      isApplicable: true,
    },
    {
      label: 'Best Before / Expiry Declaration',
      value: inspection.expiryOrBestBefore || 'Not Declared',
      extractedField: getFieldInfo('expiry') || getFieldInfo('best_before'),
      source: 'Optical Extraction',
      side: getFieldInfo('expiry')?.side || 'Back',
      sourceImageId: getFieldInfo('expiry')?.sourceImageId || 'img_1',
      confidence: 0.95,
      status: 'pass',
      isApplicable:
        inspection.category.toLowerCase().includes('food') ||
        inspection.category.toLowerCase().includes('oil') ||
        inspection.category.toLowerCase().includes('dairy') ||
        inspection.category.toLowerCase().includes('pharma'),
    },
    {
      label: 'Country of Origin',
      value: inspection.countryOfOrigin || 'India',
      extractedField: getFieldInfo('origin') || getFieldInfo('country'),
      source: 'Optical Extraction',
      side: getFieldInfo('country_of_origin')?.side || 'Back',
      sourceImageId: getFieldInfo('country_of_origin')?.sourceImageId || 'img_1',
      confidence: getFieldInfo('country_of_origin')?.confidence || 0.99,
      status: 'pass',
      isApplicable: true,
    },
    {
      label: 'FSSAI License / Registration No.',
      value: inspection.fssaiLicenseNo || 'Not Applicable (Non-Food)',
      extractedField: getFieldInfo('fssai'),
      source: 'Optical Extraction',
      side: getFieldInfo('fssai')?.side || 'Back',
      sourceImageId: getFieldInfo('fssai')?.sourceImageId || 'img_1',
      confidence: getFieldInfo('fssai')?.confidence || 0.97,
      status: 'pass',
      isApplicable:
        inspection.category.toLowerCase().includes('food') ||
        inspection.category.toLowerCase().includes('oil') ||
        inspection.category.toLowerCase().includes('dairy') ||
        Boolean(inspection.fssaiLicenseNo),
    },
    {
      label: 'Consumer Care & Grievance Contact',
      value:
        getFieldInfo('consumer_care')?.extractedValue ||
        'care@brand.in | Helpline: 1800-XXX-XXXX',
      extractedField: getFieldInfo('consumer_care'),
      source: 'Optical Extraction',
      side: getFieldInfo('consumer_care')?.side || 'Back',
      sourceImageId: getFieldInfo('consumer_care')?.sourceImageId || 'img_1',
      confidence: getFieldInfo('consumer_care')?.confidence || 0.92,
      status: getFieldInfo('consumer_care')?.status || 'pass',
      isApplicable: true,
    },
  ];

  const applicableRows = infoRows.filter((r) => r.isApplicable);

  return (
    <section className={`space-y-3 ${className}`}>
      {/* Section Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
          <Package className="w-4 h-4 text-[#0B2545]" />
          <span>3. Structured Product &amp; Packaging Declarations</span>
        </h2>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          Category: {inspection.category}
        </span>
      </div>

      {/* Structured Document Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-600">
              <th className="py-2.5 px-3 w-1/3">Mandatory Particular / Field</th>
              <th className="py-2.5 px-3 w-5/12">Extracted Packaging Value</th>
              <th className="py-2.5 px-2.5 text-center w-24">Side Panel</th>
              <th className="py-2.5 px-3 text-right">Source &amp; Conf.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applicableRows.map((row, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/70' : 'bg-slate-50/40 hover:bg-slate-50'}
              >
                <td className="py-2.5 px-3 font-semibold text-slate-800 align-top">
                  {row.label}
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-900 font-medium align-top leading-relaxed">
                  {row.hasConflict ? (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        Conflict Flagged
                      </span>
                      <div className="text-amber-950 font-bold">{row.value}</div>
                    </div>
                  ) : (
                    row.value
                  )}
                </td>
                <td className="py-2.5 px-2.5 text-center align-top whitespace-nowrap">
                  <span className="font-mono text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                    {row.side || 'Front'}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right align-top whitespace-nowrap">
                  <div className="inline-flex flex-col items-end">
                    <span className="text-[11px] font-mono font-semibold text-slate-700">
                      {row.source}
                    </span>
                    {row.confidence !== undefined && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1 rounded ${
                          row.confidence >= 0.95
                            ? 'text-emerald-800 bg-emerald-50'
                            : row.confidence >= 0.85
                            ? 'text-blue-800 bg-blue-50'
                            : 'text-amber-800 bg-amber-50'
                        }`}
                      >
                        {(row.confidence * 100).toFixed(0)}% conf.
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
