"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Activity, ShieldCheck, Search } from "lucide-react";

interface ModernLoadingProps {
  accentColor?: string;
  label?: string;
}

/**
 * 2026 Shimmer Skeleton for Product Catalog
 */
export function CatalogLoadingSkeleton({
  accentColor = "teal",
  label = "Scanning verified pharmaceutical formulations...",
}: ModernLoadingProps) {
  const isTeal = accentColor === "teal";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* High-tech status indicator */}
      <div className="flex items-center justify-between p-4 rounded-2xl glass-surface">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span
              className={`w-3 h-3 rounded-full animate-ping absolute ${
                isTeal ? "bg-teal-400" : "bg-blue-400"
              }`}
            />
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isTeal ? "bg-teal-600" : "bg-blue-600"
              }`}
            />
          </div>
          <span className="text-xs font-bold text-slate-700 tracking-tight flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
            <span>{label}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-slate-400 hidden sm:inline">
            Form 20B/21B Directory
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono">
            SYNCING
          </span>
        </div>
      </div>

      {/* Grid of Shimmering Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-6 rounded-3xl glass-card space-y-4 relative overflow-hidden"
          >
            {/* Shimmer overlay */}
            <div className="flex items-center justify-between">
              <div className="w-16 h-5 rounded-md animate-shimmer" />
              <div className="w-20 h-5 rounded-full animate-shimmer" />
            </div>

            <div className="space-y-2">
              <div className="w-3/4 h-6 rounded-lg animate-shimmer" />
              <div className="w-1/2 h-3.5 rounded-md animate-shimmer" />
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 space-y-2">
              <div className="w-full h-3 rounded animate-shimmer" />
              <div className="w-2/3 h-3 rounded animate-shimmer" />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="w-24 h-4 rounded animate-shimmer" />
              <div className="w-20 h-8 rounded-xl animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 2026 Shimmer Skeleton for Single Product Detail
 */
export function ProductDetailSkeleton({ accentColor = "teal" }: ModernLoadingProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Breadcrumb shimmer */}
      <div className="w-48 h-4 rounded-md animate-shimmer" />

      {/* Main card shimmer */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-8 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-3 w-full max-w-lg">
            <div className="flex items-center gap-2">
              <div className="w-20 h-6 rounded-md animate-shimmer" />
              <div className="w-24 h-6 rounded-md animate-shimmer" />
              <div className="w-28 h-6 rounded-md animate-shimmer" />
            </div>
            <div className="w-3/4 h-10 rounded-xl animate-shimmer" />
            <div className="w-40 h-4 rounded animate-shimmer" />
          </div>

          <div className="w-44 h-12 rounded-xl animate-shimmer shrink-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 space-y-3">
              <div className="w-24 h-3.5 rounded animate-shimmer" />
              <div className="w-32 h-6 rounded-lg animate-shimmer" />
              <div className="w-full h-3 rounded animate-shimmer" />
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 space-y-4">
          <div className="w-48 h-5 rounded animate-shimmer" />
          <div className="space-y-2">
            <div className="w-full h-3.5 rounded animate-shimmer" />
            <div className="w-5/6 h-3.5 rounded animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 2026 Shimmer Skeleton for Contact Page
 */
export function ContactSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      <div className="space-y-3 pb-6 border-b border-slate-200">
        <div className="w-36 h-6 rounded-full animate-shimmer" />
        <div className="w-64 h-10 rounded-xl animate-shimmer" />
        <div className="w-96 h-4 rounded animate-shimmer" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-6">
            <div className="w-40 h-6 rounded animate-shimmer" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-md animate-shimmer shrink-0" />
                  <div className="space-y-1.5 w-full">
                    <div className="w-28 h-3.5 rounded animate-shimmer" />
                    <div className="w-48 h-3 rounded animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-5">
            <div className="w-44 h-6 rounded animate-shimmer" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 rounded-xl animate-shimmer" />
              <div className="h-10 rounded-xl animate-shimmer" />
            </div>
            <div className="h-10 rounded-xl animate-shimmer" />
            <div className="h-28 rounded-xl animate-shimmer" />
            <div className="h-12 rounded-xl animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
