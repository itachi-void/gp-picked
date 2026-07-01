import "@/app/components/motion/motion-components.css";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import {
  Zap,
  Star,
  Award,
  Crown,
  Shield,
  Sparkles,
  TrendingUp,
  Gift,
  Users,
} from "lucide-react";

interface Level {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  accent: string;
}

const levels: Level[] = [
  {
    level: 1,
    title: "Beginner",
    minPoints: 0,
    maxPoints: 499,
    benefits: ["Access to basic recycling", "10 points per kg"],
    accent: "slate",
  },
  {
    level: 2,
    title: "Newcomer",
    minPoints: 500,
    maxPoints: 999,
    benefits: ["Basic recycling", "Badge unlocks", "Community access"],
    accent: "sky",
  },
  {
    level: 3,
    title: "Contributor",
    minPoints: 1000,
    maxPoints: 2499,
    benefits: ["12 points per kg", "Priority pickup", "Monthly newsletter"],
    accent: "emerald",
  },
  {
    level: 4,
    title: "Activist",
    minPoints: 2500,
    maxPoints: 4999,
    benefits: ["15 points per kg", "Exclusive events", "Refer bonuses"],
    accent: "teal",
  },
  {
    level: 5,
    title: "Champion",
    minPoints: 5000,
    maxPoints: 9999,
    benefits: ["18 points per kg", "VIP support", "Special merchandise"],
    accent: "violet",
  },
  {
    level: 6,
    title: "Hero",
    minPoints: 10000,
    maxPoints: 19999,
    benefits: [
      "20 points per kg",
      "Featured in leaderboard",
      "Monthly rewards",
    ],
    accent: "amber",
  },
  {
    level: 7,
    title: "Legend",
    minPoints: 20000,
    maxPoints: 49999,
    benefits: ["25 points per kg", "Exclusive badge", "Ambassador program"],
    accent: "rose",
  },
  {
    level: 8,
    title: "Master",
    minPoints: 50000,
    maxPoints: 99999,
    benefits: [
      "30 points per kg",
      "Platinum membership",
      "Direct line support",
    ],
    accent: "lime",
  },
  {
    level: 9,
    title: "Grand Master",
    minPoints: 100000,
    maxPoints: 249999,
    benefits: ["35 points per kg", "Elite events", "Consulting opportunities"],
    accent: "fuchsia",
  },
  {
    level: 10,
    title: "Eco Guardian",
    minPoints: 250000,
    maxPoints: Infinity,
    benefits: [
      "40 points per kg",
      "Lifetime recognition",
      "Partnership programs",
    ],
    accent: "emerald",
  },
];

function getIcon(level: number) {
  if (level === 1) return Star;
  if (level <= 3) return Zap;
  if (level <= 5) return Award;
  if (level <= 7) return Shield;
  if (level <= 9) return Crown;
  return Sparkles;
}

export default function CitizenLevelsPage() {
  const avgPoints = Math.round(
    levels.reduce(
      (sum, l) =>
        sum +
        (l.minPoints +
          (l.maxPoints === Infinity ? l.minPoints * 2 : l.maxPoints)) /
          2,
      0,
    ) / levels.length,
  );

  const kpis = [
    {
      label: "Total Levels",
      value: levels.length,
      icon: TrendingUp,
      accent: "violet",
    },
    {
      label: "Avg Points Required",
      value: avgPoints.toLocaleString(),
      icon: Zap,
      accent: "sky",
    },
    {
      label: "Top Level",
      value: levels[levels.length - 1].title,
      icon: Crown,
      accent: "amber",
    },
    {
      label: "Active Citizens",
      value: "1,247",
      icon: Users,
      accent: "emerald",
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex items-center gap-3">
        <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1
            className="text-3xl tracking-tight text-slate-900 dark:text-white"
            style={{ fontWeight: 700 }}
          >
            Levels & Progression
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            Citizen ranking system and rewards tiers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          const a = accentMap[k.accent];
          return (
            <div
              key={k.label}
              className="mc-card-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <GlassCard className="p-5">
                <div
                  className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}
                >
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {k.label}
                </p>
                <p
                  className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1"
                  style={{ fontWeight: 600 }}
                >
                  {k.value}
                </p>
              </GlassCard>
            </div>
          );
        })}
      </div>

      <GlassCard className="p-6">
        <h2
          className="text-xl tracking-tight text-slate-900 dark:text-white mb-6"
          style={{ fontWeight: 600 }}
        >
          Progression Roadmap
        </h2>
        <div className="space-y-4">
          {levels.map((lv, i) => {
            const Icon = getIcon(lv.level);
            const a = accentMap[lv.accent];
            return (
              <div
                key={lv.level}
                className={`mc-slide-from-left relative flex gap-5 p-5 rounded-2xl border ${a.bg} border-slate-200/60 dark:border-white/10`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex-shrink-0 relative">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${a.gradient} rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white dark:bg-[#0a0e14] border border-slate-200 dark:border-white/10 rounded-full text-xs text-slate-700 dark:text-slate-200"
                    style={{ fontWeight: 600 }}
                  >
                    L{lv.level}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <h3
                        className="text-lg text-slate-900 dark:text-white"
                        style={{ fontWeight: 600 }}
                      >
                        {lv.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {lv.minPoints.toLocaleString()} –{" "}
                        {lv.maxPoints === Infinity
                          ? "∞"
                          : lv.maxPoints.toLocaleString()}{" "}
                        pts
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {lv.benefits.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 p-2 bg-white/60 dark:bg-white/5 rounded-xl"
                      >
                        <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <div className="mc-card-in" style={{ animationDelay: "0.5s" }}>
        <GlassCard className="p-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full pointer-events-none" />
          <div className="flex items-start gap-4 relative">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3
                className="text-xl tracking-tight text-slate-900 dark:text-white mb-2"
                style={{ fontWeight: 600 }}
              >
                How Leveling Works
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Citizens earn points by recycling bottles. As they accumulate
                points, they automatically progress through levels, unlocking
                better rewards, higher points multipliers, and exclusive
                benefits at each tier.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    title: "Earn Points",
                    desc: "Recycle bottles to earn points",
                  },
                  {
                    title: "Level Up",
                    desc: "Automatically advance through levels",
                  },
                  { title: "Get Rewards", desc: "Unlock exclusive benefits" },
                ].map((step) => (
                  <div
                    key={step.title}
                    className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl"
                  >
                    <p
                      className="text-sm text-emerald-600 dark:text-emerald-400"
                      style={{ fontWeight: 600 }}
                    >
                      {step.title}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
