import { useEffect, useState } from "react";
import { LayoutDashboard, Sparkles } from "lucide-react";
import { useAuth } from "@/store/authStore";
import { GlassCard } from "@/app/components/GlassCard";
import { useLanguage } from "@/contexts/LanguageContext";

function greetingFor(hour: number, t: any) {
  if (hour < 5) return t("dashboard.greetings.night");
  if (hour < 12) return t("dashboard.greetings.morning");
  if (hour < 18) return t("dashboard.greetings.afternoon");
  return t("dashboard.greetings.evening");
}

interface Props {
  activePickups: number;
  driversOnRoad: number;
}

export default function OverviewHero({ activePickups, driversOnRoad }: Props) {
  const { user } = useAuth();
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const { t, tApi, language } = useLanguage();

  useEffect(() => {
    setMounted(true);
    const tInterval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tInterval);
  }, []);

  if (!mounted) {
    return (
      <GlassCard className="p-6 lg:p-8 overflow-hidden relative">
        <div className="flex items-center justify-between flex-wrap gap-4 animate-pulse">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-32" />
        </div>
      </GlassCard>
    );
  }

  const hour = now.getHours();
  const time = now.toLocaleTimeString(language === "ar" ? "ar-EG" : [], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString(language === "ar" ? "ar-EG" : [], { weekday: "long", month: "long", day: "numeric" });
  
  const rawFirstName = user?.name?.split(" ")[0] || "Operator";
  const firstName = rawFirstName;

  return (
    <GlassCard className="p-6 lg:p-8 overflow-hidden relative">
      <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <LayoutDashboard className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[2px] text-emerald-600 dark:text-emerald-400" style={{ fontWeight: 700 }}>
              <Sparkles className="w-3 h-3" />
              <span>{t("dashboard.hero.command")}</span>
            </div>
            <h1
              className="text-3xl lg:text-4xl tracking-tight text-slate-900 dark:text-white mt-1"
              style={{ fontWeight: 700 }}
            >
              {language === "ar" ? `${firstName}، ${greetingFor(hour, t)}` : `${greetingFor(hour, t)}, ${firstName}`}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
              {language === "ar" ? (
                <>
                  {date} · {activePickups.toLocaleString("ar-EG")} {activePickups === 1 ? t("dashboard.hero.activePickups") : t("dashboard.hero.activePickupsPlural")} · {driversOnRoad.toLocaleString("ar-EG")} {driversOnRoad === 1 ? t("dashboard.hero.driversRoad") : t("dashboard.hero.driversRoadPlural")}
                </>
              ) : (
                <>
                  {date} · {activePickups} active pickup{activePickups === 1 ? "" : "s"} · {driversOnRoad} driver{driversOnRoad === 1 ? "" : "s"} on the road
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
            <div className="text-[10px] uppercase tracking-[2px] text-slate-500 dark:text-slate-400" style={{ fontWeight: 700 }}>
              {t("common.localTime")}
            </div>
            <div className="text-2xl tracking-tight text-slate-900 dark:text-white tabular-nums" style={{ fontWeight: 700 }}>
              {time}
            </div>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[2px] text-emerald-700 dark:text-emerald-300" style={{ fontWeight: 700 }}>
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </span>
              {t("common.system")}
            </div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300 mt-1" style={{ fontWeight: 700 }}>
              {t("common.nominal")}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

