import Link from "next/link";
import { ArrowRight, BadgeCheck, ExternalLink } from "lucide-react";
import { fetchManufacturers } from "@/lib/api";
import { getCompany } from "@/lib/server";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";

export const metadata = { title: "Manufacturers" };

export default async function ManufacturersPage({ params }: { params: { companySlug: string } }) {
  const slug = params.companySlug;
  const [company, res] = await Promise.all([getCompany(slug), fetchManufacturers(slug).catch(() => null)]);
  const list = res?.data ?? [];

  return (
    <div className="container-x pb-16 pt-6 sm:pt-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Manufacturers</h1>
      <p className="mt-2 max-w-2xl text-lg text-ink-soft">
        {company.name} is an authorised stockist for these companies. Tap one to see its products.
      </p>

      {list.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-line bg-white p-8 text-center text-lg">
          The manufacturer list is not available right now. Please try again shortly.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => (
            <li key={m.id} className="flex flex-col rounded-3xl border border-line bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <ManufacturerLogo name={m.name} logoUrl={m.logoUrl} size="lg" />
                {m.isAuthorized && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent-deep">
                    <BadgeCheck className="h-4 w-4" /> Authorised
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold">{m.name}</h2>
              {m.partnershipDetails && <p className="mt-1 text-base text-ink-soft">{m.partnershipDetails}</p>}
              <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                <Link href={`/${slug}/products?manufacturer=${m.slug}`} className="btn-primary flex-1">
                  {m.publishedProductCount ?? ""} products <ArrowRight className="h-5 w-5" />
                </Link>
                {m.website && (
                  <a
                    href={m.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink/10 hover:border-ink/30"
                    aria-label={`${m.name} website`}
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
