"use client";

import { Gift, Award, Trophy, TrendingUp, ArrowRight } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";

interface QuickActionsProps {
  onNavigate: (path: string) => void;
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
  const actions = [
    { label: "Redeem Rewards", desc: "Spend your points", icon: Gift, to: "/rewards", tone: "amber" },
    { label: "My Badges", desc: "Achievements unlocked", icon: Award, to: "/badges", tone: "violet" },
    { label: "Leaderboard", desc: "See your rank", icon: Trophy, to: "/leaderboards", tone: "sky" },
    { label: "Levels & Perks", desc: "Progression tiers", icon: TrendingUp, to: "/citizen-levels", tone: "emerald" },
  ];

  const toneClasses: Record<string, { bg: string; fg: string }> = {
    amber: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400" },
    violet: { bg: "bg-violet-500/10", fg: "text-violet-600 dark:text-violet-400" },
    sky: { bg: "bg-sky-500/10", fg: "text-sky-600 dark:text-sky-400" },
    emerald: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
  };

  return (
    <div data-aos="fade-up">
      <h2 className="text-lg text-slate-900 dark:text-white mb-3" style={{ fontWeight: 600 }}>Quick actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act, i) => {
          const Icon = act.icon;
          const t = toneClasses[act.tone];
          return (
            <div key={act.to} data-aos="fade-up" data-aos-delay={i * 80}>
              <button
                onClick={() => onNavigate(act.to)}
                className="w-full text-left hover:scale-[1.02] active:scale-[0.97] transition-transform duration-150 cursor-pointer"
              >
                <GlassCard className="p-5 h-full hover:border-emerald-300/50 dark:hover:border-emerald-400/20 transition-colors">
                  <div className={`w-11 h-11 ${t.bg} rounded-2xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${t.fg}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{act.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  </div>
                </GlassCard>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
