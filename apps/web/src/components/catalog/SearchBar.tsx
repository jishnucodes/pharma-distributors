"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Sparkles, Filter } from "lucide-react";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  accentColor?: string;
}

export function SearchBar({ initialValue = "", onSearch, accentColor = "teal" }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTeal = accentColor === "teal";

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Handle keyboard shortcut '/' to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
    inputRef.current?.focus();
  };

  const sampleQueries = [
    { label: "Paracetamol", query: "paracetamol", hint: "Active Ingredient" },
    { label: "Acetaminophen", query: "acetaminophen", hint: "Ingredient Alias" },
    { label: "Paracetamol 650 mg", query: "paracetamol 650 mg", hint: "Salt + Strength" },
    { label: "Dolo", query: "dolo", hint: "Brand" },
    { label: "Augmentin", query: "augmentin", hint: "Multi-Ingredient" },
  ];

  return (
    <div className="w-full space-y-2.5">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4.5 pointer-events-none text-slate-400 flex items-center gap-1.5">
          <Search className="w-5 h-5 text-slate-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Search by brand name, active composition (e.g. Paracetamol), alias (e.g. Acetaminophen), strength (650 mg), or manufacturer..."
          className={`w-full h-13 pl-12 pr-24 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-all focus:outline-hidden focus:ring-2 ${
            isTeal
              ? "focus:border-teal-500 focus:ring-teal-500/20"
              : "focus:border-blue-500 focus:ring-blue-500/20"
          }`}
          aria-label="Search pharmaceutical products"
        />

        <div className="absolute right-3.5 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center justify-center h-6 px-2 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
            /
          </kbd>
        </div>
      </form>

      {/* Suggested Search Chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick queries:</span>
        </span>
        {sampleQueries.map((item) => (
          <button
            key={item.query}
            type="button"
            onClick={() => {
              setValue(item.query);
              onSearch(item.query);
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              value.toLowerCase() === item.query.toLowerCase()
                ? isTeal
                  ? "bg-teal-50 text-teal-800 border-teal-400 font-bold"
                  : "bg-blue-50 text-blue-800 border-blue-400 font-bold"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span>{item.label}</span>
            <span className="text-[10px] text-slate-400 font-normal">({item.hint})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
