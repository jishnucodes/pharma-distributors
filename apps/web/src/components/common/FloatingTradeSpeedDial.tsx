"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  Phone, 
  X, 
  ShieldCheck, 
  Zap, 
  ChevronUp,
  Clock,
  ArrowRight
} from "lucide-react";
import { Company } from "@/types";

interface FloatingTradeSpeedDialProps {
  company: Company;
}

export function FloatingTradeSpeedDial({ company }: FloatingTradeSpeedDialProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isLakshmi = company.slug === "lakshmi-pharma";

  const cleanPhone = company.phone ? company.phone.replace(/\D/g, "") : "";
  const cleanWhatsApp = company.whatsapp 
    ? company.whatsapp.replace(/\D/g, "") 
    : cleanPhone;

  const prefilledText = encodeURIComponent(
    `Hello ${company.name} Trade Desk, I would like to check availability and wholesale rates for pharmaceutical stock.`
  );

  return (
    <div className="fixed bottom-20 left-4 sm:bottom-22 sm:left-6 lg:bottom-6 lg:left-auto lg:right-6 z-40 flex flex-col items-start lg:items-end">
      {/* Expanded Quick Contact Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-72 glass-surface rounded-3xl p-4 shadow-2xl space-y-3 relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  {company.shortName} Trade Desk
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Direct institutional and wholesale trade assistance for registered hospital and retail pharmacies.
            </p>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {/* WhatsApp Trigger */}
              {cleanWhatsApp && (
                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${prefilledText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-between shadow-sm transition-transform active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp Inquiry</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Call Trigger */}
              {company.phone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="w-full py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between shadow-sm transition-transform active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Call Commercial Desk</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Immediate</span>
                </a>
              )}
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Mon-Sat 8:30-19:30</span>
              </span>
              <span>Form 20B/21B</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Thumb Capsule Trigger - Compact on Mobile to prevent obscuring action buttons */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-3 sm:px-4 sm:py-3 rounded-full text-white font-bold text-xs shadow-xl transition-all ${
          isOpen
            ? "bg-slate-900 shadow-slate-900/30"
            : isLakshmi
            ? "bg-gradient-to-r from-emerald-600 to-teal-700 shadow-emerald-700/30 hover:shadow-emerald-700/40"
            : "bg-gradient-to-r from-blue-600 to-indigo-700 shadow-blue-700/30 hover:shadow-blue-700/40"
        }`}
        aria-label="Direct Commercial Trade Desk Contact"
      >
        {isOpen ? (
          <>
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Close</span>
          </>
        ) : (
          <>
            <div className="relative">
              <MessageCircle className="w-5 h-5 sm:w-4.5 sm:h-4.5 fill-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="hidden sm:inline">Instant Stock Check</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
