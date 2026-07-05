"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { RoleT, colorBg, colorText, colorBtnFrom, colorBtnTo } from "./types";
import { useAuth } from "@/store/authStore";
import { homePathForRole } from "@/app/utils/roleAccess";
import { useLanguage } from "@/contexts/LanguageContext";

interface RoleCardProps {
  role: RoleT;
  index: number;
}

export function RoleCard({ role, index }: RoleCardProps) {
  const { user } = useAuth();
  const Icon = role.icon;
  const { t } = useLanguage();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const targetHref = (mounted && user) ? homePathForRole(role.title) : `/login?role=${role.title}`;

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={index * 150}
      className="group bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent cursor-pointer transition-all duration-300 hover:-translate-y-4 hover:scale-[1.03] hover:border-emerald-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]"
    >
      {/* مربع الأيقونة بلون الدور */}
      <div className={`w-16 h-16 ${colorBg[role.color] || "bg-emerald-100"} rounded-2xl flex items-center justify-center mb-6 mx-auto transition-transform duration-300 group-hover:scale-110`}>
        <Icon className={`w-8 h-8 ${colorText[role.color] || "text-emerald-600"}`} />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">{role.title}</h3>
      <p className="text-gray-600 text-center mb-6">{role.description}</p>

      {/* مميزات الدور */}
      <ul className="space-y-3 mb-6">
        {role.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-gray-700">
            <CheckCircle className={`w-5 h-5 ${colorText[role.color] || "text-emerald-600"} flex-shrink-0`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* زرار الانتقال حسب الدور */}
      <Link
        href={targetHref}
        className={`block w-full px-6 py-3 bg-gradient-to-r ${colorBtnFrom[role.color] || "from-emerald-600"} ${colorBtnTo[role.color] || "to-emerald-700"} text-white rounded-lg hover:shadow-lg transition-all duration-300 text-center hover:scale-[1.03] active:scale-95`}
      >
        {t("common.getStarted")}
      </Link>
    </div>
  );
}