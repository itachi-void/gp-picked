import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Navigate } from "react-router";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon, LogIn, UserPlus, Recycle, Shield, Truck, UserCircle2, Briefcase } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { homePathForRole } from "@/app/utils/roleAccess";
import { WaveBackdrop } from "@/app/components/WaveBackdrop";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";

type Mode = "login" | "signup";

const demoChips: { label: string; email: string; Icon: any; accent: string }[] = [
  { label: "Admin",   email: "admin@ecovoid.io",   Icon: Shield,        accent: "emerald" },
  { label: "Manager", email: "manager@ecovoid.io", Icon: Briefcase,     accent: "teal" },
  { label: "Driver",  email: "driver@ecovoid.io",  Icon: Truck,         accent: "amber" },
  { label: "Citizen", email: "citizen@ecovoid.io", Icon: UserCircle2,   accent: "violet" },
];

export default function LoginPage() {
  const { isAuthenticated, user, login, signup, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo1234");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to={homePathForRole(user?.role ?? "citizen")} replace />;
  }

  const inputClass = "w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (mode === "signup" && !name.trim())) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const u = mode === "login"
        ? await login(email.trim(), password)
        : await signup(name.trim(), email.trim(), password);
      toast.success(mode === "login" ? `Welcome back, ${u.name}` : `Welcome, ${u.name}`);
      navigate(homePathForRole(u.role), { replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <WaveBackdrop />

      <GlassCard
        as="div"
        className="relative z-10 w-full max-w-md p-8"
      ><motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
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

        <div className="flex p-1 bg-slate-100/70 dark:bg-white/[0.04] rounded-full border border-slate-200/60 dark:border-white/5 mb-6">
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-xs tracking-wide rounded-full transition-all ${
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

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition-colors disabled:opacity-60"
            style={{ fontWeight: 600 }}
          >
            {mode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3" style={{ fontWeight: 600 }}>
            Demo roles — click to auto-fill
          </p>
          <div className="flex flex-wrap gap-2">
            {demoChips.map((chip) => {
              const a = accentMap[chip.accent];
              const Icon = chip.Icon;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setEmail(chip.email);
                    setPassword("demo1234");
                    setMode("login");
                    toast.info(`Demo: ${chip.label}`);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${a.bg} ${a.fg} border border-current/10 hover:opacity-90 transition-opacity text-xs`}
                  style={{ fontWeight: 600 }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
      </GlassCard>
    </div>
  );
}
