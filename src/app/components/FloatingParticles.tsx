"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function FloatingParticles() {
  const [init, setInit] = useState(false);

  // Initialize the particles engine once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  // background options
  const bgOptions = useMemo(
    () => ({
      fullScreen: { enable: true, zIndex: 1 },
      background: { color: { value: "transparent" } },
      particles: {
        number: { value: 70 },
        color: { value: ["#0ea5e9", "#22c55e"] },
        size: { value: { min: 1, max: 4 } },
        opacity: { value: 0.35 },
        move: {
          enable: true,
          speed: 0.4,
          random: true,
          outModes: { default: "bounce" as const },
        },
        shape: { type: ["circle", "triangle"] },
      },
      detectRetina: true,
    }),
    [],
  );

  // foreground options
  const fgOptions = useMemo(
    () => ({
      fullScreen: { enable: true, zIndex: 2 },
      background: { color: { value: "transparent" } },
      interactivity: {
        events: { onHover: { enable: true, mode: ["repulse", "slow"] } },
        modes: {
          repulse: { distance: 180, duration: 1.2, factor: 8, speed: 0.5 },
          slow: { radius: 220, factor: 0.4 },
        },
      },
      particles: {
        number: { value: 70 },
        color: { value: ["#22c55e", "#f59e0b", "#ef4444"] },
        size: { value: { min: 3, max: 10 } },
        opacity: { value: { min: 0.7, max: 1 } },
        move: {
          enable: true,
          speed: 1.3,
          random: true,
          outModes: { default: "bounce" as const },
        },
        shape: { type: ["circle", "square", "star", "triangle", "polygon"] },
      },
      detectRetina: true,
    }),
    [],
  );

  if (!init) return null;

  return (
    <>
      <Particles
        id="tsparticles-bg"
        className="pointer-events-none soft-layer"
        options={bgOptions}
      />
      <Particles
        id="tsparticles-fg"
        className="pointer-events-none soft-layer"
        options={fgOptions}
      />
    </>
  );
}
