"use client";

import React from "react";
import { WasteCategory } from "./types";
import { Recycle } from "lucide-react";

interface WasteCategoryCardProps {
  category: WasteCategory;
  index: number;
}

export const getImageUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://smartwaste.runasp.net${path}`;
};

export function WasteCategoryCard({ category, index }: WasteCategoryCardProps) {
  const Icon = category.icon || Recycle;
  const imageUrl = getImageUrl(category.imagePath);

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={index * 100}
      className="group bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg cursor-pointer border border-slate-100 hover:border-emerald-500 transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_25px_50px_rgba(16,185,129,0.2)] flex flex-col justify-between overflow-hidden relative"
    >
      <div>
        {category.imagePath ? (
          <div className="w-full h-44 rounded-xl overflow-hidden mb-4 relative shadow-sm border border-slate-100/60">
            <img
              src={imageUrl}
              alt={category.categoryName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-xs font-semibold transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <span>Smart Waste System</span>
              <Recycle className="w-3.5 h-3.5 animate-spin-slow" />
            </div>
          </div>
        ) : (
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
            <Icon className="w-7 h-7 text-emerald-600" />
          </div>
        )}

        <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">
          {category.categoryName}
        </h3>
        
        {category.description && (
          <p className="text-gray-500 mb-4 text-sm leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {/* Points indicator */}
      <div className="mt-auto pt-4 border-t border-slate-50 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium">Reward Rate</span>
          <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs animate-pulse">
            {category.pointsPerUnit} pts
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="progress-bar-fill h-full bg-gradient-to-r from-emerald-500 to-teal-500 relative overflow-hidden"
            style={{
              width: `${Math.min((category.pointsPerUnit / 50) * 100, 100)}%`,
              boxShadow: "0 0 10px rgba(16,185,129,0.5)",
            }}
          >
            <div className="absolute inset-0 bg-white/30 animate-shimmer-sweep" />
          </div>
        </div>
      </div>
    </div>
  );
}
