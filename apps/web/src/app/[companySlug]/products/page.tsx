"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Package,
  RotateCcw,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Info,
} from "lucide-react";
import { CatalogResponse, Product } from "@/types";
import { fetchCatalog } from "@/lib/api";
import { SearchBar } from "@/components/catalog/SearchBar";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";
import { ProductTable } from "@/components/catalog/ProductTable";
import { InquiryModal } from "@/components/inquiry/InquiryModal";

interface ProductsPageProps {
  params: {
    companySlug: string;
  };
}

export default function CompanyProductsPage({ params }: ProductsPageProps) {
  const { companySlug } = params;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL Query Parameters
  const initialQuery = searchParams.get("q") || "";
  const initialMfg = searchParams.get("manufacturer") || undefined;
  const initialDosage = searchParams.get("dosageForm") || undefined;
  const initialCat = searchParams.get("category") || undefined;
  const initialStrength = searchParams.get("strength") || undefined;
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [data, setData] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inquiry Modal State
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<Product | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const isLakshmi = companySlug === "lakshmi-pharma";
  const accentColor = isLakshmi ? "teal" : "blue";

  // Sync state to URL and fetch catalog
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCatalog(companySlug, {
        q: searchParams.get("q") || undefined,
        manufacturer: searchParams.get("manufacturer") || undefined,
        dosageForm: searchParams.get("dosageForm") || undefined,
        category: searchParams.get("category") || undefined,
        strength: searchParams.get("strength") || undefined,
        page: parseInt(searchParams.get("page") || "1", 10),
        limit: 12,
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load product catalog");
    } finally {
      setLoading(false);
    }
  }, [companySlug, searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update query params helper
  const updateQueryParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 whenever filters or search query change (unless explicitly setting page)
    if (!("page" in updates)) {
      params.delete("page");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (q: string) => {
    updateQueryParams({ q: q || undefined });
  };

  const handleFilterChange = (key: string, value: string | undefined) => {
    updateQueryParams({ [key]: value });
  };

  const handleResetFilters = () => {
    router.push(pathname);
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEnquire = (product: Product) => {
    setSelectedProductForInquiry(product);
    setIsInquiryModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header & Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isLakshmi
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                  : "bg-blue-100 text-blue-900 border border-blue-200"
              }`}
            >
              {isLakshmi ? "Lakshmi Pharma Catalog" : "The Kothittil Pharma Catalog"}
            </span>
            <span className="text-xs text-slate-400">Scoped B2B Inventory</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Composition-Based Product Directory
          </h1>

          <p className="text-xs text-slate-500 max-w-2xl">
            Search active chemical salts, synonyms/aliases, and exact strengths. Formulations sharing identical compositions remain listed individually with their verified manufacturers.
          </p>
        </div>

        {/* Total Results Count */}
        {data && (
          <div className="text-xs text-slate-500 shrink-0">
            Showing <strong className="text-slate-900">{data.products.length}</strong> of{" "}
            <strong className="text-slate-900">{data.total}</strong> products
          </div>
        )}
      </div>

      {/* 2. Search Bar Component */}
      <SearchBar
        initialValue={initialQuery}
        onSearch={handleSearch}
        accentColor={accentColor}
      />

      {/* 3. Catalog Layout (Sidebar Filters + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <FilterSidebar
            filterMeta={data?.filterMeta}
            selectedManufacturer={initialMfg}
            /* selectedDosageForm={initialDosage} */
            /* selectedCategory={initialCat} */
            /* selectedStrength={initialStrength} */
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            accentColor={accentColor}
          />
        </div>

        {/* Product Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Medical & Equivalence Disclaimer Notice */}
          {/* <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Catalog Specification Notice:</strong> All products are cataloged under their registered brand names and authorized manufacturers. Matching active compositions and strengths do not indicate automatic clinical interchangeability. Dispensing must follow valid prescriber specifications.
            </p>
          </div> */}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <div
                className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto ${
                  isLakshmi ? "border-teal-600" : "border-blue-600"
                }`}
              />
              <p className="text-xs text-slate-500 font-medium">
                Searching structured compositions &amp; verified inventory...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-white rounded-xl border border-rose-200 p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="font-bold text-sm text-slate-900">Unable to load catalog</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
              <button
                type="button"
                onClick={loadData}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && data && data.products.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">
                  No matching formulations found
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No products in {isLakshmi ? "Lakshmi Pharma" : "The Kothittil Pharma"}&apos;s catalog match your search criteria. Products assigned exclusively to the other distributor will not appear.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-xs ${
                  isLakshmi ? "bg-teal-700 hover:bg-teal-800" : "bg-blue-700 hover:bg-blue-800"
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset all filters</span>
              </button>
            </div>
          )}

          {/* Product Results Table & Mobile Cards */}
          {!loading && !error && data && data.products.length > 0 && (
            <>
              <ProductTable
                products={data.products}
                companySlug={companySlug}
                onEnquire={handleEnquire}
                accentColor={accentColor}
              />

              {/* Pagination Controls */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
                  <span className="text-slate-500">
                    Page {data.page} of {data.totalPages}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={data.page <= 1}
                      onClick={() => handlePageChange(data.page - 1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      disabled={data.page >= data.totalPages}
                      onClick={() => handlePageChange(data.page + 1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 4. Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        companySlug={companySlug}
        companyName={isLakshmi ? "Lakshmi Pharma" : "The Kothittil Pharmaceutical Distributor"}
        accentColor={accentColor}
        initialProduct={selectedProductForInquiry}
      />
    </div>
  );
}
