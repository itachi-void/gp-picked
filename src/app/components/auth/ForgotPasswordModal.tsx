"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon, KeyRound } from "lucide-react";
import { type Role } from "@/store/authStore";
import { GlassCard } from "@/app/components/GlassCard";
import api from "@/lib/axios"; // ✅ استخدم الـ instance بتاعك
import { z } from "zod";

// ============================================
// 1. Zod Schemas للـ Validation
// ============================================
const sendOtpSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  role: z.enum(["User", "Driver", "Admin", "Recycler", "Employee"]),
});

const resetPasswordSchema = z
  .object({
    otp: z.string().length(6, "OTP must be 6 digits"),
    // 🔥 الـ Password Validation المتكامل
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SendOtpForm = z.infer<typeof sendOtpSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole: Role;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  initialRole,
}: ForgotPasswordModalProps) {
  // ============================================
  // 2. State Management
  // ============================================
  const [step, setStep] = useState<1 | 2>(1);
  const [savedEmail, setSavedEmail] = useState("");
  const [savedRole, setSavedRole] = useState<Role>(initialRole);

  // ============================================
  // 3. React Hook Form
  // ============================================
  const sendOtpForm = useForm<SendOtpForm>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      email: "",
      role: initialRole,
    },
  });

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // ============================================
  // 4. Reset Forms when Modal Opens
  // ============================================
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSavedEmail("");
      setSavedRole(initialRole);
      sendOtpForm.reset({ email: "", role: initialRole });
      resetForm.reset({ otp: "", newPassword: "", confirmPassword: "" });
    }
  }, [isOpen, initialRole, sendOtpForm, resetForm]);

  // ============================================
  // 5. React Query Mutations
  // ============================================
  const sendOtpMutation = useMutation({
    mutationFn: async (data: SendOtpForm) => {
      // ✅ استخدم api بدل axios مباشرة
      const response = await api.post(
        `/Account/SendVerificationCode?email=${encodeURIComponent(data.email)}&role=${data.role}`
      );
      return response;
    },
    onSuccess: (_, variables) => {
      toast.success("Verification code sent successfully!");
      setSavedEmail(variables.email);
      setSavedRole(variables.role);
      setStep(2);
    },
    onError: (error: any) => {
      // ✅ الأخطاء بتتتعامل في Interceptor
      // بس لو عايز تتعامل بشكل خاص:
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      const params = new URLSearchParams({
        email: savedEmail,
        role: savedRole,
        code: data.otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      const response = await api.post(
        `/Account/ConfirmPasswordReset?${params.toString()}`
      );
      return response;
    },
    onSuccess: () => {
      toast.success("Password reset successfully! You can now log in.");
      sendOtpForm.reset();
      resetForm.reset();
      setStep(1);
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    },
  });

  if (!isOpen) return null;

  // ============================================
  // 6. UI Rendering
  // ============================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <GlassCard className="relative z-10 w-full max-w-md p-6 border border-slate-200/50 dark:border-white/10 shadow-2xl animate-scale-pop">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer font-bold"
        >
          ✕
        </button>

        {/* Title */}
        <div className="mb-5">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {step === 1
              ? "Enter your email to receive a 6-digit OTP verification code."
              : "Enter the OTP code received in your email and choose a new password."}
          </p>
        </div>

        {/* Step 1: Send OTP */}
        {step === 1 && (
          <form
            onSubmit={sendOtpForm.handleSubmit((data) =>
              sendOtpMutation.mutate(data)
            )}
            className="space-y-4"
          >
            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="Enter your email address"
                {...sendOtpForm.register("email")}
                className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {sendOtpForm.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1 px-3">
                  {sendOtpForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Role Field */}
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                {...sendOtpForm.register("role")}
                className="w-full pl-10 pr-8 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
              >
                <option value="User">Citizen</option>
                <option value="Driver">Driver</option>
                <option value="Admin">Admin</option>
                <option value="Recycler">Recycler</option>
                <option value="Employee">Employee</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
              {sendOtpForm.formState.errors.role && (
                <p className="text-xs text-red-500 mt-1 px-3">
                  {sendOtpForm.formState.errors.role.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={sendOtpMutation.isPending}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold shadow-md shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {sendOtpMutation.isPending ? "Sending OTP..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {/* Step 2: Reset Password */}
        {step === 2 && (
          <form
            onSubmit={resetForm.handleSubmit((data) =>
              resetMutation.mutate(data)
            )}
            className="space-y-4"
          >
            {/* OTP Field */}
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit OTP code"
                {...resetForm.register("otp")}
                className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 tracking-widest text-center font-bold"
              />
              {resetForm.formState.errors.otp && (
                <p className="text-xs text-red-500 mt-1 px-3">
                  {resetForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            {/* New Password Field */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="New Password"
                {...resetForm.register("newPassword")}
                className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {resetForm.formState.errors.newPassword && (
                <p className="text-xs text-red-500 mt-1 px-3">
                  {resetForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Confirm New Password"
                {...resetForm.register("confirmPassword")}
                className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {resetForm.formState.errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1 px-3">
                  {resetForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  resetForm.reset();
                }}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-full text-xs font-semibold transition-all active:scale-[0.98]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={resetMutation.isPending}
                className="flex-[2] py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {resetMutation.isPending ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
