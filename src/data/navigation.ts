import {
  Building2,
  MapIcon,
  Globe2,
  CreditCard,
  Clock,
  ScanLine,
  Truck,
  BarChart3,
  AlertTriangle,
  Gauge,
  FileText,
  Leaf,
  TrendingUp,
  Award,
  Trophy,
  Gift,
  UserCircle2,
  Recycle,
  Sparkles,
  Activity,
  ShieldCheck,
  ClipboardList,
  LifeBuoy,
  Users
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: any;
  roles: string[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const moreGroups: NavGroup[] = [
  {
    title: "Network",
    items: [
      { to: "/centers",      label: "Centers",       icon: Building2,     roles: ["admin", "manager"] },
      { to: "/centers-list", label: "Centers List",  icon: Building2,     roles: ["admin", "manager", "employee"] },
      { to: "/communities",  label: "Communities",         icon: MapIcon,       roles: ["admin", "manager"] },
      { to: "/partners",     label: "Partners",      icon: CreditCard,    roles: ["admin", "manager"] },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/schedule",     label: "Schedule",              icon: Clock,         roles: ["admin", "manager", "driver"] },
      { to: "/verification", label: "Verification Station",  icon: ScanLine,      roles: ["admin", "employee"] },
      { to: "/logistics",    label: "Logistics Impact",      icon: Truck,         roles: ["admin", "manager"] },
    ],
  },
  {
    title: "Insights",
    items: [
      { to: "/analytics",    label: "Analytics",     icon: BarChart3,     roles: ["admin", "manager"] },
      { to: "/alerts",       label: "Smart Alerts",  icon: AlertTriangle, roles: ["admin", "manager"] },
      { to: "/performance",  label: "Performance",   icon: Gauge,         roles: ["admin", "manager"] },
      { to: "/reports",      label: "Reports",       icon: FileText,      roles: ["admin", "manager"] },
      { to: "/sustainability",label: "Sustainability",icon: Leaf,          roles: ["admin", "citizen", "user"] },
    ],
  },
  {
    title: "Engagement",
    items: [
      { to: "/citizen-levels",label: "Levels",        icon: TrendingUp,    roles: ["admin", "citizen", "user"] },
      { to: "/badges",        label: "Badges",        icon: Award,         roles: ["admin", "citizen", "user"] },
      { to: "/leaderboards",  label: "Leaderboards",  icon: Trophy,        roles: ["admin", "citizen", "user"] },
      { to: "/rewards",       label: "Rewards",       icon: Gift,          roles: ["admin", "citizen", "user"] },
      { to: "/citizen-stats", label: "Citizen Stats", icon: UserCircle2,   roles: ["admin", "citizen", "user"] },
    ],
  },
  {
    title: "Administration",
    items: [
      { to: "/users",        label: "Users",        icon: Users,          roles: ["admin"] },
      { to: "/resources",    label: "Resources",    icon: Recycle,        roles: ["admin"] },
      { to: "/ai-validation",label: "AI Validation",icon: Sparkles,       roles: ["admin", "employee"] },
      { to: "/activity-log", label: "Activity Log", icon: Activity,       roles: ["admin"] },
      { to: "/permissions",  label: "Permissions",  icon: ShieldCheck,    roles: ["admin"] },
      { to: "/audit",        label: "Audit Log",    icon: ClipboardList,  roles: ["admin"] },
      { to: "/support",      label: "Support",      icon: LifeBuoy,       roles: ["admin", "manager", "driver", "employee", "citizen", "user"] },
    ],
  }
];
