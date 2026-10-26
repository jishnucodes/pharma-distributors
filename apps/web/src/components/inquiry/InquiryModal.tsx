"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Send, 
  Building2, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  MessageCircle, 
  Sparkles, 
  Trash2, 
  Plus, 
  ClipboardList 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, InquiryItem } from "@/types";
import { submitInquiry } from "@/lib/api";
import { useInquiry } from "./InquiryContext";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  companySlug: string;
  companyName: string;
  accentColor?: string;
  initialProduct?: Product | null;
  whatsapp?: string | null;
}

export function InquiryModal({
  isOpen,
  onClose,
  companySlug,
  companyName,
  accentColor = "teal",
  initialProduct = null,
  whatsapp = null,
}: InquiryModalProps) {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearTray,
  } = useInquiry();

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isTeal = accentColor === "teal";

  // Pre-configured WhatsApp trade desk
  const defaultWhatsApp = companySlug === "lakshmi-pharma" ? "+91 94471 23456" : "+91 98460 78901";
  const rawWhatsApp = whatsapp || defaultWhatsApp;
  const cleanWhatsApp = rawWhatsApp.replace(/\D/g, "");

  // If initialProduct was passed directly and not in tray, add it
  useEffect(() => {
    if (initialProduct && !items.some((i) => i.product.id === initialProduct.id)) {
      addItem(initialProduct);
    }
  }, [initialProduct, addItem, items]);

  useEffect(() => {
    if (isOpen) {
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayItems = items;

  const handleApplyPresetQty = (productId: string, preset: string) => {
    updateQuantity(productId, preset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const itemsPayload = displayItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity?.trim() || "Stock & Rate Check",
        packaging: item.product.packaging,
        manufacturer: item.product.manufacturer?.name,
      }));

      const res = await submitInquiry(companySlug, {
        name,
        businessName,
        email: email || undefined,
        phone,
        message: message.trim() || "Commercial trade quote requested for selected formulations.",
        productId: itemsPayload[0]?.productId || null,
        items: itemsPayload,
      });

      setSuccessMessage(res.message);
      clearTray();
      setName("");
      setBusinessName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build Structured WhatsApp RFQ message
  const buildWhatsAppMessage = () => {
    let text = `*Commercial Trade Inquiry - ${companyName} Commercial Trade Desk*\n`;
    if (businessName) text += `*Pharmacy / Buyer:* ${businessName}\n`;
    if (name) text += `*Contact Person:* ${name}\n`;
    if (phone) text += `*Phone:* ${phone}\n\n`;

    if (displayItems.length > 0) {
      text += `*Requested Formulations (${displayItems.length} items):*\n`;
      displayItems.forEach((item, idx) => {
        const qtyText = item.quantity?.trim() ? `Qty: ${item.quantity.trim()}` : "Trade Rate & Stock Check";
        text += `${idx + 1}. *${item.product.name}* (${item.product.packaging})\n`;
        text += `   - Manufacturer: ${item.product.manufacturer?.name || "Standard"}\n`;
        text += `   - Requested: ${qtyText}\n`;
      });
      text += `\n`;
    }

    if (message.trim()) {
      text += `*Additional Notes:* ${message.trim()}\n`;
    } else {
      text += `*Note:* Please quote wholesale trade rates and current batch expiry.\n`;
    }

    return encodeURIComponent(text);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header (Fixed at top) */}
        <div
          className={`px-5 sm:px-6 py-4 flex items-center justify-between text-white shrink-0 ${
            isTeal ? "bg-teal-700" : "bg-blue-700"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">
                Commercial Trade Desk &bull; RFQ
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
                {displayItems.length} {displayItems.length === 1 ? "Formulation" : "Formulations"}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold tracking-tight">
              Wholesale Inquiry to {companyName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-5">
          {successMessage ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-xl text-slate-900">Wholesale Inquiry Dispatched</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                {successMessage}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs ${
                    isTeal ? "bg-teal-700 hover:bg-teal-800" : "bg-blue-700 hover:bg-blue-800"
                  }`}
                >
                  Done &bull; Return to Catalog
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              
              {/* 1. Selected Formulations Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className={`w-4 h-4 ${isTeal ? "text-teal-700" : "text-blue-700"}`} />
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      Selected Formulations for Quotation ({displayItems.length})
                    </span>
                  </div>

                  {displayItems.length > 0 && (
                    <button
                      type="button"
                      onClick={clearTray}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {displayItems.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                    <Package className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="font-bold text-slate-700 text-xs">No formulations selected yet</p>
                    <p className="text-[11px] text-slate-500">
                      Browse our catalog and click <strong>&quot;+ Add to Inquiry&quot;</strong> to quote multiple medicines together.
                    </p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white border border-slate-200 text-slate-700 shadow-2xs hover:bg-slate-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Browse Product Catalog</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {displayItems.map((item, idx) => {
                      const compositionString = item.product.ingredients
                        ?.map((i) => `${i.name} ${i.quantity} ${i.unit}`)
                        .join(" + ");

                      return (
                        <div
                          key={`inquiry-item-${item.product.id}`}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 relative group hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                  {idx + 1}. {item.product.name}
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-white border border-slate-200 text-slate-600">
                                  {item.product.packaging}
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700">
                                  {item.product.dosageForm}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">
                                {compositionString || item.product.manufacturer?.name}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.product.id)}
                              title="Remove formulation"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Optional Quantity Input Row with Quick Presets */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 border-t border-slate-200/60">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={item.quantity || ""}
                                onChange={(e) => updateQuantity(item.product.id, e.target.value)}
                                placeholder="Qty / Units (optional, e.g. 50 boxes)"
                                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                              />
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {["Rate Check", "10 Boxes", "50 Boxes"].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => handleApplyPresetQty(item.product.id, preset)}
                                  className="px-2 py-1 rounded-md text-[10px] font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={onClose}
                        className="text-[11px] font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add more products from catalog</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Instant WhatsApp Shortcut Banner (Massive Sales Booster!) */}
              {cleanWhatsApp && displayItems.length > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                      <span>Prefer Instant WhatsApp Quote?</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-bold">
                      Immediate Reply
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    Send your {displayItems.length} selected formulations directly to our trade desk on WhatsApp for instant pricing &amp; batch availability.
                  </p>
                  <a
                    href={`https://wa.me/${cleanWhatsApp}?text=${buildWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Send {displayItems.length} Formulations via WhatsApp &rarr;</span>
                  </a>
                </div>
              )}

              {/* 2. Buyer & Pharmacy Details */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                  Or Submit Trade Desk Form
                </span>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Business Name */}
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">
                    Pharmacy / Hospital / Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. City Med Chemist / Sunrise Hospital Pharmacy"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                {/* Contact Person Name */}
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">
                    Contact Person Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh / Pharmacist In-Charge"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                {/* Phone & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">
                      Mobile / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98470 12345"
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Email (Optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="purchase@pharmacy.com"
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>

                {/* General Inquiry Notes */}
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">
                    Additional Requirements &amp; Credit Terms (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Urgent dispatch needed, quote wholesale tier discount, request Form 20B/21B invoice..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                {/* Regulatory Disclaimer */}
                <p className="text-[10px] text-slate-400 leading-tight">
                  * By submitting, you confirm you are a licensed retail chemist, clinical institution, or wholesale stockist with a valid Drug License.
                </p>

                {/* Submit Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || displayItems.length === 0}
                    className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 hover:scale-102 active:scale-98 cursor-pointer ${
                      isTeal ? "bg-teal-700 hover:bg-teal-800" : "bg-blue-700 hover:bg-blue-800"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Submitting Inquiry..." : `Submit Inquiry (${displayItems.length} items)`}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
