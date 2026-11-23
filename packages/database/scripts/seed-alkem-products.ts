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
      /(\d+(?:\.\d+)?)\s*(% w\/w|% w\/v|%|mg\/ml|mg\/5ml|mg|g|mcg|ml|iu|billion spores|billion cfu|million spores|cfu)(?!\w)/i
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

    if (!name) {
      name = cleanedPart || "Standard Formulation";
    }

    // Common pharma synonym aliases for search
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
    if (/bisoprolol/i.test(name)) aliases.push("Bisoprolol Fumarate", "Concor");
    if (/ondansetron/i.test(name)) aliases.push("Ondansetron Hydrochloride", "Zofran");
    if (/ceftriaxone/i.test(name)) aliases.push("Rocephin");
    if (/cefpodoxime/i.test(name)) aliases.push("Cefpodoxime Proxetil");
    if (/cefixime/i.test(name)) aliases.push("Cefixime Trihydrate");
    if (/azithromycin/i.test(name)) aliases.push("Azithromycin Dihydrate", "Zithromax");
    if (/clavulanic/i.test(name)) aliases.push("Clavulanate Potassium");

    const ingSlug = slugify(name);
    if (name.length > 0 && ingSlug && !seenSlugsInProduct.has(ingSlug)) {
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
          name: cleanComp || "Standard Formulation",
          quantity: 1,
          unit: "unit",
          perBasis,
          isPrimary: true,
          aliases: [],
        },
      ];
}

export async function seedAlkemProducts() {
  console.log("==================================================================");
  console.log("  Seed All Products Under Single Manufacturer 'Alkem' ");
  console.log("==================================================================\n");

  const jsonFilePath = fs.existsSync(
    path.resolve(__dirname, "../data/Alkem_Group_Master_Products_477.json")
  )
    ? path.resolve(__dirname, "../data/Alkem_Group_Master_Products_477.json")
    : path.resolve(__dirname, "../data/Alkem_Group_Master_Products_634.json");

  if (!fs.existsSync(jsonFilePath)) {
    console.error(`Error: JSON file not found at ${jsonFilePath}`);
    process.exit(1);
  }

  const rawJson: MasterJson = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
  console.log(`• Effective Date:       ${rawJson.metadata.effective_date}`);
  console.log(`• Total Divisions:      ${rawJson.metadata.total_divisions}`);
  console.log(`• Total Master Products: ${rawJson.metadata.total_products}\n`);

  // 1. Ensure Distribution Companies Exist
  console.log("--- Step 1: Verifying Distribution Companies ---");
  const lakshmi = await prisma.company.upsert({
    where: { slug: "lakshmi-pharma" },
    update: {},
    create: {
      name: "Lakshmi Pharma",
      slug: "lakshmi-pharma",
      shortName: "Lakshmi",
      accentColor: "#0d9488",
      tagline: "Authorized Ethical & Generics Pharmaceutical Distribution",
      description:
        "Founded in 1998, Lakshmi Pharma is an authorized distributor of pharmaceutical formulations, essential generics, and hospital supplies serving over 1,400 retail pharmacies, nursing homes, and clinics across South India.",
      serviceAreas: "Kerala (Ernakulam, Thrissur, Palakkad, Kozhikode, Malappuram), Tamil Nadu (Coimbatore District)",
      address: "Door No. 42/1892, Pharma Trade Complex, Market Road, Ernakulam, Kochi, Kerala - 682035",
      phone: "+91 484 235 6789",
      email: "orders@lakshmipharma.demo",
      whatsapp: "+91 94471 23456",
      mapUrl: "https://maps.google.com/?q=Kochi+Kerala",
      businessHours: "Monday to Saturday: 8:30 AM - 7:30 PM (Sunday Closed)",
      drugLicenseNo: "KL-EKM-2024-DL-10928A / 10928B",
      gstin: "32AAAAA0000A1Z5",
      isActive: true,
    },
  });

  let kothittil = await prisma.company.findFirst({
    where: { slug: { in: ["kothottil-pharma", "kothittil-pharma"] } },
  });

  if (!kothittil) {
    kothittil = await prisma.company.create({
      data: {
        name: "The Kothottil Pharmaceutical Distributor",
        slug: "kothottil-pharma",
        shortName: "Kothottil",
        accentColor: "#0284c7",
        tagline: "Specialty Therapeutics, Critical Care & Institutional Supply",
        description:
          "Established in 2005, The Kothottil Pharmaceutical Distributor specializes in cold-chain logistics, cardiology, diabetology, and oncology institutional supply chains.",
        serviceAreas: "Kerala (Thiruvananthapuram, Kollam, Alappuzha, Kottayam, Pathanamthitta), Karnataka (Bengaluru Urban)",
        address: "Plot 14B, Healthcare Logistics Hub, NH 66 Bypass, Kazhakkoottam, Thiruvananthapuram, Kerala - 695024",
        phone: "+91 471 245 8890",
        email: "supply@kothottilpharma.demo",
        whatsapp: "+91 98460 78901",
        mapUrl: "https://maps.google.com/?q=Thiruvananthapuram+Kerala",
        businessHours: "Monday to Saturday: 8:00 AM - 8:00 PM (24x7 Critical Care Emergency Support)",
        drugLicenseNo: "KL-TVM-2023-DL-88412A / 88412B",
        gstin: "32BBBBB1111B1Z2",
        isActive: true,
      },
    });
  }
  console.log(`  ✓ Companies ready: ${lakshmi.name} & ${kothittil.name}\n`);

  // 2. Ensure Single Manufacturer "Alkem" Exists
  console.log("--- Step 2: Creating / Upserting Single Manufacturer 'Alkem' ---");
  const alkem = await prisma.manufacturer.upsert({
    where: { slug: "alkem" },
    update: {
      name: "Alkem",
      website: "https://www.alkemlabs.com",
      logoUrl: "/logos/alkem.svg",
      country: "India",
      isDemo: false,
    },
    create: {
      name: "Alkem",
      slug: "alkem",
      website: "https://www.alkemlabs.com",
      logoUrl: "/logos/alkem.svg",
      country: "India",
      isDemo: false,
    },
  });
  console.log(`  ✓ Manufacturer: ${alkem.name} (Slug: ${alkem.slug}, ID: ${alkem.id})`);

  // Authorize Alkem with both distribution firms
  const targetCompanies = [lakshmi, kothittil];
  for (const comp of targetCompanies) {
    await prisma.companyManufacturer.upsert({
      where: {
        companyId_manufacturerId: {
          companyId: comp.id,
          manufacturerId: alkem.id,
        },
      },
      update: {
        isAuthorized: true,
        partnershipDetails: "Principal Authorized Pharmaceutical Manufacturer (Alkem)",
      },
      create: {
        companyId: comp.id,
        manufacturerId: alkem.id,
        isAuthorized: true,
        partnershipDetails: "Principal Authorized Pharmaceutical Manufacturer (Alkem)",
      },
    });
    console.log(`  ✓ Authorized 'Alkem' for ${comp.name}`);
  }

  // 3. Clean up any existing Alkem products for clean idempotent re-runs
  console.log("\n--- Step 3: Checking for Existing Alkem Formulations ---");
  const existingAlkemProducts = await prisma.product.findMany({
    where: { manufacturerId: alkem.id },
    select: { id: true },
  });

  if (existingAlkemProducts.length > 0) {
    const existingIds = existingAlkemProducts.map((p) => p.id);
    console.log(`  • Cleaning ${existingIds.length} existing Alkem products for clean seed...`);
    await prisma.inquiry.updateMany({
      where: { productId: { in: existingIds } },
      data: { productId: null },
    });
    await prisma.companyProduct.deleteMany({
      where: { productId: { in: existingIds } },
    });
    await prisma.productIngredient.deleteMany({
      where: { productId: { in: existingIds } },
    });
    await prisma.productCategory.deleteMany({
      where: { productId: { in: existingIds } },
    });
    await prisma.product.deleteMany({
      where: { id: { in: existingIds } },
    });
    console.log(`  ✓ Purged ${existingIds.length} previous Alkem product records`);
  } else {
    console.log(`  ✓ No existing Alkem products found, proceeding with fresh insert`);
  }

  // 4. Pre-process and Upsert Canonical Active Ingredients
  console.log("\n--- Step 4: Indexing & Upserting Active Ingredients ---");
  const uniqueIngredientsMap = new Map<
    string,
    { name: string; slug: string; aliases: Set<string> }
  >();

  // Pre-parse all products
  const productParsedData = rawJson.products.map((item) => {
    const ingredients = parseIngredients(item.composition_short, item.type);
    for (const ing of ingredients) {
      const ingSlug = slugify(ing.name);
      if (!ingSlug) continue;
      if (!uniqueIngredientsMap.has(ingSlug)) {
        uniqueIngredientsMap.set(ingSlug, {
          name: ing.name,
          slug: ingSlug,
          aliases: new Set(ing.aliases),
        });
      } else {
        const existing = uniqueIngredientsMap.get(ingSlug)!;
        ing.aliases.forEach((a) => existing.aliases.add(a));
      }
    }
    return { item, ingredients };
  });

  console.log(`  • Discovered ${uniqueIngredientsMap.size} unique active ingredients.`);

  // Upsert all unique ingredients
  const ingredientDbMap = new Map<string, string>(); // slug -> db ID
  let ingUpsertCount = 0;

  for (const [slug, ingData] of uniqueIngredientsMap) {
    const ingredient = await prisma.ingredient.upsert({
      where: { slug: ingData.slug },
      update: { name: ingData.name },
      create: {
        name: ingData.name,
        slug: ingData.slug,
        description: `Active pharmaceutical substance: ${ingData.name}`,
      },
    });
    ingredientDbMap.set(slug, ingredient.id);

    // Upsert aliases
    for (const alias of ingData.aliases) {
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

    ingUpsertCount++;
    if (ingUpsertCount % 50 === 0 || ingUpsertCount === uniqueIngredientsMap.size) {
      process.stdout.write(`  ✓ Indexed ${ingUpsertCount}/${uniqueIngredientsMap.size} ingredients...\n`);
    }
  }

  // 5. Ingest ALL Products Under Manufacturer "Alkem"
  console.log(`\n--- Step 5: Ingesting All ${productParsedData.length} Products Under 'Alkem' ---`);

  // Track slugs to guarantee uniqueness
  const seenSlugs = new Set<string>();
  let ingestedCount = 0;

  // Process in concurrent batches of 10 for speed while avoiding connection overload
  const BATCH_SIZE = 10;
  for (let i = 0; i < productParsedData.length; i += BATCH_SIZE) {
    const chunk = productParsedData.slice(i, i + BATCH_SIZE);

    await Promise.all(
      chunk.map(async ({ item, ingredients }) => {
        // Generate unique slug
        let baseSlug = slugify(`alkem-${item.product_name}`);
        let productSlug = baseSlug;

        if (seenSlugs.has(productSlug)) {
          const packClean = slugify(item.pack);
          if (packClean) productSlug = `${baseSlug}-${packClean}`;
        }
        if (seenSlugs.has(productSlug)) {
          const divClean = slugify(item.division_code);
          if (divClean) productSlug = `${productSlug}-${divClean}`;
        }
        if (seenSlugs.has(productSlug)) {
          productSlug = `${productSlug}-${item.id}`;
        }
        seenSlugs.add(productSlug);

        // Build distributor pricing & division notes
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
        if (item.division_code) notesParts.push(`Division: ${item.division_code}`);

        const distributorNotes = notesParts.join(" | ");

        // Determine regulatory schedule
        let schedule = "Schedule H Prescription Drug";
        if (
          /supplement|powder|protein|soap|moisturiz|sunscreen|serum|shampoo|lotion|device/i.test(
            item.type
          ) ||
          ((/nutritional|collagen|peptide|calcium|multivitamin|probiotic/i.test(
            item.composition_short
          ) ||
            /device/i.test(item.type)) &&
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
          !/hydrochloride|tramadol|codeine/i.test(item.composition_short) &&
          !/tablet/i.test(item.type)
        ) {
          schedule = "General Sale / OTC";
        }

        // A. Create Product
        const product = await prisma.product.create({
          data: {
            name: item.product_name,
            slug: productSlug,
            manufacturerId: alkem.id, // Strictly under the single "Alkem" manufacturer
            dosageForm: item.type,
            packaging: item.pack,
            description: item.composition_full || item.composition_short,
            storageConditions:
              "Store in a cool and dry place below 30°C. Protect from light and moisture.",
            schedule,
            isDemo: false,
          },
        });

        // B. Link Active Ingredients (using createMany)
        const productIngredientsData: Array<{
          productId: string;
          ingredientId: string;
          quantity: number;
          unit: string;
          perBasis: string;
          isPrimary: boolean;
        }> = [];

        for (const pIng of ingredients) {
          const ingSlug = slugify(pIng.name);
          const ingId = ingredientDbMap.get(ingSlug);
          if (!ingId) continue;

          productIngredientsData.push({
            productId: product.id,
            ingredientId: ingId,
            quantity: pIng.quantity,
            unit: pIng.unit,
            perBasis: pIng.perBasis,
            isPrimary: pIng.isPrimary,
          });
        }

        if (productIngredientsData.length > 0) {
          await prisma.productIngredient.createMany({
            data: productIngredientsData,
            skipDuplicates: true,
          });
        }

        // C. Link into Company Catalogs (Lakshmi & Kothittil)
        const companyProductsData: Array<{
          companyId: string;
          productId: string;
          isPublished: boolean;
          isFeatured: boolean;
          itemCode: string;
          distributorNotes: string | null;
        }> = [];

        for (const comp of targetCompanies) {
          const codePrefix = comp.slug === "lakshmi-pharma" ? "LK" : "KT";
          const cleanProdCode = slugify(item.product_name)
            .toUpperCase()
            .replace(/-/g, "")
            .substring(0, 8);
          const itemCode = `${codePrefix}-ALK-${String(item.id).padStart(3, "0")}-${cleanProdCode}`;

          companyProductsData.push({
            companyId: comp.id,
            productId: product.id,
            isPublished: true,
            isFeatured: false,
            itemCode,
            distributorNotes: distributorNotes || null,
          });
        }

        await prisma.companyProduct.createMany({
          data: companyProductsData,
          skipDuplicates: true,
        });

        ingestedCount++;
      })
    );

    if (ingestedCount % 50 === 0 || ingestedCount === productParsedData.length) {
      process.stdout.write(
        `  ✓ Ingested ${ingestedCount}/${productParsedData.length} formulations under 'Alkem'...\n`
      );
    }
  }

  // 6. Final Summary & Verification
  console.log("\n==================================================================");
  console.log("  Alkem Seeding Completed Successfully!");
  console.log("==================================================================");

  const [totalMfgInDb, totalProductsInDb, mfgList] = await Promise.all([
    prisma.manufacturer.count(),
    prisma.product.count(),
    prisma.manufacturer.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: true, companyManufacturers: true } },
      },
    }),
  ]);

  console.log(`• Total Manufacturers in DB: ${totalMfgInDb}`);
  for (const m of mfgList) {
    console.log(
      `  - ${m.name} [slug: ${m.slug}]: ${m._count.products} products (Linked to ${m._count.companyManufacturers} companies)`
    );
  }
  console.log(`• Total Products in DB:      ${totalProductsInDb}`);

  const [lakshmiCount, kothittilCount] = await Promise.all([
    prisma.companyProduct.count({ where: { companyId: lakshmi.id } }),
    prisma.companyProduct.count({ where: { companyId: kothittil.id } }),
  ]);
  console.log(`• Lakshmi Pharma Catalog:    ${lakshmiCount} products`);
  console.log(`• Kothittil Catalog:         ${kothittilCount} products`);
  console.log("==================================================================\n");
}

if (require.main === module) {
  seedAlkemProducts()
    .catch((e) => {
      console.error("Fatal error during Alkem seeding:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
