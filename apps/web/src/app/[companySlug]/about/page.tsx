import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  Truck,
  MapPin,
  Clock,
  Phone,
  Mail,
  Award,
  FileText,
  ArrowRight,
} from "lucide-react";
import { fetchCompany } from "@/lib/api";

interface AboutPageProps {
  params: {
    companySlug: string;
  };
}

export default async function CompanyAboutPage({ params }: AboutPageProps) {
  const { companySlug } = params;

  let company;
  try {
    company = await fetchCompany(companySlug);
  } catch (err) {
    notFound();
  }

  const isLakshmi = company.slug === "lakshmi-pharma";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-slate-200">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            isLakshmi
              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
              : "bg-blue-100 text-blue-900 border border-blue-200"
          }`}
        >
          Company Profile &amp; Regulatory Credentials
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          About {company.name}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          {company.description}
        </p>
      </div>

      {/* Demo Data Disclaimer Badge */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Transparency Notice:</strong> Operational addresses, Drug License registrations, and contact details shown below are simulated for demonstration purposes under the L &amp; K platform specification.
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded bg-slate-200">
          DEMO DATA
        </span>
      </div>

      {/* Operational Facts & Logistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Card 1: Logistics & Storage Infrastructure */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Truck className="w-4 h-4 text-teal-600" />
            <span>Distribution &amp; Storage Capabilities</span>
          </div>

          <div className="space-y-3 text-slate-600 leading-relaxed">
            <p>
              Operating temperature-mapped central warehouses with dedicated cold rooms calibrated continuously between 2°C and 8°C.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 font-medium">
              <div className="flex items-center justify-between">
                <span>Dispatch SLA:</span>
                <span className="font-bold text-slate-900">Same-Day / Under 24h</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Batch Traceability:</span>
                <span className="font-bold text-slate-900">100% Barcode Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cold Chain Audit:</span>
                <span className="font-bold text-slate-900">Continuous Data Loggers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Regulatory Compliance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Licensing &amp; Regulatory Compliance</span>
          </div>

          <div className="space-y-3 text-slate-600 leading-relaxed">
            <p>
              Holding active Form 20B (allopathic non-biologicals) and Form 21B (biologicals and special schedule drugs) wholesale licenses under the Drugs and Cosmetics Act.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 font-mono text-[11px]">
              <div>
                <span className="text-slate-400">Drug License: </span>
                <span className="font-bold text-slate-800">{company.drugLicenseNo || "KL-2024-REG"}</span>
              </div>
              <div>
                <span className="text-slate-400">GST Registration: </span>
                <span className="font-bold text-slate-800">{company.gstin || "32AAAAA0000A1Z5"}</span>
              </div>
              <div>
                <span className="text-slate-400">Operating Status: </span>
                <span className="text-emerald-700 font-bold">Active &amp; Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Areas Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Service Areas &amp; Hospital Supply Radius</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {company.serviceAreas}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Central Warehouse Facility</span>
            <p className="text-slate-600">{company.address}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Commercial Working Hours</span>
            <p className="text-slate-600">{company.businessHours}</p>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="text-center pt-4">
        <Link
          href={`/${companySlug}/contact`}
          className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:scale-[1.02] ${
            isLakshmi ? "bg-teal-700 hover:bg-teal-800" : "bg-blue-700 hover:bg-blue-800"
          }`}
        >
          <span>Connect with {company.shortName}&apos;s Trade Desk</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
