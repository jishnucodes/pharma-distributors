import { prisma } from "./packages/database/src/index";
import { searchCompanyProducts } from "./apps/api/src/utils/compositionSearch";
import { findProductsWithMatchingComposition } from "./apps/api/src/utils/matchingComposition";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

async function runAcceptanceChecks() {
  console.log("=================================================");
  console.log("RUNNING L & K PHARMA ACCEPTANCE VERIFICATION SUITE");
  console.log("=================================================\n");

  let passes = 0;
  let fails = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      if (detail) console.log(`       ↳ ${detail}`);
      passes++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error(`       ↳ ${detail}`);
      fails++;
    }
  }

  // Fetch Companies
  const lakshmi = await prisma.company.findUnique({ where: { slug: "lakshmi-pharma" } });
  const kothottil = await prisma.company.findUnique({ where: { slug: "kothottil-pharma" } });

  assert(Boolean(lakshmi && kothottil), "1. Companies exist in database", `Lakshmi: ${lakshmi?.id}, Kothottil: ${kothottil?.id}`);
  if (!lakshmi || !kothottil) return;

  // Check 1 & 2: Isolation & Non-Leakage
  console.log("\n--- Checking Catalog Scoping & Isolation ---");
  const lakshmiAll = await searchCompanyProducts(lakshmi.id, {});
  const kothottilAll = await searchCompanyProducts(kothottil.id, {});

  const lakshmiNames = lakshmiAll.products.map((p) => p.name);
  const kothottilNames = kothottilAll.products.map((p) => p.name);

  assert(
    lakshmiNames.includes("Calpol 650") && !kothottilNames.includes("Calpol 650"),
    "2. Calpol 650 exists in Lakshmi Pharma but NEVER leaks into Kothottil Pharma",
    `Lakshmi products: [${lakshmiNames.join(", ")}], Kothottil products: [${kothottilNames.join(", ")}]`
  );

  assert(
    kothottilNames.includes("Glycomet 500 SR") && !lakshmiNames.includes("Glycomet 500 SR"),
    "2b. Glycomet 500 SR exists exclusively in Kothottil Pharma catalog",
    `Kothottil has Glycomet 500 SR: ${kothottilNames.includes("Glycomet 500 SR")}, Lakshmi has it: ${lakshmiNames.includes("Glycomet 500 SR")}`
  );

  // Check 3: Composition-based search fixture (Paracetamol, Acetaminophen, Dolo)
  console.log("\n--- Checking Composition Search Acceptance Fixture ---");
  
  // 3a. Searching "paracetamol" in Lakshmi returns Dolo 650 AND Calpol 650
  const searchParacetamol = await searchCompanyProducts(lakshmi.id, { query: "paracetamol" });
  const paracetamolMatches = searchParacetamol.products.map((p) => p.name);
  assert(
    paracetamolMatches.includes("Dolo 650") && paracetamolMatches.includes("Calpol 650"),
    "3a. Searching 'paracetamol' returns both Dolo 650 and Calpol 650",
    `Matches: [${paracetamolMatches.join(", ")}]`
  );

  // 3b. Searching "acetaminophen" returns the same matches via ingredient alias
  const searchAlias = await searchCompanyProducts(lakshmi.id, { query: "acetaminophen" });
  const aliasMatches = searchAlias.products.map((p) => p.name);
  assert(
    aliasMatches.includes("Dolo 650") && aliasMatches.includes("Calpol 650"),
    "3b. Searching 'acetaminophen' returns both matches through ingredient aliases",
    `Matches: [${aliasMatches.join(", ")}]`
  );

  // 3c. Searching "paracetamol 650" or "paracetamol 650 mg"
  const search650 = await searchCompanyProducts(lakshmi.id, { query: "paracetamol 650 mg" });
  const matches650 = search650.products.map((p) => p.name);
  assert(
    matches650.includes("Dolo 650") && matches650.includes("Calpol 650"),
    "3c. Searching 'paracetamol 650 mg' returns both matching products",
    `Matches: [${matches650.join(", ")}]`
  );

  // 3d. Searching "Dolo" returns relevant branded product
  const searchDolo = await searchCompanyProducts(lakshmi.id, { query: "Dolo" });
  const doloMatches = searchDolo.products.map((p) => p.name);
  assert(
    doloMatches.includes("Dolo 650") && !doloMatches.includes("Calpol 650"),
    "3d. Searching 'Dolo' returns only the branded product Dolo 650",
    `Matches: [${doloMatches.join(", ")}]`
  );

  // Check 4: No deduplication solely because compositions match
  console.log("\n--- Checking Non-Deduplication of Matching Compositions ---");
  const doloItem = searchParacetamol.products.find((p) => p.name === "Dolo 650");
  const calpolItem = searchParacetamol.products.find((p) => p.name === "Calpol 650");
  assert(
    Boolean(doloItem && calpolItem && doloItem.id !== calpolItem.id && doloItem.manufacturer.name !== calpolItem.manufacturer.name),
    "4. Dolo 650 and Calpol 650 are distinct product entries with separate manufacturers",
    `Dolo Mfg: ${doloItem?.manufacturer.name}, Calpol Mfg: ${calpolItem?.manufacturer.name}`
  );

  // Check 5: Manufacturer & Strength filters work together with search
  console.log("\n--- Checking Manufacturer & Strength Filter Narrowing ---");
  const searchWithMfg = await searchCompanyProducts(lakshmi.id, {
    query: "paracetamol",
    manufacturerSlug: "micro-labs",
  });
  const mfgFilteredMatches = searchWithMfg.products.map((p) => p.name);
  assert(
    mfgFilteredMatches.includes("Dolo 650") && !mfgFilteredMatches.includes("Calpol 650"),
    "5a. Applying manufacturer filter ('micro-labs') narrows matches to Dolo 650 without changing composition query",
    `Matches: [${mfgFilteredMatches.join(", ")}]`
  );

  // Check 6: Multi-ingredient products
  console.log("\n--- Checking Multi-Ingredient Search ---");
  const searchAugmentin = await searchCompanyProducts(lakshmi.id, { query: "amoxicillin clavulanic" });
  const augMatches = searchAugmentin.products.map((p) => p.name);
  assert(
    augMatches.includes("Augmentin 625 Duo"),
    "6a. Multi-ingredient search 'amoxicillin clavulanic' finds Augmentin 625 Duo",
    `Matches: [${augMatches.join(", ")}]`
  );

  const augmentinProduct = searchAugmentin.products.find((p) => p.name === "Augmentin 625 Duo");
  assert(
    Boolean(augmentinProduct && augmentinProduct.ingredients.length === 2),
    "6b. Augmentin 625 Duo stores structured ingredients (500mg Amoxicillin + 125mg Clavulanic Acid)",
    `Ingredients: ${augmentinProduct?.ingredients.map((i) => `${i.name} ${i.quantity} ${i.unit}`).join(" + ")}`
  );

  // Check 7: Products with matching composition section
  console.log("\n--- Checking 'Products with matching composition' Section ---");
  if (doloItem) {
    const matchingSection = await findProductsWithMatchingComposition(lakshmi.id, doloItem.id);
    const matchNames = matchingSection.matches.map((m) => m.name);
    assert(
      matchNames.includes("Calpol 650") && !matchNames.includes("Dolo 650"),
      "7a. On Dolo 650 detail, Calpol 650 is returned as a product with matching composition (excluding Dolo 650 itself)",
      `Matching products found: [${matchNames.join(", ")}]`
    );
    assert(
      matchingSection.disclaimer.includes("does not constitute medical advice or imply clinical equivalence"),
      "7b. Disclaimer explicitly present and prohibits implying clinical equivalence",
      matchingSection.disclaimer
    );
  }

  // Check 8: Inquiries Scoping & Validation
  console.log("\n--- Checking Inquiry Scoping ---");
  const createdInquiry = await prisma.inquiry.create({
    data: {
      companyId: lakshmi.id,
      name: "Acceptance Test Chemist",
      businessName: "Test Care Chemist",
      phone: "+91 99999 88888",
      message: "Testing inquiry delivery to Lakshmi Pharma",
      status: "PENDING",
    },
  });
  assert(
    createdInquiry.companyId === lakshmi.id,
    "8. Inquiries reach and persist strictly to the designated company",
    `Inquiry ID: ${createdInquiry.id}, Assigned CompanyId: ${createdInquiry.companyId}`
  );
  await prisma.inquiry.delete({ where: {id: createdInquiry.id} });

  // Check 9: Verify complete absence of product images
  console.log("\n--- Checking Absence of Product Images ---");
  const prismaModels = Object.keys(prisma);
  const hasProductImageModel = prismaModels.some((m) => m.toLowerCase().includes("productimage"));
  const sampleProduct = await prisma.product.findFirst();
  const productKeys = Object.keys(sampleProduct || {});
  const hasProductImageField = productKeys.some((k) => k.toLowerCase().includes("image") || k.toLowerCase().includes("photo"));

  assert(
    !hasProductImageModel && !hasProductImageField,
    "9. Absolutely NO ProductImage model or product image fields exist anywhere",
    `Product fields: [${productKeys.join(", ")}]`
  );

  console.log("\n=================================================");
  console.log(`ACCEPTANCE RESULTS: ${passes} PASSED, ${fails} FAILED`);
  console.log("=================================================");

  if (fails > 0) {
    process.exit(1);
  }
}

runAcceptanceChecks()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
