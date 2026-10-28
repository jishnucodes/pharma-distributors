"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Phone, AlertCircle } from "lucide-react";
import { CatalogResponse, Company, FilterMeta } from "@/types";
import { fetchCatalog } from "@/lib/api";
import { telHref } from "@/lib/companies";
import { useEscape, useScrollLock } from "@/lib/hooks";
import { ProductTable, ProductTableSkeleton } from "./ProductTable";

const PAGE_SIZE = 12;
const SORTS = [
  { value: "", label: "Best match" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
];
type FilterKey = "manufacturer" | "dosageForm" | "category";

export function CatalogView({ company }: { company: Company }) {
  const slug = company.slug;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);

  const [data, setData] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(q);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [retry, setRetry] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  // Filter options from the unfiltered catalogue, so choices don't vanish once one is picked
  const [allMeta, setAllMeta] = useState<FilterMeta | null>(null);

  useEffect(() => setQuery(q), [q]);

  const update = useCallback(
    (changes: Record<string, string | undefined>, resetPage = true) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(changes)) v ? next.set(k, v) : next.delete(k);
      if (resetPage) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCatalog(slug, {
      q: q || undefined,
      manufacturer: params.get("manufacturer") ?? undefined,
      dosageForm: params.get("dosageForm") ?? undefined,
      category: params.get("category") ?? undefined,
      sort: params.get("sort") ?? undefined,
      page,
      limit: PAGE_SIZE,
    })
      .then((res) => !cancelled && setData(res))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Could not load products"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug, params, q, page, retry]);

  useEffect(() => {
    fetchCatalog(slug, { limit: 1 })
      .then((r) => setAllMeta(r.filterMeta))
      .catch(() => {});
  }, [slug]);

  // Live search after a short pause in typing
  useEffect(() => {
    if (query === q) return;
    const t = setTimeout(() => update({ q: query.trim() || undefined }), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const meta = allMeta ?? data?.filterMeta;
  const active: Array<{ key: FilterKey | "q"; label: string }> = [];
  if (q) active.push({ key: "q", label: `“${q}”` });
  const mfg = params.get("manufacturer");
  if (mfg) active.push({ key: "manufacturer", label: meta?.manufacturers.find((m) => m.slug === mfg)?.name ?? mfg });
  const form = params.get("dosageForm");
  if (form) active.push({ key: "dosageForm", label: form });
  const cat = params.get("category");
  if (cat) active.push({ key: "category", label: meta?.categories.find((c) => c.slug === cat)?.name ?? cat });

  const goToPage = (p: number) => {
    update({ page: p > 1 ? String(p) : undefined }, false);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filters = meta && (
    <FilterGroups
      meta={meta}
      selected={{ manufacturer: mfg, dosageForm: form, category: cat }}
      sort={params.get("sort") ?? ""}
      onChange={(k, v) => update({ [k]: v })}
      onSort={(v) => update({ sort: v || undefined })}
    />
  );

  return (
    <div className="container-wide pb-16 pt-6 sm:pt-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Products</h1>
      <p className="mt-2 text-lg text-ink-soft">Search by brand name, salt (composition) or strength.</p>

      {/* Search */}
      <div className="sticky top-[68px] z-30 -mx-4 mt-5 bg-paper/95 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: query.trim() || undefined });
          }}
          className="flex gap-2"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border-2 border-line bg-white pl-4 pr-1.5 shadow-card focus-within:border-accent">
            <Search className="h-6 w-6 shrink-0 text-ink-mute" aria-hidden="true" />
            <label htmlFor="catalog-q" className="sr-only">
              Search products
            </label>
            <input
              id="catalog-q"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Dolo 650 or Paracetamol"
              className="h-[52px] min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-ink-mute"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  update({ q: undefined });
                }}
                className="grid h-10 w-10 place-items-center rounded-full text-ink-mute hover:bg-paper"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="btn-outline px-4 lg:hidden"
            aria-label="Filters and sorting"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </form>

        {/* Quick dosage-form chips on phones */}
        {meta && meta.dosageForms.length > 1 && (
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 lg:hidden">
            {meta.dosageForms.map((d) => {
              const on = form === d.name;
              return (
                <button
                  key={d.name}
                  onClick={() => update({ dosageForm: on ? undefined : d.name })}
                  aria-pressed={on}
                  className={`min-h-[44px] whitespace-nowrap rounded-full border-2 px-4 text-base font-semibold ${
                    on ? "border-accent bg-accent text-white" : "border-line bg-white"
                  }`}
                >
                  {d.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-[160px] max-h-[calc(100vh-180px)] overflow-y-auto pr-2">{filters}</div>
        </aside>

        <div ref={resultsRef} className="scroll-mt-[150px]">
          <div className="flex flex-wrap items-center gap-2" aria-live="polite">
            <p className="mr-2 text-base font-semibold">
              {loading ? "Searching…" : data ? `${data.total} product${data.total === 1 ? "" : "s"}` : ""}
            </p>
            {active.map((a) => (
              <button
                key={a.key}
                onClick={() => (a.key === "q" ? (setQuery(""), update({ q: undefined })) : update({ [a.key]: undefined }))}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-accent-soft px-3 text-base font-semibold text-accent-deep"
                aria-label={`Remove filter ${a.label}`}
              >
                {a.label} <X className="h-4 w-4" />
              </button>
            ))}
            {active.length > 1 && (
              <button
                onClick={() => {
                  setQuery("");
                  router.replace(pathname, { scroll: false });
                }}
                className="min-h-[40px] px-2 text-base font-semibold text-ink-mute underline underline-offset-4"
              >
                Clear all
              </button>
            )}
          </div>

          {error ? (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900">
              <p className="flex items-center gap-2 text-lg font-semibold">
                <AlertCircle className="h-5 w-5" /> We couldn’t load the products.
              </p>
              <p className="mt-1 text-base">Please check your connection and try again, or call us directly.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => setRetry((r) => r + 1)} className="btn-ink">
                  Try again
                </button>
                <a href={telHref(company.phone)} className="btn-outline">
                  <Phone className="h-5 w-5" /> {company.phone}
                </a>
              </div>
            </div>
          ) : loading && !data ? (
            <div className="mt-4">
              <ProductTableSkeleton />
            </div>
          ) : data && data.products.length === 0 ? (
            <div className="mt-6 rounded-4xl border border-line bg-white p-8 text-center">
              <p className="text-xl font-bold">No matching products</p>
              <p className="mx-auto mt-2 max-w-md text-base text-ink-soft">
                Try the salt name instead of the brand, or a shorter search. We may still be able to source it — just
                ask.
              </p>
              <a href={telHref(company.phone)} className="btn-primary mt-5">
                <Phone className="h-5 w-5" /> Call {company.phone}
              </a>
            </div>
          ) : (
            data && (
              <>
                <div className={`mt-4 transition-opacity ${loading ? "opacity-50" : ""}`}>
                  <ProductTable products={data.products} companySlug={slug} />
                </div>
                {data.totalPages > 1 && (
                  <nav className="mt-8 flex items-center justify-between gap-3" aria-label="Pages">
                    <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="btn-outline">
                      <ChevronLeft className="h-5 w-5" /> Previous
                    </button>
                    <p className="text-base font-semibold">
                      Page {data.page} of {data.totalPages}
                    </p>
                    <button onClick={() => goToPage(page + 1)} disabled={page >= data.totalPages} className="btn-outline">
                      Next <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                )}
              </>
            )
          )}
        </div>
      </div>

      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} total={data?.total}>
        {filters}
      </FilterSheet>
    </div>
  );
}

function FilterGroups({
  meta,
  selected,
  sort,
  onChange,
  onSort,
}: {
  meta: FilterMeta;
  selected: Record<FilterKey, string | null>;
  sort: string;
  onChange: (k: FilterKey, v: string | undefined) => void;
  onSort: (v: string) => void;
}) {
  const groups: Array<{ key: FilterKey; title: string; options: Array<{ value: string; label: string; count: number }> }> = [
    { key: "dosageForm", title: "Type", options: meta.dosageForms.map((d) => ({ value: d.name, label: d.name, count: d.count })) },
    { key: "category", title: "Category", options: meta.categories.map((c) => ({ value: c.slug, label: c.name, count: c.count })) },
    { key: "manufacturer", title: "Manufacturer", options: meta.manufacturers.map((m) => ({ value: m.slug, label: m.name, count: m.count })) },
  ];
  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="text-lg font-bold">Sort by</legend>
        <div className="mt-2 space-y-1">
          {SORTS.map((s) => (
            <OptionRow key={s.value} type="radio" name="sort" checked={sort === s.value} onChange={() => onSort(s.value)} label={s.label} />
          ))}
        </div>
      </fieldset>
      {groups
        .filter((g) => g.options.length > 0)
        .map((g) => (
          <fieldset key={g.key}>
            <legend className="text-lg font-bold">{g.title}</legend>
            <div className="mt-2 space-y-1">
              {g.options.map((o) => {
                const on = selected[g.key] === o.value;
                return (
                  <OptionRow
                    key={o.value}
                    type="checkbox"
                    checked={on}
                    onChange={() => onChange(g.key, on ? undefined : o.value)}
                    label={o.label}
                    count={o.count}
                  />
                );
              })}
            </div>
          </fieldset>
        ))}
    </div>
  );
}

function OptionRow(props: {
  type: "radio" | "checkbox";
  name?: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl px-2 text-base hover:bg-white">
      <input
        type={props.type}
        name={props.name}
        checked={props.checked}
        onChange={props.onChange}
        className="h-5 w-5 shrink-0 accent-[rgb(var(--accent))]"
      />
      <span className={`flex-1 ${props.checked ? "font-bold" : ""}`}>{props.label}</span>
      {props.count !== undefined && <span className="text-sm text-ink-mute">{props.count}</span>}
    </label>
  );
}

function FilterSheet({
  open,
  onClose,
  total,
  children,
}: {
  open: boolean;
  onClose: () => void;
  total?: number;
  children: React.ReactNode;
}) {
  useScrollLock(open);
  useEscape(onClose, open);
  return (
    <div
      className={`fixed inset-0 z-50 transition-[visibility] lg:hidden ${open ? "visible" : "invisible delay-300"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Filters and sorting"
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col rounded-t-4xl bg-paper transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl font-semibold">Filters</h2>
          <button onClick={onClose} className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-card" aria-label="Close filters">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        <div className="border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button onClick={onClose} className="btn-primary w-full text-lg">
            Show {total ?? ""} product{total === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
}
