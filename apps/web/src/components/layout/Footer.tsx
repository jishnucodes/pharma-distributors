"use client";

import React from "react";
import Link from "next/link";
import { Building2, Phone, Mail, ShieldAlert, Award, FileText } from "lucide-react";
import { Company } from "@/types";

interface FooterProps {
  currentCompany?: Company;
}

export function Footer({ currentCompany }: FooterProps) {
  const isLakshmi = currentCompany?.slug === "lakshmi-pharma";

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      {/* Top Banner: B2B Wholesale Notice */}
      <div className="bg-slate-950/70 border-b border-slate-800/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-slate-200">Wholesale Trade Only:</strong> This portal is strictly for licensed hospitals, retail pharmacies, clinics, and registered institutional healthcare procurement. We do not sell directly to patients or retail consumers.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Good Distribution Practice (GDP)</span>
            </span>
            <span>•</span>
            <span className="font-mono text-slate-300">DEMO VERIFIED 2026</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: L & K Group */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-black text-white text-sm">
              L&amp;K
            </div>
            <span className="text-base font-bold text-white tracking-tight">L &amp; K Group</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Uniting two premier pharmaceutical distribution leaders under one integrated trade platform. Delivering verified ethical generics, cold-chain therapeutics, and critical care pharmaceuticals.
          </p>
          <div className="pt-2 text-[11px] text-slate-400 space-y-1">
            <p>
              <strong className="text-slate-300">1. Lakshmi Pharma:</strong> Ethical Generics &amp; Community Care
            </p>
            <p>
              <strong className="text-slate-300">2. The Kothittil Pharma:</strong> Specialty &amp; Critical Care
            </p>
          </div>
        </div>

        {/* Col 2: Active Company Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {currentCompany?.name || "Active Distributor"}
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            {currentCompany?.address || "Pharmaceutical Logistics Hub, South India"}
          </p>
          <div className="space-y-1.5 pt-1 text-[11px]">
            <p className="flex items-center gap-2 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentCompany?.phone || "+91 484 235 6789"}</span>
            </p>
            <p className="flex items-center gap-2 text-slate-300">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentCompany?.email || "orders@lkpharma.demo"}</span>
            </p>
            <p className="text-slate-400">
              <strong>Hours:</strong> {currentCompany?.businessHours || "Mon-Sat 8:30AM - 7:30PM"}
            </p>
            <p className="text-slate-400 font-mono text-[10px]">
              <strong>DL No:</strong> {currentCompany?.drugLicenseNo || "KL-REG-2024 (DEMO)"}
            </p>
          </div>
        </div>

        {/* Col 3: Quick Navigation */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Catalog &amp; Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                href={`/${currentCompany?.slug || "lakshmi-pharma"}/products`}
                className="hover:text-white transition-colors"
              >
                Composition Search Catalog
              </Link>
            </li>
            <li>
              <Link
                href={`/${currentCompany?.slug || "lakshmi-pharma"}/manufacturers`}
                className="hover:text-white transition-colors"
              >
                Authorized Manufacturers Directory
              </Link>
            </li>
            <li>
              <Link
                href={`/${currentCompany?.slug || "lakshmi-pharma"}/about`}
                className="hover:text-white transition-colors"
              >
                Service Coverage &amp; Logistics
              </Link>
            </li>
            <li>
              <Link
                href={`/${currentCompany?.slug || "lakshmi-pharma"}/contact`}
                className="hover:text-white transition-colors"
              >
                Submit Trade Inquiry
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Authorized Admin Portal &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Regulatory & Clinical Disclaimer */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Regulatory Notice</span>
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All pharmaceutical formulations displayed are supplied strictly against valid drug purchase orders and licensed chemist / hospital credentials.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400 leading-tight">
            <strong>Medical Notice:</strong> Composition matches and active salt listings are provided exclusively for commercial cross-reference and catalog transparency. They do not imply clinical equivalence, substitution, or medical prescription guidance.
          </div>
        </div>
      </div>

      {/* Bottom copyright line */}
      <div className="border-t border-slate-800/80 py-4 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>&copy; {new Date().getFullYear()} L &amp; K Group. All rights reserved. Demo data clearly indicated.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300">Terms of Supply</span>
            <span>•</span>
            <span className="hover:text-slate-300">Form 20B/21B Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
