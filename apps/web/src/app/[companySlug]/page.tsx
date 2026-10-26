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
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { fetchCompany } from "@/lib/api";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";
import { CompanyKineticHero } from "@/components/home/CompanyKineticHero";

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
    <div className="space-y-16 pb-20">
      
      {/* 1. Kinetic Hero Section with 3D Floating Pharmaceutical Centerpiece */}
      <CompanyKineticHero company={company} />

      {/* 2. Featured Formulations for this Company with 3D Card Hover */}
      {company.featuredProducts && company.featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 mb-2">
                <Sparkles className={`w-3.5 h-3.5 ${isLakshmi ? "text-emerald-600" : "text-blue-600"}`} />
                <span>Priority Dispatched Formulations</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                High-Demand Pharmaceuticals in {company.shortName}
              </h2>
            </div>

            <Link
              href={`/${companySlug}/products`}
              className={`text-xs font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition-all hover:scale-102 ${
                isLakshmi ? "text-teal-700 hover:text-teal-800" : "text-blue-700 hover:text-blue-800"
              }`}
            >
              <span>View full catalog ({company.stats?.totalProducts ?? 8}+ items)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {company.featuredProducts.map((fp) => (
              <div
                key={fp.id}
                className="group relative bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-5 overflow-hidden"
              >
                {/* Subtle Hover Gradient Glow */}
                <div 
                  className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isLakshmi ? "bg-emerald-100/70" : "bg-blue-100/70"
                  }`} 
                />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/${companySlug}/products/${fp.slug}`}
                        className={`font-black text-base sm:text-lg text-slate-900 transition-colors tracking-tight ${
                          isLakshmi ? "group-hover:text-teal-700" : "group-hover:text-blue-700"
                        }`}
                      >
                        {fp.name}
                      </Link>
                      {fp.itemCode && (
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">SKU: {fp.itemCode}</p>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                      {fp.dosageForm}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Active Molecule &amp; Composition
                    </span>
                    <span className="font-bold text-slate-800">{fp.composition}</span>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Manufacturer:</span>
                      <span className="font-bold text-slate-800">{fp.manufacturer.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Packaging Unit:</span>
                      <span className="font-semibold text-slate-800">{fp.packaging}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 relative z-10">
                  <Link
                    href={`/${companySlug}/products/${fp.slug}`}
                    className="flex-1 text-center py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                  >
                    View Specs
                  </Link>
                  <Link
                    href={`/${companySlug}/contact`}
                    className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all hover:scale-102 ${
                      isLakshmi
                        ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20"
                        : "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                    }`}
                  >
                    Enquire B2B
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Operational Coverage Hub & Compliance Glassmorphic Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-xl space-y-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <MapPin className={`w-4 h-4 ${isLakshmi ? "text-emerald-600" : "text-blue-600"}`} />
            <span>Operational Hub &amp; Regulatory Standard</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Transit Routes &amp; Distribution Radius
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {company.serviceAreas}
              </p>

              <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs space-y-2.5 text-xs text-slate-700">
                <p className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Warehouse Facility:</span>
                  <span className="font-bold text-slate-800 text-right">{company.address}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Dispatch Operations:</span>
                  <span className="font-bold text-slate-800">{company.businessHours}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Trade Desk Direct:</span>
                  <span className="font-bold font-mono text-slate-800">{company.phone}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Orders Processing:</span>
                  <span className="font-bold font-mono text-teal-700">{company.email}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Drug License Compliance Assurance
              </h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 border border-slate-200/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Licensed wholesale distribution under Forms 20B/21B of Drugs and Cosmetics Act. Strictly B2B dispensing to licensed healthcare institutions.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 border border-slate-200/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    100% manufacturer warranty backed batch verification with digital GST wholesale invoices.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 border border-slate-200/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Active temperature logging protocol with cold-chain audit tags generated for vaccines and biologicals.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/${companySlug}/about`}
                  className={`text-xs font-bold inline-flex items-center gap-1.5 ${
                    isLakshmi ? "text-teal-700 hover:text-teal-800" : "text-blue-700 hover:text-blue-800"
                  }`}
                >
                  <span>Learn more about {company.shortName}&apos;s storage infrastructure</span>
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
