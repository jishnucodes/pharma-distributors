"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, 
  X, 
  RotateCcw, 
  Search, 
  Building2, 
  Check, 
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import { FilterMeta } from "@/types";

interface MobileFilterDrawerProps {
  filterMeta?: FilterMeta;
  selectedManufacturer?: string;
  onFilterChange: (key: string, value: string | undefined) => void;
  onReset: () => void;
  accentColor?: string;
  totalProducts?: number;
}

export function MobileFilterDrawer({
  filterMeta,
  selectedManufacturer,
  onFilterChange,
  onReset,
  accentColor = "teal",
  totalProducts,
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isTeal = accentColor === "teal";
  const hasActiveFilters = Boolean(selectedManufacturer);

  const manufacturers = filterMeta?.manufacturers || [];
  const filtered = manufacturers.filter((mfg) =>
    mfg.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeMfgName = manufacturers.find((m) => m.slug === selectedManufacturer)?.name;

  return (
    <>
      {/* Mobile Trigger Button (Compact Pill next to view toggle) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            hasActiveFilters
              ? isTeal
                ? "bg-teal-600 text-white shadow-sm ring-2 ring-teal-500/20"
                : "bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20"
              : "glass-pill text-slate-700 hover:text-slate-900"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-4.5 h-4.5 rounded-full bg-white text-slate-900 text-[10px] font-black flex items-center justify-center">
              1
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Slide-Up Bottom Sheet Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Drag Handle */}
              <div className="pt-3 pb-2 flex justify-center">
                <div className="w-12 h-1.5 rounded-full bg-slate-300" />
              </div>

              {/* Sheet Header */}
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${isTeal ? "bg-teal-50 text-teal-700" : "bg-blue-50 text-blue-700"}`}>
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 tracking-tight">
                      Filter Catalog
                    </h3>
                    <p className="text-[11px] text-slate-400">Select authorized manufacturer</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        onReset();
                      }}
                      className="text-xs font-bold text-rose-600 px-2 py-1 rounded-md hover:bg-rose-50"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sheet Body (Scrollable) */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                {/* Search input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search manufacturer..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-300"
                  />
                </div>

                {/* Manufacturer options */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Authorized Partners</span>
                    <span>{manufacturers.length} Total</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {filtered.map((mfg) => {
                      const isSelected = selectedManufacturer === mfg.slug;

                      return (
                        <button
                          key={mfg.slug}
                          type="button"
                          onClick={() => {
                            onFilterChange("manufacturer", isSelected ? undefined : mfg.slug);
                          }}
                          className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all text-left ${
                            isSelected
                              ? isTeal
                                ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                                : "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-slate-50 hover:bg-white text-slate-700 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            {isSelected && <Check className="w-4 h-4 stroke-[3] shrink-0" />}
                            <span className="truncate">{mfg.name}</span>
                          </div>
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                              isSelected
                                ? "bg-white/20 text-white font-bold"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {mfg.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {filtered.length === 0 && (
                    <p className="text-center py-6 text-xs text-slate-400">
                      No manufacturers found matching &quot;{search}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Sheet Sticky Bottom Action Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 ${
                    isTeal
                      ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20"
                      : "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                  }`}
                >
                  <span>Apply &amp; View Formulations</span>
                  {totalProducts !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-mono">
                      {totalProducts}
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
