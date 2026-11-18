"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/ui/BrandMark";

export function HomeHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled ? "border-b border-line/70 bg-paper/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-[68px] items-center justify-between gap-4">
        <BrandMark />
        <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Distributors">
          <Link
            href="/lakshmi-pharma"
            className="inline-flex min-h-[36px] sm:min-h-[44px] items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-4 text-xs sm:text-base font-semibold text-ink bg-white/80 border border-line/70 hover:bg-white shadow-2xs transition-colors"
          >
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-lakshmi shrink-0" /> Lakshmi
          </Link>
          <Link
            href="/kothottil-pharma"
            className="inline-flex min-h-[36px] sm:min-h-[44px] items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-4 text-xs sm:text-base font-semibold text-ink bg-white/80 border border-line/70 hover:bg-white shadow-2xs transition-colors"
          >
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-kothottil shrink-0" /> Kothottil
          </Link>
        </nav>
      </div>
    </header>
  );
}
