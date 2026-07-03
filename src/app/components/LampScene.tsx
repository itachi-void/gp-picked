"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type LampSceneProps = {
  warm?: string;
  beamIntensity?: number;
  beamWidth?: number;
  ambientGlow?: number;
  shadowStrength?: number;
  background?: string;
  contentPosition?: "right" | "center" | "left";
  showDust?: boolean;
  startOn?: boolean;
  lampStyle?: "warm-brass" | "cool-steel" | "modern-black";
  lampLeft?: string;
  lampBottom?: string;
  lampScale?: number;
  dayMode?: boolean;
  children?: ReactNode;
};

type LampContextValue = {
  intensity: number;
  warm: string;
  on: boolean;
  masterOn: boolean;
  cordOn: boolean;
  toggle: () => void;
  toggleMaster: () => void;
  toggleCord: () => void;
};

const LampCtx = createContext<LampContextValue>({
  intensity: 0,
  warm: "255, 198, 120",
  on: true,
  masterOn: true,
  cordOn: true,
  toggle: () => {},
  toggleMaster: () => {},
  toggleCord: () => {},
});

export const useLamp = () => useContext(LampCtx);

export default function LampScene({
  warm = "255, 198, 120",
  beamIntensity = 1,
  beamWidth = 1,
  ambientGlow = 1,
  shadowStrength = 1,
  background,
  contentPosition = "right",
  showDust = true,
  startOn = true,
  lampStyle = "warm-brass",
  lampLeft = "10%",
  lampBottom = "18%",
  lampScale = 1,
  dayMode = false,
  children,
}: LampSceneProps) {
  const [masterOn, setMasterOn] = useState(startOn);
  const [cordOn, setCordOn] = useState(startOn);
  const on = masterOn && cordOn;
  const [intensity, setIntensity] = useState(0);
  const onRef = useRef(on);
  const rafRef = useRef(0);

  useEffect(() => {
    onRef.current = on;
  }, [on]);

  useEffect(() => {
    let switchedAt = performance.now();
    let lastOn = onRef.current;
    const tick = (t: number) => {
      if (onRef.current !== lastOn) {
        switchedAt = t;
        lastOn = onRef.current;
      }
      const since = (t - switchedAt) / 1000;
      let base: number;
      if (onRef.current) {
        const ramp = Math.min(1, since / 1.2);
        const flicker =
          since < 0.8
            ? (Math.sin(since * 40) * 0.18 + Math.sin(since * 73) * 0.1) *
              (1 - since / 0.8)
            : 0;
        const breathe = since > 1.2 ? Math.sin((since - 1.2) * 1.4) * 0.025 : 0;
        base = Math.max(0, Math.min(1.05, ramp + flicker + breathe));
      } else {
        base = Math.max(0, 1 - since / 0.35);
      }
      setIntensity(base);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const I = intensity * beamIntensity;
  const W = beamWidth;
  const A = ambientGlow;
  const S = shadowStrength;

  const contentJustify =
    contentPosition === "center"
      ? "center"
      : contentPosition === "left"
        ? "flex-start"
        : "flex-end";

  return (
    <LampCtx.Provider
      value={{
        intensity: I,
        warm,
        on,
        masterOn,
        cordOn,
        toggle: () => setMasterOn((m) => !m),
        toggleMaster: () => setMasterOn((m) => !m),
        toggleCord: () => setCordOn((c) => !c),
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: "100vh",
          overflow: "hidden",
          background:
            background ??
            "radial-gradient(ellipse at 50% 60%, #0c0e14 0%, #06070b 60%, #030305 100%)",
          fontFamily: "'Inter', system-ui, sans-serif",
          userSelect: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "42%",
            background:
              "linear-gradient(180deg, rgba(20,18,22,0) 0%, rgba(14,12,14,0.6) 35%, rgba(8,6,8,1) 100%)",
            opacity: Math.max(0, S * 0.95),
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(circle ${520 * W}px at
              calc(${lampLeft} + ${110 * lampScale}px)
              calc(100% - ${lampBottom} - ${222 * lampScale}px),
              rgba(${warm}, ${0.45 * I}) 0%,
              rgba(${warm}, ${0.22 * I}) 22%,
              rgba(${warm}, ${0.08 * I}) 45%,
              rgba(${warm}, 0) 72%)`,
            filter: "blur(12px)",
            mixBlendMode: "screen",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "10%",
            right: "10%",
            bottom: 0,
            height: "30%",
            pointerEvents: "none",
            background: `radial-gradient(ellipse 60% 100% at 50% 100%,
              rgba(${warm}, ${0.12 * I * A}) 0%,
              rgba(${warm}, 0) 70%)`,
            mixBlendMode: "screen",
          }}
        />

        {showDust && <DustMotes intensity={I} warm={warm} />}

        {dayMode && I > 0.08 && (
          <DayAccents
            intensity={I}
            warm={warm}
            lampLeft={lampLeft}
            lampBottom={lampBottom}
            lampScale={lampScale}
          />
        )}

        {children && createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: contentJustify,
              padding:
                contentPosition === "center"
                  ? "clamp(16px, 4vw, 48px)"
                  : "clamp(16px, 4vw, 48px) clamp(24px, 8vw, 120px)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div style={{ pointerEvents: "auto", maxWidth: "min(520px, 92vw)" }}>
              {children}
            </div>
          </div>,
          document.body
        )}

        <LampBody
          intensity={I}
          warm={warm}
          lampStyle={lampStyle}
          left={lampLeft}
          bottom={lampBottom}
          scale={lampScale}
          zIndex={20}
          onToggle={() => setCordOn((c) => !c)}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: dayMode
              ? `radial-gradient(ellipse at center, transparent 42%, rgba(160,105,25,${0.13 * S}) 68%, rgba(100,60,8,${0.30 * S}) 100%)`
              : `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,${0.55 * S}) 100%)`,
          }}
        />
      </div>
    </LampCtx.Provider>
  );
}

function LampBody({
  intensity,
  warm,
  lampStyle,
  left,
  bottom,
  scale,
  zIndex,
  onToggle,
}: {
  intensity: number;
  warm: string;
  lampStyle: "warm-brass" | "cool-steel" | "modern-black";
  left: string;
  bottom: string;
  scale: number;
  zIndex?: number;
  onToggle: () => void;
}) {
  const I = intensity;

  const palette = {
    "warm-brass": {
      shadeDark: "#2a2018",
      shadeMid: "#3a2a1c",
      stand: "linear-gradient(90deg, #15110d, #2a2018 50%, #15110d)",
      base: "radial-gradient(ellipse at 50% 30%, #3a2e22 0%, #1c1611 60%, #0a0806 100%)",
    },
    "cool-steel": {
      shadeDark: "#1a2028",
      shadeMid: "#2a3340",
      stand: "linear-gradient(90deg, #0e1218, #232b35 50%, #0e1218)",
      base: "radial-gradient(ellipse at 50% 30%, #2a3340 0%, #131820 60%, #06090d 100%)",
    },
    "modern-black": {
      shadeDark: "#0e0e10",
      shadeMid: "#1a1a1d",
      stand: "linear-gradient(90deg, #050507, #181820 50%, #050507)",
      base: "radial-gradient(ellipse at 50% 30%, #25252a 0%, #0e0e12 60%, #030305 100%)",
    },
  }[lampStyle];

  return (
    <div
      style={{
        position: "absolute",
        left,
        bottom,
        width: 220,
        height: 340,
        pointerEvents: "none",
        transform: `scale(${scale})`,
        transformOrigin: "left bottom",
        zIndex,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -120,
          top: -80,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${warm}, ${0.55 * I}) 0%, rgba(${warm}, ${0.18 * I}) 30%, rgba(${warm}, 0) 70%)`,
          filter: "blur(20px)",
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 30,
          top: 10,
          width: 160,
          height: 110,
          clipPath: "polygon(18% 0, 82% 0, 100% 100%, 0 100%)",
          background: `linear-gradient(180deg,
            ${palette.shadeDark} 0%,
            ${palette.shadeMid} 30%,
            rgba(${warm}, ${0.5 + 0.35 * I}) 80%,
            rgba(${warm}, ${0.7 + 0.3 * I}) 100%)`,
          boxShadow: `inset 0 -10px 30px rgba(${warm}, ${0.6 * I})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 110,
          width: 160,
          height: 14,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, rgba(${warm}, ${0.95 * I}) 0%, rgba(${warm}, ${0.4 * I}) 50%, rgba(${warm}, 0) 100%)`,
          filter: "blur(2px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 108,
          width: 28,
          height: 18,
          borderRadius: "50%",
          background: `rgba(${warm}, ${0.95 * I})`,
          boxShadow: `0 0 30px 8px rgba(${warm}, ${0.8 * I})`,
          filter: "blur(1px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 106,
          top: 120,
          width: 8,
          height: 180,
          background: palette.stand,
          borderRadius: 4,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 120,
          width: 4,
          height: 180,
          background: `rgba(${warm}, ${0.35 * I})`,
          mixBlendMode: "screen",
          borderRadius: 2,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 70,
          top: 295,
          width: 80,
          height: 20,
          borderRadius: "50%",
          background: palette.base,
          boxShadow:
            "0 8px 22px rgba(0,0,0,0.7), inset 0 -3px 6px rgba(0,0,0,0.6)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 76,
          top: 295,
          width: 68,
          height: 4,
          borderRadius: "50%",
          background: `rgba(${warm}, ${0.5 * I})`,
          mixBlendMode: "screen",
          filter: "blur(1px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 312,
          width: 120,
          height: 12,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(2px)",
        }}
      />

      <PullCord onToggle={onToggle} warm={warm} intensity={I} lampLeft={left} lampBottom={bottom} scale={scale} />
    </div>
  );
}

function PullCord({
  onToggle,
  warm,
  intensity,
  lampLeft,
  lampBottom,
  scale,
}: {
  onToggle: () => void;
  warm: string;
  intensity: number;
  lampLeft: string;
  lampBottom: string;
  scale: number;
}) {
  const BASE = 72;
  const FREE = 140;
  const SOFT = 260;
  const MAX  = 320;
  const TRIGGER = 60;
  const BALL_R  = 10;
  const HIT_R   = 26;

  const [, setTick] = useState(0);
  const rerender = () => setTick((n) => (n + 1) & 0xffff);

  const stretchRef   = useRef(0);
  const velRef       = useRef(0);
  const swayRef      = useRef(0);
  const swayVelRef   = useRef(0);
  const draggingRef  = useRef(false);
  const startYRef    = useRef(0);
  const peakRef      = useRef(0);
  const rafRef       = useRef(0);
  const lastTRef     = useRef(0);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const runSpring = () => {
    cancelAnimationFrame(rafRef.current);
    lastTRef.current = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(2.5, (t - lastTRef.current) / 16.67);
      lastTRef.current = t;

      velRef.current += -stretchRef.current * 0.065 * dt;
      velRef.current *= Math.pow(0.97, dt);
      let s = stretchRef.current + velRef.current * dt;
      if (s < 0) {
        s = 0;
        velRef.current *= -0.55;
      }
      stretchRef.current = s;

      swayVelRef.current += -swayRef.current * 0.12 * dt;
      swayVelRef.current *= Math.pow(0.95, dt);
      swayRef.current += swayVelRef.current * dt;

      rerender();

      const settled =
        Math.abs(velRef.current)     < 0.05 &&
        stretchRef.current           < 0.25 &&
        Math.abs(swayVelRef.current) < 0.05 &&
        Math.abs(swayRef.current)    < 0.25;

      if (!settled) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        stretchRef.current = 0;
        velRef.current     = 0;
        swayRef.current    = 0;
        swayVelRef.current = 0;
        rerender();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    cancelAnimationFrame(rafRef.current);
    draggingRef.current = true;
    startYRef.current   = e.clientY;
    peakRef.current     = stretchRef.current;
    velRef.current      = 0;
    swayVelRef.current  = 0;
    swayRef.current     = 0;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const raw = Math.max(0, (e.clientY - startYRef.current) / scale);
    let s: number;
    if (raw <= FREE) {
      s = raw;
    } else {
      const extra = raw - FREE;
      const room  = MAX - FREE;
      s = FREE + room * Math.tanh(extra / SOFT);
    }
    stretchRef.current = s;
    if (s > peakRef.current) peakRef.current = s;
    rerender();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
    const triggered = peakRef.current >= TRIGGER;
    const sign = (peakRef.current | 0) % 2 === 0 ? 1 : -1;
    swayVelRef.current = sign * Math.min(18, stretchRef.current * 0.22);
    velRef.current = 0;
    if (triggered) onToggle();
    runSpring();
  };

  const anchorX = 150;
  const anchorY = 118;
  const cordLen = BASE + stretchRef.current;
  const sway    = swayRef.current;
  const ballX   = anchorX + sway * 0.6;
  const ballY   = anchorY + cordLen;
  const midX    = anchorX + sway;
  const midY    = anchorY + cordLen * 0.55;

  const path = `M ${anchorX} ${anchorY} Q ${midX} ${midY} ${ballX} ${ballY}`;

  const vpW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vpH = typeof window !== "undefined" ? window.innerHeight : 900;
  const parsePx = (s: string) =>
    s.endsWith("%") ? (parseFloat(s) / 100) * vpW : parseFloat(s);
  const parsePxV = (s: string) =>
    s.endsWith("%") ? (parseFloat(s) / 100) * vpH : parseFloat(s);

  const lampLeftPx   = parsePx(lampLeft);
  const lampBottomPx = parsePxV(lampBottom);

  const bvpX = lampLeftPx + ballX * scale;
  const bvpY = vpH - lampBottomPx - (340 - ballY) * scale;

  return (
    <>
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 220,
          height: 400,
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        <path d={path} stroke="rgba(50,38,25,0.95)" strokeWidth={2} fill="none" strokeLinecap="round" />
        <path d={path} stroke={`rgba(${warm}, ${0.6 * intensity})`} strokeWidth={1} fill="none" strokeLinecap="round" style={{ mixBlendMode: "screen" }} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: ballX - BALL_R,
          top:  ballY - BALL_R,
          width:  BALL_R * 2,
          height: BALL_R * 2,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #d4b483 0%, #8a6b3f 50%, #3e2a10 100%)",
          boxShadow: `0 3px 8px rgba(0,0,0,0.7), 0 0 14px rgba(${warm}, ${0.55 * intensity})`,
          pointerEvents: "none",
        }}
      />

      {createPortal(
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            position: "fixed",
            left: bvpX - HIT_R,
            top:  bvpY - HIT_R,
            width:  HIT_R * 2,
            height: HIT_R * 2,
            borderRadius: "50%",
            cursor: "grab",
            pointerEvents: "auto",
            touchAction: "none",
            zIndex: 60,
          }}
        />,
        document.body
      )}
    </>
  );
}

function DustMotes({ intensity, warm }: { intensity: number; warm: string }) {
  const motes = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      x: 22 + Math.random() * 40,
      y: 25 + Math.random() * 50,
      r: 1 + Math.random() * 1.8,
      delay: Math.random() * 6,
      dur: 6 + Math.random() * 6,
      key: i,
    })),
  ).current;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: 0.5 * intensity,
        mixBlendMode: "screen",
      }}
    >
      {motes.map((m) => (
        <div
          key={m.key}
          style={{
            position: "absolute",
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.r,
            height: m.r,
            borderRadius: "50%",
            background: `rgba(${warm}, 0.9)`,
            boxShadow: `0 0 4px rgba(${warm}, 0.7)`,
            animation: `lampMoteDrift ${m.dur}s ease-in-out ${m.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes lampMoteDrift {
          0%, 100% { transform: translate(0, 0); opacity: 0.2; }
          50%      { transform: translate(8px, -14px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function DayAccents({
  intensity,
  warm,
  lampLeft,
  lampBottom,
  lampScale,
}: {
  intensity: number;
  warm: string;
  lampLeft: string;
  lampBottom: string;
  lampScale: number;
}) {
  const pollen = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      x: 5 + Math.random() * 65,
      y: 50 + Math.random() * 40,
      r: 1.5 + Math.random() * 2.2,
      delay: Math.random() * 8,
      dur: 10 + Math.random() * 8,
      drift: 30 + Math.random() * 40,
      key: i,
    })),
  ).current;

  const bulbX = `calc(${lampLeft} + ${110 * lampScale}px)`;
  const bulbY = `calc(100% - ${lampBottom} - ${222 * lampScale}px)`;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: intensity,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: bulbX,
          top: bulbY,
          width: 0,
          height: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -260,
            top: -260,
            width: 520,
            height: 520,
            background: `conic-gradient(from 0deg,
              rgba(${warm}, 0) 0deg,
              rgba(${warm}, ${0.18 * intensity}) 8deg,
              rgba(${warm}, 0) 18deg,
              rgba(${warm}, 0) 40deg,
              rgba(${warm}, ${0.14 * intensity}) 48deg,
              rgba(${warm}, 0) 58deg,
              rgba(${warm}, 0) 90deg,
              rgba(${warm}, ${0.18 * intensity}) 98deg,
              rgba(${warm}, 0) 108deg,
              rgba(${warm}, 0) 150deg,
              rgba(${warm}, ${0.14 * intensity}) 158deg,
              rgba(${warm}, 0) 168deg,
              rgba(${warm}, 0) 210deg,
              rgba(${warm}, ${0.18 * intensity}) 218deg,
              rgba(${warm}, 0) 228deg,
              rgba(${warm}, 0) 270deg,
              rgba(${warm}, ${0.14 * intensity}) 278deg,
              rgba(${warm}, 0) 288deg,
              rgba(${warm}, 0) 330deg,
              rgba(${warm}, ${0.18 * intensity}) 338deg,
              rgba(${warm}, 0) 348deg,
              rgba(${warm}, 0) 360deg)`,
            borderRadius: "50%",
            filter: "blur(2px)",
            mixBlendMode: "screen",
            animation: "lampSunRays 40s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -50,
            top: -50,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${warm}, ${0.6 * intensity}) 0%, rgba(${warm}, 0) 70%)`,
            filter: "blur(4px)",
            mixBlendMode: "screen",
            animation: "lampFlarePulse 4s ease-in-out infinite",
          }}
        />
      </div>

      {pollen.map((p) => (
        <div
          key={p.key}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.r,
            height: p.r,
            borderRadius: "50%",
            background: `rgba(${warm}, 0.95)`,
            boxShadow: `0 0 6px rgba(${warm}, 0.8)`,
            animation: `lampPollen ${p.dur}s ease-in-out ${p.delay}s infinite`,
            ["--drift" as any]: `${p.drift}px`,
          }}
        />
      ))}

      <style>{`
        @keyframes lampSunRays {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes lampFlarePulse {
          0%, 100% { transform: scale(1);   opacity: 0.7; }
          50%      { transform: scale(1.2); opacity: 1; }
        }
        @keyframes lampPollen {
          0%   { transform: translate(0, 0);                       opacity: 0; }
          10%  { opacity: 0.9; }
          50%  { transform: translate(var(--drift, 30px), -80px); opacity: 1; }
          90%  { opacity: 0.5; }
          100% { transform: translate(calc(var(--drift, 30px) * 2), -200px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
