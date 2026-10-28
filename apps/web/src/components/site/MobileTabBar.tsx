"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Pill, Factory, Phone, ClipboardList } from "lucide-react";
import { useInquiry } from "@/components/inquiry/InquiryContext";
import { companyNav, isActivePath } from "./CompanyHeader";

const ICONS = [Home, Pill, Factory, Phone];
const SHORT = ["Home", "Products", "Brands", "Contact"];

/** Thumb-reach navigation for phones; large targets and always-visible labels. */
export function MobileTabBar({ slug }: { slug: string }) {
  const pathname = usePathname();
  const { totalCount, openInquiry } = useInquiry();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {companyNav(slug).map((item, i) => {
          const Icon = ICONS[i];
          const active = isActivePath(pathname, item.href, slug);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[0.8rem] font-semibold ${
                  active ? "text-accent-deep" : "text-ink-mute"
                }`}
              >
                <Icon className="h-6 w-6" aria-hidden="true" strokeWidth={active ? 2.4 : 2} />
                {SHORT[i]}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            onClick={() => openInquiry()}
            className="relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.8rem] font-semibold text-accent-deep"
          >
            <span className="relative">
              <ClipboardList className="h-6 w-6" aria-hidden="true" />
              {totalCount > 0 && (
                <span className="absolute -right-3 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-bold text-white">
                  {totalCount}
                </span>
              )}
            </span>
            Enquiry
          </button>
        </li>
      </ul>
    </nav>
  );
}
