import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// Initialize Prisma with database connection
const prisma = new PrismaClient();

interface CsvRow {
  slNo?: string;
  product: string;
  type: string;
  ingredients: string;
  fullLabelComposition?: string;
  pack: string;
  gstPercent?: string;
  pts?: string;
  ptr?: string;
  mrp?: string;
  hsnCode?: string;
}

/** Robust CSV parser handling quoted fields, commas inside quotes, and escaped quotes */
function parseCsv(csvText: string): CsvRow[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Parse a single CSV line into tokens
  function parseLine(line: string): string[] {
    const tokens: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        tokens.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    tokens.push(current.trim());
    return tokens;
  }

  const headerTokens = parseLine(lines[0]).map((h) => h.toLowerCase());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawTokens = parseLine(lines[i]);
    if (rawTokens.length < 2 || !rawTokens[1]) continue;

    // Map by header index or positional fallback
    const getVal = (colNames: string[], fallbackIdx: number): string => {
      for (const name of colNames) {
        const idx = headerTokens.findIndex((h) => h.includes(name));
        if (idx >= 0 && rawTokens[idx]) return rawTokens[idx];
      }
      return rawTokens[fallbackIdx] ?? "";
    };

    rows.push({
      slNo: getVal(["sl.no", "sl no", "slno"], 0),
      product: getVal(["product"], 1),
      type: getVal(["type", "dosage"], 2) || "Tablet",
      ingredients: getVal(["ingredients", "standard active composition"], 3),
      fullLabelComposition: getVal(["full label", "corrected", "composition"], 4),
      pack: getVal(["pack"], 5) || "Standard Pack",
      gstPercent: getVal(["gst"], 6),
      pts: getVal(["pts"], 7),
      ptr: getVal(["ptr"], 8),
      mrp: getVal(["mrp"], 9),
      hsnCode: getVal(["hsn"], 10),
    });
  }

  return rows;
}

/** Converts strings to URL-safe alphanumeric slugs */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Parses individual active ingredients from standard composition strings */
interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
  perBasis: string;
  isPrimary: boolean;
  aliases: string[];
}

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

  // Determine basis (e.g. per tablet, per 5 ml, per dose)
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

  // Remove the "(per 5 ml)" suffix before splitting
  const cleanComp = compString.replace(/\(per\s+[^)]+\)/i, "").trim();

  // Split ingredients by " + "
  const parts = cleanComp.split(/\s*\+\s*/);
  const results: ParsedIngredient[] = [];

  for (let idx = 0; idx < parts.length; idx++) {
    const rawPart = parts[idx].trim();
    if (!rawPart) continue;

    const aliases: string[] = [];

    // Extract secondary equivalent salts in parentheses, e.g. "(eq. to Diclofenac Sodium 1.0% w/w)"
    const eqMatch = rawPart.match(/\((?:eq\.?\s*to\s*)?([^)]+)\)/i);
    if (eqMatch) {
      aliases.push(eqMatch[1].trim());
    }

    // Clean out parenthetical notes like (SR), (ER), (EC) for the ingredient name
    const cleanedPart = rawPart.replace(/\([^)]*\)/g, "").trim();

    // Match numeric strength and units: e.g. "650 mg", "1.16% w/w", "200 IU", "500 mcg", "10 ml"
    const strengthMatch = cleanedPart.match(/(\d+(?:\.\d+)?)\s*(% w\/w|% w\/v|%|mg|g|mcg|ml|iu)\b/i);

    let name = cleanedPart;
    let quantity = 1;
    let unit = "unit";

    if (strengthMatch) {
      quantity = parseFloat(strengthMatch[1]);
      unit = strengthMatch[2].trim();
      // Name is the portion before the matched strength
      name = cleanedPart.substring(0, strengthMatch.index).trim();
      // Remove trailing words like "IP", "BP", "USP" if left behind
      name = name.replace(/\b(IP|BP|USP)\b/g, "").trim();
    } else {
      // Non-numeric component like "Multivitamins", "Multiminerals", "Amino Acids", "Protein"
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

    if (name.length > 0) {
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

async function main() {
  console.log("====================================================");
  console.log("  L & K Pharma - Bulk Brand Product Ingestion Engine");
  console.log("====================================================\n");

  // CLI Arguments
  const args = process.argv.slice(2);
  const getArg = (flag: string, fallback: string): string => {
    const idx = args.indexOf(flag);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const defaultCsvPath = path.resolve(__dirname, "../data/rhine-life-sciences.csv");
  const filePath = getArg("--file", defaultCsvPath);
  const brandName = getArg("--brand", "Rhine Life Sciences Pvt. Ltd.");
  const brandSlug = getArg("--brandSlug", "rhine-life-sciences");
  const companyTarget = getArg("--company", "lakshmi-pharma"); // "lakshmi-pharma", "kothittil-pharma", or "both"

  console.log(`• CSV Dataset:  ${filePath}`);
  console.log(`• Brand Name:   ${brandName} (${brandSlug})`);
  console.log(`• Target Firm:  ${companyTarget}\n`);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: CSV file not found at ${filePath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(filePath, "utf-8");
  const rows = parseCsv(csvContent);
  console.log(`✓ Parsed ${rows.length} product rows from file.\n`);

  // 1. Upsert Brand / Manufacturer
  const brand = await prisma.manufacturer.upsert({
    where: { slug: brandSlug },
    update: {
      name: brandName,
      website: "https://rhinebiogenics.com",
      logoUrl: "/logos/rhine.svg",
      country: "India",
    },
    create: {
      name: brandName,
      slug: brandSlug,
      website: "https://rhinebiogenics.com",
      logoUrl: "/logos/rhine.svg",
      country: "India",
      isDemo: false,
    },
  });
  console.log(`✓ Brand Manufacturer initialized: ${brand.name} [ID: ${brand.id}]`);

  // 2. Identify Target Distribution Companies (Lakshmi / Kothittil)
  const targetSlugs =
    companyTarget === "both" || companyTarget === "all"
      ? ["lakshmi-pharma", "kothittil-pharma"]
      : companyTarget.split(",").map((s) => s.trim());

  const companies = await prisma.company.findMany({
    where: { slug: { in: targetSlugs } },
  });

  if (companies.length === 0) {
    console.error(`Error: Could not locate companies matching [${targetSlugs.join(", ")}]`);
    process.exit(1);
  }

  // 3. Authorize Brand Partnership with target distribution firms
  for (const comp of companies) {
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
        partnershipDetails: "Authorized Regional Stockist & Wholesale Partner (Rhine Life Sciences)",
      },
    });
    console.log(`✓ Authorized distribution partnership linked with ${comp.name}`);
  }

  console.log("\n--- Ingesting Products & Chemical Formulations ---");

  let createdCount = 0;
  let updatedCount = 0;

  for (const row of rows) {
    if (!row.product) continue;

    // Generate unique slug for product
    const productSlug = slugify(`${brandSlug}-${row.product}`);

    // Build distributor notes with pricing, GST, and HSN Code
    const notesParts: string[] = [];
    if (row.mrp) notesParts.push(`MRP: ₹${row.mrp}`);
    if (row.pts) notesParts.push(`PTS: ₹${row.pts}`);
    if (row.ptr) notesParts.push(`PTR: ₹${row.ptr}`);
    if (row.gstPercent) {
      const gstVal = parseFloat(row.gstPercent);
      const gstText = gstVal < 1 ? `${Math.round(gstVal * 100)}%` : `${gstVal}%`;
      notesParts.push(`GST: ${gstText}`);
    }
    if (row.hsnCode) notesParts.push(`HSN: ${row.hsnCode}`);

    const distributorNotes = notesParts.join(" | ");

    // Determine regulatory schedule
    let schedule = "Schedule H Prescription Drug";
    if (/supplement|powder|protein/i.test(row.type) || /nutritional/i.test(row.ingredients)) {
      schedule = "Nutritional / Dietary Supplement";
    } else if (/paracetamol/i.test(row.ingredients) && !/hydrochloride/i.test(row.ingredients)) {
      schedule = "General Sale / OTC";
    }

    // 4. Upsert Product Master Record
    const product = await prisma.product.upsert({
      where: { slug: productSlug },
      update: {
        name: row.product,
        manufacturerId: brand.id,
        dosageForm: row.type,
        packaging: row.pack,
        description: row.fullLabelComposition || row.ingredients,
        storageConditions: "Store in a cool and dry place below 30°C. Protect from light and moisture.",
        schedule,
      },
      create: {
        name: row.product,
        slug: productSlug,
        manufacturerId: brand.id,
        dosageForm: row.type,
        packaging: row.pack,
        description: row.fullLabelComposition || row.ingredients,
        storageConditions: "Store in a cool and dry place below 30°C. Protect from light and moisture.",
        schedule,
        isDemo: false,
      },
    });

    // 5. Parse and Upsert Active Ingredients & Formulations
    const parsedIngredients = parseIngredients(row.ingredients, row.type);

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

    // 6. Link Product into Target Company's Catalog Overlay (CompanyProduct)
    for (const comp of companies) {
      const codePrefix = comp.slug === "lakshmi-pharma" ? "LK" : "KT";
      const itemCode = `${codePrefix}-RHN-${slugify(row.product).toUpperCase().replace(/-/g, "").substring(0, 8)}`;

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

    process.stdout.write(`  ✓ Ingested: [${row.type}] ${row.product} (${row.pack}) -> Active: ${row.ingredients.substring(0, 42)}...\n`);
    createdCount++;
  }

  console.log(`\n====================================================`);
  console.log(`✓ Bulk Ingestion Complete!`);
  console.log(`  - Total Products Ingested: ${createdCount}`);
  console.log(`  - Brand: ${brand.name}`);
  console.log(`  - Companies Updated: ${companies.map((c) => c.name).join(", ")}`);
  console.log(`====================================================\n`);
}

main()
  .catch((e) => {
    console.error("Fatal error during brand product ingestion:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

