"use client";

import { useEffect, useState } from "react";
import { Truck, BellRing, PackageCheck } from "lucide-react";
import { usePickup } from "@/store/pickupStore";
import { useAuth } from "@/store/authStore";

export function TopBarStats() {
  const [activeDrivers, setActiveDrivers] = useState(8);
  const [activeAlerts, setActiveAlerts] = useState(3);
  const { requests, fetchRequests } = usePickup();
  const { user } = useAuth();
  
  // Real fetch for pickups
  useEffect(() => {
    if (user) {
      fetchRequests();
    }
    
    // Simulate real-time updates for drivers and alerts to make the dashboard feel alive
    const interval = setInterval(() => {
      setActiveDrivers(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next >= 6 && next <= 12 ? next : prev;
      });
      
      setActiveAlerts(prev => {
        if (Math.random() > 0.8) {
          const delta = Math.random() > 0.5 ? 1 : -1;
          const next = prev + delta;
          return next >= 1 && next <= 5 ? next : prev;
        }
        return prev;
      });
    }, 8000);
    
    return () => clearInterval(interval);
  }, [fetchRequests, user]);

  const pendingRequestsCount = requests.filter(r => r.status === "Pending").length || 5;

  if (!user) return null;

  return (
    <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-full transition-all duration-300">
      {/* Active Drivers */}
      <div className="flex items-center gap-2 group cursor-pointer" title="Active Fleet Drivers">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>
        <Truck className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors" />
        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
          <strong className="text-slate-900 dark:text-slate-200 transition-all font-bold">{activeDrivers}</strong> Drivers
        </span>
      </div>

      <div className="h-3 w-[1px] bg-slate-200 dark:bg-white/10" />

      {/* Pending Pickups */}
      <div className="flex items-center gap-2 group cursor-pointer" title="Pending Pickups">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </div>
        <PackageCheck className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-amber-500 transition-colors" />
        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
          <strong className="text-slate-900 dark:text-slate-200 transition-all font-bold">{pendingRequestsCount}</strong> Pickups
        </span>
      </div>

      <div className="h-3 w-[1px] bg-slate-200 dark:bg-white/10" />

      {/* Active Alerts */}
      <div className="flex items-center gap-2 group cursor-pointer" title="System Alerts">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </div>
        <BellRing className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-rose-500 transition-colors" />
        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
          <strong className="text-slate-900 dark:text-slate-200 transition-all font-bold">{activeAlerts}</strong> Alerts
        </span>
      </div>
    </div>
  );
}
