"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
const tomImg = "/imports/1000511510-removebg-preview.png";
const jerrySprite = "/imports/1000511511-removebg-preview.png";
const jerryVideo = "/imports/video5868658637697720734.mp4";
import NotFound404_GPS from "./NotFound404_GPS";
import NotFound404_Recycling from "./NotFound404_Recycling";
import NotFound404_Astronaut from "./NotFound404_Astronaut";
import NotFound404_Glitch from "./NotFound404_Glitch";
import NotFound404_WrongTurn from "./NotFound404_WrongTurn";
import NotFound404_Typography from "./NotFound404_Typography";
import NotFound404_Electric from "./NotFound404_Electric";
import NotFound404_Lamp from "./NotFound404_Lamp";

const FLASHLIGHT_RADIUS = 220;
const JERRY_SIZE = 150;

const THEMES = [
  { id: "tomjerry", label: "Tom & Jerry", emoji: "🐱" },
  { id: "gps", label: "Lost Signal", emoji: "📡" },
  { id: "recycling", label: "Recycling", emoji: "♻️" },
  { id: "astronaut", label: "Astronaut", emoji: "🚀" },
  { id: "glitch", label: "Glitch", emoji: "⚡" },
  { id: "wrongturn", label: "Wrong Turn", emoji: "🗺️" },
  { id: "typography", label: "Typography",    emoji: "🖋" },
  { id: "electric",   label: "Electric",       emoji: "⚡" },
  { id: "lamp",       label: "Table Lamp",     emoji: "💡" },
] as const;

type ThemeId = typeof THEMES[number]["id"];

const STORAGE_KEY = "ecovision_404_theme";

export default function NotFoundPage() {
  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && THEMES.find((t) => t.id === saved)) return saved as ThemeId;
    } catch {}
    return "tomjerry";
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  const switchTheme = (id: ThemeId) => {
    setActiveTheme(id);
    setPickerOpen(false);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* Active theme */}
      <div style={{ position: "absolute", inset: 0 }}>
        {activeTheme === "tomjerry" && <TomJerryScene />}
        {activeTheme === "gps" && <NotFound404_GPS />}
        {activeTheme === "recycling" && <NotFound404_Recycling />}
        {activeTheme === "astronaut" && <NotFound404_Astronaut />}
        {activeTheme === "glitch" && <NotFound404_Glitch />}
        {activeTheme === "wrongturn" && <NotFound404_WrongTurn />}
        {activeTheme === "typography" && <NotFound404_Typography />}
        {activeTheme === "electric"   && <NotFound404_Electric />}
        {activeTheme === "lamp"       && <NotFound404_Lamp />}
      </div>

      {/* Theme Switcher */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        {pickerOpen && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              background: "rgba(10,12,24,0.94)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: "10px 8px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              minWidth: 180,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "3px",
                textAlign: "center",
                paddingBottom: 6,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                marginBottom: 2,
                fontFamily: "monospace",
              }}
            >
              PREVIEW THEMES
            </div>
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTheme(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  background: activeTheme === t.id
                    ? "rgba(255,255,255,0.14)"
                    : "transparent",
                  color: activeTheme === t.id ? "#fff" : "rgba(255,255,255,0.5)",
                  outline: activeTheme === t.id ? "1px solid rgba(255,255,255,0.25)" : "none",
                  transition: "all 0.15s",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  if (activeTheme !== t.id)
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                }}
                onMouseLeave={(e) => {
                  if (activeTheme !== t.id)
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span style={{ fontSize: 16 }}>{t.emoji}</span>
                <span>{t.label}</span>
                {activeTheme === t.id && (
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setPickerOpen((o) => !o)}
          title="Switch 404 theme"
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(10,12,24,0.88)",
            backdropFilter: "blur(10px)",
            color: "rgba(255,255,255,0.75)",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
            transition: "all 0.2s",
            outline: "none",
            transform: pickerOpen ? "rotate(45deg)" : "none",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(30,35,60,0.96)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.35)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(10,12,24,0.88)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
          }}
        >
          🎨
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   TOM & JERRY SCENE (original, preserved)
   ========================================================= */
function TomJerryScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const [touchActive, setTouchActive] = useState(false);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const r = el.getBoundingClientRect();
      setPos({ x: t.clientX - r.left, y: t.clientY - r.top });
      setTouchActive(true);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("touchmove", onTouch, { passive: true });
    el.addEventListener("touchstart", onTouch, { passive: true });
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("touchmove", onTouch);
      el.removeEventListener("touchstart", onTouch);
    };
  }, []);

  useEffect(() => {
    if (touchActive) return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (!isTouch) return;
    const el = sceneRef.current;
    if (!el) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const r = el.getBoundingClientRect();
      const elapsed = (t - start) / 1000;
      const cx = r.width / 2;
      const cy = r.height / 2;
      const rx = r.width * 0.32;
      const ry = r.height * 0.28;
      setPos({
        x: cx + Math.cos(elapsed * 0.9) * rx,
        y: cy + Math.sin(elapsed * 0.9) * ry,
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [touchActive]);

  const mask = `radial-gradient(circle ${FLASHLIGHT_RADIUS}px at ${pos.x}px ${pos.y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0) 100%)`;

  return (
    <div
      ref={sceneRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#000000", // Matched background to Jerry video black background to make mix-blend-mode look perfect
        cursor: "none",
        fontFamily: "'Impact','Arial Black',sans-serif",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          background: "radial-gradient(ellipse at center, #1a2238 0%, #0a0e1c 70%, #000000 100%)", // Graduating to true black for video blend
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "10%",
            height: 2,
            background: "linear-gradient(90deg, transparent, rgba(255,220,150,0.25) 20%, rgba(255,220,150,0.25) 80%, transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -60%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: "clamp(140px, 22vw, 280px)",
              color: "#ffb347",
              fontStyle: "italic",
              lineHeight: 0.9,
              letterSpacing: "-8px",
              textShadow: "0 4px 0 #cc7a1a, 0 8px 0 #8a5010, 0 16px 30px rgba(255,160,60,0.25)",
            }}
          >
            404
          </div>
          <div
            style={{
              marginTop: 18,
              color: "#ffd89b",
              fontSize: "clamp(16px, 1.8vw, 22px)",
              letterSpacing: "4px",
              textShadow: "2px 2px 0 #000",
            }}
          >
            OH&nbsp;CRUMBS!
          </div>
          <div
            style={{
              marginTop: 8,
              color: "#a8b0c8",
              fontSize: "clamp(12px, 1.3vw, 15px)",
              fontFamily: "'Georgia',serif",
              fontStyle: "italic",
              letterSpacing: "1px",
            }}
          >
            the page escaped…
          </div>
        </div>
        <img
          src={tomImg}
          alt="Tom"
          style={{
            position: "absolute",
            left: "4%",
            bottom: "10%",
            height: "min(46vh, 400px)",
            width: "auto",
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.6))",
            animation: "tomLean 3.6s ease-in-out infinite",
            transformOrigin: "50% 100%",
          }}
        />
        <Jerry pos={pos} sceneRef={sceneRef} />
        <div
          style={{
            position: "absolute",
            right: "4%",
            bottom: "10%",
            width: 90,
            height: 120,
            background: "radial-gradient(ellipse at 50% 100%, #000 0%, #120a05 60%, #261408 100%)",
            borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
            boxShadow: "inset 0 -6px 22px rgba(0,0,0,0.95), 0 0 0 3px rgba(80,45,15,0.5)",
          }}
        />
      </div>
      <TomEyes />
      <div
        style={{
          position: "absolute",
          left: pos.x - FLASHLIGHT_RADIUS,
          top: pos.y - FLASHLIGHT_RADIUS,
          width: FLASHLIGHT_RADIUS * 2,
          height: FLASHLIGHT_RADIUS * 2,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,220,150,0.08) 0%, rgba(255,220,150,0.04) 50%, transparent 75%)",
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          color: "#5a6378",
          fontSize: 13,
          letterSpacing: "3px",
          fontFamily: "'Georgia',serif",
          fontStyle: "italic",
          opacity: pos.x < 0 ? 1 : 0,
          transition: "opacity 0.6s ease",
          pointerEvents: "none",
        }}
      >
        move your light…
      </div>
      <Link
        href="/"
        style={{
          position: "absolute",
          left: "50%",
          bottom: "6%",
          transform: "translateX(-50%)",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 38px",
          background: "linear-gradient(135deg, #ff7a45 0%, #ff5218 100%)",
          color: "#fff",
          borderRadius: 999,
          textDecoration: "none",
          fontSize: 15,
          letterSpacing: "3px",
          border: "2px solid #cc3a0e",
          boxShadow: "0 5px 0 #992a08, 0 10px 26px rgba(255,82,24,0.4)",
          cursor: "none",
          zIndex: 10,
        }}
      >
        ← GO HOME
      </Link>
      <div
        style={{
          position: "absolute",
          left: pos.x - 5,
          top: pos.y - 5,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#fff6c4",
          boxShadow: "0 0 12px 4px rgba(255,220,150,0.6)",
          pointerEvents: "none",
          zIndex: 11,
        }}
      />
      <style>{`
        @keyframes tomLean {
          0%, 100% { transform: rotate(-1deg) scale(1, 1); }
          50%      { transform: rotate(1deg)  scale(1.01, 0.99); }
        }
        @keyframes eyeBlink {
          0%, 92%, 100% { transform: scaleY(1); }
          95%           { transform: scaleY(0.1); }
        }
      `}</style>
    </div>
  );
}

function Jerry({
  pos,
  sceneRef,
}: {
  pos: { x: number; y: number };
  sceneRef: React.RefObject<HTMLDivElement | null>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const scene = sceneRef.current;
    if (!wrap || !scene) return;
    const wr = wrap.getBoundingClientRect();
    const sr = scene.getBoundingClientRect();
    const cx = wr.left - sr.left + wr.width / 2;
    const cy = wr.top - sr.top + wr.height / 2;
    const dx = pos.x - cx;
    const dy = pos.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    setLit(dist < FLASHLIGHT_RADIUS * 0.9);
  }, [pos, sceneRef]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (lit) {
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [lit]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        right: "12%",
        bottom: "10.5%",
        width: JERRY_SIZE,
        height: JERRY_SIZE,
        pointerEvents: "none", // Prevent hover elements from showing up
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${jerrySprite})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 0",
          backgroundSize: "800% 100%",
          opacity: lit ? 0 : 1,
          transition: "opacity 0.18s ease",
          pointerEvents: "none",
        }}
      />
      <video
        ref={videoRef}
        src={jerryVideo}
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          opacity: lit ? 1 : 0,
          transition: "opacity 0.18s ease",
          mixBlendMode: "screen",
          pointerEvents: "none", // Disable PiP overlay elements on hover
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
}

function TomEyes() {
  const eyeStyle: React.CSSProperties = {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#fff8d6",
    boxShadow: "0 0 6px 2px rgba(255,240,180,0.7), 0 0 14px 6px rgba(255,200,80,0.25)",
    animation: "eyeBlink 4s ease-in-out infinite",
    pointerEvents: "none",
  };
  return (
    <>
      <div style={{ ...eyeStyle, left: "calc(4% + 130px)", bottom: "calc(10% + 280px)" }} />
      <div style={{ ...eyeStyle, left: "calc(4% + 150px)", bottom: "calc(10% + 280px)" }} />
    </>
  );
}
