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
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Distributors">
          <Link
            href="/lakshmi-pharma"
            className="hidden min-h-[44px] items-center gap-2 rounded-full px-4 text-base font-semibold text-ink hover:bg-white sm:inline-flex"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-lakshmi" /> Lakshmi
          </Link>
          <Link
            href="/kothottil-pharma"
            className="hidden min-h-[44px] items-center gap-2 rounded-full px-4 text-base font-semibold text-ink hover:bg-white sm:inline-flex"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-kothottil" /> Kothottil
          </Link>
          {/* <a href="#choose" className="btn-ink min-h-[44px] px-5 text-[0.95rem]">
            Catalogues
          </a> */}
        </nav>
      </div>
    </header>
  );
}
