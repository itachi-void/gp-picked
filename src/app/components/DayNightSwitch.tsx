"use client";

import { Sun, Moon } from "lucide-react";

export default function DayNightSwitch({
  mode,
  onChange,
  position = { top: 24, right: 100 },
}: {
  mode: "day" | "night";
  onChange: (m: "day" | "night") => void;
  position?: { top?: number; right?: number; bottom?: number; left?: number };
}) {
  const isDay = mode === "day";
  return (
    <button
      onClick={() => onChange(isDay ? "night" : "day")}
      title={isDay ? "Switch to night" : "Switch to day"}
      style={{
        position: "fixed",
        ...position,
        zIndex: 100,
        width: 52,
        height: 52,
        borderRadius: "50%",
        border: `1px solid ${isDay ? "rgba(255,200,80,0.4)" : "rgba(180,200,230,0.3)"}`,
        background: isDay
          ? "linear-gradient(135deg, #fff7d6 0%, #ffd97a 100%)"
          : "linear-gradient(135deg, #1a2236 0%, #0a0f1c 100%)",
        color: isDay ? "#7a4a00" : "#cfd8ea",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: isDay
          ? "0 4px 16px rgba(255,200,80,0.35)"
          : "0 4px 16px rgba(0,0,0,0.5)",
        transition: "all 0.4s ease",
      }}
    >
      {isDay ? <Sun size={22} /> : <Moon size={20} />}
    </button>
  );
}
