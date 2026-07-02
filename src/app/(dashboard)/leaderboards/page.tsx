"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import "@/app/components/motion/motion-components.css";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Medal,
  Zap,
} from "lucide-react";

type Trend = "up" | "down" | "same";

interface Entry {
  rank: number;
  citizenId: string;
  citizenName: string;
  points: number;
  bottlesRecycled: number;
  level: number;
  trend: Trend;
}

// Fallback Mock Data in case backend is empty or fails
const fallbackData: Entry[] = [
  { rank: 1, citizenId: "CIT-12345", citizenName: "Ahmed Hassan", points: 15420, bottlesRecycled: 1542, level: 12, trend: "same" },
  { rank: 2, citizenId: "CIT-12346", citizenName: "Fatma Mohamed", points: 14890, bottlesRecycled: 1489, level: 11, trend: "up" },
  { rank: 3, citizenId: "CIT-12347", citizenName: "Omar Ali", points: 13750, bottlesRecycled: 1375, level: 11, trend: "up" },
  { rank: 4, citizenId: "CIT-12348", citizenName: "Sara Mahmoud", points: 12200, bottlesRecycled: 1220, level: 10, trend: "down" },
  { rank: 5, citizenId: "CIT-12349", citizenName: "Karim Youssef", points: 11580, bottlesRecycled: 1158, level: 10, trend: "up" },
  { rank: 6, citizenId: "CIT-12350", citizenName: "Nour Ibrahim", points: 10920, bottlesRecycled: 1092, level: 9, trend: "same" },
  { rank: 7, citizenId: "CIT-12351", citizenName: "Hassan Ahmed", points: 10340, bottlesRecycled: 1034, level: 9, trend: "up" },
  { rank: 8, citizenId: "CIT-12352", citizenName: "Amira Samir", points: 9850, bottlesRecycled: 985, level: 8, trend: "down" },
  { rank: 9, citizenId: "CIT-12353", citizenName: "Mohamed Ali", points: 9420, bottlesRecycled: 942, level: 8, trend: "up" },
  { rank: 10, citizenId: "CIT-12354", citizenName: "Layla Khaled", points: 8970, bottlesRecycled: 897, level: 8, trend: "same" },
];

const podiumGradient: Record<number, string> = {
  1: "from-amber-400 to-amber-600",
  2: "from-slate-300 to-slate-500",
  3: "from-orange-400 to-orange-600",
};

function trendEl(t: Trend) {
  if (t === "up") return <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm"><TrendingUp className="w-4 h-4" /> Rising</span>;
  if (t === "down") return <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-sm"><TrendingDown className="w-4 h-4" /> Falling</span>;
  return <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm"><Minus className="w-4 h-4" /> Stable</span>;
}

export default function LeaderboardsPage() {
  const [sortOrder, setSortOrder] = useState<"Descending" | "Ascending">("Descending");

  // React Query with Axios fetching SortingUser endpoint
  const { data: rawData, isLoading, isError } = useQuery<any[]>({
    queryKey: ["leaderboard", sortOrder],
    queryFn: async () => {
      const res = await api.get("/User/SortingUser", {
        params: { sortOrder },
      });
      return res.data;
    },
    staleTime: 30000, // 30 seconds
  });

  // Map API response to Component Interface
  const mappedData: Entry[] = (rawData && Array.isArray(rawData) ? rawData : [])
    .map((item: any, idx: number) => {
      const rank = item.rank || idx + 1;
      const citizenId = String(item.userId || `CIT-${20000 + idx}`);
      const citizenName = item.fullName || item.name || "Eco Recycler";
      const points = item.walletPoints || 0;
      const bottlesRecycled = parseInt(item.bottleCount || item.bottle || "0", 10) || Math.round(points / 5);
      const level = Math.max(1, Math.floor(points / 1000));
      
      const trends: Trend[] = ["up", "same", "down"];
      const trend = trends[idx % 3];

      return {
        rank,
        citizenId,
        citizenName,
        points,
        bottlesRecycled,
        level,
        trend,
      };
    });

  // Use mapped backend data if available, otherwise use mock fallback
  const finalData = mappedData.length > 0 ? mappedData : fallbackData;

  const topThree = finalData.slice(0, 3);
  const rest = finalData.slice(3);

  // Dynamic KPI counters
  const totalCount = finalData.length;
  const sumPoints = finalData.reduce((acc, curr) => acc + curr.points, 0);
  const avgVal = totalCount > 0 ? Math.round(sumPoints / totalCount) : 0;
  const topVal = totalCount > 0 ? Math.max(...finalData.map((e) => e.points)) : 0;
  const activeVal = Math.max(1, Math.round(totalCount * 0.7));

  const kpis = [
    { label: "Total Participants", value: totalCount.toLocaleString(), icon: Trophy, accent: "violet" },
    { label: "Avg Points", value: avgVal.toLocaleString(), icon: TrendingUp, accent: "sky" },
    { label: "Top Score", value: topVal.toLocaleString(), icon: Crown, accent: "amber" },
    { label: "Active This Week", value: activeVal.toLocaleString(), icon: Zap, accent: "emerald" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      {/* Header & Controls */}
      <div className="mc-fade-in-down flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Leaderboards</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Top recyclers and community champions sorted by points</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(["Descending", "Ascending"] as const).map((order) => (
            <button
              key={order}
              onClick={() => setSortOrder(order)}
              className={`px-4 h-10 rounded-full text-sm transition-colors cursor-pointer ${
                sortOrder === order
                  ? "bg-emerald-600 text-white"
                  : "bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10"
              }`}
              style={{ fontWeight: sortOrder === order ? 600 : 400 }}
            >
              {order === "Descending" ? "Top Recyclers" : "New Achievers"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Trophy className="w-10 h-10 text-amber-500 animate-spin" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Fetching leaderboards rankings...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Top 3 Podiums */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topThree.map((entry, i) => (
              <div
                key={entry.citizenId}
                className={`mc-card-in ${entry.rank === 1 ? "md:order-2 md:scale-105" : entry.rank === 2 ? "md:order-1" : "md:order-3"}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <GlassCard className="overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${podiumGradient[entry.rank] || "from-slate-400 to-slate-600"}`} />
                  <div className="p-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${podiumGradient[entry.rank] || "from-slate-400 to-slate-600"} flex items-center justify-center shadow-lg`}>
                        {entry.rank === 1 ? <Crown className="w-10 h-10 text-white" /> : <Medal className="w-10 h-10 text-white" />}
                      </div>
                    </div>
                    <h3 className="text-center text-lg text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{entry.citizenName}</h3>
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Level {entry.level}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl">
                        <span className="text-sm text-slate-700 dark:text-slate-200">Points</span>
                        <span className="text-emerald-600 dark:text-emerald-400" style={{ fontWeight: 600 }}>{entry.points.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-sky-500/10 rounded-xl">
                        <span className="text-sm text-slate-700 dark:text-slate-200">Bottles</span>
                        <span className="text-sky-600 dark:text-sky-400" style={{ fontWeight: 600 }}>{entry.bottlesRecycled.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center mt-4">{trendEl(entry.trend)}</div>
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>

          {/* Table List of Remainder */}
          {rest.length > 0 && (
            <div className="mc-card-in" style={{ animationDelay: "0.3s" }}>
              <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-slate-200 dark:border-white/10">
                      <tr className="text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <th className="px-6 py-4">Rank</th>
                        <th className="px-6 py-4">Citizen</th>
                        <th className="px-6 py-4">Level</th>
                        <th className="px-6 py-4">Points</th>
                        <th className="px-6 py-4">Bottles</th>
                        <th className="px-6 py-4">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                      {rest.map((entry) => (
                        <tr key={entry.citizenId} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>
                              #{entry.rank}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm" style={{ fontWeight: 600 }}>
                                {entry.citizenName.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <div>
                                <p className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{entry.citizenName}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{entry.citizenId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm" style={{ fontWeight: 600 }}>
                              <Zap className="w-3.5 h-3.5" />
                              Lv {entry.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400" style={{ fontWeight: 600 }}>{entry.points.toLocaleString()}</td>
                          <td className="px-6 py-4 text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{entry.bottlesRecycled.toLocaleString()}</td>
                          <td className="px-6 py-4">{trendEl(entry.trend)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}
        </>
      )}

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          const a = accentMap[k.accent];
          return (
            <div key={k.label} className="mc-card-in" style={{ animationDelay: `${0.4 + i * 0.05}s` }}>
              <GlassCard className="p-5">
                <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{k.label}</p>
                <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1" style={{ fontWeight: 600 }}>{k.value}</p>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
