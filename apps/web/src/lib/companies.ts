import { Company, Product } from "@/types";

export const COMPANY_SLUGS = ["lakshmi-pharma", "kothittil-pharma"] as const;

export function isCompanySlug(slug: string): boolean {
  return (COMPANY_SLUGS as readonly string[]).includes(slug);
}

/** Colours used by the WebGL scenes (CSS uses the matching variables in globals.css).
 * Lakshmi Pharma: Vibrant Medical Crimson Red
 * Kothittil Pharma: Royal Clinical Blue
 */
export const COMPANY_COLORS: Record<string, { main: string; deep: string; soft: string }> = {
  "lakshmi-pharma": { main: "#E11D48", deep: "#9F1239", soft: "#FFE4E6" },
  "kothittil-pharma": { main: "#2450C8", deep: "#173A9A", soft: "#E1E8FB" },
};

export function companyColor(slug: string) {
  return COMPANY_COLORS[slug] ?? COMPANY_COLORS["lakshmi-pharma"];
}

/** Used when the API is unreachable (e.g. during a static build) so pages still render. */
export function fallbackCompany(slug: string): Company {
  const isLakshmi = slug === "lakshmi-pharma";
  return {
    id: slug,
    slug,
    name: isLakshmi ? "Lakshmi Pharma" : "The Kothittil Pharmaceutical Distributor",
    shortName: isLakshmi ? "Lakshmi" : "Kothittil",
    accentColor: isLakshmi ? "red" : "blue",
    tagline: isLakshmi
      ? "Authorized Ethical & Generics Pharmaceutical Distribution"
      : "Specialty Therapeutics, Critical Care & Institutional Supply",
    description: "Authorized pharmaceutical distributor serving pharmacies, clinics and hospitals.",
    serviceAreas: "South India regional healthcare distribution",
    address: isLakshmi
      ? "Market Road, Kochi, Kerala - 682035"
      : "NH 66 Bypass, Thiruvananthapuram, Kerala - 695024",
    phone: isLakshmi ? "+91 484 235 6789" : "+91 471 245 8890",
    email: isLakshmi ? "orders@lakshmipharma.demo" : "supply@kothittilpharma.demo",
    whatsapp: isLakshmi ? "+91 94471 23456" : "+91 98460 78901",
    businessHours: "Mon - Sat: 8:30 AM - 7:30 PM",
    drugLicenseNo: null,
    gstin: null,
    isActive: true,
  };
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(number: string, text?: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function compositionOf(product: Pick<Product, "composition" | "ingredients">): string {
  if (product.composition) return product.composition;
  if (!product.ingredients?.length) return "";
  return product.ingredients.map((i) => `${i.name} ${i.quantity} ${i.unit}`).join(" + ");
}

type FeaturedProduct = NonNullable<Company["featuredProducts"]>[number];

/** Featured products come back in a slimmer shape; widen them so they fit the enquiry list. */
export function featuredToProduct(fp: FeaturedProduct): Product {
  return {
    id: fp.id,
    slug: fp.slug,
    name: fp.name,
    dosageForm: fp.dosageForm,
    packaging: fp.packaging,
    itemCode: fp.itemCode,
    composition: fp.composition,
    manufacturer: { id: fp.manufacturer.slug, ...fp.manufacturer },
    ingredients: [],
    categories: [],
  };
}
