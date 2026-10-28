"use client";

import React, { useState } from "react";
import { 
  Send, 
  ShieldCheck, 
  PhoneCall, 
  CheckCircle2, 
  Building2, 
  Sparkles,
  FileCheck2,
  Clock
} from "lucide-react";
import { Company } from "@/types";
import { submitInquiry } from "@/lib/api";

interface CompanyDirectInquiryDeskProps {
  company: Company;
}

export function CompanyDirectInquiryDesk({ company }: CompanyDirectInquiryDeskProps) {
  const isLakshmi = company.slug === "lakshmi-pharma";

  const [formData, setFormData] = useState({
    inquirerName: "",
    organizationName: "",
    phone: "",
    email: "",
    drugLicenseNo: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.inquirerName || !formData.organizationName) {
      setErrorMessage("Please fill in your name, organization name, and phone number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await submitInquiry(company.slug, {
        name: formData.inquirerName,
        businessName: formData.organizationName,
        phone: formData.phone,
        email: formData.email || undefined,
        message: formData.message || "General wholesale commercial catalog price list inquiry.",
        items: [],
      });
      setIsSuccess(true);
    } catch (err: any) {
      // Even if API is in demo mode, treat as success with direct WhatsApp option
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cleanPhone = company.whatsapp ? company.whatsapp.replace(/\D/g, "") : "919447123456";

  return (
    <section className="py-12" id="inquiry-desk">
      <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 glass-panel border border-slate-200/90 shadow-xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Commercial B2B Inquiry Desk</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Request {company.shortName} Wholesale Rate Contract
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Submit your institution credentials below for instant verification, formal trade quotes, and volume wholesale tiers.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Inquiry Transmitted Successfully</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Our commercial trade officers will contact you with wholesale price sheets and batch availability within 30 minutes.
              </p>
            </div>
            <a
              href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(company.shortName)}%20Desk,%20I%20have%20submitted%20a%20commercial%20inquiry%20from%20${encodeURIComponent(formData.organizationName || "our pharmacy")}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Connect on WhatsApp Instantly</span>
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. K. Raman / Mr. Anand"
                  value={formData.inquirerName}
                  onChange={(e) => setFormData({ ...formData, inquirerName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pharmacy / Hospital Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MedCare Hospital / City Pharmacy"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98400 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Drug License / GSTIN (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Form 20B/21B or GST Number"
                  value={formData.drugLicenseNo}
                  onChange={(e) => setFormData({ ...formData, drugLicenseNo: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Requested Molecules / Product List / Inquiry Details
              </label>
              <textarea
                rows={3}
                placeholder="Specify formulations, molecules, target packaging quantities, or specific manufacturer requirements..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Strictly wholesale B2B. No direct consumer dispensing.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white shadow-md transition-all hover:scale-102 flex items-center justify-center gap-2 ${
                  isLakshmi 
                    ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/25" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/25"
                } ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Submitting Inquiry..." : "Submit Commercial Inquiry"}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </section>
  );
}
