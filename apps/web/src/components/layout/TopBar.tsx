"use client";

import React from "react";
import { Phone, Mail, Clock, ShieldCheck, MessageCircle } from "lucide-react";
import { Company } from "@/types";

interface TopBarProps {
  company?: Company;
}

export function TopBar({ company }: TopBarProps) {
  if (!company) return null;

  const isLakshmi = company.slug === "lakshmi-pharma";

  return (
    <div
      className={`border-b text-xs transition-colors duration-200 ${
        isLakshmi
          ? "bg-emerald-950 text-emerald-100 border-emerald-900"
          : "bg-slate-900 text-blue-100 border-slate-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-y-1">
        {/* Compliance & Drug License tag */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-medium text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Licensed B2B Distributor:</span>
          </span>
          <span className="text-slate-300 font-mono text-[11px]">
            {company.drugLicenseNo || "KL-EST-2024-REG (DEMO)"}
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-300">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{company.businessHours}</span>
          </span>
        </div>

        {/* Direct Contact Links */}
        <div className="flex items-center gap-4 text-[11px]">
          {company.phone && (
            <a
              href={`tel:${company.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1 text-slate-200 hover:text-white transition-colors"
              title="Direct commercial order desk"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{company.phone}</span>
            </a>
          )}
          {company.email && (
            <a
              href={`mailto:${company.email}`}
              className="hidden md:inline-flex items-center gap-1 text-slate-200 hover:text-white transition-colors"
              title="Official distributor email"
            >
              <Mail className="w-3 h-3 text-sky-400" />
              <span>{company.email}</span>
            </a>
          )}
          {company.whatsapp && (
            <a
              href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-medium transition-colors"
              title="Trade inquiry via WhatsApp"
            >
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp Trade</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
