import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Company } from "@/types";
import { companyColor, telHref } from "@/lib/companies";
import { CapsuleMark } from "@/components/ui/BrandMark";

export function SiteFooter({ companies }: { companies: Company[] }) {
  return (
    <footer className="bg-ink text-white/80">
      <div className="container-x py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-90">
          <CapsuleMark className="h-10 w-10" />
          <div>
            <p className="font-display text-xl font-semibold text-white">L&amp;K Pharma Network</p>
            <p className="text-sm text-white/60">Licensed wholesale distributors · For trade buyers only</p>
          </div>
        </Link>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {companies.map((c) => {
            const color = companyColor(c.slug);
            return (
              <section key={c.slug} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: color.main }} />
                  <h2 className="font-display text-lg font-semibold text-white">{c.name}</h2>
                </div>
                <ul className="mt-4 space-y-3 text-base">
                  <li>
                    <a href={telHref(c.phone)} className="flex items-center gap-3 hover:text-white">
                      <Phone className="h-5 w-5 shrink-0 text-white/50" /> {c.phone}
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${c.email}`} className="flex items-center gap-3 break-all hover:text-white">
                      <Mail className="h-5 w-5 shrink-0 text-white/50" /> {c.email}
                    </a>
                  </li>
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-white/50" /> {c.address}
                  </li>
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-white/50" /> {c.businessHours}
                  </li>
                </ul>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-base font-semibold text-white">
                  <Link href={`/${c.slug}/products`} className="underline-offset-4 hover:underline">
                    Products
                  </Link>
                  <Link href={`/${c.slug}/manufacturers`} className="underline-offset-4 hover:underline">
                    Manufacturers
                  </Link>
                  <Link href={`/${c.slug}/contact`} className="underline-offset-4 hover:underline">
                    Contact
                  </Link>
                </div>
                {c.drugLicenseNo && <p className="mt-4 text-sm text-white/50">Drug licence: {c.drugLicenseNo}</p>}
              </section>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} L&amp;K Pharma Network. Wholesale distribution under the Drugs &amp; Cosmetics
            Act. No direct sale to patients.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white">
              Network Home
            </Link>
            <span>·</span>
            <Link href="/admin" className="hover:text-white">
              Staff login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
