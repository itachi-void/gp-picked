"use client";

import { useState } from "react";
import { useRoleContext } from "@/contexts/RoleContext";
import { usePickup } from "@/app/contexts/PickupContext";
import { useDrivers } from "@/app/contexts/DriversContext";
import OverviewHeader from "./overview-parts/OverviewHeader";
import LeftColumn from "./overview-parts/LeftColumn";
import MiddleColumn from "./overview-parts/MiddleColumn";
import RightColumn from "./overview-parts/RightColumn";

const greetings: Record<string, { title: string; subtitle: string }> = {
  admin: { title: "Operations Console", subtitle: "Live waste streams and dispatch dispatching cockpit" },
  manager: { title: "Regional Dashboard", subtitle: "Logistics speed maps and active zone indices" },
  driver: { title: "My Route Center", subtitle: "Coordinates and current drop-off routes" },
  citizen: { title: "Recycle Center", subtitle: "Your eco points ledger and request pipeline" },
};

export default function Overview() {
  const { currentRole } = useRoleContext();
  const { requests } = usePickup();
  const { drivers } = useDrivers();

  const [selectedRequestId, setSelectedRequestId] = useState<string>("REQ-101");
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month">("month");
  const [dashboardStyle, setDashboardStyle] = useState<"classic" | "glass">("glass");

  const isGlass = dashboardStyle === "glass";
  const greeting = greetings[currentRole] || greetings.admin;

  const activeRequest = requests.find((r: any) => r.id === selectedRequestId) || requests[0];
  const totalWeight = activeRequest.items.reduce((s: number, i: any) => s + i.expectedWeightKg, 0);
  const totalQuantity = activeRequest.items.reduce((s: number, i: any) => s + i.expectedQuantity, 0);
  const percentCapacity = Math.min(100, Math.round((totalQuantity / 400) * 100));

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 relative font-sans text-black dark:text-white transition-colors duration-300">
      {isGlass && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div
            className="absolute top-[10%] right-[5%] w-[450px] h-[450px] bg-[#4ED0F5]/10 dark:bg-[#4ED0F5]/15 rounded-full blur-[140px] animate-pulse"
            style={{ animationDuration: "8s" }}
          />
          <div
            className="absolute bottom-[20%] left-[2%] w-[400px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"
            style={{ animationDuration: "12s" }}
          />
        </div>
      )}

      <OverviewHeader
        isGlass={isGlass}
        setDashboardStyle={setDashboardStyle}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        requestsCount={requests.length}
        driversCount={drivers.length}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <LeftColumn
          isGlass={isGlass}
          activeRequest={activeRequest}
          totalWeight={totalWeight}
          totalQuantity={totalQuantity}
          percentCapacity={percentCapacity}
          pinCount={requests.length + drivers.length}
        />
        <MiddleColumn isGlass={isGlass} greeting={greeting} />
        <RightColumn
          isGlass={isGlass}
          requests={requests}
          selectedRequestId={selectedRequestId}
          setSelectedRequestId={setSelectedRequestId}
        />
      </div>
    </div>
  );
}
