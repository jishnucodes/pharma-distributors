"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ExternalLink, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight,
  LayoutGrid,
  List,
  ShieldCheck,
  ThermometerSnowflake,
  Package,
  Layers,
  Building2,
  Send,
  MessageCircle,
  Check,
  Plus,
  ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";
import { useInquiry } from "@/components/inquiry/InquiryContext";

interface ProductTableProps {
  products: Product[];
  companySlug: string;
  onEnquire: (product: Product) => void;
  accentColor?: string;
}

export function ProductTable({
  products,
  companySlug,
  onEnquire,
  accentColor = "teal",
}: ProductTableProps) {
  const isTeal = accentColor === "teal";
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [mobileTableSubMode, setMobileTableSubMode] = useState<"cards" | "swipe">("cards");
  const { addItem, removeItem, isInTray, openInquiry } = useInquiry();

  const toggleTray = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInTray(product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* View Switcher & Counter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 tracking-tight">Catalog View:</span>
          <div className="p-1 rounded-2xl glass-panel flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? isTeal
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Glass Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "table"
                  ? isTeal
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Spec Table</span>
            </button>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-500 font-medium">
          Showing {products.length} formulations
        </span>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          /* ============================================================ */
          /* 1. LIQUID GLASS 3D SPATIAL GRID VIEW                         */
          /* ============================================================ */
          <motion.div
            key="grid-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {products.map((product, index) => {
              const compositionString = product.ingredients
                .map((i) => `${i.name} ${i.quantity} ${i.unit}`)
                .join(" + ");

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  {/* Subtle top edge glow on hover */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r ${
                      isTeal
                        ? "from-emerald-400 via-teal-500 to-cyan-500"
                        : "from-blue-500 via-indigo-600 to-cyan-500"
                    }`}
                  />

                  <div className="space-y-3.5">
                    {/* Top Row: Dosage Form & Verified Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="glass-pill px-3 py-1 rounded-full text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        {product.dosageForm} &bull; {product.packaging}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {product.schedule && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50/90 text-amber-800 border border-amber-200/80">
                            {product.schedule}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50/90 px-2 py-0.5 rounded-full border border-emerald-200/80">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      </div>
                    </div>

                    {/* Brand Name & SKU */}
                    <div>
                      <Link
                        href={`/${companySlug}/products/${product.slug}`}
                        className={`text-lg font-black text-slate-900 tracking-tight transition-colors line-clamp-1 ${
                          isTeal ? "group-hover:text-teal-700" : "group-hover:text-blue-700"
                        }`}
                      >
                        {product.name}
                      </Link>

                      {product.itemCode && (
                        <span className="text-[10px] font-mono text-slate-400 pt-0.5 block">
                          SKU: {product.itemCode}
                        </span>
                      )}
                    </div>

                    {/* Active Composition Box (Frosted Inset) */}
                    <div className="glass-inset rounded-2xl p-3.5 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Active Formulation Salt
                      </span>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                        {compositionString || "Active Pharmaceutical Ingredient"}
                      </p>
                    </div>

                    {/* Manufacturer Branding */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <ManufacturerLogo
                          name={product.manufacturer.name}
                          logoUrl={product.manufacturer.logoUrl}
                          size="sm"
                        />
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">
                          {product.manufacturer.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => toggleTray(e, product)}
                      className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer ${
                        isInTray(product.id)
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs"
                          : "glass-pill text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                      }`}
                    >
                      {isInTray(product.id) ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>In Tray &bull; Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-slate-500" />
                          <span>+ Add to Quote</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!isInTray(product.id)) addItem(product);
                        openInquiry(product);
                      }}
                      className={`py-3 px-3 rounded-2xl text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-1.5 hover:scale-102 active:scale-98 cursor-pointer ${
                        isTeal
                          ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20"
                          : "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Enquire Now</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* ============================================================ */
          /* 2. RESPONSIVE SPECIFICATION TABLE / MOBILE & MID-SCREEN VIEW */
          /* ============================================================ */
          <motion.div
            key="table-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {/* MOBILE ONLY SUB-FORMAT SELECTOR (< md screens) */}
            <div className="md:hidden flex items-center justify-between gap-2 p-1.5 rounded-2xl glass-surface">
              <div className="flex items-center gap-1.5 pl-1.5">
                <span className="text-[11px] font-bold text-slate-700">Display:</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {mobileTableSubMode === "cards" ? "Compact Spec Rows" : "Full Spreadsheet (Swipeable)"}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setMobileTableSubMode("cards")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    mobileTableSubMode === "cards"
                      ? isTeal ? "bg-teal-700 text-white shadow-xs" : "bg-blue-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTableSubMode("swipe")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    mobileTableSubMode === "swipe"
                      ? isTeal ? "bg-teal-700 text-white shadow-xs" : "bg-blue-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Table &rarr;
                </button>
              </div>
            </div>

            {/* A. MOBILE ADAPTIVE SPEC CARDS (Shown on < md when mobileTableSubMode === 'cards') */}
            <div className={`space-y-3 ${mobileTableSubMode === "swipe" ? "hidden md:hidden" : "md:hidden"}`}>
              {products.map((product, index) => {
                const compositionString = product.ingredients
                  .map((i) => `${i.name} ${i.quantity} ${i.unit}`)
                  .join(" + ");

                return (
                  <motion.div
                    key={`mobile-row-${product.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.25) }}
                    className="glass-card rounded-2xl p-4 space-y-3 relative overflow-hidden"
                  >
                    {/* Top Row: Brand + Dosage */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <Link
                          href={`/${companySlug}/products/${product.slug}`}
                          className={`font-black text-base text-slate-900 tracking-tight block truncate ${
                            isTeal ? "hover:text-teal-700" : "hover:text-blue-700"
                          }`}
                        >
                          {product.name}
                        </Link>
                        <p className="text-[11px] font-medium text-slate-500">
                          {product.dosageForm} &bull; {product.packaging}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {product.schedule && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {product.schedule}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                          <span>COA</span>
                        </span>
                      </div>
                    </div>

                    {/* Middle: Active Composition + Manufacturer */}
                    <div className="glass-inset rounded-xl p-2.5 space-y-1.5 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Active Salt:
                        </span>
                        <p className="font-semibold text-slate-800 text-[11px] leading-tight">
                          {compositionString || "Active Pharmaceutical Ingredient"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50">
                        <ManufacturerLogo
                          name={product.manufacturer.name}
                          logoUrl={product.manufacturer.logoUrl}
                          size="sm"
                        />
                        <span className="text-[11px] font-bold text-slate-700 truncate">
                          {product.manufacturer.name}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: 1-Tap Enquire & Add to Quote Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => toggleTray(e, product)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 active:scale-98 cursor-pointer ${
                          isInTray(product.id)
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                            : "glass-pill text-slate-700"
                        }`}
                      >
                        {isInTray(product.id) ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-slate-500" />
                            <span>+ Add to Quote</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!isInTray(product.id)) addItem(product);
                          openInquiry(product);
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer ${
                          isTeal
                            ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20"
                            : "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Enquire</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* B. MID-SCREEN & DESKTOP SPEC TABLE (AND MOBILE SWIPE TABLE) */}
            {/* Contains STICKY RIGHT Trade Actions column so Enquire is ALWAYS accessible on all screens! */}
            <div className={`overflow-hidden rounded-3xl glass-surface border border-slate-200/80 ${
              mobileTableSubMode === "swipe" ? "block" : "hidden md:block"
            }`}>
              {/* Swipe Guide Notice for Mobile Screen */}
              <div className="md:hidden px-4 py-2 bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-medium text-slate-600 flex items-center justify-between">
                <span>&larr; Swipe columns to view specs</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Enquire button stays pinned</span>
                </span>
              </div>

              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/60 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th scope="col" className="py-4 px-4 sm:px-5 min-w-[170px] sm:min-w-[210px]">
                        Product &amp; Brand
                      </th>
                      <th scope="col" className="py-4 px-4 sm:px-5 min-w-[130px] sm:min-w-[170px]">
                        Authorized Manufacturer
                      </th>
                      <th scope="col" className="py-4 px-4 sm:px-5 min-w-[190px] sm:min-w-[240px]">
                        Active Composition &amp; Strength
                      </th>
                      {/* Pinned Sticky Right Action Column for Mid-Screen & Mobile Ergonomics */}
                      <th 
                        scope="col" 
                        className="py-4 px-4 sm:px-5 text-right whitespace-nowrap sticky right-0 z-20 bg-slate-50/95 backdrop-blur-md shadow-[-6px_0_12px_rgba(0,0,0,0.06)] min-w-[125px] sm:min-w-[140px]"
                      >
                        Trade Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {products.map((product, index) => {
                      const compositionString = product.ingredients
                        .map((i) => `${i.name} ${i.quantity} ${i.unit}`)
                        .join(" + ");

                      return (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                          className="hover:bg-white/60 transition-colors group"
                        >
                          {/* Product & Brand */}
                          <td className="py-4 px-4 sm:px-5 align-top">
                            <div className="flex flex-col gap-1">
                              <Link
                                href={`/${companySlug}/products/${product.slug}`}
                                className={`font-black text-sm text-slate-900 transition-colors tracking-tight ${
                                  isTeal ? "group-hover:text-teal-700" : "group-hover:text-blue-700"
                                }`}
                              >
                                {product.name}
                              </Link>

                              {product.dosageForm && (
                                <span className="text-[10px] font-semibold text-slate-500">
                                  {product.dosageForm} &bull; {product.packaging}
                                </span>
                              )}

                              <div className="flex items-center gap-1.5 mt-0.5">
                                {product.schedule && (
                                  <span className="text-[9px] font-bold text-amber-800 bg-amber-50/90 px-1.5 py-0.2 rounded border border-amber-200">
                                    {product.schedule}
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-emerald-700 bg-emerald-50/80 px-1.5 py-0.2 rounded-full border border-emerald-200">
                                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>COA</span>
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Manufacturer */}
                          <td className="py-4 px-4 sm:px-5 align-top">
                            <div className="space-y-1">
                              <ManufacturerLogo
                                name={product.manufacturer.name}
                                logoUrl={product.manufacturer.logoUrl}
                                size="sm"
                              />
                              <p className="text-xs font-bold text-slate-800 pt-1">
                                {product.manufacturer.name}
                              </p>
                            </div>
                          </td>

                          {/* Composition & Strength */}
                          <td className="py-4 px-4 sm:px-5 align-top">
                            <div className="space-y-1.5">
                              <span className="text-xs font-semibold text-slate-900 block leading-relaxed">
                                {compositionString}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 block">
                                Batch COA Release Verified
                              </span>
                            </div>
                          </td>

                          {/* Sticky Right Trade Actions: Add to Quote and Direct Enquire */}
                          <td className="py-4 px-4 sm:px-5 align-middle text-right sticky right-0 z-20 bg-white/95 backdrop-blur-md shadow-[-6px_0_12px_rgba(0,0,0,0.06)] group-hover:bg-slate-50/95 transition-colors">
                            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                              <button
                                type="button"
                                onClick={(e) => toggleTray(e, product)}
                                title={isInTray(product.id) ? "In inquiry tray (Click to remove)" : "Add to inquiry list"}
                                className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                  isInTray(product.id)
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80"
                                }`}
                              >
                                {isInTray(product.id) ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="hidden sm:inline">In Quote</span>
                                    <span className="sm:hidden">Added</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="hidden sm:inline">+ Add to Quote</span>
                                    <span className="sm:hidden">+ Add</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (!isInTray(product.id)) addItem(product);
                                  openInquiry(product);
                                }}
                                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-bold text-white shadow-xs transition-all flex items-center gap-1.5 hover:scale-102 active:scale-98 cursor-pointer ${
                                  isTeal
                                    ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20"
                                    : "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                                }`}
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Enquire</span>
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
