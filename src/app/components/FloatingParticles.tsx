"use client";

import React, { useMemo, useState } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function FloatingParticles() {
  const [ready, setReady] = useState(false);

  // 1. الطبقة الثابتة الهادئة والشفافة (لا تتأثر بالماوس - ألوان مريحة للعين وخفيفة)
  const staticOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      interactivity: {
        events: {
          onHover: { enable: false },
          onClick: { enable: false }
        }
      },
      particles: {
        number: { value: 35 },
        color: { value: ["#a7f3d0", "#bae6fd", "#fef3c7"] }, // ألوان هادئة ومريحة
        paint: {
          fill: {
            enable: true,
            color: { value: ["#a7f3d0", "#bae6fd", "#fef3c7"] },
          },
        },
        size: { value: { min: 1, max: 4 } },
        opacity: { value: 0.22 },
        move: {
          enable: true,
          speed: 0.3,
          random: true,
          outModes: { default: "bounce" as const },
        },
        shape: { type: ["circle", "triangle"] },
      },
      detectRetina: true,
    }),
    [],
  );

  // 2. الطبقة المتوسطة (تتأثر بالماوس - ألوان مريحة وعميقة)
  const bgOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      interactivity: {
        events: { onHover: { enable: true, mode: "repulse" } },
        modes: {
          repulse: { distance: 130, duration: 0.8, speed: 0.2 },
        },
      },
      particles: {
        number: { value: 45 },
        color: { value: ["#0284c7", "#0d9488"] }, // أزرق هادئ وتيل مريح
        paint: {
          fill: {
            enable: true,
            color: { value: ["#0284c7", "#0d9488"] },
          },
        },
        size: { value: { min: 2, max: 5 } },
        opacity: { value: 0.45 },
        move: {
          enable: true,
          speed: 0.5,
          random: true,
          outModes: { default: "bounce" as const },
        },
        shape: { type: ["circle", "triangle"] },
      },
      detectRetina: true,
    }),
    [],
  );

  // 3. طبقة المقدمة التفاعلية (تتأثر بالماوس - ألوان خضراء وذهبية هادئة مريحة للعين)
  const fgOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      interactivity: {
        events: { onHover: { enable: true, mode: ["repulse", "slow"] } },
        modes: {
          repulse: { distance: 160, duration: 1.0, factor: 6, speed: 0.4 },
          slow: { radius: 200, factor: 0.4 },
        },
      },
      particles: {
        number: { value: 45 },
        color: { value: ["#10b981", "#059669", "#d97706"] }, // درجات الأخضر المريح والذهبي الدافئ
        paint: {
          fill: {
            enable: true,
            color: { value: ["#10b981", "#059669", "#d97706"] },
          },
        },
        size: { value: { min: 3, max: 8 } },
        opacity: { value: { min: 0.6, max: 0.85 } },
        move: {
          enable: true,
          speed: 1.0,
          random: true,
          outModes: { default: "bounce" as const },
        },
        shape: { type: ["circle", "square", "star", "triangle"] },
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
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
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
