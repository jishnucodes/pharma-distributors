"use client";

import React from "react";
import { 
  Sparkles, 
  ShieldCheck, 
  ThermometerSnowflake, 
  Activity, 
  Award, 
  Truck,
  CheckCircle2,
  Package
} from "lucide-react";

interface CompanyKineticMarqueeProps {
  themeColor?: "emerald" | "blue";
}

const THERAPEUTIC_CLASSES = [
  "Anti-Infectives & Antibiotics",
  "Cardiology & Hypertension",
  "Diabetology & Glycemic Care",
  "Cryo-Monitored Biologics & Vaccines",
  "Analgesics & Anti-Inflammatories",
  "Critical Care ICU Injections",
  "Gastroenterology & PPI Formulations",
  "Respiratory & Anti-Asthmatics",
  "Oncology & Specialty Monoclonals",
];

const COMPLIANCE_PILLARS = [
  "CDSCO Form 20B/21B Compliant",
  "100% Verified Batch Telemetry",
  "Real-Time 2°C–8°C IoT Sensors",
  "Direct Manufacturer GST Wholesale Billing",
  "Same-Day Regional Dispatch Core",
  "< 4hr Emergency Hospital Fulfillment",
  "Zero Direct Patient Dispensing (Strict B2B)",
  "Tamper-Evident Insulated Packaging",
];

export function CompanyKineticMarquee({ themeColor = "emerald" }: CompanyKineticMarqueeProps) {
  const isEmerald = themeColor === "emerald";

  const track1 = [...THERAPEUTIC_CLASSES, ...THERAPEUTIC_CLASSES, ...THERAPEUTIC_CLASSES];
  const track2 = [...COMPLIANCE_PILLARS, ...COMPLIANCE_PILLARS, ...COMPLIANCE_PILLARS];

  return (
    <section className="py-6 overflow-hidden border-y border-slate-200/80 bg-slate-50/50 space-y-2 select-none">
      {/* Top Track (Moving Left): Therapeutic Formulations */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-4 py-1 items-center">
          {track1.map((item, index) => (
            <div
              key={`cat-${index}`}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs font-mono text-xs font-bold text-slate-800 tracking-tight"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isEmerald ? "bg-teal-500" : "bg-blue-600"}`} />
              <span>{item}</span>
              <span className="text-slate-300 font-normal">✱</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Track (Moving Right): SLA & Regulatory Guarantees */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

        <div 
          className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-4 py-1 items-center"
          style={{ animationDirection: "reverse" }}
        >
          {track2.map((item, index) => (
            <div
              key={`comp-${index}`}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-[11px] font-mono font-semibold text-slate-600 tracking-wide"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>{item}</span>
              <span className="text-slate-300">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
