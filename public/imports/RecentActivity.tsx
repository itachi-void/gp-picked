"use client";
// src/app/dashboard/overview/components/RecentActivity.tsx
import { useEffect, useState } from "react";
import { Clock, ArrowRight, Activity } from "lucide-react";
import { useActivityStore } from "@/store/useActivityStore";
import LiveWord from "@/components/ui/LiveWord";

// const colors = {
//   route: "bg-blue-50 text-blue-600 border-blue-100",
//   driver: "bg-purple-50 text-purple-600 border-purple-100",
//   citizen: "bg-emerald-50 text-emerald-600 border-emerald-100",
//   alert: "bg-red-50 text-red-600 border-red-100",
//   collection: "bg-amber-50 text-amber-600 border-amber-100",
//   system: "bg-gray-50 text-gray-600 border-gray-100",
// };

const colors = {
  route: "bg-blue-500 text-white",
  driver: "bg-purple-500 text-white",
  citizen: "bg-emerald-500 text-white",
  alert: "bg-red-500 text-white",
  collection: "bg-amber-500 text-white",
  system: "bg-gray-500 text-white",
};

export default function RecentActivity() {
  const activities = useActivityStore((state) => state.activities);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500" /> Recent Activity
        </h3>
        <button className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-col">
        {activities.slice(0, 5).map((activity) => {
          // بنجيب الستايل المناسب بناءً على الـ category
          // لو النوع مش موجود في القاموس، بنستخدم الـ system كافتراضي
          const style = colors[activity.category] || colors.system;

          return (
            <div
              key={activity.id}
              className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-4">
                {/* ✨ الغلاف الملون للأيقونة - تعديل المقاسات والـ padding */}
                <div
                  className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl ${style}`}
                >
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-gray-900 leading-none mb-1">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {activity.details.length > 30
                      ? activity.details.substring(0, 30) + "..."
                      : activity.details}
                  </p>
                  <span className="text-xs text-gray-400 font-medium">
                    {isMounted
                      ? new Date(activity.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </span>
                </div>
              </div>
              <LiveWord
                category={activity.category}
                label={activity.category}
                vertical={true}
              />{" "}
            </div>
          );
        })}
      </div>
    </div>
  );
}
