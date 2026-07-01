"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Recycle } from "lucide-react";
import { useAuth } from "@/store/authStore";
import { homePathForRole } from "@/app/utils/roleAccess";
import { GlassCard } from "@/app/components/GlassCard";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { DemoRoles } from "./DemoRoles";

type Mode = "login" | "signup";

interface AuthPageWrapperProps {
  mode: Mode;
}

export function AuthPageWrapper({ mode }: AuthPageWrapperProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace(homePathForRole(user.role));
  }, [user, router]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

      <GlassCard className="relative z-10 w-full max-w-md p-8 animate-scale-pop">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">EcoVoid</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Smart recycling dashboard</p>
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
              {m === "login" ? "Login" : "Sign up"}
            </button>
          ))}
        </div>

        {mode === "login" ? <LoginForm /> : <SignupForm />}

        <DemoRoles />
      </GlassCard>
    </div>
  );
}