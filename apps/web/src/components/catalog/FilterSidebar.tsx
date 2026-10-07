"use client";

import React from "react";
import { RotateCcw, Filter, Check } from "lucide-react";
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
  const hasActiveFilters = Boolean(
    selectedManufacturer /* || selectedDosageForm || selectedCategory || selectedStrength */
  );

  // const commonStrengths = ["650 mg", "500 mg", "40 mg", "10 mg"];

  return (
    <aside className="w-full bg-white rounded-xl border border-slate-200/90 p-5 space-y-6 shadow-xs">
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className={`w-4 h-4 ${isTeal ? "text-teal-600" : "text-blue-600"}`} />
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">Catalog Filters</h3>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* 1. Manufacturer Filter */}
      {filterMeta?.manufacturers && filterMeta.manufacturers.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Manufacturer
          </h4>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {filterMeta.manufacturers.map((mfg) => {
              const isSelected = selectedManufacturer === mfg.slug;
              return (
                <button
                  key={mfg.slug}
                  type="button"
                  onClick={() =>
                    onFilterChange("manufacturer", isSelected ? undefined : mfg.slug)
                  }
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                    isSelected
                      ? isTeal
                        ? "bg-teal-50 text-teal-900 font-bold border border-teal-200"
                        : "bg-blue-50 text-blue-900 font-bold border border-blue-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="truncate">{mfg.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">
                    {mfg.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Dosage Form Filter */}
      {/* {filterMeta?.dosageForms && filterMeta.dosageForms.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Dosage Form
          </h4>
          <div className="space-y-1">
            {filterMeta.dosageForms.map((df) => {
              const isSelected = selectedDosageForm === df.name;
              return (
                <button
                  key={df.name}
                  type="button"
                  onClick={() =>
                    onFilterChange("dosageForm", isSelected ? undefined : df.name)
                  }
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                    isSelected
                      ? isTeal
                        ? "bg-teal-50 text-teal-900 font-bold border border-teal-200"
                        : "bg-blue-50 text-blue-900 font-bold border border-blue-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{df.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{df.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )} */}

      {/* 3. Strength Preset Filters */}
      {/* <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Strength
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {commonStrengths.map((str) => {
            const isSelected = selectedStrength === str;
            return (
              <button
                key={str}
                type="button"
                onClick={() => onFilterChange("strength", isSelected ? undefined : str)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                  isSelected
                    ? isTeal
                      ? "bg-teal-50 text-teal-900 border-teal-500 font-bold"
                      : "bg-blue-50 text-blue-900 border-blue-500 font-bold"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {str}
              </button>
            );
          })}
        </div>
      </div> */}

      {/* 4. Therapeutic Category Filter */}
      {/* {filterMeta?.categories && filterMeta.categories.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Category
          </h4>
          <div className="space-y-1">
            {filterMeta.categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() =>
                    onFilterChange("category", isSelected ? undefined : cat.slug)
                  }
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                    isSelected
                      ? isTeal
                        ? "bg-teal-50 text-teal-900 font-bold border border-teal-200"
                        : "bg-blue-50 text-blue-900 font-bold border border-blue-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-1">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )} */}
    </aside>
  );
}
