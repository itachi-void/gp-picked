"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, User as UserIcon, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/store/authStore";
import PremiumAuthButton from "@/app/components/auth/PremiumAuthButton";

// ========== خارطة الأدوار ==========
const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  driver: "Driver",
  citizen: "Citizen",
  employee: "Employee",
};

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // ========== منع Hydration Error ==========
  useEffect(() => {
    setMounted(true);
  }, []);

  // ========== Skeleton ==========
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-full">
        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </div>
    );
  }

  // ========== الحروف الأولى من الاسم ==========
  const initials = (user?.name ?? "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ========== تسجيل الخروج ==========
  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    router.push("/login");
  };

  // ========== تحديد الدور ==========
  const role = user?.role?.toLowerCase() ?? "citizen";
  const roleLabel = ROLE_LABELS[role] ?? "User";

  return (
    <DropdownMenu>
      {/* ✅ الزرار */}
      <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none cursor-pointer">
        {/* ✅ Avatar من Shadcn UI */}
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-[10px] bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {/* ✅ السهم */}
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </DropdownMenuTrigger>

      {/* ✅ القائمة المنسدلة */}
      <DropdownMenuContent className="w-56" align="end">
        {/* معلومات المستخدم */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">{user?.name ?? "Guest"}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
            {/* ✅ Badge للدور */}
            <Badge variant="secondary" className="mt-1 w-fit text-[10px]">
              {roleLabel}
            </Badge>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* الروابط */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={role === "employee" ? "/employee-profile" : "/profile"} className="flex items-center gap-2 cursor-pointer w-full">
              <UserIcon className="h-4 w-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2 cursor-pointer w-full">
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* تسجيل الخروج */}
        <div className="flex justify-center px-2 py-2">
          <PremiumAuthButton variant="logout" onLogout={handleLogout} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}