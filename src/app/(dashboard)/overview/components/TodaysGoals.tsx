import { useEffect, useState } from "react";
import { Target, CheckCircle2, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface Goal {
  label: string;
  current: number;
  target: number;
  unit: string;
  accent: "emerald" | "sky" | "violet" | "amber";
}

const accentMap: Record<Goal["accent"], string> = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
};

interface Props {
  completedPickups: number;
  totalPickups: number;
  todayTonnage: number;
  driversOnRoad: number;
  totalDrivers: number;
}

export default function TodaysGoals({
  completedPickups,
  totalPickups,
  todayTonnage,
  driversOnRoad,
  totalDrivers,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const { t, language } = useLanguage();
  useEffect(() => { setMounted(true); }, []);

  const goals: Goal[] = [
    { label: t("dashboard.goals.pickupTarget"), current: completedPickups, target: Math.max(totalPickups, 1), unit: language === "ar" ? "طلب" : "requests", accent: "emerald" },
    { label: t("dashboard.goals.tonnageTarget"), current: todayTonnage, target: 120, unit: language === "ar" ? "طن" : "tonnes", accent: "violet" },
    { label: t("dashboard.goals.fleetTarget"), current: driversOnRoad, target: totalDrivers, unit: language === "ar" ? "سائق" : "drivers", accent: "sky" },
    { label: language === "ar" ? "الالتزام باتفاقية الخدمة" : "SLA Compliance", current: 94, target: 95, unit: "%", accent: "amber" },
  ];

  const overallProgress = Math.round(
    goals.reduce((sum, g) => sum + Math.min(100, (g.current / g.target) * 100), 0) / goals.length
  );

  const formatNumber = (num: number, maximumFractionDigits = 0) => {
    return language === "ar" 
      ? num.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits }) 
      : num.toFixed(maximumFractionDigits);
  };

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
            {t("dashboard.goals.title")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("dashboard.goals.subtitle")}
          </p>
        </div>
      </div>

      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 via-emerald-500/5 to-cyan-500/10 border border-slate-200 dark:border-white/10 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400" style={{ fontWeight: 600 }}>
              {language === "ar" ? "معدل التقدم الإجمالي" : "Overall Progress"}
            </p>
            <p className="text-3xl tracking-tight text-slate-900 dark:text-white mt-0.5 tabular-nums" style={{ fontWeight: 700 }}>
              {language === "ar" ? `${overallProgress.toLocaleString("ar-EG")}٪` : `${overallProgress}%`}
            </p>
          </div>
          {overallProgress >= 80 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs" style={{ fontWeight: 700 }}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {language === "ar" ? "في المسار المخطط" : "On track"}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs" style={{ fontWeight: 700 }}>
              <AlertTriangle className="w-3.5 h-3.5" />
              {language === "ar" ? "متأخر عن الخطة" : "Behind pace"}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {goals.map((g, i) => {
          const pct = Math.min(100, (g.current / g.target) * 100);
          const fractionDigits = g.unit === "%" || g.unit === "طن" || g.unit === "tonnes" ? 1 : 0;
          return (
            <div key={g.label}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-slate-700 dark:text-slate-300" style={{ fontWeight: 600 }}>
                  {g.label}
                </span>
                <span className="text-slate-500 dark:text-slate-400 tabular-nums text-xs">
                  {formatNumber(g.current, fractionDigits)} / {formatNumber(g.target)} {g.unit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200/70 dark:bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full ${accentMap[g.accent]}`}
                  style={{
                    width: mounted ? `${pct}%` : "0%",
                    transition: "width 0.7s cubic-bezier(0, 0, 0.2, 1)",
                    transitionDelay: `${0.1 + i * 0.06}s`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

