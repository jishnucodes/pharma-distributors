"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  ShieldCheck,
  Truck,
  MapPin,
  Clock,
  Phone,
  Mail,
  Award,
  FileText,
  ArrowRight,
  CheckCircle2,
  ThermometerSnowflake,
  Copy,
  Check,
  Sparkles,
  Activity,
  Zap,
} from "lucide-react";
import { Company } from "@/types";

interface CompanyAboutViewProps {
  company: Company;
}

export function CompanyAboutView({ company }: CompanyAboutViewProps) {
  const isLakshmi = company.slug === "lakshmi-pharma";
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10"
    >
      {/* Header with Ambient Glow & Modern Typography */}
      <div className="relative pb-8 border-b border-slate-200">
        <div
          className={`absolute -top-12 -left-12 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isLakshmi ? "bg-emerald-400" : "bg-blue-400"
          }`}
        />

        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isLakshmi
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                  : "bg-blue-100 text-blue-900 border border-blue-200"
              }`}
            >
              Enterprise Profile &amp; Regulatory Credentials
            </span>
            <span className="text-xs text-slate-400 font-mono">Good Distribution Practice (GDP) Certified</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            About {company.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            {company.description}
          </p>

          {/* Quick Metrics Bar with 2026 Glassmorphism */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4">
            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs space-y-1 hover:shadow-md transition-shadow">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Order SLA
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                &lt; 24h
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Same-Day Dispatch Guarantee</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs space-y-1 hover:shadow-md transition-shadow">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Cold Chain
              </span>
              <span className={`text-xl sm:text-2xl font-black tracking-tight ${isLakshmi ? "text-teal-700" : "text-blue-700"}`}>
                2°C – 8°C
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Continuous Calibration</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs space-y-1 hover:shadow-md transition-shadow">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Traceability
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                100%
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Barcode Verified Batches</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs space-y-1 hover:shadow-md transition-shadow">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Licensing
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
                20B &amp; 21B
              </span>
              <p className="text-[10px] text-slate-400 font-medium">CDSCO Compliant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Facts & Logistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Card 1: Logistics & Storage Infrastructure */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-7 space-y-5 shadow-xs hover:shadow-xl transition-all relative overflow-hidden"
        >
          <div
            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
              isLakshmi ? "from-emerald-400 to-teal-500" : "from-blue-500 to-indigo-600"
            }`}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
              <div className={`p-2 rounded-xl ${isLakshmi ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-base font-black tracking-tight">Distribution &amp; Cold Storage</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active GDP Fleet</span>
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
            Operating temperature-mapped central warehouses with dedicated cold rooms calibrated continuously between 2°C and 8°C. Reefer dispatch vehicles guarantee unbroken cold-chain delivery for sensitive biologicals, vaccines, and critical care injectables.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 space-y-3 font-medium">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500">Dispatch SLA:</span>
              <span className="font-bold text-slate-900">Same-Day / Under 24h</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500">Batch Traceability:</span>
              <span className="font-bold text-slate-900">100% Barcode &amp; Batch Tracked</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500">Cold Chain Audit:</span>
              <span className={`font-bold ${isLakshmi ? "text-teal-700" : "text-blue-700"}`}>Continuous NIST-Traceable Loggers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Fleet Security:</span>
              <span className="font-bold text-slate-900">GPS Monitored Reefer Trucks</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Regulatory Compliance */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-7 space-y-5 shadow-xs hover:shadow-xl transition-all relative overflow-hidden"
        >
          <div
            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
              isLakshmi ? "from-teal-400 to-cyan-500" : "from-indigo-500 to-blue-600"
            }`}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-base font-black tracking-tight">Licensing &amp; Compliance</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              CDSCO / State FDA
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
            Holding active Form 20B (allopathic non-biologicals) and Form 21B (biologicals and special schedule drugs) wholesale licenses under the Drugs and Cosmetics Act and Rules.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-400">Drug License (DL): </span>
                <span className="font-bold text-slate-800">{company.drugLicenseNo || "KL-2024-REG"}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy("dl", company.drugLicenseNo || "KL-2024-REG")}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                title="Copy License Number"
              >
                {copiedField === "dl" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-400">GST Registration: </span>
                <span className="font-bold text-slate-800">{company.gstin || "32AAAAA0000A1Z5"}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy("gstin", company.gstin || "32AAAAA0000A1Z5")}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                title="Copy GSTIN"
              >
                {copiedField === "gstin" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <div>
                <span className="text-slate-400">Operating Status: </span>
                <span className="text-emerald-700 font-bold">Active, Verified &amp; Audit Ready</span>
              </div>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Coverage Areas Details */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-7 sm:p-9 space-y-5 shadow-xs hover:shadow-lg transition-all"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isLakshmi ? "bg-teal-50 text-teal-700" : "bg-blue-50 text-blue-700"}`}>
              <MapPin className="w-4 h-4" />
            </div>
            <span>Service Radius &amp; Institutional Supply Coverage</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
            Direct B2B Hospital Logistics
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {company.serviceAreas}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-2 text-xs sm:text-sm">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>Central Warehouse Facility</span>
            </span>
            <p className="text-slate-600 pt-0.5 leading-relaxed">{company.address}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-2 text-xs sm:text-sm">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Commercial Trade Desk Hours</span>
            </span>
            <p className="text-slate-600 pt-0.5 leading-relaxed">{company.businessHours}</p>
          </div>
        </div>
      </motion.div>

      {/* Action CTA */}
      <div className="text-center pt-2">
        <Link
          href={`/${company.slug}/contact`}
          className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-xl ${
            isLakshmi
              ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20"
              : "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
          }`}
        >
          <span>Connect with {company.shortName}&apos;s Trade Desk</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
