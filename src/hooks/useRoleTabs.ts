"use client";

import { useAuth } from "@/store/authStore";
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

  // ========== جلب التبويبات حسب الرول ==========
  let tabs: Tab[] = [];

  if (role === "admin" || role === "manager") {
    tabs = [
      { to: "/overview", label: "Overview", icon: LayoutDashboard },
      { to: "/pickups", label: "Pickups", icon: Package },
      { to: "/routes", label: "Routes", icon: Route },
      { to: "/fleet", label: "Fleet", icon: MapIcon },
      { to: "/drivers", label: "Drivers", icon: Users },
    ];
  } else if (role === "driver") {
    tabs = [
      { to: "/driver-portal", label: "Home", icon: Home },
    ];
  } else if (role === "employee") {
    tabs = [
      { to: "/verification", label: "Station", icon: ScanLine },
      { to: "/employee-history", label: "History", icon: History },
      { to: "/employee-profile", label: "Profile", icon: UserCircle2 },
      { to: "/pickups", label: "Pickups", icon: Package },
    ];
  } else {
    // citizen أو أي حاجة تانية
    tabs = [
      { to: "/citizen-portal", label: "Home", icon: Home },
    ];
  }

  return { tabs, role, user };
}