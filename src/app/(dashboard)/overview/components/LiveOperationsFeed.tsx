"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Radio, MapPin, Clock } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";
import { usePickup, PickupRequest } from "@/store/pickupStore";
import "@/app/components/motion/motion-components.css";

const priorityTone: Record<PickupRequest["priority"], { dot: string; label: string }> = {
  Critical: { dot: "bg-rose-500", label: "text-rose-600 dark:text-rose-400" },
  High: { dot: "bg-amber-500", label: "text-amber-600 dark:text-amber-400" },
  Normal: { dot: "bg-sky-500", label: "text-sky-600 dark:text-sky-400" },
  Low: { dot: "bg-slate-400", label: "text-slate-500 dark:text-slate-400" },
};

const statusBg: Record<PickupRequest["status"], string> = {
  Pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "In Progress": "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export default function LiveOperationsFeed() {
  const router = useRouter();
  const { requests } = usePickup();
  const sorted = [...requests].sort((a, b) => {
    const order = { Critical: 0, High: 1, Normal: 2, Low: 3 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
          <Radio className="w-5 h-5 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
            Live Operations Feed
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Latest pickup activity across all zones
          </p>
        </div>
        <button
          onClick={() => router.push("/pickups")}
          className="hidden sm:inline-flex items-center gap-1 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
          style={{ fontWeight: 600 }}
        >
          View all <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 flex-1">
        {sorted.slice(0, 5).map((r, i) => {
          const tone = priorityTone[r.priority];
          const weight = r.items.reduce((s, it) => s + it.expectedWeightKg, 0);
          return (
            <button
              key={r.id}
              onClick={() => router.push("/pickups")}
              className="mc-card-in w-full text-left p-3 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/[0.07] transition-colors flex items-center gap-3"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <span className="relative flex w-2 h-2 mt-1 shrink-0">
                <span className={`absolute inline-flex h-full w-full rounded-full ${tone.dot} opacity-50 animate-ping`} />
                <span className={`relative inline-flex w-2 h-2 rounded-full ${tone.dot}`} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-900 dark:text-white truncate" style={{ fontWeight: 700 }}>
                    {r.id}
                  </span>
                  <span className={`text-[11px] ${tone.label}`} style={{ fontWeight: 700 }}>
                    {r.priority}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3" /> {r.zone.name}
                  </span>
                  <span className="truncate">{r.citizen.name}</span>
                  <span className="hidden md:inline">{weight}kg</span>
                </div>
              </div>
              <span className={`text-[11px] px-2 py-1 rounded-full ${statusBg[r.status]}`} style={{ fontWeight: 700 }}>
                {r.status}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Updated just now
        </span>
        <span>{requests.length} total requests</span>
      </div>
    </GlassCard>
  );
}
