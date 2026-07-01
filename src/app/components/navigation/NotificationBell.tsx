"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellRing,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Check,
  CheckCheck,
  Trash2,
  Inbox,
} from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type?: "success" | "warning" | "info";
  severity?: "success" | "warning" | "info";
  read: boolean;
  link?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "AI Validation Approved",
    desc: "Verification station validated plastic pickup at Center 3.",
    time: "2 mins ago",
    type: "success",
    read: false,
  },
  {
    id: "2",
    title: "Route Optimized",
    desc: "Driver 4 route recalculated to save 2.4kg of CO2.",
    time: "15 mins ago",
    type: "info",
    read: false,
  },
  {
    id: "3",
    title: "Smart Alert triggered",
    desc: "High density sensor anomaly reported in Zone A.",
    time: "1 hr ago",
    type: "warning",
    read: false,
  },
  {
    id: "4",
    title: "Reward Claimed",
    desc: "Eco-points redeemed for a smart planter certificate.",
    time: "3 hrs ago",
    type: "success",
    read: true,
  },
];

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("🔔 [Notifications] No token found in localStorage.");
        return;
      }

      const response = await axios.get("/api/proxy/Notifications/my-notifications", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      const data = response.data;
      console.log("🔔 [Notifications] API response data:", data);

      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.notifications)) {
        list = data.notifications;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      } else {
        console.warn(
          "🔔 [Notifications] API response is not an array and doesn't contain a known array property.",
          data,
        );
        return;
      }

      const mappedData = list.map((n: any) => ({
        id: String(n.id || Math.random()),
        title: n.title || "Notification",
        desc: n.desc || n.message || n.description || "",
        time: n.time || n.createdAt || "Just now",
        type: n.type || n.severity || "info",
        read: n.read || false,
        link: n.link || "#",
      }));

      setNotifications(mappedData);
      localStorage.setItem("dashboard_notifications", JSON.stringify(mappedData));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          console.error("🔔 [Notifications] Request timed out after 10s");
        } else if (err.response) {
          console.error(
            `🔔 [Notifications] API returned error ${err.response.status}:`,
            err.response.data,
          );
        } else {
          console.error("🔔 [Notifications] Network error:", err.message);
        }
      } else {
        console.error("🔔 [Notifications] Failed to fetch notifications:", err);
      }
    }
  };

  // Load from localStorage or mock data
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("dashboard_notifications");
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        setNotifications(mockNotifications);
      }
    } else {
      setNotifications(mockNotifications);
    }

    // fetchNotifications();

    // Poll for new notifications every 10 seconds
    // const interval = setInterval(() => {
    //   fetchNotifications();
    // }, 10000);

    // return () => clearInterval(interval);
  }, []);

  // Listen for external updates (e.g. from context)
  useEffect(() => {
    const handleUpdate = () => {
      const stored = localStorage.getItem("dashboard_notifications");
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch (e) {
          // ignore
        }
      }
    };
    window.addEventListener("notifications_updated", handleUpdate);
    return () => window.removeEventListener("notifications_updated", handleUpdate);
  }, []);

  // Save to localStorage
  const saveNotifications = (newNotes: Notification[]) => {
    setNotifications(newNotes);
    localStorage.setItem("dashboard_notifications", JSON.stringify(newNotes));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    saveNotifications(updated);
  };

  const toggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: !n.read } : n,
    );
    saveNotifications(updated);
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveNotifications([]);
  };

  const getIcon = (type?: string, severity?: string) => {
    const finalType = type || severity || "info";
    switch (finalType) {
      case "success":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
        );
      case "warning":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
        );
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9">
        <Bell className="h-5 w-5 text-gray-500" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 cursor-pointer"
        >
          {unreadCount > 0 ? (
            <>
              <BellRing className="h-5 w-5 text-gray-700 dark:text-gray-300 animate-pulse" />
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
                {unreadCount}
              </span>
            </>
          ) : (
            <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 sm:w-[380px] p-0 mr-4 shadow-xl border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden backdrop-blur-md bg-white/95 dark:bg-gray-950/95"
        align="end"
      >
        <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <DropdownMenuLabel className="p-0 text-base font-bold text-gray-900 dark:text-gray-100">
              Notifications
            </DropdownMenuLabel>
            {unreadCount > 0 && (
              <Badge className="bg-blue-100 hover:bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-none font-semibold px-2 py-0.5 rounded-full text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 mb-3 border border-dashed border-gray-200 dark:border-gray-800">
                <Inbox className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">All caught up!</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You have no new notifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((n) => {
                const noteType = n.type || n.severity || "info";
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id);
                      if (n.link && n.link !== "#") {
                        router.push(n.link);
                      }
                    }}
                    className={cn(
                      "flex gap-3 p-4 hover:bg-gray-50/80 dark:hover:bg-gray-900/80 transition-colors cursor-pointer relative group",
                      !n.read && "bg-blue-50/30 dark:bg-blue-950/10",
                    )}
                  >
                    {/* Left indicator border */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all duration-300 scale-y-[0.7]",
                        !n.read ? "scale-y-100" : "opacity-0 group-hover:opacity-100",
                        noteType === "success" && "bg-emerald-500",
                        noteType === "warning" && "bg-amber-500",
                        noteType === "info" && "bg-blue-500",
                      )}
                    />

                    {/* Icon */}
                    {getIcon(n.type, n.severity)}

                    {/* Content */}
                    <div className="flex-1 space-y-1 pr-6">
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            "text-sm text-gray-800 dark:text-gray-200 leading-snug",
                            !n.read ? "font-bold" : "font-medium",
                          )}
                        >
                          {n.title}
                        </p>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium shrink-0 ml-2">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {n.desc}
                      </p>
                    </div>

                    {/* Quick actions (on hover or for unread status) */}
                    <div className="absolute right-3 top-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => toggleRead(n.id, e)}
                        title={n.read ? "Mark as unread" : "Mark as read"}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
                      >
                        <Check className={cn("h-3 w-3", !n.read && "text-blue-500")} />
                      </button>
                      <button
                        onClick={(e) => deleteNotification(n.id, e)}
                        title="Delete notification"
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Red/Blue unread dot in regular view if not hovered */}
                    {!n.read && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 group-hover:opacity-0 transition-opacity h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 text-center flex items-center justify-center">
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors py-1 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer"
            >
              Clear all notifications
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
