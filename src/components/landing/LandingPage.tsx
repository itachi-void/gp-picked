"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Recycle,
  Leaf,
  Users,
  Coins,
  QrCode,
  MapPin,
  Play,
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
import { Stat, FeatureT, StepT, RoleT, ImpactEqT, ImpactStatT } from "./types";

// Reusable Components & Hooks
import FloatingParticles from "../FloatingParticles";
import { CyclingText } from "../CyclingText";
import { MaskWipeText } from "../MaskWipeText";

import "./landing-animations.css";

/* -------------------------------------------------------------------------- */
/*                                  Data                                      */
/* -------------------------------------------------------------------------- */
const NAV_ITEMS = ["Features", "How It Works", "Pricing", "Impact"];

const FEATURES: FeatureT[] = [
  { icon: Recycle, name: "AI Bottle Matching", accuracy: 99, description: "Identify bottle types instantly with 99.9% accuracy" },
  { icon: QrCode, name: "QR Verification", accuracy: 95, description: "Secure QR system for instant authentication" },
  { icon: MapPin, name: "Smart Routing", accuracy: 87, description: "AI-optimized collection routes save 40% fuel costs" },
  { icon: Recycle, name: "Live Dashboard", accuracy: 92, description: "Real-time analytics and performance monitoring" },
  { icon: Recycle, name: "Digital Wallet", accuracy: 88, description: "Instant rewards and seamless point redemption" },
  { icon: Recycle, name: "Secure Management", accuracy: 96, description: "Enterprise-grade security with blockchain verification" },
];

const STEPS: StepT[] = [
  { icon: Recycle, title: "Identify Bottle", description: "AI scans bottle type" },
  { icon: QrCode, title: "Scan QR", description: "Verify authenticity" },
  { icon: Recycle, title: "AI Verify", description: "Instant verification" },
  { icon: MapPin, title: "Driver Collect", description: "Optimized pickup" },
  { icon: Coins, title: "Earn Points", description: "Instant rewards" },
];

const ROLES: RoleT[] = [
  {
    icon: Users,
    title: "User",
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
    icon: Recycle,
    title: "Admin",
    description: "Full control",
    features: ["Full Dashboard", "Deep Analytics", "Manage All Operations"],
    color: "purple",
  },
];

const IMPACT_EQ: ImpactEqT[] = [
  { icon: Recycle, text: "1 Bottle" },
  { icon: Recycle, text: "0.5kg CO₂ Saved" },
  { icon: Recycle, text: "2 Trees Planted" },
  { icon: Recycle, text: "10L Water Saved" },
];

const IMPACT_STATS: ImpactStatT[] = [
  { icon: Recycle, label: "Bottles Recycled", value: "125,000", subtitle: "This Month" },
  { icon: Recycle, label: "CO₂ Reduced", value: "62,500kg", subtitle: "Carbon Offset" },
  { icon: Recycle, label: "Water Saved", value: "1,250,000L", subtitle: "Conservation" },
];

/* -------------------------------------------------------------------------- */
/*                               Main Component                               */
/* -------------------------------------------------------------------------- */
export default function LandingPage() {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [bottleCount, setBottleCount] = useState(100);
  const [mounted, setMounted] = useState(false);

  const [totalRecyclers, setTotalRecyclers] = useState<number | null>(null);
  const [activeRecyclers, setActiveRecyclers] = useState<number | null>(null);
  const [totalPickups, setTotalPickups] = useState<number | null>(null);
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);

    const fetchStats = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [resTotal, resActive, resPickups, resEarnings] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/total-recyclers`, { headers }),
          axios.get(`${API_BASE_URL}/api/admin/total-recycling-active`, { headers }),
          axios.get(`${API_BASE_URL}/api/admin/total-pickup-requests`, { headers }),
          axios.get(`${API_BASE_URL}/api/admin/Total-Earing`, { headers })
        ]);

        if (typeof resTotal.data === "number") {
          setTotalRecyclers(resTotal.data);
        } else if (resTotal.data && typeof resTotal.data.total === "number") {
          setTotalRecyclers(resTotal.data.total);
        }

        if (typeof resActive.data === "number") {
          setActiveRecyclers(resActive.data);
        } else if (resActive.data && typeof resActive.data.active === "number") {
          setActiveRecyclers(resActive.data.active);
        }

        if (typeof resPickups.data === "number") {
          setTotalPickups(resPickups.data);
        } else if (resPickups.data && typeof resPickups.data.total === "number") {
          setTotalPickups(resPickups.data.total);
        }

        if (typeof resEarnings.data === "number") {
          setTotalEarnings(resEarnings.data);
        } else if (resEarnings.data && typeof resEarnings.data.totalEarnings === "number") {
          setTotalEarnings(resEarnings.data.totalEarnings);
        }
      } catch (err) {
        console.warn("Failed to fetch admin stats, using mock data", err);
      }
    };

    fetchStats();
  }, []);

  const STATS: Stat[] = useMemo(() => [
    { icon: Recycle, label: "Total Pickups", value: totalPickups !== null ? totalPickups : 2547893, suffix: totalPickups !== null ? "" : "+", color: "emerald" },
    { icon: Users, label: "Total Recyclers", value: totalRecyclers !== null ? totalRecyclers : 52140, suffix: totalRecyclers !== null ? "" : "+", color: "purple" },
    { icon: Users, label: "Active Recyclers", value: activeRecyclers !== null ? activeRecyclers : 45678, suffix: activeRecyclers !== null ? "" : "+", color: "blue" },
    { icon: Coins, label: "Total Earnings", value: totalEarnings !== null ? totalEarnings : 1234567, suffix: " $", color: "amber" },
  ], [activeRecyclers, totalRecyclers, totalPickups, totalEarnings]);

  const calculatedValue = useMemo(() => bottleCount * 0.5, [bottleCount]);
  const calculatedPoints = useMemo(() => bottleCount * 10, [bottleCount]);
  const calculatedCO2 = useMemo(() => bottleCount * 0.5, [bottleCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {mounted && <FloatingParticles />}

      {/* ------------------------------- Navbar ------------------------------- */}
      <nav className="animate-nav-drop fixed top-0 left-0 right-0 z-40 transition-all duration-500 bg-transparent">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between gap-4 rounded-full border border-white/40 bg-white/60 px-4 py-2.5 shadow-lg shadow-emerald-900/5 backdrop-blur-xl">
            <div className="group flex items-center gap-2.5 flex-shrink-0 cursor-pointer transition-transform duration-200 hover:scale-[1.03]">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/30 transition-transform duration-300 group-hover:rotate-12">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                RecycleHub
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1 rounded-full bg-emerald-50/60 p-1">
              {NAV_ITEMS.map((item, index) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="animate-nav-item relative rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:text-emerald-700 hover:bg-white/80 hover:-translate-y-px whitespace-nowrap"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/login"
                className="hidden sm:block rounded-full px-5 py-2 text-sm font-semibold text-emerald-700 transition-all duration-200 hover:bg-emerald-50 hover:scale-[1.04] active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:shadow-emerald-500/50 hover:scale-[1.04] active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* -------------------------------- Hero -------------------------------- */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="animate-scale-pop text-6xl md:text-7xl font-bold text-gray-900 mb-6">
              <CyclingText texts={["Recycle Smart", "Earn Rewards", "Save Planet", "Join Movement"]} />
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              <MaskWipeText text="Transform bottle recycling with QR verification, AI matching, live tracking, and instant rewards" />
            </p>

            <div className="animate-fade-in-up flex flex-wrap gap-4 justify-center" style={{ animationDelay: "0.6s" }}>
              <button
                onClick={() => setQrModalOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 hover:shadow-[0_20px_40px_rgba(16,185,129,0.4)] cursor-pointer"
              >
                <QrCode className="w-5 h-5" />
                Scan QR Code
                <span className="inline-flex animate-arrow-nudge">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </button>

              <button className="group px-8 py-4 bg-white text-emerald-600 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg border border-emerald-200 hover:scale-105 active:scale-95 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] cursor-pointer">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>

            <div className="animate-fade-in-up mt-8 flex flex-col items-center gap-3" style={{ animationDelay: "0.8s" }}>
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
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-slate-200 text-sm text-slate-700 hover:border-emerald-400 hover:text-emerald-600 transition-colors backdrop-blur font-semibold"
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
          <SectionHeading title="Powerful Features" subtitle="Advanced technology for seamless recycling experience" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={i} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- How It Works ----------------------------- */}
      <section id="how-it-works" className="relative z-10 py-20 px-4 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto">
          <SectionHeading title="How It Works" subtitle="Simple 5-step process" />

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute top-12 left-0 right-0 h-2 bg-gray-200 rounded-full hidden md:block overflow-hidden">
                <ProgressLine />
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
            data-aos="fade-up"
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-emerald-100"
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
                  Number of Bottles: <span className="text-emerald-600 font-bold">{bottleCount}</span>
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
                  { label: "Cash Value", value: `$${calculatedValue.toFixed(2)}`, gradient: "from-emerald-50 to-teal-50" },
                  { label: "Reward Points", value: calculatedPoints.toLocaleString(), gradient: "from-purple-50 to-pink-50" },
                  { label: "CO₂ Saved", value: `${calculatedCO2}kg`, gradient: "from-green-50 to-emerald-50" },
                ].map((item, index) => {
                  return (
                    <div
                      key={index}
                      className={`bg-gradient-to-br ${item.gradient} rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)]`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Recycle className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm text-gray-600">{item.label}</span>
                      </div>
                      <div key={item.value} className="animate-fade-in text-3xl font-bold text-emerald-600">
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
          <SectionHeading title="Choose Your Role" subtitle="Join as a citizen, driver, or admin" />
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {ROLES.map((role, i) => (
              <RoleCard key={i} role={role} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- Impact ------------------------------- */}
      <section id="impact" className="relative z-10 py-20 px-4 bg-gradient-to-br from-green-600 to-emerald-700 text-white overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="animate-fade-in-up text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Environmental Impact</h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">Making a real difference for our planet</p>
          </div>

          <div
            data-aos="fade-up"
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 text-center">Impact Equation</h3>
              <div className="flex flex-wrap items-center justify-center gap-4 text-lg">
                {IMPACT_EQ.map((item, index, array) => {
                  const Icon = item.icon;
                  return (
                    <div key={`impact-item-${index}`} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-110 hover:-translate-y-1.5">
                        <Icon className="w-6 h-6 animate-pulse" />
                        <span>{item.text}</span>
                      </div>
                      {index < array.length - 1 && <span className="text-2xl">=</span>}
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
            data-aos="fade-up"
            className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <span
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full animate-cta-dot"
                  style={{
                    left: `${(i * 37) % 100}%`,
                    top: `${(i * 53) % 100}%`,
                    animationDelay: `${(i % 10) * 0.2}s`,
                  }}
                />
              ))}
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4 relative z-10">Ready to Start Recycling Smart?</h2>

            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto relative z-10">
              Join thousands of citizens making a difference. Start earning rewards today!
            </p>

            <div className="flex flex-wrap gap-4 justify-center relative z-10">
              <Link
                href="/signup"
                className="px-8 py-4 bg-white text-emerald-600 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg font-semibold hover:scale-105 active:scale-95 hover:shadow-[0_20px_40px_rgba(255,255,255,0.3)] cursor-pointer"
              >
                Get Started Free
                <span className="inline-flex animate-arrow-nudge">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>

              <Link
                href="/signup"
                className="px-8 py-4 bg-emerald-800 text-white rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg font-semibold hover:scale-105 active:scale-95 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] cursor-pointer"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- Footer ------------------------------- */}
      <footer className="relative z-10 bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div data-aos="fade-up">
              <div className="flex items-center gap-2 mb-4">
                <div className="animate-spin-slow">
                  <Recycle className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">RecycleHub</span>
              </div>
              <p className="text-gray-400 text-sm">
                Smart bottle recycling system with AI verification and instant rewards.
              </p>
            </div>

            {[
              { title: "Product", links: ["Features", "How It Works", "Pricing", "Dashboard"] },
              { title: "Company", links: ["About", "Careers", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security"] },
            ].map((section, index) => (
              <div key={section.title} data-aos="fade-up" data-aos-delay={index * 100}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="inline-block hover:text-white transition-all duration-200 hover:translate-x-1.5">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} RecycleHub. All rights reserved.</p>
            <a
              href="https://readdy.link"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-gray-400 hover:text-white transition-all duration-200 hover:scale-105"
            >
              Powered by Readdy
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QRScannerModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </div>
  );
}

// ProgressLine: خط التقدم اللي بيكبر للعرض الكامل أول ما يظهر — AOS fade-right
function ProgressLine() {
  return (
    <div
      data-aos="fade-right"
      data-aos-duration="1500"
      className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative"
      style={{ width: "100%", boxShadow: "0 0 20px rgba(16,185,129,0.6)" }}
    >
      <div className="absolute inset-0 bg-white/30 animate-shimmer-sweep" />
    </div>
  );
}