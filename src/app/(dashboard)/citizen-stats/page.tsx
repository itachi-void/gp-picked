"use client";

import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/store/authStore";
import { useUserWallet } from "@/hooks/useUserWallet";
import { usePickupHistory } from "@/hooks/usePickupHistory";
import { GlassCard } from "@/app/components/GlassCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import "@/app/components/motion/motion-components.css";
import {
  Recycle,
  Coins,
  Leaf,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  Scale,
  Award,
  Gift,
} from "lucide-react";

/* Progression Levels from the system design */
const LEVELS: { level: number; title: string; min: number; max: number; perks: string[] }[] = [
  { level: 1, title: "Green Initiate", min: 0, max: 100, perks: ["1.0x Point Multiplier", "Basic badges unlocked"] },
  { level: 2, title: "Green Hero", min: 101, max: 500, perks: ["1.1x Point Multiplier", "Local partner discounts unlocked"] },
  { level: 3, title: "Eco Guardian", min: 501, max: 1500, perks: ["1.25x Point Multiplier", "Exclusive rewards store catalog"] },
  { level: 4, title: "Planet Savior", min: 1501, max: Infinity, perks: ["1.5x Point Multiplier", "VIP community badge", "Priority pickup scheduling"] },
];

export default function CitizenStatsPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => { setMounted(true); }, []);
  
  const { data: walletData, isLoading: isWalletLoading } = useUserWallet(user?.id);
  const { data: history = [], isLoading: isHistoryLoading } = usePickupHistory(user?.id);

  // Fetch average points of users from the server
  const { data: avgPoints = 1200 } = useQuery({
    queryKey: ["userAvgPoints"],
    queryFn: async () => {
      try {
        const response = await api.get("/User/Getavgpoint");
        const data = response.data;
        if (typeof data === "number") return data;
        if (data && typeof data.data === "number") return data.data;
        if (data && typeof data.avgPoints === "number") return data.avgPoints;
        if (data && typeof data.average === "number") return data.average;
        return Number(data) || 1200;
      } catch (err) {
        console.error("Failed to fetch average points:", err);
        return 1200;
      }
    },
  });

  const walletPoints = walletData?.walletPoints ?? 0;

  // Calculate progression level details
  const progression = useMemo(() => {
    if (LEVELS.length === 0) {
      return {
        current: { level: 0, title: "-", min: 0, max: 0, perks: [] },
        next: { level: 0, title: "", min: 0, max: 0, perks: [] },
        progress: 0,
        toNext: 0,
      };
    }
    const points = walletPoints;
    const idx = LEVELS.findIndex((l) => points >= l.min && points <= l.max);
    const current = idx >= 0 ? LEVELS[idx] : LEVELS[LEVELS.length - 1];
    const next = LEVELS[Math.min(idx + 1, LEVELS.length - 1)];
    const span = Math.max(current.max === Infinity ? current.min : current.max - current.min, 1);
    const progress = current.max === Infinity
      ? 100
      : Math.min(100, Math.round(((points - current.min) / span) * 100));
    const toNext = next.min - points > 0 ? next.min - points : 0;
    
    return {
      current,
      next,
      progress,
      toNext,
    };
  }, [walletPoints]);

  // Process history to extract stats
  const stats = useMemo(() => {
    const completedRequests = history.filter((h) => h.status === "Completed");
    const totalPickups = completedRequests.length;

    let totalWeight = 0;
    let hasWeightFromApi = false;
    completedRequests.forEach((h) => {
      const requestWeight = h.totalWeight ?? 0;
      if (requestWeight > 0) hasWeightFromApi = true;
      let calculatedWeightFromItems = 0;
      if (h.items && h.items.length > 0) {
        h.items.forEach((item) => {
          const itemWeight = item.weight ?? item.expectedWeightKg ?? 0;
          if (itemWeight > 0) hasWeightFromApi = true;
          calculatedWeightFromItems += itemWeight;
        });
      }
      totalWeight += requestWeight > 0 ? requestWeight : calculatedWeightFromItems;
    });

    const finalWeight = totalWeight;
    const co2Saved = finalWeight * 1.5;
    const energySaved = finalWeight * 5.8;
    const waterSaved = finalWeight * 15.2;
    const treesEquivalent = co2Saved / 22;

    return {
      totalPickups,
      completedPickups: totalPickups,
      totalWeight: parseFloat(finalWeight.toFixed(1)),
      co2Saved: parseFloat(co2Saved.toFixed(1)),
      energySaved: parseFloat(energySaved.toFixed(1)),
      waterSaved: parseFloat(waterSaved.toFixed(0)),
      treesEquivalent: parseFloat(treesEquivalent.toFixed(1)),
      hasWeightFromApi,
    };
  }, [history, walletPoints]);


  const compareToAvg = useMemo(() => {
    if (!avgPoints || avgPoints === 0) return null;
    const diff = walletPoints - avgPoints;
    const pct = Math.abs(Math.round((diff / avgPoints) * 100));
    const isAbove = diff >= 0;
    return { pct, isAbove, diff };
  }, [walletPoints, avgPoints]);

  const kpis = useMemo(() => {
    const base: { label: string; value: string | number; icon: any; accent: string; subtext?: string }[] = [
      { 
        label: "Total Points Earned", 
        value: walletPoints.toLocaleString(), 
        icon: Coins, 
        accent: "amber",
        subtext: compareToAvg 
          ? `${compareToAvg.pct}% ${compareToAvg.isAbove ? "above" : "below"} community average (${Math.round(avgPoints)} pts)`
          : "Comparing data..."
      },
      { label: "Completed Pickups", value: stats.completedPickups, icon: Recycle, accent: "sky" },
    ];

    if (stats.hasWeightFromApi) {
      base.splice(1, 0, { label: "Total Weight Recycled", value: `${stats.totalWeight} kg`, icon: Scale, accent: "emerald" });
      base.push({ label: "CO₂ Emissions Saved", value: `${stats.co2Saved} kg`, icon: Leaf, accent: "green" });
    }

    return base;
  }, [walletPoints, stats, compareToAvg, avgPoints]);

  const accentClasses: Record<string, { bg: string; fg: string; border: string; gradient: string }> = {
    amber: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20", gradient: "from-amber-400 to-amber-600" },
    emerald: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20", gradient: "from-emerald-400 to-emerald-600" },
    sky: { bg: "bg-sky-500/10", fg: "text-sky-600 dark:text-sky-400", border: "border-sky-500/20", gradient: "from-sky-400 to-sky-600" },
    green: { bg: "bg-green-500/10", fg: "text-green-600 dark:text-green-400", border: "border-green-500/20", gradient: "from-green-400 to-green-600" },
  };



  if (!mounted || isWalletLoading || isHistoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Recycle className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-emerald-600/80 font-medium text-lg">Loading your statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      {/* Page Title Header */}
      <div className="mc-fade-in-down flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
            Citizen Stats & Impact
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed breakdown of your plastic bottle recycling, earnings, and impact
          </p>
        </div>
      </div>

      {/* Top Level KPI Cards Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${kpis.length === 2 ? "max-w-4xl" : "lg:grid-cols-4"}`}>
        {kpis.map((k, i) => {
          const Icon = k.icon;
          const a = accentClasses[k.accent];
          return (
            <div key={k.label} className="mc-card-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <GlassCard className="p-5 h-full flex flex-col justify-between relative overflow-hidden group hover:border-emerald-300/40 transition-colors">
                <div>
                  <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${a.fg}`} />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{k.label}</p>
                  <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1 font-bold" style={{ fontWeight: 700 }}>
                    {k.value}
                  </p>
                </div>
                {k.subtext && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-white/5 pt-2 leading-normal font-semibold">
                    {k.subtext}
                  </p>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>

      {/* Main Content: Progression card — full width */}
      <div className="mc-card-in" style={{ animationDelay: "0.2s" }}>
          <GlassCard className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                  Progression & Level
                </h3>
                <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Tier L{progression.current.level}
                </span>
              </div>
              
              <div className="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl mb-6">
                <p className="text-xs text-slate-500 dark:text-slate-400">Current Level</p>
                <p className="text-2xl text-slate-900 dark:text-white font-bold mt-1" style={{ fontWeight: 700 }}>
                  {progression.current.title}
                </p>
                
                {/* Progress bar to next level */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-semibold">
                    <span>{progression.current.min} pts</span>
                    <span>{progression.progress}% to next rank</span>
                    <span>{progression.current.max === Infinity ? "∞" : `${progression.current.max} pts`}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${progression.progress}%` }}
                    />
                  </div>
                </div>
                
                {progression.toNext > 0 && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-3 font-semibold flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    You need {progression.toNext} more points to level up to {progression.next.title}!
                  </p>
                )}
              </div>

              {/* Next Level Perks */}
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                  {progression.toNext > 0 ? `Unlocked perks at Level ${progression.next.level} (${progression.next.title}):` : "All levels unlocked:"}
                </p>
                <div className="space-y-2">
                  {(progression.toNext > 0 ? progression.next.perks : progression.current.perks).map((perk, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 p-2.5 bg-white dark:bg-[#0d121f]/50 border border-slate-100 dark:border-white/5 rounded-xl">
                      <Gift className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="font-semibold">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-3 mt-6">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                Recycle more plastic bottles to earn points and upgrade your level multiplier!
              </p>
            </div>
          </GlassCard>
        </div>
    </div>
  );
}
