import { prisma } from "@lk/database";

export interface MatchingCompositionResult {
  disclaimer: string;
  matches: Array<{
    id: string;
    slug: string;
    name: string;
    dosageForm: string;
    packaging: string;
    manufacturer: {
      id: string;
      name: string;
      slug: string;
      logoUrl: string | null;
    };
    compositionSummary: string;
  }>;
}

export async function findProductsWithMatchingComposition(
  companyId: string,
  currentProductId: string
): Promise<MatchingCompositionResult> {
  const disclaimer =
    "Informational notice: These products share the same active ingredient(s), strength, and dosage form in this distributor's catalog. They are listed separately under their respective brand names and manufacturers. This list does not constitute medical advice or imply clinical equivalence or automatic substitution.";

  // 1. Fetch current product's ingredients and dosageForm
  const currentProduct = await prisma.product.findUnique({
    where: { id: currentProductId },
    include: {
      ingredients: true,
    },
  });

  if (!currentProduct || currentProduct.ingredients.length === 0) {
    return { disclaimer, matches: [] };
  }

  const currentIngredientIds = currentProduct.ingredients.map((i) => i.ingredientId).sort();
  const currentIngredientsMap = new Map(
    currentProduct.ingredients.map((i) => [i.ingredientId, `${i.quantity}_${i.unit.toLowerCase()}`])
  );

  // 2. Fetch other published products for this company with the same dosageForm
  const candidateCompanyProducts = await prisma.companyProduct.findMany({
    where: {
      companyId,
      isPublished: true,
      productId: { not: currentProductId },
      product: {
        dosageForm: currentProduct.dosageForm,
      },
    },
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
  });

  const matchingProducts: MatchingCompositionResult["matches"] = [];

  for (const cp of candidateCompanyProducts) {
    const p = cp.product;

    // Check if ingredient count matches
    if (p.ingredients.length !== currentIngredientIds.length) {
      continue;
    }

    // Check if all ingredient IDs match
    const pIngredientIds = p.ingredients.map((i) => i.ingredientId).sort();
    const hasSameIngredients = currentIngredientIds.every((id, idx) => id === pIngredientIds[idx]);

    if (!hasSameIngredients) {
      continue;
    }

    // Check if strengths (quantity and unit) match for each ingredient
    const hasSameStrengths = p.ingredients.every((pi) => {
      const currentVal = currentIngredientsMap.get(pi.ingredientId);
      return currentVal === `${pi.quantity}_${pi.unit.toLowerCase()}`;
    });

    if (hasSameStrengths) {
      matchingProducts.push({
        id: p.id,
        slug: p.slug,
        name: p.name,
        dosageForm: p.dosageForm,
        packaging: p.packaging,
        manufacturer: {
          id: p.manufacturer.id,
          name: p.manufacturer.name,
          slug: p.manufacturer.slug,
          logoUrl: p.manufacturer.logoUrl,
        },
        compositionSummary: p.ingredients
          .map((i) => `${i.ingredient.name} ${i.quantity} ${i.unit}`)
          .join(" + "),
      });
    }
  }

  return {
    disclaimer,
    matches: matchingProducts,
  };
}
