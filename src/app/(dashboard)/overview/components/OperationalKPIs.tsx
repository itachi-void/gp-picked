import { useEffect, useState } from "react";
import { Truck, Users, Recycle, Gauge, ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";
import "@/app/components/motion/motion-components.css";

interface KPI {
  label: string;
  value: string;
  sub: string;
  delta: number;
  Icon: LucideIcon;
  accent: "emerald" | "sky" | "violet" | "amber";
  spark: number[];
}

const accentMap: Record<KPI["accent"], { bg: string; fg: string; bar: string; stroke: string }> = {
  emerald: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400", bar: "from-emerald-500/40 to-emerald-500/0", stroke: "#10b981" },
  sky:     { bg: "bg-sky-500/10",     fg: "text-sky-600 dark:text-sky-400",         bar: "from-sky-500/40 to-sky-500/0",     stroke: "#0ea5e9" },
  violet:  { bg: "bg-violet-500/10",  fg: "text-violet-600 dark:text-violet-400",   bar: "from-violet-500/40 to-violet-500/0", stroke: "#8b5cf6" },
  amber:   { bg: "bg-amber-500/10",   fg: "text-amber-600 dark:text-amber-400",     bar: "from-amber-500/40 to-amber-500/0", stroke: "#f59e0b" },
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface Props {
  activePickups: number;
  driversOnRoad: number;
  totalDrivers: number;
  todayTonnage: number;
  fleetUtilization: number;
}

export default function OperationalKPIs({
  activePickups,
  driversOnRoad,
  totalDrivers,
  todayTonnage,
  fleetUtilization,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const kpis: KPI[] = [
    {
      label: "Active Pickups",
      value: String(activePickups),
      sub: "in progress + pending",
      delta: 12.4,
      Icon: Recycle,
      accent: "emerald",
      spark: [3, 5, 4, 6, 5, 7, 8, 7, 9, 8, 10, activePickups],
    },
    {
      label: "Drivers On-Road",
      value: `${driversOnRoad}/${totalDrivers}`,
      sub: "currently dispatched",
      delta: 4.1,
      Icon: Truck,
      accent: "sky",
      spark: [2, 3, 3, 4, 5, 4, 5, 6, 5, 6, 7, driversOnRoad],
    },
    {
      label: "Today's Tonnage",
      value: `${todayTonnage.toFixed(1)}t`,
      sub: "collected since midnight",
      delta: 8.6,
      Icon: Users,
      accent: "violet",
      spark: [12, 18, 22, 30, 35, 42, 48, 55, 60, 68, 72, todayTonnage],
    },
    {
      label: "Fleet Utilization",
      value: `${fleetUtilization}%`,
      sub: "capacity in use",
      delta: -2.3,
      Icon: Gauge,
      accent: "amber",
      spark: [85, 82, 78, 80, 75, 78, 76, 80, 78, 82, 80, fleetUtilization],
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((k, i) => {
        const t = accentMap[k.accent];
        const Icon = k.Icon;
        const up = k.delta >= 0;
        return (
          <div
            key={k.label}
            className="mc-card-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <GlassCard className="p-5 relative overflow-hidden">
              <div className={`absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t ${t.bar} pointer-events-none`} />
              <div className="relative flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${t.fg}`} />
                </div>
                <div
                  className={`flex items-center gap-0.5 text-xs ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                  style={{ fontWeight: 700 }}
                >
                  {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {Math.abs(k.delta).toFixed(1)}% 
                  {/* remove minus */}
                </div>
              </div>
              <div className="relative mt-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">{k.label}</p>
                <p className="text-[28px] leading-none tracking-tight text-slate-900 dark:text-white mt-1.5 tabular-nums" style={{ fontWeight: 700 }}>
                  {k.value}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{k.sub}</p>
              </div>
              <div className="relative mt-3 h-8 opacity-90">
                <Sparkline data={k.spark} color={t.stroke} />
              </div>
            </GlassCard>
          </div>
        );
      })}
    </div>
  );
}
