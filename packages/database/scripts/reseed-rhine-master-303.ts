import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
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

export async function resetAndSeedAllUnderRhine() {
  console.log("==================================================================");
  console.log("  Reset & Seed All 303 Products Under Single Manufacturer 'Rhine' ");
  console.log("==================================================================\n");

  const jsonFilePath = path.resolve(
    __dirname,
    "../data/Rhine_Group_Master_Products_303 1.json"
  );

  if (!fs.existsSync(jsonFilePath)) {
    console.error(`Error: JSON file not found at ${jsonFilePath}`);
    process.exit(1);
  }

  const rawJson: MasterJson = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
  console.log(`• Effective Date:       ${rawJson.metadata.effective_date}`);
  console.log(`• Total Master Products: ${rawJson.metadata.total_products}\n`);

  // 1. Clean up old products and manufacturers completely
  console.log("--- Step 1: Purging Old Products & Manufacturer Records ---");

  // Detach any product reference on inquiries
  await prisma.inquiry.updateMany({
    data: { productId: null },
  });

  // Delete all company products
  const deletedCompanyProducts = await prisma.companyProduct.deleteMany({});
  console.log(`  ✓ Deleted ${deletedCompanyProducts.count} company-product mappings`);

  // Delete all product ingredients
  const deletedProductIngredients = await prisma.productIngredient.deleteMany({});
  console.log(`  ✓ Deleted ${deletedProductIngredients.count} product-ingredient mappings`);

  // Delete all product categories
  await prisma.productCategory.deleteMany({});

  // Delete all products
  const deletedProducts = await prisma.product.deleteMany({});
  console.log(`  ✓ Deleted ${deletedProducts.count} old products`);

  // Delete all company manufacturer links
  const deletedCompanyMfgs = await prisma.companyManufacturer.deleteMany({});
  console.log(`  ✓ Deleted ${deletedCompanyMfgs.count} company-manufacturer authorizations`);

  // Delete all manufacturers
  const deletedMfgs = await prisma.manufacturer.deleteMany({});
  console.log(`  ✓ Deleted ${deletedMfgs.count} old manufacturers\n`);

  // 2. Ensure Companies exist
  console.log("--- Step 2: Initializing Distribution Companies ---");
  const lakshmi = await prisma.company.upsert({
    where: { slug: "lakshmi-pharma" },
    update: {
      name: "Lakshmi Pharma",
      shortName: "Lakshmi",
      accentColor: "#0d9488",
    },
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

  const kothittil = await prisma.company.upsert({
    where: { slug: "kothittil-pharma" },
    update: {
      name: "The Kothittil Pharmaceutical Distributor",
      shortName: "Kothittil",
      accentColor: "#0284c7",
    },
    create: {
      name: "The Kothittil Pharmaceutical Distributor",
      slug: "kothittil-pharma",
      shortName: "Kothittil",
      accentColor: "#0284c7",
      tagline: "Specialty Therapeutics, Critical Care & Institutional Supply",
      description:
        "Established in 2005, The Kothittil Pharmaceutical Distributor specializes in cold-chain logistics, cardiology, diabetology, and oncology institutional supply chains.",
      serviceAreas: "Kerala (Thiruvananthapuram, Kollam, Alappuzha, Kottayam, Pathanamthitta), Karnataka (Bengaluru Urban)",
      address: "Plot 14B, Healthcare Logistics Hub, NH 66 Bypass, Kazhakkoottam, Thiruvananthapuram, Kerala - 695024",
      phone: "+91 471 245 8890",
      email: "supply@kothittilpharma.demo",
      whatsapp: "+91 98460 78901",
      mapUrl: "https://maps.google.com/?q=Thiruvananthapuram+Kerala",
      businessHours: "Monday to Saturday: 8:00 AM - 8:00 PM (24x7 Critical Care Emergency Support)",
      drugLicenseNo: "KL-TVM-2023-DL-88412A / 88412B",
      gstin: "32BBBBB1111B1Z2",
      isActive: true,
    },
  });
  console.log(`  ✓ Verified companies: ${lakshmi.name} & ${kothittil.name}\n`);

  // 3. Create the SINGLE Manufacturer: "Rhine"
  console.log("--- Step 3: Creating Single Manufacturer 'Rhine' ---");
  const rhine = await prisma.manufacturer.create({
    data: {
      name: "Rhine",
      slug: "rhine",
      website: "https://rhinebiogenics.com",
      logoUrl: "/logos/rhine.svg",
      country: "India",
      isDemo: false,
    },
  });
  console.log(`  ✓ Single Manufacturer Created: ${rhine.name} (Slug: ${rhine.slug}, ID: ${rhine.id})`);

  // Authorize Rhine with both distribution firms
  const targetCompanies = [lakshmi, kothittil];
  for (const comp of targetCompanies) {
    await prisma.companyManufacturer.create({
      data: {
        companyId: comp.id,
        manufacturerId: rhine.id,
        isAuthorized: true,
        partnershipDetails: "Principal Authorized Pharmaceutical Manufacturer (Rhine)",
      },
    });
    console.log(`  ✓ Authorized 'Rhine' for ${comp.name}`);
  }

  // 4. Ingest ALL 303 Products Under Manufacturer "Rhine"
  console.log("\n--- Step 4: Ingesting All 303 Products Under 'Rhine' ---");
  let ingestedCount = 0;

  for (const item of rawJson.products) {
    // Generate unique slug for every product under rhine
    const productSlug = slugify(`rhine-${item.product_name}`);

    // Build distributor pricing notes
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

    // A. Create Product Master
    const product = await prisma.product.create({
      data: {
        name: item.product_name,
        slug: productSlug,
        manufacturerId: rhine.id, // Strictly under the single "Rhine" manufacturer
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
      await prisma.productIngredient.create({
        data: {
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
      const itemCode = `${codePrefix}-RHN-${String(item.id).padStart(3, "0")}-${cleanProdCode}`;

      await prisma.companyProduct.create({
        data: {
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
    if (ingestedCount % 25 === 0 || ingestedCount === rawJson.products.length) {
      process.stdout.write(
        `  ✓ Ingested ${ingestedCount}/${rawJson.products.length} formulations under 'Rhine'...\n`
      );
    }
  }

  // 5. Ensure Admin Accounts
  console.log("\n--- Step 5: Verifying Admin Accounts ---");
  const salt = await bcrypt.genSalt(10);
  const superAdminHash = await bcrypt.hash("SuperAdmin@2026", salt);
  const lakshmiAdminHash = await bcrypt.hash("Lakshmi@2026", salt);
  const kothittilAdminHash = await bcrypt.hash("Kothittil@2026", salt);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@lkpharma.demo" },
    update: { passwordHash: superAdminHash, role: "SUPER_ADMIN" },
    create: {
      email: "superadmin@lkpharma.demo",
      passwordHash: superAdminHash,
      name: "L & K Master Executive",
      role: "SUPER_ADMIN",
    },
  });

  const lakshmiAdmin = await prisma.user.upsert({
    where: { email: "admin@lakshmipharma.demo" },
    update: { passwordHash: lakshmiAdminHash, role: "COMPANY_ADMIN" },
    create: {
      email: "admin@lakshmipharma.demo",
      passwordHash: lakshmiAdminHash,
      name: "Lakshmi Operations Lead",
      role: "COMPANY_ADMIN",
    },
  });

  await prisma.companyMembership.upsert({
    where: {
      userId_companyId: {
        userId: lakshmiAdmin.id,
        companyId: lakshmi.id,
      },
    },
    update: {},
    create: {
      userId: lakshmiAdmin.id,
      companyId: lakshmi.id,
    },
  });

  const kothittilAdmin = await prisma.user.upsert({
    where: { email: "admin@kothittilpharma.demo" },
    update: { passwordHash: kothittilAdminHash, role: "COMPANY_ADMIN" },
    create: {
      email: "admin@kothittilpharma.demo",
      passwordHash: kothittilAdminHash,
      name: "Kothittil Institutional Lead",
      role: "COMPANY_ADMIN",
    },
  });

  await prisma.companyMembership.upsert({
    where: {
      userId_companyId: {
        userId: kothittilAdmin.id,
        companyId: kothittil.id,
      },
    },
    update: {},
    create: {
      userId: kothittilAdmin.id,
      companyId: kothittil.id,
    },
  });
  console.log("  ✓ Admin accounts verified (SuperAdmin, LakshmiAdmin, KothittilAdmin)");

  // Final Summary
  console.log("\n==================================================================");
  console.log("  Reset & Re-seed Completed Successfully!");
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

  console.log(`• Total Manufacturers in DB: ${totalMfgInDb} (Only 1: 'Rhine')`);
  for (const m of mfgList) {
    console.log(`  - ${m.name} [slug: ${m.slug}]: ${m._count.products} products (Linked to ${m._count.companyManufacturers} companies)`);
  }
  console.log(`• Total Products in DB:      ${totalProductsInDb}`);
  console.log("==================================================================\n");
}

if (require.main === module) {
  resetAndSeedAllUnderRhine()
    .catch((e) => {
      console.error("Fatal error during reset and seeding:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

