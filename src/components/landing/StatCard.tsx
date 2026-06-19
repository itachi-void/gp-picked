"use client";

import React from "react";
import { Stat, colorBg, colorText } from "./types";
import { AnimatedCounter } from "./AnimatedCounter";

interface StatCardProps {
  stat: Stat;
  index: number;
}

export function StatCard({ stat, index }: StatCardProps) {
  const Icon = stat.icon;
  return (
    <div
      data-aos="zoom-in"
      data-aos-delay={index * 100}
      className="group bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-emerald-200 hover:-translate-y-2.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
    >
      <div className={`w-12 h-12 ${colorBg[stat.color] || "bg-emerald-100"} rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
        <Icon className={`w-6 h-6 ${colorText[stat.color] || "text-emerald-600"}`} />
      </div>

      <div className={`text-3xl font-bold ${colorText[stat.color] || "text-emerald-600"} mb-1`}>
        <AnimatedCounter end={stat.value} suffix={stat.suffix} />
      </div>

      <div className="text-sm text-gray-600">{stat.label}</div>
    </div>
  );
}
