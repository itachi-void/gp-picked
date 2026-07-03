"use client";
import { useState, useEffect, useRef } from "react";
import "@/app/components/motion/motion-components.css";

const BW          = 190;
const BH          = 52;
const DW          = 22;
const DH          = 34;
const DOOR_MARGIN = 14;
const DX          = BW - DW - DOOR_MARGIN;
const CS          = 20;
const CE          = DX + 6;
const FALL_L      = DX + DW / 2 - 7;
const FALL_T      = Math.round((BH - 22) / 2);

const T = {
  dark: {
    bg:         "linear-gradient(148deg,#1c1c2e 0%,#242438 100%)",
    border:     "rgba(255,255,255,0.08)",
    text:       "rgba(255,255,255,0.92)",
    char:       "rgba(255,255,255,0.90)",
    doorFill:   "rgba(90,80,155,0.60)",
    doorBorder: "rgba(255,255,255,0.18)",
    doorHover:  "#9b7ef8",
    glow:       "rgba(155,126,248,0.30)",
    shadow:     "rgba(0,0,0,0.32)",
  },
  light: {
    bg:         "linear-gradient(148deg,#f5f5fd 0%,#eeeef8 100%)",
    border:     "rgba(0,0,0,0.07)",
    text:       "rgba(18,18,42,0.90)",
    char:       "rgba(22,22,52,0.82)",
    doorFill:   "rgba(140,125,215,0.35)",
    doorBorder: "rgba(0,0,0,0.16)",
    doorHover:  "#7c5ce8",
    glow:       "rgba(124,92,232,0.20)",
    shadow:     "rgba(0,0,0,0.12)",
  },
} as const;

type Phase = "idle" | "clicking" | "falling" | "closing";

function FallingChar({ color, flailing }: { color: string; flailing: boolean }) {
  return (
    <svg
      width={14}
      height={22}
      viewBox="0 0 14 22"
      fill="none"
      className={flailing ? "char-flailing" : ""}
    >
      <circle cx={7} cy={3.5} r={2.6} fill={color} />
      <circle cx={7} cy={4.3} r={1.0} fill="rgba(0,0,0,0.30)" />
      <line x1={7} y1={6.1} x2={7} y2={12.5} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <g
        className="fall-arm-l"
        style={{ transform: flailing ? undefined : "rotate(-45deg)" }}
      >
        <line x1={7} y1={8.5} x2={2} y2={4} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      </g>
      <g
        className="fall-arm-r"
        style={{ transform: flailing ? undefined : "rotate(45deg)" }}
      >
        <line x1={7} y1={8.5} x2={12} y2={4} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      </g>
      <g
        className="fall-leg-l"
        style={{ transform: flailing ? undefined : "rotate(22deg)" }}
      >
        <line x1={7} y1={12.5} x2={3.5} y2={19} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      </g>
      <g
        className="fall-leg-r"
        style={{ transform: flailing ? undefined : "rotate(-22deg)" }}
      >
        <line x1={7} y1={12.5} x2={10.5} y2={19} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default function PremiumAuthButton({
  theme   = "dark",
  variant = "logout",
  label,
  accent,
  flashColor,
  onLogout,
  onLogin,
  onSignup,
  onClick,
}: {
  theme?:      "dark" | "light";
  variant?:    "login" | "logout" | "signup";
  label?:      string;
  accent?:     string;
  flashColor?: string;
  onLogout?:   () => void;
  onLogin?:    () => void;
  onSignup?:   () => void;
  onClick?:    () => void;
}) {
  const base = T[theme];
  const c = accent
    ? {
        ...base,
        doorFill:   `color-mix(in srgb, ${accent} 55%, ${base.doorFill})`,
        doorBorder: `color-mix(in srgb, ${accent} 45%, ${base.doorBorder})`,
        doorHover:  accent,
        glow:       `color-mix(in srgb, ${accent} 60%, transparent)`,
      }
    : base;

  const isEntering = variant === "login" || variant === "signup";
  const isLogin    = isEntering;
  const defaultFlash = variant === "signup" ? "rgba(251,191,36,0.22)" : "rgba(74,222,128,0.18)";
  const flash = flashColor ?? defaultFlash;
  const finalLabel = label ?? (variant === "login" ? "Log In" : variant === "signup" ? "Sign Up" : "Log Out");

  const [phase,          setPhase]          = useState<Phase>("idle");
  const [isHovered,      setIsHovered]      = useState(false);
  const [doorIsOpen,     setDoorIsOpen]     = useState(false);
  const [charFlailing,   setCharFlailing]   = useState(false);
  const [loginSuccess,   setLoginSuccess]   = useState(false);
  const [isCharRunning,  setIsCharRunning]  = useState(false);
  const [charX,          setCharX]          = useState(CS);
  const [charAlpha,      setCharAlpha]      = useState(1);
  const [fallingY,       setFallingY]       = useState(0);
  const [fallingAlpha,   setFallingAlpha]   = useState(0);
  const [btnScale,       setBtnScale]       = useState(1);
  const timers = useRef<number[]>([]);

  const clearT = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const sched  = (pairs: [() => void, number][]) =>
    pairs.forEach(([fn, d]) => timers.current.push(window.setTimeout(fn, d)));

  const resetAll = () => {
    setCharX(CS); setCharAlpha(1);
    setDoorIsOpen(false); setIsCharRunning(false);
    setCharFlailing(false); setLoginSuccess(false);
    setFallingY(0); setFallingAlpha(0);
  };

  const onHoverStart = () => {
    if (isLocked) return;
    setIsHovered(true); setBtnScale(1.03);
    setCharX(CS + 10);
  };

  const onHoverEnd = () => {
    if (isLocked) return;
    setIsHovered(false); setBtnScale(1);
    setCharX(CS);
  };

  const handleLogoutClick = () => {
    clearT(); resetAll(); setIsHovered(false);
    setPhase("clicking"); setBtnScale(0.96);

    sched([
      [() => { setBtnScale(1); setIsCharRunning(true); setCharX(CE); setDoorIsOpen(true); }, 75],
      [() => { setIsCharRunning(false); setCharAlpha(0); setFallingAlpha(1); setPhase("falling"); }, 430],
      [() => { setCharFlailing(true); setFallingY(100); }, 570],
      [() => setFallingAlpha(0), 1100],
      [() => { setPhase("closing"); setDoorIsOpen(false); }, 1380],
      [() => { setBtnScale(1.06); onLogout?.(); }, 1640],
      [() => setBtnScale(1), 1840],
      [() => { resetAll(); setPhase("idle"); }, 2600],
    ]);
  };

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearT();
    };
  }, []);

  const handleLoginClick = async () => {
    clearT(); resetAll(); setIsHovered(false); setLoginSuccess(false);
    setPhase("clicking"); setBtnScale(0.96);

    const sleep = (ms: number) => new Promise((resolve) => {
      const t = window.setTimeout(resolve, ms);
      timers.current.push(t);
    });

    await sleep(75);
    if (!isMounted.current) return;
    setBtnScale(1);
    setIsCharRunning(true);
    setCharX(CE);
    setDoorIsOpen(true);

    await sleep(430 - 75);
    if (!isMounted.current) return;
    setIsCharRunning(false);
    setCharAlpha(0);

    await sleep(620 - 430);
    if (!isMounted.current) return;
    setDoorIsOpen(false);
    setPhase("closing");

    await sleep(880 - 620);
    if (!isMounted.current) return;

    try {
      if (variant === "signup") {
        if (onSignup) await onSignup();
      } else {
        if (onLogin) await onLogin();
      }
      if (onClick) await onClick();

      if (!isMounted.current) return;
      setLoginSuccess(true);
      setBtnScale(1.06);

      await sleep(200);
      if (!isMounted.current) return;
      setBtnScale(1);
    } catch (err) {
      console.error("Auth action failed:", err);
      if (!isMounted.current) return;
      setLoginSuccess(false);
      setBtnScale(1);
      resetAll();
      setPhase("idle");
    }
  };

  const handleClick = () => {
    if (isLocked) return;
    if (isLogin) handleLoginClick(); else handleLogoutClick();
  };

  const isLocked = ["clicking", "falling", "closing"].includes(phase);

  return (
    <button
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      type="button"
      onClick={handleClick}
      style={{
        width: BW, height: BH,
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 14,
        border: `1px solid ${c.border}`,
        background: c.bg,
        cursor: isLocked ? "default" : "pointer",
        overflow: "visible",
        userSelect: "none",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        flexShrink: 0,
        transform: `scale(${btnScale})`,
        boxShadow: isHovered
          ? `0 18px 44px ${c.shadow}, 0 0 26px ${c.glow}`
          : `0 6px 20px ${c.shadow}`,
        transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease",
      }}
      className={phase === "idle" ? "mc-float" : ""}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "44%",
        borderRadius: "14px 14px 0 0",
        background: "linear-gradient(180deg,rgba(255,255,255,0.07) 0%,transparent 100%)",
        pointerEvents: "none",
      }} />

      <div
        style={{
          position: "absolute", inset: 0, borderRadius: 14,
          background: `radial-gradient(ellipse at 60% 50%, ${flash} 0%, transparent 70%)`,
          pointerEvents: "none", zIndex: 10,
          opacity: loginSuccess ? 1 : 0,
          transition: `opacity ${loginSuccess ? "0.15s" : "0.5s"} ease`,
        }}
      />

      <span
        style={{
          color: c.text, fontSize: 14, fontWeight: 600,
          letterSpacing: "0.015em", userSelect: "none",
          pointerEvents: "none", zIndex: 1,
          opacity: doorIsOpen ? 0.38 : 1,
          transform: doorIsOpen ? "translateX(-4px)" : "translateX(0)",
          transition: "opacity 0.25s, transform 0.25s",
        }}
      >
        {finalLabel}
      </span>

      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0,
        display: "flex", alignItems: "center",
        pointerEvents: "none", zIndex: 2,
      }}>
        <div style={{
          transform: `translateX(${charX}px)`,
          opacity: charAlpha,
          transition: "transform 0.30s cubic-bezier(0.22,0,0.6,1), opacity 0.10s",
        }}>
          <div style={{
            transform: isCharRunning ? "rotate(10deg) scaleX(1)" : "rotate(0deg) scaleX(1)",
            transition: "transform 0.3s ease",
          }}>
            <svg
              width={14} height={22} viewBox="0 0 14 22" fill="none"
              className={isCharRunning ? "char-sprinting" : ""}
            >
              <ellipse cx={7} cy={3.6} rx={2.8} ry={2.8} fill={c.char} />
              <line x1={7} y1={6.4} x2={7} y2={13.5} stroke={c.char} strokeWidth={1.9} strokeLinecap="round" />
              <g className="prem-arm-l"><line x1={7} y1={9} x2={2.5} y2={12.5} stroke={c.char} strokeWidth={1.4} strokeLinecap="round" /></g>
              <g className="prem-arm-r"><line x1={7} y1={9} x2={11.5} y2={12.5} stroke={c.char} strokeWidth={1.4} strokeLinecap="round" /></g>
              <g className="prem-leg-l"><line x1={7} y1={13.5} x2={4} y2={20.5} stroke={c.char} strokeWidth={1.4} strokeLinecap="round" /></g>
              <g className="prem-leg-r"><line x1={7} y1={13.5} x2={10} y2={20.5} stroke={c.char} strokeWidth={1.4} strokeLinecap="round" /></g>
            </svg>
          </div>
        </div>
      </div>

      {!isLogin && (
        <div style={{
          position: "absolute", left: FALL_L, top: FALL_T,
          transform: `translateY(${fallingY}px)`,
          opacity: fallingAlpha,
          pointerEvents: "none", zIndex: 4,
          transition: fallingY > 0 ? "transform 0.82s cubic-bezier(0.22,0,1,0.88), opacity 0.30s" : "opacity 0.08s",
        }}>
          <FallingChar color={c.char} flailing={charFlailing} />
        </div>
      )}

      <div style={{
        position: "absolute", right: DOOR_MARGIN, top: "50%",
        transform: "translateY(-50%)",
        width: DW, height: DH, zIndex: 3,
      }}>
        <div style={{ position: "absolute", inset: "2px", borderRadius: 2 }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: 2,
            background: "linear-gradient(180deg,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0.95) 100%)",
            opacity: doorIsOpen ? 1 : 0,
            transition: "opacity 0.22s",
          }} />
        </div>
        <div style={{ perspective: 68, position: "absolute", inset: "2px", zIndex: 3 }}>
          <div style={{
            position: "absolute", inset: 0,
            background: c.doorFill, borderRadius: 2,
            transformOrigin: "left center",
            transform: doorIsOpen ? "rotateY(-86deg)" : "rotateY(0deg)",
            transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
          }} />
        </div>
        <div style={{
          position: "absolute", inset: 0, borderRadius: 3,
          border: `1.5px solid ${isHovered ? c.doorHover : c.doorBorder}`,
          pointerEvents: "none", zIndex: 4,
          transition: "border-color 0.35s",
        }} />
        <div style={{
          position: "absolute", right: 3, top: "50%",
          width: 3, height: 3, borderRadius: "50%",
          background: c.doorBorder, transform: `translateY(-50%) translateX(${doorIsOpen ? -7 : 0}px)`,
          opacity: doorIsOpen ? 0.12 : 1, zIndex: 5,
          transition: "transform 0.3s ease, opacity 0.3s ease",
        }} />
        <div style={{
          position: "absolute", inset: -6, borderRadius: 8, pointerEvents: "none",
          background: `radial-gradient(ellipse at center,${c.glow} 0%,transparent 68%)`,
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "scale(1)" : "scale(0.7)",
          transition: "opacity 0.45s, transform 0.45s",
        }} />
      </div>
    </button>
  );
}
