"use client";

import React from "react";
import { ImpactStatT } from "./types";

interface ImpactStatCardProps {
  stat: ImpactStatT;
  index: number;
}

export function ImpactStatCard({ stat, index }: ImpactStatCardProps) {
  const Icon = stat.icon;
  return (
    <div
      data-aos="fade-up"
      data-aos-delay={index * 100}
      className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center cursor-pointer border border-white/20 transition-all duration-300 hover:-translate-y-2.5 hover:scale-105 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
    >
      <div className="transition-transform duration-300 group-hover:-translate-y-3 group-hover:scale-110">
        <Icon className="w-12 h-12 mx-auto mb-4" />
      </div>
      <div className="text-3xl font-bold mb-1">{stat.value}</div>
      <div className="text-sm text-green-100 mb-1">{stat.label}</div>
      <div className="text-xs text-green-200">{stat.subtitle}</div>
    </div>
  );
}
