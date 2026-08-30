import React, { useState } from 'react';
import { Badge } from '../design-system/Badge';
import { Button } from '../design-system/Button';
import { Panel } from '../design-system/Panel';
import { Input, Select, SegmentedControl, FileDropzone } from '../design-system/Input';
import { Table, Column } from '../design-system/Table';
import { ScoreMeter } from '../design-system/ScoreMeter';
import { StatusIndicator } from '../design-system/StatusIndicator';
import {
  ShieldCheck,
  Search,
  Scan,
  AlertTriangle,
  Scale,
  FileCheck2,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Info,
} from 'lucide-react';

export const DesignSystemShowcase: React.FC = () => {
  const [segValue, setSegValue] = useState('all');
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('edible_oils');

  // Sample Table Data
  interface TokenSample {
    name: string;
    token: string;
    value: string;
    purpose: string;
    preview: React.ReactNode;
  }

  const colorTokens: TokenSample[] = [
    {
      name: 'Bharat Navy (Primary Brand)',
      token: 'var(--color-brand-900) / #0B2545',
      value: 'rgb(11, 37, 69)',
      purpose: 'Official authority headers, primary actions, deep contrast text',
      preview: <div className="w-8 h-8 rounded bg-[#0B2545] border border-slate-700" />,
    },
    {
      name: 'Statutory Pass (Emerald)',
      token: 'emerald-600 / #059669',
      value: 'rgb(5, 150, 105)',
      purpose: 'Fully verified mandatory declarations, compliant rules',
      preview: <div className="w-8 h-8 rounded bg-emerald-600 border border-emerald-700" />,
    },
    {
      name: 'Potential Non-Compliance (Crimson)',
      token: 'rose-600 / #E11D48',
      value: 'rgb(225, 29, 72)',
      purpose: 'Missing mandatory declarations, font size breaches, formula mismatch',
      preview: <div className="w-8 h-8 rounded bg-rose-600 border border-rose-700" />,
    },
    {
      name: 'Review Required (Amber)',
      token: 'amber-600 / #D97706',
      value: 'rgb(217, 119, 6)',
      purpose: 'Unclear contrast, ambiguous date stamps, requires inspector verification',
      preview: <div className="w-8 h-8 rounded bg-amber-500 border border-amber-600" />,
    },
    {
      name: 'Neutral Slate Surface',
      token: 'slate-50 / #F8FAFC',
      value: 'rgb(248, 250, 252)',
      purpose: 'Clean, high-contrast, low-glare professional inspection workspace',
      preview: <div className="w-8 h-8 rounded bg-slate-100 border border-slate-300" />,
    },
  ];

  const columns: Column<TokenSample>[] = [
    {
      key: 'preview',
      header: 'Color',
      width: '60px',
      render: (item) => item.preview,
    },
    {
      key: 'name',
      header: 'Token Name',
      width: '220px',
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-900 block">{item.name}</span>
          <span className="font-mono text-[10px] text-slate-500">{item.token}</span>
        </div>
      ),
    },
    {
      key: 'purpose',
      header: 'Usage & Purpose',
      render: (item) => <span className="text-slate-700">{item.purpose}</span>,
    },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      {/* Design System Banner */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-500">
          <Scale className="w-4 h-4 text-[#0B2545]" />
          <span>BharatLabel AI — Design System &amp; Foundational Architecture</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Foundational UI Components &amp; Design Tokens
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Standardized UI component library built for legal metrology and packaged commodity inspection.
          Crafted with strict accessibility standards, high information density, tabular figures, and restrained enterprise styling.
        </p>
      </div>

      {/* 1. Color System & Semantic Tokens */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">1. Color System &amp; Semantic Status Tokens</h3>
            <p className="text-xs text-slate-500">
              Restrained enterprise palette. Strictly no random gradients or neon AI glows.
            </p>
          </div>
          <Badge variant="brand">WCAG AAA Compliant</Badge>
        </div>

        <Table
          columns={columns}
          data={colorTokens}
          keyExtractor={(item) => item.name}
          isStriped
        />
      </section>

      {/* 2. Typography & Numerical Scales */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">2. Typography &amp; Tabular Numerals</h3>
          <p className="text-xs text-slate-500">
            Paired with Plus Jakarta Sans and JetBrains Mono for exact legal citations and measurements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Panel title="Primary Display & Body Typeface" isCompact>
            <div className="space-y-3 font-sans">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Heading 1 / Display</span>
                <div className="text-xl font-bold text-slate-900">Legal Metrology Packaged Commodities (2011)</div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Heading 2 / Panel Title</span>
                <div className="text-sm font-semibold text-slate-900">Principal Display Panel Declarations &amp; Evidence</div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Body Text (14px/16px)</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Every package shall bear thereon legible, definite, distinct and conspicuous declarations of name, quantity, and retail price.
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Tabular Monospace (Citations & Measurements)" isCompact>
            <div className="space-y-3 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Statutory Rule Codes</span>
                <div className="text-sm font-bold text-slate-800">LMPC-R6(1)(a) • FSSAI-2.2.1 • BIS-IS14543</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Measurements & Numeral Thresholds</span>
                <div className="text-xs text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">
                  <div>Net Qty: 1000 ml | Min Numeral Height: &gt;= 4.0 mm</div>
                  <div>Detected Height: 2.8 mm [NON-COMPLIANT DELTA: -1.2mm]</div>
                  <div>Unit Sale Price Formula: ₹145.00 / 1000ml = ₹0.145/ml</div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      {/* 3. Button Component Hierarchy */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">3. Button Component Hierarchy</h3>
          <p className="text-xs text-slate-500">
            2x horizontal padding rule, defined hover/active states, and accessible focus outlines.
          </p>
        </div>

        <Panel>
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-3">
                Variants
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" leftIcon={<Scan className="w-4 h-4" />}>
                  Scan Product
                </Button>
                <Button variant="brand-accent" leftIcon={<ShieldCheck className="w-4 h-4" />}>
                  Official Attestation
                </Button>
                <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
                  Filter Rules
                </Button>
                <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                  Export CSV
                </Button>
                <Button variant="danger" leftIcon={<AlertTriangle className="w-4 h-4" />}>
                  Issue Violation Notice
                </Button>
                <Button variant="ghost">Dismiss</Button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-3">
                Sizes &amp; Loading States
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small Button (sm)</Button>
                <Button size="md">Medium Default (md)</Button>
                <Button size="lg">Large Primary (lg)</Button>
                <Button size="md" isLoading>
                  Analyzing Label...
                </Button>
                <Button size="md" disabled>
                  Disabled State
                </Button>
              </div>
            </div>
          </div>
        </Panel>
      </section>

      {/* 4. Badges & Semantic Status Indicators */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">4. Status Indicators &amp; Badges</h3>
          <p className="text-xs text-slate-500">
            Standardized pills with dot markers and high color contrast.
          </p>
        </div>

        <Panel>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2 p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] font-mono text-slate-500 uppercase block">Compliant (Pass)</span>
              <div className="space-y-2">
                <Badge variant="pass" withDot>
                  PASS
                </Badge>
                <div>
                  <StatusIndicator status="pass" />
                </div>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] font-mono text-slate-500 uppercase block">Non-Compliant (Breach)</span>
              <div className="space-y-2">
                <Badge variant="non_compliant" withDot>
                  POTENTIAL NON-COMPLIANCE
                </Badge>
                <div>
                  <StatusIndicator status="non_compliant" />
                </div>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] font-mono text-slate-500 uppercase block">Review Required</span>
              <div className="space-y-2">
                <Badge variant="review_required" withDot>
                  REVIEW REQUIRED
                </Badge>
                <div>
                  <StatusIndicator status="review_required" />
                </div>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] font-mono text-slate-500 uppercase block">Official Brand / Info</span>
              <div className="space-y-2">
                <Badge variant="brand">STATUTORY AUDIT</Badge>
                <div>
                  <Badge variant="info">FSSAI MANDATE</Badge>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </section>

      {/* 5. Inputs & Form Controls */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">5. Form Controls &amp; File Dropzones</h3>
          <p className="text-xs text-slate-500">
            Dense enterprise inputs with clear validation feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Panel title="Form Field Elements">
            <div className="space-y-4">
              <Input
                label="Search Commodity or Rule Code"
                placeholder="e.g. Rule 6(1)(e) or Sunflower Oil"
                leftIcon={<Search className="w-4 h-4" />}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                hint="Filter active findings by keyword or legal section"
              />

              <Select
                label="Select Commodity Category"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                options={[
                  { label: 'Edible Oils & Vegetable Fats', value: 'edible_oils' },
                  { label: 'Packaged Drinking Water & Mineral Water', value: 'packaged_water' },
                  { label: 'Food Grains, Atta & Pulses', value: 'grains' },
                  { label: 'Cosmetics & Personal Care', value: 'cosmetics' },
                ]}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                  Segmented Rule Filter
                </label>
                <SegmentedControl
                  value={segValue}
                  onChange={setSegValue}
                  options={[
                    { label: 'All Findings', value: 'all', count: 9 },
                    { label: 'Violations', value: 'violations', count: 2 },
                    { label: 'Review Req.', value: 'review', count: 1 },
                  ]}
                />
              </div>
            </div>
          </Panel>

          <Panel title="Field Camera / Image Dropzone">
            <FileDropzone
              onFileSelect={(file) => alert(`Selected file: ${file.name}`)}
              label="Field Capture &amp; High-Resolution Upload"
              sublabel="Drag product package photo here or tap to take field snapshot"
            />
          </Panel>
        </div>
      </section>

      {/* 6. Deterministic Score & Rule Meter */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">6. Compliance Score &amp; Rule Meter</h3>
          <p className="text-xs text-slate-500">
            Factual weighted breakdown across Legal Metrology, Weights &amp; Measures, and Consumer Grievance.
          </p>
        </div>

        <ScoreMeter
          score={78}
          status="review_required"
          passCount={7}
          nonCompliantCount={1}
          reviewRequiredCount={1}
          totalRules={9}
        />
      </section>
    </div>
  );
};
