import { MetadataRoute } from "next";
import { COMPANY_SLUGS } from "@/lib/companies";
import { fetchCatalog } from "@/lib/api";

export const revalidate = 86400; // Regenerate sitemap once per day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  const companyRoutes: MetadataRoute.Sitemap = [];
  const productRoutes: MetadataRoute.Sitemap = [];

  for (const slug of COMPANY_SLUGS) {
    companyRoutes.push(
      {
        url: `${siteUrl}/${slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${siteUrl}/${slug}/products`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${siteUrl}/${slug}/manufacturers`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      }
    );

    try {
      const catalog = await fetchCatalog(slug, { limit: 500 });
      for (const product of catalog.products) {
        productRoutes.push({
          url: `${siteUrl}/${slug}/products/${product.slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    } catch {
      // Continue if catalog lookup fails during initial build
    }
  }

  return [...staticRoutes, ...companyRoutes, ...productRoutes];
}
