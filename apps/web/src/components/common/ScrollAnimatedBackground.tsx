"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { AntigravityFlowCanvas } from "@/components/canvas/AntigravityFlowCanvas";

interface ScrollAnimatedBackgroundProps {
  companySlug?: string;
  variant?: "lakshmi" | "kothittil" | "home";
  enable3DFlow?: boolean;
}

export function ScrollAnimatedBackground({
  companySlug,
  variant,
  enable3DFlow = true,
}: ScrollAnimatedBackgroundProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isLakshmi = variant === "lakshmi" || companySlug === "lakshmi-pharma";
  const isKothittil = variant === "kothittil" || companySlug === "kothittil-pharma";

  // Spring-smoothed scroll progress for cinematic, jitter-free parallax
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  // Parallax motion values driven by user scroll
  const bgImageY = useTransform(smoothProgress, [0, 1], ["0%", "-8%"]);
  const bgImageScale = useTransform(smoothProgress, [0, 1], [1.02, 1.1]);
  const bgImageRotate = useTransform(smoothProgress, [0, 1], [0, isLakshmi ? -1.5 : 1.5]);

  // Secondary depth layers (multiplane parallax effect)
  const layerSlowY = useTransform(smoothProgress, [0, 1], ["0px", "-60px"]);
  const layerFastY = useTransform(smoothProgress, [0, 1], ["0px", "-140px"]);
  const auraGlowOpacity = useTransform(smoothProgress, [0, 0.5, 1], [0.45, 0.7, 0.45]);

  // Determine background art based on distributor theme
  const bgImageSrc = isKothittil
    ? "/assets/pharma_vial.jpg"
    : "/assets/pharma_capsule.jpg";

  if (!isMounted) {
    return (
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-slate-50/30" />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-20 overflow-hidden select-none"
    >
      {/* 1. SCROLL-ANIMATED BACKGROUND IMAGE CANVAS */}
      <motion.div
        style={{
          y: bgImageY,
          scale: bgImageScale,
          rotate: bgImageRotate,
        }}
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
      >
        <div className="relative w-full h-full">
          {/* High-Resolution 3D Pharmaceutical Studio Image */}
          <Image
            src={bgImageSrc}
            alt="Pharmaceutical Technology Ambient Visual"
            fill
            sizes="100vw"
            priority
            quality={90}
            className={`object-cover transition-opacity duration-1000 ${
              isLakshmi
                ? "object-[85%_20%] opacity-28 sm:opacity-36"
                : "object-[85%_25%] opacity-26 sm:opacity-34"
            }`}
          />

          {/* Radial Light Vignette & Fade to prevent contrast clash with content */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-50/70 to-slate-50/95" />
          
          {/* Subtle Studio Lighting Wash */}
          <div
            className={`absolute inset-0 bg-gradient-to-b ${
              isLakshmi
                ? "from-emerald-50/30 via-slate-50/75 to-teal-50/40"
                : "from-blue-50/30 via-slate-50/75 to-indigo-50/40"
            }`}
          />
        </div>
      </motion.div>

      {/* 2. ATMOSPHERIC AURORA LIGHT BLOOMS (Scroll-Modulated) */}
      <motion.div
        style={{ opacity: auraGlowOpacity, y: layerSlowY }}
        className="absolute inset-0"
      >
        {/* Primary Bloom */}
        <div
          className={`absolute -top-32 -left-32 w-[420px] h-[420px] sm:w-[620px] sm:h-[620px] rounded-full blur-3xl ${
            isLakshmi ? "aurora-teal opacity-50" : "aurora-blue opacity-50"
          }`}
        />

        {/* Secondary Bloom */}
        <div
          className={`absolute top-1/3 -right-32 w-[380px] h-[380px] sm:w-[540px] sm:h-[540px] rounded-full blur-3xl ${
            isLakshmi ? "aurora-teal opacity-40" : "aurora-indigo opacity-40"
          }`}
        />

        {/* Tertiary Bottom Bloom */}
        <div
          className={`absolute bottom-[-100px] left-1/4 w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] rounded-full blur-3xl ${
            isLakshmi ? "aurora-teal opacity-35" : "aurora-blue opacity-35"
          }`}
        />
      </motion.div>

      {/* 3. FROSTED DIFFUSION VEIL - Guarantees 100% Text & Glassmorphism Readability */}
      <div className="absolute inset-0 backdrop-blur-[0.5px] bg-white/45 sm:bg-white/35" />

      {/* 4. REAL-TIME 3D WEBGL ANTIGRAVITY FLOW CANVAS (Three.js Molecular Mesh) */}
      {enable3DFlow && (
        <AntigravityFlowCanvas
          variant={variant}
          companySlug={companySlug}
          interactive={true}
          opacity={0.92}
        />
      )}

      {/* 5. MULTIPLANE KINETIC FLOATING MOLECULAR ACCENTS */}
      <motion.div
        style={{ y: layerFastY }}
        className="absolute inset-0 hidden sm:block pointer-events-none"
      >
        {/* Floating Ring 1 (Top-Left) */}
        <div className="absolute top-[18%] left-[8%] w-24 h-24 rounded-full border border-teal-500/15 animate-spin-slow opacity-60" />
        
        {/* Floating Orb 1 */}
        <div className="absolute top-[22%] left-[10%] w-2 h-2 rounded-full bg-teal-400/40 blur-xs" />

        {/* Floating Ring 2 (Center-Right) */}
        <div className="absolute top-[48%] right-[12%] w-36 h-36 rounded-full border border-emerald-500/10 animate-reverse-spin opacity-50" />

        {/* Floating Orb 2 */}
        <div className="absolute top-[52%] right-[14%] w-3 h-3 rounded-full bg-emerald-400/30 blur-xs" />

        {/* Floating Ring 3 (Bottom-Left) */}
        <div className="absolute top-[75%] left-[15%] w-20 h-20 rounded-full border border-cyan-500/15 animate-spin-slow opacity-50" />
      </motion.div>
    </div>
  );
}
