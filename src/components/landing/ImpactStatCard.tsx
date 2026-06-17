"use client";

import React, { useRef } from "react";
import { ImpactStatT } from "./types";
import { useIntersection } from "./useIntersection";

interface ImpactStatCardProps {
  stat: ImpactStatT;
  index: number;
}

export function ImpactStatCard({ stat, index }: ImpactStatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersection(ref);
  const Icon = stat.icon;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 100}ms` }}
      className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center cursor-pointer border border-white/20 impact-card-transition transform ${
        isIntersecting
          ? "opacity-100 translate-y-0 impact-card-active"
          : "opacity-0 translate-y-12 pointer-events-none"
      }`}
    >
      <div className="impact-card-icon">
        <Icon className="w-12 h-12 mx-auto mb-4" />
      </div>
      <div className="text-3xl font-bold mb-1">{stat.value}</div>
      <div className="text-sm text-green-100 mb-1">{stat.label}</div>
      <div className="text-xs text-green-200">{stat.subtitle}</div>
    </div>
  );
}
