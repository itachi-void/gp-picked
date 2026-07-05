"use client";

import { motion } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";

interface Props {
  isGlass: boolean;
  setDashboardStyle: (s: "classic" | "glass") => void;
  timeFilter: "today" | "week" | "month";
  setTimeFilter: (t: "today" | "week" | "month") => void;
  requestsCount: number;
  driversCount: number;
}

function AnimatedCounter({ end, duration = 1.5 }: { end: number; duration?: number }) {
  // simple inline counter to keep header independent
  return <>{end.toLocaleString()}</>;
}

export default function OverviewHeader({
  isGlass,
  setDashboardStyle,
  timeFilter,
  setTimeFilter,
  requestsCount,
  driversCount,
}: Props) {
  return (
    <div
      className={`flex flex-col xl:flex-row xl:items-center justify-between ${
        isGlass
          ? "bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
          : "bg-white dark:bg-[#0a0e14]/95 backdrop-blur-2xl border border-slate-200 dark:border-[#00E5FF]/15 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.25)]"
      } p-6 rounded-[32px] mb-8 gap-6 transition-all duration-300 relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent dark:bg-gradient-to-r dark:from-transparent dark:via-[#00E5FF]/70 dark:to-transparent" />

      <div className="flex items-center gap-3">
        <div className="size-10 bg-[#0891B2] dark:bg-[#00E5FF] rounded-2xl flex items-center justify-center text-white dark:text-[#131518] shadow-lg shadow-[#0891B2]/20 dark:shadow-[0_0_20px_rgba(0,229,255,0.5)]">
          <TrendingUp className="size-5" />
        </div>
        <div>
          <h1 className="text-sm font-black tracking-widest uppercase">CREATORA ECOVOID</h1>
          <p className="text-[9px] text-slate-400 dark:text-white/40 uppercase tracking-widest font-extrabold">
            Active System Console
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-400 dark:text-white/30">
        <div className="flex items-center gap-2 border-r border-slate-200/40 dark:border-white/5 pr-6">
          <span>Active Requests</span>
          <span className="text-lg font-black text-slate-900 dark:text-[#00E5FF] tracking-tight dark:drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]">
            <AnimatedCounter end={requestsCount} />
          </span>
        </div>
        <div className="flex items-center gap-2 border-r border-slate-200/40 dark:border-white/5 pr-6">
          <span>Route Drivers</span>
          <span className="text-lg font-black text-slate-900 dark:text-[#00E5FF] tracking-tight dark:drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]">
            <AnimatedCounter end={driversCount} />
          </span>
        </div>
        <div className="flex items-center gap-2 border-r border-slate-200/40 dark:border-white/5 pr-6">
          <span>Avg Dispatch</span>
          <span className="text-lg font-black text-slate-900 dark:text-[#00E5FF] tracking-tight dark:drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]">
            14<span className="text-[9px] text-slate-400 dark:text-[#00E5FF]/50 ml-0.5">min</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>CO₂ Saved</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            2,340<span className="text-[9px] text-emerald-500/60 dark:text-emerald-500/50 ml-0.5">kg</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setDashboardStyle(isGlass ? "classic" : "glass")}
          title={isGlass ? "Switch to Classic Edition" : "Switch to Glass Edition"}
          className="inline-flex items-center gap-1.5 bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 px-3 py-2.5 rounded-full shadow-inner transition-colors"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGlass ? "text-cyan-600 dark:text-[#4ED0F5]" : "text-slate-500"}`} />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-white/70">
            {isGlass ? "Glass" : "Classic"}
          </span>
        </button>

        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as any)}
          className="bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 text-black dark:text-white text-[10px] font-black uppercase tracking-wider rounded-full px-5 py-2.5 outline-none cursor-pointer shadow-inner transition-colors"
        >
          <option value="today">Today</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>

        <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-white/5 border border-black/5 dark:border-white/5 px-5 py-2.5 rounded-full shadow-sm">
          <motion.div
            className="w-2 h-2 bg-emerald-500 rounded-full"
            animate={{
              scale: [1, 1.25, 1],
              boxShadow: [
                "0 0 0 0 rgba(16, 185, 129, 0.4)",
                "0 0 0 5px rgba(16, 185, 129, 0)",
                "0 0 0 0 rgba(16, 185, 129, 0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">LIVE FEED</span>
        </div>
      </div>
    </div>
  );
}
