"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Package,
  Layers,
  PhoneCall,
  Lock,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { Company } from "@/types";

interface HeaderProps {
  currentCompany?: Company;
  allCompanies?: Company[];
}

export function Header({ currentCompany, allCompanies = [] }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeSlug = currentCompany?.slug || (pathname.includes("kothittil") ? "kothittil-pharma" : "lakshmi-pharma");
  const isLakshmi = activeSlug === "lakshmi-pharma";

  // Function to switch company while preserving sub-path
  const handleSwitchCompany = (targetSlug: string) => {
    if (targetSlug === activeSlug) return;

    if (pathname.includes("/products/")) {
      // If on specific product detail page, go to target company's products catalog
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
    { label: "Product Catalog", href: `/${activeSlug}/products`, icon: Package },
    { label: "Manufacturers", href: `/${activeSlug}/manufacturers`, icon: Layers },
    { label: "About Distributor", href: `/${activeSlug}/about`, icon: Building2 },
    { label: "Trade Desk & Contact", href: `/${activeSlug}/contact`, icon: PhoneCall },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* 1. Flipkart-style Top Header Bar with Brand & Dual Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* L & K Master Brand Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group py-1">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-md transition-transform group-hover:scale-105 ${
                isLakshmi
                  ? "bg-gradient-to-br from-teal-600 to-emerald-800 shadow-teal-700/20"
                  : "bg-gradient-to-br from-blue-600 to-indigo-900 shadow-blue-700/20"
              }`}
            >
              <span className="tracking-tighter text-lg font-black font-sans">L&amp;K</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  L &amp; K
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Group
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 tracking-tight">
                Pharmaceutical Distributors
              </span>
            </div>
          </Link>

          {/* Flipkart-Style Navbar Dual Company Switcher */}
          <div className="hidden md:flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 shadow-inner max-w-xl flex-1 justify-center mx-4">
            {/* Tab 1: Lakshmi Pharma */}
            <button
              type="button"
              id="switch-to-lakshmi"
              onClick={() => handleSwitchCompany("lakshmi-pharma")}
              className={`flex-1 flex items-center gap-3 px-4 py-2 rounded-xl text-left transition-all duration-200 relative ${
                isLakshmi
                  ? "bg-white text-emerald-950 shadow-sm border border-emerald-400/80 ring-2 ring-emerald-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black transition-colors ${
                  isLakshmi ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                LP
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight truncate">Lakshmi Pharma</span>
                  {isLakshmi && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500 truncate">Ethical &amp; Generics</span>
              </div>
            </button>

            {/* Tab 2: The Kothittil Pharma */}
            <button
              type="button"
              id="switch-to-kothittil"
              onClick={() => handleSwitchCompany("kothittil-pharma")}
              className={`flex-1 flex items-center gap-3 px-4 py-2 rounded-xl text-left transition-all duration-200 relative ${
                !isLakshmi
                  ? "bg-white text-blue-950 shadow-sm border border-blue-400/80 ring-2 ring-blue-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black transition-colors ${
                  !isLakshmi ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                KP
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight truncate">
                    The Kothittil Pharma
                  </span>
                  {!isLakshmi && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500 truncate">Specialty &amp; Critical Care</span>
              </div>
            </button>
          </div>

          {/* Right Action: Admin portal & Quick Inquiry */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link
              href={`/${activeSlug}/contact`}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-colors ${
                isLakshmi
                  ? "bg-teal-700 hover:bg-teal-800"
                  : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>B2B Trade Desk</span>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80 transition-colors"
              title="Authorized distributor admin dashboard"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile hamburger toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Company Switcher Pills */}
        <div className="flex md:hidden items-center gap-2 pb-3 pt-1">
          <button
            type="button"
            onClick={() => handleSwitchCompany("lakshmi-pharma")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${
              isLakshmi
                ? "bg-emerald-50 text-emerald-800 border-emerald-500 ring-1 ring-emerald-500"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            <span>Lakshmi Pharma</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchCompany("kothittil-pharma")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${
              !isLakshmi
                ? "bg-blue-50 text-blue-800 border-blue-500 ring-1 ring-blue-500"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            <span>Kothittil Pharma</span>
          </button>
        </div>

        {/* 2. Company Navigation Bar */}
        <nav className="hidden md:flex items-center space-x-1 border-t border-slate-100 py-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? isLakshmi
                      ? "bg-teal-50 text-teal-800 font-bold"
                      : "bg-blue-50 text-blue-800 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <link.icon
                  className={`w-3.5 h-3.5 ${
                    isActive
                      ? isLakshmi
                        ? "text-teal-600"
                        : "text-blue-600"
                      : "text-slate-400"
                  }`}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500">
            <Sparkles
              className={`w-3.5 h-3.5 ${isLakshmi ? "text-emerald-500" : "text-blue-500"}`}
            />
            <span>Composition search enabled: Search by active salt, alias &amp; strength</span>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="font-semibold text-xs text-slate-400 uppercase tracking-wider px-2">
            {currentCompany?.name || (isLakshmi ? "Lakshmi Pharma" : "The Kothittil Pharma")}
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <div className="flex items-center gap-2.5">
                  <link.icon className="w-4 h-4 text-slate-400" />
                  <span>{link.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href={`/${activeSlug}/contact`}
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-center py-2.5 rounded-lg text-sm font-bold text-white ${
                isLakshmi ? "bg-teal-700" : "bg-blue-700"
              }`}
            >
              Contact Trade Desk
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200"
            >
              Authorized Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
