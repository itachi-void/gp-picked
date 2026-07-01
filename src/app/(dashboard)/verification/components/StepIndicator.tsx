"use client";

import { Camera, Cpu, CheckCircle } from "lucide-react";
import { Step } from "../types";

interface StepIndicatorProps {
  step: Step;
}

export function StepIndicator({ step }: StepIndicatorProps) {
  const steps = [
    { id: "capture" as const, label: "Photograph", icon: Camera },
    { id: "analyze" as const, label: "AI Scan", icon: Cpu },
    { id: "result" as const, label: "Result Decision", icon: CheckCircle },
  ];
  const order: Step[] = ["capture", "analyze", "result"];
  const idx = order.indexOf(step);

  return (
    <div className="flex items-center justify-center max-w-lg mx-auto">
      {steps.map((s, i) => {
        const done = i < idx;
        const current = i === idx;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                current ? "bg-emerald-600 text-white" : done ? "bg-emerald-500/20 text-emerald-600" : "bg-slate-200 dark:bg-white/10 text-slate-400"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-semibold ${current ? "text-emerald-600" : "text-slate-400"}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 mb-4 ${i < idx ? "bg-emerald-400" : "bg-slate-200 dark:bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
