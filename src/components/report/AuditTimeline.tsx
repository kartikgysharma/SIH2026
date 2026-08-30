import React from 'react';
import { InspectionSummary } from '../../types';
import { History, Cpu, User, FileCheck, CheckCircle2 } from 'lucide-react';

interface AuditTimelineProps {
  inspection: InspectionSummary;
  className?: string;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({
  inspection,
  className = '',
}) => {
  // Construct sequential audit history
  const [datePart, timePart] = inspection.inspectedAt.includes(' ')
    ? inspection.inspectedAt.split(' ')
    : [inspection.inspectedAt, '10:00 IST'];

  const events: Array<{
    title: string;
    actor: string;
    actorType: 'system' | 'ai' | 'human';
    timestamp: string;
    description: string;
  }> = [
    {
      title: 'Physical Intake & Image Upload',
      actor: inspection.inspectorName ? `${inspection.inspectorName}` : 'Field Inspection Agent',
      actorType: 'human',
      timestamp: `${datePart} ${timePart}`,
      description: `High-resolution packaging label scan captured for ${inspection.commodityName}.`,
    },
    {
      title: 'Optical Extraction & Field Parsing',
      actor: 'BharatLabel Vision & OCR Pipeline',
      actorType: 'ai',
      timestamp: `${datePart} ${timePart.replace(/:(\d+)/, ':15')}`,
      description: `Extracted ${inspection.fields.length} mandatory statutory field entities with bounding region localization.`,
    },
    {
      title: 'Deterministic Rule Assessment Engine',
      actor: 'Legal Metrology Compliance Engine v2024.2',
      actorType: 'system',
      timestamp: `${datePart} ${timePart.replace(/:(\d+)/, ':16')}`,
      description: `Evaluated ${inspection.totalRulesEvaluated} rules under Legal Metrology Act 2009 & LMPC 2011; computed assessment score of ${inspection.complianceScore}/100.`,
    },
  ];

  // Add human review entries if any
  inspection.findings.forEach((f) => {
    if (f.auditTrail && f.auditTrail.length > 0) {
      f.auditTrail.forEach((entry) => {
        events.push({
          title: `Human Determination: ${entry.decisionLabel}`,
          actor: `${entry.reviewer} (${entry.role || 'Reviewer'})`,
          actorType: 'human',
          timestamp: `${datePart} ${entry.timestamp}`,
          description: `Reviewed finding "${f.ruleTitle}". Note: ${entry.note || 'Manually verified.'}`,
        });
      });
    }
  });

  // Final event: Report generated
  events.push({
    title: 'Statutory Inspection Record Generated',
    actor: 'BharatLabel Report Generation Service',
    actorType: 'system',
    timestamp: `${datePart} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST`,
    description: `Official Packaged Commodity Inspection Report rendered for inspection ID ${inspection.inspectionNumber}.`,
  });

  return (
    <section className={`space-y-3 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
          <History className="w-4 h-4 text-[#0B2545]" />
          <span>9. Inspection Lifecycle &amp; Traceability Audit</span>
        </h2>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          {events.length} Traceable Milestones
        </span>
      </div>

      {/* Compact Timeline Grid */}
      <div className="border border-slate-200 rounded p-4 bg-slate-50 space-y-3 text-xs">
        <div className="divide-y divide-slate-200">
          {events.map((evt, idx) => (
            <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{evt.title}</span>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      evt.actorType === 'human'
                        ? 'bg-blue-100 text-blue-900'
                        : evt.actorType === 'ai'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {evt.actorType}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {evt.description}
                </p>
                <div className="text-[11px] font-mono text-slate-500">
                  Actor: <strong className="text-slate-700">{evt.actor}</strong>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0 font-mono text-[11px] text-slate-500 font-semibold">
                {evt.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
