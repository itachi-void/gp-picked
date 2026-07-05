"use client";

import { useRouter } from "next/navigation";
import { Shield, Truck, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/store/authStore";
import { useLanguage } from "@/contexts/LanguageContext";

const demoChips = [
  {
    name: "administrator",
    password: "123456",
    role: "Admin" as const,
    displayName: "Admin",
    Icon: Shield,
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    name: "Alhassen",
    password: "Alhassen0106@",
    role: "Employee" as const,
    displayName: "employee", // changed to lower so tApi maps it to employee translation
    Icon: Shield,
    bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    name: "Alhassan",
    password: "1df@zAfA",
    role: "Driver" as const,
    displayName: "driver", // changed to lower
    Icon: Truck,
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    name: "itachi",
    password: "1234@5FGg678",
    role: "User" as const,
    displayName: "citizen", // changed to lower
    Icon: UserCircle2,
    bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
];

export function DemoRoles() {
  const setSelectedRole = useAuth((state) => state.setSelectedRole);
  const router = useRouter();
  const { t, tApi, language } = useLanguage();

  return (
    <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-semibold">
        {t("auth.demoRoles")}
      </p>
      <div className="flex flex-wrap gap-2">
        {demoChips.map((chip) => {
          const { role, displayName, Icon, bg, name, password } = chip;
          const displayLabel = tApi(displayName);
          return (
            <button
              key={role}
              type="button"
              onClick={() => {
                setSelectedRole(role);
                toast.info(`Demo: ${displayLabel}`);

                useAuth.setState({
                  demoLoginTrigger: {
                    username: name || "",
                    password: password || "",
                    role: role,
                  },
                });

                if (window.location.pathname !== "/login") {
                  router.push("/login");
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-current/10 hover:opacity-90 transition-opacity text-xs font-semibold cursor-pointer ${bg}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {displayLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

