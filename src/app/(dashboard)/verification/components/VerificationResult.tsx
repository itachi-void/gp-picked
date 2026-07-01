"use client";

import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { VerifyResponse } from "../types";

interface VerificationResultProps {
  result: VerifyResponse;
  orderId: number;
  onReset: () => void;
  onResolve: (id: number, resultType: "verified" | "rejected") => void;
}

export function VerificationResult({ result, orderId, onReset, onResolve }: VerificationResultProps) {
  return (
    <div className="mc-fade-in-up">
      <div className="text-center py-4">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">AI Analysis Complete</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Verified Date: {new Date(result.verificationDate).toLocaleDateString()}
        </p>
      </div>

      {result.message && (
        <div className="mt-2 max-w-md mx-auto p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
          <XCircle className="w-4 h-4" /> {result.message}
        </div>
      )}

      <div className="mt-4 max-w-md mx-auto grid grid-cols-2 gap-4 bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/5">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Detected Bottles</span>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{result.finalBottlesCount} bottles</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Points to Award</span>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{result.finalPoints} pts</p>
        </div>
        <div className="space-y-1 col-span-2 border-t border-slate-200 dark:border-white/10 pt-3">
          <span className="text-[10px] text-slate-400 uppercase font-bold">System Status</span>
          <p className="text-md font-semibold text-slate-800 dark:text-slate-200">{result.status || "Completed"}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 text-xs font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Re-upload
        </button>
        
        <button
          onClick={() => onResolve(orderId, "rejected")}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold cursor-pointer shadow-md transition-colors"
        >
          <XCircle className="w-4 h-4" /> Reject
        </button>
        
        <button
          onClick={() => onResolve(orderId, "verified")}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer shadow-md transition-colors"
        >
          <CheckCircle className="w-4 h-4" /> Accept & Complete
        </button>
      </div>
    </div>
  );
}
