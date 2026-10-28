"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { companyColor } from "@/lib/companies";

export const INTRO_KEY = "lk_company_intro";
const DURATION = 950;

/**
 * Arrival from the home page: a capsule in the company colour appears, splits,
 * and its halves slide apart like curtains to reveal the page already loaded below.
 */
export function CompanyIntro({ slug, name }: { slug: string; name: string }) {
  const [show, setShow] = useState(false);

  // Layout effect so the overlay is in place before the new page first paints
  useLayoutEffect(() => {
    let flagged = false;
    try {
      flagged = sessionStorage.getItem(INTRO_KEY) === slug;
      sessionStorage.removeItem(INTRO_KEY);
    } catch {}
    if (flagged && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setShow(true);
  }, [slug]);

  // Separate from the flag read: that only succeeds once, so it must not own the timer
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), DURATION + 100);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;
  const color = companyColor(slug);

  return (
    <div className="fixed inset-0 z-[60] cursor-pointer" aria-hidden="true" onClick={() => setShow(false)}>
      {/* Two curtains, each carrying one half of the capsule */}
      <div className="lk-intro-left absolute inset-y-0 left-0 flex w-1/2 items-center justify-end bg-paper">
        <span
          className="lk-intro-pop block h-16 w-24 rounded-l-full shadow-lift sm:h-20 sm:w-28"
          style={{ background: `linear-gradient(180deg, ${color.main}, ${color.deep})`, transformOrigin: "right center" }}
        />
      </div>
      <div
        onAnimationEnd={(e) => e.target === e.currentTarget && setShow(false)}
        className="lk-intro-right absolute inset-y-0 right-0 flex w-1/2 items-center justify-start bg-paper"
      >
        <span
          className="lk-intro-pop block h-16 w-24 rounded-r-full bg-white shadow-lift ring-1 ring-line sm:h-20 sm:w-28"
          style={{ transformOrigin: "left center" }}
        />
      </div>
      <p className="lk-intro-name absolute inset-x-0 top-1/2 mt-14 text-center font-display text-xl font-semibold text-ink sm:mt-16 sm:text-2xl">
        {name}
      </p>
    </div>
  );
}
