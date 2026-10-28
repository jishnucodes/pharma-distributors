"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck, Award, Sparkles } from "lucide-react";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";

interface Partner {
  name: string;
  logoUrl?: string;
  category: string;
  authorizedSince: string;
}

const PARTNERS: Partner[] = [
  { name: "Cipla", logoUrl: "/logos/cipla.svg", category: "Respiratory & Anti-Infectives", authorizedSince: "1998" },
  { name: "Sun Pharma", logoUrl: "/logos/sunpharma.svg", category: "Cardiology & Diabetology", authorizedSince: "2001" },
  { name: "Micro Labs", logoUrl: "/logos/microlabs.svg", category: "Dolo 650 & Pain Management", authorizedSince: "1999" },
  { name: "GlaxoSmithKline", logoUrl: "/logos/gsk.svg", category: "Augmentin & Calpol", authorizedSince: "2003" },
  { name: "Rhine Biopharm", logoUrl: "/logos/rhine.svg", category: "Specialty Therapeutics", authorizedSince: "2010" },
  { name: "Dr. Reddy's Laboratories", category: "Oncology & Critical Care", authorizedSince: "2007" },
  { name: "Alkem Laboratories", category: "Anti-Bacterials & Gastro", authorizedSince: "2006" },
  { name: "Torrent Pharmaceuticals", category: "CNS & Cardiovascular", authorizedSince: "2009" },
];

interface KineticPartnerMarqueeProps {
  compact?: boolean;
}

export function KineticPartnerMarquee({ compact = false }: KineticPartnerMarqueeProps) {
  // Duplicate for seamless infinite marquee loop
  const duplicatedPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  if (compact) {
    return (
      <div className="pt-6 pb-2 w-full overflow-hidden relative">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-slate-500 font-bold">
            <Award className="w-3.5 h-3.5 text-teal-600" />
            <span>Authorized Manufacturer Alliances</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            Direct Commercial Supply Covenants
          </span>
        </div>

        {/* Marquee Container with Gradient Fade Edges */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-slate-50/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-slate-50/90 to-transparent z-10 pointer-events-none" />

          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-3 sm:gap-4 py-1">
            {duplicatedPartners.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl glass-panel border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-teal-500/50 transition-all duration-200 shrink-0 group"
              >
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-1 border border-slate-200/70 shrink-0 shadow-2xs group-hover:border-teal-500/40 transition-colors">
                  <ManufacturerLogo name={partner.name} logoUrl={partner.logoUrl} size="sm" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 tracking-tight group-hover:text-teal-700 transition-colors flex items-center gap-1">
                    <span>{partner.name}</span>
                    <ShieldCheck className="w-2.5 h-2.5 text-teal-600 shrink-0" />
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 truncate max-w-[140px]">
                    {partner.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-slate-50/70 border-y border-slate-200/80 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-slate-500 bg-white border border-slate-200 shadow-2xs">
          <Award className="w-3.5 h-3.5 text-teal-600" />
          <span>Direct Institutional Supply Agreements</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Authorized Manufacturer Alliances
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Verified direct regional wholesale distribution covenants with leading Indian &amp; multinational pharmaceutical innovators.
        </p>
      </div>

      {/* Marquee Container with Gradient Fade Edges */}
      <div className="relative w-full overflow-hidden">
        {/* Left and Right Fade Overlays */}
        <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />

        {/* Infinite Scroll Track */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-4 sm:gap-6 py-2">
          {duplicatedPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl glass-panel border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-500/50 transition-all duration-300 hover:scale-103 shrink-0 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 border border-slate-200/70 shrink-0 shadow-2xs group-hover:border-teal-500/40 transition-colors">
                <ManufacturerLogo name={partner.name} logoUrl={partner.logoUrl} size="sm" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 tracking-tight group-hover:text-teal-700 transition-colors flex items-center gap-1.5">
                  <span>{partner.name}</span>
                  <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
                </div>
                <div className="text-[10px] font-medium text-slate-400">
                  {partner.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
