import Link from "next/link";
import { ArrowRight, Search, ListPlus, Send, PhoneCall } from "lucide-react";
import { Company, Manufacturer } from "@/types";
import { fetchCompanies, fetchManufacturers } from "@/lib/api";
import { COMPANY_SLUGS, companyColor, fallbackCompany } from "@/lib/companies";
import { CapsuleStory } from "@/components/home/CapsuleStory";
import { HomeHeader } from "@/components/home/HomeHeader";
import { CompanyIntroTrigger } from "@/components/home/CompanyIntroTrigger";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";

export const revalidate = 300;

async function loadCompanies(): Promise<Company[]> {
  try {
    const list = await fetchCompanies();
    return COMPANY_SLUGS.map((slug) => list.find((c) => c.slug === slug) ?? fallbackCompany(slug));
  } catch {
    return COMPANY_SLUGS.map(fallbackCompany);
  }
}

async function loadManufacturers(): Promise<Manufacturer[]> {
  const results = await Promise.allSettled(COMPANY_SLUGS.map((s) => fetchManufacturers(s)));
  const bySlug = new Map<string, Manufacturer>();
  for (const r of results) if (r.status === "fulfilled") for (const m of r.value.data) bySlug.set(m.slug, m);
  return Array.from(bySlug.values());
}

export default async function HomePage() {
  const [companies, manufacturers] = await Promise.all([loadCompanies(), loadManufacturers()]);
  const [lakshmi, kothittil] = companies;

  return (
    <>
      <HomeHeader />
      <CompanyIntroTrigger />
      <main>
        <CapsuleStory lakshmi={lakshmi} kothittil={kothittil} />

        {/* Choose a distributor */}
        <section id="choose" className="scroll-mt-16 py-16 sm:py-24">
          <div className="container-x">
            <p className="eyebrow !text-ink-soft">Step inside</p>
            <h2 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Choose your distributor
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-ink-soft">
              Search by brand name or by salt (composition) — for example “Dolo 650” or “Paracetamol”.
            </p>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {companies.map((c) => (
                <DistributorCard key={c.slug} company={c} />
              ))}
            </div>
          </div>
        </section>

        {/* How enquiry works */}
        <section className="border-y border-line bg-white py-16 sm:py-24">
          <div className="container-x">
            <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Enquire in three steps</h2>
            <p className="mt-3 max-w-2xl text-lg text-ink-soft">
              No account or password needed. Ask for price and stock on as many products as you like.
            </p>
            <ol className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { icon: Search, title: "Find products", body: "Search by brand, salt or manufacturer. Filter by tablet, syrup and more." },
                { icon: ListPlus, title: "Add to your list", body: "Tap “Add to enquiry” on each product. Add quantities if you know them." },
                { icon: Send, title: "Send once", body: "Fill in your name and phone. The distributor calls or WhatsApps you back." },
              ].map((s, i) => (
                <li key={s.title} className="relative rounded-3xl border border-line bg-paper p-6 sm:p-7">
                  <span className="font-display text-6xl font-semibold leading-none text-ink/10">{i + 1}</span>
                  <s.icon className="absolute right-6 top-6 h-8 w-8 text-ink" aria-hidden="true" />
                  <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-ink-soft">{s.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 flex items-center gap-3 text-lg text-ink-soft">
              <PhoneCall className="h-6 w-6 shrink-0 text-ink" aria-hidden="true" />
              Prefer to talk? Every product page has a one-tap call button.
            </p>
          </div>
        </section>

        {manufacturers.length > 0 && (
          <section className="overflow-hidden py-16 sm:py-20">
            <div className="container-x">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Brands we supply</h2>
              <p className="mt-2 text-lg text-ink-soft">Authorised stock from {manufacturers.length} manufacturers.</p>
            </div>
            <div className="relative mt-8 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
              <ul className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
                {[...manufacturers, ...manufacturers].map((m, i) => (
                  <li
                    key={`${m.slug}-${i}`}
                    aria-hidden={i >= manufacturers.length}
                    className="flex h-20 min-w-[180px] items-center justify-center rounded-2xl border border-line bg-white px-5"
                  >
                    <ManufacturerLogo name={m.name} logoUrl={m.logoUrl} size="lg" className="border-0 shadow-none" />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <SiteFooter companies={companies} />
    </>
  );
}

function DistributorCard({ company }: { company: Company }) {
  const color = companyColor(company.slug);
  const products = company.totalProducts ?? company.stats?.totalProducts;
  const makers = company.totalManufacturers ?? company.stats?.totalManufacturers;
  return (
    <article data-company={company.slug} className="relative overflow-hidden rounded-4xl border border-line bg-white shadow-card">
      <div className="relative h-36 overflow-hidden sm:h-44" style={{ background: color.soft }}>
        {/* Half-capsule emblem echoing the 3D story */}
        <div
          className="absolute -right-10 top-1/2 h-28 w-72 -translate-y-1/2 -rotate-[18deg] rounded-full shadow-lift sm:h-32 sm:w-80"
          style={{ background: `linear-gradient(180deg, ${color.main}, ${color.deep})` }}
        >
          <span className="absolute left-8 top-4 h-4 w-40 rounded-full bg-white/25" />
        </div>
        <div className="absolute bottom-4 left-6 flex gap-2">
          {products !== undefined && (
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold" style={{ color: color.deep }}>
              {products} products
            </span>
          )}
          {makers !== undefined && (
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold" style={{ color: color.deep }}>
              {makers} manufacturers
            </span>
          )}
        </div>
      </div>
      <div className="p-6 sm:p-8">
        <h3 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">{company.name}</h3>
        {company.tagline && <p className="mt-1 text-base font-medium" style={{ color: color.deep }}>{company.tagline}</p>}
        <p className="mt-3 line-clamp-3 text-base leading-relaxed text-ink-soft">{company.description}</p>

        <form action={`/${company.slug}/products`} className="mt-6" role="search">
          <label htmlFor={`q-${company.slug}`} className="text-base font-semibold">
            Search {company.shortName}&apos;s catalogue
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id={`q-${company.slug}`}
              name="q"
              type="search"
              placeholder="Brand or salt name"
              className="field min-w-0 flex-1"
            />
            <button type="submit" className="btn-primary shrink-0 px-5">
              <Search className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Search</span>
            </button>
          </div>
        </form>

        <Link
          href={`/${company.slug}`}
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-base font-bold underline-offset-4 hover:underline"
          style={{ color: color.deep }}
        >
          Visit {company.shortName} <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </article>
  );
}
