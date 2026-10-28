"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Phone } from "lucide-react";
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

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="container-wide flex h-[68px] items-center gap-4 lg:gap-8">
        {/* Short company name keeps this to two tidy lines at every width */}
        <Link href={`/${company.slug}`} className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-lg">
          <CapsuleMark className="h-9 w-9 shrink-0" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate whitespace-nowrap font-display text-lg font-semibold text-ink">
              {company.shortName} <span className="hidden text-ink-mute sm:inline">Pharma</span>
            </span>
            <span className="block whitespace-nowrap text-xs font-medium text-ink-mute">L&amp;K Pharma network</span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Main">
          {companyNav(company.slug).map((item) => {
            const active = isActivePath(pathname, item.href, company.slug);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-base font-semibold transition-colors ${
                  active ? "bg-accent-soft text-accent-deep" : "text-ink-soft hover:bg-white hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <a
            href={telHref(company.phone)}
            className="hidden min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full px-3 text-base font-semibold text-ink-soft hover:bg-white hover:text-ink xl:inline-flex"
          >
            <Phone className="h-5 w-5" aria-hidden="true" /> {company.phone}
          </a>
          <button
            onClick={() => openInquiry()}
            className="btn-primary min-h-[44px] gap-2 px-4"
            aria-label={`Enquiry list, ${totalCount} items`}
          >
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">Enquiry list</span>
            <span
              className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-sm font-bold ${
                totalCount ? "bg-white text-accent-deep" : "bg-white/25 text-white"
              }`}
            >
              {totalCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
