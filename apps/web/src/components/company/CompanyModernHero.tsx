"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  PhoneCall, 
  CheckCircle2, 
  ThermometerSnowflake, 
  Activity, 
  Truck, 
  Send,
  Building2,
  FileText
} from "lucide-react";
import { Company } from "@/types";
import { useInquiry } from "@/components/inquiry/InquiryContext";

interface CompanyModernHeroProps {
  company: Company;
}

export function CompanyModernHero({ company }: CompanyModernHeroProps) {
  const isLakshmi = company.slug === "lakshmi-pharma";
  const { openInquiry } = useInquiry();
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tilt parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    damping: 25,
    stiffness: 150,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    damping: 25,
    stiffness: 150,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
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

  const cleanPhone = company.whatsapp ? company.whatsapp.replace(/\D/g, "") : "919447123456";

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 overflow-hidden perspective-1000"
    >
      {/* Dynamic Ambient Background Glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[450px] sm:h-[550px] rounded-full blur-3xl -z-10 pointer-events-none opacity-40 transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(255,255,255,0) 70%)`
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[520px]">
          
          {/* Left Column: Bold Typography & Digital Marketing Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Top Kicker Bar (Inspired by bar-topas.ch kicker) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200/90 shadow-2xs">
                <span className={`w-2 h-2 rounded-full animate-ping ${isLakshmi ? "bg-teal-500" : "bg-blue-500"}`} />
                <span>Live Warehouse Dispatch Active</span>
              </span>

              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest ${
                isLakshmi ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}>
                {isLakshmi ? "Est. 1998 · South India Core" : "Est. 2005 · Cryo-Logistics"}
              </span>

              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                CDSCO Form 20B/21B
              </span>
            </div>

            {/* Giant Title & Dynamic Marketing Tagline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.04]">
                {company.name.split(" ")[0]}{" "}
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                  isLakshmi 
                    ? "from-emerald-600 via-teal-600 to-emerald-900" 
                    : "from-blue-600 via-indigo-600 to-sky-700"
                }`}>
                  {company.name.split(" ").slice(1).join(" ")}
                </span>
              </h1>

              <p className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {company.tagline || (isLakshmi 
                  ? "Authorized Ethical & Generics Pharmaceutical Distribution" 
                  : "Specialty Therapeutics, Critical Care & Institutional Supply")}
              </p>

              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                {company.description}
              </p>
            </div>

            {/* Operational Metrics Strip */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl glass-panel border border-slate-200/80 shadow-sm">
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Inventory</div>
                <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {isLakshmi ? "3,500+ SKUs" : "Cold-Chain Core"}
                </div>
              </div>
              <div className="space-y-0.5 border-x border-slate-200/80 px-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Network</div>
                <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {isLakshmi ? "1,400+ Retailers" : "Tertiary Hospitals"}
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Transit SLA</div>
                <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {isLakshmi ? "Same-Day Core" : "< 4hr Emergency"}
                </div>
              </div>
            </div>

            {/* Direct Digital Marketing CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#catalog-section"
                className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs text-white shadow-md transition-all duration-200 hover:scale-102 ${
                  isLakshmi 
                    ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/25" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/25"
                }`}
              >
                <span>Browse Products &amp; SKUs</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => openInquiry(null)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all duration-200 hover:scale-102"
              >
                <Send className="w-3.5 h-3.5 text-teal-600" />
                <span>Instant Wholesale Quote</span>
              </button>

              <a
                href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(company.shortName)}%20Trade%20Desk,%20we%20are%20a%20licensed%20healthcare%20buyer%20enquiring%20about%20your%20wholesale%20product%20catalog.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3.5 rounded-xl text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>WhatsApp Desk</span>
              </a>
            </div>

          </div>

          {/* Right Column: 3D Levitating Visual + Circular Stamp (bar-topas inspired stamp) */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
            
            {/* bar-topas.ch Inspired Rotating Circular Stamp Badge */}
            <div className="absolute -top-6 -right-4 sm:-top-8 sm:-right-6 z-30 pointer-events-none select-none">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center animate-spin-slow">
                <svg viewBox="0 0 200 200" className="w-full h-full text-slate-900 fill-current opacity-90">
                  <defs>
                    <path
                      id="pharma-stamp-circle"
                      d="M100,100 m-75,0 a75,75 0 1,1 150,0 a75,75 0 1,1 -150,0"
                    />
                  </defs>
                  <text className="text-[12px] font-mono font-bold uppercase tracking-widest fill-slate-800">
                    <textPath href="#pharma-stamp-circle">
                      CDSCO LICENSED · WHOLESALE B2B · {isLakshmi ? "EST. 1998" : "EST. 2005"} · 100% GENUINE ·
                    </textPath>
                  </text>
                </svg>

                {/* Center Stamp Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs shadow-md ${
                    isLakshmi ? "bg-teal-700" : "bg-blue-600"
                  }`}>
                    {isLakshmi ? "LK" : "KP"}
                  </div>
                </div>
              </div>
            </div>

            {/* 3D Floating Levitating Centerpiece */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full max-w-sm aspect-square flex items-center justify-center"
            >
              {/* Central Floating Image Card */}
              <div className="relative z-10 w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] rounded-3xl overflow-hidden glass-panel shadow-2xl border-2 border-white/90 group">
                <Image
                  src={heroImage}
                  alt={company.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 280px, 320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-white/10 pointer-events-none" />

                {/* Corner Seal */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-slate-800 border border-white/60 shadow-xs">
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    <span>2026 Core Catalog</span>
                  </span>
                </div>

                {/* Bottom Verification Tag */}
                <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-[11px]">Strictly Wholesale B2B</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    {company.shortName}
                  </span>
                </div>
              </div>

              {/* Floating Satellites */}
              <div className="absolute -left-4 top-1/4 z-20 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl glass-panel shadow-md border border-white/90 text-xs font-bold text-slate-800">
                <Truck className="w-3.5 h-3.5 text-teal-600" />
                <span>Daily Dispatch</span>
              </div>

              <div className="absolute -right-4 bottom-1/4 z-20 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl glass-panel shadow-md border border-white/90 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Batch Certificate</span>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
