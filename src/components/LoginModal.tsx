"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Mail, Lock, User as UserIcon, Recycle } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { homePathForRole } from "@/app/utils/roleAccess";

type Mode = "login" | "signup";

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { login, signup } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo1234");
  const [submitting, setSubmitting] = useState(false);
  
  // CSS-only enter transition
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!isOpen) {
      setShow(false);
      return;
    }
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (mode === "signup" && !name.trim())) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const u = mode === "login" ? await login(email, password) : await signup(name, email, password);
      toast.success(mode === "login" ? "Welcome back!" : "Account created!");
      onClose();
      router.push(homePathForRole(u.role));
    } catch {
      toast.error("Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 h-11 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/50";

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl transition-all duration-300 ${
          show ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-10"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Recycle className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {mode === "login" ? "Sign in to your EcoVision account" : "Join the recycling movement"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className={inputClass} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className={inputClass} type="email" placeholder="Email (try admin@ / citizen@)" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className={inputClass} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-emerald-600 font-semibold hover:underline cursor-pointer"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
