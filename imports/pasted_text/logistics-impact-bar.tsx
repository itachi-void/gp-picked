import React, { useEffect, useRef, useState } from "react";
import {
  Weight,
  Coins,
  Leaf,
  Package,
  TrendingUp,
  Truck,
} from "lucide-react";
import { usePickup } from "@/app/contexts/PickupContext";
import { useWallet } from "@/app/contexts/WalletContext";
import { useDrivers } from "@/app/contexts/DriversContext";

const CO2_PER_KG = 2.5; // kg CO2 saved per kg plastic recycled

/* ─── Animated number ────────────────────────────────── */
function AnimNum({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION = 1200;

  useEffect(() => {
    startRef.current = null;
    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const t = Math.min((now - startRef.current) / DURATION, 1);
      const ease = 1 - Math.pow(1 - t, 4); // easeOutQuart
      setDisplay(ease * value);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return (
    <span className="tabular-nums">
      {display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}

/* ─── Single Stat Card ───────────────────────────────── */
function ImpactCard({
  icon,
  label,
  value,
  suffix,
  sub,
  gradient,
  glow,
  decimals = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  sub?: string;
  gradient: string;
  glow: string;
  decimals?: number;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/60 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}
    >
      {/* Subtle gradient glow */}
      <div
        className={`absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-25 ${glow}`}
      />

      <div className="relative flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}
        >
          {icon}
        </div>
        <TrendingUp className="w-3.5 h-3.5 text-emerald-500 opacity-70" />
      </div>

      <div className="relative">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">
            <AnimNum value={value} decimals={decimals} />
          </span>
          {suffix && (
            <span className="text-sm font-bold text-gray-400">{suffix}</span>
          )}
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5">
          {label}
        </p>
        {sub && (
          <p className="text-[9px] text-gray-400 mt-0.5 font-medium">{sub}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export function LogisticsImpactBar() {
  const { requests } = usePickup();
  const { lifetimeEarned } = useWallet();
  const { drivers, availableDrivers } = useDrivers();

  const completedRequests = requests.filter((r) => r.status === "Completed");
  const activeRequests = requests.filter(
    (r) => r.status === "Pending" || r.status === "In-Progress" || r.status === "Validating"
  );

  const totalWeightKg = completedRequests.reduce(
    (sum, r) =>
      sum + (r.validation?.detectedWeightKg ?? r.items.reduce((s, i) => s + i.expectedWeightKg, 0)),
    0
  );

  const co2SavedKg = totalWeightKg * CO2_PER_KG;
  const busyDrivers = drivers.filter((d) => d.status === "busy").length;

  return (
    <div className="space-y-3">
      {/* Section heading */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-400" />
          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
            Live Impact Dashboard
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
            Live
          </span>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <ImpactCard
          icon={<Package className="w-5 h-5 text-white" />}
          label="Active Requests"
          value={activeRequests.length}
          sub={`${completedRequests.length} completed`}
          gradient="from-blue-500 to-indigo-500"
          glow="bg-blue-400"
        />
        <ImpactCard
          icon={<Weight className="w-5 h-5 text-white" />}
          label="Total Weight Collected"
          value={totalWeightKg}
          suffix="kg"
          sub="Completed pickups only"
          gradient="from-emerald-500 to-teal-500"
          glow="bg-emerald-400"
          decimals={1}
        />
        <ImpactCard
          icon={<Coins className="w-5 h-5 text-white" />}
          label="Points Distributed"
          value={lifetimeEarned}
          suffix="pts"
          sub="All-time wallet earned"
          gradient="from-amber-400 to-orange-400"
          glow="bg-amber-300"
        />
        <ImpactCard
          icon={<Leaf className="w-5 h-5 text-white" />}
          label="CO₂ Saved"
          value={co2SavedKg}
          suffix="kg"
          sub={`@ ${CO2_PER_KG}kg CO₂ per kg`}
          gradient="from-green-500 to-emerald-400"
          glow="bg-green-400"
          decimals={1}
        />
        <ImpactCard
          icon={<Truck className="w-5 h-5 text-white" />}
          label="Drivers On Route"
          value={busyDrivers}
          sub={`${availableDrivers.length} available`}
          gradient="from-violet-500 to-purple-500"
          glow="bg-violet-400"
        />
        <ImpactCard
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          label="Completion Rate"
          value={
            requests.length > 0
              ? Math.round((completedRequests.length / requests.length) * 100)
              : 0
          }
          suffix="%"
          sub={`${completedRequests.length}/${requests.length} pickups`}
          gradient="from-rose-500 to-pink-500"
          glow="bg-rose-400"
        />
      </div>
    </div>
  );
}
