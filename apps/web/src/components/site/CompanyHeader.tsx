"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  ClipboardList,
  Menu,
  Phone,
  Search,
  X,
} from "lucide-react";
import { Company } from "@/types";
import { telHref } from "@/lib/companies";
import { CapsuleMark } from "@/components/ui/BrandMark";
import { useInquiry } from "@/components/inquiry/InquiryContext";

export function companyNav(slug: string) {
  return [
    { href: `/${slug}`, label: "Overview" },
    { href: `/${slug}/products`, label: "Products" },
    { href: `/${slug}/manufacturers`, label: "Manufacturers" },
    { href: `/${slug}/contact`, label: "Contact" },
  ];
}

export function isActivePath(pathname: string, href: string, slug: string) {
  return href === `/${slug}` ? pathname === href : pathname.startsWith(href);
}

export function CompanyHeader({ company }: { company: Company }) {
  const pathname = usePathname();
  const { totalCount, openInquiry } = useInquiry();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLakshmi = company.slug === "lakshmi-pharma";

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle escape key to dismiss mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/95 backdrop-blur-md">
      {/* Top Utility Bar (Supernav) - Enterprise Network & Distributor Context */}
      <div className="border-b border-line/60 bg-[#EDEAE3]/90 text-xs text-ink-soft backdrop-blur-sm">
        <div className="container-wide flex h-9 items-center justify-between gap-3">
          {/* Left: Network Portal breadcrumb & return link */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 font-medium text-ink-soft hover:text-ink transition-colors"
              title="Return to L&K Pharma Network home"
            >
              <Building2 className="h-3.5 w-3.5 text-accent transition-transform group-hover:-translate-x-0.5" />
              <span className="font-semibold text-ink">L&amp;K Pharma Network</span>
              <span className="text-ink-mute">/</span>
              <span className="inline-flex items-center gap-1 text-accent font-semibold group-hover:underline">
                <ArrowLeft className="h-3 w-3" />
                <span>Network Hub</span>
              </span>
            </Link>
            <span className="hidden md:inline text-line-dark">•</span>
            <span className="hidden md:inline text-ink-mute truncate">
              South India Wholesale Healthcare Distribution
            </span>
          </div>

          {/* Right: Quick Distributor Switcher & Direct Support */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-[0.72rem]">
              <span className="hidden lg:inline text-ink-mute">Distributor:</span>
              <div className="inline-flex items-center rounded-full border border-line bg-white/90 p-0.5 shadow-xs">
                <Link
                  href="/lakshmi-pharma"
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold transition-all ${
                    isLakshmi
                      ? "bg-[#E11D48] text-white shadow-xs font-bold"
                      : "text-ink-soft hover:text-ink hover:bg-black/5"
                  }`}
                  title="View Lakshmi Pharma Portal"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isLakshmi ? "bg-white" : "bg-[#E11D48]"}`} />
                  Lakshmi
                </Link>
                <Link
                  href="/kothittil-pharma"
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold transition-all ${
                    !isLakshmi
                      ? "bg-[#2450C8] text-white shadow-xs font-bold"
                      : "text-ink-soft hover:text-ink hover:bg-black/5"
                  }`}
                  title="View The Kothittil Portal"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${!isLakshmi ? "bg-white" : "bg-[#2450C8]"}`} />
                  Kothittil
                </Link>
              </div>
            </div>

            <a
              href={telHref(company.phone)}
              className="hidden sm:inline-flex items-center gap-1.5 font-medium text-ink-soft hover:text-ink transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-accent" />
              <span className="hidden xl:inline text-ink-mute">Order Desk:</span>
              <span className="font-semibold">{company.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container-wide flex h-16 sm:h-[70px] items-center justify-between gap-3 sm:gap-6">
        {/* Brand Anchor (Logo + Title) */}
        <Link
          href={`/${company.slug}`}
          className="group flex items-center gap-2.5 sm:gap-3 rounded-lg focus:outline-none"
          aria-label={`${company.name} Home`}
        >
          <CapsuleMark className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 transition-transform group-hover:scale-105" />
          <span className="leading-tight min-w-0">
            <span className="block truncate font-display text-base sm:text-lg lg:text-xl font-bold tracking-tight text-ink group-hover:text-accent transition-colors">
              {company.shortName}{" "}
              <span className="font-semibold text-ink-soft sm:inline">Pharma</span>
            </span>
            <span className="hidden sm:block text-[0.7rem] font-medium text-ink-mute tracking-wide">
              Authorized Wholesale Distributor
            </span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
          {companyNav(company.slug).map((item) => {
            const active = isActivePath(pathname, item.href, company.slug);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-4 py-2 text-sm font-semibold transition-all rounded-lg ${
                  active
                    ? "bg-accent/10 text-accent font-bold"
                    : "text-ink-soft hover:bg-black/[0.04] hover:text-ink"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-2.5 -bottom-1 h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Search, Enquiry List CTA & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Catalogue Shortcut */}
          <Link
            href={`/${company.slug}/products`}
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-line bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-ink-soft shadow-xs hover:border-ink/20 hover:text-ink hover:bg-white transition-all"
            title="Search medicines and products"
          >
            <Search className="h-3.5 w-3.5 text-ink-mute" />
            <span>Search catalogue</span>
          </Link>

          {/* Primary Enquiry List CTA */}
          <button
            onClick={() => openInquiry()}
            className="btn-primary min-h-[38px] sm:min-h-[42px] gap-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold shadow-xs"
            aria-label={`Enquiry list with ${totalCount} items`}
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Enquiry List</span>
            <span className="sm:hidden">Enquiry</span>
            <span
              className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.7rem] font-bold transition-transform ${
                totalCount ? "bg-white text-accent scale-105" : "bg-white/25 text-white"
              }`}
            >
              {totalCount}
            </span>
          </button>

          {/* Mobile / Tablet Menu Button (Hamburger) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex lg:hidden items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-line bg-white/90 text-ink-soft hover:text-ink hover:bg-white shadow-xs transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-line/80 bg-paper/98 backdrop-blur-xl px-4 py-5 shadow-xl animate-rise">
          <div className="space-y-4">
            {/* Search Input Shortcut */}
            <form action={`/${company.slug}/products`} role="search" onSubmit={() => setMobileMenuOpen(false)}>
              <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 shadow-xs focus-within:border-accent">
                <Search className="h-4 w-4 text-ink-mute shrink-0" />
                <input
                  name="q"
                  type="search"
                  placeholder="Search medicines, salts, brands..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-ink-mute"
                />
                <button type="submit" className="rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-white">
                  Search
                </button>
              </div>
            </form>

            {/* Primary Navigation Links */}
            <div className="space-y-1">
              <p className="text-[0.68rem] font-bold uppercase tracking-wider text-ink-mute px-1">Navigation</p>
              <div className="grid grid-cols-2 gap-2">
                {companyNav(company.slug).map((item) => {
                  const active = isActivePath(pathname, item.href, company.slug);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                        active
                          ? "bg-accent text-white shadow-xs font-bold"
                          : "bg-white/80 border border-line/70 text-ink hover:bg-white"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronRight className={`h-3.5 w-3.5 ${active ? "text-white/80" : "text-ink-mute"}`} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Distributor Switcher Card */}
            <div className="rounded-2xl border border-line bg-white/90 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-ink-mute">
                <span>Switch Partner Distributor</span>
                <span className="text-[0.65rem] uppercase tracking-wider">L&amp;K Network</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/lakshmi-pharma"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-semibold transition-all ${
                    isLakshmi
                      ? "bg-[#E11D48] text-white shadow-xs font-bold"
                      : "border border-line/80 bg-paper/60 text-ink-soft hover:bg-paper"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isLakshmi ? "bg-white" : "bg-[#E11D48]"}`} />
                  Lakshmi Pharma
                </Link>
                <Link
                  href="/kothittil-pharma"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-semibold transition-all ${
                    !isLakshmi
                      ? "bg-[#2450C8] text-white shadow-xs font-bold"
                      : "border border-line/80 bg-paper/60 text-ink-soft hover:bg-paper"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${!isLakshmi ? "bg-white" : "bg-[#2450C8]"}`} />
                  The Kothittil
                </Link>
              </div>
            </div>

            {/* Contact & Network Hub Links */}
            <div className="pt-2 border-t border-line/60 flex flex-col gap-2">
              <a
                href={telHref(company.phone)}
                className="flex items-center justify-between rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-paper/50"
              >
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-accent" />
                  <span>Direct Order Desk</span>
                </span>
                <span className="text-accent font-bold">{company.phone}</span>
              </a>

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-ink/5 py-2 text-xs font-semibold text-ink-soft hover:bg-ink/10 hover:text-ink transition-colors"
              >
                <Building2 className="h-3.5 w-3.5 text-ink-mute" />
                <span>Return to L&amp;K Pharma Network Home</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
