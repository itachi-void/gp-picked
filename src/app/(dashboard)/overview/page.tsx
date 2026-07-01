"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, UserMinus } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";
import OverviewHero from "./components/OverviewHero";
import OperationalKPIs from "./components/OperationalKPIs";
import TodaysGoals from "./components/TodaysGoals";
import LiveOperationsFeed from "./components/LiveOperationsFeed";
import InfrastructureHealthCard from "./components/InfrastructureHealthCard";

export default function OverviewPage() {
  // Mock live operations metrics for display
  const activePickups = 14;
  const driversOnRoad = 5;
  const totalDrivers = 8;
  const todayTonnage = 42.5;
  const fleetUtilization = 62.5;

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      {/* 1. Overview Dashboard Hero */}
      <div data-aos="fade-up">
        <OverviewHero
          activePickups={activePickups}
          driversOnRoad={driversOnRoad}
        />
      </div>

      {/* 2. Operational KPIs Row */}
      <div data-aos="fade-up" data-aos-delay="100">
        <OperationalKPIs
          activePickups={activePickups}
          driversOnRoad={driversOnRoad}
          totalDrivers={totalDrivers}
          todayTonnage={todayTonnage}
          fleetUtilization={fleetUtilization}
        />
      </div>

      {/* 3. Infrastructure Health Card */}
      <div data-aos="fade-up" data-aos-delay="200">
        <InfrastructureHealthCard />
      </div>

      {/* 4. Goals & Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div data-aos="fade-up" data-aos-delay="300">
          <TodaysGoals
            completedPickups={10}
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
