"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  ArrowRight, 
  Package, 
  ShieldCheck, 
  ThermometerSnowflake, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2,
  ExternalLink,
  PhoneCall
} from "lucide-react";

interface CompanySlide {
  id: "lakshmi" | "kothittil";
  companySlug: string;
  name: string;
  shortName: string;
  estYear: string;
  categoryBadge: string;
  headline: string;
  description: string;
  imageSrc: string;
  themeColor: "emerald" | "blue";
  stats: { label: string; value: string }[];
  keyMolecules: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  inquiryCta: { label: string; href: string };
}

const SLIDES: CompanySlide[] = [
  {
    id: "lakshmi",
    companySlug: "lakshmi-pharma",
    name: "Lakshmi Pharma",
    shortName: "Lakshmi",
    estYear: "1998",
    categoryBadge: "High-Volume Ethical & Generics",
    headline: "Daily Retail Pharmacy Restock & Essential Formulations",
    description: "Authorized wholesale distributor serving 1,400+ licensed retail pharmacies, clinics, and nursing homes across South India with same-day dispatch and 99.4% fulfillment precision.",
    imageSrc: "/assets/pharma_capsule.jpg",
    themeColor: "emerald",
    stats: [
      { label: "Active SKUs", value: "3,500+" },
      { label: "Retail Network", value: "1,400+ Pharmacies" },
      { label: "Dispatch Core", value: "Same-Day Logistics" },
      { label: "Fulfillment Rate", value: "99.4%" },
    ],
    keyMolecules: ["Dolo 650", "Augmentin 625", "Calpol 500", "Pantocid 40", "Azithral 500"],
    primaryCta: { label: "Browse Lakshmi Catalog", href: "/lakshmi-pharma/products" },
    secondaryCta: { label: "Enter Company Desk", href: "/lakshmi-pharma" },
    inquiryCta: { label: "Request Wholesale Price List", href: "/lakshmi-pharma/contact" },
  },
  {
    id: "kothittil",
    companySlug: "kothittil-pharma",
    name: "The Kothittil Pharmaceutical Distributor",
    shortName: "The Kothittil",
    estYear: "2005",
    categoryBadge: "Cold-Chain Biologics & Critical Care",
    headline: "Hospital Specialty Therapeutics & Cryo-Monitored Injections",
    description: "Mission-critical institutional distribution specializing in 2°C–8°C cold-chain logistics, cardiology, oncology, and emergency critical care lines for premier tertiary hospitals.",
    imageSrc: "/assets/pharma_vial.jpg",
    themeColor: "blue",
    stats: [
      { label: "Hospital SLAs", value: "< 4hr Emergency" },
      { label: "Storage Range", value: "2°C to 8°C Cryo" },
      { label: "Logistics Type", value: "Smart Reefer Pods" },
      { label: "Coverage", value: "Tertiary Hospitals" },
    ],
    keyMolecules: ["Human Insulin", "Monoclonal Antibodies", "Rabies Vaccine", "Meropenem 1g", "Enoxaparin"],
    primaryCta: { label: "Browse Kothittil Catalog", href: "/kothittil-pharma/products" },
    secondaryCta: { label: "Enter Company Desk", href: "/kothittil-pharma" },
    inquiryCta: { label: "Emergency Hospital Inquiry", href: "/kothittil-pharma/contact" },
  },
];

export function CompanyCatalogCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto-advance slides every 7 seconds
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const slide = SLIDES[currentIndex];
  const isEmerald = slide.themeColor === "emerald";

  return (
    <div 
      className="relative w-full max-w-6xl mx-auto"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Slide Navigation Tabs / Pills */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="inline-flex p-1.5 rounded-2xl glass-pill border border-slate-200/90 shadow-xs gap-1.5">
          {SLIDES.map((s, index) => {
            const isActive = currentIndex === index;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(index)}
                className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                  isActive ? "text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCarouselTab"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/80"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.themeColor === "emerald" ? "bg-teal-500" : "bg-blue-600"}`} />
                  <span className="font-mono text-[10px] text-slate-400">0{index + 1}</span>
                  <span className="tracking-tight">{s.shortName}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Carousel Prev/Next & Indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
            aria-label="Previous company catalog"
            className="w-9 h-9 rounded-xl glass-pill border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white shadow-2xs transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-400 px-1">
            0{currentIndex + 1} / 0{SLIDES.length}
          </span>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % SLIDES.length)}
            aria-label="Next company catalog"
            className="w-9 h-9 rounded-xl glass-pill border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white shadow-2xs transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Carousel Showcase Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={`relative rounded-3xl p-6 sm:p-8 lg:p-10 glass-panel border transition-all duration-500 shadow-xl overflow-hidden ${
            isEmerald 
              ? "border-emerald-500/25 shadow-emerald-950/5" 
              : "border-blue-500/25 shadow-blue-950/5"
          }`}
        >
          {/* Subtle Dynamic Ambient Color Splash */}
          <div 
            className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40 transition-all duration-700 ${
              isEmerald ? "bg-teal-300" : "bg-blue-300"
            }`}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5 text-left">
              
              {/* Badges strip */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isEmerald 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                    : "bg-blue-50 text-blue-800 border border-blue-200"
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{slide.categoryBadge}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  Est. {slide.estYear}
                </span>

                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  CDSCO Verified B2B
                </span>
              </div>

              {/* Title & Headline */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {slide.name}
                </h2>
                <p className={`text-base sm:text-lg font-bold tracking-tight ${
                  isEmerald ? "text-teal-700" : "text-blue-700"
                }`}>
                  {slide.headline}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  {slide.description}
                </p>
              </div>

              {/* Molecule Chips (Quick Catalog Taste) */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Featured Wholesale Molecules
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {slide.keyMolecules.map((molecule, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/90 text-slate-700 border border-slate-200/90 shadow-2xs"
                    >
                      {molecule}
                    </span>
                  ))}
                  <Link
                    href={slide.primaryCta.href}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-teal-700 hover:text-teal-900 underline underline-offset-2 flex items-center gap-1"
                  >
                    <span>+ more</span>
                  </Link>
                </div>
              </div>

              {/* Key Operational Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/70">
                {slide.stats.map((stat, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white/60 border border-slate-200/60 shadow-2xs">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 truncate">
                      {stat.label}
                    </div>
                    <div className="text-sm font-black text-slate-900 tracking-tight">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons: Browse Catalog & Inquire */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={slide.primaryCta.href}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white shadow-md transition-all duration-200 hover:scale-102 ${
                    isEmerald 
                      ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/25" 
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/25"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>{slide.primaryCta.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={slide.inquiryCta.href}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all duration-200 hover:scale-102"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                  <span>{slide.inquiryCta.label}</span>
                </Link>

                <Link
                  href={slide.secondaryCta.href}
                  className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-2"
                >
                  <span>{slide.secondaryCta.label}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </div>

            </div>

            {/* Right Visual Column: High-Res 3D Pharmaceutical Centerpiece */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-[260px] sm:w-[320px] aspect-square rounded-3xl overflow-hidden glass-panel shadow-2xl border-2 border-white/90 group">
                <Image
                  src={slide.imageSrc}
                  alt={slide.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 260px, 320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-white/10 pointer-events-none" />

                {/* Corner Status Pill */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-slate-800 border border-white/60 shadow-xs">
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    <span>2026 Live Core</span>
                  </span>
                </div>

                {/* Bottom Card Summary */}
                <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-[11px]">Real-Time Stock Verified</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    {slide.shortName}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
