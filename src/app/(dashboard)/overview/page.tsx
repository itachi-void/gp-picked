"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";
import api from "@/lib/axios";
import OverviewHero from "./components/OverviewHero";
import OperationalKPIs from "./components/OperationalKPIs";
import TodaysGoals from "./components/TodaysGoals";
import LiveOperationsFeed from "./components/LiveOperationsFeed";
import InfrastructureHealthCard from "./components/InfrastructureHealthCard";

export default function OverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["overviewStats"],
    queryFn: async () => {
      const [pickupsRes, recyclersRes, activeRes, earningRes] = await Promise.allSettled([
        api.get("/admin/total-pickup-requests"),
        api.get("/admin/total-recyclers"),
        api.get("/admin/total-recycling-active"),
        api.get("/admin/Total-Earing"),
      ]);

      const totalPickups = pickupsRes.status === "fulfilled" ? Number(pickupsRes.value.data) || 0 : 0;
      const totalRecyclers = recyclersRes.status === "fulfilled" ? Number(recyclersRes.value.data) || 0 : 0;
      const activeRecyclers = activeRes.status === "fulfilled" ? Number(activeRes.value.data) || 0 : 0;
      const totalEarning = earningRes.status === "fulfilled" ? Number(earningRes.value.data) || 0 : 0;

      return { totalPickups, totalRecyclers, activeRecyclers, totalEarning };
    },
    staleTime: 30000,
  });

  const activePickups = data?.totalPickups ?? 0;
  const driversOnRoad = data?.activeRecyclers ?? 0;
  const totalDrivers = data?.totalRecyclers ?? 0;
  const todayTonnage = data?.totalEarning ? Math.round((data.totalEarning / 1000) * 10) / 10 : 0;
  const fleetUtilization = totalDrivers > 0 ? Math.round((driversOnRoad / totalDrivers) * 100) : 0;

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto p-6 space-y-6 animate-pulse">
        <GlassCard className="p-6 lg:p-8">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            <span className="text-sm text-slate-500 dark:text-slate-400">Loading overview data...</span>
          </div>
        </GlassCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} className="p-5">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-full mt-2" />
            </GlassCard>
          ))}
        </div>
        <div className="h-48 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-5 h-48"><div /></GlassCard>
          <GlassCard className="p-5 h-48"><div /></GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      <div data-aos="fade-up">
        <OverviewHero
          activePickups={activePickups}
          driversOnRoad={driversOnRoad}
        />
      </div>

      <div data-aos="fade-up" data-aos-delay="200">
        <OperationalKPIs
          activePickups={activePickups}
          driversOnRoad={driversOnRoad}
          totalDrivers={totalDrivers}
          todayTonnage={todayTonnage}
          fleetUtilization={fleetUtilization}
        />
      </div>

      <div data-aos="fade-up" data-aos-delay="200">
        <InfrastructureHealthCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div data-aos="fade-up" data-aos-delay="300">
          <TodaysGoals
            completedPickups={Math.min(activePickups, Math.round(activePickups * 0.7))}
            totalPickups={activePickups}
            todayTonnage={todayTonnage}
            driversOnRoad={driversOnRoad}
            totalDrivers={totalDrivers}
          />
        </div>
        <div data-aos="fade-up" data-aos-delay="400">
          <LiveOperationsFeed />
        </div>
      </div>
    </div>
  );
}
