"use client";

import { Cpu } from "lucide-react";

export function VerificationLoading() {
  return (
    <div className="mc-fade-in flex flex-col items-center text-center py-10">
      <div className="mc-spin">
        <Cpu className="w-16 h-16 text-violet-500" />
      </div>
      <p className="mt-5 text-sm text-slate-600 dark:text-slate-300 font-semibold" style={{ fontWeight: 600 }}>
        Uploading verification photo and executing AI scanner model comparison...
      </p>
      <div className="mt-4 w-64 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse w-full" />
      </div>
      <p className="mt-2 text-xs text-slate-400">Verifying shipment...</p>
    </div>
  );
}
