"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { COMPANY_SLUGS } from "@/lib/companies";
import { INTRO_KEY } from "@/components/site/CompanyIntro";

function companyOf(pathname: string) {
  return COMPANY_SLUGS.find((s) => pathname === `/${s}` || pathname.startsWith(`/${s}/`));
}

/**
 * Home page only: remembers which company the visitor is heading into so the
 * company layout can play its short capsule reveal on arrival.
 */
export function CompanyIntroTrigger() {
  const router = useRouter();

  useEffect(() => {
    const mark = (slug: string) => {
      try {
        sessionStorage.setItem(INTRO_KEY, slug);
      } catch {}
    };

    const onClick = (e: MouseEvent) => {
      // next/link calls preventDefault for client routing, so don't treat that as "cancelled"
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a");
      if (!a || a.target === "_blank" || a.origin !== location.origin) return;
      const slug = companyOf(a.pathname);
      if (slug) mark(slug);
    };

    // The catalogue search forms are plain GET forms; route them client-side so the
    // reveal plays over the new page instead of after a full reload.
    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      const url = new URL(form.action, location.href);
      const slug = companyOf(url.pathname);
      if (!slug || form.method.toLowerCase() !== "get") return;
      e.preventDefault();
      const params = new URLSearchParams();
      new FormData(form).forEach((v, k) => typeof v === "string" && v.trim() && params.set(k, v.trim()));
      mark(slug);
      const qs = params.toString();
      router.push(qs ? `${url.pathname}?${qs}` : url.pathname);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit);
    };
  }, [router]);

  return null;
}
