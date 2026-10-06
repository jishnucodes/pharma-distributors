import { prisma } from "@lk/database";

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

export async function searchCompanyProducts(
  companyId: string,
  filters: SearchFilters
): Promise<{
  products: ProductSearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filterMeta: {
    manufacturers: Array<{ name: string; slug: string; count: number }>;
    dosageForms: Array<{ name: string; count: number }>;
    categories: Array<{ name: string; slug: string; count: number }>;
  };
}> {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, Math.min(100, filters.limit || 12));
  const rawQuery = (filters.query || "").trim();

  // Normalize query whitespace and lowercase
  const normalizedQuery = rawQuery.toLowerCase().replace(/\s+/g, " ");

  // 1. Fetch all published products for this company
  // Strictly company-scoped: products assigned to other companies will never be fetched
  const companyProducts = await prisma.companyProduct.findMany({
    where: {
      companyId,
      isPublished: true,
      ...(filters.manufacturerSlug
        ? {
            product: {
              manufacturer: {
                slug: filters.manufacturerSlug,
              },
            },
          }
        : {}),
      ...(filters.dosageForm
        ? {
            product: {
              dosageForm: {
                equals: filters.dosageForm,
              },
            },
          }
        : {}),
      ...(filters.categorySlug
        ? {
            product: {
              categories: {
                some: {
                  category: {
                    slug: filters.categorySlug,
                  },
                },
              },
            },
          }
        : {}),
    },
    include: {
      product: {
        include: {
          manufacturer: true,
          categories: {
            include: {
              category: true,
            },
          },
          ingredients: {
            include: {
              ingredient: {
                include: {
                  aliases: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // 2. Pre-fetch all ingredients and aliases to assist query resolution
  const allIngredients = await prisma.ingredient.findMany({
    include: {
      aliases: true,
    },
  });

  // Extract strength pattern from query (e.g. "650", "650mg", "650 mg", "500", "500 mg")
  const strengthMatch = normalizedQuery.match(/(\d+(?:\.\d+)?)\s*(mg|g|mcg|ml|%)?/);
  const queryStrengthNumber = strengthMatch ? parseFloat(strengthMatch[1]) : null;
  const queryStrengthUnit = strengthMatch && strengthMatch[2] ? strengthMatch[2].toLowerCase() : null;

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

  // 3. Score and filter each product
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
        !isNaN(reqNum) ? pi.quantity === reqNum : `${pi.quantity} ${pi.unit}`.toLowerCase().includes(filters.strength!.toLowerCase())
      );
      if (!hasReqStrength) continue;
    }

    if (normalizedQuery) {
      // Check 1: Brand / Product name match
      if (prodNameLower === normalizedQuery) {
        score += 120;
        reasons.push({ type: "brand_name", label: "Exact Brand Match", detail: prod.name });
      } else if (prodNameLower.includes(normalizedQuery)) {
        score += 90;
        reasons.push({ type: "brand_name", label: "Brand Name Match", detail: prod.name });
      } else {
        // Token matches on product name
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

        // Did user query this ingredient canonically?
        const isCanonicalMatch =
          normalizedQuery.includes(canonicalNameLower) ||
          queryTokens.some((t) => canonicalNameLower.includes(t));

        // Did user query this ingredient via alias? (e.g. acetaminophen -> paracetamol)
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

          // Check 4: Strength match on this ingredient
          if (queryStrengthNumber !== null) {
            if (pi.quantity === queryStrengthNumber) {
              matchedStrengthCount++;
              score += 40;
              reasons.push({
                type: "strength",
                label: `Strength Match: ${pi.quantity} ${pi.unit}`,
                detail: `Matches query strength (${pi.quantity} ${pi.unit})`,
              });
            }
          }
        } else if (queryStrengthNumber !== null && pi.quantity === queryStrengthNumber) {
          // Matched strength alone
          matchedStrengthCount++;
          score += 20;
          reasons.push({
            type: "strength",
            label: `Strength Match: ${pi.quantity} ${pi.unit}`,
          });
        }
      }

      // Multi-ingredient matching check:
      // If user queried multiple ingredients (e.g., amoxicillin + clavulanate),
      // reward products containing all requested ingredients
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

      // EXACT COMPOSITION MATCH CHECK:
      // If the query specified both the ingredient and the exact strength
      // and it accounts for the product's primary composition:
      if (
        matchedIngredientsCount > 0 &&
        queryStrengthNumber !== null &&
        matchedStrengthCount > 0
      ) {
        score += 50; // Boost exact composition matches to the top
        reasons.unshift({
          type: "exact_composition",
          label: "Exact Composition & Strength Match",
          detail: `${prod.ingredients.map((i) => `${i.ingredient.name} ${i.quantity} ${i.unit}`).join(" + ")}`,
        });
      }

      // If nothing matched, skip this product
      if (score === 0) {
        continue;
      }
    } else {
      // No search query: default score based on featured status
      score = cp.isFeatured ? 10 : 1;
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
      categories: prod.categories.map((c) => ({
        id: c.category.id,
        name: c.category.name,
        slug: c.category.slug,
      })),
      matchScore: score,
      matchReasons: reasons,
    });
  }

  // 4. Sort results
  if (normalizedQuery) {
    // When querying, rank highest match score first (exact matches rank ahead of broad matches)
    scoredProducts.sort((a, b) => b.matchScore - a.matchScore);
  } else {
    // Default sorting
    if (filters.sort === "name_asc") {
      scoredProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === "name_desc") {
      scoredProducts.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      // featured first, then alphabetical
      scoredProducts.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.name.localeCompare(b.name);
      });
    }
  }

  // 5. Compute Facets/Filters metadata from all published products of this company
  const mfgMap = new Map<string, { name: string; slug: string; count: number }>();
  const dosageMap = new Map<string, number>();
  const catMap = new Map<string, { name: string; slug: string; count: number }>();

  for (const cp of companyProducts) {
    const p = cp.product;
    const m = p.manufacturer;
    const existingMfg = mfgMap.get(m.slug) || { name: m.name, slug: m.slug, count: 0 };
    existingMfg.count++;
    mfgMap.set(m.slug, existingMfg);

    dosageMap.set(p.dosageForm, (dosageMap.get(p.dosageForm) || 0) + 1);

    for (const c of p.categories) {
      const existingCat = catMap.get(c.category.slug) || {
        name: c.category.name,
        slug: c.category.slug,
        count: 0,
      };
      existingCat.count++;
      catMap.set(c.category.slug, existingCat);
    }
  }

  // 6. Pagination
  const total = scoredProducts.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedProducts = scoredProducts.slice((page - 1) * limit, page * limit);

  return {
    products: paginatedProducts,
    total,
    page,
    limit,
    totalPages,
    filterMeta: {
      manufacturers: Array.from(mfgMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      dosageForms: Array.from(dosageMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      categories: Array.from(catMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    },
  };
}
