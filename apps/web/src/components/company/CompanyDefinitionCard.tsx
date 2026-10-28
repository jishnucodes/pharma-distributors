"use client";

import React from "react";
import Link from "next/link";
import { 
  Building2, 
  ShieldCheck, 
  Award, 
  MapPin, 
  FileCheck,
  CheckCircle2,
  Clock,
  PhoneCall,
  ArrowRight
} from "lucide-react";
import { Company } from "@/types";

interface CompanyDefinitionCardProps {
  company: Company;
}

export function CompanyDefinitionCard({ company }: CompanyDefinitionCardProps) {
  const isLakshmi = company.slug === "lakshmi-pharma";

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto">
        <article className="relative rounded-3xl p-8 sm:p-12 bg-white border-2 border-slate-200/90 shadow-2xl space-y-6 overflow-hidden">
          
          {/* Subtle Corner Stamp Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Definition Header (bar-topas styled dictionary card header) */}
          <header className="space-y-1.5 border-b border-slate-200/80 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-serif italic">
                {company.name}
              </h2>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                CDSCO Licensed
              </span>
            </div>
            <p className="font-mono text-xs text-slate-500">
              <span className="font-bold text-slate-800">[{company.shortName.toUpperCase()}]</span> nom commercial &bull;{" "}
              <em>Wholesale Healthcare Logistics Hub &bull; {isLakshmi ? "Est. 1998" : "Est. 2005"}</em>
            </p>
          </header>

          {/* Definition Body Text */}
          <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-4">
            <p>
              A licensed pharmaceutical distribution powerhouse where hospital pharmacists, clinic administrators, and retail stockists connect for verified medicines with complete manufacturer backing. Known for eliminating hospital stockouts, ensuring 100% genuine batch certificates, and maintaining unbroken 2°C–8°C thermal telemetry across every mile of delivery.
            </p>

            {/* Synonyms Strip */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-1 font-mono">
              <strong className="text-slate-900 uppercase tracking-wider block font-bold">
                Commercial Synonyms:
              </strong>
              <div className="flex flex-wrap gap-2 text-slate-700">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">Unbroken Cold Chain</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">Zero Drug Counterfeits</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">Same-Day Supply Line</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">GST Wholesale Invoicing</span>
              </div>
            </div>
          </div>

          {/* Regulatory Stamp & Credentials */}
          <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <p className="font-mono text-[11px] text-slate-500">
                Drug License: <strong className="text-slate-800">{company.drugLicenseNo || "Form 20B/21B Registered"}</strong>
              </p>
              <p className="font-mono text-[11px] text-slate-500">
                GSTIN: <strong className="text-slate-800">{company.gstin || "State Wholesale Registered"}</strong>
              </p>
            </div>

            <Link
              href={`/${company.slug}/contact`}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs transition-all hover:scale-102 ${
                isLakshmi ? "bg-teal-700 hover:bg-teal-800" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <span>Contact Regulatory Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </article>
      </div>
    </section>
  );
}
