"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Package,
  Layers,
  PhoneCall,
  Lock,
  Sparkles,
  Home,
  ShieldCheck,
  ThermometerSnowflake,
  Activity,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { motion } from "framer-motion";
import { Company } from "@/types";
import { useInquiry } from "@/components/inquiry/InquiryContext";

interface HeaderProps {
  currentCompany?: Company;
  allCompanies?: Company[];
}

export function Header({ currentCompany, allCompanies = [] }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const { totalCount, openInquiry } = useInquiry();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeSlug =
    currentCompany?.slug ||
    (pathname.includes("kothittil") ? "kothittil-pharma" : "lakshmi-pharma");
  const isLakshmi = activeSlug === "lakshmi-pharma";

  // Function to switch company while preserving sub-path
  const handleSwitchCompany = (targetSlug: string) => {
    if (targetSlug === activeSlug) return;

    if (pathname.includes("/products/")) {
      router.push(`/${targetSlug}/products`);
    } else if (pathname.includes("/products")) {
      router.push(`/${targetSlug}/products`);
    } else if (pathname.includes("/manufacturers/")) {
      router.push(`/${targetSlug}/manufacturers`);
    } else if (pathname.includes("/manufacturers")) {
      router.push(`/${targetSlug}/manufacturers`);
    } else if (pathname.includes("/about")) {
      router.push(`/${targetSlug}/about`);
    } else if (pathname.includes("/contact")) {
      router.push(`/${targetSlug}/contact`);
    } else {
      router.push(`/${targetSlug}`);
    }
  };

  const navLinks = [
    { label: "Overview", href: `/${activeSlug}`, icon: Home, exact: true },
    { label: "Product Catalog", href: `/${activeSlug}/products`, icon: Package, exact: false },
    { label: "Manufacturers", href: `/${activeSlug}/manufacturers`, icon: Layers, exact: false },
    { label: "About Distributor", href: `/${activeSlug}/about`, icon: Building2, exact: false },
    { label: "Trade Desk & Contact", href: `/${activeSlug}/contact`, icon: PhoneCall, exact: false },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-2 sm:top-3.5 z-40 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-300"
    >
      {/* Floating Frosted Glass Capsule */}
      <div
        className={`rounded-2xl sm:rounded-3xl transition-all duration-300 overflow-hidden ${
          scrolled
            ? "glass-surface shadow-2xl border-white/95"
            : "glass-surface shadow-lg"
        }`}
      >
        {/* ============================================================ */}
        {/* TIER 1: BRAND IDENTITY + DUAL DISTRIBUTOR SWITCHER           */}
        {/* ============================================================ */}
        <div className="px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-6 border-b-0 lg:border-b border-slate-100">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="relative">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-white shadow-md text-xs sm:text-base tracking-tight transition-transform duration-300 group-hover:scale-105 ${
                  isLakshmi
                    ? "bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 shadow-teal-700/20"
                    : "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 shadow-blue-700/20"
                }`}
              >
                L&amp;K
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isLakshmi ? "bg-emerald-400" : "bg-blue-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 border-2 border-white ${
                    isLakshmi ? "bg-emerald-500" : "bg-blue-500"
                  }`}
                />
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-base font-black tracking-tight text-slate-900">
                  L &amp; K
                </span>
                <span
                  className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full border ${
                    isLakshmi
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-blue-50 text-blue-800 border-blue-200"
                  }`}
                >
                  <span className="sm:hidden">{isLakshmi ? "Generics" : "ICU"}</span>
                  <span className="hidden sm:inline">{isLakshmi ? "Ethical Generics" : "Specialty ICU"}</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium tracking-tight hidden sm:block">
                Pharmaceutical Distributors
              </span>
            </div>
          </Link>

          {/* Distributor Switcher Capsule Pills */}
          <div className="flex items-center bg-slate-100/90 p-0.5 sm:p-1 rounded-full border border-slate-200/80 shadow-inner max-w-md flex-1 justify-center relative">
            {/* Tab 1: Lakshmi Pharma */}
            <button
              type="button"
              id="switch-to-lakshmi"
              onClick={() => handleSwitchCompany("lakshmi-pharma")}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs transition-all relative z-10 ${
                isLakshmi
                  ? "text-emerald-950 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isLakshmi && (
                <motion.div
                  layoutId="activeCompanyTabIndicator"
                  className="absolute inset-0 bg-white rounded-full shadow-sm border border-emerald-400/80 ring-2 ring-emerald-500/20 -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                  isLakshmi ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                }`}
              />
              <span className="truncate">
                <span className="sm:hidden">Lakshmi</span>
                <span className="hidden sm:inline">Lakshmi Pharma</span>
              </span>
            </button>

            {/* Tab 2: The Kothittil Pharma */}
            <button
              type="button"
              id="switch-to-kothittil"
              onClick={() => handleSwitchCompany("kothittil-pharma")}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs transition-all relative z-10 ${
                !isLakshmi
                  ? "text-blue-950 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {!isLakshmi && (
                <motion.div
                  layoutId="activeCompanyTabIndicator"
                  className="absolute inset-0 bg-white rounded-full shadow-sm border border-blue-400/80 ring-2 ring-blue-500/20 -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                  !isLakshmi ? "bg-blue-500 animate-pulse" : "bg-slate-300"
                }`}
              />
              <span className="truncate">
                <span className="sm:hidden">Kothittil</span>
                <span className="hidden sm:inline">The Kothittil Pharma</span>
              </span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Multi-Product Inquiry Tray Trigger */}
            <button
              type="button"
              onClick={() => openInquiry()}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-102 cursor-pointer ${
                totalCount > 0
                  ? isLakshmi
                    ? "bg-teal-50 text-teal-800 border border-teal-300 shadow-2xs"
                    : "bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80"
              }`}
              title="Multi-product inquiry tray"
            >
              <ClipboardList className={`w-3.5 h-3.5 ${totalCount > 0 ? (isLakshmi ? "text-teal-700" : "text-blue-700") : "text-slate-500"}`} />
              <span className="hidden sm:inline">Inquiry Tray</span>
              {totalCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black text-white ${
                    isLakshmi ? "bg-teal-700" : "bg-blue-700"
                  }`}
                >
                  {totalCount}
                </span>
              )}
            </button>

            <Link
              href={`/${activeSlug}/contact`}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-xs transition-transform hover:scale-102 ${
                isLakshmi
                  ? "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20"
                  : "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Trade Desk</span>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80 transition-colors"
              title="Authorized distributor admin dashboard"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline ml-1">Admin</span>
            </Link>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TIER 2: DESKTOP SUB HEADER (HIDDEN ON MOBILE / MID SCREENS)  */}
        {/* ============================================================ */}
        <nav
          aria-label="Desktop Distributor Section Navigation"
          className="hidden lg:flex px-6 py-2 bg-slate-50/70 border-t border-slate-100/80 items-center justify-between gap-3"
        >
          {/* Primary Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {navLinks.map((link) => {
              const isActive = link.exact
                ? pathname === link.href || pathname === `${link.href}/`
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all shrink-0 ${
                    isActive
                      ? isLakshmi
                        ? "bg-teal-600 text-white font-bold shadow-xs shadow-teal-600/30"
                        : "bg-blue-600 text-white font-bold shadow-xs shadow-blue-600/30"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80 font-medium"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Sub-Header Status Pill */}
          <div className="hidden md:flex items-center gap-2 shrink-0 text-[11px] font-medium text-slate-500">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-2xs">
              <ThermometerSnowflake className={`w-3.5 h-3.5 ${isLakshmi ? "text-teal-600" : "text-blue-600"}`} />
              <span className="font-mono font-bold text-slate-800">2°C – 8°C</span>
              <span className="text-slate-400">Cold Chain</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono text-slate-700">Form 20B/21B</span>
            </span>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
