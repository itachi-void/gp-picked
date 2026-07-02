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
  const isError =
    result.message?.toLowerCase().includes("error") ||
    result.message?.toLowerCase().includes("mismatch") ||
    result.status?.toLowerCase().includes("mismatch");

  const IconComponent = isError ? XCircle : CheckCircle;
  const alertClasses = isError
    ? "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400";

  // Calculate similarity percentage safely (handles 0.95 or 95 formats)
  const hasScore = result.similarityScore !== undefined;
  const score = result.similarityScore ?? 0;
  const similarityValue = hasScore
    ? (score > 1 ? score : score * 100)
    : 0;

  // Recommendation generator based on score percentage
  const getRecommendation = (score: number, hasScore: boolean) => {
    if (!hasScore) {
      return {
        text: "AI Suggestion: not yet from api",
        classes: "bg-slate-500/10 border-slate-500/25 text-slate-700 dark:text-slate-400",
      };
    }
    if (score >= 85) {
      return {
        text: `AI Suggestion: Strong similarity detected (${score.toFixed(1)}%). The photo content matches the pickup request details. Recommended action: ACCEPT.`,
        classes: "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400",
      };
    } else if (score >= 60) {
      return {
        text: `AI Suggestion: Moderate similarity detected (${score.toFixed(1)}%). Some discrepancy in bottle counts or contents. Recommended action: REVIEW & CHECK visually.`,
        classes: "bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400",
      };
    } else {
      return {
        text: `AI Suggestion: Low similarity detected (${score.toFixed(1)}%). High discrepancy in bottle count or contents. Recommended action: REJECT shipment.`,
        classes: "bg-rose-500/10 border-rose-500/25 text-rose-700 dark:text-rose-400",
      };
    }
  };

  const rec = getRecommendation(similarityValue, hasScore);

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
        <div className={`mt-2 max-w-md mx-auto p-3.5 rounded-xl border text-xs font-bold text-center flex items-center justify-center gap-1.5 ${alertClasses}`}>
          <IconComponent className="w-4 h-4" /> {result.message}
        </div>
      )}

      {/* AI Recommendation Alert */}
      <div className={`mt-3 max-w-md mx-auto p-3.5 rounded-xl border text-xs font-semibold text-center ${rec.classes}`}>
        {rec.text}
      </div>

      {/* Metrics Grid */}
      <div className="mt-4 max-w-md mx-auto grid grid-cols-2 gap-4 bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/5">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Expected Bottles (Before)</span>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{result.countBefore != null ? `${result.countBefore} bottles` : "not yet from api"}</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Scanned Bottles (After)</span>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{result.countAfter != null ? `${result.countAfter} bottles` : "not yet from api"}</p>
        </div>
        <div className="space-y-1 col-span-2 border-t border-slate-200 dark:border-white/10 pt-3 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Similarity Score</span>
            <p className="text-md font-bold text-violet-600 dark:text-violet-400">{hasScore ? `${similarityValue.toFixed(1)}% match` : "not yet from api"}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Points to Award</span>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+{result.finalPoints} pts</p>
          </div>
        </div>
        <div className="space-y-1 col-span-2 border-t border-slate-200 dark:border-white/10 pt-3">
          <span className="text-[10px] text-slate-400 uppercase font-bold">System Status</span>
          <p className="text-md font-semibold text-slate-800 dark:text-slate-200">{result.status || "not yet from api"}</p>
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
