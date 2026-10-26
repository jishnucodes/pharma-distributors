import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  PhoneCall, 
  FileCheck, 
  Sparkles, 
  Truck, 
  ThermometerSnowflake,
  Lock,
  Building,
  CheckCircle2
} from "lucide-react";
import { FloatingCapsuleHeader } from "@/components/home/FloatingCapsuleHeader";
import { HeroKineticShowcase } from "@/components/home/HeroKineticShowcase";
import { DistributorSpatialGateways } from "@/components/home/DistributorSpatialGateways";
import { ColdChainTelemetryWidget } from "@/components/home/ColdChainTelemetryWidget";
import { KineticPartnerMarquee } from "@/components/home/KineticPartnerMarquee";
import { ScrollAnimatedBackground } from "@/components/common/ScrollAnimatedBackground";

export default function MasterLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/40 text-slate-900 selection:bg-teal-500 selection:text-white relative">
      {/* 2026 Modern Scroll-Animated Pharmaceutical Background */}
      <ScrollAnimatedBackground variant="lakshmi" />

      {/* 2026 Floating Frosted Capsule Navigation */}
      <FloatingCapsuleHeader />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Kinetic Hero Section with 3D Mouse Tilt and Levitating Centerpiece */}
        <HeroKineticShowcase />

        {/* Spatial 3D Dual Distributor Gateways (Lakshmi Pharma vs The Kothittil) */}
        <DistributorSpatialGateways />

        {/* Cold-Chain 2°C - 8°C Sensor Telemetry & Batch Audit Simulator */}
        <ColdChainTelemetryWidget />

        {/* Infinite Kinetic Authorized Manufacturer Marquee */}
        <KineticPartnerMarquee />

        {/* Institutional Onboarding & Commercial Procurement CTA */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden">
          {/* Subtle Glow Spheres */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="rounded-3xl glass-dark border border-white/10 p-8 sm:p-12 lg:p-16 text-center max-w-4xl mx-auto space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold tracking-tight">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Licensed B2B Wholesale Commercial Desk</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Ready to Streamline Your Hospital or Pharmacy Supply Chain?
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Connect directly with commercial trade officers at Lakshmi Pharma or The Kothittil Distributor. Fast onboarding with verified drug license authentication and volume contract pricing.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/lakshmi-pharma/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-xs text-slate-900 bg-white hover:bg-slate-100 shadow-lg transition-all duration-200 hover:scale-102"
                >
                  <PhoneCall className="w-4 h-4 text-teal-700" />
                  <span>Contact Lakshmi Trade Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/kothittil-pharma/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200 hover:scale-102"
                >
                  <Building className="w-4 h-4 text-white" />
                  <span>Contact Kothittil Specialty Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Badges strip */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  Drugs &amp; Cosmetics Act Certified
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  GST Wholesale Invoicing
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  Zero Patient Dispensing (Strict B2B)
                </span>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Modern High-End Master Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-700 via-emerald-800 to-blue-900 flex items-center justify-center font-black text-white text-sm shadow-md">
                L&amp;K
              </div>
              <div>
                <span className="font-black text-white text-base tracking-tight">
                  L &amp; K Pharmaceutical Network
                </span>
                <p className="text-[11px] text-slate-500">
                  Lakshmi Pharma &bull; The Kothittil Pharmaceutical Distributor
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <Link href="/lakshmi-pharma" className="text-slate-400 hover:text-white transition-colors">
                Lakshmi Pharma Portal
              </Link>
              <span className="text-slate-700">&bull;</span>
              <Link href="/kothittil-pharma" className="text-slate-400 hover:text-white transition-colors">
                The Kothittil Portal
              </Link>
              <span className="text-slate-700">&bull;</span>
              <Link href="/admin" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Admin Console</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} L &amp; K Enterprise. Licensed wholesale B2B distributor under the Drugs and Cosmetics Act. Strictly no direct patient dispensing.
            </p>
            <div className="flex items-center gap-3 font-mono">
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
