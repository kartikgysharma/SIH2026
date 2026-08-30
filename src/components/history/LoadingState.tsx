import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      {/* Table Header Skeleton */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 grid grid-cols-6 gap-4">
        <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded w-32 animate-pulse col-span-2" />
        <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded w-16 animate-pulse ml-auto" />
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-slate-100 p-2">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="px-4 py-4 grid grid-cols-6 gap-4 items-center animate-pulse">
            <div className="space-y-1.5">
              <div className="h-3.5 bg-slate-200 rounded w-28" />
              <div className="h-3 bg-slate-100 rounded w-20" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <div className="h-4 bg-slate-200 rounded w-48" />
              <div className="h-3 bg-slate-100 rounded w-32" />
            </div>
            <div>
              <div className="h-6 bg-slate-100 rounded w-16" />
            </div>
            <div>
              <div className="h-5 bg-slate-100 rounded w-24" />
            </div>
            <div className="flex justify-end">
              <div className="h-7 bg-slate-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
