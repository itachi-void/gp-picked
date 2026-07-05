"use client";

import { useState, useEffect } from "react";
import "@/app/components/motion/motion-components.css";
import { Leaf, Cloud, Recycle, Trees, Cpu, Droplets, Download, Target, Loader2 } from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import api from "@/lib/axios";
import { useTheme } from "next-themes";




export default function SustainabilityPage() {
  useRoleContext();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [totalItems, setTotalItems] = useState(1420);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resItems = await api.get("/admin/total-requesting-items");
        const count = Number(resItems.data) || 1420;
        setTotalItems(count);
      } catch (e) {
        console.error("Failed to load requesting items count for sustainability:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const plasticDiverted = totalItems * 242; // in kg
  const co2Avoided = Math.round((plasticDiverted * 3.75) / 1000); // in tons
  const paperSaved = Math.round(plasticDiverted * 0.37); // in kg
  const eWasteRecycled = Math.round(plasticDiverted * 0.055); // in kg
  const waterSaved = (plasticDiverted * 12.2) / 1000000; // in M liters

  const heroStats = [
    { label: "CO₂ Avoided", value: co2Avoided.toLocaleString(), unit: "tons", Icon: Cloud, accent: "emerald" },
    { label: "Plastic Diverted", value: plasticDiverted.toLocaleString(), unit: "kg", Icon: Recycle, accent: "teal" },
    { label: "Paper Saved", value: paperSaved.toLocaleString(), unit: "kg", Icon: Trees, accent: "lime" },
    { label: "E-Waste Recycled", value: eWasteRecycled.toLocaleString(), unit: "kg", Icon: Cpu, accent: "violet" },
    { label: "Water Saved", value: `${waterSaved.toFixed(1)}M`, unit: "liters", Icon: Droplets, accent: "sky" },
  ];

  const annualGoals = [
    { label: "CO₂ avoided", target: "-", pct: Math.min(100, Math.round((co2Avoided / 2000) * 100)), accent: "emerald" },
    { label: "Plastic diverted", target: "-", pct: Math.min(100, Math.round((plasticDiverted / 500000) * 100)), accent: "teal" },
    { label: "Paper saved", target: "-", pct: Math.min(100, Math.round((paperSaved / 200000) * 100)), accent: "lime" },
    { label: "E-waste recycled", target: "-", pct: Math.min(100, Math.round((eWasteRecycled / 30000) * 100)), accent: "violet" },
    { label: "Water saved", target: "-", pct: Math.min(100, Math.round(((waterSaved * 1000000) / 7000000) * 100)), accent: "sky" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-emerald-600/80 font-medium text-lg">Calculating ecological impact footprint...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Sustainability</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Environmental impact, annual targets, and milestones</p>
          </div>
        </div>
        <button
          onClick={() => toast.success("Public impact report queued")}
          className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export Impact Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {heroStats.map((s, i) => {
          const a = accentMap[s.accent] || { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" };
          const Icon = s.Icon;
          return (
            <div key={s.label} className="mc-card-in hover-lift" style={{ animationDelay: `${i * 0.05}s` }}>
              <GlassCard className="p-5">
                <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1" style={{ fontWeight: 600 }}>
                  {s.value} <span className="text-sm text-slate-500 dark:text-slate-400" style={{ fontWeight: 400 }}>{s.unit}</span>
                </p>
              </GlassCard>
            </div>
          );
        })}
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Annual Target Tracker</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Progress toward 2026 goals</p>
        <div className="space-y-4">
          {annualGoals.map((g) => {
            const barColor: Record<string, string> = {
              emerald: "#10b981", teal: "#14b8a6", lime: "#84cc16", violet: "#8b5cf6", sky: "#0ea5e9",
            };
            return (
              <div key={g.label}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>{g.label}</span>
                  <span className="text-slate-500 dark:text-slate-400">{g.pct}% of {g.target}</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full mc-bar-fill"
                    style={{ "--bar-width": `${g.pct}%`, backgroundColor: barColor[g.accent] } as React.CSSProperties}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

    </div>
  );
}
