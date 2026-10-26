"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, ArrowRight, X, Sparkles } from "lucide-react";
import { useInquiry } from "./InquiryContext";

interface InquiryFloatingBarProps {
  accentColor?: string;
  companyName: string;
}

export function InquiryFloatingBar({
  accentColor = "teal",
  companyName,
}: InquiryFloatingBarProps) {
  const { items, totalCount, openInquiry, clearTray, isOpen } = useInquiry();
  const isTeal = accentColor === "teal";

  // Hide the floating bar if no items or if the full inquiry modal is already open
  if (totalCount === 0 || isOpen) {
    return null;
  }

  const previewNames = items
    .slice(0, 2)
    .map((i) => i.product.name)
    .join(", ");
  const remainingCount = items.length - 2;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 lg:bottom-6 lg:right-28 z-40 max-w-md pointer-events-auto"
      >
        <div className="glass-panel p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl flex items-center justify-between gap-3">
          {/* Left: Icon & Badge */}
          <div
            onClick={() => openInquiry()}
            className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1 group"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm transition-transform group-hover:scale-105 ${
                isTeal ? "bg-teal-700" : "bg-blue-700"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 tracking-tight">
                  Inquiry Tray
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${
                    isTeal ? "bg-teal-700" : "bg-blue-700"
                  }`}
                >
                  {totalCount} {totalCount === 1 ? "item" : "items"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate font-medium">
                {previewNames}
                {remainingCount > 0 && ` +${remainingCount} more`}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => openInquiry()}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-all hover:scale-102 active:scale-98 cursor-pointer ${
                isTeal
                  ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20"
                  : "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
              }`}
            >
              <span>Review RFQ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={clearTray}
              title="Clear inquiry list"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
