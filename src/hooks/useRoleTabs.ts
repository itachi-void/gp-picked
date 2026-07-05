"use client";

import { useAuth } from "@/store/authStore";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Home, LayoutDashboard, Package, Route, MapIcon, Users,
  ScanLine, History, UserCircle2,
} from "lucide-react";

// ========== نوع التبويبة ==========
interface Tab {
  to: string;
  label: string;
  icon: any; // أيقونة من lucide-react
}

// ========== الهوك الرئيسي ==========
export function useRoleTabs() {
  const user = useAuth((state) => state.user);
  
  // Normalize roles to avoid mismatches
  const rawRole = user?.role?.toLowerCase() ?? "citizen";
  const role = (rawRole === "hubstaff" || rawRole === "employee") 
    ? "employee" 
    : (rawRole === "recycler" || rawRole === "driver") 
      ? "driver" 
      : (rawRole === "user" || rawRole === "citizen") 
        ? "citizen" 
        : rawRole;

  const { t } = useLanguage();

  // ========== جلب التبويبات حسب الرول ==========
  let tabs: Tab[] = [];

  if (role === "admin" || role === "manager") {
    tabs = [
      { to: "/overview", label: t("nav.overview"), icon: LayoutDashboard },
      { to: "/pickups", label: t("nav.pickups"), icon: Package },
      { to: "/routes", label: t("nav.routes"), icon: Route },
      { to: "/fleet", label: t("nav.fleet"), icon: MapIcon },
      { to: "/drivers", label: t("nav.drivers"), icon: Users },
    ];
  } else if (role === "driver") {
    tabs = [
      { to: "/driver-portal", label: t("nav.home"), icon: Home },
    ];
  } else if (role === "employee") {
    tabs = [
      { to: "/verification", label: t("nav.station"), icon: ScanLine },
      { to: "/employee-history", label: t("nav.history"), icon: History },
      { to: "/employee-profile", label: t("nav.profile"), icon: UserCircle2 },
      { to: "/pickups", label: t("nav.pickups"), icon: Package },
    ];
  } else {
    // citizen أو أي حاجة تانية
    tabs = [
      { to: "/citizen-portal", label: t("nav.home"), icon: Home },
    ];
  }

  return { tabs, role, user };
}