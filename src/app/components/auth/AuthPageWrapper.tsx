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
        <div className="flex items-center gap-3.5 mb-6">
          {/* Logo Icon with scanner brackets */}
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            {/* Outer Scanner Brackets [ ] in Teal */}
            <div className="absolute inset-0 border-[3px] border-transparent border-t-teal-500 border-b-teal-500 border-l-teal-500 rounded-xl opacity-90" style={{ width: '40%', height: '100%' }} />
            <div className="absolute inset-0 border-[3px] border-transparent border-t-teal-500 border-b-teal-500 border-r-teal-500 rounded-xl opacity-90 ml-auto" style={{ width: '40%', height: '100%' }} />
            
            {/* Center Bottle & Arrow Icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-6 h-6 text-emerald-600 dark:text-emerald-400 relative z-10"
            >
              {/* Bottle body */}
              <path
                d="M8.5 7.5V6a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 6v1.5M7 11h10a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 17 20H7a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 7 11z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Recycling arrows */}
              <path
                d="M5 15a7 7 0 0 1 11-5.5M19 9a7 7 0 0 1-11 5.5"
                stroke="currentColor"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
              <span className="text-emerald-700 dark:text-emerald-400">Eco</span>
              <span className="text-teal-600 dark:text-teal-300">Snap</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Recycle today, save tomorrow</p>
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