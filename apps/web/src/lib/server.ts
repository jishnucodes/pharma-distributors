import { cache } from "react";
import { Company } from "@/types";
import { fetchCompany } from "./api";
import { fallbackCompany } from "./companies";

/** Deduped per request, and never throws: pages still render if the API is down. */
export const getCompany = cache(async (slug: string): Promise<Company> => {
  try {
    return await fetchCompany(slug);
  } catch {
    return fallbackCompany(slug);
  }
});
