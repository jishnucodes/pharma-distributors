import Link from "next/link";
import { Snowflake } from "lucide-react";
import { Product } from "@/types";
import { compositionOf } from "@/lib/companies";
import { DoseIcon } from "@/components/ui/DoseIcon";
import { AddToEnquiryButton } from "@/components/inquiry/AddToEnquiryButton";

/**
 * Catalogue as a table on tablets and up; on phones the same rows stack into a
 * compact list (five columns don't fit 360px) with a round add button in thumb reach.
 */
export function ProductTable({ products, companySlug }: { products: Product[]; companySlug: string }) {
  const href = (p: Product) => `/${companySlug}/products/${p.slug}`;

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
      {/* Phones */}
      <ul className="divide-y divide-line md:hidden">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-3 p-4">
            <Link href={href(p)} className="flex min-w-0 flex-1 gap-3">
              <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <DoseIcon form={p.dosageForm} className="h-7 w-7" />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-bold leading-snug">{p.name}</span>
                {compositionOf(p) && <span className="block text-base leading-snug text-ink">{compositionOf(p)}</span>}
                <span className="mt-0.5 block text-sm text-ink-mute">
                  {p.manufacturer.name} · {p.packaging}
                </span>
              </span>
            </Link>
            <AddToEnquiryButton product={p} size="icon" />
          </li>
        ))}
      </ul>

      {/* Tablets and desktop */}
      <table className="hidden w-full text-left md:table">
        <thead className="border-b border-line bg-paper/70">
          <tr className="text-sm font-bold uppercase tracking-[0.08em] text-ink-mute">
            <th scope="col" className="py-3.5 pl-5 pr-3 font-bold">Product</th>
            <th scope="col" className="px-3 py-3.5 font-bold">Composition</th>
            <th scope="col" className="hidden px-3 py-3.5 font-bold xl:table-cell">Manufacturer</th>
            <th scope="col" className="hidden px-3 py-3.5 font-bold xl:table-cell">Pack</th>
            <th scope="col" className="py-3.5 pl-3 pr-5 text-right font-bold">
              <span className="sr-only">Enquiry</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((p) => {
            const reason = p.matchReasons?.[0];
            return (
              <tr key={p.id} className="group align-top transition-colors hover:bg-accent-soft/35">
                <td className="py-4 pl-5 pr-3">
                  <div className="flex gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                      <DoseIcon form={p.dosageForm} className="h-7 w-7" />
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={href(p)}
                        className="text-lg font-bold leading-snug underline-offset-4 hover:underline"
                      >
                        {p.name}
                      </Link>
                      <p className="text-sm text-ink-mute">
                        {p.dosageForm}
                        {p.requiresColdChain && (
                          <span className="ml-2 inline-flex items-center gap-1 text-sky-700">
                            <Snowflake className="h-3.5 w-3.5" /> Cold chain
                          </span>
                        )}
                      </p>
                      {/* Columns that are hidden at this width move under the name */}
                      <p className="text-sm text-ink-mute xl:hidden">{p.manufacturer.name}</p>
                      <p className="text-sm text-ink-mute xl:hidden">{p.packaging}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-base leading-snug">
                  {compositionOf(p) || "—"}
                  {reason && reason.type !== "brand_name" && (
                    <span className="mt-1 block text-sm font-medium text-accent-deep">✓ {reason.label}</span>
                  )}
                </td>
                <td className="hidden px-3 py-4 text-base xl:table-cell">{p.manufacturer.name}</td>
                <td className="hidden px-3 py-4 text-sm text-ink-soft xl:table-cell">{p.packaging}</td>
                <td className="py-4 pl-3 pr-5 text-right">
                  <AddToEnquiryButton product={p} size="sm" className="min-w-[104px]" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ProductTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white" aria-hidden="true">
      <div className="h-12 border-b border-line bg-paper/70" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-line p-4 last:border-0">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-paper" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-paper" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-paper" />
          </div>
          <div className="h-11 w-24 animate-pulse rounded-full bg-paper" />
        </div>
      ))}
    </div>
  );
}
