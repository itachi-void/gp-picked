"use client";

import { LifeBuoy, ArrowRight } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";

interface SupportCardProps {
  onClick: () => void;
}

export function SupportCard({ onClick }: SupportCardProps) {
  return (
    <div data-aos="fade-up">
      <button onClick={onClick} className="w-full cursor-pointer text-left">
        <GlassCard className="p-5 flex items-center gap-4 hover:border-emerald-300/50 dark:hover:border-emerald-400/20 transition-colors">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
            <LifeBuoy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Need help?</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Reach our support team anytime.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
        </GlassCard>
      </button>
    </div>
  );
}
