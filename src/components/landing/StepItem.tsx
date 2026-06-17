"use client";

import React, { useRef } from "react";
import { StepT } from "./types";
import { useIntersection } from "./useIntersection";

interface StepItemProps {
  step: StepT;
  index: number;
}

export function StepItem({ step, index }: StepItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersection(ref);
  const Icon = step.icon;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 200}ms` }}
      className={`text-center transition-all duration-700 ease-out transform ${
        isIntersecting
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-12 scale-50"
      }`}
    >
      <div
        className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-emerald-500 relative z-10 cursor-pointer step-circle-transition"
      >
        <Icon className="w-10 h-10 text-emerald-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
      <p className="text-sm text-gray-600">{step.description}</p>
    </div>
  );
}
