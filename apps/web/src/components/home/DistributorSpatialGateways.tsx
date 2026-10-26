"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Package, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Truck, 
  ThermometerSnowflake, 
  Sparkles,
  Building2,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

interface GatewayCardProps {
  slug: string;
  name: string;
  estYear: string;
  badgeLabel: string;
  themeColor: "emerald" | "blue";
  tagline: string;
  description: string;
  serviceAreas: string;
  highlights: string[];
  phone: string;
  catalogCount: string;
  fulfillmentRate: string;
  catalogUrl: string;
  profileUrl: string;
}

function SpatialCard({
  slug,
  name,
  estYear,
  badgeLabel,
  themeColor,
  tagline,
  description,
  serviceAreas,
  highlights,
  phone,
  catalogCount,
  fulfillmentRate,
  catalogUrl,
  profileUrl,
}: GatewayCardProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const isEmerald = themeColor === "emerald";

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-3xl p-8 sm:p-10 transition-all duration-500 overflow-hidden glass-panel border ${
        isEmerald 
          ? "border-emerald-500/25 hover:border-emerald-600/60 hover:shadow-glow-teal" 
          : "border-blue-500/25 hover:border-blue-600/60 hover:shadow-glow-blue"
      } shadow-xl hover:-translate-y-1.5 flex flex-col justify-between`}
    >
      {/* Interactive Cursor Spotlight Glare */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
        style={{
          background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, ${
            isEmerald ? "rgba(16, 185, 129, 0.12)" : "rgba(37, 99, 235, 0.12)"
          }, transparent 80%)`,
        }}
      />

      {/* Decorative Background Blob */}
      <div 
        className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-125 ${
          isEmerald ? "bg-emerald-100/60" : "bg-blue-100/60"
        }`} 
      />

      <div className="space-y-6 relative z-10">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span 
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight border ${
              isEmerald 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200/80" 
                : "bg-blue-50 text-blue-800 border-blue-200/80"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isEmerald ? "bg-emerald-500 animate-pulse" : "bg-blue-500 animate-pulse"}`} />
            <span>{badgeLabel}</span>
          </span>

          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-slate-100/80 text-slate-500 border border-slate-200/60">
            Est. {estYear}
          </span>
        </div>

        {/* Company Title */}
        <div>
          <h3 className={`text-2xl sm:text-3xl font-black text-slate-900 tracking-tight transition-colors duration-200 ${
            isEmerald ? "group-hover:text-teal-700" : "group-hover:text-blue-700"
          }`}>
            {name}
          </h3>
          <p className={`text-xs sm:text-sm font-bold mt-1 ${isEmerald ? "text-emerald-700" : "text-blue-700"}`}>
            {tagline}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {description}
        </p>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inventory Depth</div>
            <div className="text-base font-black text-slate-800 tracking-tight">{catalogCount}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order SLA</div>
            <div className="text-base font-black text-slate-800 tracking-tight">{fulfillmentRate}</div>
          </div>
        </div>

        {/* Highlights Tags */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Dispatched Formulations
          </div>
          <div className="flex flex-wrap gap-1.5">
            {highlights.map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Coverage & Contact Details */}
        <div className="space-y-2 pt-3 border-t border-slate-200/60 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800 truncate">{serviceAreas}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800">{phone}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-8 flex flex-col sm:flex-row items-center gap-3 relative z-10">
        <Link
          href={catalogUrl}
          className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-xs text-white shadow-md text-center transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-102 ${
            isEmerald 
              ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20" 
              : "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Browse {name.split(" ")[0]} Catalog</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>

        <Link
          href={profileUrl}
          className="w-full sm:w-auto py-3.5 px-5 rounded-xl font-semibold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs text-center transition-all duration-200 flex items-center justify-center gap-1.5 hover:scale-102"
        >
          <span>Distributor Profile</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}

export function DistributorSpatialGateways() {
  return (
    <section className="relative py-20 bg-slate-50/50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Dual Commercial Distribution Desks</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Two Established Distributors • One Unified Network
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Choose an active distributor desk to explore dedicated inventory, manufacturer authorizations, geographic routes, and wholesale commercial lines.
          </p>
        </div>

        {/* 2 Spatial Gateway Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <SpatialCard
            slug="lakshmi-pharma"
            name="Lakshmi Pharma"
            estYear="1998"
            badgeLabel="Ethical & Generics Division"
            themeColor="emerald"
            tagline="Authorized High-Velocity Ethical Pharmaceutical Distribution"
            description="Serving over 1,400 retail pharmacies, nursing homes, and clinics across South India. High-volume generic inventory, daily dispatch lines, and strict batch temperature tracking."
            serviceAreas="Central Kerala & Tamil Nadu (Coimbatore Corridor)"
            highlights={["Dolo 650", "Calpol 650", "Augmentin 625 Duo", "Rhinex Cold", "Pantocid 40"]}
            phone="+91 484 235 6789"
            catalogCount="2,400+ Active SKUs"
            fulfillmentRate="99.4% Same-Day Dispatch"
            catalogUrl="/lakshmi-pharma/products"
            profileUrl="/lakshmi-pharma"
          />

          <SpatialCard
            slug="kothittil-pharma"
            name="The Kothittil Pharmaceutical Distributor"
            estYear="2005"
            badgeLabel="Specialty & Critical Care Division"
            themeColor="blue"
            tagline="Specialty Therapeutics, Critical Care & Cold-Chain Institutional Supply"
            description="Specializing in validated 2°C–8°C cold-chain logistics, cardiology, diabetology, and oncology institutional hospital supply. Verified batch compliance and zero-delay critical care fulfillment."
            serviceAreas="South Kerala & Karnataka (Bengaluru Urban)"
            highlights={["Moxikind-CV 625", "Glycomet 500 SR", "Pantocid 40", "Insulin Analogs", "Onco-Injectables"]}
            phone="+91 471 245 8890"
            catalogCount="1,850+ Specialty SKUs"
            fulfillmentRate="100% Validated Cold Chain"
            catalogUrl="/kothittil-pharma/products"
            profileUrl="/kothittil-pharma"
          />
        </div>

      </div>
    </section>
  );
}
