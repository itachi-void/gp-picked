import React from "react";
import { useRoleContext } from "@/contexts/RoleContext";
import {
  ArrowUpRight,
  DollarSign,
  Leaf,
  Target,
  TrendingUp,
} from "lucide-react";
function SystemOverview() {
  const { currentRole } = useRoleContext();
  return (
    <div className="flex flex-col justify-center w-full h-full gap-8">
      <div
        className={`w-full h-full flex flex-col bg-gradient-to-br ${
          currentRole === "driver"
            ? "from-blue-500 via-indigo-500 to-purple-500"
            : currentRole === "citizen"
              ? "from-orange-500 via-amber-500 to-yellow-500"
              : "from-emerald-500 via-teal-500 to-cyan-500"
        } rounded-2xl shadow-xl p-6 text-white relative overflow-hidden`}
      >
        <div className="m-auto flex flex-col gap-4">
          {(currentRole === "admin" ||
            currentRole === "manager") && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-2 w-full">
                  <TrendingUp className="w-8 h-8 text-white" />

                  <p className="text-xl font-bold text-white">
                    Financial & System Overview
                  </p>
                </div>
                {[
                  {
                    icon: DollarSign,
                    label: "Revenue This Month",
                    value: "$45,230",
                    change: "+15%",
                  },
                  {
                    icon: Leaf,
                    label: "Total CO₂ Saved",
                    value: "2,340 kg",
                    change: "+8%",
                  },
                  {
                    icon: Target,
                    label: "System Efficiency",
                    value: "94%",
                    change: "+5%",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="flex flex-row w-full items-center gap-5 h-15 bg-white/10 hover:bg-white/20 transition-all duration-300 rounded-lg p-3 py-8"
                  >
                    <stat.icon className="w-10 h-10 text-white bg-white/20 p-2 rounded-sm" />
                    <div className="flex flex-row w-full items-center justify-between">
                      <div className="">
                        <p className="text-sm opacity-80">{stat.label}</p>
                        <p className="text-lg font-bold">{stat.value}</p>
                      </div>
                      <div className="w-fit h-fit flex flex-row items-center justify-center bg-white/20 px-2 rounded-sm space-x-1">
                        <ArrowUpRight className="w-3 h-3" />
                        <p>{stat.change}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default SystemOverview;
