"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon, MapPin, Phone } from "lucide-react";
import { useAuth, type Role } from "@/store/authStore";
import { homePathForRole } from "@/app/utils/roleAccess";
import PremiumAuthButton from "./PremiumAuthButton";

// ========== ١. قواعد التحقق من البيانات ==========
const signupSchema = z.object({
  name: z.string()
    .min(5, "Name must be at least 5 characters")
    .max(50, "Name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string()
    .min(1, "Password is required")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)"
    ),
  address: z.string()
    .min(30, "Address must be at least 30 characters")
    .max(100, "Address must not exceed 100 characters"),
  phone: z.string()
    .regex(/^01[0125]\d{8}$/, "Phone must be a valid Egypt number (e.g. 01012345678)")
    .optional()
    .or(z.literal("")),
});

// ========== ٢. نوع البيانات ==========
type SignupFormData = z.infer<typeof signupSchema>;

// ========== ٣. مكون فورم التسجيل ==========
export function SignupForm() {
  const { signup, selectedRole, setSelectedRole } = useAuth();
  const router = useRouter();

  // إعداد الفورم
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "Demo@1234",
      address: "",
      phone: "",
    },
  });

  // دالة الإرسال
  const onSubmit = async (data: SignupFormData) => {
    try {
      const u = await signup({
        fullName: data.name,
        email: data.email,
        passwordHash: data.password,
        address: data.address,
        role: selectedRole, // ← من المتجر، مش Props
        phone: data.phone || null,
      });
      
      toast.success(`Welcome, ${u.name}`);
      router.replace(homePathForRole(u.role));
    } catch (err: any) {
      toast.error(err?.message ?? "Registration failed");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* حقل الاسم الكامل */}
      <div className="relative">
        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          {...form.register("name")}
          type="text"
          placeholder="Full name (e.g. John Doe)"
          className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        {form.formState.errors.name && (
          <p className="text-red-500 text-xs mt-1 ml-4">{form.formState.errors.name.message}</p>
        )}
      </div>

      {/* حقل الإيميل */}
      <div className="relative">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          {...form.register("email")}
          type="email"
          placeholder="Email address"
          className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        {form.formState.errors.email && (
          <p className="text-red-500 text-xs mt-1 ml-4">{form.formState.errors.email.message}</p>
        )}
      </div>

      {/* حقل كلمة المرور */}
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          {...form.register("password")}
          type="password"
          placeholder="Password (e.g. Demo@1234)"
          className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-xs mt-1 ml-4">{form.formState.errors.password.message}</p>
        )}
      </div>

      {/* حقل العنوان */}
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          {...form.register("address")}
          type="text"
          placeholder="Address (Min 30 chars, e.g. Nile Corniche Road, Maadi, Cairo, Egypt)"
          className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        {form.formState.errors.address && (
          <p className="text-red-500 text-xs mt-1 ml-4">{form.formState.errors.address.message}</p>
        )}
      </div>

      {/* حقل التليفون - اختياري */}
      <div className="relative">
        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          {...form.register("phone")}
          type="tel"
          placeholder="Phone number (optional, e.g. 01012345678)"
          className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        {form.formState.errors.phone && (
          <p className="text-red-500 text-xs mt-1 ml-4">{form.formState.errors.phone.message}</p>
        )}
      </div>

      {/* قائمة اختيار نوع الحساب - من المتجر */}
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
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
      </div>

      {/* زرار الإرسال */}
      <div className="flex justify-center pt-2">
        <PremiumAuthButton
          variant="signup"
          onSignup={() => form.handleSubmit(onSubmit)()}
        />
      </div>
    </form>
  );
}