import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Package,
  Layers,
  ShieldCheck,
  Truck,
  ArrowRight,
  PhoneCall,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { fetchCompany } from "@/lib/api";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";

interface CompanyHomePageProps {
  params: {
    companySlug: string;
  };
}

export default async function CompanyHomePage({ params }: CompanyHomePageProps) {
  const { companySlug } = params;

  let company;
  try {
    company = await fetchCompany(companySlug);
  } catch (err) {
    notFound();
  }

  const isLakshmi = company.slug === "lakshmi-pharma";

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section */}
      <section
        className={`border-b py-16 lg:py-20 transition-colors ${
          isLakshmi
            ? "bg-gradient-to-b from-teal-950/5 via-emerald-50/40 to-white border-emerald-100"
            : "bg-gradient-to-b from-blue-950/5 via-blue-50/40 to-white border-blue-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isLakshmi
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                  : "bg-blue-100 text-blue-900 border border-blue-200"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Licensed Wholesale Pharmaceutical Distributor</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">
              DL: {company.drugLicenseNo || "KL-REG-2024 (DEMO)"}
            </span>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {company.name}
            </h1>
            <p
              className={`text-lg sm:text-xl font-bold ${
                isLakshmi ? "text-teal-700" : "text-blue-700"
              }`}
            >
              {company.tagline || "Authorized Pharmaceutical Distribution Partner"}
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-1">
              {company.description}
            </p>
          </div>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/${companySlug}/products`}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:scale-[1.02] ${
                isLakshmi
                  ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20"
                  : "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Explore {company.shortName} Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/${companySlug}/contact`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-slate-500" />
              <span>Commercial Trade Desk</span>
            </Link>
          </div>

          {/* Key Value Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Catalog Items
              </span>
              <p className="text-2xl font-black text-slate-900">
                {company.stats?.totalProducts ?? 8}+
              </p>
              <span className="text-[10px] text-slate-500">Verified formulations</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Authorized Manufacturers
              </span>
              <p className="text-2xl font-black text-slate-900">
                {company.stats?.totalManufacturers ?? 5}+
              </p>
              <span className="text-[10px] text-slate-500">Direct supply contracts</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Cold Chain Logistics
              </span>
              <p className="text-2xl font-black text-slate-900">2°C - 8°C</p>
              <span className="text-[10px] text-slate-500">Calibrated temperature control</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Dispatch Reliability
              </span>
              <p className="text-2xl font-black text-slate-900">&lt; 24 Hrs</p>
              <span className="text-[10px] text-slate-500">Regional hospital transit</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Formulations for this Company */}
      {company.featuredProducts && company.featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Featured Catalog Lines</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                High-Demand Formulations in {company.name}
              </h2>
            </div>

            <Link
              href={`/${companySlug}/products`}
              className={`text-xs font-bold inline-flex items-center gap-1 hover:underline ${
                isLakshmi ? "text-teal-700" : "text-blue-700"
              }`}
            >
              <span>View full catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {company.featuredProducts.map((fp) => (
              <div
                key={fp.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/${companySlug}/products/${fp.slug}`}
                        className="font-bold text-base text-slate-900 hover:text-teal-700 transition-colors"
                      >
                        {fp.name}
                      </Link>
                      {fp.itemCode && (
                        <p className="text-[10px] font-mono text-slate-400">SKU: {fp.itemCode}</p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {fp.dosageForm}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Active Composition
                    </span>
                    <span className="font-semibold text-slate-800">{fp.composition}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span className="text-slate-500">Manufacturer:</span>
                    <span className="font-bold text-slate-800">{fp.manufacturer.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="text-slate-500">Pack:</span>
                    <span className="font-semibold text-slate-800">{fp.packaging}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/${companySlug}/products/${fp.slug}`}
                    className="flex-1 text-center py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                  >
                    View Specs
                  </Link>
                  <Link
                    href={`/${companySlug}/contact`}
                    className={`flex-1 text-center py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-colors ${
                      isLakshmi
                        ? "bg-teal-700 hover:bg-teal-800"
                        : "bg-blue-700 hover:bg-blue-800"
                    }`}
                  >
                    Enquire
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Coverage Areas & Compliance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Operational Coverage &amp; Logistics Hub</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Service Areas &amp; Distribution Radius
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {company.serviceAreas}
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-700">
                <p>
                  <strong>Warehouse Address:</strong> {company.address}
                </p>
                <p>
                  <strong>Business Hours:</strong> {company.businessHours}
                </p>
                <p>
                  <strong>Commercial Phone:</strong> {company.phone}
                </p>
                <p>
                  <strong>Orders Email:</strong> {company.email}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Regulatory Standards &amp; Assurance
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Licensed under Drugs and Cosmetics Act (Forms 20B/21B). Strictly supplying licensed pharmacies and hospitals.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Direct manufacturer supply lines guaranteeing 100% genuine batch codes and authenticated manufacturer warranty.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Continuous cold-chain temperature logs available upon delivery for vaccines and biologicals.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/${companySlug}/about`}
                  className={`text-xs font-bold inline-flex items-center gap-1 ${
                    isLakshmi ? "text-teal-700" : "text-blue-700"
                  }`}
                >
                  <span>Learn more about {company.shortName}&apos;s distribution infrastructure</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
