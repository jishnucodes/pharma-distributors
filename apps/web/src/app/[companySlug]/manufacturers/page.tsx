import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers, ArrowRight, ShieldCheck, Building2, Package } from "lucide-react";
import { fetchCompany, fetchManufacturers } from "@/lib/api";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";

interface ManufacturersPageProps {
  params: {
    companySlug: string;
  };
}

export default async function CompanyManufacturersPage({ params }: ManufacturersPageProps) {
  const { companySlug } = params;

  let company;
  let manufacturersData;
  try {
    [company, manufacturersData] = await Promise.all([
      fetchCompany(companySlug),
      fetchManufacturers(companySlug),
    ]);
  } catch (err) {
    notFound();
  }

  const isLakshmi = company.slug === "lakshmi-pharma";
  const manufacturers = manufacturersData.data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isLakshmi
                ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                : "bg-blue-100 text-blue-900 border border-blue-200"
            }`}
          >
            {company.name} Authorized Network
          </span>
          <span className="text-xs text-slate-400">Direct Principal Partnerships</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Authorized Pharmaceutical Manufacturers
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          {company.name} maintains authorized wholesale distribution agreements with premier research and generic drug manufacturers. Selecting a manufacturer filters all matching formulations listed in this company&apos;s catalog.
        </p>
      </div>

      {/* Manufacturers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {manufacturers.map((mfg) => (
          <div
            key={mfg.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <ManufacturerLogo name={mfg.name} logoUrl={mfg.logoUrl} size="lg" />
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorized</span>
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 tracking-tight">{mfg.name}</h3>
                {mfg.partnershipDetails && (
                  <p className="text-xs text-slate-500 pt-0.5">{mfg.partnershipDetails}</p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Catalog Formulations:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {mfg.publishedProductCount ?? 0} listed
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <Link
                href={`/${companySlug}/products?manufacturer=${mfg.slug}`}
                className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 ${
                  isLakshmi ? "bg-teal-700 hover:bg-teal-800" : "bg-blue-700 hover:bg-blue-800"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>View Products ({mfg.publishedProductCount})</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
