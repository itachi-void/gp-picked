"use client";

import { Sparkles } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";

interface HeroSectionProps {
  currentLevel: number;
  currentTitle: string;
  firstName: string;
  balance: number;
  toNext: number;
  nextTitle: string;
  progress: number;
}

export function HeroSection({
  currentLevel,
  currentTitle,
  firstName,
  balance,
  toNext,
  nextTitle,
  progress,
}: HeroSectionProps) {
  return (
    <div data-aos="fade-up">
      <GlassCard className="relative overflow-hidden p-7">
        <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs mb-3" style={{ fontWeight: 600 }}>
              <Sparkles className="w-3.5 h-3.5" /> Level {currentLevel} · {currentTitle}
            </div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Here's the difference you're making.</p>
          </div>
          <div className="shrink-0">
            <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
              <p className="text-xs/relaxed opacity-90">Points Balance</p>
              <p className="text-3xl tracking-tight" style={{ fontWeight: 700 }}>
                {balance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Level progress */}
        <div className="relative mt-6">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span style={{ fontWeight: 600 }}>{currentTitle}</span>
            <span>{toNext > 0 ? `${toNext.toLocaleString()} pts to ${nextTitle}` : "Top tier reached"}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-200/70 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-barFill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
