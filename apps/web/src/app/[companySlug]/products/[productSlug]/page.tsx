"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  Package,
  Layers,
  ShieldAlert,
  ArrowLeft,
  MessageSquare,
  Building2,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { Product, Company } from "@/types";
import { fetchProduct } from "@/lib/api";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";
import { InquiryModal } from "@/components/inquiry/InquiryModal";

export default function ProductDetailPage() {
  const params = useParams();
  const companySlug = params.companySlug as string;
  const productSlug = params.productSlug as string;

  const [productData, setProductData] = useState<{ company: Company; data: Product } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const isLakshmi = companySlug === "lakshmi-pharma";
  const accentColor = isLakshmi ? "teal" : "blue";

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchProduct(companySlug, productSlug);
        setProductData(res);
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [companySlug, productSlug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-3">
        <div
          className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto ${
            isLakshmi ? "border-teal-600" : "border-blue-600"
          }`}
        />
        <p className="text-xs text-slate-500 font-medium">
          Loading product specifications...
        </p>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Product Not Available</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          {error || "This product is not listed in the selected distributor's active catalog."}
        </p>
        <Link
          href={`/${companySlug}/products`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const { company, data: product } = productData;
  const matchingComposition = product.matchingComposition;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href={`/${companySlug}`} className="hover:text-slate-900">
          {company.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href={`/${companySlug}/products`} className="hover:text-slate-900">
          Products
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900 truncate">{product.name}</span>
      </nav>

      {/* 2. Main Product Information Card (Strictly text-based. NO PRODUCT IMAGES) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Top Header: Brand Name + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                {product.dosageForm}
              </span>
              {product.schedule && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {product.schedule}
                </span>
              )}
              {product.isFeatured && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Featured Line
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {product.name}
            </h1>

            {product.itemCode && (
              <p className="text-xs font-mono text-slate-400">
                Distributor SKU / Code: <strong className="text-slate-600">{product.itemCode}</strong>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsInquiryModalOpen(true)}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:scale-[1.02] ${
                isLakshmi
                  ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20"
                  : "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Enquire About This Product</span>
            </button>
            <span className="text-[10px] text-slate-400">
              Commercial trade discount available for licensed buyers
            </span>
          </div>
        </div>

        {/* Product Specification Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Col 1: Manufacturer */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Authorized Manufacturer
            </span>
            <ManufacturerLogo
              name={product.manufacturer.name}
              logoUrl={product.manufacturer.logoUrl}
              size="md"
            />
            <p className="text-xs font-bold text-slate-900 pt-1">
              {product.manufacturer.name}
            </p>
            {product.manufacturer.website && (
              <a
                href={product.manufacturer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
              >
                <span>Manufacturer website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Col 2: Packaging & Storage */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Packaging &amp; Storage
            </span>
            <p className="text-xs text-slate-800">
              <strong>Trade Packaging:</strong> {product.packaging}
            </p>
            <p className="text-xs text-slate-800">
              <strong>Storage:</strong> {product.storageConditions || "Store below 30°C in a dry place."}
            </p>
            {product.distributorNotes && (
              <p className="text-xs text-slate-600 italic">
                Note: {product.distributorNotes}
              </p>
            )}
          </div>

          {/* Col 3: Distributor Context */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Listing Distributor
            </span>
            <p className="text-xs font-bold text-slate-900">{company.name}</p>
            <p className="text-[11px] text-slate-600">
              {company.phone} • {company.email}
            </p>
            <p className="text-[10px] font-mono text-slate-500">
              DL: {company.drugLicenseNo || "KL-REG-2024 (DEMO)"}
            </p>
          </div>
        </div>

        {/* 3. Structured Composition Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Active Pharmaceutical Ingredients (Structured Composition)</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {product.ingredients.length} active substance{product.ingredients.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-4">Active Ingredient (Canonical)</th>
                  <th className="py-2.5 px-4">Strength / Quantity</th>
                  <th className="py-2.5 px-4">Applicable Basis</th>
                  <th className="py-2.5 px-4">Known Aliases / Synonyms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {product.ingredients.map((ing) => (
                  <tr key={ing.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {ing.name}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">
                      {ing.quantity} {ing.unit}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{ing.perBasis}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {ing.aliases && ing.aliases.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {ing.aliases.map((a, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-mono"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="space-y-2 pt-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Formulation Notes &amp; Clinical Description
            </h4>
            <p className="text-slate-600 leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-slate-100">
              {product.description}
            </p>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. PRODUCTS WITH MATCHING COMPOSITION SECTION                */}
      {/* Required section: matches ingredients, strengths & dosageForm */}
      {/* Shows each match separately with its manufacturer.            */}
      {/* Strictly does NOT imply clinical equivalence.                 */}
      {/* ============================================================ */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Layers className={`w-4 h-4 ${isLakshmi ? "text-teal-600" : "text-blue-600"}`} />
            <span>Cross-Brand Catalog Reference</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Products with matching composition
          </h2>
          <p className="text-xs text-slate-500 pt-1">
            Other branded formulations listed in {company.name}&apos;s catalog sharing identical active ingredients, strengths, and dosage form.
          </p>
        </div>

        {/* Non-Equivalence Medical Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Important Medical &amp; Prescription Guidance</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            {matchingComposition?.disclaimer ||
              "Do not describe matching compositions as automatically interchangeable medicines or recommend substitutions. Information is provided solely for commercial trade cross-reference."}
          </p>
        </div>

        {/* Matching Products List or Empty message */}
        {matchingComposition && matchingComposition.matches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchingComposition.matches.map((match) => (
              <div
                key={match.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/${companySlug}/products/${match.slug}`}
                      className="font-bold text-sm text-slate-900 hover:text-teal-700 transition-colors"
                    >
                      {match.name}
                    </Link>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {match.dosageForm}
                    </span>
                  </div>

                  <div className="text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                      Composition
                    </span>
                    <span className="font-semibold text-slate-700">
                      {match.compositionSummary}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span className="text-slate-500">Manufacturer:</span>
                    <span className="font-bold text-slate-800">{match.manufacturer.name}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="text-slate-500">Packaging:</span>
                    <span className="font-semibold text-slate-800">{match.packaging}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={`/${companySlug}/products/${match.slug}`}
                    className="w-full text-center py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>View Separate Formulation</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
            <p className="font-medium text-slate-700">
              No other products with this exact composition in {company.name}&apos;s catalog.
            </p>
            <p className="text-[11px] text-slate-400">
              This formulation is the unique brand currently listed for this composition and dosage form by this distributor.
            </p>
          </div>
        )}
      </section>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        companySlug={companySlug}
        companyName={company.name}
        accentColor={accentColor}
        initialProduct={product}
      />
    </div>
  );
}
