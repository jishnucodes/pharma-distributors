"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  ArrowUpRight, 
  Activity, 
  ThermometerSnowflake,
  Search,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingCapsuleHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState<"all" | "lakshmi" | "kothittil">("all");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-4 inset-x-0 z-50 transition-all duration-300 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pointer-events-none`}
    >
      <div 
        className={`pointer-events-auto rounded-2xl transition-all duration-300 flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 ${
          scrolled 
            ? "glass-pill shadow-xl border border-slate-200/80 bg-white/90 backdrop-blur-xl" 
            : "glass-pill shadow-lg border border-white/80 bg-white/75 backdrop-blur-lg"
        }`}
      >
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-700 via-emerald-800 to-blue-900 flex items-center justify-center font-black text-white shadow-md text-base tracking-tight transition-transform duration-300 group-hover:scale-105">
              L&amp;K
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-slate-900">
                L &amp; K
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                2026 Core
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight">
              Integrated Pharma Distribution
            </p>
          </div>
        </Link>

        {/* Distributor Switcher Pills (Interactive) */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 rounded-full border border-slate-200/60 text-xs font-semibold">
          <Link
            href="/"
            onClick={() => setActiveNetwork("all")}
            className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              activeNetwork === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Overview</span>
          </Link>
          <Link
            href="/lakshmi-pharma"
            onClick={() => setActiveNetwork("lakshmi")}
            className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              activeNetwork === "lakshmi"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Lakshmi Pharma</span>
          </Link>
          <Link
            href="/kothittil-pharma"
            onClick={() => setActiveNetwork("kothittil")}
            className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              activeNetwork === "kothittil"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-blue-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>The Kothittil</span>
          </Link>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cold-Chain Telemetry Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50/80 border border-cyan-200/60 text-cyan-900 text-xs font-medium">
            <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
            <span className="font-mono font-bold text-[11px] text-cyan-800">2°C – 8°C</span>
            <span className="text-[10px] text-cyan-600 uppercase tracking-wider font-semibold">Active</span>
          </div>

          <Link
            href="/lakshmi-pharma/products"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all hover:scale-102"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search Catalog</span>
          </Link>

          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all hover:shadow-md hover:scale-102"
          >
            <Lock className="w-3 h-3 text-slate-300" />
            <span className="hidden sm:inline">Admin</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
