"use client";

import React, { useRef } from "react";
import { Stat, colorBg, colorText } from "./types";
import { AnimatedCounter } from "./AnimatedCounter";
import { useIntersection } from "./useIntersection";

interface StatCardProps {
  stat: Stat;
  index: number;
}

export function StatCard({ stat, index }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersection(ref);
  const Icon = stat.icon;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 100}ms` }}
      className={`bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg transition-all duration-700 ease-out cursor-pointer border border-transparent hover:border-emerald-200 hover:-translate-y-2 hover:shadow-xl transform ${
        isIntersecting
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-12 scale-95"
      }`}
    >
      <div
        className={`w-12 h-12 ${
          colorBg[stat.color] || "bg-emerald-100"
        } rounded-lg flex items-center justify-center mb-4 transition-transform duration-500 ease-out hover:scale-110`}
      >
        <Icon className={`w-6 h-6 ${colorText[stat.color] || "text-emerald-600"}`} />
      </div>

      <div className={`text-3xl font-bold ${colorText[stat.color] || "text-emerald-600"} mb-1`}>
        <AnimatedCounter end={stat.value} suffix={stat.suffix} />
      </div>

      <div className="text-sm text-gray-600">{stat.label}</div>
    </div>
  );
}
