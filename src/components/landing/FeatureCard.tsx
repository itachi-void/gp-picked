"use client";

import React from "react";
import { FeatureT } from "./types";
import { Reveal } from "../Reveal";
import { useReveal } from "@/app/hooks/useReveal";

interface FeatureCardProps {
  feature: FeatureT;
  index: number;
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = feature.icon;
  const [barRef, barIn] = useReveal<HTMLDivElement>({ once: true });

  return (
    <Reveal variant="up" delay={index * 0.1} repeat>
      <div className="group bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg cursor-pointer border-2 border-transparent transition-all duration-300 hover:-translate-y-4 hover:border-emerald-500 hover:shadow-[0_25px_50px_rgba(16,185,129,0.2)]">
        <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
          <Icon className="w-7 h-7 text-emerald-600" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.name}</h3>
        <p className="text-gray-600 mb-4 text-sm">{feature.description}</p>

        {/* جزء الدقة + البار المتحرك */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Accuracy</span>
            <span className="font-semibold text-emerald-600">{feature.accuracy}%</span>
          </div>
          <div ref={barRef} className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 relative transition-[width] duration-[1500ms] ease-out"
              style={{
                width: barIn ? `${feature.accuracy}%` : "0%",
                boxShadow: "0 0 10px rgba(16,185,129,0.5)",
              }}
            >
              {/* لمعان بيعدي على البار */}
              <div className="absolute inset-0 bg-white/30 animate-shimmer-sweep" />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}