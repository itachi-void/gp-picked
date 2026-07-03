"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, User as UserIcon } from "lucide-react";
import { useAuth, type Role } from "@/store/authStore";
import { homePathForRole } from "@/app/utils/roleAccess";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import PremiumAuthButton from "./PremiumAuthButton";

// ========== ١. قواعد التحقق من البيانات ==========
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});



// ========== ٣. مكون فورم تسجيل الدخول ==========
export function LoginForm() {
  const { login, selectedRole, setSelectedRole, demoLoginTrigger } = useAuth();
  const router = useRouter();

  const [isForgotOpen, setIsForgotOpen] = useState(false);

  // ========== ٤. إعداد الفورم ==========
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "Demo@1234" },
  });

  // تأثير تلقائي لملء البيانات عند النقر على Demo roles
  useEffect(() => {
    if (demoLoginTrigger) {
      form.setValue("username", demoLoginTrigger.username, {
        shouldValidate: true,
      });
      form.setValue("password", demoLoginTrigger.password, {
        shouldValidate: true,
      });
      setSelectedRole(demoLoginTrigger.role);
      useAuth.setState({ demoLoginTrigger: null });
    }
  }, [demoLoginTrigger, form, setSelectedRole]);

  // ========== ٥. دالة الإرسال ==========
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const u = await login(data.username.trim(), data.password, selectedRole);
      toast.success(`Welcome back, ${u.name}`);
      router.replace(homePathForRole(u.role));
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication failed");
      throw err;
    }
  };

  const handleAuthSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      throw new Error("Validation failed");
    }
    await onSubmit(form.getValues());
  };



  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* حقل اسم المستخدم */}
        <div className="relative">
          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            {...form.register("username")}
            type="text"
            placeholder="Username"
            className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          {form.formState.errors.username && (
            <p className="text-red-500 text-xs mt-1 ml-4">
              {form.formState.errors.username.message}
            </p>
          )}
        </div>

        {/* حقل كلمة المرور */}
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            {...form.register("password")}
            type="password"
            placeholder="Password"
            className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          {form.formState.errors.password && (
            <p className="text-red-500 text-xs mt-1 ml-4">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* رابط نسيت كلمة المرور */}
        <div className="flex justify-end px-2 -mt-2">
          <button
            type="button"
            onClick={() => setIsForgotOpen(true)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {/* قائمة اختيار نوع الحساب */}
        <div className="relative">
          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as Role)}
            className="w-full pl-10 pr-8 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer bg-white dark:bg-slate-900"
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
        </div>

        {/* زرار تسجيل الدخول */}
        <div className="flex justify-center pt-2">
          <PremiumAuthButton
            variant="login"
            onLogin={handleAuthSubmit}
          />
        </div>
      </form>

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        initialRole={selectedRole}
      />
    </>
  );
}
