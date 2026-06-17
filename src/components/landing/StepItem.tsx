"use client";

import React from "react";
import { StepT } from "./types";
import { Reveal } from "../Reveal";

interface StepItemProps {
  step: StepT;
  index: number;
}

export function StepItem({ step, index }: StepItemProps) {
  const Icon = step.icon;
  return (
    <Reveal variant="scale-sm" delay={index * 0.2} repeat className="text-center">
      <div className="group w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-emerald-500 relative z-10 cursor-pointer transition-all duration-500 hover:scale-110 hover:rotate-[360deg] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]">
        <Icon className="w-10 h-10 text-emerald-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
      <p className="text-sm text-gray-600">{step.description}</p>
    </Reveal>
  );
}
