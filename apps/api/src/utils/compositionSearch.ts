import { prisma } from "@lk/database";
import { memoryCache } from "./cache";

export interface SearchFilters {
  query?: string;
  manufacturerSlug?: string;
  dosageForm?: string;
  categorySlug?: string;
  strength?: string;
  page?: number;
  limit?: number;
  sort?: "featured" | "name_asc" | "name_desc";
}

export interface MatchReason {
  type: "exact_composition" | "ingredient" | "ingredient_alias" | "brand_name" | "strength" | "manufacturer";
  label: string;
  detail?: string;
}

export interface ProductSearchResult {
  id: string;
  slug: string;
  name: string;
  dosageForm: string;
  packaging: string;
  description: string | null;
  storageConditions: string | null;
  schedule: string | null;
  isFeatured: boolean;
  itemCode: string | null;
  manufacturer: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    website: string | null;
  };
  ingredients: Array<{
    id: string;
    ingredientId: string;
    name: string;
    quantity: number;
    unit: string;
    perBasis: string;
    isPrimary: boolean;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  matchScore: number;
  matchReasons: MatchReason[];
}

export interface FilterMetaResult {
  manufacturers: Array<{ name: string; slug: string; count: number }>;
  dosageForms: Array<{ name: string; count: number }>;
  categories: Array<{ name: string; slug: string; count: number }>;
}

/**
 * Fetch authorized manufacturer IDs with in-memory caching (60s TTL).
 */
export async function getAuthorizedManufacturerIds(companyId: string): Promise<string[]> {
  return memoryCache.getOrSet(`auth_mfg:${companyId}`, async () => {
    const records = await prisma.companyManufacturer.findMany({
      where: { companyId, isAuthorized: true },
      select: { manufacturerId: true },
    });
    return records.map((r) => r.manufacturerId);
  }, 60);
}

/**
 * Compute or retrieve cached filter metadata (brands and dosage forms available for this company).
 */
export async function getCompanyFilterMeta(
  companyId: string,
  authorizedManufacturerIds: string[]
): Promise<FilterMetaResult> {
  if (authorizedManufacturerIds.length === 0) {
    return { manufacturers: [], dosageForms: [], categories: [] };
  }

  return memoryCache.getOrSet(`filter_meta:${companyId}`, async () => {
    // Fetch published company products with lightweight fields
    const published = await prisma.companyProduct.findMany({
      where: {
        companyId,
        isPublished: true,
        product: { manufacturerId: { in: authorizedManufacturerIds } },
      },
      select: {
        product: {
          select: {
            dosageForm: true,
            manufacturer: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    const mfgMap = new Map<string, { name: string; slug: string; count: number }>();
    const dosageMap = new Map<string, number>();

    for (const cp of published) {
      const p = cp.product;
      const m = p.manufacturer;
      const existing = mfgMap.get(m.slug) || { name: m.name, slug: m.slug, count: 0 };
      existing.count++;
      mfgMap.set(m.slug, existing);

      dosageMap.set(p.dosageForm, (dosageMap.get(p.dosageForm) || 0) + 1);
    }

    return {
      manufacturers: Array.from(mfgMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      dosageForms: Array.from(dosageMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      categories: [],
    };
  }, 60);
}

/**
 * Fetch all ingredients with aliases cached for fast token matching (5 min TTL).
 */
async function getCachedIngredientsWithAliases() {
  return memoryCache.getOrSet("all_ingredients_with_aliases", async () => {
    return prisma.ingredient.findMany({
      include: { aliases: true },
    });
  }, 300);
}

/**
 * Main optimized catalogue search and filter routine.
 */
export async function searchCompanyProducts(
  companyId: string,
  filters: SearchFilters
): Promise<{
  products: ProductSearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filterMeta: FilterMetaResult;
}> {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, Math.min(100, filters.limit || 12));
  const rawQuery = (filters.query || "").trim();
  const normalizedQuery = rawQuery.toLowerCase().replace(/\s+/g, " ");

  const authorizedManufacturerIds = await getAuthorizedManufacturerIds(companyId);

  if (authorizedManufacturerIds.length === 0) {
    return {
      products: [],
      total: 0,
      page,
      limit,
      totalPages: 1,
      filterMeta: { manufacturers: [], dosageForms: [], categories: [] },
    };
  }

  const filterMeta = await getCompanyFilterMeta(companyId, authorizedManufacturerIds);

  // =========================================================================
  // FAST PATH: Direct Server-Side Database Pagination (No Search Query)
  // When browsing or filtering by brand/dosage form without freeform search text.
  // =========================================================================
  if (!normalizedQuery) {
    const where: any = {
      companyId,
      isPublished: true,
      product: {
        manufacturerId: { in: authorizedManufacturerIds },
        ...(filters.manufacturerSlug ? { manufacturer: { slug: filters.manufacturerSlug } } : {}),
        ...(filters.dosageForm ? { dosageForm: { equals: filters.dosageForm } } : {}),
        ...(filters.strength
          ? {
              ingredients: {
                some: !isNaN(parseFloat(filters.strength))
                  ? { quantity: parseFloat(filters.strength) }
                  : { unit: { contains: filters.strength, mode: "insensitive" } },
              },
            }
          : {}),
      },
    };

    let orderBy: any;
    if (filters.sort === "name_asc") {
      orderBy = { product: { name: "asc" } };
    } else if (filters.sort === "name_desc") {
      orderBy = { product: { name: "desc" } };
    } else {
      orderBy = [{ isFeatured: "desc" }, { product: { name: "asc" } }];
    }

    const [total, companyProducts] = await Promise.all([
      prisma.companyProduct.count({ where }),
      prisma.companyProduct.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          product: {
            include: {
              manufacturer: true,
              ingredients: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const products: ProductSearchResult[] = companyProducts.map((cp) => {
      const prod = cp.product;
      return {
        id: prod.id,
        slug: prod.slug,
        name: prod.name,
        dosageForm: prod.dosageForm,
        packaging: prod.packaging,
        description: prod.description,
        storageConditions: prod.storageConditions,
        schedule: prod.schedule,
        isFeatured: cp.isFeatured,
        itemCode: cp.itemCode,
        manufacturer: {
          id: prod.manufacturer.id,
          name: prod.manufacturer.name,
          slug: prod.manufacturer.slug,
          logoUrl: prod.manufacturer.logoUrl,
          website: prod.manufacturer.website,
        },
        ingredients: prod.ingredients.map((pi) => ({
          id: pi.id,
          ingredientId: pi.ingredientId,
          name: pi.ingredient.name,
          quantity: pi.quantity,
          unit: pi.unit,
          perBasis: pi.perBasis,
          isPrimary: pi.isPrimary,
        })),
        categories: [],
        matchScore: cp.isFeatured ? 10 : 1,
        matchReasons: [],
      };
    });

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      filterMeta,
    };
  }

  // =========================================================================
  // SEARCH PATH: Composition & Brand Name Scoring
  // Cached company products for search (60s TTL) to make live searches instant
  // =========================================================================
  const allIngredients = await getCachedIngredientsWithAliases();

  const cacheKey = `search_pool:${companyId}:${filters.manufacturerSlug || "all"}:${filters.dosageForm || "all"}`;
  const companyProducts = await memoryCache.getOrSet(cacheKey, async () => {
    return prisma.companyProduct.findMany({
      where: {
        companyId,
        isPublished: true,
        product: {
          manufacturerId: { in: authorizedManufacturerIds },
          ...(filters.manufacturerSlug ? { manufacturer: { slug: filters.manufacturerSlug } } : {}),
          ...(filters.dosageForm ? { dosageForm: { equals: filters.dosageForm } } : {}),
        },
      },
      include: {
        product: {
          include: {
            manufacturer: true,
            ingredients: {
              include: {
                ingredient: {
                  include: { aliases: true },
                },
              },
            },
          },
        },
      },
    });
  }, 60);

  // Extract strength pattern from query (e.g. "650", "650mg", "2.5", "60 mg")
  const strengthMatch = normalizedQuery.match(/(\d+(?:\.\d+)?)\s*(mg|g|mcg|ml|%)?/);
  const queryStrengthNumber = strengthMatch ? parseFloat(strengthMatch[1]) : null;

  // Extract clean text tokens excluding pure numeric tokens
  const queryTokens = normalizedQuery
    .split(" ")
    .filter((t) => t.length > 0 && isNaN(Number(t)));

  // Identify queried ingredients through canonical name or aliases
  const matchedCanonicalIngredients: Array<{
    ingredient: (typeof allIngredients)[0];
    matchedVia: "canonical" | "alias";
    matchedTerm: string;
  }> = [];

  for (const ing of allIngredients) {
    const ingNameLower = ing.name.toLowerCase();
    if (normalizedQuery.includes(ingNameLower)) {
      matchedCanonicalIngredients.push({
        ingredient: ing,
        matchedVia: "canonical",
        matchedTerm: ing.name,
      });
      continue;
    }

    for (const alias of ing.aliases) {
      const aliasLower = alias.aliasName.toLowerCase();
      if (normalizedQuery.includes(aliasLower)) {
        matchedCanonicalIngredients.push({
          ingredient: ing,
          matchedVia: "alias",
          matchedTerm: alias.aliasName,
        });
        break;
      }
    }
  }

  // Score and filter matching products
  const scoredProducts: ProductSearchResult[] = [];

  for (const cp of companyProducts) {
    const prod = cp.product;
    const prodNameLower = prod.name.toLowerCase();
    const mfgNameLower = prod.manufacturer.name.toLowerCase();

    let score = 0;
    const reasons: MatchReason[] = [];

    // Filter by explicit strength parameter if provided
    if (filters.strength) {
      const reqNum = parseFloat(filters.strength);
      const hasReqStrength = prod.ingredients.some((pi) =>
        !isNaN(reqNum)
          ? pi.quantity === reqNum
          : `${pi.quantity} ${pi.unit}`.toLowerCase().includes(filters.strength!.toLowerCase())
      );
      if (!hasReqStrength) continue;
    }

    // Check 1: Brand / Product name match
    if (prodNameLower === normalizedQuery) {
      score += 120;
      reasons.push({ type: "brand_name", label: "Exact Brand Match", detail: prod.name });
    } else if (prodNameLower.includes(normalizedQuery)) {
      score += 90;
      reasons.push({ type: "brand_name", label: "Brand Name Match", detail: prod.name });
    } else {
      const brandTokenMatch = queryTokens.some((t) => prodNameLower.includes(t));
      if (brandTokenMatch) {
        score += 40;
        reasons.push({ type: "brand_name", label: "Brand Match", detail: prod.name });
      }
    }

    // Check 2: Manufacturer name match
    if (mfgNameLower.includes(normalizedQuery)) {
      score += 50;
      reasons.push({ type: "manufacturer", label: "Manufacturer Match", detail: prod.manufacturer.name });
    }

    // Check 3: Structured Ingredients & Aliases Match
    let matchedIngredientsCount = 0;
    let matchedStrengthCount = 0;

    for (const pi of prod.ingredients) {
      const canonicalNameLower = pi.ingredient.name.toLowerCase();
      const aliases = pi.ingredient.aliases.map((a) => a.aliasName.toLowerCase());

      const isCanonicalMatch =
        normalizedQuery.includes(canonicalNameLower) ||
        queryTokens.some((t) => canonicalNameLower.includes(t));

      const matchedAlias = aliases.find(
        (a) => normalizedQuery.includes(a) || queryTokens.some((t) => a.includes(t))
      );

      if (isCanonicalMatch || matchedAlias) {
        matchedIngredientsCount++;

        if (matchedAlias) {
          score += 85;
          reasons.push({
            type: "ingredient_alias",
            label: `Alias Match: "${matchedAlias}"`,
            detail: `Resolves to ${pi.ingredient.name} (${pi.quantity} ${pi.unit})`,
          });
        } else {
          score += 80;
          reasons.push({
            type: "ingredient",
            label: `Composition Match: ${pi.ingredient.name}`,
            detail: `${pi.quantity} ${pi.unit} ${pi.perBasis}`,
          });
        }

        if (queryStrengthNumber !== null && pi.quantity === queryStrengthNumber) {
          matchedStrengthCount++;
          score += 40;
          reasons.push({
            type: "strength",
            label: `Strength Match: ${pi.quantity} ${pi.unit}`,
            detail: `Matches query strength (${pi.quantity} ${pi.unit})`,
          });
        }
      } else if (queryStrengthNumber !== null && pi.quantity === queryStrengthNumber) {
        matchedStrengthCount++;
        score += 20;
        reasons.push({
          type: "strength",
          label: `Strength Match: ${pi.quantity} ${pi.unit}`,
        });
      }
    }

    // Multi-ingredient matching check
    if (matchedCanonicalIngredients.length > 1) {
      const containsAll = matchedCanonicalIngredients.every((mci) =>
        prod.ingredients.some((pi) => pi.ingredientId === mci.ingredient.id)
      );
      if (containsAll) {
        score += 60;
        reasons.push({
          type: "exact_composition",
          label: "Full Multi-Ingredient Match",
          detail: `Contains all ${matchedCanonicalIngredients.length} queried ingredients`,
        });
      }
    }

    // Exact composition & strength match boost
    if (matchedIngredientsCount > 0 && queryStrengthNumber !== null && matchedStrengthCount > 0) {
      score += 50;
      reasons.unshift({
        type: "exact_composition",
        label: "Exact Composition & Strength Match",
        detail: `${prod.ingredients.map((i) => `${i.ingredient.name} ${i.quantity} ${i.unit}`).join(" + ")}`,
      });
    }

    if (score === 0) {
      continue;
    }

    scoredProducts.push({
      id: prod.id,
      slug: prod.slug,
      name: prod.name,
      dosageForm: prod.dosageForm,
      packaging: prod.packaging,
      description: prod.description,
      storageConditions: prod.storageConditions,
      schedule: prod.schedule,
      isFeatured: cp.isFeatured,
      itemCode: cp.itemCode,
      manufacturer: {
        id: prod.manufacturer.id,
        name: prod.manufacturer.name,
        slug: prod.manufacturer.slug,
        logoUrl: prod.manufacturer.logoUrl,
        website: prod.manufacturer.website,
      },
      ingredients: prod.ingredients.map((pi) => ({
        id: pi.id,
        ingredientId: pi.ingredientId,
        name: pi.ingredient.name,
        quantity: pi.quantity,
        unit: pi.unit,
        perBasis: pi.perBasis,
        isPrimary: pi.isPrimary,
      })),
      categories: [],
      matchScore: score,
      matchReasons: reasons,
    });
  }

  // Sort by score
  scoredProducts.sort((a, b) => b.matchScore - a.matchScore);

  const total = scoredProducts.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedProducts = scoredProducts.slice((page - 1) * limit, page * limit);

  return {
    products: paginatedProducts,
    total,
    page,
    limit,
    totalPages,
    filterMeta,
  };
}
