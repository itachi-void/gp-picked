import React from "react";

export function LoadingHistory() {
  return (
    <div className="space-y-3 py-2">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-4 py-3 animate-pulse">
          <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-white/10 shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
            <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/4" />
          </div>
          <div className="w-16 h-4 bg-slate-200 dark:bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}
