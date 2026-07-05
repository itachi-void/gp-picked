import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const WORD_CLOUD = [
  { text: "LOST", size: 48, x: 12, y: 15, rotate: -12, opacity: 0.08 },
  { text: "ERROR", size: 28, x: 70, y: 8, rotate: 8, opacity: 0.07 },
  { text: "404", size: 36, x: 82, y: 72, rotate: -5, opacity: 0.06 },
  { text: "MISSING", size: 22, x: 5, y: 80, rotate: 15, opacity: 0.07 },
  { text: "NOT FOUND", size: 20, x: 55, y: 88, rotate: -8, opacity: 0.06 },
  { text: "NULL", size: 30, x: 35, y: 5, rotate: 0, opacity: 0.05 },
  { text: "VOID", size: 26, x: 88, y: 40, rotate: 90, opacity: 0.06 },
  { text: "UNDEFINED", size: 18, x: 2, y: 45, rotate: -90, opacity: 0.05 },
  { text: "GONE", size: 24, x: 50, y: 65, rotate: 20, opacity: 0.06 },
];

export default function NotFound404_Typography() {
  const [mouseX, setMouseX] = useState(0.5);
  const [mouseY, setMouseY] = useState(0.5);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    setMouseX((e.clientX - r.left) / r.width);
    setMouseY((e.clientY - r.top) / r.height);
  };

  const parallaxX = (mouseX - 0.5) * 30;
  const parallaxY = (mouseY - 0.5) * 20;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {/* Background word cloud */}
      {WORD_CLOUD.map((w, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${w.x}%`,
            top: `${w.y}%`,
            fontSize: w.size,
            fontWeight: 900,
            color: "#000",
            opacity: w.opacity,
            transform: `rotate(${w.rotate}deg) translate(${parallaxX * (0.2 + i * 0.1)}px, ${parallaxY * (0.2 + i * 0.08)}px)`,
            transition: "transform 0.4s ease",
            userSelect: "none",
            whiteSpace: "nowrap",
            letterSpacing: "-1px",
          }}
        >
          {w.text}
        </div>
      ))}

      {/* Thin horizontal lines decoration */}
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${5 + i * 5}%`,
            height: 1,
            background: "rgba(0,0,0,0.04)",
          }}
        />
      ))}

      {/* Main 404 */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          textAlign: "center",
          transform: `translate(${parallaxX * -0.3}px, ${parallaxY * -0.3}px)`,
          transition: "transform 0.3s ease",
        }}
      >
        {/* Massive 404 */}
        <div
          style={{
            fontSize: "clamp(140px, 28vw, 280px)",
            fontWeight: 900,
            lineHeight: 0.85,
            color: "#000",
            letterSpacing: "-12px",
            userSelect: "none",
            position: "relative",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Outline version offset */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              color: "transparent",
              WebkitTextStroke: "2px rgba(0,0,0,0.08)",
              transform: `translate(${hovered ? 8 : 4}px, ${hovered ? 8 : 4}px)`,
              transition: "transform 0.3s ease",
            }}
          >
            404
          </div>
          404
        </div>

        {/* Divider */}
        <div
          style={{
            width: "60%",
            height: 3,
            background: "#000",
            margin: "12px auto",
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: "clamp(13px, 2vw, 18px)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "#333",
            letterSpacing: "3px",
            marginBottom: 4,
          }}
        >
          Page Not Found
        </div>

        {/* Arabic subtitle */}
        <div
          style={{
            fontSize: "clamp(14px, 1.8vw, 18px)",
            fontWeight: 700,
            color: "#000",
            letterSpacing: "1px",
            direction: "rtl",
          }}
        >
          الصفحة غير موجودة
        </div>

        {/* Thin divider */}
        <div
          style={{
            width: "40%",
            height: 1,
            background: "rgba(0,0,0,0.2)",
            margin: "16px auto",
          }}
        />

        {/* Description */}
        <div
          style={{
            maxWidth: 360,
            margin: "0 auto",
            fontSize: "clamp(12px, 1.3vw, 14px)",
            color: "#666",
            lineHeight: 2,
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          "The page you seek has vanished into the digital ether,<br />
          much like data without a destination."
        </div>
      </div>

      {/* Bottom details */}
      <div
        style={{
          marginTop: 40,
          display: "flex",
          alignItems: "center",
          gap: 24,
          position: "relative",
          zIndex: 5,
        }}
      >
        <div
          style={{
            height: 1,
            width: 80,
            background: "#000",
          }}
        />
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 32px",
            border: "2px solid #000",
            color: "#000",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "4px",
            background: "transparent",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#000";
            (e.currentTarget as HTMLElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#000";
          }}
        >
          RETURN HOME
        </Link>
        <div
          style={{
            height: 1,
            width: 80,
            background: "#000",
          }}
        />
      </div>

      {/* Page number style footer */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 11,
          color: "rgba(0,0,0,0.25)",
          letterSpacing: "4px",
          fontStyle: "italic",
        }}
      >
        — EcoVision Fleet Management —
      </div>
    </div>
  );
}
