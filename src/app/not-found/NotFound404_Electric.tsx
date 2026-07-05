import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";

interface Particle {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
  color: string;
  glow: number;
}

const SPARK_COLORS = ["#00d4ff", "#00aaff", "#7df9ff", "#ffffff", "#00ffff", "#80dfff", "#a8edff"];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

// ── Pure canvas helpers ────────────────────────────────────────────────────────
function drawLightningBolt(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  intensity: number,
) {
  const segs = 6 + Math.floor(intensity * 4);
  const pts: [number, number][] = [[x1, y1]];
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    pts.push([
      x1 + (x2 - x1) * t + rnd(-1, 1) * 36 * intensity,
      y1 + (y2 - y1) * t + rnd(-1, 1) * 36 * intensity,
    ]);
  }
  pts.push([x2, y2]);

  const stroke = (lw: number, color: string, blur: number, alpha: number) => {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = lw;
    ctx.shadowColor = "#00d4ff"; ctx.shadowBlur = blur;
    ctx.globalAlpha = alpha; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
    ctx.stroke(); ctx.restore();
  };
  stroke(2 + intensity * 3, "#00d4ff", 22 * intensity, 0.3 + intensity * 0.55);
  stroke(1 + intensity,      "#80e8ff",  8 * intensity, 0.4 + intensity * 0.4);
  stroke(0.5,                "#ffffff",  4,              0.45 * intensity);
}

function drawCable(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  swing: number, si: number,
) {
  const midX = (x1 + x2) / 2 + Math.sin(swing * 1.3) * 22;
  const midY = Math.max(y1, y2) + 50 + Math.sin(swing * 0.65) * 14;

  const path = () => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(midX, midY, x2, y2);
  };

  if (si > 0.05) {
    ctx.save();
    ctx.strokeStyle = `rgba(0,200,255,${si * 0.45})`; ctx.lineWidth = 14;
    ctx.shadowColor = "#00d4ff"; ctx.shadowBlur = 35 * si;
    ctx.globalAlpha = si * 0.6; ctx.lineCap = "round"; path(); ctx.stroke(); ctx.restore();
  }
  ctx.save();
  ctx.strokeStyle = si > 0.3 ? "#00a8d8" : "#1e3a5f"; ctx.lineWidth = 8;
  ctx.lineCap = "round";
  if (si > 0.05) { ctx.shadowColor = "#00d4ff"; ctx.shadowBlur = 14 * si; }
  path(); ctx.stroke(); ctx.restore();

  ctx.save();
  ctx.strokeStyle = si > 0.3 ? "#80dfff" : "#2d5a8e"; ctx.lineWidth = 4;
  ctx.lineCap = "round"; path(); ctx.stroke(); ctx.restore();

  // Connector cap
  ctx.save();
  ctx.fillStyle = si > 0.3 ? "#00d4ff" : "#f59e0b";
  ctx.shadowColor = si > 0.3 ? "#00d4ff" : "#f59e0b";
  ctx.shadowBlur = si > 0.3 ? 16 : 6;
  ctx.beginPath(); ctx.arc(x2, y2, 8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// ──────────────────────────────────────────────────────────────────────────────

export default function NotFound404_Electric() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  // All animation state driven by refs for RAF performance
  const breathRef   = useRef(0);
  const swingRef    = useRef(0);
  const lastTRef    = useRef(0);
  const isVisRef    = useRef(true);
  const isShockRef  = useRef(false);
  const shockIntRef = useRef(0);
  const mousePRef   = useRef({ x: -9999, y: -9999 });
  const sizeRef     = useRef({ w: 800, h: 600 });
  const particlesRef = useRef<Particle[]>([]);
  const pidRef      = useRef(0);
  const rafRef      = useRef<number>(0);
  const flickerRef  = useRef({ on: true, timer: 0 });

  // React state only for SVG updates (throttled)
  const [svgTick, setSvgTick] = useState(0);
  const svgFrameRef = useRef(0);
  const svgBreath   = useRef(0);
  const svgSwing    = useRef(0);
  const svgShocked  = useRef(false);
  const svgFlicker  = useRef(true);

  // Page visibility
  useEffect(() => {
    const fn = () => { isVisRef.current = !document.hidden; };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, []);

  // Resize
  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      sizeRef.current = { w: width, h: height };
      const canvas = canvasRef.current;
      if (canvas) { canvas.width = width; canvas.height = height; }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Spawn sparks helper
  const spawnSparks = useCallback((
    cx: number, cy: number, tx: number, ty: number,
    intensity: number, count: number,
  ) => {
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const px = cx + (tx - cx) * t + rnd(-1, 1) * 28 * intensity;
      const py = cy + (ty - cy) * t + rnd(-1, 1) * 28 * intensity;
      const angle = Math.random() * Math.PI * 2;
      const speed = rnd(0.4, 4.5) * intensity;
      particlesRef.current.push({
        id: pidRef.current++,
        x: px, y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rnd(0.4, 2),
        life: 1,
        maxLife: rnd(0.2, 0.7),
        size: rnd(1, 4.5) * Math.min(intensity, 1.5),
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
        glow: rnd(4, 18) * intensity,
      });
    }
    if (particlesRef.current.length > 300) {
      particlesRef.current = particlesRef.current.slice(-300);
    }
  }, []);

  // Main RAF loop
  useEffect(() => {
    const tick = (t: number) => {
      if (!isVisRef.current) { rafRef.current = requestAnimationFrame(tick); return; }

      const dt = Math.min((t - (lastTRef.current || t)) / 1000, 0.05);
      lastTRef.current = t;

      breathRef.current = (breathRef.current + dt * 1.1) % (Math.PI * 2);
      swingRef.current  = (swingRef.current  + dt * 0.55) % (Math.PI * 2);

      // Shock intensity (rise fast, decay slower)
      if (isShockRef.current) {
        shockIntRef.current = Math.min(shockIntRef.current + dt * 10, 1);
      } else {
        shockIntRef.current = Math.max(shockIntRef.current - dt * 2.5, 0);
      }
      const si = shockIntRef.current;

      // Flicker logic
      flickerRef.current.timer -= dt;
      if (flickerRef.current.timer <= 0 && !isShockRef.current) {
        const wasOn = flickerRef.current.on;
        if (wasOn && Math.random() < 0.3) {
          flickerRef.current.on = false;
          flickerRef.current.timer = rnd(0.04, 0.14);
        } else {
          flickerRef.current.on = true;
          flickerRef.current.timer = rnd(1.5, 4);
        }
      }

      const { w, h } = sizeRef.current;
      const sceneH = h * 0.63;

      // Layout positions (pixel)
      const handX  = w * 0.315;
      const handY  = sceneH * 0.53 + Math.sin(breathRef.current * 0.5) * 2;
      const tipX   = w * 0.505 + Math.sin(swingRef.current) * 11;
      const tipY   = sceneH * 0.55 + Math.cos(swingRef.current * 0.75) * 8;
      const signX  = w * 0.565;
      const signY  = sceneH * 0.46;

      // Mouse proximity
      const mx  = mousePRef.current.x;
      const my  = mousePRef.current.y;
      const d   = Math.sqrt((mx - tipX) ** 2 + (my - tipY) ** 2);
      const prox = Math.max(0, 1 - d / 150);

      // Spawn sparks
      const rate = (0.25 + prox * 2.2 + si * 3) * dt * 60;
      if (Math.random() < rate) {
        spawnSparks(tipX, tipY, signX, signY,
          0.5 + prox * 1.6 + si * 2,
          1 + Math.floor(prox * 3) + Math.floor(si * 6));
      }

      // Update particles
      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          x:  p.x + p.vx,
          y:  p.y + p.vy,
          vy: p.vy + 0.08,
          vx: p.vx * 0.97,
          life: p.life - dt / p.maxLife,
        }))
        .filter(p => p.life > 0);

      // Draw canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, w, h);

          // Cable
          drawCable(ctx, handX, handY, tipX, tipY, swingRef.current, si);

          // Lightning bolt(s) in gap
          if (prox > 0.05 || si > 0.1) {
            const bolts = 1 + Math.floor(si * 2);
            for (let b = 0; b < bolts; b++) {
              drawLightningBolt(ctx,
                tipX, tipY,
                signX + rnd(-12, 12), signY + rnd(-10, 10),
                prox + si * 0.8);
            }
          }

          // Particles
          particlesRef.current.forEach(p => {
            const a = Math.max(0, p.life);
            ctx.save();
            ctx.globalAlpha = a;
            ctx.shadowColor = p.color; ctx.shadowBlur = p.glow;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.1, p.size * a), 0, Math.PI * 2);
            ctx.fill(); ctx.restore();
          });

          // Tip glow
          ctx.save();
          ctx.shadowColor = "#00d4ff"; ctx.shadowBlur = 18 + prox * 24;
          ctx.fillStyle = "#00d4ff"; ctx.globalAlpha = 0.85;
          ctx.beginPath(); ctx.arc(tipX, tipY, 5.5, 0, Math.PI * 2); ctx.fill();
          ctx.restore();

          // Shock screen flash
          if (si > 0.08) {
            ctx.fillStyle = `rgba(0,180,255,${si * 0.11 + Math.random() * 0.04})`;
            ctx.fillRect(0, 0, w, h);
          }
        }
      }

      // Throttle SVG re-renders to every 3 frames
      svgFrameRef.current++;
      if (svgFrameRef.current % 3 === 0) {
        svgBreath.current  = breathRef.current;
        svgSwing.current   = swingRef.current;
        svgShocked.current = si > 0.25;
        svgFlicker.current = isShockRef.current ? true : flickerRef.current.on;
        setSvgTick(n => n + 1);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [spawnSparks]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    mousePRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    const { w, h } = sizeRef.current;
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    const tipX = w * 0.505;
    const tipY = h * 0.63 * 0.55;
    if (Math.sqrt((mx - tipX) ** 2 + (my - tipY) ** 2) < 160) {
      isShockRef.current = true;
      setTimeout(() => { isShockRef.current = false; }, 1500);
    }
  }, []);

  // SVG-driven values from refs
  const breathY  = Math.sin(svgBreath.current) * 2.2;
  const armBob   = Math.sin(svgSwing.current * 0.5) * 1.5;
  const shocked  = svgShocked.current;
  const flicker  = svgFlicker.current;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
        width: "100%",
        minHeight: "100vh",
        height: "100vh",
        background: "linear-gradient(145deg, #0f172a 0%, #0c1220 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "crosshair",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Grid bg */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage:
          "linear-gradient(rgba(0,150,255,0.025) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(0,150,255,0.025) 1px, transparent 1px)",
        backgroundSize: "52px 52px",
      }} />
      {/* Radial glow blob */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 58% 38%, rgba(0,100,220,0.07) 0%, transparent 62%)",
      }} />

      {/* Canvas — cable, lightning, particles */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 8 }}
      />

      {/* ── Scene (top 63%) ── */}
      <div style={{ flex: "0 0 63%", position: "relative", minHeight: 0 }}>

        {/* 404 Sign */}
        <div
          style={{
            position: "absolute",
            right: "8%",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 5,
          }}
        >
          <div
            style={{
              background: "linear-gradient(145deg, #0a1628 0%, #0d2240 100%)",
              border: `2px solid ${shocked ? "rgba(0,212,255,0.9)" : "rgba(0,80,160,0.45)"}`,
              borderRadius: 18,
              padding: "20px 36px 16px",
              boxShadow: shocked
                ? "0 0 50px rgba(0,212,255,0.65), 0 0 100px rgba(0,150,255,0.35), inset 0 0 50px rgba(0,180,255,0.12)"
                : "0 0 30px rgba(0,80,200,0.18), inset 0 0 24px rgba(0,40,100,0.12)",
              transition: "box-shadow 0.2s ease, border-color 0.2s ease",
              position: "relative",
            }}
          >
            {/* Corner bolts */}
            {[
              { top: 9,  left: 9  }, { top: 9,  right: 9 },
              { bottom: 9, left: 9 }, { bottom: 9, right: 9 },
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  position: "absolute", ...pos,
                  width: 9, height: 9, borderRadius: "50%",
                  background: shocked ? "#00d4ff" : "#1e4080",
                  boxShadow: shocked ? "0 0 8px #00d4ff" : "none",
                  transition: "all 0.2s",
                }}
              />
            ))}

            {/* 404 neon text */}
            <div
              style={{
                fontSize: "clamp(56px, 9vw, 112px)",
                fontWeight: 900,
                fontFamily: "'Courier New', 'SF Mono', monospace",
                lineHeight: 1,
                letterSpacing: "-3px",
                color: flicker ? (shocked ? "#ffffff" : "#00d4ff") : "rgba(0,212,255,0.08)",
                textShadow: shocked
                  ? "0 0 14px #fff, 0 0 30px #00d4ff, 0 0 60px #00aaff, 0 0 100px #0080ff"
                  : flicker
                    ? "0 0 8px #00d4ff, 0 0 18px #00aaff, 0 0 38px #0070cc"
                    : "none",
                transition: "color 0.04s, text-shadow 0.08s",
                userSelect: "none",
              }}
            >
              404
            </div>

            {/* Subtitle strip */}
            <div
              style={{
                marginTop: 8,
                fontSize: 10,
                letterSpacing: "5px",
                color: shocked ? "rgba(0,255,255,0.85)" : "rgba(0,140,200,0.45)",
                textAlign: "center",
                fontFamily: "monospace",
                transition: "color 0.25s",
              }}
            >
              ERROR
            </div>

            {/* Side plug holes */}
            <div style={{ position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)" }}>
              {[0, 14].map(i => (
                <div
                  key={i}
                  style={{
                    width: 10, height: 6,
                    background: shocked ? "#00d4ff" : "#0d2a50",
                    borderRadius: 2,
                    marginBottom: i === 0 ? 2 : 0,
                    boxShadow: shocked ? "0 0 10px #00d4ff" : "none",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Technician SVG */}
        <svg
          viewBox="0 0 260 380"
          style={{
            position: "absolute",
            left: "2%",
            bottom: 0,
            height: "88%",
            width: "auto",
            zIndex: 5,
            overflow: "visible",
          }}
          aria-label="Cartoon technician holding cable"
        >
          {/* Full body group with breathing */}
          <g transform={`translate(0, ${breathY})`}>

            {/* ── Hard hat ── */}
            <ellipse cx={128} cy={64} rx={56} ry={12} fill="#f59e0b" />
            <path d="M 74 64 Q 76 28 128 24 Q 180 28 182 64 Z" fill="#f59e0b" />
            <rect x={68} y={62} width={120} height={9} rx={3} fill="#d97706" />
            <rect x={74} y={68} width={108} height={3} rx={1.5} fill="rgba(0,0,0,0.15)" />
            {/* Hat badge */}
            <circle cx={128} cy={48} r={8} fill="#0f172a" />
            <text x={128} y={52} textAnchor="middle" fontSize={7} fill="#00d4ff" fontWeight="bold" fontFamily="monospace">E</text>

            {/* ── Head ── */}
            <circle cx={128} cy={95} r={40} fill="#fcd5a0" />
            <ellipse cx={95}  cy={98} rx={8}  ry={11} fill="#fcc080" />
            <ellipse cx={161} cy={98} rx={8}  ry={11} fill="#fcc080" />

            {/* Eyes */}
            <circle cx={115} cy={90} r={6} fill="#1e293b" />
            <circle cx={141} cy={90} r={6} fill="#1e293b" />
            <circle cx={116.5} cy={88.5} r={2} fill="#fff" />
            <circle cx={142.5} cy={88.5} r={2} fill="#fff" />
            {/* Pupil concern expression */}
            <circle cx={117} cy={91}   r={1.2} fill="#0f172a" />
            <circle cx={143} cy={91}   r={1.2} fill="#0f172a" />
            {/* Eyebrows raised */}
            <path d="M 109 82 Q 115 79 121 82" fill="none" stroke="#c4803a" strokeWidth={2} strokeLinecap="round" />
            <path d="M 135 82 Q 141 79 147 82" fill="none" stroke="#c4803a" strokeWidth={2} strokeLinecap="round" />
            {/* Nose */}
            <ellipse cx={128} cy={100} rx={5} ry={3.5} fill="#e8a870" />
            {/* Mouth — slightly open/surprised */}
            <path d="M 118 112 Q 128 119 138 112" fill="#e8897a" stroke="#c4603a" strokeWidth={1.5} strokeLinecap="round" />

            {/* Neck */}
            <rect x={118} y={128} width={20} height={20} rx={4} fill="#fcd5a0" />

            {/* ── Body ── */}
            {/* Work jacket */}
            <path d="M 78 148 L 90 144 L 118 150 L 118 250 L 78 250 Z" fill="#1e40af" />
            <path d="M 138 150 L 166 144 L 178 148 L 178 250 L 138 250 Z" fill="#1e40af" />
            {/* Center front */}
            <rect x={90} y={144} width={76} height={106} rx={5} fill="#2563eb" />
            {/* Hi-vis stripes */}
            <rect x={90} y={144} width={76} height={5} rx={2} fill="#f59e0b" />
            <rect x={90} y={216} width={76} height={5} rx={2} fill="#f59e0b" />
            {/* Chest badge */}
            <rect x={100} y={162} width={56} height={26} rx={5} fill="#0f172a" stroke="#00d4ff" strokeWidth={1} opacity={0.9} />
            <text x={128} y={173} textAnchor="middle" fontSize={7} fill="#00d4ff" fontWeight="bold" fontFamily="monospace">TECH</text>
            <text x={128} y={183} textAnchor="middle" fontSize={6} fill="rgba(0,212,255,0.6)" fontFamily="monospace">EcoVision</text>
            {/* Pocket */}
            <rect x={152} y={196} width={20} height={16} rx={3} fill="rgba(0,0,0,0.2)" />
            {/* Zipper */}
            <line x1={128} y1={150} x2={128} y2={250} stroke="rgba(0,0,0,0.2)" strokeWidth={1.5} strokeDasharray="3 2" />

            {/* ── Left arm (relaxed, down) ── */}
            <g transform="rotate(5, 86, 162)">
              <rect x={72} y={158} width={24} height={78} rx={11} fill="#2563eb" />
              <rect x={76} y={232} width={16} height={22} rx={7} fill="#fcd5a0" />
            </g>

            {/* ── Right arm (raised, holding cable, slight bob) ── */}
            <g transform={`rotate(-32, 170, 158) translate(0, ${armBob})`}>
              <rect x={166} y={152} width={24} height={72} rx={11} fill="#2563eb" />
              <rect x={170} y={220} width={16} height={20} rx={7} fill="#fcd5a0" />
              {/* Cable grip / connector in hand */}
              <rect x={164} y={237} width={28} height={14} rx={5} fill="#f59e0b" stroke="#d97706" strokeWidth={1} />
              <rect x={170} y={232} width={16} height={7}  rx={3} fill="#d97706" />
              {/* Grip ridges */}
              {[168, 174, 180, 186].map(x => (
                <rect key={x} x={x} y={237} width={2} height={14} rx={1} fill="rgba(0,0,0,0.18)" />
              ))}
            </g>

            {/* ── Legs ── */}
            <rect x={96}  y={250} width={28} height={100} rx={11} fill="#1e3a5f" />
            <rect x={132} y={250} width={28} height={100} rx={11} fill="#1e3a5f" />
            {/* Knee details */}
            <rect x={98}  y={290} width={24} height={6} rx={3} fill="rgba(255,255,255,0.08)" />
            <rect x={134} y={290} width={24} height={6} rx={3} fill="rgba(255,255,255,0.08)" />
            {/* Boots */}
            <ellipse cx={110} cy={350} rx={22} ry={10} fill="#111827" />
            <ellipse cx={146} cy={350} rx={22} ry={10} fill="#111827" />
            <ellipse cx={110} cy={348} rx={20} ry={7}  fill="#1e293b" />
            <ellipse cx={146} cy={348} rx={20} ry={7}  fill="#1e293b" />
          </g>

          {/* Shock effect sparks ON technician */}
          {shocked && (
            <g opacity={0.6 + Math.random() * 0.3}>
              {[[130, 88], [170, 160], [100, 200], [155, 280], [125, 320]].map(([x, y], i) => (
                <path
                  key={i}
                  d={`M ${x} ${y} L ${x + 8} ${y + 6} L ${x + 4} ${y + 6} L ${x + 12} ${y + 14}`}
                  fill="none"
                  stroke={i % 2 === 0 ? "#00d4ff" : "#ffffff"}
                  strokeWidth={1.5}
                  opacity={0.8}
                />
              ))}
            </g>
          )}
        </svg>

        {/* Hint label */}
        <div
          style={{
            position: "absolute",
            bottom: "6%",
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(0,180,255,0.28)",
            fontSize: 10,
            letterSpacing: "4px",
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            animation: "hintPulse 2.5s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: 9,
            textTransform: "uppercase",
          }}
        >
          Hover near cable tip · Click to shock
        </div>
      </div>

      {/* ── Text content (bottom 37%) ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 24px 28px",
          position: "relative",
          zIndex: 10,
          textAlign: "center",
        }}
      >
        {/* Divider line */}
        <div style={{
          width: "min(420px, 80%)",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(0,180,255,0.2), transparent)",
          marginBottom: 20,
        }} />

        <div
          style={{
            fontSize: "clamp(18px, 2.8vw, 30px)",
            fontWeight: 800,
            color: "#e2e8f0",
            marginBottom: 8,
            letterSpacing: "-0.3px",
          }}
        >
          404 — Page Not Found
        </div>

        <p
          style={{
            fontSize: "clamp(12px, 1.4vw, 15px)",
            color: "#64748b",
            marginBottom: 24,
            maxWidth: 380,
            lineHeight: 1.75,
          }}
        >
          The connection to this page seems to be broken.
          Our technician is on it — or distracted by the sparks.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 28px",
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              color: "#fff",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 10,
              boxShadow: "0 4px 18px rgba(14,165,233,0.32)",
              letterSpacing: "0.3px",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-2px)";
              el.style.boxShadow = "0 8px 26px rgba(14,165,233,0.5)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "none";
              el.style.boxShadow = "0 4px 18px rgba(14,165,233,0.32)";
            }}
          >
            ⚡ Return Home
          </Link>

          <button
            onClick={() => window.history.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 28px",
              background: "transparent",
              color: "#64748b",
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 10,
              border: "1px solid rgba(100,116,139,0.28)",
              cursor: "pointer",
              letterSpacing: "0.3px",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "#94a3b8";
              el.style.borderColor = "rgba(148,163,184,0.4)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "#64748b";
              el.style.borderColor = "rgba(100,116,139,0.28)";
            }}
          >
            ← Go Back
          </button>
        </div>

        {/* Status indicator */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 10,
            letterSpacing: "2.5px",
            fontFamily: "monospace",
            color: "rgba(100,116,139,0.45)",
          }}
        >
          <div
            style={{
              width: 7, height: 7,
              borderRadius: "50%",
              background: shocked ? "#00d4ff" : "#ef4444",
              boxShadow: shocked ? "0 0 10px #00d4ff" : "0 0 8px #ef4444",
              animation: "statusBlink 1.6s ease-in-out infinite",
              transition: "background 0.3s, box-shadow 0.3s",
            }}
          />
          STATUS: {shocked ? "RECONNECTING..." : "CONNECTION LOST"}
        </div>
      </div>

      <style>{`
        @keyframes hintPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
        @keyframes statusBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}
