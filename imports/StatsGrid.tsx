import {
  Package,
  Users,
  MapPin,
  Target,
  MoveUpRight,
  Sparkles,
} from "lucide-react";
import { Progress } from "@/components/ui/shadcn-ui/progress";

const stats = [
  {
    icon: Package,
    label: "Total Bottles",
    value: 150234,
    trend: "up",
    trendValue: "+12%",
    gradient: "from-emerald-500 to-teal-500",
    color: "text-emerald-500",
    hexColor: "#10b981",
  },
  {
    icon: Users,
    label: "Active Citizens",
    value: 5024,
    trend: "up",
    trendValue: "+8%",
    gradient: "from-blue-500 to-cyan-500",
    color: "text-blue-500",
    hexColor: "#3b82f6",
  },
  {
    icon: MapPin,
    label: "Active Routes",
    value: 24,
    trend: "up",
    trendValue: "+3",
    gradient: "from-purple-500 to-pink-500",
    color: "text-purple-500",
    hexColor: "#a855f7",
  },
  {
    icon: Target,
    label: "Collection Rate",
    value: 94,
    trend: "up",
    trendValue: "+2%",
    gradient: "from-orange-500 to-amber-500",
    color: "text-orange-500",
    hexColor: "#f97316",
  },
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="group relative overflow-hidden p-5 rounded-xl bg-white border border-gray-100 shadow-sm flex flex-col gap-5 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-md`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <Sparkles
              className={`w-6 h-6 ${stat.color} animate-spin duration-3000`}
            />
          </div>
          <div className="flex flex-col w-full">
            <p className="text-sm font-medium text-gray-500 mb-1">
              {stat.label}
            </p>
            <div className="flex items-end gap-3 mb-4">
              <p className="text-3xl font-extrabold text-gray-900">
                {stat.value.toLocaleString("en-US")}
              </p>
              <div
                className={`flex items-center gap-1 mb-1 text-sm font-bold ${stat.color}`}
              >
                <MoveUpRight className="w-4 h-4" />
                <span>{stat.trendValue}</span>
              </div>
            </div>
            <Progress indicatorClassName={stat.color} className="h-1.5"  />
          </div>
          <div
            className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-25 blur-2xl transition-all duration-300 group-hover:scale-150 group-hover:opacity-40 pointer-events-none`}
          />
        </div>
      ))}
    </div>
  );
}
