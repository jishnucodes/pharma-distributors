"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  useSpring 
} from "framer-motion";
import { 
  ShieldCheck, 
  Package, 
  ArrowRight, 
  PhoneCall, 
  Sparkles, 
  CheckCircle2, 
  ThermometerSnowflake, 
  Activity, 
  Truck, 
  Clock,
  Layers,
  Building2
} from "lucide-react";
import { Company } from "@/types";

interface CompanyKineticHeroProps {
  company: Company;
}

export function CompanyKineticHero({ company }: CompanyKineticHeroProps) {
  const isLakshmi = company.slug === "lakshmi-pharma";
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tilt parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    damping: 25,
    stiffness: 150,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), {
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

  const heroImage = isLakshmi 
    ? "/assets/pharma_capsule.jpg" 
    : "/assets/pharma_coldchain.jpg";

  const glowColor = isLakshmi 
    ? "rgba(16, 185, 129, 0.35)" 
    : "rgba(37, 99, 235, 0.35)";

  const satellites = isLakshmi
    ? [
        {
          top: "14%",
          left: "-5%",
          icon: <Package className="w-4 h-4 text-emerald-600" />,
          title: "High-Volume Catalog",
          subtitle: "2,400+ Active SKUs",
        },
        {
          top: "28%",
          right: "-6%",
          icon: <Truck className="w-4 h-4 text-teal-600" />,
          title: "1,400+ Retailers",
          subtitle: "Daily Dispatch Route",
        },
        {
          top: "70%",
          left: "-7%",
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
          title: "CDSCO Form 20B/21B",
          subtitle: "100% Genuine Batches",
        },
      ]
    : [
        {
          top: "14%",
          left: "-5%",
          icon: <ThermometerSnowflake className="w-4 h-4 text-cyan-600" />,
          title: "Active Cold Chain",
          subtitle: "2°C – 8°C Monitored",
        },
        {
          top: "28%",
          right: "-6%",
          icon: <Activity className="w-4 h-4 text-blue-600" />,
          title: "Zero-Lag ICU Pods",
          subtitle: "< 4hr Emergency Fulfillment",
        },
        {
          top: "70%",
          left: "-7%",
          icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />,
          title: "Institutional Armor",
          subtitle: "Tertiary Hospital Supply",
        },
      ];

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b transition-colors ${
        isLakshmi 
          ? "bg-gradient-to-b from-teal-950/5 via-emerald-50/40 to-slate-50/30 border-emerald-100" 
          : "bg-gradient-to-b from-blue-950/5 via-blue-50/40 to-slate-50/30 border-blue-100"
      }`}
    >
      {/* Ambient Glow Halo */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] lg:w-[900px] h-[400px] lg:h-[550px] rounded-full blur-3xl -z-10 pointer-events-none opacity-40 transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(255,255,255,0) 70%)`
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Narrative & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Regulatory Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-slate-200/90 shadow-2xs"
            >
              <div className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isLakshmi ? "bg-emerald-400" : "bg-blue-400"
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isLakshmi ? "bg-emerald-600" : "bg-blue-600"
                }`} />
              </div>
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                {company.tagline || (isLakshmi ? "Authorized Ethical & Generics Distribution" : "Specialty Therapeutics & Critical Care")}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                DL: {company.drugLicenseNo || "KL-REG-2024"}
              </span>
            </motion.div>

            {/* Headline */}
            <div className="space-y-3">
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]"
              >
                {company.name}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-sm sm:text-base text-slate-600 max-w-xl font-normal leading-relaxed"
              >
                {company.description}
              </motion.p>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl glass-panel border border-slate-200/80 shadow-2xs space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active SKUs
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {company.stats?.totalProducts ?? (isLakshmi ? "2,400" : "1,850")}+
                </p>
                <span className="text-[10px] text-slate-500 font-medium">Verified catalog</span>
              </div>

              <div className="p-3.5 rounded-2xl glass-panel border border-slate-200/80 shadow-2xs space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Manufacturers
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {company.stats?.totalManufacturers ?? 8}+
                </p>
                <span className="text-[10px] text-slate-500 font-medium">Direct agreements</span>
              </div>

              <div className="p-3.5 rounded-2xl glass-panel border border-slate-200/80 shadow-2xs space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Storage Protocol
                </span>
                <p className={`text-xl sm:text-2xl font-black tracking-tight ${
                  isLakshmi ? "text-emerald-700" : "text-blue-700"
                }`}>
                  {isLakshmi ? "15°C – 25°C" : "2°C – 8°C"}
                </p>
                <span className="text-[10px] text-slate-500 font-medium">Calibrated logs</span>
              </div>

              <div className="p-3.5 rounded-2xl glass-panel border border-slate-200/80 shadow-2xs space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Fulfillment SLA
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  &lt; 24 Hrs
                </p>
                <span className="text-[10px] text-slate-500 font-medium">Regional dispatch</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href={`/${company.slug}/products`}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs text-white shadow-md transition-all duration-200 hover:scale-102 ${
                  isLakshmi 
                    ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20" 
                    : "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Explore {company.shortName} Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href={`/${company.slug}/contact`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all duration-200 hover:scale-102"
              >
                <PhoneCall className="w-4 h-4 text-slate-500" />
                <span>Trade Desk &amp; Commercial Rates</span>
              </Link>
            </div>

          </div>

          {/* Right Column: 3D Floating Pharmaceutical Visual Stage */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full max-w-md aspect-square flex items-center justify-center"
            >
              {/* Radial Orbit Rings */}
              <div className="absolute inset-0 rounded-full border border-slate-200/60 -z-10 animate-spin" style={{ animationDuration: "45s" }} />
              <div className="absolute inset-8 rounded-full border border-dashed border-slate-300/60 -z-10 animate-spin" style={{ animationDuration: "65s", animationDirection: "reverse" }} />

              {/* Central Floating Image Card */}
              <div className="relative z-10 w-[270px] sm:w-[320px] h-[270px] sm:h-[320px] rounded-3xl overflow-hidden glass-panel shadow-2xl border-2 border-white/90 group">
                <div className="relative w-full h-full animate-float-medium">
                  <Image
                    src={heroImage}
                    alt={company.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 270px, 320px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-white/10 pointer-events-none" />

                  {/* Corner Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-800 border border-white/60 shadow-xs">
                      <Sparkles className={`w-3 h-3 ${isLakshmi ? "text-emerald-600" : "text-blue-600"}`} />
                      <span>{isLakshmi ? "Generics Line" : "Specialty Cold Pod"}</span>
                    </span>
                  </div>

                  {/* Bottom Status */}
                  <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xs">
                      <Activity className={`w-3.5 h-3.5 ${isLakshmi ? "text-emerald-400" : "text-cyan-400"} animate-pulse`} />
                      <span className="font-semibold text-[11px]">{company.shortName} Dispatch Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orbiting Satellites */}
              {satellites.map((satellite, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
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
