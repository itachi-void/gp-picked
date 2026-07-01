"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, TrendingUp } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";
import api from "@/lib/axios";

interface RankData {
  userId: number;
  name: string;
  walletPoints: number;
  rank: number;
  bottleCount: string;
}

interface RankCardProps {
  userId: string;
}

function rankIcon(rank: number) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
  return <TrendingUp className="w-5 h-5 text-sky-500" />;
}

function rankColor(rank: number) {
  if (rank === 1) return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
  if (rank === 2) return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
  if (rank === 3) return "bg-amber-700/10 text-amber-700 dark:text-amber-500";
  return "bg-sky-500/10 text-sky-600 dark:text-sky-400";
}

export function RankCard({ userId }: RankCardProps) {
  const [rankData, setRankData] = useState<RankData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchRank = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get<RankData>(`/User/GetRankingUser/${userId}?sortOrder=asc`);
        const data = res.data;
        setRankData(data);
      } catch {
        setError("An error occurred while fetching your rank");
      } finally {
        setLoading(false);
      }
    };

    fetchRank();
  }, [userId]);

  if (loading) {
    return (
      <GlassCard className="p-5">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return null;
  }

  if (!rankData) return null;

  return (
    <div data-aos="fade-up" data-aos-delay="200">
      <GlassCard className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${rankColor(rankData.rank)}`}>
          {rankIcon(rankData.rank)}
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your Rank</p>
          <p className="text-xl text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
            #{rankData.rank}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {rankData.bottleCount} bottles · {rankData.walletPoints.toLocaleString()} pts
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
