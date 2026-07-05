"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ClipboardList,
  Search,
  Filter,
  X,
  Truck,
  Users,
  MapPin,
  AlertTriangle,
  Settings,
  Package,
  RefreshCw,
} from "lucide-react";
import {
  useActivityLog,
  ActivityEntry,
} from "../../contexts/ActivityLogContext";

type CategoryFilter = "all" | ActivityEntry["category"];
type SeverityFilter = "all" | ActivityEntry["severity"];

const CATEGORY_CONFIG: Record<
  ActivityEntry["category"],
  { icon: typeof Truck; color: string; label: string }
> = {
  route: {
    icon: MapPin,
    color: "bg-blue-100 text-blue-600",
    label: "Route",
  },
  driver: {
    icon: Truck,
    color: "bg-green-100 text-green-600",
    label: "Driver",
  },
  citizen: {
    icon: Users,
    color: "bg-purple-100 text-purple-600",
    label: "Citizen",
  },
  system: {
    icon: Settings,
    color: "bg-gray-100 text-gray-600",
    label: "System",
  },
  alert: {
    icon: AlertTriangle,
    color: "bg-red-100 text-red-600",
    label: "Alert",
  },
  collection: {
    icon: Package,
    color: "bg-orange-100 text-orange-600",
    label: "Collection",
  },
};

const SEVERITY_COLORS: Record<
  ActivityEntry["severity"],
  string
> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const ROLE_COLORS: Record<ActivityEntry["userRole"], string> = {
  admin: "bg-purple-100 text-purple-700",
  driver: "bg-blue-100 text-blue-700",
  citizen: "bg-green-100 text-green-700",
  system: "bg-gray-100 text-gray-700",
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString();
}

export default function ActivityLog() {
  const { activities, logActivity } = useActivityLog();
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<CategoryFilter>("all");
  const [severity, setSeverity] =
    useState<SeverityFilter>("all");

  const filtered = activities.filter((a) => {
    const matchSearch =
      a.action.toLowerCase().includes(search.toLowerCase()) ||
      a.user.toLowerCase().includes(search.toLowerCase()) ||
      a.target.toLowerCase().includes(search.toLowerCase()) ||
      a.details.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      category === "all" || a.category === category;
    const matchSev =
      severity === "all" || a.severity === severity;
    return matchSearch && matchCat && matchSev;
  });

  const simulateActivity = () => {
    const samples = [
      {
        action: "Driver Status Updated",
        user: "Admin",
        userRole: "admin" as const,
        target: "Omar Khaled",
        details: "Status changed to available",
        category: "driver" as const,
        severity: "low" as const,
      },
      {
        action: "Route Auto-assigned",
        user: "System",
        userRole: "system" as const,
        target: "RT-007 Zamalek",
        details:
          "Route automatically assigned to nearest available driver",
        category: "route" as const,
        severity: "medium" as const,
      },
    ];
    const s =
      samples[Math.floor(Math.random() * samples.length)];
    logActivity(s);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-emerald-600" />
            Activity Log
          </h1>
          <p className="text-gray-600 mt-1">
            Complete record of all system events and actions
          </p>
        </div>
        <motion.button
          onClick={simulateActivity}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Simulate Event
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          {
            label: "Total Events",
            value: activities.length,
            color: "from-blue-500 to-cyan-500",
          },
          {
            label: "High Severity",
            value: activities.filter(
              (a) => a.severity === "high",
            ).length,
            color: "from-red-500 to-orange-500",
          },
          {
            label: "Today",
            value: activities.filter(
              (a) =>
                Date.now() - a.timestamp.getTime() < 86400000,
            ).length,
            color: "from-emerald-500 to-teal-500",
          },
          {
            label: "System Events",
            value: activities.filter(
              (a) => a.userRole === "system",
            ).length,
            color: "from-purple-500 to-pink-500",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} mb-3`}
            />
            <p className="text-2xl font-bold text-gray-900">
              {s.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {s.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events, users, targets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Category & Severity */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">
              Category:
            </span>
            {(
              [
                "all",
                "route",
                "driver",
                "citizen",
                "alert",
                "system",
                "collection",
              ] as const
            ).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${category === c ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {c === "all"
                  ? "All"
                  : (CATEGORY_CONFIG[c]?.label ?? c)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">
              Severity:
            </span>
            {(["all", "low", "medium", "high"] as const).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${severity === s ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {s}
                </button>
              ),
            )}
          </div>
        </div>
      </motion.div>

      {/* Activity List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Events ({filtered.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No events match your filters
                </p>
              </div>
            ) : (
              filtered.map((entry, i) => {
                const cat = CATEGORY_CONFIG[entry.category];
                const CatIcon = cat.icon;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: Math.min(i * 0.03, 0.3),
                    }}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Category Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.color}`}
                    >
                      <CatIcon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900">
                              {entry.action}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[entry.severity]}`}
                            >
                              {entry.severity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Target:{" "}
                            <span className="font-medium text-gray-700">
                              {entry.target}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {entry.details}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                          {timeAgo(entry.timestamp)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[entry.userRole]}`}
                        >
                          {entry.userRole}
                        </span>
                        <span className="text-xs text-gray-500">
                          {entry.user}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}