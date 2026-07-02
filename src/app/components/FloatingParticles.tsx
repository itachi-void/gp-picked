"use client";

import React, { useMemo, useState } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function FloatingParticles() {
  const [ready, setReady] = useState(false);

  // 1. الطبقة الثابتة الهادئة (لا تتأثر بالماوس نهائياً - ألوان فاتحة شفافة مريحة للعين)
  const staticOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      interactivity: {
        events: {
          onHover: { enable: false }, // ملغاة تماماً لمنع الحركة عند مرور الماوس
          onClick: { enable: false }
        }
      },
      particles: {
        number: { value: 45 },
        color: { value: ["#a7f3d0", "#bae6fd", "#ccfbf1"] },
        paint: {
          fill: {
            enable: true,
            color: { value: ["#a7f3d0", "#bae6fd", "#ccfbf1"] },
          },
        },
        size: { value: { min: 1, max: 4 } },
        opacity: { value: 0.18 }, // شفافة وخفيفة جداً
        move: {
          enable: true,
          speed: 0.35, // حركة هادئة وبطيئة للغاية
          random: true,
          outModes: { default: "bounce" as const },
        },
        shape: { type: ["circle", "triangle"] },
      },
      detectRetina: true,
    }),
    [],
  );

  // 2. الطبقة المتوسطة (تتأثر بالماوس - ألوان مريحة للعين)
  const bgOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      interactivity: {
        events: { onHover: { enable: true, mode: "repulse" } },
        modes: {
          repulse: { distance: 150, duration: 0.8, speed: 0.3 },
        },
      },
      particles: {
        number: { value: 35 }, // تقليل العدد لراحة العين
        color: { value: ["#059669", "#0d9488", "#0284c7"] },
        paint: {
          fill: {
            enable: true,
            color: { value: ["#059669", "#0d9488", "#0284c7"] },
          },
        },
        size: { value: { min: 2, max: 5 } },
        opacity: { value: 0.45 },
        move: {
          enable: true,
          speed: 0.55,
          random: true,
          outModes: { default: "bounce" as const },
        },
        shape: { type: ["circle", "triangle"] },
      },
      detectRetina: true,
    }),
    [],
  );

  // 3. طبقة المقدمة التفاعلية (تتأثر بالماوس - ألوان مريحة متناسقة)
  const fgOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      interactivity: {
        events: { onHover: { enable: true, mode: ["repulse", "slow"] } },
        modes: {
          repulse: { distance: 180, duration: 1.2, factor: 8, speed: 0.5 },
          slow: { radius: 220, factor: 0.4 },
        },
      },
      particles: {
        number: { value: 35 }, // تقليل العدد لراحة العين
        color: { value: ["#047857", "#0f766e", "#0369a1"] },
        paint: {
          fill: {
            enable: true,
            color: { value: ["#047857", "#0f766e", "#0369a1"] },
          },
        },
        size: { value: { min: 3, max: 9 } },
        opacity: { value: { min: 0.65, max: 0.85 } },
        move: {
          enable: true,
          speed: 1.0,
          random: true,
          outModes: { default: "bounce" as const },
        },
        shape: { type: ["circle", "square", "star", "triangle", "polygon"] },
      },
      detectRetina: true,
    }),
    [],
  );

  return (
    <ParticlesProvider
      init={async (engine) => {
        await loadSlim(engine);
        setReady(true);
      }}
    >
      {ready && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <Particles
            id="tsparticles-static"
            className="absolute inset-0 w-full h-full pointer-events-none"
            options={staticOptions}
          />
          <Particles
            id="tsparticles-bg"
            className="absolute inset-0 w-full h-full pointer-events-none"
            options={bgOptions}
          />
          <Particles
            id="tsparticles-fg"
            className="absolute inset-0 w-full h-full pointer-events-none"
            options={fgOptions}
          />
        </div>
      )}
    </ParticlesProvider>
  );
}
