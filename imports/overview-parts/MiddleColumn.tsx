"use client";

import { TrendingUp, Sparkles } from "lucide-react";
import WasteStreamChart from "../WasteStream-1";

interface Props {
  isGlass: boolean;
  greeting: { title: string; subtitle: string };
}

export default function MiddleColumn({ isGlass, greeting }: Props) {
  return (
    <div className="xl:col-span-6 flex flex-col gap-6">
      {/* Waste Stream Chart */}
      <div
        className={`${
          isGlass
            ? "bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
            : "bg-white dark:bg-[#0c1017]/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
        } text-black dark:text-white rounded-[32px] p-6 min-h-[400px] flex flex-col justify-between overflow-hidden transition-all duration-300`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${isGlass ? "text-[#4ED0F5]" : "text-[#0891B2] dark:text-[#00E5FF]"}`} />
            <span className="text-xs font-black uppercase tracking-widest">{greeting.title}</span>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-white/40 font-bold uppercase tracking-wider">
            {greeting.subtitle}
          </div>
        </div>

        <div className="flex-1 w-full h-full min-h-[280px] flex items-center justify-center">
          <WasteStreamChart />
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Daily Active Time */}
        <div
          className={`${
            isGlass
              ? "bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
              : "bg-white dark:bg-gradient-to-b dark:from-[#1b2028] dark:via-[#13171f] dark:to-[#0c1017] border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
          } rounded-[32px] p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group transition-all duration-300`}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#00E5FF]/60 dark:bg-[#00E5FF]/70" />
          <div>
            <p className="text-[10px] text-slate-500 dark:text-white/40 font-extrabold uppercase tracking-widest leading-none mb-2">
              Daily Active Time
            </p>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
              8h 40m <span className="text-sm font-medium text-slate-400 dark:text-white/40">/ 10h</span>
            </h4>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-[#00FF87] mt-1.5 inline-flex items-center gap-0.5">↑ 12%</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">
              <span>Usage Rate</span>
              <span className={`${isGlass ? "text-[#4ED0F5]" : "text-[#0891B2] dark:text-[#00E5FF]"} font-black`}>80%</span>
            </div>
            <div className={`h-1.5 w-full ${isGlass ? "bg-slate-100/50 dark:bg-white/5" : "bg-slate-100 dark:bg-black/40"} rounded-full overflow-hidden`}>
              <div
                className={`h-full ${isGlass ? "bg-[#4ED0F5]" : "bg-[#0891B2] dark:bg-[#00E5FF]"} rounded-full`}
                style={{ width: "80%" }}
              />
            </div>
          </div>
        </div>

        {/* Collection Rate */}
        <div
          className={`${
            isGlass
              ? "bg-white/40 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.03)]"
              : "bg-white dark:bg-gradient-to-b dark:from-[#353b43] dark:via-[#262c33] dark:to-[#171a1f] border border-slate-200/80 dark:border-white/10 shadow-[0_8px_32px_rgba(139,94,60,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
          } rounded-[32px] p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group transition-all duration-300`}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#FF9F00]/60 dark:bg-[#FF9F00]/70" />
          <div>
            <p className="text-[10px] text-slate-500 dark:text-white/40 font-extrabold uppercase tracking-widest leading-none mb-2">
              Collection Rate
            </p>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
              72.4 <span className="text-xs font-semibold text-slate-500 dark:text-white/55">btl/hr</span>
            </h4>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-[#00FF87] mt-1.5 inline-flex items-center gap-0.5">↑ 8.3%</span>
          </div>

          <button
            className={`w-full mt-4 flex items-center justify-center gap-2 ${
              isGlass
                ? "bg-[#4ED0F5]/10 hover:bg-[#4ED0F5]/20 text-[#4ED0F5] border border-[#4ED0F5]/10"
                : "bg-cyan-50 dark:bg-white/5 border border-cyan-100 dark:border-white/5 text-[#0891B2] dark:text-[#00E5FF] hover:bg-cyan-100 dark:hover:bg-white/10"
            } rounded-2xl py-2.5 text-[10px] font-black uppercase tracking-widest transition-all shadow-inner`}
          >
            <Sparkles className="w-4 h-4" />
            Optimal Flow
          </button>
        </div>

        {/* System Health */}
        <div
          className={`${
            isGlass
              ? "bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
              : "bg-white dark:bg-gradient-to-b dark:from-[#1b2028] dark:via-[#13171f] dark:to-[#0c1017] border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
          } rounded-[32px] p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group transition-all duration-300`}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#00FF87]/60 dark:bg-[#00FF87]/70" />
          <div>
            <p className="text-[10px] text-slate-500 dark:text-white/40 font-extrabold uppercase tracking-widest leading-none mb-3">
              System Health
            </p>

            <div className="space-y-2">
              {[
                { label: "Dispatch", val: 90, color: isGlass ? "bg-[#4ED0F5]" : "bg-[#0891B2] dark:bg-[#00E5FF]" },
                { label: "Transit", val: 82, color: "bg-[#FF9F00]" },
                { label: "Completed", val: 88, color: "bg-[#00FF87]" },
                { label: "Pipeline", val: 98.4, color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-[10px] font-black text-slate-500 dark:text-white/60">
                  <span className="w-14 shrink-0 text-slate-400 dark:text-white/55">{item.label}</span>
                  <div className={`flex-1 h-1.5 ${isGlass ? "bg-slate-100/50 dark:bg-white/5" : "bg-slate-100 dark:bg-black/40"} rounded-full overflow-hidden`}>
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                  </div>
                  <span className="text-slate-800 dark:text-white font-black w-10 text-right">{item.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
