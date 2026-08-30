import React from 'react';
import { InspectionSummary } from '../../types';
import { Layers, Tag } from 'lucide-react';

interface CategoryBreakdownProps {
  inspections: InspectionSummary[];
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ inspections }) => {
  // Aggregate real categories from inspections
  const categoryMap = new Map<string, { total: number; pass: number; issues: number; review: number }>();

  inspections.forEach((item) => {
    const cat = item.category || 'General Commodity';
    const current = categoryMap.get(cat) || { total: 0, pass: 0, issues: 0, review: 0 };
    current.total += 1;
    if (item.overallStatus === 'pass') current.pass += 1;
    else if (item.overallStatus === 'non_compliant') current.issues += 1;
    else current.review += 1;
    categoryMap.set(cat, current);
  });

  const categories = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      ...data,
      passRate: data.total > 0 ? Math.round((data.pass / data.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  if (categories.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-900" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Commodity Categories
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
        </span>
      </div>

      <div className="space-y-2.5">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900">{cat.name}</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono font-bold text-slate-700">
                  {cat.total} {cat.total === 1 ? 'item' : 'items'}
                </span>
                <span
                  className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    cat.passRate >= 80
                      ? 'bg-emerald-100 text-emerald-800'
                      : cat.passRate >= 50
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {cat.passRate}% Pass
                </span>
              </div>
            </div>

            {/* Sub-bar */}
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex mt-2">
              {cat.pass > 0 && (
                <div
                  style={{ width: `${(cat.pass / cat.total) * 100}%` }}
                  className="bg-emerald-500"
                />
              )}
              {cat.issues > 0 && (
                <div
                  style={{ width: `${(cat.issues / cat.total) * 100}%` }}
                  className="bg-rose-500"
                />
              )}
              {cat.review > 0 && (
                <div
                  style={{ width: `${(cat.review / cat.total) * 100}%` }}
                  className="bg-amber-400"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
