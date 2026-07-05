import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const GLITCH_LINES = Array.from({ length: 6 }, (_, i) => i);

export default function NotFound404_Glitch() {
  const [glitchActive, setGlitchActive] = useState(false);
  const [rgbShift, setRgbShift] = useState({ r: 0, g: 0, b: 0 });
  const [scanlineY, setScanlineY] = useState(0);
  const [corruptText, setCorruptText] = useState("404");
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const CHARS = "█▓▒░▪▫◆◇○●◉X#@&%";
  const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

  const triggerGlitch = () => {
    setGlitchActive(true);
    const corrupt = () => {
      const base = "404";
      const result = base.split("").map((c) =>
        Math.random() < 0.4 ? randomChar() : c
      ).join("");
      setCorruptText(result);
      setRgbShift({
        r: (Math.random() - 0.5) * 12,
        g: (Math.random() - 0.5) * 8,
        b: (Math.random() - 0.5) * 14,
      });
    };
    const steps = 8;
    let step = 0;
    const interval = setInterval(() => {
      corrupt();
      step++;
      if (step >= steps) {
        clearInterval(interval);
        setCorruptText("404");
        setGlitchActive(false);
        setRgbShift({ r: 0, g: 0, b: 0 });
      }
    }, 60);
  };

  useEffect(() => {
    const scheduleGlitch = () => {
      const delay = 1200 + Math.random() * 2000;
      timerRef.current = setTimeout(() => {
        triggerGlitch();
        scheduleGlitch();
      }, delay);
    };
    scheduleGlitch();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    let last = 0;
    const tick = (t: number) => {
      if (!last) last = t;
      setScanlineY((y) => (y + (t - last) * 0.15) % 100);
      last = t;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Courier New', monospace",
        cursor: "crosshair",
      }}
      onClick={triggerGlitch}
    >
      {/* CRT scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* Moving scanline */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${scanlineY}%`,
          height: 2,
          background: "rgba(0,255,0,0.08)",
          pointerEvents: "none",
          zIndex: 11,
          boxShadow: "0 0 8px rgba(0,255,0,0.15)",
        }}
      />

      {/* VHS noise overlay */}
      {glitchActive && GLITCH_LINES.map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${10 + i * 15}%`,
            height: 2 + Math.random() * 6,
            background: `rgba(${Math.random() > 0.5 ? "255,0,0" : "0,255,255"},0.3)`,
            transform: `translateX(${(Math.random() - 0.5) * 40}px)`,
            pointerEvents: "none",
            zIndex: 9,
          }}
        />
      ))}

      {/* Corner decoration */}
      {[
        { top: 16, left: 16 },
        { top: 16, right: 16 },
        { bottom: 16, left: 16 },
        { bottom: 16, right: 16 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: 32,
            height: 32,
            borderColor: "rgba(0,255,0,0.3)",
            borderStyle: "solid",
            borderWidth: 0,
            ...(i === 0 ? { borderTopWidth: 2, borderLeftWidth: 2 } :
               i === 1 ? { borderTopWidth: 2, borderRightWidth: 2 } :
               i === 2 ? { borderBottomWidth: 2, borderLeftWidth: 2 } :
                         { borderBottomWidth: 2, borderRightWidth: 2 }),
          }}
        />
      ))}

      {/* Main content */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 5 }}>
        {/* Glitch layers */}
        <div style={{ position: "relative", display: "inline-block" }}>
          {/* Red channel */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              fontSize: "clamp(100px, 20vw, 180px)",
              fontWeight: 900,
              lineHeight: 1,
              color: "#ff0000",
              letterSpacing: "-4px",
              transform: `translate(${rgbShift.r}px, 0)`,
              opacity: 0.7,
              userSelect: "none",
              mixBlendMode: "screen",
            }}
          >
            {corruptText}
          </div>
          {/* Cyan channel */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              fontSize: "clamp(100px, 20vw, 180px)",
              fontWeight: 900,
              lineHeight: 1,
              color: "#00ffff",
              letterSpacing: "-4px",
              transform: `translate(${rgbShift.b}px, 0)`,
              opacity: 0.7,
              userSelect: "none",
              mixBlendMode: "screen",
            }}
          >
            {corruptText}
          </div>
          {/* Main */}
          <div
            style={{
              fontSize: "clamp(100px, 20vw, 180px)",
              fontWeight: 900,
              lineHeight: 1,
              color: "#00ff00",
              letterSpacing: "-4px",
              textShadow: "0 0 20px rgba(0,255,0,0.5)",
              userSelect: "none",
              position: "relative",
            }}
          >
            {corruptText}
          </div>
        </div>

        <div
          style={{
            fontSize: "clamp(12px, 1.8vw, 16px)",
            color: "rgba(0,255,0,0.6)",
            letterSpacing: "8px",
            marginTop: 8,
            animation: "blinkText 1.8s step-end infinite",
          }}
        >
          CRITICAL SYSTEM ERROR
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 12,
            color: "rgba(0,255,0,0.35)",
            fontFamily: "monospace",
            lineHeight: 2,
          }}
        >
          <div>{">"} ERROR CODE: 0x404_PAGE_NOT_FOUND</div>
          <div>{">"} MEMORY ADDRESS: 0xDEAD_BEEF</div>
          <div>{">"} STACK TRACE: ██████████ CORRUPTED</div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          margin: "28px 0",
          width: "min(360px, 80vw)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "rgba(0,255,0,0.4)",
            letterSpacing: "2px",
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>RECOVERY ATTEMPT...</span>
          <span>FAILED</span>
        </div>
        <div
          style={{
            height: 4,
            background: "rgba(0,255,0,0.1)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "67%",
              background: "linear-gradient(90deg, #00ff00, #ff0000)",
              animation: "glitchBar 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
          color: "rgba(0,255,0,0.3)",
          letterSpacing: "3px",
          marginBottom: 24,
          animation: "blinkText 1s step-end infinite",
        }}
      >
        [ CLICK ANYWHERE TO TRIGGER GLITCH ]
      </div>

      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 32px",
          border: "1px solid rgba(0,255,0,0.5)",
          color: "#00ff00",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 600,
          borderRadius: 0,
          background: "rgba(0,255,0,0.05)",
          letterSpacing: "4px",
          transition: "all 0.2s",
          position: "relative",
          zIndex: 12,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(0,255,0,0.15)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,255,0,0.3), inset 0 0 20px rgba(0,255,0,0.05)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(0,255,0,0.05)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        {">"} REBOOT SYSTEM
      </Link>

      <style>{`
        @keyframes blinkText {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes glitchBar {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5%); }
          75% { transform: translateX(5%); }
        }
      `}</style>
    </div>
  );
}
