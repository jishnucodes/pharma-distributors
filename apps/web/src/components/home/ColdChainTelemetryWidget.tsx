"use client";

import React, { useState, useEffect } from "react";
import { 
  ThermometerSnowflake, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Radio, 
  MapPin, 
  Clock, 
  Search,
  Sparkles,
  FileCheck2,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BatchInfo {
  batchId: string;
  drug: string;
  mfg: string;
  temp: string;
  status: "In Transit" | "Dispatched" | "Verified In Cold-Vault";
  route: string;
  eta: string;
  tempStatus: "Optimal" | "Compliant";
}

const SAMPLE_BATCHES: BatchInfo[] = [
  {
    batchId: "LK-BIO-9024",
    drug: "Recombinant Human Insulin (100 IU/mL)",
    mfg: "Biocon / Sanofi Partner",
    temp: "3.6°C",
    status: "Verified In Cold-Vault",
    route: "Central Reefer Bay 4 -> Cochin Medical Trust",
    eta: "Ready For Dispatch",
    tempStatus: "Optimal",
  },
  {
    batchId: "LK-GEN-4812",
    drug: "Augmentin 625 Duo Tablets",
    mfg: "GlaxoSmithKline (GSK)",
    temp: "21.4°C",
    status: "In Transit",
    route: "Aluva Distribution Hub -> Palakkad Route 2",
    eta: "Today 14:30 IST",
    tempStatus: "Compliant",
  },
  {
    batchId: "LK-CC-7731",
    drug: "Enoxaparin Sodium Injection (40mg/0.4mL)",
    mfg: "Sanofi India",
    temp: "4.1°C",
    status: "In Transit",
    route: "Trivandrum Cold Pod 08 -> KIMS Health Hospital",
    eta: "Priority Delivery (< 1 hr)",
    tempStatus: "Optimal",
  },
];

export function ColdChainTelemetryWidget() {
  const [selectedBatch, setSelectedBatch] = useState<BatchInfo>(SAMPLE_BATCHES[0]);
  const [currentTemp, setCurrentTemp] = useState(3.6);
  const [isSimulating, setIsSimulating] = useState(false);

  // Subtle real-time temperature fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.5) * 0.2;
      setCurrentTemp((prev) => {
        const next = parseFloat((prev + delta).toFixed(1));
        return next >= 2.5 && next <= 4.8 ? next : 3.6;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBatchSelect = (batch: BatchInfo) => {
    setIsSimulating(true);
    setTimeout(() => {
      setSelectedBatch(batch);
      setCurrentTemp(parseFloat(batch.temp));
      setIsSimulating(false);
    }, 250);
  };

  return (
    <section className="py-20 bg-white border-t border-slate-200/80 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-50/70 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-50/70 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
            <span>Telemetry &amp; Audit Transparency</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Live Cold-Chain &amp; Batch Traceability
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Every refrigerated batch dispatched through the L &amp; K network is monitored within calibrated 2°C – 8°C sensor enclosures to guarantee therapeutic efficacy upon arrival.
          </p>
        </div>

        {/* Interactive Telemetry Console */}
        <div className="max-w-5xl mx-auto rounded-3xl glass-panel border border-slate-200/90 shadow-2xl p-6 sm:p-10 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Live Gauge and Sensors */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <ThermometerSnowflake className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-200">
                      Sensor Pod #RE-04
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Calibrated
                  </span>
                </div>

                {/* Main Temperature Display */}
                <div className="py-6 flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
                    {currentTemp.toFixed(1)}
                  </span>
                  <span className="text-2xl font-bold text-cyan-300">°C</span>
                  <div className="ml-auto text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Tolerance Band</div>
                    <div className="text-xs font-mono font-bold text-cyan-300">2.0°C — 8.0°C</div>
                  </div>
                </div>

                {/* Live Pulse Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Stability Index</span>
                    <span className="text-emerald-400 font-bold">99.98% Constant</span>
                  </div>
                  <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 h-full rounded-full"
                      animate={{ width: ["96%", "99%", "97%", "99.5%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Battery Reserve: 98%</span>
                  <span>Sensor Sync: 4s ago</span>
                </div>
              </div>

              {/* Verified Certificate Pill */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-900">Zero Cold-Chain Breach Guarantee</div>
                  <div className="text-emerald-700 text-[11px]">Temperature logs tamper-sealed under Indian FDA standards.</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Batch Lookup & Details */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Interactive Batch Audit Simulator
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Live Sync
                </span>
              </div>

              {/* Sample Batch Buttons */}
              <div className="flex flex-wrap gap-2">
                {SAMPLE_BATCHES.map((batch) => (
                  <button
                    key={batch.batchId}
                    onClick={() => handleBatchSelect(batch)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all duration-200 border ${
                      selectedBatch.batchId === batch.batchId
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs"
                    }`}
                  >
                    {batch.batchId}
                  </button>
                ))}
              </div>

              {/* Batch Card Detail */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedBatch.batchId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl p-6 bg-slate-50/80 border border-slate-200/80 space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <div className="text-xs font-mono font-bold text-teal-700">
                        Batch No: {selectedBatch.batchId}
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        {selectedBatch.drug}
                      </h4>
                    </div>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs shrink-0 self-start sm:self-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedBatch.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Manufacturer:</span>
                      <div className="font-bold text-slate-800 mt-0.5">{selectedBatch.mfg}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Recorded Pod Temp:</span>
                      <div className="font-bold font-mono text-cyan-700 mt-0.5">{selectedBatch.temp}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Transit Corridor:</span>
                      <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{selectedBatch.route}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Dispatch Status:</span>
                      <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{selectedBatch.eta}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Action Note */}
              <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                <span className="flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-teal-600" />
                  <span>Licensed wholesale invoices generated with active batch cold-chain log attachments.</span>
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
