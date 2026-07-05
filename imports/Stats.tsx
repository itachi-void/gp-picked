import React from "react";
import { stats } from "../data";
import { Progress } from "@/components/ui/shadcn-ui/progress";

function Stats() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <stat.icon className={`w-10 h-10 p-2 text-white bg-gradient-to-r ${stat.color} rounded-lg`} />
            <p className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold">
              {stat.change}
            </p>
          </div>
          <p className="text-sm text-gray-600">{stat.label}</p>
          <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
          <Progress 
            className="h-1 bg-gray-200 rounded-lg mt-3" 
            indicatorClassName={stat.color} 
          />
        </div>
      ))}
    </div>
  );
}

export default Stats;
