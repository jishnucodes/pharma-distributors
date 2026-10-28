"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Check, 
  Plus, 
  Send, 
  ShieldCheck, 
  ThermometerSnowflake, 
  QrCode, 
  Package, 
  Layers, 
  ExternalLink,
  Building,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Product, Company } from "@/types";
import { useInquiry } from "@/components/inquiry/InquiryContext";

interface ProductDossierModalProps {
  product: Product | null;
  company: Company;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDossierModal({
  product,
  company,
  isOpen,
  onClose,
}: ProductDossierModalProps) {
  const { addItem, isInTray, openInquiry } = useInquiry();
  const [packQuantity, setPackQuantity] = useState<string>("100 Units");
  const [justAdded, setJustAdded] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isLakshmi = company.slug === "lakshmi-pharma";
  const inTray = isInTray(product.id);
  const isCold = product.requiresColdChain ||
                 product.storageConditions?.toLowerCase().includes("2°c") ||
                 product.storageConditions?.toLowerCase().includes("cold");

  const compositionText = product.composition || 
    (product.ingredients && product.ingredients.length > 0
      ? product.ingredients.map((i) => `${i.name} ${i.quantity}${i.unit}`).join(" + ")
      : "Pharmacopoeial Certified Formula");

  const handleAddToTray = () => {
    addItem(product, packQuantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleDirectInquiry = () => {
    onClose();
    openInquiry(product);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop (Darkened editorial ambient blur) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/85 backdrop-blur-md"
        />

        {/* Double-Page Editorial Dossier Container (Inspired by juliamoresco.com.br notebook) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-[#fbf9f5] text-stone-900 rounded-3xl shadow-2xl border border-stone-300/80 overflow-hidden z-10 my-auto"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 transition-colors shadow-xs"
            aria-label="Close Dossier"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Central Book Spine Shadow Line (Creates the open book fold effect) */}
          <div className="hidden lg:block absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 bg-gradient-to-r from-stone-400/10 via-stone-400/25 to-stone-400/10 pointer-events-none z-20" />
          {/* Subtle Ribbon Bookmark */}
          <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-14 bg-teal-800 shadow-md z-25 rounded-b-xs" />

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-stone-300/60">
            
            {/* ================= LEFT PAGE: Specimen Presentation & Authentication ================= */}
            <div className="p-6 sm:p-10 flex flex-col justify-between space-y-6 bg-[#f7f4ee]">
              {/* Left Page Header */}
              <div className="flex items-center justify-between border-b border-stone-300/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-stone-500">
                    PHARMACEUTICAL SPECIMEN DOSSIER
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded-full border border-teal-200/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>BATCH VERIFIED</span>
                </div>
              </div>

              {/* 3D Product Presentation */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-stone-200/80 shadow-inner flex items-center justify-center p-4">
                <Image
                  src={isCold ? "/assets/pharma_vial.jpg" : "/assets/pharma_capsule.jpg"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent pointer-events-none" />

                {/* Cold Chain Badge Overlay */}
                {isCold && (
                  <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-900/90 text-cyan-200 border border-cyan-400/40 backdrop-blur-md flex items-center gap-1.5">
                    <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-300" />
                    <span>2°C – 8°C CRYO-MONITORED</span>
                  </div>
                )}

                {/* Live Core SKU tag */}
                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-white text-xs">
                  <span className="font-mono font-semibold bg-stone-900/80 px-2.5 py-1 rounded-md backdrop-blur-xs">
                    ITEM CODE: {product.itemCode || "GEN-PHARMA-SKU"}
                  </span>
                  <span className="font-mono text-[11px] bg-teal-800/90 px-2 py-0.5 rounded-md backdrop-blur-xs font-bold">
                    FORM 20B / 21B
                  </span>
                </div>
              </div>

              {/* Authentication & Traceability Footer on Left Page */}
              <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-6 h-6 text-stone-700" />
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-stone-400 block">
                        SERIALIZED AUTHENTICATION
                      </span>
                      <span className="font-mono text-xs font-bold text-stone-800">
                        SN: LK-{product.id.slice(0, 6).toUpperCase()}-2026-XQ
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono font-bold text-stone-400 block">
                      SUPPLY STATUS
                    </span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 justify-end">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Dispatch Ready
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed border-t border-stone-100 pt-2">
                  Stock authenticated under {company.name} CDSCO license ({company.drugLicenseNo}). Complete Certificate of Analysis (COA) provided with shipment invoice.
                </p>
              </div>

            </div>

            {/* ================= RIGHT PAGE: Editorial Specimen Technical Breakdown & RFQ ================= */}
            <div className="p-6 sm:p-10 flex flex-col justify-between space-y-6 bg-[#fbf9f5]">
              
              {/* Product Headline & Classification */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-200/80 text-stone-700">
                    {product.dosageForm || "Formulation"} · {company.shortName} Catalog
                  </span>
                  <span className="text-xs font-mono font-semibold text-stone-400">
                    PAGE 01 / 01
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-serif">
                  {product.name}
                </h2>
                
                <p className="text-xs sm:text-sm text-stone-600 font-medium">
                  Manufactured by <strong className="text-stone-900">{product.manufacturer?.name || "CDSCO Certified Research Lab"}</strong>
                </p>
              </div>

              {/* Active Formula Table (Swiss Editorial Typography) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b-2 border-stone-900 pb-1">
                  <span className="text-[10px] uppercase font-mono font-black tracking-wider text-stone-900">
                    Active Pharmaceutical Ingredients (API)
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold text-stone-500">
                    Per Unit Basis
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-stone-200/80 divide-y divide-stone-100 overflow-hidden text-xs">
                  {product.ingredients && product.ingredients.length > 0 ? (
                    product.ingredients.map((ing) => (
                      <div key={ing.id} className="p-3 flex items-center justify-between font-mono">
                        <span className="font-bold text-stone-800">{ing.name}</span>
                        <span className="text-stone-600 font-semibold">{ing.quantity} {ing.unit}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 flex items-center justify-between font-mono">
                      <span className="font-bold text-stone-800">{compositionText}</span>
                      <span className="text-stone-600 font-semibold">Standard Dosage</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-100/70 border border-stone-200/60">
                  <span className="text-[9px] uppercase font-mono font-bold text-stone-400 block">
                    Packaging Specification
                  </span>
                  <span className="font-bold text-stone-800 mt-0.5 block">
                    {product.packaging || "Export Standard Strips / Vials"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-100/70 border border-stone-200/60">
                  <span className="text-[9px] uppercase font-mono font-bold text-stone-400 block">
                    Storage Protocol
                  </span>
                  <span className="font-bold text-stone-800 mt-0.5 block">
                    {product.storageConditions || "Store below 25°C in controlled humidity"}
                  </span>
                </div>
              </div>

              {/* Commercial B2B Order / Inquiry Selector */}
              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-300/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-stone-700 uppercase">
                    Select Wholesale Indent Quantity:
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-stone-500">
                    GST Invoice Included
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {["100 Units", "500 Units", "1,000+ Units"].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setPackQuantity(qty)}
                      className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
                        packQuantity === qty
                          ? isLakshmi
                            ? "bg-teal-800 text-white shadow-xs"
                            : "bg-blue-700 text-white shadow-xs"
                          : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>

                {/* Primary Dual Actions: Add to Tray OR Instant Wholesale Quote */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <button
                    onClick={handleAddToTray}
                    className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      inTray || justAdded
                        ? "bg-emerald-700 text-white"
                        : isLakshmi
                        ? "bg-teal-700 hover:bg-teal-800 text-white shadow-sm"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    }`}
                  >
                    {inTray || justAdded ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Added to Inquiry Tray ({packQuantity})</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add to Inquiry Tray</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDirectInquiry}
                    className="w-full sm:w-auto py-3 px-5 rounded-xl font-bold text-xs bg-stone-900 hover:bg-black text-white shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5 text-teal-400" />
                    <span>Instant RFQ</span>
                  </button>
                </div>
              </div>

              {/* CDSCO Registered Stamp Footer */}
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 pt-2 border-t border-stone-200">
                <span>CDSCO REG: {company.drugLicenseNo?.split("/")[0] || "KL-REG-2024"}</span>
                <span>B2B EXCLUSIVE · NO RETAIL DISPENSING</span>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
