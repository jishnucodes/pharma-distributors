"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Package, 
  ArrowRight, 
  Search, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  Award,
  X
} from "lucide-react";
import { Manufacturer, Company } from "@/types";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";

interface ManufacturersDirectoryViewProps {
  company: Company;
  manufacturers: Manufacturer[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function ManufacturersDirectoryView({
  company,
  manufacturers,
}: ManufacturersDirectoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const isLakshmi = company.slug === "lakshmi-pharma";

  const filtered = manufacturers.filter((mfg) =>
    mfg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mfg.partnershipDetails && mfg.partnershipDetails.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative pb-8 border-b border-slate-200">
        <div
          className={`absolute -top-10 -left-10 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isLakshmi ? "bg-emerald-400" : "bg-blue-400"
          }`}
        />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isLakshmi
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                    : "bg-blue-100 text-blue-900 border border-blue-200"
                }`}
              >
                {company.name} Authorized Network
              </span>
              <span className="text-xs text-slate-400 font-mono">Principal B2B Alliances</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Authorized Pharmaceutical Manufacturers
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Direct wholesale distribution agreements with certified research and generic drug manufacturers. Formulations are sourced under strict Good Distribution Practice (GDP) standards with complete batch release certification.
            </p>
          </div>

          {/* Quick Search Command Palette */}
          <div className="w-full md:w-80 shrink-0 space-y-1.5">
            <div className="relative group">
              <div
                className={`absolute -inset-0.5 rounded-2xl opacity-0 transition-opacity blur-sm ${
                  isFocused ? "opacity-100" : ""
                } ${
                  isLakshmi
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600"
                }`}
              />

              <div
                className={`relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl border transition-all ${
                  isFocused
                    ? isLakshmi
                      ? "border-teal-500 shadow-md ring-4 ring-teal-500/10"
                      : "border-blue-500 shadow-md ring-4 ring-blue-500/10"
                    : "border-slate-300 hover:border-slate-400"
                }`}
              >
                <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter manufacturers..."
                  className="w-full pl-2.5 pr-8 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden bg-transparent"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="mr-2.5 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-2 text-[11px] text-slate-400 font-mono">
              <span>Showing {filtered.length} of {manufacturers.length} partners</span>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-rose-600 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Manufacturers */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((mfg) => (
            <motion.div
              key={mfg.id}
              variants={cardVariants}
              layout
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:border-slate-300 hover:shadow-xl transition-all flex flex-col justify-between space-y-5 relative overflow-hidden"
            >
              {/* Subtle top edge glow on hover */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r ${
                  isLakshmi
                    ? "from-emerald-400 to-teal-500"
                    : "from-blue-500 to-indigo-600"
                }`}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <ManufacturerLogo name={mfg.name} logoUrl={mfg.logoUrl} size="lg" />
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Authorized</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-lg text-slate-900 tracking-tight group-hover:text-slate-950 transition-colors">
                    {mfg.name}
                  </h3>
                  {mfg.partnershipDetails ? (
                    <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                      {mfg.partnershipDetails}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 pt-1 italic">
                      Direct wholesale allocation partner
                    </p>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span>Catalog Formulations:</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">
                    {mfg.publishedProductCount ?? 0} listed
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <Link
                  href={`/${company.slug}/products?manufacturer=${mfg.slug}`}
                  className={`flex-1 text-center py-3 rounded-2xl text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-2 group-hover:shadow-md ${
                    isLakshmi
                      ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/10"
                      : "bg-blue-700 hover:bg-blue-800 shadow-blue-700/10"
                  }`}
                >
                  <span>View Catalog Formulations</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-900">No manufacturers found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No authorized manufacturer matched &quot;{searchTerm}&quot;. Try clearing your query to see all partners.
          </p>
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
          >
            Show all manufacturers
          </button>
        </div>
      )}
    </div>
  );
}
