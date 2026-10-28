"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ThermometerSnowflake, 
  ShieldCheck, 
  Boxes, 
  Truck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  Activity,
  Layers,
  FileCheck,
  Compass
} from "lucide-react";
import { Company } from "@/types";

interface PharmaSpatialVaultProps {
  company: Company;
}

interface Station {
  id: string;
  name: string;
  tagline: string;
  shortDesc: string;
  telemetry: string;
  telemetryStatus: string;
  sla: string;
  targetCategory: string;
  compliancePill: string;
  highlights: string[];
}

const STATIONS: Station[] = [
  {
    id: "cryo-vault",
    name: "Station 01 · 2°C–8°C Cold-Chain Cryo-Vault",
    tagline: "Biologics, Insulins, Vaccines & Oncology Monoclonals",
    shortDesc: "Triple-redundant cryogenic refrigeration chambers with real-time IoT temperature telemetry and emergency nitrogen backup.",
    telemetry: "3.8°C",
    telemetryStatus: "OPTIMAL (Target: 2°C – 8°C)",
    sla: "Zero Cold-Chain Deviation Guarantee",
    targetCategory: "Vial",
    compliancePill: "WHO-GDP & CDSCO Calibrated",
    highlights: [
      "Digital dataloggers with 15-minute sync intervals",
      "Phase-change insulated shippers for transit",
      "Direct tertiary hospital ICU consignment protocols",
    ],
  },
  {
    id: "generics-rack",
    name: "Station 02 · High-Volume Ethical Generics Shelf",
    tagline: "Daily Retail Pharmacy Restock & Essential Formulations",
    shortDesc: "High-density palletized storage for over 3,500 fast-moving oral solid dosages, analgesics, antibiotics, and cardiovascular lines.",
    telemetry: "22.4°C / 45% RH",
    telemetryStatus: "CONTROLLED ROOM TEMP",
    sla: "99.4% Fulfillment Precision",
    targetCategory: "Tablet",
    compliancePill: "FIFO & FEFO Batch Rotation",
    highlights: [
      "Automated picking barcode verification",
      "Zero counterfeit sealed manufacturer shippers",
      "Immediate batch allocation for 1,400+ pharmacies",
    ],
  },
  {
    id: "compliance-desk",
    name: "Station 03 · Quality Assurance & CDSCO Desk",
    tagline: "Form 20B / 21B Validation & Batch COA Release",
    shortDesc: "Central verification portal authenticating every manufacturer consignment with official Certificate of Analysis (COA) records.",
    telemetry: "100% AUDITED",
    telemetryStatus: "VERIFIED ACTIVE",
    sla: "Zero Delay Documented Compliance",
    targetCategory: "ALL",
    compliancePill: "CDSCO License Form 20B/21B",
    highlights: [
      "Serialized QR drug verification registry",
      "GST-compliant batch invoice generation",
      "Permanent audit trail archive for regulatory scrutiny",
    ],
  },
  {
    id: "emergency-bay",
    name: "Station 04 · Rapid Emergency Transit Bay",
    tagline: "Critical Care Logistics & Express Hospital Dispatch",
    shortDesc: "Dedicated rapid-loading logistics bay ensuring life-saving ICU infusions, antivenoms, and critical care antibiotics dispatch within hours.",
    telemetry: "< 4 HOURS",
    telemetryStatus: "EMERGENCY SLA ACTIVE",
    sla: "24/7 Priority Emergency Channel",
    targetCategory: "Injection",
    compliancePill: "Emergency Critical Care Protocol",
    highlights: [
      "Priority triage dispatch for hospital ICUs",
      "Live GPS fleet route optimization across South India",
      "Temperature datalogger printout upon receipt",
    ],
  },
];

export function PharmaSpatialVault({ company }: PharmaSpatialVaultProps) {
  const isLakshmi = company.slug === "lakshmi-pharma";
  const [activeStationId, setActiveStationId] = useState<string>("cryo-vault");
  const [exploredStations, setExploredStations] = useState<Set<string>>(
    new Set(["cryo-vault"])
  );

  const activeStation =
    STATIONS.find((s) => s.id === activeStationId) || STATIONS[0];

  const handleSelectStation = (id: string) => {
    setActiveStationId(id);
    setExploredStations((prev) => new Set(prev).add(id));
  };

  const scrollToCatalog = (category: string) => {
    const el = document.getElementById("catalog-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const discoveryCount = exploredStations.size;

  return (
    <section className="relative rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-stone-800 text-white p-6 sm:p-10 shadow-2xl overflow-hidden space-y-8">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Spatial Discovery Counter (Inspired by juliamoresco.com.br discovery tracker) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-stone-800 pb-6 relative z-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-white/10 text-teal-300 border border-white/15">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>Interactive Cleanroom &amp; Warehouse Vault</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-serif">
            Explore {company.shortName}&apos;s Logistics Infrastructure
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 max-w-2xl">
            Click across our verified logistics zones to inspect cold-chain telemetry, high-volume generic shelving, and CDSCO compliance verification desks.
          </p>
        </div>

        {/* Discovery Progress Meter */}
        <div className="flex items-center gap-3 bg-stone-800/80 border border-stone-700/80 px-4 py-2.5 rounded-2xl shrink-0">
          <Activity className="w-4 h-4 text-teal-400 animate-pulse" />
          <div className="text-xs font-mono">
            <span className="text-stone-400 block text-[10px]">EXPLORATION STATUS</span>
            <span className="font-bold text-white">
              {discoveryCount} of 4 Stations Discovered
            </span>
          </div>
          <div className="w-16 h-2 bg-stone-700 rounded-full overflow-hidden ml-2">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${(discoveryCount / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Spatial Visual & Interactive Hotspot Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Area: Visual 3D Spatial Cleanroom View with Hotspots */}
        <div className="lg:col-span-7 relative aspect-[16/10] rounded-3xl overflow-hidden border border-stone-800 bg-stone-900/60 shadow-inner group">
          <Image
            src="/assets/pharma_warehouse.jpg"
            alt="Pharmaceutical Logistics Cleanroom"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover opacity-75 group-hover:opacity-85 transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

          {/* Interactive Hotspot Pings on the Warehouse Map */}
          {/* Hotspot 1: Cryo-Vault */}
          <button
            onClick={() => handleSelectStation("cryo-vault")}
            className={`absolute top-[35%] left-[25%] -translate-x-1/2 -translate-y-1/2 z-20 group/ping focus:outline-hidden ${
              activeStationId === "cryo-vault" ? "scale-110" : "hover:scale-105"
            }`}
          >
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className={`relative inline-flex rounded-full h-7 w-7 items-center justify-center text-[10px] font-mono font-bold text-white shadow-lg border ${
                activeStationId === "cryo-vault" ? "bg-cyan-500 border-white ring-4 ring-cyan-500/30" : "bg-cyan-600 border-cyan-300"
              }`}>
                01
              </span>
            </span>
            <span className="absolute left-1/2 -translate-x-1/2 top-9 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-stone-900/90 text-cyan-300 border border-cyan-500/40 whitespace-nowrap shadow-md">
              Cryo-Vault 2°C–8°C
            </span>
          </button>

          {/* Hotspot 2: Generics Shelf */}
          <button
            onClick={() => handleSelectStation("generics-rack")}
            className={`absolute top-[48%] left-[68%] -translate-x-1/2 -translate-y-1/2 z-20 group/ping focus:outline-hidden ${
              activeStationId === "generics-rack" ? "scale-110" : "hover:scale-105"
            }`}
          >
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className={`relative inline-flex rounded-full h-7 w-7 items-center justify-center text-[10px] font-mono font-bold text-white shadow-lg border ${
                activeStationId === "generics-rack" ? "bg-teal-500 border-white ring-4 ring-teal-500/30" : "bg-teal-600 border-teal-300"
              }`}>
                02
              </span>
            </span>
            <span className="absolute left-1/2 -translate-x-1/2 top-9 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-stone-900/90 text-teal-300 border border-teal-500/40 whitespace-nowrap shadow-md">
              Generics Shelving
            </span>
          </button>

          {/* Hotspot 3: Compliance Desk */}
          <button
            onClick={() => handleSelectStation("compliance-desk")}
            className={`absolute top-[68%] left-[32%] -translate-x-1/2 -translate-y-1/2 z-20 group/ping focus:outline-hidden ${
              activeStationId === "compliance-desk" ? "scale-110" : "hover:scale-105"
            }`}
          >
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className={`relative inline-flex rounded-full h-7 w-7 items-center justify-center text-[10px] font-mono font-bold text-white shadow-lg border ${
                activeStationId === "compliance-desk" ? "bg-amber-500 border-white ring-4 ring-amber-500/30" : "bg-amber-600 border-amber-300"
              }`}>
                03
              </span>
            </span>
            <span className="absolute left-1/2 -translate-x-1/2 top-9 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-stone-900/90 text-amber-300 border border-amber-500/40 whitespace-nowrap shadow-md">
              QA / CDSCO Desk
            </span>
          </button>

          {/* Hotspot 4: Transit Bay */}
          <button
            onClick={() => handleSelectStation("emergency-bay")}
            className={`absolute top-[72%] left-[82%] -translate-x-1/2 -translate-y-1/2 z-20 group/ping focus:outline-hidden ${
              activeStationId === "emergency-bay" ? "scale-110" : "hover:scale-105"
            }`}
          >
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className={`relative inline-flex rounded-full h-7 w-7 items-center justify-center text-[10px] font-mono font-bold text-white shadow-lg border ${
                activeStationId === "emergency-bay" ? "bg-blue-500 border-white ring-4 ring-blue-500/30" : "bg-blue-600 border-blue-300"
              }`}>
                04
              </span>
            </span>
            <span className="absolute left-1/2 -translate-x-1/2 top-9 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-stone-900/90 text-blue-300 border border-blue-500/40 whitespace-nowrap shadow-md">
              Express Transit Bay
            </span>
          </button>

          {/* Bottom Overlay Hint */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-stone-400 bg-stone-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-stone-800">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Interactive Telemetry: Active Station {activeStation.name.split("·")[0]}</span>
            </span>
            <span className="font-bold text-white">{activeStation.telemetry}</span>
          </div>
        </div>

        {/* Right Area: Dynamic Station Detail Dossier Inspector */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-stone-900/80 border border-stone-800 p-6 sm:p-8 rounded-3xl backdrop-blur-md">
          
          {/* Station Selector Tab Bar */}
          <div className="grid grid-cols-4 gap-2">
            {STATIONS.map((s, idx) => {
              const isSelected = activeStationId === s.id;
              const isExplored = exploredStations.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectStation(s.id)}
                  className={`py-2 px-2 rounded-xl text-center font-mono text-xs font-bold transition-all border ${
                    isSelected
                      ? "bg-teal-600 text-white border-teal-400 shadow-md scale-102"
                      : isExplored
                      ? "bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700"
                      : "bg-stone-800/40 text-stone-500 border-stone-800 hover:text-stone-300"
                  }`}
                >
                  0{idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Station Information */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>{activeStation.compliancePill}</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {activeStation.name}
              </h3>
              <p className="text-xs font-mono font-bold text-teal-400">
                {activeStation.tagline}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {activeStation.shortDesc}
            </p>

            {/* Live Telemetry Data Box */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800">
                <span className="text-[10px] font-mono font-bold text-stone-400 block uppercase">
                  LIVE SENSOR STATUS
                </span>
                <span className="text-base font-black text-white font-mono mt-0.5 block">
                  {activeStation.telemetry}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 block">
                  {activeStation.telemetryStatus}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800">
                <span className="text-[10px] font-mono font-bold text-stone-400 block uppercase">
                  SERVICE COMMITMENT
                </span>
                <span className="text-xs font-bold text-white mt-1 block">
                  {activeStation.sla}
                </span>
              </div>
            </div>

            {/* Bullet Highlights */}
            <div className="space-y-1.5 pt-2">
              {activeStation.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-stone-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action: Link into Catalog or Inquiry Desk */}
          <div className="pt-4 border-t border-stone-800 flex items-center gap-3">
            <button
              onClick={() => scrollToCatalog(activeStation.targetCategory)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                isLakshmi ? "bg-teal-600 hover:bg-teal-500" : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              <span>Explore Formulations at this Station</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </section>
  );
}
