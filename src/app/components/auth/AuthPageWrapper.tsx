"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/authStore";
import { homePathForRole } from "@/app/utils/roleAccess";
import { GlassCard } from "@/app/components/GlassCard";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { DemoRoles } from "./DemoRoles";
import LampScene from "@/app/components/LampScene";
import BulbSwitch from "@/app/components/BulbSwitch";
import DayNightSwitch from "@/app/components/DayNightSwitch";
import { useLanguage } from "@/contexts/LanguageContext";

type Mode = "login" | "signup";

interface AuthPageWrapperProps {
  mode: Mode;
}

export function AuthPageWrapper({ mode }: AuthPageWrapperProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [dayNightMode, setDayNightMode] = useState<"day" | "night">("night");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) router.replace(homePathForRole(user.role));
  }, [user, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-pulse text-emerald-500/50 text-sm">Loading...</div>
      </div>
    );
  }

  const isDay = dayNightMode === "day";

  const sceneConfig = isDay
    ? {
        warm: "255, 220, 140",
        beamIntensity: 0.7,
        beamWidth: 0.75,
        ambientGlow: 0,
        shadowStrength: 0.0,
        lampStyle: "warm-brass" as const,
        background:
          "linear-gradient(180deg, #eaf6ef 0%, #c8e3d4 50%, #9fcdbb 100%)",
      }
    : {
        warm: "167, 243, 208",
        beamIntensity: 1.2,
        beamWidth: 0.8,
        ambientGlow: 0,
        shadowStrength: 1.0,
        lampStyle: "cool-steel" as const,
        background:
          "radial-gradient(ellipse at 50% 55%, #0a1f17 0%, #051410 55%, #020806 100%)",
      };

  const { t } = useLanguage();

  return (
    <LampScene
      key={dayNightMode}
      warm={sceneConfig.warm}
      beamIntensity={sceneConfig.beamIntensity}
      beamWidth={sceneConfig.beamWidth}
      ambientGlow={sceneConfig.ambientGlow}
      shadowStrength={sceneConfig.shadowStrength}
      contentPosition="center"
      lampStyle={sceneConfig.lampStyle}
      lampLeft="3%"
      lampBottom="6%"
      lampScale={0.85}
      showDust={!isDay}
      dayMode={isDay}
      background={sceneConfig.background}
    >
      <div className="relative w-full max-w-md animate-scale-pop">
        {/* Glow Layer 1: Wide Ambient Glow */}
        <div
          className={`absolute -inset-10 rounded-[3rem] blur-3xl transition-all duration-1000 opacity-60 pointer-events-none ${
            isDay
              ? "bg-gradient-to-tr from-amber-300 via-orange-300 to-yellow-300"
              : "bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400"
          }`}
        />
        
        {/* Glow Layer 2: Intense Center Glow */}
        <div
          className={`absolute -inset-2 rounded-[2rem] blur-2xl transition-all duration-1000 opacity-80 pointer-events-none ${
            isDay
              ? "bg-amber-400/20 shadow-[0_0_80px_25px_rgba(251,191,36,0.35)]"
              : "bg-emerald-500/20 shadow-[0_0_100px_35px_rgba(16,185,129,0.45)]"
          }`}
        />

        <GlassCard className="relative w-full p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-white dark:bg-white/95 px-6 py-3 rounded-2xl border border-slate-200/50 dark:border-white/15 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,1)] flex items-center justify-center transition-all duration-300 hover:scale-[1.02]">
              <img 
                src="/logo.png" 
                alt="EcoSnap" 
                className="h-10 w-auto object-contain" 
              />
            </div>
          </div>

        <div className="flex p-1 bg-slate-100/70 dark:bg-white/[0.04] rounded-full border border-slate-200/60 dark:border-white/5 mb-6">
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => router.push(m === "login" ? "/login" : "/signup")}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                mode === m
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "text-slate-600 dark:text-white/60"
              }`}
            >
              {m === "login" ? t("auth.login") : t("auth.signup")}
            </button>
          ))}
        </div>

        {mode === "login" ? <LoginForm /> : <SignupForm />}

        <DemoRoles />
      </GlassCard>
      </div>
      <BulbSwitch position={{ top: 24, right: 28 }} />
      <DayNightSwitch
        mode={dayNightMode}
        onChange={setDayNightMode}
        position={{ top: 30, right: 100 }}
      />
    </LampScene>
  );
}
