import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  PhoneCall, 
  Sparkles, 
  Lock, 
  Building, 
  CheckCircle2,
  Cpu,
  FileCheck
} from "lucide-react";
import { FloatingCapsuleHeader } from "@/components/home/FloatingCapsuleHeader";
import { CompanyCatalogCarousel } from "@/components/home/CompanyCatalogCarousel";
import { KineticPartnerMarquee } from "@/components/home/KineticPartnerMarquee";
import { ScrollAnimatedBackground } from "@/components/common/ScrollAnimatedBackground";

export default function MasterLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/40 text-slate-900 selection:bg-teal-500 selection:text-white relative">
      {/* 2026 Real-Time 3D WebGL Molecular Flow Background */}
      <ScrollAnimatedBackground variant="home" />

      {/* Modern Floating Frosted Capsule Navigation */}
      <FloatingCapsuleHeader />

      {/* Main Content Area - Reduced Scroll Single-Focus Hero Flow */}
      <main className="flex-1 flex flex-col justify-center pt-24 pb-12 sm:pt-28 sm:pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          
          {/* Header Narrative & Marketing Sentence */}
          <div className="text-center max-w-4xl mx-auto space-y-3">
            
            {/* Top Floating Badges */}
            <div className="inline-flex items-center gap-2 flex-wrap justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill border border-slate-200/80 shadow-xs">
                <div className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
                </div>
                <span className="text-xs font-semibold text-slate-800 tracking-tight">
                  Verified Wholesale Healthcare Distribution
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  CDSCO Compliant
                </span>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-pill border border-teal-300/60 shadow-xs text-teal-800 text-[10px] font-mono font-bold tracking-wider uppercase">
                <Cpu className="w-3 h-3 text-teal-600 animate-pulse" />
                <span>3D Kinetic Flow Active</span>
              </div>
            </div>

            {/* Main Header Sentence */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Next-Gen Medicine Logistics Under The{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-700">
                L &amp; K Enterprise
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Connecting certified pharmaceutical innovators to pharmacies, clinics, and tertiary hospitals with validated cold-chain precision, certified batch tracking, and zero-delay procurement.
            </p>
          </div>

          {/* Company Individual Browse Catalog Carousel */}
          <CompanyCatalogCarousel />

          {/* Brand Name Auto-Carousel / Marquee right below */}
          <KineticPartnerMarquee compact={true} />

        </div>
      </main>

      {/* Modern High-End Master Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 sm:py-10 border-t border-slate-800 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-700 via-emerald-800 to-blue-900 flex items-center justify-center font-black text-white text-xs shadow-md">
                L&amp;K
              </div>
              <div>
                <span className="font-black text-white text-sm tracking-tight">
                  L &amp; K Pharmaceutical Network
                </span>
                <p className="text-[11px] text-slate-500">
                  Lakshmi Pharma &bull; The Kothittil Pharmaceutical Distributor
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <Link href="/lakshmi-pharma" className="text-slate-400 hover:text-white transition-colors">
                Lakshmi Pharma Desk
              </Link>
              <span className="text-slate-700">&bull;</span>
              <Link href="/kothittil-pharma" className="text-slate-400 hover:text-white transition-colors">
                The Kothittil Desk
              </Link>
              <span className="text-slate-700">&bull;</span>
              <Link href="/lakshmi-pharma/products" className="text-slate-400 hover:text-white transition-colors">
                Wholesale Catalog
              </Link>
              <span className="text-slate-700">&bull;</span>
              <Link href="/admin" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Admin Console</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} L &amp; K Enterprise. Licensed wholesale distributor under Drugs &amp; Cosmetics Act. Strictly no direct patient dispensing.
            </p>
            <div className="flex items-center gap-3 font-mono text-[10px]">
              <span>CDSCO Compliant</span>
              <span>&bull;</span>
              <span>2°C–8°C Cryo-Verified</span>
              <span>&bull;</span>
              <span>2026 Core</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
