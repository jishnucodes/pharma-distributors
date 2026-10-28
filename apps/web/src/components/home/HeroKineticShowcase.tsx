"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  useSpring, 
  AnimatePresence 
} from "framer-motion";
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ThermometerSnowflake, 
  Package, 
  Truck, 
  Layers,
  ChevronRight,
  Activity,
  CheckCircle2,
  FileCheck,
  Cpu
} from "lucide-react";
import { AntigravityFlowCanvas } from "@/components/canvas/AntigravityFlowCanvas";

interface ShowcaseMode {
  id: "biologics" | "generics" | "critical";
  title: string;
  pillLabel: string;
  categoryName: string;
  headlineAccent: string;
  description: string;
  imageSrc: string;
  glowColor: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  satellites: {
    top: string;
    left?: string;
    right?: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    delay: number;
  }[];
  specifications: {
    label: string;
    value: string;
  }[];
}

const SHOWCASE_MODES: ShowcaseMode[] = [
  {
    id: "biologics",
    title: "Cold-Chain Biologics",
    pillLabel: "Biologics & Vaccines",
    categoryName: "2°C – 8°C Cryo-Monitored",
    headlineAccent: "from-cyan-600 via-teal-600 to-blue-700",
    description: "End-to-end continuous thermal auditing for sensitive vaccines, insulins, and biologic therapies with real-time digital batch telemetry.",
    imageSrc: "/assets/pharma_vial.jpg",
    glowColor: "rgba(6, 182, 212, 0.35)",
    accentBg: "bg-cyan-50",
    accentBorder: "border-cyan-200",
    accentText: "text-cyan-800",
    satellites: [
      {
        top: "12%",
        left: "-4%",
        icon: <ThermometerSnowflake className="w-4 h-4 text-cyan-600" />,
        title: "Active Cold Chain",
        subtitle: "3.8°C Live Telemetry",
        delay: 0.1,
      },
      {
        top: "22%",
        right: "-6%",
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        title: "CDSCO Verified",
        subtitle: "Batch #LK-BIO-9024",
        delay: 0.2,
      },
      {
        top: "70%",
        left: "-8%",
        icon: <Activity className="w-4 h-4 text-blue-600" />,
        title: "WHO-GMP Certified",
        subtitle: "100% Sealed Integrity",
        delay: 0.3,
      },
    ],
    specifications: [
      { label: "Storage Range", value: "2°C to 8°C Regulated" },
      { label: "Dispatch Frequency", value: "Daily Cold-Reefer Runs" },
      { label: "Key Molecules", value: "Insulin, Monoclonals, Vaccines" },
    ],
  },
  {
    id: "generics",
    title: "Ethical & Generics",
    pillLabel: "High-Volume Generics",
    categoryName: "Daily Pharmacy Restock",
    headlineAccent: "from-emerald-600 via-teal-700 to-emerald-900",
    description: "Rapid high-frequency distribution covering 1,400+ verified retail pharmacies and clinical establishments across South India.",
    imageSrc: "/assets/pharma_capsule.jpg",
    glowColor: "rgba(16, 185, 129, 0.35)",
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-200",
    accentText: "text-emerald-800",
    satellites: [
      {
        top: "14%",
        left: "-6%",
        icon: <Package className="w-4 h-4 text-emerald-600" />,
        title: "High Velocity",
        subtitle: "99.4% Fulfillment Rate",
        delay: 0.1,
      },
      {
        top: "28%",
        right: "-8%",
        icon: <FileCheck className="w-4 h-4 text-teal-600" />,
        title: "Top Formulas",
        subtitle: "Dolo, Calpol, Augmentin",
        delay: 0.2,
      },
      {
        top: "72%",
        right: "-4%",
        icon: <Truck className="w-4 h-4 text-emerald-600" />,
        title: "1,400+ Retailers",
        subtitle: "Same-Day Dispatch Core",
        delay: 0.3,
      },
    ],
    specifications: [
      { label: "Inventory Depth", value: "3,500+ Active SKUs" },
      { label: "Regional Coverage", value: "Central Kerala & Coimbatore" },
      { label: "Primary Partner", value: "Lakshmi Pharma (Est. 1998)" },
    ],
  },
  {
    id: "critical",
    title: "Critical Care Supply",
    pillLabel: "Specialty & ICU Care",
    categoryName: "Zero-Delay Healthcare Lines",
    headlineAccent: "from-blue-600 via-indigo-600 to-sky-700",
    description: "Mission-critical institutional logistics supplying tertiary hospitals, cardiology centers, and oncology clinics with immediate priority dispatch.",
    imageSrc: "/assets/pharma_coldchain.jpg",
    glowColor: "rgba(37, 99, 235, 0.35)",
    accentBg: "bg-blue-50",
    accentBorder: "border-blue-200",
    accentText: "text-blue-800",
    satellites: [
      {
        top: "15%",
        left: "-5%",
        icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
        title: "ICU Priority",
        subtitle: "Zero-Lag Dispatch Pod",
        delay: 0.1,
      },
      {
        top: "30%",
        right: "-6%",
        icon: <Activity className="w-4 h-4 text-indigo-600" />,
        title: "Thermal Armor",
        subtitle: "Insulated Shock-Proof",
        delay: 0.2,
      },
      {
        top: "68%",
        left: "-6%",
        icon: <Truck className="w-4 h-4 text-sky-600" />,
        title: "GPS Monitored",
        subtitle: "Direct Hospital Fleet",
        delay: 0.3,
      },
    ],
    specifications: [
      { label: "Hospital SLAs", value: "< 4hr Emergency Fulfillment" },
      { label: "Logistics Type", value: "Calibrated Smart Pods" },
      { label: "Primary Partner", value: "The Kothittil Distributor" },
    ],
  },
];

export function HeroKineticShowcase() {
  const [activeTab, setActiveTab] = useState<"biologics" | "generics" | "critical">("biologics");
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth mouse tilt parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    damping: 25,
    stiffness: 150,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    damping: 25,
    stiffness: 150,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const currentMode = SHOWCASE_MODES.find((m) => m.id === activeTab) || SHOWCASE_MODES[0];

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 overflow-hidden perspective-1000 bg-gradient-to-b from-slate-50/40 via-white/20 to-slate-50/30"
    >
      {/* Real-Time 3D WebGL Three.js Antigravity Flow Canvas */}
      <AntigravityFlowCanvas
        variant={activeTab === "critical" ? "kothittil" : "lakshmi"}
        density="normal"
        interactive={true}
        opacity={0.48}
        className="z-0"
      />

      {/* Dynamic Ambient Background Glows */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[450px] sm:h-[600px] rounded-full blur-3xl -z-10 transition-all duration-700 pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(circle, ${currentMode.glowColor} 0%, rgba(255,255,255,0) 70%)`
        }}
      />
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-teal-100/40 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-20 right-10 w-80 h-80 rounded-full bg-blue-100/40 blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[580px]">
          
          {/* Left Column: Headline, Narrative & Category Switcher */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Top Floating Badges */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 flex-wrap"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill border border-slate-200/80 shadow-xs">
                <div className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
                </div>
                <span className="text-xs font-semibold text-slate-800 tracking-tight">
                  Verified Wholesale Healthcare Distribution
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  CDSCO Compliant
                </span>
              </div>

              {/* 3D WebGL Flow Real-Time Engine Indicator */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-pill border border-teal-300/60 shadow-xs text-teal-800 text-[10px] font-mono font-bold tracking-wider uppercase">
                <Cpu className="w-3 h-3 text-teal-600 animate-pulse" />
                <span>3D Kinetic Flow</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <div className="space-y-3">
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]"
              >
                Next-Gen Medicine Logistics Under The{" "}
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentMode.headlineAccent} transition-all duration-500`}>
                  L &amp; K Enterprise
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-sm sm:text-base text-slate-600 max-w-xl font-normal leading-relaxed"
              >
                Connecting certified pharmaceutical manufacturers to pharmacies, clinics, and tertiary hospitals with validated cold-chain precision and zero-delay fulfillment.
              </motion.p>
            </div>

            {/* Interactive Mode Pills Selector */}
            <div className="pt-1">
              <div className="inline-flex p-1.5 rounded-2xl glass-pill border border-slate-200/90 shadow-sm gap-1 sm:gap-1.5 flex-wrap">
                {SHOWCASE_MODES.map((mode) => {
                  const isSelected = activeTab === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setActiveTab(mode.id)}
                      className={`relative px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                        isSelected 
                          ? "text-slate-900 shadow-sm" 
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="activePill"
                          className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/70"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <span 
                          className={`w-2 h-2 rounded-full transition-colors ${
                            isSelected 
                              ? mode.id === "biologics" ? "bg-cyan-500" : mode.id === "generics" ? "bg-emerald-500" : "bg-blue-600"
                              : "bg-slate-300"
                          }`}
                        />
                        <span>{mode.pillLabel}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specifications Strip & Action Triggers */}
            <div className="rounded-2xl glass-panel p-4 sm:p-5 border border-slate-200/80 shadow-md space-y-4">
              <div className="grid grid-cols-3 gap-3 pb-3 border-b border-slate-200/60">
                {currentMode.specifications.map((spec, i) => (
                  <div key={i} className="space-y-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                      {spec.label}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-slate-800 tracking-tight truncate">
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <p className="text-[11px] sm:text-xs text-slate-500 leading-snug max-w-sm">
                  {currentMode.description}
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/lakshmi-pharma/products"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-700 hover:bg-teal-800 shadow-md transition-all duration-200 hover:scale-102"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/kothittil-pharma"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all duration-200 hover:scale-102"
                  >
                    <span>Specialty</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Floating Levitating Medical Centerpiece */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full max-w-md aspect-square flex items-center justify-center"
            >
              {/* Soft Ambient Platform Halo */}
              <div 
                className="absolute inset-4 rounded-full blur-2xl transition-all duration-700 pointer-events-none opacity-60"
                style={{
                  background: currentMode.glowColor
                }}
              />

              {/* Orbiting Radial Rings (3D Depth) */}
              <div className="absolute inset-0 rounded-full border border-slate-200/60 -z-10 animate-spin" style={{ animationDuration: "40s" }} />
              <div className="absolute inset-8 rounded-full border border-dashed border-slate-300/60 -z-10 animate-spin" style={{ animationDuration: "60s", animationDirection: "reverse" }} />

              {/* Central Floating High-Res 3D Medical Visual */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMode.id}
                  initial={{ opacity: 0, scale: 0.88, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88, y: -15 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 w-[280px] sm:w-[340px] h-[280px] sm:h-[340px] rounded-3xl overflow-hidden glass-panel shadow-2xl border-2 border-white/90 group"
                >
                  <div className="relative w-full h-full animate-float-medium">
                    <Image
                      src={currentMode.imageSrc}
                      alt={currentMode.title}
                      fill
                      priority
                      sizes="(max-width: 768px) 280px, 340px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Subtle Shimmer Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-white/10 pointer-events-none" />

                    {/* Corner Brand Seal */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-800 border border-white/60 shadow-xs">
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        <span>{currentMode.categoryName}</span>
                      </span>
                    </div>

                    {/* Bottom Audio/Status Bar */}
                    <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xs">
                        <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span className="font-semibold text-[10px] sm:text-[11px]">Real-Time Dispatch Verified</span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                        2026 Core
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Orbiting Satellite Badges (Kinetic Floating Pills from the Reel) */}
              {currentMode.satellites.map((satellite, index) => (
                <motion.div
                  key={`${currentMode.id}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: satellite.delay }}
                  style={{
                    top: satellite.top,
                    left: satellite.left,
                    right: satellite.right,
                    transform: "translateZ(40px)",
                  }}
                  className={`hidden sm:flex absolute z-30 items-center gap-2.5 p-2.5 rounded-2xl glass-panel shadow-xl border border-white/90 max-w-[200px] transition-all duration-300 hover:scale-105 ${
                    index % 2 === 0 ? "animate-float-slow" : "animate-float-medium"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
                    {satellite.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 tracking-tight leading-tight">
                      {satellite.title}
                    </div>
                    <div className="text-[10px] font-medium text-slate-500">
                      {satellite.subtitle}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
