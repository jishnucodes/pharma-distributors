"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Building2, Package, CheckCircle2, AlertCircle } from "lucide-react";
import { Product, Company } from "@/types";
import { submitInquiry } from "@/lib/api";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  companySlug: string;
  companyName: string;
  accentColor?: string;
  initialProduct?: Product | null;
}

export function InquiryModal({
  isOpen,
  onClose,
  companySlug,
  companyName,
  accentColor = "teal",
  initialProduct = null,
}: InquiryModalProps) {
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isTeal = accentColor === "teal";

  useEffect(() => {
    if (initialProduct) {
      setMessage(
        `Commercial trade inquiry for ${initialProduct.name} (${initialProduct.packaging}). Please quote trade discount and batch availability.`
      );
    } else {
      setMessage("");
    }
    setSuccessMessage(null);
    setErrorMessage(null);
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitInquiry(companySlug, {
        name,
        businessName,
        email: email || undefined,
        phone,
        message,
        productId: initialProduct?.id || null,
      });

      setSuccessMessage(res.message);
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between text-white ${
            isTeal ? "bg-teal-700" : "bg-blue-700"
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-200">
              Commercial Trade Desk
            </span>
            <h3 className="text-base font-bold tracking-tight">
              Inquiry to {companyName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {successMessage ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-slate-900">Inquiry Dispatched</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                {successMessage}
              </p>
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-2 rounded-xl text-xs font-bold text-white shadow-xs ${
                  isTeal ? "bg-teal-700 hover:bg-teal-800" : "bg-blue-700 hover:bg-blue-800"
                }`}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Product Reference Pill */}
              {initialProduct && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Referenced Product
                      </span>
                      <p className="font-bold text-slate-900 text-xs">{initialProduct.name}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                    {initialProduct.packaging}
                  </span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Pharmacy / Business Name */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Business / Pharmacy / Hospital Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. City Healthcare Chemist / St. Mary Hospital"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                />
              </div>

              {/* Contact Person Name */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Authorized Contact Person <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh / Pharmacist In-Charge"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                />
              </div>

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">
                    Phone / Mobile <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98470 12345"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="purchase@pharmacy.com"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Trade Inquiry Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Specify quantity needed, shelf expiry preferences, delivery location, or trade credit terms..."
                  className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                />
              </div>

              {/* B2B Disclaimer */}
              <p className="text-[10px] text-slate-400 leading-tight">
                * By submitting, you confirm you are a licensed medical retailer, clinical institution, or wholesale stockist with a valid Drug License (Form 20B/21B).
              </p>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 ${
                    isTeal ? "bg-teal-700 hover:bg-teal-800" : "bg-blue-700 hover:bg-blue-800"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Submitting..." : "Send Trade Inquiry"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
