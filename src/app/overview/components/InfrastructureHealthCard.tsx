import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, Zap, TrendingUp, Gauge, ArrowRight,
  Network, Boxes, Factory, Truck, Warehouse, Building2,
} from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";
import "@/app/components/motion/motion-components.css";

type Center = {
  id: string; label: string; short: string; color: string; ring: string;
  Icon: typeof Boxes; load: number; x: number; y: number;
};

const centers: Center[] = [
  { id: "main",         label: "Main Hub",      short: "MAIN", color: "#06b6d4", ring: "ring-cyan-400/40",    Icon: Boxes,    load: 67, x: 22, y: 58 },
  { id: "sorting",      label: "Sorting",        short: "SORT", color: "#a855f7", ring: "ring-violet-400/40", Icon: Building2,load: 89, x: 50, y: 26 },
  { id: "processing",   label: "Processing",     short: "PROC", color: "#f59e0b", ring: "ring-amber-400/40",  Icon: Factory,  load: 78, x: 78, y: 45 },
  { id: "distribution", label: "Distribution",   short: "DIST", color: "#10b981", ring: "ring-emerald-400/40",Icon: Truck,    load: 65, x: 58, y: 78 },
  { id: "east",         label: "East Station",   short: "EAST", color: "#0ea5e9", ring: "ring-sky-400/40",    Icon: Warehouse,load: 84, x: 20, y: 84 },
];

const links: [number, number][] = [[0, 1], [0, 3], [0, 4], [1, 2], [2, 3]];

type Stat = {
  label: string; value: string; delta: string; trend: "up" | "down";
  icon: typeof Zap; accent: "emerald" | "sky" | "violet" | "amber"; progress: number;
};

const stats: Stat[] = [
  { label: "Centers Online", value: "5/5",  delta: "All operational",      trend: "up", icon: Network,   accent: "emerald", progress: 100 },
  { label: "Throughput",     value: "1,240", delta: "t/hr · +4.2%",        trend: "up", icon: Zap,       accent: "sky",     progress: 82  },
  { label: "Efficiency",     value: "94%",  delta: "+1.8% vs last week",   trend: "up", icon: TrendingUp, accent: "violet",  progress: 94  },
  { label: "Overall Load",   value: "87%",  delta: "Capacity used",        trend: "up", icon: Gauge,     accent: "amber",   progress: 87  },
];

const tone: Record<Stat["accent"], { iconBg: string; iconFg: string; bar: string; deltaFg: string }> = {
  emerald: { iconBg: "bg-emerald-500/10", iconFg: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", deltaFg: "text-emerald-600 dark:text-emerald-400" },
  sky:     { iconBg: "bg-sky-500/10",     iconFg: "text-sky-600 dark:text-sky-400",         bar: "bg-sky-500",     deltaFg: "text-sky-600 dark:text-sky-400" },
  violet:  { iconBg: "bg-violet-500/10",  iconFg: "text-violet-600 dark:text-violet-400",   bar: "bg-violet-500",  deltaFg: "text-violet-600 dark:text-violet-400" },
  amber:   { iconBg: "bg-amber-500/10",   iconFg: "text-amber-600 dark:text-amber-400",     bar: "bg-amber-500",   deltaFg: "text-amber-600 dark:text-amber-400" },
};

export function InfrastructureHealthCard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
            Infrastructure Health
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live status across the recycling network
          </p>
        </div>
        <button
          onClick={() => router.push("/centers")}
          className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition-colors cursor-pointer"
        >
          Open Network Hub <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 items-stretch">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => {
            const Icon = s.icon;
            const t = tone[s.accent];
            return (
              <div
                key={s.label}
                className="mc-card-in relative p-4 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 overflow-hidden"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl ${t.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${t.iconFg}`} />
                  </div>
                  <span className={`text-[11px] ${t.deltaFg}`} style={{ fontWeight: 600 }}>
                    {s.delta}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-[26px] leading-none tracking-tight text-slate-900 dark:text-white mt-1" style={{ fontWeight: 700 }}>
                  {s.value}
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-slate-200/70 dark:bg-white/[0.08] overflow-hidden">
                  <div
                    className={`h-full ${t.bar}`}
                    style={{
                      width: mounted ? `${s.progress}%` : "0%",
                      transition: "width 0.7s cubic-bezier(0, 0, 0.2, 1)",
                      transitionDelay: `${0.2 + i * 0.05}s`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative rounded-2xl bg-gradient-to-br from-slate-100 via-white to-cyan-50 dark:from-white/[0.06] dark:via-white/[0.02] dark:to-cyan-500/[0.05] border border-slate-200 dark:border-white/10 overflow-hidden min-h-[220px]">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full text-slate-300 dark:text-white/10">
            <defs>
              <pattern id="net-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.15" />
              </pattern>
              <radialGradient id="net-glow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100" height="100" fill="url(#net-grid)" />
            <rect width="100" height="100" fill="url(#net-glow)" />

            {links.map(([a, b], i) => {
              const c1 = centers[a];
              const c2 = centers[b];
              return (
                <g key={i}>
                  <line x1={c1.x} y1={c1.y} x2={c2.x} y2={c2.y} stroke="currentColor" strokeWidth="0.35" className="text-slate-400 dark:text-white/25" />
                  <circle r="0.6" fill={c1.color}>
                    <animateMotion dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite" path={`M${c1.x},${c1.y} L${c2.x},${c2.y}`} />
                  </circle>
                </g>
              );
            })}
          </svg>

          {centers.map((c, i) => {
            const Icon = c.Icon;
            return (
              <div
                key={c.id}
                className="mc-scale-in absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${c.x}%`, top: `${c.y}%`, animationDelay: `${0.15 + i * 0.06}s` }}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ring-2 ${c.ring} shadow-[0_4px_14px_rgba(0,0,0,0.12)]`} style={{ backgroundColor: c.color }}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="mt-1 px-1.5 py-0.5 rounded-md bg-white/85 dark:bg-black/60 backdrop-blur text-[9px] text-slate-700 dark:text-slate-200 whitespace-nowrap" style={{ fontWeight: 700 }}>
                  {c.short} · {c.load}%
                </div>
              </div>
            );
          })}

          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 h-6 px-2 rounded-full bg-white/85 dark:bg-black/50 backdrop-blur border border-slate-200 dark:border-white/10">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-300" style={{ fontWeight: 700 }}>LIVE</span>
          </div>

          <div className="absolute bottom-2.5 left-2.5 text-[10px] text-slate-500 dark:text-slate-400" style={{ fontWeight: 600 }}>
            5 active centers · 5 active links
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push("/centers")}
        className="sm:hidden mt-4 w-full h-10 inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition-colors cursor-pointer"
      >
        Open Network Hub <ArrowRight className="w-4 h-4" />
      </button>
    </GlassCard>
  );
}

export default InfrastructureHealthCard;
