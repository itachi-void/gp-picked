"use client";

import React, { useRef } from "react";
import { FeatureT } from "./types";
import { useIntersection } from "./useIntersection";

interface FeatureCardProps {
  feature: FeatureT;
  index: number;
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersection(ref);
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${index * 100}ms`,
      }}
      className={`bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg cursor-pointer border-2 border-transparent feature-card-transition ${
        isIntersecting ? "feature-card-active" : "feature-card-enter"
      }`}
    >
      <div
        className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mb-4 transition-transform duration-500 ease-out hover:scale-115"
      >
        <Icon className="w-7 h-7 text-emerald-600" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {feature.name}
      </h3>
      <p className="text-gray-600 mb-4 text-sm">{feature.description}</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Accuracy</span>
          <span
            style={{
              transitionDelay: `${index * 100 + 300}ms`,
            }}
            className={`font-semibold text-emerald-600 transition-all duration-500 transform ${
              isIntersecting ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          >
            {feature.accuracy}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            style={{
              width: isIntersecting ? `${feature.accuracy}%` : "0%",
              boxShadow: "0 0 10px rgba(16,185,129,0.5)",
              transitionDelay: `${index * 100 + 300}ms`,
            }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 relative transition-all duration-1000 ease-out"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-pass" />
          </div>
        </div>
      </div>
    </div>
  );
}