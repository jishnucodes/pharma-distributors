import Link from "next/link";
import { ArrowRight, Search, Phone, MessageCircle, Clock, MapPin, ShieldCheck } from "lucide-react";
import { fetchCatalog, fetchManufacturers } from "@/lib/api";
import { companyColor, featuredToProduct, telHref, whatsappHref } from "@/lib/companies";
import { getCompany } from "@/lib/server";
import { DoseViewer } from "@/components/three/DoseViewer";
import { ProductTable } from "@/components/catalog/ProductTable";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";
import { DoseIcon } from "@/components/ui/DoseIcon";

export default async function CompanyOverviewPage({ params }: { params: { companySlug: string } }) {
  const slug = params.companySlug;
  const [company, catalog, makers] = await Promise.all([
    getCompany(slug),
    fetchCatalog(slug, { limit: 1 }).catch(() => null),
    fetchManufacturers(slug).catch(() => null),
  ]);
  const color = companyColor(slug);
  const featured = (company.featuredProducts ?? []).map(featuredToProduct);
  const meta = catalog?.filterMeta;
  const totalProducts = company.stats?.totalProducts ?? catalog?.total;
  const totalMakers = company.stats?.totalManufacturers ?? makers?.data.length;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: `radial-gradient(ellipse at 78% 40%, ${color.soft}, transparent 62%)` }}
        />
        <div className="container-x grid items-center gap-4 pb-12 pt-6 md:grid-cols-[1.1fr_1fr] md:gap-10 md:pb-20 md:pt-14">
          <DoseViewer
            accent={color.main}
            hint={false}
            className="order-first -mx-4 h-[240px] sm:h-[320px] md:order-last md:mx-0 md:h-[460px]"
          />
          <div className="min-w-0">
            <p className="eyebrow flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" /> Authorised distributor
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {company.name}
            </h1>
            {company.tagline && <p className="mt-3 text-xl leading-snug text-ink-soft">{company.tagline}</p>}

            <form action={`/${slug}/products`} role="search" className="mt-7">
              <label htmlFor="hero-q" className="text-base font-semibold">
                Find a medicine
              </label>
              <div className="mt-2 flex gap-2 rounded-full border-2 border-line bg-white p-1.5 shadow-card focus-within:border-accent">
                <Search className="ml-3 h-6 w-6 shrink-0 self-center text-ink-mute" aria-hidden="true" />
                <input
                  id="hero-q"
                  name="q"
                  type="search"
                  placeholder="Brand or salt, e.g. Paracetamol"
                  className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-ink-mute"
                />
                <button type="submit" className="btn-primary px-5">
                  Search
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <a href={telHref(company.phone)} className="btn-outline">
                <Phone className="h-5 w-5" /> Call now
              </a>
              {company.whatsapp && (
                <a href={whatsappHref(company.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-outline">
                  <MessageCircle className="h-5 w-5" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick facts */}
      <section className="border-y border-line bg-white">
        <dl className="container-x grid grid-cols-2 gap-px py-2 md:grid-cols-4">
          {[
            { label: "Products", value: totalProducts ?? "—" },
            { label: "Manufacturers", value: totalMakers ?? "—" },
            { label: "Open", value: company.businessHours, small: true, icon: Clock },
            { label: "We serve", value: company.serviceAreas, small: true, icon: MapPin },
          ].map((f) => (
            <div key={f.label} className="px-2 py-4 sm:px-4">
              <dt className="text-sm font-semibold text-ink-mute">{f.label}</dt>
              <dd className={f.small ? "mt-1 text-base font-semibold leading-snug" : "font-display text-4xl font-semibold text-accent-deep"}>
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Browse by form */}
      {/* {meta && meta.dosageForms.length > 0 && (
        <section className="container-x pt-14 sm:pt-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Browse by type</h2>
          <ul className="no-scrollbar -mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            {meta.dosageForms.map((d) => (
              <li key={d.name} className="snap-start">
                <Link
                  href={`/${slug}/products?dosageForm=${encodeURIComponent(d.name)}`}
                  className="flex min-h-[64px] items-center gap-3 whitespace-nowrap rounded-2xl border border-line bg-white py-2 pl-2 pr-5 text-base font-semibold shadow-card hover:border-accent"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
                    <DoseIcon form={d.name} className="h-8 w-8" />
                  </span>
                  {d.name}
                  <span className="text-ink-mute">{d.count}</span>
                </Link>
              </li>
            ))}
            {meta.categories.map((c) => (
              <li key={c.slug} className="snap-start">
                <Link
                  href={`/${slug}/products?category=${c.slug}`}
                  className="flex min-h-[64px] items-center gap-3 whitespace-nowrap rounded-2xl border border-line bg-white px-5 text-base font-semibold shadow-card hover:border-accent"
                >
                  {c.name}
                  <span className="text-ink-mute">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )} */}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container-x pt-14 sm:pt-20">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Popular products</h2>
            <Link href={`/${slug}/products`} className="hidden items-center gap-2 text-base font-bold text-accent-deep hover:underline sm:inline-flex">
              See all <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="mt-6">
            <ProductTable products={featured} companySlug={slug} />
          </div>
          <Link href={`/${slug}/products`} className="btn-ink mt-6 w-full sm:hidden">
            See all products <ArrowRight className="h-5 w-5" />
          </Link>
        </section>
      )}

      {/* Manufacturers */}
      {makers && makers.data.length > 0 && (
        <section className="container-x pt-14 sm:pt-20">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Manufacturers we supply</h2>
            <Link href={`/${slug}/manufacturers`} className="hidden items-center gap-2 text-base font-bold text-accent-deep hover:underline sm:inline-flex">
              All manufacturers <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {makers.data.slice(0, 10).map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/${slug}/products?manufacturer=${m.slug}`}
                  className="flex h-full min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-white p-3 text-center hover:border-accent"
                >
                  <ManufacturerLogo name={m.name} logoUrl={m.logoUrl} className="border-0 shadow-none" />
                  {m.publishedProductCount !== undefined && (
                    <span className="text-sm text-ink-mute">{m.publishedProductCount} products</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* About */}
      <section id="about" className="container-x scroll-mt-24 py-14 sm:py-20">
        <div className="grid gap-6 rounded-4xl bg-accent-deep p-6 text-white sm:p-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">About {company.shortName}</h2>
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-white/85">{company.description}</p>
          </div>
          <div className="space-y-4 rounded-3xl bg-white/10 p-5 text-base">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" /> {company.address}
            </p>
            {company.drugLicenseNo && <p>Drug licence: {company.drugLicenseNo}</p>}
            {company.gstin && <p>GSTIN: {company.gstin}</p>}
            <Link href={`/${slug}/contact`} className="btn mt-2 w-full bg-white text-accent-deep hover:bg-accent-soft">
              Contact &amp; directions
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
