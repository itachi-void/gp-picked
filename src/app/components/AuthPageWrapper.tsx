"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  User as UserIcon,
  Recycle,
  Shield,
  Truck,
  UserCircle2,
} from "lucide-react";
import { useAuth } from "@/store/authStore";
import { homePathForRole } from "@/app/utils/roleAccess";
import { GlassCard } from "@/app/components/GlassCard";

type Mode = "login" | "signup";

const demoChips = [
  { label: "Admin", email: "admin@ecovoid.io", Icon: Shield, accent: "emerald", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { label: "Driver", email: "driver@ecovoid.io", Icon: Truck, accent: "amber", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { label: "Citizen", email: "citizen@ecovoid.io", Icon: UserCircle2, accent: "violet", bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
];

interface AuthPageWrapperProps {
  mode: Mode;
}

export function AuthPageWrapper({ mode }: AuthPageWrapperProps) {
  const { user, login, signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryRole = searchParams.get("role");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo1234");
  const [role, setRole] = useState<"Citizen" | "Driver" | "Admin">("Citizen");
  const [submitting, setSubmitting] = useState(false);

  // Pre-select role if specified in query params
  useEffect(() => {
    if (queryRole === "Admin" || queryRole === "Driver" || queryRole === "Citizen") {
      setRole(queryRole);
    }
  }, [queryRole]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace(homePathForRole(user.role));
    }
  }, [user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (mode === "signup" && !name.trim())) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const u = mode === "login"
        ? await login(email.trim(), password, role)
        : await signup(name.trim(), email.trim(), password);
      toast.success(mode === "login" ? `Welcome back, ${u.name}` : `Welcome, ${u.name}`);
      router.replace(homePathForRole(u.role));
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background blobs for premium aesthetic */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

      <GlassCard className="relative z-10 w-full max-w-md p-8 animate-scale-pop">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
              EcoVoid
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Smart recycling dashboard</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-100/70 dark:bg-white/[0.04] rounded-full border border-slate-200/60 dark:border-white/5 mb-6">
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => router.push(m === "login" ? "/login" : "/signup")}
              className={`flex-1 py-2 text-xs tracking-wide rounded-full transition-all cursor-pointer ${
                mode === m
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
              }`}
              style={{ fontWeight: 700 }}
            >
              {m === "login" ? "Login" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <UserIcon className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          )}

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <Mail className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <Lock className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {mode === "login" && (
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <UserIcon className="w-4 h-4 text-slate-400" />
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full pl-10 pr-8 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer bg-white dark:bg-slate-900"
              >
                <option value="Citizen">Citizen</option>
                <option value="Driver">Driver</option>
                <option value="Admin">Admin</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all active:scale-[0.98] cursor-pointer"
          >
            {submitting ? "Processing..." : mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-semibold">
            Demo roles — click to auto-fill
          </p>
          <div className="flex flex-wrap gap-2">
            {demoChips.map((chip) => {
              const Icon = chip.Icon;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setEmail(chip.email);
                    setPassword("demo1234");
                    setRole(chip.label as any);
                    if (mode !== "login") {
                      router.push("/login");
                    }
                    toast.info(`Demo: ${chip.label}`);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-current/10 hover:opacity-90 transition-opacity text-xs cursor-pointer ${chip.bg}`}
                  style={{ fontWeight: 600 }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
