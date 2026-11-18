import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface MasterProductItem {
  id: number;
  division_code: string;
  company_name: string;
  division_sl_no: number;
  product_name: string;
  type: string;
  composition_short: string;
  composition_full: string;
  pack: string;
  gst_rate?: number;
  gst_percentage?: number;
  pts?: number;
  ptr?: number;
  mrp?: number;
  hsn_code?: string | null;
}

interface MasterJson {
  metadata: {
    effective_date: string;
    total_divisions: number;
    total_products: number;
    divisions: Array<{
      code: string;
      name: string;
      count: number;
    }>;
  };
  products: MasterProductItem[];
}

interface DivisionConfig {
  code: string;
  name: string;
  slug: string;
  website: string;
  logoUrl: string;
}

// 8 Principal divisions to import (excluding RLS which is already imported)
const DIVISION_CONFIG: Record<string, DivisionConfig> = {
  RV: {
    code: "RV",
    name: "Rivolga Pvt. Ltd. (RhineVOLGA)",
    slug: "rivolga",
    website: "https://rhinebiogenics.com",
    logoUrl: "/logos/rhine.svg",
  },
  RF: {
    code: "RF",
    name: "Renos Pharma Pvt. Ltd. (Division - Futura)",
    slug: "renos-pharma",
    website: "https://rhinebiogenics.com",
    logoUrl: "/logos/rhine.svg",
  },
  RHC: {
    code: "RHC",
    name: "Rineus Health Care Company Pvt. Ltd.",
    slug: "rineus-health-care",
    website: "https://rhinebiogenics.com",
    logoUrl: "/logos/rhine.svg",
  },
  RR: {
    code: "RR",
    name: "Renolife Pharma (India) Pvt. Ltd.",
    slug: "renolife-pharma",
    website: "https://rhinebiogenics.com",
    logoUrl: "/logos/rhine.svg",
  },
  RB: {
    code: "RB",
    name: "Rhine Biogenics Pvt. Ltd.",
    slug: "rhine-biogenics",
    website: "https://rhinebiogenics.com",
    logoUrl: "/logos/rhine.svg",
  },
  RG: {
    code: "RG",
    name: "Rhine Grande (Division of Rhine Biogenics Pvt. Ltd.)",
    slug: "rhine-grande",
    website: "https://rhinebiogenics.com",
    logoUrl: "/logos/rhine.svg",
  },
  RC: {
    code: "RC",
    name: "Rhine Croma Health Care Pvt. Ltd.",
    slug: "rhine-croma-health-care",
    website: "https://rhinebiogenics.com",
    logoUrl: "/logos/rhine.svg",
  },
  RA: {
    code: "RA",
    name: "Elana Pharmaceuticals Pvt. Ltd.",
    slug: "elana-pharmaceuticals",
    website: "https://rhinebiogenics.com",
    logoUrl: "/logos/rhine.svg",
  },
};

/** Converts strings to URL-safe alphanumeric slugs */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
  perBasis: string;
  isPrimary: boolean;
  aliases: string[];
}

/** Parses individual active ingredients from standard composition strings */
function parseIngredients(compString: string, dosageForm: string): ParsedIngredient[] {
  if (!compString || !compString.trim()) {
    return [
      {
        name: "Standard Formulation",
        quantity: 1,
        unit: "unit",
        perBasis: "per dose",
        isPrimary: true,
        aliases: [],
      },
    ];
  }

  // Determine basis (e.g. per tablet, per 5 ml, per capsule, per dose)
  let perBasis = "per unit";
  const perMatch = compString.match(/\(per\s+([^)]+)\)/i);
  if (perMatch) {
    perBasis = `per ${perMatch[1].trim()}`;
  } else if (/syrup|drops|suspension|liquid/i.test(dosageForm)) {
    perBasis = "per 5 ml";
  } else if (/tablet/i.test(dosageForm)) {
    perBasis = "per tablet";
  } else if (/capsule/i.test(dosageForm)) {
    perBasis = "per capsule";
  }

  // Clean out "(per 5 ml)" and source notes
  const cleanComp = compString
    .replace(/\(per\s+[^)]+\)/i, "")
    .replace(/\(Source Error[^)]*\)/i, "")
    .trim();

  // Split ingredients by " + "
  const parts = cleanComp.split(/\s*\+\s*/);
  const results: ParsedIngredient[] = [];
  const seenSlugsInProduct = new Set<string>();

  for (let idx = 0; idx < parts.length; idx++) {
    const rawPart = parts[idx].trim();
    if (!rawPart) continue;

    const aliases: string[] = [];

    // Extract secondary equivalent salts or elemental minerals in parentheses:
    // e.g. "(eq. to Diclofenac Sodium 1.0% w/w)", "(Elemental Calcium 210 mg)"
    const parentheticalMatches = rawPart.match(/\(([^)]+)\)/g);
    if (parentheticalMatches) {
      for (const m of parentheticalMatches) {
        const inner = m.replace(/[()]/g, "").trim();
        if (/^eq\.?\s*to\s+/i.test(inner)) {
          aliases.push(inner.replace(/^eq\.?\s*to\s+/i, "").trim());
        } else if (/^elemental\s+/i.test(inner)) {
          aliases.push(inner);
        }
      }
    }

    // Clean out parenthetical notes for canonical ingredient name
    const cleanedPart = rawPart.replace(/\([^)]*\)/g, "").trim();

    // Match numeric strength and units (e.g. 650 mg, 1.16% w/w, 0.5%, 200 IU, 1500 mcg, 10 ml)
    const strengthMatch = cleanedPart.match(
      /(\d+(?:\.\d+)?)\s*(% w\/w|% w\/v|%|mg|g|mcg|ml|iu|billion spores|billion cfu|million spores|cfu)(?!\w)/i
    );

    let name = cleanedPart;
    let quantity = 1;
    let unit = "unit";

    if (strengthMatch && strengthMatch.index !== undefined) {
      quantity = parseFloat(strengthMatch[1]);
      unit = strengthMatch[2].trim();
      name = cleanedPart.substring(0, strengthMatch.index).trim();
      name = name.replace(/\b(IP|BP|USP)\b/g, "").trim();
    } else {
      name = cleanedPart.replace(/\b(IP|BP|USP)\b/g, "").trim();
      quantity = 1;
      unit = "q.s.";
    }

    // Common pharma synonym aliases
    if (/amoxycillin/i.test(name)) aliases.push("Amoxicillin", "Amoxicillin Trihydrate");
    if (/paracetamol/i.test(name)) aliases.push("Acetaminophen", "APAP");
    if (/methylcobalamin/i.test(name)) aliases.push("Mecobalamin", "Vitamin B12");
    if (/metformin/i.test(name)) aliases.push("Metformin Hydrochloride", "Glucophage");
    if (/cholecalciferol/i.test(name)) aliases.push("Vitamin D3");
    if (/pyridoxine/i.test(name)) aliases.push("Vitamin B6");
    if (/pantoprazole/i.test(name)) aliases.push("Pantoprazole Sodium");
    if (/rabeprazole/i.test(name)) aliases.push("Rabeprazole Sodium");
    if (/esomeprazole/i.test(name)) aliases.push("Esomeprazole Magnesium");
    if (/diclofenac/i.test(name)) aliases.push("Diclofenac Sodium", "Diclofenac Potassium");
    if (/etoricoxib/i.test(name)) aliases.push("Arcoxia");
    if (/montelukast/i.test(name)) aliases.push("Montelukast Sodium", "Singulair");
    if (/levocetirizine/i.test(name)) aliases.push("Levocetirizine Dihydrochloride", "Xyzal");

    const ingSlug = slugify(name);
    if (name.length > 0 && !seenSlugsInProduct.has(ingSlug)) {
      seenSlugsInProduct.add(ingSlug);
      results.push({
        name,
        quantity,
        unit,
        perBasis,
        isPrimary: idx === 0,
        aliases,
      });
    }
  }

  return results.length > 0
    ? results
    : [
        {
          name: cleanComp,
          quantity: 1,
          unit: "unit",
          perBasis,
          isPrimary: true,
          aliases: [],
        },
      ];
}

export async function seedRhineGroupMasterProducts() {
  console.log("==================================================================");
  console.log("  Rhine Group Master Products - Seeding Engine (303 Master)");
  console.log("==================================================================\n");

  const jsonFilePath = path.resolve(
    __dirname,
    "../data/Rhine_Group_Master_Products_303 1.json"
  );

  if (!fs.existsSync(jsonFilePath)) {
    console.error(`Error: JSON file not found at ${jsonFilePath}`);
    return;
  }

  const rawJson: MasterJson = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
  console.log(`• Effective Date:       ${rawJson.metadata.effective_date}`);
  console.log(`• Total Divisions:      ${rawJson.metadata.total_divisions}`);
  console.log(`• Total Master Products: ${rawJson.metadata.total_products}\n`);

  // Target Companies: Lakshmi Pharma & The Kothittil Pharmaceutical Distributor
  const targetCompanies = await prisma.company.findMany({
    where: { slug: { in: ["lakshmi-pharma", "kothittil-pharma"] } },
  });

  if (targetCompanies.length < 2) {
    console.error(
      "Error: Could not locate both Lakshmi Pharma and Kothittil Pharma in the database."
    );
    process.exit(1);
  }
  console.log(
    `✓ Located target distribution companies: ${targetCompanies.map((c) => c.name).join(" & ")}\n`
  );

  // 1. Initialize and Authorize the 8 New Brand Manufacturers
  console.log("--- Initializing & Authorizing Brand Manufacturers ---");
  const manufacturerMap = new Map<string, any>();

  for (const [code, cfg] of Object.entries(DIVISION_CONFIG)) {
    const brand = await prisma.manufacturer.upsert({
      where: { slug: cfg.slug },
      update: {
        name: cfg.name,
        website: cfg.website,
        logoUrl: cfg.logoUrl,
        country: "India",
      },
      create: {
        name: cfg.name,
        slug: cfg.slug,
        website: cfg.website,
        logoUrl: cfg.logoUrl,
        country: "India",
        isDemo: false,
      },
    });

    manufacturerMap.set(code, brand);

    // Link authorization with both companies
    for (const comp of targetCompanies) {
      await prisma.companyManufacturer.upsert({
        where: {
          companyId_manufacturerId: {
            companyId: comp.id,
            manufacturerId: brand.id,
          },
        },
        update: { isAuthorized: true },
        create: {
          companyId: comp.id,
          manufacturerId: brand.id,
          isAuthorized: true,
          partnershipDetails: `Authorized Regional Stockist & Wholesale Partner (${cfg.name})`,
        },
      });
    }

    console.log(`  ✓ Brand [${cfg.code}]: ${cfg.name} (Authorized for Lakshmi & Kothittil)`);
  }

  // 2. Filter Products: Strictly EXCLUDE RLS (Rhine Life Sciences Pvt. Ltd., 43 products)
  console.log("\n--- Filtering Products According to Constraints ---");
  let skippedRlsCount = 0;
  const productsToIngest: MasterProductItem[] = [];

  for (const p of rawJson.products) {
    if (
      p.division_code === "RLS" ||
      p.company_name?.toLowerCase().includes("rhine life sciences")
    ) {
      skippedRlsCount++;
      continue; // Constraint: Do not insert RLS products (already inserted)
    }
    productsToIngest.push(p);
  }

  console.log(`• Total Products in JSON:   ${rawJson.products.length}`);
  console.log(
    `• Skipped Constraint (RLS): ${skippedRlsCount} products (Rhine Life Sciences Pvt. Ltd.)`
  );
  console.log(`• Products to Ingest:       ${productsToIngest.length} products\n`);

  if (skippedRlsCount !== 43) {
    console.warn(
      `[Warning] Expected 43 RLS products to be skipped, but encountered ${skippedRlsCount}.`
    );
  }

  // 3. Ingest Formulations & Chemical Ingredients
  console.log("--- Ingesting Formulations & Active Compositions ---");
  let ingestedCount = 0;
  const divisionIngestCounts: Record<string, number> = {};

  for (const item of productsToIngest) {
    const brandCfg = DIVISION_CONFIG[item.division_code];
    if (!brandCfg) {
      console.warn(`[Warning] No config found for division_code: ${item.division_code}, skipping product ${item.product_name}`);
      continue;
    }

    const brandRecord = manufacturerMap.get(item.division_code);
    if (!brandRecord) {
      console.warn(`[Warning] Brand record missing for ${item.division_code}`);
      continue;
    }

    // Build unique product slug
    const productSlug = slugify(`${brandCfg.slug}-${item.product_name}`);

    // Build distributor notes
    const notesParts: string[] = [];
    if (item.mrp != null) notesParts.push(`MRP: ₹${item.mrp}`);
    if (item.pts != null) notesParts.push(`PTS: ₹${item.pts}`);
    if (item.ptr != null) notesParts.push(`PTR: ₹${item.ptr}`);
    if (item.gst_percentage != null) {
      notesParts.push(`GST: ${item.gst_percentage}%`);
    } else if (item.gst_rate != null) {
      notesParts.push(`GST: ${Math.round(item.gst_rate * 100)}%`);
    }
    if (item.hsn_code) notesParts.push(`HSN: ${item.hsn_code}`);

    const distributorNotes = notesParts.join(" | ");

    // Determine regulatory schedule
    let schedule = "Schedule H Prescription Drug";
    if (
      /supplement|powder|protein|soap|moisturiz|sunscreen|serum|shampoo|lotion/i.test(
        item.type
      ) ||
      (/nutritional|collagen|peptide|calcium|multivitamin|probiotic/i.test(
        item.composition_short
      ) &&
        !/prescription/i.test(item.composition_short))
    ) {
      schedule = "Nutritional / Dietary Supplement / Personal Care";
    } else if (
      /clobazam|alprazolam|diazepam|lorazepam|clonazepam/i.test(
        item.composition_short
      )
    ) {
      schedule = "Schedule H1 Prescription Drug";
    } else if (
      /paracetamol/i.test(item.composition_short) &&
      !/hydrochloride|tramadol/i.test(item.composition_short)
    ) {
      schedule = "General Sale / OTC";
    }

    // A. Upsert Product Master
    const product = await prisma.product.upsert({
      where: { slug: productSlug },
      update: {
        name: item.product_name,
        manufacturerId: brandRecord.id,
        dosageForm: item.type,
        packaging: item.pack,
        description: item.composition_full || item.composition_short,
        storageConditions:
          "Store in a cool and dry place below 30°C. Protect from light and moisture.",
        schedule,
      },
      create: {
        name: item.product_name,
        slug: productSlug,
        manufacturerId: brandRecord.id,
        dosageForm: item.type,
        packaging: item.pack,
        description: item.composition_full || item.composition_short,
        storageConditions:
          "Store in a cool and dry place below 30°C. Protect from light and moisture.",
        schedule,
        isDemo: false,
      },
    });

    // B. Parse & Link Active Ingredients
    const parsedIngredients = parseIngredients(item.composition_short, item.type);

    for (const pIng of parsedIngredients) {
      const ingSlug = slugify(pIng.name);
      if (!ingSlug) continue;

      // Upsert Canonical Ingredient
      const ingredient = await prisma.ingredient.upsert({
        where: { slug: ingSlug },
        update: { name: pIng.name },
        create: {
          name: pIng.name,
          slug: ingSlug,
          description: `Active pharmaceutical substance: ${pIng.name}`,
        },
      });

      // Upsert Aliases for Smart Search
      for (const alias of pIng.aliases) {
        if (!alias.trim()) continue;
        await prisma.ingredientAlias.upsert({
          where: {
            ingredientId_aliasName: {
              ingredientId: ingredient.id,
              aliasName: alias.trim(),
            },
          },
          update: {},
          create: {
            ingredientId: ingredient.id,
            aliasName: alias.trim(),
          },
        });
      }

      // Link ProductIngredient
      await prisma.productIngredient.upsert({
        where: {
          productId_ingredientId: {
            productId: product.id,
            ingredientId: ingredient.id,
          },
        },
        update: {
          quantity: pIng.quantity,
          unit: pIng.unit,
          perBasis: pIng.perBasis,
          isPrimary: pIng.isPrimary,
        },
        create: {
          productId: product.id,
          ingredientId: ingredient.id,
          quantity: pIng.quantity,
          unit: pIng.unit,
          perBasis: pIng.perBasis,
          isPrimary: pIng.isPrimary,
        },
      });
    }

    // C. Link into Company Catalogs (Lakshmi & Kothittil)
    for (const comp of targetCompanies) {
      const codePrefix = comp.slug === "lakshmi-pharma" ? "LK" : "KT";
      const cleanProdCode = slugify(item.product_name)
        .toUpperCase()
        .replace(/-/g, "")
        .substring(0, 8);
      const itemCode = `${codePrefix}-${item.division_code}-${cleanProdCode}`;

      await prisma.companyProduct.upsert({
        where: {
          companyId_productId: {
            companyId: comp.id,
            productId: product.id,
          },
        },
        update: {
          isPublished: true,
          itemCode,
          distributorNotes: distributorNotes || null,
        },
        create: {
          companyId: comp.id,
          productId: product.id,
          isPublished: true,
          isFeatured: false,
          itemCode,
          distributorNotes: distributorNotes || null,
        },
      });
    }

    ingestedCount++;
    divisionIngestCounts[item.division_code] =
      (divisionIngestCounts[item.division_code] || 0) + 1;

    if (ingestedCount % 20 === 0 || ingestedCount === productsToIngest.length) {
      process.stdout.write(
        `  ✓ Ingested ${ingestedCount}/${productsToIngest.length} formulations...\n`
      );
    }
  }

  console.log("\n==================================================================");
  console.log("  Seeding Complete Summary");
  console.log("==================================================================");
  console.log(`• Total Products Seeded:  ${ingestedCount}`);
  console.log(`• RLS Products Excluded:  ${skippedRlsCount} (already existing in DB)`);
  console.log("\nBreakdown by Brand Division:");
  for (const [code, count] of Object.entries(divisionIngestCounts)) {
    const cfg = DIVISION_CONFIG[code];
    console.log(`  - [${code}] ${cfg.name}: ${count} formulations`);
  }

  // Final Database State Verification
  const [totalMfgInDb, totalProductsInDb, rlsInDb] = await Promise.all([
    prisma.manufacturer.count(),
    prisma.product.count(),
    prisma.product.count({
      where: { manufacturer: { slug: "rhine-life-sciences" } },
    }),
  ]);

  console.log("\nFinal Database Counts:");
  console.log(`  - Total Manufacturers in DB: ${totalMfgInDb}`);
  console.log(`  - Total Products in DB:      ${totalProductsInDb}`);
  console.log(`  - Rhine Life Sciences (RLS): ${rlsInDb} (preserved)`);
  console.log(`  - New Division Formulations: ${totalProductsInDb - rlsInDb}`);
  console.log("==================================================================\n");
}

if (require.main === module) {
  seedRhineGroupMasterProducts()
    .catch((e) => {
      console.error("Fatal error during Rhine Group master product seeding:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
