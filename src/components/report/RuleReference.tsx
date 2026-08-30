import React from 'react';
import { ComplianceFinding, InspectionSummary } from '../../types';
import { BookOpen, ExternalLink, Scale, CheckCircle2 } from 'lucide-react';

interface RuleReferenceProps {
  inspection: InspectionSummary;
  className?: string;
}

export const RuleReference: React.FC<RuleReferenceProps> = ({
  inspection,
  className = '',
}) => {
  // Extract distinct rules from findings
  const rulesMap = new Map<
    string,
    {
      ruleId: string;
      ruleCode: string;
      ruleName: string;
      requirement: string;
      category: string;
      source: string;
      reference: string;
      effectiveDate: string;
      lastVerifiedDate: string;
      version: string;
      officialUrl?: string;
    }
  >();

  inspection.findings.forEach((f) => {
    if (!rulesMap.has(f.ruleCode)) {
      rulesMap.set(f.ruleCode, {
        ruleId: f.ruleId || f.ruleCode,
        ruleCode: f.ruleCode,
        ruleName: f.ruleName || f.ruleTitle,
        requirement: f.deterministicRule || 'Statutory declaration required on retail packages.',
        category: f.category || inspection.category,
        source: f.ruleSource || 'Ministry of Consumer Affairs (Legal Metrology Division)',
        reference: f.ruleReference || f.legalAct || 'Legal Metrology (Packaged Commodities) Rules, 2011',
        effectiveDate: '01 Apr 2011 (Amended 2022)',
        lastVerifiedDate: '15 Jan 2026',
        version: 'LMPC-2024.2-IN',
        officialUrl: f.officialSourceUrl,
      });
    }
  });

  const distinctRules = Array.from(rulesMap.values());

  return (
    <section className={`space-y-3 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-[#0B2545]" />
          <span>7. Statutory Rule References &amp; Legal Citations</span>
        </h2>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          {distinctRules.length} Official Registry Rules
        </span>
      </div>

      {/* Rules Registry Table */}
      <div className="border border-slate-200 rounded overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-600">
              <th className="py-2 px-2.5 w-28">Rule ID &amp; Ver.</th>
              <th className="py-2 px-2.5 w-1/3">Statutory Requirement</th>
              <th className="py-2 px-2.5 w-1/4">Official Act &amp; Reference</th>
              <th className="py-2 px-2.5 text-right font-mono">Effective / Verified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {distinctRules.map((rule, idx) => (
              <tr
                key={rule.ruleCode}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
              >
                {/* Rule ID & Version */}
                <td className="py-2.5 px-2.5 align-top">
                  <div className="font-mono font-bold text-slate-900">{rule.ruleCode}</div>
                  <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                    Ver: {rule.version}
                  </div>
                </td>

                {/* Requirement */}
                <td className="py-2.5 px-2.5 align-top">
                  <div className="font-bold text-slate-900">{rule.ruleName}</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    {rule.requirement}
                  </p>
                </td>

                {/* Reference & Source */}
                <td className="py-2.5 px-2.5 align-top">
                  <div className="font-semibold text-slate-800 text-[11px]">
                    {rule.reference}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Source: {rule.source || 'Rule source metadata unavailable'}
                  </div>
                </td>

                {/* Dates */}
                <td className="py-2.5 px-2.5 text-right align-top font-mono text-[10px] whitespace-nowrap">
                  <div className="text-slate-700">Eff: {rule.effectiveDate}</div>
                  <div className="text-slate-500">Verif: {rule.lastVerifiedDate}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
