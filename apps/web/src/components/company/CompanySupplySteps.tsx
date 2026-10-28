"use client";

import React from "react";
import { 
  Search, 
  Send, 
  FileCheck2, 
  Truck, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface CompanySupplyStepsProps {
  companyName: string;
  themeColor?: "emerald" | "blue";
}

const STEPS = [
  {
    step: "01",
    title: "Molecule Discovery",
    subtitle: "Real-Time SKU Verification",
    description: "Browse verified pharmaceutical formulations, chemical compositions, manufacturer origins, and storage specifications across active catalog SKUs.",
    icon: Search,
    pill: "Instant Search",
  },
  {
    step: "02",
    title: "Digital Inquiry Tray",
    subtitle: "One-Click Item Selection",
    description: "Add items to your inquiry tray, select desired packaging quantities, or upload hospital indents for customized volume pricing.",
    icon: Send,
    pill: "Friction-Free",
  },
  {
    step: "03",
    title: "Commercial Desk Review",
    subtitle: "GST Invoice & License Verification",
    description: "Our certified trade desk reviews drug licenses (Forms 20B/21B), applies volume wholesale discounts, and issues formal proforma invoices.",
    icon: FileCheck2,
    pill: "Authorized B2B",
  },
  {
    step: "04",
    title: "Calibrated Dispatch",
    subtitle: "Temperature Monitored Delivery",
    description: "Products dispatch from central cold-chain warehouses with digital batch telemetry, seal validation, and emergency hospital SLAs.",
    icon: Truck,
    pill: "Zero-Lag Transit",
  },
];

export function CompanySupplySteps({
  companyName,
  themeColor = "emerald",
}: CompanySupplyStepsProps) {
  const isEmerald = themeColor === "emerald";

  return (
    <section className="py-12 space-y-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Frictionless Healthcare Procurement</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How Procurement Works at {companyName}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Four disciplined steps engineered to ensure 100% regulatory compliance, authenticated drug license validation, and zero delivery delays.
        </p>
      </div>

      {/* 4 Steps Grid (bar-topas inspired step cards 01, 02, 03, 04) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((s, index) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="group relative rounded-3xl p-6 bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Step Number & Icon */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-slate-300 group-hover:text-slate-900 transition-colors">
                    {s.step}
                  </span>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-2xs transition-colors ${
                    isEmerald 
                      ? "bg-emerald-50 text-teal-700 border-emerald-200 group-hover:bg-teal-700 group-hover:text-white" 
                      : "bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-600 group-hover:text-white"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                    {s.subtitle}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {s.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {s.description}
                </p>
              </div>

              {/* Bottom Feature Pill */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                <span className="font-semibold text-slate-700">{s.pill}</span>
                <CheckCircle2 className={`w-3.5 h-3.5 ${isEmerald ? "text-teal-600" : "text-blue-600"}`} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
