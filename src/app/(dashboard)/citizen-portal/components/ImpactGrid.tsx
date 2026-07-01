"use client";

import { Recycle, Coins, Leaf, Trees } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";

interface ImpactGridProps {
  bottles: number;
  balance: number;
  co2: number;
  trees: number;
}

export function ImpactGrid({ bottles, balance, co2, trees }: ImpactGridProps) {
  const impact = [
    { label: "Bottles Recycled", value: bottles, icon: Recycle, accent: "emerald" },
    { label: "Available Points", value: balance, icon: Coins, accent: "amber" },
    { label: "CO₂ Saved (kg)", value: co2, icon: Leaf, accent: "green" },
    { label: "Trees Equivalent", value: trees, icon: Trees, accent: "teal" },
  ];

  const accent: Record<string, { bg: string; fg: string }> = {
    emerald: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
    amber: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400" },
    green: { bg: "bg-green-500/10", fg: "text-green-600 dark:text-green-400" },
    teal: { bg: "bg-teal-500/10", fg: "text-teal-600 dark:text-teal-400" },
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {impact.map((s, i) => {
        const Icon = s.icon;
        const a = accent[s.accent];
        return (
          <div key={s.label} data-aos="fade-up" data-aos-delay={i * 100}>
            <GlassCard className="p-5 h-full">
              <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 ${a.fg}`} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1" style={{ fontWeight: 600 }}>
                {s.value.toLocaleString()}
              </p>
            </GlassCard>
          </div>
        );
      })}
    </div>
  );
}
