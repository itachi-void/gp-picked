"use client";

import "@/app/components/motion/motion-components.css";
import { Leaf, Cloud, Recycle, Trees, Cpu, Droplets, Download, Target, CheckCircle, Circle } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useRoleContext } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import { tooltipStyle } from "@/app/utils/chartTheme";

const heroStats = [
  { label: "CO₂ Avoided", value: "1,284", unit: "tons", Icon: Cloud, accent: "emerald" },
  { label: "Plastic Diverted", value: "342,500", unit: "kg", Icon: Recycle, accent: "teal" },
  { label: "Paper Saved", value: "128,400", unit: "kg", Icon: Trees, accent: "lime" },
  { label: "E-Waste Recycled", value: "18,920", unit: "kg", Icon: Cpu, accent: "violet" },
  { label: "Water Saved", value: "4.2M", unit: "liters", Icon: Droplets, accent: "sky" },
];
const annualGoals = [
  { label: "CO₂ avoided", target: "2,000 t", pct: 64, accent: "emerald" },
  { label: "Plastic diverted", target: "500,000 kg", pct: 68, accent: "teal" },
  { label: "Paper saved", target: "200,000 kg", pct: 64, accent: "lime" },
  { label: "E-waste recycled", target: "30,000 kg", pct: 63, accent: "violet" },
  { label: "Water saved", target: "7M L", pct: 60, accent: "sky" },
];

const milestones = [
  { q: "Q1", label: "Launch zone expansion", done: true },
  { q: "Q2", label: "1M kg plastic diverted", done: true },
  { q: "Q3", label: "EU compliance certification", done: false, current: true },
  { q: "Q4", label: "Net positive impact report", done: false },
];

const stackedData = [
  { m: "Jan", Plastic: 80, Glass: 50, Metal: 30, Paper: 40 },
  { m: "Feb", Plastic: 90, Glass: 55, Metal: 32, Paper: 42 },
  { m: "Mar", Plastic: 100, Glass: 60, Metal: 35, Paper: 48 },
  { m: "Apr", Plastic: 110, Glass: 62, Metal: 36, Paper: 50 },
  { m: "May", Plastic: 120, Glass: 70, Metal: 40, Paper: 55 },
  { m: "Jun", Plastic: 130, Glass: 72, Metal: 42, Paper: 58 },
  { m: "Jul", Plastic: 140, Glass: 78, Metal: 45, Paper: 62 },
  { m: "Aug", Plastic: 150, Glass: 82, Metal: 47, Paper: 66 },
  { m: "Sep", Plastic: 160, Glass: 88, Metal: 50, Paper: 70 },
  { m: "Oct", Plastic: 165, Glass: 90, Metal: 52, Paper: 72 },
  { m: "Nov", Plastic: 175, Glass: 95, Metal: 55, Paper: 78 },
  { m: "Dec", Plastic: 185, Glass: 100, Metal: 58, Paper: 82 },
];

const topZones = [
  { zone: "Central", impact: 412 },
  { zone: "East", impact: 360 },
  { zone: "North", impact: 295 },
  { zone: "South", impact: 250 },
  { zone: "West", impact: 218 },
];

export default function SustainabilityPage() {
  useRoleContext();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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

      <GlassCard className="p-6">
        <h3 className="text-lg tracking-tight text-slate-900 dark:text-white mb-1">Quarterly Milestones</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">2026 sustainability roadmap</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {milestones.map((m, i) => (
            <div key={m.q} className="mc-card-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={`p-4 rounded-2xl border ${m.current ? "border-emerald-400/40 bg-emerald-500/5" : "border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/5"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {m.done ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Circle className={`w-5 h-5 ${m.current ? "text-emerald-500" : "text-slate-400"}`} />}
                  <span className="text-sm text-slate-500 dark:text-slate-400" style={{ fontWeight: 600 }}>{m.q}</span>
                </div>
                <p className="text-sm text-slate-900 dark:text-white">{m.label}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg tracking-tight text-slate-900 dark:text-white mb-1">Monthly CO₂ Saved by Material</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Stacked tons over the year</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stackedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="m" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle(isDark)} />
              <Legend />
              <Area type="monotone" dataKey="Plastic" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Glass" stackId="1" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Metal" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Paper" stackId="1" stroke="#84cc16" fill="#84cc16" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg tracking-tight text-slate-900 dark:text-white mb-1">Top 5 Zones by Impact</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">CO₂ avoided (tons)</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topZones}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="zone" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle(isDark)} />
              <Bar dataKey="impact" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}
