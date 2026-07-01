"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";
import { PickupHistory, LedgerActivity } from "@/types/pickup";
import { ActivityRow } from "./ActivityRow";
import { LoadingHistory } from "./LoadingHistory";

interface Props {
  history: PickupHistory[];
  recent?: LedgerActivity[]; // اختياري الآن لتجنب أي مشاكل توافقية
  loading: boolean;
  formatDate: (iso: string) => string;
}

export function RecentActivity({ history, loading, formatDate }: Props) {
  const router = useRouter();

  return (
    <div data-aos="fade-up">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500/10 rounded-2xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                Pickup Requests History
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your live pickup requests & status
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {loading ? (
            <LoadingHistory />
          ) : history.length > 0 ? (
            history.slice(0, 5).map((item, i) => (
              <ActivityRow
                key={item.requestId || (item as any).id || i}
                item={item}
                isLive={true}
                formatDate={formatDate}
                onClick={() => router.push(`/citizen-portal/orders?id=${item.requestId || (item as any).id}`)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
              No pickup requests found
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
