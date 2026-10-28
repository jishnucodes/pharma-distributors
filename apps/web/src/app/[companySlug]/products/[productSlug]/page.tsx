import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Phone, MessageCircle, ExternalLink, Snowflake, ArrowRight } from "lucide-react";
import { fetchProduct } from "@/lib/api";
import { compositionOf, telHref, whatsappHref } from "@/lib/companies";
import { getCompany } from "@/lib/server";
import { AddToEnquiryButton } from "@/components/inquiry/AddToEnquiryButton";
import { ProductEnquiryPanel } from "@/components/inquiry/ProductEnquiryPanel";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";
import { DoseIcon } from "@/components/ui/DoseIcon";

type Params = { params: { companySlug: string; productSlug: string } };

async function load(companySlug: string, productSlug: string) {
  try {
    return await fetchProduct(companySlug, productSlug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const res = await load(params.companySlug, params.productSlug);
  if (!res) return { title: "Product not found" };
  return {
    title: res.data.name,
    description: `${res.data.name} by ${res.data.manufacturer.name} — ${compositionOf(res.data)}. ${res.data.packaging}.`,
  };
}

export default async function ProductPage({ params }: Params) {
  const { companySlug, productSlug } = params;
  const [res, company] = await Promise.all([load(companySlug, productSlug), getCompany(companySlug)]);
  if (!res) notFound();
  const product = res.data;
  const matches = product.matchingComposition?.matches ?? [];
  const whatsappText = `Hello ${company.name}, please share price and stock for ${product.name} (${product.manufacturer.name}, ${product.packaging}).`;

  const specs: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Form", value: product.dosageForm },
    {
      label: "Strength",
      value: product.ingredients.length
        ? product.ingredients.map((i) => `${i.name} ${i.quantity} ${i.unit} ${i.perBasis}`).join(", ")
        : compositionOf(product),
    },
    { label: "Pack", value: product.packaging },
    { label: "Manufacturer", value: product.manufacturer.name },
    product.storageConditions && { label: "Storage", value: product.storageConditions },
    product.schedule && { label: "Schedule", value: product.schedule },
    product.itemCode && { label: "Item code", value: <span className="font-mono">{product.itemCode}</span> },
    product.categories.length > 0 && {
      label: "Category",
      value: (
        <span className="flex flex-wrap gap-2">
          {product.categories.map((c) => (
            <Link
              key={c.id}
              href={`/${companySlug}/products?category=${c.slug}`}
              className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent-deep hover:underline"
            >
              {c.name}
            </Link>
          ))}
        </span>
      ),
    },
  ].filter(Boolean) as Array<{ label: string; value: React.ReactNode }>;

  return (
    <div className="container-wide pb-16 pt-4 sm:pt-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-base text-ink-mute">
        <Link href={`/${companySlug}/products`} className="inline-flex min-h-[44px] items-center font-semibold hover:text-ink">
          Products
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <Link
          href={`/${companySlug}/products?dosageForm=${encodeURIComponent(product.dosageForm)}`}
          className="inline-flex min-h-[44px] items-center font-semibold hover:text-ink"
        >
          {product.dosageForm}
        </Link>
      </nav>

      <div className="mt-2 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
        <div className="min-w-0 space-y-6">
          {/* Pack label: the product's identity without needing a photo */}
          <header className="relative overflow-hidden rounded-4xl border border-line bg-white shadow-card">
            <div className="h-2 bg-accent" aria-hidden="true" />
            <DoseIcon
              form={product.dosageForm}
              className="pointer-events-none absolute -right-6 -top-2 h-48 w-48 text-accent opacity-[0.08] sm:h-64 sm:w-64"
            />
            <div className="relative p-5 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent-deep">
                  <DoseIcon form={product.dosageForm} className="h-4 w-4" /> {product.dosageForm}
                </span>
                {product.schedule && (
                  <span className="rounded-full border border-line px-3 py-1 text-sm font-semibold text-ink-soft">
                    {product.schedule}
                  </span>
                )}
                {product.requiresColdChain && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-800">
                    <Snowflake className="h-4 w-4" /> Cold chain
                  </span>
                )}
              </div>

              <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                {product.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-lg text-ink-soft">
                <ManufacturerLogo name={product.manufacturer.name} logoUrl={product.manufacturer.logoUrl} size="sm" />
                <span>by {product.manufacturer.name}</span>
              </div>

              <div className="mt-6 border-t border-dashed border-line pt-5">
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-ink-mute">Composition</p>
                {product.ingredients.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {product.ingredients.map((ing) => (
                      <li key={ing.id} className="inline-flex items-baseline gap-2 rounded-2xl bg-paper px-4 py-2.5">
                        <span className="text-xl font-bold">{ing.name}</span>
                        <span className="text-xl font-bold text-accent-deep">
                          {ing.quantity} {ing.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xl font-bold">{compositionOf(product) || "—"}</p>
                )}
                {product.ingredients.some((i) => i.aliases?.length) && (
                  <p className="mt-3 text-base text-ink-mute">
                    Also known as:{" "}
                    {product.ingredients
                      .filter((i) => i.aliases?.length)
                      .map((i) => `${i.name} — ${i.aliases!.join(", ")}`)
                      .join("; ")}
                  </p>
                )}
              </div>
              <p className="mt-5 text-base text-ink-mute">{product.packaging}</p>
            </div>
          </header>

          {/* Enquiry panel sits right under the label on phones */}
          <div className="lg:hidden">
            <ProductEnquiryPanel product={product} company={company} />
          </div>

          <section aria-labelledby="spec-h" className="overflow-hidden rounded-3xl border border-line bg-white">
            <h2
              id="spec-h"
              className="border-b border-line bg-paper/70 px-5 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-ink-mute"
            >
              Product details
            </h2>
            <dl className="divide-y divide-line">
              {specs.map((s) => (
                <div key={s.label} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
                  <dt className="text-base font-semibold text-ink-mute">{s.label}</dt>
                  <dd className="text-base font-semibold leading-snug">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {(product.description || product.distributorNotes) && (
            <section className="space-y-3 text-lg leading-relaxed text-ink-soft">
              <h2 className="font-display text-2xl font-semibold text-ink">About this product</h2>
              {product.description && <p>{product.description}</p>}
              {product.distributorNotes && (
                <p className="rounded-2xl border-l-4 border-accent bg-white p-4 text-base">
                  <span className="font-bold text-ink">Note from {company.shortName}: </span>
                  {product.distributorNotes}
                </p>
              )}
            </section>
          )}

          {product.manufacturer.website && (
            <a
              href={product.manufacturer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 text-base font-semibold text-ink-soft hover:text-ink"
            >
              {product.manufacturer.name} website <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <ProductEnquiryPanel product={product} company={company} />
        </aside>
      </div>

      {matches.length > 0 && (
        <section className="mt-14" aria-labelledby="alt-h">
          <h2 id="alt-h" className="font-display text-3xl font-semibold tracking-tight">
            Same composition, other brands
          </h2>
          {product.matchingComposition?.disclaimer && (
            <p className="mt-2 max-w-3xl text-base text-ink-mute">{product.matchingComposition.disclaimer}</p>
          )}
          <div className="mt-5 overflow-hidden rounded-3xl border border-line bg-white shadow-card">
            <table className="w-full text-left">
              <thead className="border-b border-line bg-paper/70">
                <tr className="text-sm font-bold uppercase tracking-[0.08em] text-ink-mute">
                  <th scope="col" className="py-3.5 pl-5 pr-3">Product</th>
                  <th scope="col" className="hidden px-3 py-3.5 md:table-cell">Manufacturer</th>
                  <th scope="col" className="hidden px-3 py-3.5 lg:table-cell">Pack</th>
                  <th scope="col" className="py-3.5 pl-3 pr-5">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {matches.map((m) => (
                  <tr key={m.id} className="hover:bg-accent-soft/35">
                    <td className="py-4 pl-5 pr-3">
                      <Link href={`/${companySlug}/products/${m.slug}`} className="text-lg font-bold hover:underline">
                        {m.name}
                      </Link>
                      <p className="text-sm text-ink-mute">{m.compositionSummary}</p>
                      <p className="text-sm text-ink-mute md:hidden">{m.manufacturer.name}</p>
                    </td>
                    <td className="hidden px-3 py-4 text-base md:table-cell">{m.manufacturer.name}</td>
                    <td className="hidden px-3 py-4 text-sm text-ink-soft lg:table-cell">{m.packaging}</td>
                    <td className="py-4 pl-3 pr-5 text-right">
                      <Link
                        href={`/${companySlug}/products/${m.slug}`}
                        className="inline-grid h-11 w-11 place-items-center rounded-full border-2 border-ink/10 hover:border-ink/30"
                        aria-label={`View ${m.name}`}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Phones: keep the main actions in reach while reading */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex gap-2">
          <AddToEnquiryButton product={product} className="flex-1" />
          <a href={telHref(company.phone)} className="btn-outline px-4" aria-label={`Call ${company.name}`}>
            <Phone className="h-5 w-5" />
          </a>
          {company.whatsapp && (
            <a
              href={whatsappHref(company.whatsapp, whatsappText)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-4"
              aria-label="Ask on WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </div>
  );
}
