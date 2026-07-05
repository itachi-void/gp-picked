"use client";

import React, { Activity, useState } from "react";
import { ActivityIcon, Clock, Filter, Menu as MenuIcon, Search } from "lucide-react";
// استيراد البيانات من ملف الـ data بتاعك
import { mockAlerts, typeConfig } from "@/components/dashboard/smart-alerts/data";
import { Button } from "@/components/ui/shadcn-ui/button";
import { matchSorter } from "match-sorter";
import Menu from "../menu-dots/Menu";

export default function Alerts() {
  // حالة للبحث
  // 1. حالتين فقط (واحد للزرار وواحد للكتابة)
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  // 🔍 عملية الفلترة المزدوجة (زراير + بحث)
  const filteredAlerts = mockAlerts
    // 1. المصفاة الأولى: حسب الزرار المختار
    .filter((alert) => activeTab === "all" || alert.status === activeTab || alert.type === activeTab)

    // 2. المصفاة الثانية: البحث في كل النصوص
    .filter((alert) => {
      // نجمع كل النصوص في متغير واحد داخل الفلتر
      const searchContent =
        `${alert.title} ${alert.description} ${alert.location} ${alert.status} ${alert.type}`.toLowerCase();

      // نرجع "صح" لو كلمة البحث موجودة في النص المجمع
      return searchContent.includes(searchQuery.toLowerCase());
    });
  // 2. مصفوفة بسيطة للأزرار وألوانها
  const buttons = [
    { id: "all", label: "All", color: "bg-gray-500" },
    { id: "active", label: "Active", color: "bg-red-500" },
    { id: "critical", label: "Critical", color: "bg-orange-500" },
    { id: "warning", label: "Warning", color: "bg-amber-500" },
    { id: "resolved", label: "Resolved", color: "bg-emerald-500" },
  ];

  return (
    <div className="p-6 space-y-6 w-full">
      {/* --- قسم التحكم (البحث والأزرار) --- */}
      <div className="w-full flex flex-col md:flex-row gap-4 justify-between items-center border-2 border-gray-300 rounded-xl p-2">
        {/* مربع البحث (شكل فقط) */}
        <div className="relative w-full md:w-64">
          {/* ... */}
          <Search className="absolute left-3 top-2.5 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search here..."
            // الربط يبدأ من هنا 👇
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-emerald-500"
          />
        </div>

        {/* أزرار الفلترة */}
        <div className="flex items-center gap-2 overflow-x-auto w-auto pb-1">
          <Button variant="outline" className="h-10 px-4 bg-gray-50 border-gray-200 rounded-xl shadow-sm shrink-0">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>

          {buttons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveTab(btn.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === btn.id ? `${btn.color} text-white` : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- قسم عرض التنبيهات (القائمة) --- */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          // بنجيب الأيقونة واللون من الـ typeConfig اللي في ملف الـ data
          const config = typeConfig[alert.type] || typeConfig.info;
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm items-start hover:shadow-md transition-shadow"
            >
              {/* المربع الملون اللي فيه الأيقونة */}
              <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${config.color} shrink-0 shadow-sm mt-0.5`}>
                <Icon className="size-8 text-white" strokeWidth={1.5} />
              </div>

              {/* نصوص التنبيه والمحتوى */}
              <div className="flex-1 flex flex-col gap-1.5">
                {/* الصف الأول: العنوان وشارة الأولوية */}
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-gray-900 text-base">{alert.title}</h3>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      alert.priority === "high"
                        ? "bg-red-50 text-red-600"
                        : alert.priority === "medium"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {alert.priority}
                  </span>
                </div>

                {/* الصف الثاني: الوصف */}
                <p className="text-sm text-gray-500">{alert.description}</p>

                {/* الصف الثالث: الأيقونات السفلية (الوقت، المكان، السحب) */}
                <div className="flex items-center gap-5 mt-2">
                  <div className="flex items-center gap-1.5 text-[13px] text-gray-500 font-medium">
                    <Clock className="size-4" />
                    {alert.time}
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] text-gray-500 font-medium">
                    <ActivityIcon className="size-4" />
                    {alert.location}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                      alert.status === "active"
                        ? "bg-red-50 text-red-600"
                        : alert.status === "resolved"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
              </div>

              {/* المنيو على اليمين مع النقطة الحمراء */}
              <div className="shrink-0 relative">
                <Menu />
                <span className="absolute -top-1 -right-1 flex size-3">
                  <span className="relative inline-flex rounded-full size-3 bg-orange-500 border-2 border-white"></span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
