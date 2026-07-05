import Link from "next/link";
import LampScene, { useLamp } from "../components/LampScene";

/**
 * 404 — "Table Lamp Reveal"
 * Renders the original warm-tungsten lamp scene with the 404 info card.
 */
export default function NotFound404_Lamp() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <LampScene warm="255, 198, 120" contentPosition="right" lampStyle="warm-brass">
        <InfoCard />
      </LampScene>
    </div>
  );
}

function InfoCard() {
  const { intensity: I, warm } = useLamp();
  return (
    <div
      style={{
        position: "relative",
        width: "min(480px, 42vw)",
        minHeight: 320,
        borderRadius: 22,
        padding: "44px 40px 36px",
        background: `
          linear-gradient(135deg,
            rgba(${warm}, ${0.18 * I}) 0%,
            rgba(${warm}, ${0.06 * I}) 35%,
            rgba(20,22,30,0.5) 65%,
            rgba(10,12,18,0.7) 100%),
          rgba(18,20,28,0.55)
        `,
        backdropFilter: "blur(18px) saturate(120%)",
        WebkitBackdropFilter: "blur(18px) saturate(120%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `
          inset 1px 1px 0 rgba(${warm}, ${0.5 * I}),
          inset -1px -1px 0 rgba(0,0,0,0.6),
          -20px 24px 50px rgba(0,0,0,0.7),
          0 0 60px rgba(${warm}, ${0.12 * I})
        `,
        color: "#e8e6e2",
        overflow: "hidden",
      }}
    >
      {/* Rim lights */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "60%",
          height: 1,
          background: `linear-gradient(90deg, rgba(${warm}, ${0.9 * I}), rgba(${warm}, 0))`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1,
          height: "55%",
          background: `linear-gradient(180deg, rgba(${warm}, ${0.9 * I}), rgba(${warm}, 0))`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "-10%",
          top: "-20%",
          width: "70%",
          height: "70%",
          background: `radial-gradient(ellipse at 30% 30%, rgba(${warm}, ${0.22 * I}) 0%, rgba(${warm}, 0) 70%)`,
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "4px",
            color: `rgba(${warm}, ${0.6 + 0.3 * I})`,
            fontFamily: "monospace",
            marginBottom: 18,
          }}
        >
          ERROR · 404
        </div>
        <div
          style={{
            fontSize: "clamp(56px, 7vw, 88px)",
            lineHeight: 1,
            color: "#f5efe6",
            letterSpacing: "-2px",
            textShadow: `0 1px 0 rgba(${warm}, ${0.35 * I}), 0 -1px 0 rgba(0,0,0,0.6)`,
          }}
        >
          404
        </div>
        <div style={{ marginTop: 14, fontSize: 18, color: "#d8d4cc", letterSpacing: "0.5px" }}>
          This page is out of the light.
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 13,
            color: "rgba(220,215,205,0.55)",
            lineHeight: 1.6,
            maxWidth: 360,
          }}
        >
          The page you were looking for couldn’t be found. Step back into the
          glow of something familiar.
        </div>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 28,
            padding: "12px 26px",
            borderRadius: 999,
            background: `linear-gradient(135deg, rgba(${warm}, 0.85) 0%, rgba(${warm}, 0.55) 100%)`,
            border: `1px solid rgba(${warm}, 0.7)`,
            color: "#1a1308",
            fontSize: 13,
            letterSpacing: "2px",
            textDecoration: "none",
            fontWeight: 600,
            boxShadow: `0 8px 22px rgba(${warm}, ${0.35 * I})`,
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "none";
          }}
        >
          ← BACK HOME
        </Link>
      </div>
    </div>
  );
}
