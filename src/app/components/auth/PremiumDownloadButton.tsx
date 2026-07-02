"use client";
import { useState, useEffect, useRef } from "react";
import "@/app/components/motion/motion-components.css";

const BW          = 190;
const BH          = 52;
const ICON_D      = 22;
const ICON_MARGIN = 14;
const CS          = 20;
const CE          = BW - ICON_MARGIN - ICON_D - 4;
const RING_R      = 8;
const RING_C      = 2 * Math.PI * RING_R;

const T = {
  dark: {
    bg:         "linear-gradient(148deg,#1c1c2e 0%,#242438 100%)",
    border:     "rgba(255,255,255,0.08)",
    text:       "rgba(255,255,255,0.92)",
    char:       "rgba(255,255,255,0.90)",
    iconBg:     "rgba(34,211,238,0.12)",
    iconBorder: "rgba(34,211,238,0.40)",
    accent:     "#22d3ee",
    success:    "#4ade80",
    glow:       "rgba(34,211,238,0.25)",
    shadow:     "rgba(0,0,0,0.32)",
  },
  light: {
    bg:         "linear-gradient(148deg,#f5f5fd 0%,#eeeef8 100%)",
    border:     "rgba(0,0,0,0.07)",
    text:       "rgba(18,18,42,0.90)",
    char:       "rgba(22,22,52,0.82)",
    iconBg:     "rgba(14,165,233,0.10)",
    iconBorder: "rgba(14,165,233,0.38)",
    accent:     "#0ea5e9",
    success:    "#16a34a",
    glow:       "rgba(14,165,233,0.20)",
    shadow:     "rgba(0,0,0,0.12)",
  },
} as const;

type Phase = "idle" | "loading" | "success";

export default function PremiumDownloadButton({
  theme = "dark",
  onDownload,
}: {
  theme?: "dark" | "light";
  onDownload?: () => void;
}) {
  const c = T[theme];

  const [phase,         setPhase]         = useState<Phase>("idle");
  const [progress,      setProgress]      = useState(0);
  const [isHovered,     setIsHovered]     = useState(false);
  const [isSprinting,   setIsSprinting]   = useState(false);
  const [isWorking,     setIsWorking]     = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [charX,         setCharX]         = useState(CS);
  const [charY,         setCharY]         = useState(0);
  const [charAlpha,     setCharAlpha]     = useState(1);
  const [btnScale,      setBtnScale]      = useState(1);
  const [leftArmRot,    setLeftArmRot]    = useState(0);
  const [rightArmRot,   setRightArmRot]   = useState(0);

  const timers      = useRef<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearT = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const sched  = (pairs: [() => void, number][]) =>
    pairs.forEach(([fn, d]) => timers.current.push(window.setTimeout(fn, d)));

  const resetAll = () => {
    setCharX(CS); setCharY(0); setCharAlpha(1);
    setIsSprinting(false); setIsWorking(false); setIsCelebrating(false);
    setProgress(0); setLeftArmRot(0); setRightArmRot(0);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const onHoverStart = () => {
    if (phase !== "idle") return;
    setIsHovered(true); setBtnScale(1.03); setCharX(CS + 10);
  };

  const onHoverEnd = () => {
    if (phase !== "idle") return;
    setIsHovered(false); setBtnScale(1); setCharX(CS);
  };

  const handleClick = () => {
    if (phase !== "idle") return;
    clearT(); resetAll(); setIsHovered(false);
    setPhase("loading"); setBtnScale(0.96);

    sched([
      [() => { setBtnScale(1); setIsSprinting(true); setCharX(CE); }, 75],
      [() => {
        setIsSprinting(false); setIsWorking(true);
        let p = 0;
        intervalRef.current = setInterval(() => {
          p = Math.min(100, p + 1);
          setProgress(p);
          if (p >= 100) { clearInterval(intervalRef.current!); intervalRef.current = null; }
        }, 20);
      }, 430],
      [() => {
        setIsWorking(false); setIsCelebrating(true); setPhase("success");
        setLeftArmRot(-52); setRightArmRot(52);
        setCharY(-9);
        onDownload?.();
      }, 2460],
      [() => { setCharY(0); setBtnScale(1.06); }, 2620],
      [() => setBtnScale(1), 2820],
      [() => { setLeftArmRot(0); setRightArmRot(0); setIsCelebrating(false); }, 3200],
      [() => { setPhase("idle"); setCharX(CS); }, 3800],
      [() => resetAll(), 4400],
    ]);
  };

  useEffect(() => () => {
    clearT();
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const isLoading = phase === "loading";
  const isSuccess = phase === "success";
  const ringDashoffset = RING_C * (1 - progress / 100);
  const label      = isLoading ? `${progress}%` : isSuccess ? "Done!" : "Download";
  const labelColor = isLoading ? c.accent : isSuccess ? c.success : c.text;

  const charXTransition = isSprinting ? "transform 0.30s cubic-bezier(0.22,0,0.6,1)"
    : isHovered ? "transform 0.5s cubic-bezier(0.06,0.38,0.24,1.6)"
    : "transform 0.5s cubic-bezier(0.06,0.38,0.24,1.6)";

  return (
    <button
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={handleClick}
      style={{
        width: BW, height: BH,
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 14, border: `1px solid ${c.border}`, background: c.bg,
        cursor: phase === "idle" ? "pointer" : "default", overflow: "visible",
        userSelect: "none", outline: "none", WebkitTapHighlightColor: "transparent", flexShrink: 0,
        transform: `scale(${btnScale})`,
        boxShadow: isHovered ? `0 18px 44px ${c.shadow}, 0 0 26px ${c.glow}` : `0 6px 20px ${c.shadow}`,
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

      <span
        style={{
          color: labelColor, fontSize: 14, fontWeight: 600, letterSpacing: "0.015em",
          userSelect: "none", pointerEvents: "none", zIndex: 1,
          minWidth: 64, textAlign: "center",
          transform: (isLoading || isSuccess) ? "translateX(-4px)" : "translateX(0)",
          transition: "transform 0.25s ease, color 0.25s ease",
        }}
      >
        {label}
      </span>

      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0,
        display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 2,
      }}>
        <div style={{
          transform: `translateX(${charX}px) translateY(${charY}px)`,
          opacity: charAlpha,
          transition: `${charXTransition}, opacity 0.10s, translateY 0.14s ease`,
        }}>
          <div style={{
            transform: isSprinting ? "rotate(10deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}>
            <svg
              width={14} height={22} viewBox="0 0 14 22" fill="none"
              className={isSprinting ? "char-sprinting" : isWorking ? "char-working" : ""}
            >
              <ellipse cx={7} cy={3.6} rx={2.8} ry={2.8} fill={c.char} />
              <line x1={7} y1={6.4} x2={7} y2={13.5} stroke={c.char} strokeWidth={1.9} strokeLinecap="round" />
              <g className="prem-arm-l" style={isCelebrating || (!isSprinting && !isWorking && leftArmRot !== 0) ? { transform: `rotate(${leftArmRot}deg)`, transition: "transform 0.18s ease" } : undefined}>
                <line x1={7} y1={9} x2={2.5} y2={12.5} stroke={c.char} strokeWidth={1.4} strokeLinecap="round" />
              </g>
              <g className="prem-arm-r" style={isCelebrating || (!isSprinting && !isWorking && rightArmRot !== 0) ? { transform: `rotate(${rightArmRot}deg)`, transition: "transform 0.18s ease" } : undefined}>
                <line x1={7} y1={9} x2={11.5} y2={12.5} stroke={c.char} strokeWidth={1.4} strokeLinecap="round" />
              </g>
              <g className="prem-leg-l"><line x1={7} y1={13.5} x2={4} y2={20.5} stroke={c.char} strokeWidth={1.4} strokeLinecap="round" /></g>
              <g className="prem-leg-r"><line x1={7} y1={13.5} x2={10} y2={20.5} stroke={c.char} strokeWidth={1.4} strokeLinecap="round" /></g>
            </svg>
          </div>
        </div>
      </div>

      <div style={{
        position: "absolute", right: ICON_MARGIN, top: "50%",
        transform: "translateY(-50%)", width: ICON_D, height: ICON_D, zIndex: 3,
      }}>
        {!isLoading && !isSuccess && (
          <div style={{
            width: "100%", height: "100%", borderRadius: "50%",
            background: c.iconBg, border: `1.5px solid ${c.iconBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isHovered ? `0 0 10px ${c.glow}` : "none", transition: "box-shadow 0.3s ease",
          }}>
            <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
              <line x1={5.5} y1={1} x2={5.5} y2={8} stroke={c.accent} strokeWidth={1.6} strokeLinecap="round" />
              <path d="M2.5 5.5 L5.5 8.5 L8.5 5.5" stroke={c.accent} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {isLoading && (
          <svg width={ICON_D} height={ICON_D} viewBox={`0 0 ${ICON_D} ${ICON_D}`}>
            <circle cx={ICON_D / 2} cy={ICON_D / 2} r={RING_R} fill="none" stroke={`${c.accent}28`} strokeWidth={2} />
            <circle cx={ICON_D / 2} cy={ICON_D / 2} r={RING_R} fill="none" stroke={c.accent} strokeWidth={2}
              strokeLinecap="round" strokeDasharray={RING_C} strokeDashoffset={ringDashoffset}
              transform={`rotate(-90 ${ICON_D / 2} ${ICON_D / 2})`}
              style={{ transition: "stroke-dashoffset 0.08s linear" }}
            />
          </svg>
        )}

        {isSuccess && (
          <div
            className="mc-scale-in"
            style={{
              width: "100%", height: "100%", borderRadius: "50%",
              background: `${c.success}1a`, border: `1.5px solid ${c.success}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
              <path d="M1.5 5.5 L4.5 8.5 L9.5 2.5" stroke={c.success} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        <div style={{
          position: "absolute", inset: -5, borderRadius: "50%", pointerEvents: "none",
          background: `radial-gradient(ellipse at center,${c.glow} 0%,transparent 70%)`,
          opacity: isHovered ? 1 : 0, transform: isHovered ? "scale(1)" : "scale(0.7)",
          transition: "opacity 0.4s, transform 0.4s",
        }} />
      </div>
    </button>
  );
}
