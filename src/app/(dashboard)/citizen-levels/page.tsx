"use client";

import "@/app/components/motion/motion-components.css";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useMemo } from "react";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import {
  Zap,
  Crown,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Medal,
  Trophy,
  Swords,
  Loader2,
} from "lucide-react";

interface Citizen {
  userId: number;
  name: string;
  walletPoints: number;
  rank: number;
  bottleCount: number | null;
}

type LevelTier = "Bronze" | "Silver" | "Gold";

const LEVEL_CONFIG: Record<LevelTier, { label: string; icon: any; accent: string; gradient: string }> = {
  Bronze: { label: "Bronze", icon: Swords, accent: "amber", gradient: "from-amber-600 to-amber-800" },
  Silver: { label: "Silver", icon: Shield, accent: "slate", gradient: "from-slate-400 to-slate-600" },
  Gold: { label: "Gold", icon: Trophy, accent: "yellow", gradient: "from-yellow-400 to-yellow-600" },
};

function getLevel(walletPoints: number, bronzeMax: number, silverMax: number): LevelTier {
  if (walletPoints > silverMax) return "Gold";
  if (walletPoints > bronzeMax) return "Silver";
  return "Bronze";
}

function calcLevels(data: Citizen[]) {
  const sorted = [...data].sort((a, b) => a.walletPoints - b.walletPoints);
  const n = sorted.length;
  const bronzeIdx = Math.floor(n * 0.5);
  const silverIdx = Math.floor(n * 0.75);
  const bronzeMax = sorted[bronzeIdx]?.walletPoints ?? 0;
  const silverMax = sorted[silverIdx]?.walletPoints ?? 0;

  const buckets: Record<LevelTier, Citizen[]> = { Bronze: [], Silver: [], Gold: [] };
  sorted.forEach((c) => {
    const tier = getLevel(c.walletPoints, bronzeMax, silverMax);
    buckets[tier].push(c);
  });

  const totalPoints = data.reduce((s, c) => s + c.walletPoints, 0);

  return {
    levels: [
      {
        tier: "Bronze" as LevelTier,
        range: `0 – ${bronzeMax.toLocaleString()} pts`,
        count: buckets.Bronze.length,
        pct: ((buckets.Bronze.length / n) * 100).toFixed(0),
      },
      {
        tier: "Silver" as LevelTier,
        range: `${bronzeMax + 1} – ${silverMax.toLocaleString()} pts`,
        count: buckets.Silver.length,
        pct: ((buckets.Silver.length / n) * 100).toFixed(0),
      },
      {
        tier: "Gold" as LevelTier,
        range: `${silverMax + 1}+ pts`,
        count: buckets.Gold.length,
        pct: ((buckets.Gold.length / n) * 100).toFixed(0),
      },
    ],
    avgPoints: Math.round(totalPoints / n) || 0,
    bronzeMax,
    silverMax,
  };
}

export default function CitizenLevelsPage() {
  const { data: citizens = [], isLoading } = useQuery<Citizen[]>({
    queryKey: ["sorting-users", { sortOrder: "Descending" }],
    queryFn: async () => {
      const res = await api.get("/User/SortingUser", { params: { sortOrder: "Descending" } });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: avgPointsFromApi } = useQuery<number>({
    queryKey: ["avg-points-val"],
    queryFn: async () => {
      const res = await api.get("/User/Getavgpoint");
      return typeof res.data === "number" ? res.data : Number(res.data) || 0;
    },
  });

  const { levels, avgPoints: calcAvg, bronzeMax, silverMax } = useMemo(() => {
    if (citizens.length === 0) return { levels: [] as any[], avgPoints: 0, bronzeMax: 0, silverMax: 0 };
    return calcLevels(citizens);
  }, [citizens]);

  const avgPoints = avgPointsFromApi ?? calcAvg;
  const topUser = citizens[0];

  const kpis = [
    { label: "Total Citizens", value: citizens.length.toLocaleString(), icon: Users, accent: "violet" },
    { label: "Avg Points", value: avgPoints.toLocaleString(), icon: TrendingUp, accent: "sky" },
    { label: "Top Citizen", value: topUser?.name ?? "—", icon: Crown, accent: "amber" },
    { label: "Top Points", value: topUser ? topUser.walletPoints.toLocaleString() : "—", icon: Medal, accent: "emerald" },
  ];

  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Levels</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Citizen ranking system and rewards tiers</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex items-center gap-3">
        <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
            Levels & Progression
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            Percentile-based citizen ranking from real data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          const a = accentMap[k.accent];
          return (
            <div key={k.label} className="mc-card-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <GlassCard className="p-5">
                <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{k.label}</p>
                <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1" style={{ fontWeight: 600 }}>
                  {k.value}
                </p>
              </GlassCard>
            </div>
          );
        })}
      </div>

      <GlassCard className="p-6">
        <h2 className="text-xl tracking-tight text-slate-900 dark:text-white mb-6" style={{ fontWeight: 600 }}>
          Tier Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {levels.map((lv: any) => {
            const cfg = LEVEL_CONFIG[lv.tier as LevelTier];
            const Icon = cfg.icon;
            const a = accentMap[cfg.accent] || { bg: "", fg: "" };
            return (
              <div key={lv.tier} className={`mc-card-in p-5 rounded-2xl border ${a.bg} border-slate-200/60 dark:border-white/10`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${cfg.gradient} rounded-full flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{cfg.label}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{lv.range}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-200">{lv.count} citizens</span>
                  <span className="text-slate-500 dark:text-slate-400">{lv.pct}%</span>
                </div>
                <div className="mt-2 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${lv.pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
            Citizen Ranking
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{citizens.length} citizens</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2 text-right">Points</th>
                <th className="px-3 py-2">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {citizens.slice(0, 100).map((c) => {
                const tier = getLevel(c.walletPoints, bronzeMax, silverMax);
                const cfg = LEVEL_CONFIG[tier];
                const a = accentMap[cfg.accent] || { bg: "", fg: "" };
                return (
                  <tr key={c.userId} className="hover:bg-slate-50/40 dark:hover:bg-white/5">
                    <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">#{c.rank}</td>
                    <td className="px-3 py-2.5 text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{c.name}</td>
                    <td className="px-3 py-2.5 text-right text-slate-700 dark:text-slate-200">{c.walletPoints.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${a.bg} ${a.fg}`}>
                        <cfg.icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {citizens.length > 100 && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
              Showing top 100 of {citizens.length} citizens
            </p>
          )}
        </div>
      </GlassCard>

      <div className="mc-card-in">
        <GlassCard className="p-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full pointer-events-none" />
          <div className="flex items-start gap-4 relative">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl tracking-tight text-slate-900 dark:text-white mb-2" style={{ fontWeight: 600 }}>
                How Leveling Works
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Tiers are calculated dynamically from real citizen data using quartile-based percentiles.
                The top 25% of citizens by points are <strong>Gold</strong>, the next 25% are <strong>Silver</strong>,
                and the bottom 50% are <strong>Bronze</strong>. Rankings update as citizens earn more points.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <p className="text-sm text-amber-600 dark:text-amber-400" style={{ fontWeight: 600 }}>Bronze</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">Bottom 50% — Getting started</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <p className="text-sm text-slate-500 dark:text-slate-300" style={{ fontWeight: 600 }}>Silver</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">50th–75th percentile — Active recyclers</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400" style={{ fontWeight: 600 }}>Gold</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">Top 25% — Top contributors</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
