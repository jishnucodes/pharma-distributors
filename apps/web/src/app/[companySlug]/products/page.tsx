"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
import { MobileFilterDrawer } from "@/components/catalog/MobileFilterDrawer";
import { ProductTable } from "@/components/catalog/ProductTable";
import { CatalogLoadingSkeleton } from "@/components/common/ModernLoadingSkeleton";
import { useInquiry } from "@/components/inquiry/InquiryContext";

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
  const { openInquiry } = useInquiry();

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
    openInquiry(product);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-32 sm:pb-28 lg:pb-16 space-y-6"
    >
      {/* 1. Header & Title Section */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div
          className={`absolute -top-10 -left-10 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isLakshmi ? "bg-emerald-400" : "bg-blue-400"
          }`}
        />

        <div className="relative space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isLakshmi
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                  : "bg-blue-100 text-blue-900 border border-blue-200"
              }`}
            >
              {isLakshmi ? "Lakshmi Pharma Catalog" : "The Kothittil Pharma Catalog"}
            </span>
            <span className="text-xs text-slate-400 font-mono">Scoped Wholesale Formulations</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Composition-Based Directory
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Search active chemical salts, exact strengths, and therapeutic categories. Directly inspect batch release specs and request commercial trade rates.
          </p>
        </div>

        {/* Total Results Count */}
        {data && (
          <div className="text-xs font-medium text-slate-600 shrink-0 glass-pill px-4 py-2.5">
            Showing <strong className="text-slate-900 font-bold">{data.products.length}</strong> of{" "}
            <strong className="text-slate-900 font-bold">{data.total}</strong> products
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
        {/* Desktop Sidebar Filters (Hidden on < lg screens) */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar
            filterMeta={data?.filterMeta}
            selectedManufacturer={initialMfg}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            accentColor={accentColor}
          />
        </div>

        {/* Product Results */}
        <div className="col-span-1 lg:col-span-3 space-y-4">
          {/* Mobile Filter Controls Bar (< lg screens) */}
          <div className="lg:hidden flex items-center justify-between gap-2 p-2.5 rounded-2xl glass-surface">
            <MobileFilterDrawer
              filterMeta={data?.filterMeta}
              selectedManufacturer={initialMfg}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              accentColor={accentColor}
              totalProducts={data?.total}
            />

            {data && (
              <span className="text-[11px] font-mono text-slate-500 font-medium pr-1">
                {data.total} formulations
              </span>
            )}
          </div>
          {/* Medical & Equivalence Disclaimer Notice */}
          {/* <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Catalog Specification Notice:</strong> All products are cataloged under their registered brand names and authorized manufacturers. Matching active compositions and strengths do not indicate automatic clinical interchangeability. Dispensing must follow valid prescriber specifications.
            </p>
          </div> */}

          {/* Loading State: 2026 Shimmer Skeleton */}
          {loading && <CatalogLoadingSkeleton accentColor={accentColor} />}

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
    </motion.div>
  );
}
