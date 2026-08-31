import React, { useState, useMemo } from 'react';
import { LEGAL_RULES_MASTER, LegalRuleMasterItem } from '../data/legalRulesMaster';
import { Badge } from '../design-system/Badge';
import { Input } from '../design-system/Input';
import { Button } from '../design-system/Button';
import {
  BookOpen,
  Search,
  Scale,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  HelpCircle,
  Clock,
  Building2,
  FileCheck2,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface RuleMasterViewProps {
  onScanNewRule?: () => void;
  onOpenInspectionSample?: () => void;
}

export function RuleMasterView({ onScanNewRule, onOpenInspectionSample }: RuleMasterViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRuleId, setSelectedRuleId] = useState<string>(LEGAL_RULES_MASTER[0].id);

  // Filter rules based on search & category
  const filteredRules = useMemo(() => {
    return LEGAL_RULES_MASTER.filter((rule) => {
      const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        rule.ruleCode.toLowerCase().includes(q) ||
        rule.ruleNumber.toLowerCase().includes(q) ||
        rule.title.toLowerCase().includes(q) ||
        rule.actName.toLowerCase().includes(q) ||
        rule.description.toLowerCase().includes(q) ||
        rule.penaltyProvision.toLowerCase().includes(q) ||
        rule.statutoryReference.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  const activeRule = useMemo(() => {
    return (
      LEGAL_RULES_MASTER.find((r) => r.id === selectedRuleId) ||
      filteredRules[0] ||
      LEGAL_RULES_MASTER[0]
    );
  }, [selectedRuleId, filteredRules]);

  const categories = [
    { key: 'all', label: 'All Rules', count: LEGAL_RULES_MASTER.length },
    {
      key: 'lmpc_mandatory',
      label: 'LMPC Mandatory',
      count: LEGAL_RULES_MASTER.filter((r) => r.category === 'lmpc_mandatory').length,
    },
    {
      key: 'weights_measures',
      label: 'Weights & Measures',
      count: LEGAL_RULES_MASTER.filter((r) => r.category === 'weights_measures').length,
    },
    {
      key: 'consumer_protection',
      label: 'Consumer Care',
      count: LEGAL_RULES_MASTER.filter((r) => r.category === 'consumer_protection').length,
    },
    {
      key: 'fssai_food_safety',
      label: 'FSSAI Food Safety',
      count: LEGAL_RULES_MASTER.filter((r) => r.category === 'fssai_food_safety').length,
    },
    {
      key: 'origin_import',
      label: 'Country of Origin',
      count: LEGAL_RULES_MASTER.filter((r) => r.category === 'origin_import').length,
    },
    {
      key: 'standards_bis',
      label: 'Standards & BIS',
      count: LEGAL_RULES_MASTER.filter((r) => r.category === 'standards_bis').length,
    },
    {
      key: 'misleading_claims',
      label: 'Misleading Claims',
      count: LEGAL_RULES_MASTER.filter((r) => r.category === 'misleading_claims').length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-[#0B2545] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Scale className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Legal Metrology &amp; Statutory Rule Master
                </h2>
                <span className="font-mono text-[11px] font-bold bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                  {LEGAL_RULES_MASTER.length} Active Statutory Rules
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                Official compendium of statutory rules under the{' '}
                <strong className="text-slate-800">
                  Legal Metrology (Packaged Commodities) Rules 2011
                </strong>
                , FSSAI Labelling Regulations, and Consumer Protection Acts enforced by the BharatLabel verification engine.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onScanNewRule && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<FileCheck2 className="w-4 h-4 text-blue-300" />}
                onClick={onScanNewRule}
              >
                Scan Product Against Rules
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by rule code, title, section, penalty..."
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              size="sm"
            />
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Showing <span className="font-bold text-slate-900">{filteredRules.length}</span> of{' '}
            {LEGAL_RULES_MASTER.length} rules
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#0B2545] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Layout: Left List, Right Detailed Rule Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Rule Directory List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
              Statutory Provisions Directory
            </span>
            <span className="text-[11px] font-mono text-slate-400">Click to inspect</span>
          </div>

          {filteredRules.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500">
              <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-700">No matching rules found</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Try searching for another keyword or clear category filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 text-xs text-blue-700 font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredRules.map((rule) => {
              const isSelected = rule.id === activeRule.id;
              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-[#0B2545] bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200">
                        {rule.ruleCode}
                      </span>
                      <span className="font-mono text-[11px] text-slate-600 font-semibold">
                        {rule.ruleNumber}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                      {rule.status}
                    </span>
                  </div>

                  <h4
                    className={`text-xs font-bold leading-snug ${
                      isSelected ? 'text-slate-950' : 'text-slate-900'
                    }`}
                  >
                    {rule.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {rule.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium truncate max-w-[200px]">
                      {rule.actName.split('(')[0]}
                    </span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        isSelected ? 'text-blue-900 font-bold' : 'text-slate-500'
                      }`}
                    >
                      Inspect <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: In-Depth Rule Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {activeRule ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-6 sticky top-20">
              {/* Header */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-[#0B2545] px-2.5 py-1 rounded">
                      {activeRule.ruleCode}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {activeRule.ruleNumber}
                    </span>
                    <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                      {activeRule.categoryLabel}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded">
                    ENFORCED
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-950 leading-snug">
                  {activeRule.title}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{activeRule.actName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">{activeRule.authority}</span>
                  </div>
                </div>
              </div>

              {/* Statutory Mandate Scope */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-800" />
                  Statutory Description &amp; Scope
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs text-slate-800 leading-relaxed">
                  {activeRule.description}
                </div>
              </div>

              {/* Key Compliance Requirements */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Key Statutory Requirements (What BharatLabel Checks)
                </h4>
                <ul className="space-y-2">
                  {activeRule.keyRequirements.map((req, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-700 bg-white border border-slate-200/80 p-2.5 rounded-md"
                    >
                      <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exemptions if any */}
              {activeRule.exemptions && activeRule.exemptions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                    Permitted Statutory Exemptions
                  </h4>
                  <div className="bg-amber-50/70 border border-amber-200 rounded-md p-3 text-xs text-amber-900 space-y-1">
                    {activeRule.exemptions.map((ex, idx) => (
                      <p key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{ex}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Penalties & Legal Ramifications */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-rose-900 tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                  Penal Provisions &amp; Non-Compliance Liabilities
                </h4>
                <div className="bg-rose-50 border border-rose-200 rounded-md p-3.5 text-xs text-rose-950 leading-relaxed font-medium">
                  {activeRule.penaltyProvision}
                </div>
              </div>

              {/* Automated Verification Engine Details */}
              <div className="bg-slate-900 text-slate-100 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    AI Vision &amp; Deterministic Rule Execution
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Deterministic Engine
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeRule.verificationMethod}
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Citation: {activeRule.statutoryReference}</span>
                  <span>Effective: {activeRule.effectiveDate}</span>
                </div>
              </div>

              {/* Action Button */}
              {onScanNewRule && (
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<FileCheck2 className="w-4 h-4 text-blue-300" />}
                    onClick={onScanNewRule}
                  >
                    Verify a Package with This Rule
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Select a Rule to Inspect Details</h4>
              <p className="text-xs text-slate-500 mt-1">
                Choose a rule from the statutory directory on the left to see complete legal requirements and penalty provisions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
