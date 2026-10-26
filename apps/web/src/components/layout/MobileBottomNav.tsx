"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Home, 
  Package, 
  Layers, 
  Building2, 
  PhoneCall, 
  Sparkles 
} from "lucide-react";
import { Company } from "@/types";

interface MobileBottomNavProps {
  currentCompany?: Company;
}

export function MobileBottomNav({ currentCompany }: MobileBottomNavProps) {
  const pathname = usePathname();
  const activeSlug =
    currentCompany?.slug ||
    (pathname.includes("kothittil") ? "kothittil-pharma" : "lakshmi-pharma");
  const isLakshmi = activeSlug === "lakshmi-pharma";

  const navItems = [
    {
      label: "Overview",
      shortLabel: "Home",
      href: `/${activeSlug}`,
      icon: Home,
      exact: true,
    },
    {
      label: "Catalog",
      shortLabel: "Catalog",
      href: `/${activeSlug}/products`,
      icon: Package,
      exact: false,
    },
    {
      label: "Brands",
      shortLabel: "Brands",
      href: `/${activeSlug}/manufacturers`,
      icon: Layers,
      exact: false,
    },
    {
      label: "About",
      shortLabel: "About",
      href: `/${activeSlug}/about`,
      icon: Building2,
      exact: false,
    },
    {
      label: "Trade Desk",
      shortLabel: "Contact",
      href: `/${activeSlug}/contact`,
      icon: PhoneCall,
      exact: false,
    },
  ];

  return (
    <nav
      aria-label="Mobile and Mid Screen Bottom Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/92 backdrop-blur-2xl border-t border-slate-200/90 shadow-[0_-8px_32px_rgba(15,23,42,0.12)] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 transition-all duration-300"
    >
      <div className="max-w-md sm:max-w-xl mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-5 items-center">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href || pathname === `${item.href}/`
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col items-center justify-center py-1 px-0.5 sm:px-1.5 relative rounded-2xl transition-all duration-150 active:scale-95"
              >
                {/* Glowing Top Active Bar */}
                {isActive && (
                  <motion.span
                    layoutId="activeBottomBarIndicator"
                    className={`absolute top-0 w-8 sm:w-10 h-0.75 rounded-full ${
                      isLakshmi
                        ? "bg-teal-600 shadow-[0_0_10px_rgba(13,148,136,0.6)]"
                        : "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.6)]"
                    }`}
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                {/* Icon Container */}
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? isLakshmi
                        ? "text-teal-700 bg-teal-50/90 shadow-2xs"
                        : "text-blue-700 bg-blue-50/90 shadow-2xs"
                      : "text-slate-500 group-hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
                </div>

                {/* Text Label */}
                <span
                  className={`text-[10px] sm:text-[11px] tracking-tight leading-tight mt-0.5 truncate max-w-full transition-colors ${
                    isActive
                      ? isLakshmi
                        ? "font-bold text-teal-900"
                        : "font-bold text-blue-900"
                      : "font-medium text-slate-500 group-hover:text-slate-700"
                  }`}
                >
                  <span className="sm:hidden">{item.shortLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
