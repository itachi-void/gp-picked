// src/app/dashboard/overview/components/QuickActions.tsx
import { Zap, MapPin, Package, Activity, Users, Award } from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { useActivityStore } from "@/store/useActivityStore";

export default function QuickActions() {
  const { currentRole } = useRoleContext();
  const logActivity = useActivityStore((state) => state.logActivity);

  // منطق الأزرار بناءً على الدور (Role)
  const actions =
    currentRole === "citizen"
      ? [
          {
            icon: Zap,
            title: "Request Pickup",
            description: "Schedule collection",
            color: "from-emerald-500 to-teal-600",
          },
          {
            icon: Award,
            title: "My Rewards",
            description: "Points & badges",
            color: "from-orange-500 to-amber-600",
          },
          {
            icon: Users,
            title: "Communities",
            description: "Join challenges",
            color: "from-purple-500 to-pink-600",
          },
          {
            icon: MapPin,
            title: "Find Center",
            description: "Nearest drop-off",
            color: "from-blue-500 to-cyan-600",
          },
        ]
      : currentRole === "driver"
        ? [
            {
              icon: MapPin,
              title: "My Route",
              description: "Today's route",
              color: "from-blue-500 to-cyan-600",
            },
            {
              icon: Package,
              title: "Scan Bottles",
              description: "Quick QR scan",
              color: "from-emerald-500 to-teal-600",
            },
            {
              icon: Activity,
              title: "My Stats",
              description: "Performance",
              color: "from-purple-500 to-pink-600",
            },
            {
              icon: Zap,
              title: "Report Issue",
              description: "Submit report",
              color: "from-orange-500 to-amber-600",
            },
          ]
        : [
            {
              icon: Zap,
              title: "Quick Scan",
              description: "New QR code",
              color: "from-emerald-500 to-teal-600",
            },
            {
              icon: MapPin,
              title: "New Route",
              description: "Create route",
              color: "from-blue-500 to-cyan-600",
            },
            {
              icon: Users,
              title: "Add Citizen",
              description: "Register user",
              color: "from-purple-500 to-pink-600",
            },
            {
              icon: Activity,
              title: "View Analytics",
              description: "Deep insights",
              color: "from-orange-500 to-amber-600",
            },
          ];

  const handleAction = (title: string) => {
    logActivity({
      action: title,
      details: `User performed ${title} action`,
      user: "Current User",
      userRole: currentRole as any,
      target: "System",
      category: "system",
      severity: "low",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Zap className="w-5 h-5 text-emerald-500" /> Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action, index) => (
          <div
            key={index}
            onClick={() => handleAction(action.title)}
            className={`p-6 bg-gradient-to-br ${action.color} rounded-2xl relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 text-white`}
          >
            <action.icon className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="text-xl font-bold">{action.title}</h4>
            <p className="text-sm opacity-80">{action.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
