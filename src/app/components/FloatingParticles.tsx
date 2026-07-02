"use client";

import React, { useMemo, useState } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function FloatingParticles() {
  const [ready, setReady] = useState(false);

  // 1. الطبقة الثابتة الهادئة (لا تتأثر بالماوس - ألوان فاتحة وخفيفة)
  const staticOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      particles: {
        number: { value: 80 },
        color: { value: ["#38bdf8", "#4ade80", "#fef08a"] },
        paint: {
          fill: {
            enable: true,
            color: { value: ["#38bdf8", "#4ade80", "#fef08a"] },
          },
        },
        size: { value: { min: 1, max: 4 } },
        opacity: { value: 0.22 },
        move: {
          enable: true,
          speed: 0.35,
          random: true,
          outModes: { default: "bounce" as const },
        },
        shape: { type: ["circle", "triangle"] },
      },
      detectRetina: true,
    }),
    [],
  );

  // 2. الطبقة المتوسطة (تتأثر بالماوس - ألوان أغمق)
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
        number: { value: 90 },
        color: { value: ["#0284c7", "#16a34a"] },
        paint: {
          fill: {
            enable: true,
            color: { value: ["#0284c7", "#16a34a"] },
          },
        },
        size: { value: { min: 2, max: 5 } },
        opacity: { value: 0.55 },
        move: {
          enable: true,
          speed: 0.6,
          random: true,
          outModes: { default: "bounce" as const },
        },
        shape: { type: ["circle", "triangle"] },
      },
      detectRetina: true,
    }),
    [],
  );

  // 3. طبقة المقدمة التفاعلية (تتأثر بالماوس - ألوان داكنة وقوية)
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
        number: { value: 90 },
        color: { value: ["#15803d", "#d97706", "#b91c1c"] },
        paint: {
          fill: {
            enable: true,
            color: { value: ["#15803d", "#d97706", "#b91c1c"] },
          },
        },
        size: { value: { min: 3, max: 10 } },
        opacity: { value: { min: 0.75, max: 0.95 } },
        move: {
          enable: true,
          speed: 1.2,
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
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-30">
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
