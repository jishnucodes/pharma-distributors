import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Package,
  Lock,
} from "lucide-react";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";

export default function MasterLandingPage() {
  const manufacturers = [
    { name: "Cipla", logoUrl: "/logos/cipla.svg" },
    { name: "Micro Labs", logoUrl: "/logos/microlabs.svg" },
    { name: "Rhine Biopharm", logoUrl: "/logos/rhine.svg" },
    { name: "Sun Pharma", logoUrl: "/logos/sunpharma.svg" },
    { name: "GlaxoSmithKline", logoUrl: "/logos/gsk.svg" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">

      {/* Master Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-700 via-emerald-800 to-blue-900 flex items-center justify-center font-black text-white shadow-md text-xl">
              L&amp;K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  L &amp; K
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Wholesale Network
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Integrated Pharmaceutical Distribution Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Two Established Distributors • One Unified Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
              Verified Pharmaceutical Distribution Under the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-blue-700">
                L &amp; K Brand
              </span>
            </h1>
          </div>
        </section>

        {/* The Two Companies Gateway Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Select an Active Distributor
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Each distributor maintains its own independent product catalog, authorized manufacturer partnerships, coverage areas, and dedicated commercial trade desks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Card 1: Lakshmi Pharma */}
            <div className="group rounded-2xl bg-white border-2 border-emerald-500/30 p-8 shadow-sm hover:shadow-xl hover:border-emerald-600 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Teal / Emerald Theme</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">Est. 1998</span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Lakshmi Pharma
                  </h3>
                  <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                    Authorized Ethical &amp; Generics Pharmaceutical Distribution
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Serving over 1,400 retail pharmacies, nursing homes, and clinics across South India. Extensive generic inventory, daily dispatch lines, and strict batch temperature tracking.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium text-slate-400">Service Areas:</span>
                    <span className="font-semibold text-slate-800 text-right">
                      Central Kerala &amp; Tamil Nadu (Coimbatore)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium text-slate-400">Key Catalog Highlights:</span>
                    <span className="font-semibold text-slate-800">
                      Dolo 650, Calpol 650, Augmentin 625 Duo, Rhinex Cold
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium text-slate-400">Contact:</span>
                    <span className="font-semibold text-slate-800">+91 484 235 6789</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/lakshmi-pharma/products"
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold text-xs text-white bg-teal-700 hover:bg-teal-800 shadow-md text-center transition-all flex items-center justify-center gap-2 group-hover:shadow-teal-700/20"
                >
                  <Package className="w-4 h-4" />
                  <span>Browse Lakshmi Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/lakshmi-pharma"
                  className="w-full sm:w-auto py-3 px-5 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-center transition-colors"
                >
                  Company Profile
                </Link>
              </div>
            </div>

            {/* Card 2: The Kothittil Pharmaceutical Distributor */}
            <div className="group rounded-2xl bg-white border-2 border-blue-500/30 p-8 shadow-sm hover:shadow-xl hover:border-blue-600 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Royal Blue Theme</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">Est. 2005</span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                    The Kothittil Pharmaceutical Distributor
                  </h3>
                  <p className="text-xs font-semibold text-blue-800 mt-0.5">
                    Specialty Therapeutics, Critical Care &amp; Institutional Supply
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Specializing in validated cold-chain logistics, cardiology, diabetology, and oncology institutional supply chains. Verified batch compliance and zero-delay critical care fulfillment.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium text-slate-400">Service Areas:</span>
                    <span className="font-semibold text-slate-800 text-right">
                      South Kerala &amp; Karnataka (Bengaluru Urban)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium text-slate-400">Key Catalog Highlights:</span>
                    <span className="font-semibold text-slate-800">
                      Moxikind-CV 625, Glycomet 500 SR, Pantocid 40, Dolo 650
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium text-slate-400">Contact:</span>
                    <span className="font-semibold text-slate-800">+91 471 245 8890</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/kothittil-pharma/products"
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold text-xs text-white bg-blue-700 hover:bg-blue-800 shadow-md text-center transition-all flex items-center justify-center gap-2 group-hover:shadow-blue-700/20"
                >
                  <Package className="w-4 h-4" />
                  <span>Browse Kothittil Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/kothittil-pharma"
                  className="w-full sm:w-auto py-3 px-5 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-center transition-colors"
                >
                  Company Profile
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Authorized Manufacturers Section */}
        <section className="bg-white border-y border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Direct Manufacturer Partnerships
            </span>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
              {manufacturers.map((mfg) => (
                <div key={mfg.name} className="grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100">
                  <ManufacturerLogo name={mfg.name} logoUrl={mfg.logoUrl} size="lg" />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 max-w-xl mx-auto pt-2">
              Authorized regional distribution agreements. Only authorized manufacturer logos are displayed; clean text badges are used when logos are unavailable.
            </p>
          </div>
        </section>
      </main>

      {/* Master Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white text-xs">
              L&amp;K
            </div>
            <span className="font-bold text-slate-200">L &amp; K Pharmaceutical Distributors</span>
          </div>
          <p className="text-[11px]">
            Licensed wholesale B2B distributor under Drugs and Cosmetics Act. Strictly no direct patient dispensing.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-emerald-400 hover:text-emerald-300">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
