"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Recycle,
  Leaf,
  Users,
  Coins,
  Brain,
  QrCode,
  MapPin,
  BarChart3,
  Wallet,
  Shield,
  Droplet,
  Trees,
  TrendingDown,
  Play,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

// Local Subcomponents
import { StatCard } from "./StatCard";
import { FeatureCard } from "./FeatureCard";
import { StepItem } from "./StepItem";
import { RoleCard } from "./RoleCard";
import { ImpactStatCard } from "./ImpactStatCard";
import { LiquidProgress } from "./LiquidProgress";
import { QRScannerModal } from "./QRScannerModal";
import { SectionHeading } from "./SectionHeading";
import { useIntersection } from "./useIntersection";
import { Stat, FeatureT, StepT, RoleT, ImpactEqT, ImpactStatT } from "./types";

// Dynamic loading components
import FloatingParticles from "../FloatingParticles";
import LoginModal from "../LoginModal";
import { CyclingText } from "../CyclingText";
import { MaskWipeText } from "../MaskWipeText";

import "./landing-animations.css";

/* -------------------------------------------------------------------------- */
/*                                  Data                                      */
/* -------------------------------------------------------------------------- */
const NAV_ITEMS = ["Features", "How It Works", "Pricing", "Impact"];

const STATS: Stat[] = [
  {
    icon: Recycle,
    label: "Bottles Recycled",
    value: 2547893,
    color: "emerald",
  },
  {
    icon: Users,
    label: "Active Citizens",
    value: 45678,
    suffix: "+",
    color: "blue",
  },
  {
    icon: Coins,
    label: "Points Earned",
    value: 1234567,
    color: "amber",
  },
  {
    icon: Leaf,
    label: "Tons CO₂ Saved",
    value: 3456,
    color: "green",
  },
];

const FEATURES: FeatureT[] = [
  {
    icon: Brain,
    name: "AI Bottle Matching",
    accuracy: 99,
    description: "Identify bottle types instantly with 99.9% accuracy",
  },
  {
    icon: QrCode,
    name: "QR Verification",
    accuracy: 95,
    description: "Secure QR system for instant authentication",
  },
  {
    icon: MapPin,
    name: "Smart Routing",
    accuracy: 87,
    description: "AI-optimized collection routes save 40% fuel costs",
  },
  {
    icon: BarChart3,
    name: "Live Dashboard",
    accuracy: 92,
    description: "Real-time analytics and performance monitoring",
  },
  {
    icon: Wallet,
    name: "Digital Wallet",
    accuracy: 88,
    description: "Instant rewards and seamless point redemption",
  },
  {
    icon: Shield,
    name: "Secure Management",
    accuracy: 96,
    description: "Enterprise-grade security with blockchain verification",
  },
];

const STEPS: StepT[] = [
  {
    icon: Recycle,
    title: "Identify Bottle",
    description: "AI scans bottle type",
  },
  {
    icon: QrCode,
    title: "Scan QR",
    description: "Verify authenticity",
  },
  {
    icon: CheckCircle,
    title: "AI Verify",
    description: "Instant verification",
  },
  {
    icon: MapPin,
    title: "Driver Collect",
    description: "Optimized pickup",
  },
  {
    icon: Coins,
    title: "Earn Points",
    description: "Instant rewards",
  },
];

const ROLES: RoleT[] = [
  {
    icon: Users,
    title: "Citizen",
    description: "Scan and recycle",
    features: ["Scan & Recycle", "Earn Rewards", "Redeem Prizes"],
    color: "emerald",
  },
  {
    icon: MapPin,
    title: "Driver",
    description: "Optimized routes",
    features: ["Optimized Routes", "Live Tracking", "Earn Income"],
    color: "blue",
  },
  {
    icon: BarChart3,
    title: "Admin",
    description: "Full control",
    features: ["Full Dashboard", "Deep Analytics", "Manage All Operations"],
    color: "purple",
  },
];

const IMPACT_EQ: ImpactEqT[] = [
  { icon: Recycle, text: "1 Bottle" },
  { icon: TrendingDown, text: "0.5kg CO₂ Saved" },
  { icon: Trees, text: "2 Trees Planted" },
  { icon: Droplet, text: "10L Water Saved" },
];

const IMPACT_STATS: ImpactStatT[] = [
  {
    icon: Recycle,
    label: "Bottles Recycled",
    value: "125,000",
    subtitle: "This Month",
  },
  {
    icon: TrendingDown,
    label: "CO₂ Reduced",
    value: "62,500kg",
    subtitle: "Carbon Offset",
  },
  {
    icon: Droplet,
    label: "Water Saved",
    value: "1,250,000L",
    subtitle: "Conservation",
  },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [bottleCount, setBottleCount] = useState(100);
  const [mounted, setMounted] = useState(false);

  // Intersection refs for section animations
  const calcRef = useRef<HTMLDivElement>(null);
  const calcVisible = useIntersection(calcRef);

  const eqRef = useRef<HTMLDivElement>(null);
  const eqVisible = useIntersection(eqRef);

  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaVisible = useIntersection(ctaRef);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const calculatedValue = useMemo(() => bottleCount * 0.5, [bottleCount]);
  const calculatedPoints = useMemo(() => bottleCount * 10, [bottleCount]);
  const calculatedCO2 = useMemo(() => bottleCount * 0.5, [bottleCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {mounted && <FloatingParticles />}

      {/* ------------------------------- Navbar ------------------------------- */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ease-out ${
          scrolled ? "bg-white/80 backdrop-blur-md shadow-md" : "bg-transparent"
        } ${
          mounted ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between gap-4 rounded-full border border-white/40 bg-white/60 px-4 py-2.5 shadow-lg shadow-emerald-900/5 backdrop-blur-xl">
            <div className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/30 transition-transform duration-300 group-hover:rotate-12">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                RecycleHub
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1 rounded-full bg-emerald-50/60 p-1">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="relative rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:text-emerald-700 hover:bg-white/80 whitespace-nowrap"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden sm:block transition-transform duration-200 active:scale-95">
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="block rounded-full px-5 py-2 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-50/50 whitespace-nowrap cursor-pointer"
                >
                  Sign In
                </button>
              </div>

              <div className="transition-transform duration-200 active:scale-95">
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 whitespace-nowrap cursor-pointer"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* -------------------------------- Hero -------------------------------- */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div
            className={`transition-all duration-700 delay-300 transform ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 font-sans">
              <CyclingText
                texts={["Recycle Smart", "Earn Rewards", "Save Planet", "Join Movement"]}
              />
            </div>

            <div className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              <MaskWipeText text="Transform bottle recycling with QR verification, AI matching, live tracking, and instant rewards" />
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setQrModalOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg group cursor-pointer hover:scale-[1.03] active:scale-95 hover:shadow-emerald-500/30"
              >
                <QrCode className="w-5 h-5" />
                Scan QR Code
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                className="px-8 py-4 bg-white text-emerald-600 rounded-lg transition-all flex items-center gap-2 shadow-lg border border-emerald-200 group cursor-pointer hover:scale-[1.03] active:scale-95 hover:bg-emerald-50/50"
              >
                <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
                Watch Demo
              </button>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-xs uppercase tracking-[3px] text-slate-400 font-bold">
                Try the Lamp concepts
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { to: "/login-a", label: "Emerald", dot: "#86efac" },
                  { to: "/login-b", label: "Cinematic", dot: "#ffc678" },
                  { to: "/login-c", label: "Teal", dot: "#5eead4" },
                  { to: "/login-d", label: "Forest", dot: "#a7f3d0" },
                  { to: "/404", label: "404", dot: "#f59e0b" },
                ].map((r) => (
                  <Link
                    key={r.to}
                    href={r.to}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-slate-200 text-sm text-slate-700 hover:border-emerald-400 hover:text-emerald-600 transition-all font-semibold hover:scale-[1.02] active:scale-98"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.dot }} />
                    {r.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------- Live Counters ---------------------------- */}
      <section className="relative z-10 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <StatCard key={i} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- Features ------------------------------ */}
      <section id="features" className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <SectionHeading
            title="Powerful Features"
            subtitle="Advanced technology for seamless recycling experience"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={i} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- How It Works ----------------------------- */}
      <section
        id="how-it-works"
        className="relative z-10 py-20 px-4 bg-white/40 backdrop-blur-sm"
      >
        <div className="container mx-auto">
          <SectionHeading
            title="How It Works"
            subtitle="Simple 5-step process"
          />

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute top-12 left-0 right-0 h-2 bg-gray-200 rounded-full hidden md:block overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative animate-shimmer-pass"
                  style={{
                    width: "100%",
                    boxShadow: "0 0 20px rgba(16,185,129,0.6)",
                  }}
                />
              </div>

              <div className="grid md:grid-cols-5 gap-8 relative">
                {STEPS.map((step, i) => (
                  <StepItem key={i} step={step} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------- Rewards Calculator ------------------------- */}
      <section id="pricing" className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div
            ref={calcRef}
            className={`bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-emerald-100 transition-all duration-700 transform ${
              calcVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-12"
            }`}
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                Rewards Calculator
              </h2>
              <p className="text-gray-600">Calculate your potential earnings</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Bottles:{" "}
                  <span className="text-emerald-600 font-bold font-sans">
                    {bottleCount}
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={bottleCount}
                  onChange={(e) => setBottleCount(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Coins,
                    label: "Cash Value",
                    value: `$${calculatedValue.toFixed(2)}`,
                    color: "emerald",
                    gradient: "from-emerald-50 to-teal-50",
                  },
                  {
                    icon: Wallet,
                    label: "Reward Points",
                    value: calculatedPoints.toLocaleString(),
                    color: "purple",
                    gradient: "from-purple-50 to-pink-50",
                  },
                  {
                    icon: Leaf,
                    label: "CO₂ Saved",
                    value: `${calculatedCO2}kg`,
                    color: "green",
                    gradient: "from-green-50 to-emerald-50",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm text-gray-600">
                          {item.label}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-emerald-600 font-sans">
                        {item.value}
                      </div>
                    </div>
                  );
                })}
              </div>

              <LiquidProgress progress={bottleCount / 1000} />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- Roles -------------------------------- */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <SectionHeading
            title="Choose Your Role"
            subtitle="Join as a citizen, driver, or admin"
          />
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {ROLES.map((role, i) => (
              <RoleCard key={i} role={role} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- Impact ------------------------------- */}
      <section
        id="impact"
        className="relative z-10 py-20 px-4 bg-gradient-to-br from-green-600 to-emerald-700 text-white overflow-hidden"
      >
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Environmental Impact
            </h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Making a real difference for our planet
            </p>
          </div>

          {/* Impact Equation */}
          <div
            ref={eqRef}
            className={`max-w-4xl mx-auto mb-12 transition-all duration-700 transform ${
              eqVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-12"
            }`}
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Impact Equation
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-4 text-lg">
                {IMPACT_EQ.map((item, index, array) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={`impact-item-${index}`}
                      className="flex items-center gap-4 animate-landing-float"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className="flex items-center gap-2 transition-all hover:scale-105">
                        <Icon className="w-6 h-6 animate-pulse" />
                        <span>{item.text}</span>
                      </div>
                      {index < array.length - 1 && (
                        <span className="text-2xl">=</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {IMPACT_STATS.map((stat, i) => (
              <ImpactStatCard key={i} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------- CTA --------------------------------- */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <div
            ref={ctaRef}
            className={`bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden transition-all duration-700 transform ${
              ctaVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-12"
            }`}
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4 relative z-10">
              Ready to Start Recycling Smart?
            </h2>

            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto relative z-10">
              Join thousands of citizens making a difference. Start earning
              rewards today!
            </p>

            <div className="flex flex-wrap gap-4 justify-center relative z-10">
              <button
                onClick={() => setQrModalOpen(true)}
                className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg hover:bg-emerald-50 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <QrCode className="w-5 h-5" />
                Scan QR Code
              </button>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                Sign In Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------- Footer --------------------------------- */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Recycle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white font-sans">RecycleHub</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} RecycleHub. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <QRScannerModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </div>
  );
}