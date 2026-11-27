import { cache } from "react";
import { Company, CompanyRoute } from "@/types";
import { fetchCompany, fetchCompanyRoutes } from "./api";
import { fallbackCompany } from "./companies";

/** Deduped per request, and never throws: pages still render if the API is down. */
export const getCompany = cache(async (slug: string): Promise<Company> => {
  try {
    return await fetchCompany(slug);
  } catch {
    return fallbackCompany(slug);
  }
});

export const getCompanyRoutes = cache(
  async (slug: string): Promise<{ company: Company; routes: CompanyRoute[] }> => {
    try {
      const res = await fetchCompanyRoutes(slug);
      return res as { company: Company; routes: CompanyRoute[] };
    } catch {
      const comp = fallbackCompany(slug);
      return { company: comp, routes: [] };
    }
  }
);
