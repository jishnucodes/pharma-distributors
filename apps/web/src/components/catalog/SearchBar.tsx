"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Sparkles, Command, ArrowRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  accentColor?: string;
}

const POPULAR_COMPOSITION_PRESETS = [
  { label: "Paracetamol 650mg", query: "Paracetamol 650 mg", tag: "Analgesic" },
  { label: "Insulin Glargine", query: "Insulin Glargine", tag: "Cold Chain" },
  { label: "Meropenem 1g", query: "Meropenem 1000 mg", tag: "Critical Care" },
  { label: "Amoxicillin + Clav", query: "Amoxicillin", tag: "Antibiotic" },
  { label: "Human Albumin 20%", query: "Albumin", tag: "Biologic" },
  { label: "Pantoprazole 40mg", query: "Pantoprazole 40 mg", tag: "GI Care" },
];

export function SearchBar({ initialValue = "", onSearch, accentColor = "teal" }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
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

  const handlePresetClick = (presetQuery: string) => {
    setValue(presetQuery);
    onSearch(presetQuery);
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Input Container with Glowing Aura */}
      <form onSubmit={handleSubmit} className="relative group">
        <div
          className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity blur-sm ${
            isFocused ? "opacity-100" : ""
          } ${
            isTeal
              ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
              : "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"
          }`}
        />

        <div
          className={`relative flex items-center glass-surface rounded-2xl transition-all duration-300 ${
            isFocused
              ? isTeal
                ? "border-teal-500 shadow-xl shadow-teal-500/15 ring-4 ring-teal-500/15"
                : "border-blue-500 shadow-xl shadow-blue-500/15 ring-4 ring-blue-500/15"
              : "hover:border-white"
          }`}
        >
          {/* Animated Search Icon */}
          <div className="pl-4.5 pr-2 flex items-center pointer-events-none">
            <div
              className={`p-2 rounded-xl transition-colors ${
                isFocused
                  ? isTeal
                    ? "bg-teal-50 text-teal-600"
                    : "bg-blue-50 text-blue-600"
                  : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
              }`}
            >
              <Search className="w-4.5 h-4.5" />
            </div>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              setValue(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search active salt, formulation name, brand, or manufacturer..."
            className="w-full h-14 pl-2 pr-28 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-hidden"
            aria-label="Search pharmaceutical products"
          />

          {/* Right Action Badges */}
          <div className="absolute right-3.5 flex items-center gap-2">
            {value && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}

            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100/90 border border-slate-200 text-[11px] font-mono font-semibold text-slate-500 shadow-2xs">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-bold border border-slate-200 text-[10px]">
                /
              </kbd>
            </div>
          </div>
        </div>
      </form>

      {/* Modern Composition Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 shrink-0">
          <Zap className={`w-3.5 h-3.5 ${isTeal ? "text-teal-600" : "text-blue-600"}`} />
          <span className="uppercase tracking-wider">Fast Presets:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
          {POPULAR_COMPOSITION_PRESETS.map((preset) => {
            const isActive = value.toLowerCase().includes(preset.query.toLowerCase());

            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset.query)}
                className={`group px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? isTeal
                      ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                      : "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "glass-pill hover:bg-white text-slate-700 hover:text-slate-950"
                }`}
              >
                <span>{preset.label}</span>
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                  }`}
                >
                  {preset.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
