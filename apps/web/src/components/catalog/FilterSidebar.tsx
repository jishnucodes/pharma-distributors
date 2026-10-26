"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Filter, Check, Search, Building2, Sparkles } from "lucide-react";
import { FilterMeta } from "@/types";

interface FilterSidebarProps {
  filterMeta?: FilterMeta;
  selectedManufacturer?: string;
  selectedDosageForm?: string;
  selectedCategory?: string;
  selectedStrength?: string;
  onFilterChange: (key: string, value: string | undefined) => void;
  onReset: () => void;
  accentColor?: string;
}

export function FilterSidebar({
  filterMeta,
  selectedManufacturer,
  selectedDosageForm,
  selectedCategory,
  selectedStrength,
  onFilterChange,
  onReset,
  accentColor = "teal",
}: FilterSidebarProps) {
  const isTeal = accentColor === "teal";
  const hasActiveFilters = Boolean(selectedManufacturer);
  const [filterSearch, setFilterSearch] = useState("");

  const filteredMfg = (filterMeta?.manufacturers || []).filter((mfg) =>
    mfg.name.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <motion.aside 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full glass-surface rounded-3xl p-6 space-y-5 relative overflow-hidden"
    >
      {/* Decorative top ambient bar */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          isTeal 
            ? "from-emerald-500 via-teal-500 to-cyan-500" 
            : "from-blue-600 via-indigo-600 to-cyan-500"
        }`} 
      />

      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isTeal ? "bg-teal-50 text-teal-700" : "bg-blue-50 text-blue-700"}`}>
            <Filter className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 tracking-tight">Catalog Filters</h3>
            <p className="text-[10px] text-slate-400">Direct Principal Partners</p>
          </div>
        </div>

        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </motion.button>
        )}
      </div>

      {/* 1. Manufacturer Filter */}
      {filterMeta?.manufacturers && filterMeta.manufacturers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span>Manufacturer</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              {filterMeta.manufacturers.length} partners
            </span>
          </div>

          {/* Quick Filter Search */}
          {filterMeta.manufacturers.length > 5 && (
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Filter manufacturers..."
                className="w-full pl-8 pr-2.5 py-2 text-xs rounded-xl glass-inset text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-300 transition-all"
              />
            </div>
          )}

          <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {filteredMfg.map((mfg) => {
              const isSelected = selectedManufacturer === mfg.slug;
              return (
                <motion.button
                  key={mfg.slug}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() =>
                    onFilterChange("manufacturer", isSelected ? undefined : mfg.slug)
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left group ${
                    isSelected
                      ? isTeal
                        ? "bg-teal-500 text-white font-bold shadow-xs shadow-teal-500/20"
                        : "bg-blue-600 text-white font-bold shadow-xs shadow-blue-600/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    {isSelected && (
                      <motion.span 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="shrink-0"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </motion.span>
                    )}
                    <span className="truncate">{mfg.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? "bg-white/20 text-white font-bold"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }`}
                  >
                    {mfg.count}
                  </span>
                </motion.button>
              );
            })}

            {filteredMfg.length === 0 && (
              <p className="text-[11px] text-slate-400 text-center py-3">
                No matching manufacturers
              </p>
            )}
          </div>
        </div>
      )}

      {/* Helpful Wholesale Tip */}
      <div className="pt-2 border-t border-slate-100">
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Sparkles className={`w-3 h-3 ${isTeal ? "text-teal-600" : "text-blue-600"}`} />
            <span>Direct Commercial Sourcing</span>
          </div>
          <p className="leading-relaxed">
            All inventory is procured direct from licensed manufacturing units with full batch release COA.
          </p>
        </div>
      </div>
    </motion.aside>
  );
}
