import React from 'react';

export const DashboardLoadingState: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard data">
      {/* Header Skeleton */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-72 bg-slate-100 rounded" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="h-6 w-6 bg-slate-100 rounded" />
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Status Overview Skeleton */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <div className="h-4 w-44 bg-slate-200 rounded" />
        <div className="h-3 w-full bg-slate-100 rounded-full" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="h-10 bg-slate-50 border border-slate-100 rounded" />
          <div className="h-10 bg-slate-50 border border-slate-100 rounded" />
          <div className="h-10 bg-slate-50 border border-slate-100 rounded" />
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div className="h-4 w-40 bg-slate-200 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-50 rounded border border-slate-100" />
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-slate-50 rounded border border-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
