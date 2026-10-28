"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Sparkles, 
  ShieldCheck, 
  ThermometerSnowflake, 
  Check, 
  Plus, 
  ArrowRight, 
  Send, 
  FileText,
  Building,
  Info
} from "lucide-react";
import { Product, Company } from "@/types";
import { useInquiry } from "@/components/inquiry/InquiryContext";
import { ProductDossierModal } from "./ProductDossierModal";

interface CompanyModernCatalogSectionProps {
  company: Company;
  products: Product[];
}

export function CompanyModernCatalogSection({
  company,
  products,
}: CompanyModernCatalogSectionProps) {
  const isLakshmi = company.slug === "lakshmi-pharma";
  const { addItem, isInTray, openInquiry } = useInquiry();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeDossierProduct, setActiveDossierProduct] = useState<Product | null>(null);

  // Extract unique categories
  const categories = ["ALL", ...Array.from(new Set(products.map((p) => p.dosageForm || "General")))];

  const filteredProducts = selectedCategory === "ALL"
    ? products
    : products.filter((p) => p.dosageForm === selectedCategory);

  return (
    <section id="catalog-section" className="space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200/80">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Digital Marketing Wholesale Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Certified Formulations &amp; Wholesale SKUs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Explore authentic pharmaceutical inventory available for immediate commercial procurement by licensed healthcare institutions.
          </p>
        </div>

        {/* View Full Catalog Link & Quick Inquire */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => openInquiry(null)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs transition-all hover:scale-102 flex items-center gap-1.5 ${
              isLakshmi 
                ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20" 
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Open Inquiry Tray</span>
          </button>

          <Link
            href={`/${company.slug}/products`}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all hover:scale-102 flex items-center gap-1.5"
          >
            <span>Full Catalog View</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Category Filter Pills (bar-topas inspired tag pill bar) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 uppercase tracking-wider font-mono ${
                isSelected
                  ? isLakshmi 
                    ? "bg-teal-700 text-white shadow-sm" 
                    : "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat === "ALL" ? "All SKUs" : cat}
            </button>
          );
        })}
      </div>

      {/* bar-topas Inspired Numbered Product Cards Grid (01, 02, 03...) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => {
          const inTray = isInTray(product.id);
          const cardNum = String(index + 1).padStart(2, "0");
          const isCold = product.requiresColdChain ||
                         product.storageConditions?.toLowerCase().includes("2°c") ||
                         product.storageConditions?.toLowerCase().includes("cold");

          const compositionText = product.composition || 
            (product.ingredients && product.ingredients.length > 0
              ? product.ingredients.map((i) => `${i.name} ${i.quantity}${i.unit}`).join(" + ")
              : "Pharmacopoeial Certified Formula");

          return (
            <div
              key={product.id}
              className="group relative bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between space-y-4 overflow-hidden"
            >
              {/* Card Index Badge (bar-topas styled number badge 01, 02...) */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-800 transition-colors">
                  #{cardNum}
                </span>

                <div className="flex items-center gap-1.5">
                  {isCold && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                      <ThermometerSnowflake className="w-3 h-3 text-cyan-600" />
                      <span>2°C–8°C</span>
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    {product.dosageForm || "Rx"}
                  </span>
                </div>
              </div>

              {/* Product Visual Area with Dossier Trigger */}
              <div 
                onClick={() => setActiveDossierProduct(product)}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-teal-50/30 transition-colors cursor-pointer"
              >
                <Image
                  src={
                    isCold
                      ? "/assets/pharma_vial.jpg"
                      : "/assets/pharma_capsule.jpg"
                  }
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                {/* Inspect Specimen Dossier Pill on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-mono font-bold bg-white text-slate-900 shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Inspect Dossier</span>
                  </span>
                </div>

                {/* SKU overlay tag */}
                {product.itemCode && (
                  <span className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold bg-slate-900/80 text-white backdrop-blur-sm">
                    SKU: {product.itemCode}
                  </span>
                )}
              </div>

              {/* Product Narrative & Composition */}
              <div className="space-y-2 flex-1">
                <div>
                  <button
                    type="button"
                    onClick={() => setActiveDossierProduct(product)}
                    className={`text-left font-black text-base text-slate-900 tracking-tight transition-colors line-clamp-1 ${
                      isLakshmi ? "group-hover:text-teal-700" : "group-hover:text-blue-700"
                    }`}
                  >
                    {product.name}
                  </button>
                  <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                    Mfg: <span className="font-bold text-slate-700">{product.manufacturer?.name || "Certified Partner"}</span>
                  </p>
                </div>

                {/* Active Salt Composition */}
                <div 
                  onClick={() => setActiveDossierProduct(product)}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] leading-snug cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">
                    Active Molecule (Click to Inspect)
                  </span>
                  <span className="font-semibold text-slate-800 line-clamp-2">
                    {compositionText}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Pack: <strong className="text-slate-800">{product.packaging || "Standard"}</strong></span>
                  <span className="text-emerald-700 font-mono font-semibold">In Stock</span>
                </div>
              </div>

              {/* Action Buttons: Add to Inquiry Tray or Open Inquiry Modal */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    addItem(product, "100 Units");
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    inTray
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs"
                      : isLakshmi
                      ? "bg-teal-700 text-white hover:bg-teal-800 shadow-xs"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                  }`}
                >
                  {inTray ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>In Tray</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Inquiry</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActiveDossierProduct(product)}
                  title="Inspect Full Drug Specimen Dossier"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Inquiry Tray CTA Banner for Buyers */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/10 text-teal-300 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Buyer Procurement Desk</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Need Bulk Pricing or Custom Hospital Supply Contracts?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Submit your required molecules or upload your pharmacy indent for verified volume quotes with GST wholesale invoices.
          </p>
        </div>

        <button
          onClick={() => openInquiry(null)}
          className={`shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all hover:scale-103 ${
            isLakshmi ? "bg-teal-600 hover:bg-teal-500 shadow-teal-600/30" : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Launch Commercial Inquiry</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Double-Page Editorial Dossier Modal (Inspired by juliamoresco.com.br notebook) */}
      <ProductDossierModal
        product={activeDossierProduct}
        company={company}
        isOpen={!!activeDossierProduct}
        onClose={() => setActiveDossierProduct(null)}
      />
    </section>
  );
}
