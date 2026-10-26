"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ExternalLink,
  Send,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Company } from "@/types";
import { fetchCompany, submitInquiry } from "@/lib/api";
import { ContactSkeleton } from "@/components/common/ModernLoadingSkeleton";

export default function CompanyContactPage() {
  const params = useParams();
  const companySlug = params.companySlug as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLakshmi = companySlug === "lakshmi-pharma";
  const accentColor = isLakshmi ? "teal" : "blue";

  useEffect(() => {
    async function load() {
      try {
        const c = await fetchCompany(companySlug);
        setCompany(c);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [companySlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await submitInquiry(companySlug, {
        name,
        businessName,
        email: email || undefined,
        phone,
        message,
      });

      setSuccessMessage(res.message);
      setName("");
      setBusinessName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <ContactSkeleton />;
  }

  if (!company) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10"
    >
      {/* Header */}
      <div className="relative space-y-3 pb-6 border-b border-slate-200">
        <div
          className={`absolute -top-10 -left-10 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isLakshmi ? "bg-emerald-400" : "bg-blue-400"
          }`}
        />

        <div className="relative space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isLakshmi
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                  : "bg-blue-100 text-blue-900 border border-blue-200"
              }`}
            >
              Direct Commercial Trade Desk
            </span>
            <span className="text-xs text-slate-400 font-mono">Form 20B/21B Wholesale Channel</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Contact {company.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Direct institutional sales and pharmacy dispatch desk for stock availability, trade credit terms, and cold-chain route delivery schedules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Contact Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-md">
            <h3 className="font-black text-base text-slate-900 tracking-tight">
              Warehouse &amp; Trade Desk
            </h3>

            <div className="space-y-4 text-xs">
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Warehouse Facility</span>
                  <p className="text-slate-600 leading-relaxed pt-0.5">{company.address}</p>
                  {company.mapUrl && (
                    <a
                      href={company.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline pt-1 font-medium"
                    >
                      <span>View on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Phone */}
              {company.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Trade Desk Hotline</span>
                    <a
                      href={`tel:${company.phone.replace(/\s+/g, "")}`}
                      className="text-slate-700 hover:text-emerald-700 font-semibold"
                    >
                      {company.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Email */}
              {company.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Commercial Orders Email</span>
                    <a
                      href={`mailto:${company.email}`}
                      className="text-slate-700 hover:text-sky-700 font-semibold"
                    >
                      {company.email}
                    </a>
                  </div>
                </div>
              )}

              {/* WhatsApp */}
              {company.whatsapp && (
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">WhatsApp Trade Support</span>
                    <a
                      href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{company.whatsapp} (Chat Now)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Business Hours */}
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Operating Hours</span>
                  <p className="text-slate-600 pt-0.5">{company.businessHours}</p>
                </div>
              </div>
            </div>

            {/* Regulatory Disclaimer */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Drugs and Cosmetics Act Compliance:</p>
              <p>
                All dispatches are subject to verification of valid Form 20B/21B retail pharmacy or hospital clinical establishment licenses.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: B2B Trade Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-md hover:shadow-xl transition-shadow relative overflow-hidden">
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                isLakshmi ? "from-emerald-400 to-teal-500" : "from-blue-500 to-indigo-600"
              }`}
            />
            <div>
              <h3 className="font-black text-lg text-slate-900 tracking-tight">
                Submit Wholesale Trade Inquiry
              </h3>
              <p className="text-xs text-slate-500 pt-1">
                Our commercial distribution desk for {company.name} will respond within 4 business hours.
              </p>
            </div>

            {successMessage ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-950">Inquiry Received</h4>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                  {successMessage}
                </p>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Pharmacy / Business Name */}
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">
                    Pharmacy / Hospital / Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. City Care Pharmacy / District Health Center"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                {/* Contact Person Name */}
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">
                    Contact Person Name &amp; Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh / Chief Pharmacist"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                {/* Phone & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">
                      Mobile / Phone <span className="text-rose-500">*</span>
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
                    <label className="block font-semibold text-slate-700">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="purchase@hospital.demo"
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">
                    Inquiry Details &amp; Quantity Required <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="List product names, batch shelf expiry requirements, requested trade credit, or location for delivery estimate..."
                    className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                      isLakshmi
                        ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20"
                        : "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Dispatching Inquiry..." : "Submit Inquiry to Trade Desk"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
