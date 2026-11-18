import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("====================================================");
  console.log("  Purging Non-Rhine Brands & Products from Database ");
  console.log("====================================================\n");

  // 1. Identify Rhine Life Sciences
  const rhineMfg = await prisma.manufacturer.findFirst({
    where: {
      OR: [
        { slug: "rhine-life-sciences" },
        { name: { contains: "Rhine Life Sciences", mode: "insensitive" } },
      ],
    },
  });

  if (!rhineMfg) {
    console.error("Error: Could not find 'Rhine Life Sciences' manufacturer in the database.");
    console.error("Please run 'npm run db:import' first.");
    process.exit(1);
  }

  console.log(`✓ Keeping brand: ${rhineMfg.name} (ID: ${rhineMfg.id}, slug: ${rhineMfg.slug})`);

  // 2. Identify products to delete (all products not belonging to rhine-life-sciences)
  const productsToDelete = await prisma.product.findMany({
    where: {
      manufacturerId: { not: rhineMfg.id },
    },
    select: { id: true, name: true, slug: true },
  });

  console.log(`• Found ${productsToDelete.length} non-Rhine products to delete:`);
  productsToDelete.forEach((p) => console.log(`   - ${p.name} (${p.slug})`));

  const productIdsToDelete = productsToDelete.map((p) => p.id);

  if (productIdsToDelete.length > 0) {
    // A. Detach inquiries from these products (preserve inquiry record)
    const updatedInquiries = await prisma.inquiry.updateMany({
      where: { productId: { in: productIdsToDelete } },
      data: { productId: null },
    });
    console.log(`✓ Detached ${updatedInquiries.count} inquiries from deleted products.`);

    // B. Delete CompanyProduct listings
    const deletedCp = await prisma.companyProduct.deleteMany({
      where: { productId: { in: productIdsToDelete } },
    });
    console.log(`✓ Deleted ${deletedCp.count} company catalog listings.`);

    // C. Delete ProductIngredient links
    const deletedPi = await prisma.productIngredient.deleteMany({
      where: { productId: { in: productIdsToDelete } },
    });
    console.log(`✓ Deleted ${deletedPi.count} product ingredient associations.`);

    // D. Delete ProductCategory links
    const deletedPc = await prisma.productCategory.deleteMany({
      where: { productId: { in: productIdsToDelete } },
    });
    console.log(`✓ Deleted ${deletedPc.count} product category associations.`);

    // E. Delete Product records
    const deletedProducts = await prisma.product.deleteMany({
      where: { id: { in: productIdsToDelete } },
    });
    console.log(`✓ Deleted ${deletedProducts.count} product master records.`);
  }

  // 3. Delete non-Rhine manufacturers
  const manufacturersToDelete = await prisma.manufacturer.findMany({
    where: {
      id: { not: rhineMfg.id },
    },
    select: { id: true, name: true, slug: true },
  });

  console.log(`\n• Found ${manufacturersToDelete.length} non-Rhine brands to delete:`);
  manufacturersToDelete.forEach((m) => console.log(`   - ${m.name} (${m.slug})`));

  const mfgIdsToDelete = manufacturersToDelete.map((m) => m.id);

  if (mfgIdsToDelete.length > 0) {
    // Delete CompanyManufacturer records
    const deletedCm = await prisma.companyManufacturer.deleteMany({
      where: { manufacturerId: { in: mfgIdsToDelete } },
    });
    console.log(`✓ Deleted ${deletedCm.count} company-manufacturer partnerships.`);

    // Delete Manufacturer records
    const deletedMfgs = await prisma.manufacturer.deleteMany({
      where: { id: { in: mfgIdsToDelete } },
    });
    console.log(`✓ Deleted ${deletedMfgs.count} manufacturer brand records.`);
  }

  // 4. Clean up orphaned ingredients that have 0 remaining products
  const orphanedIngredients = await prisma.ingredient.findMany({
    where: {
      productIngredients: { none: {} },
    },
    select: { id: true, name: true },
  });

  if (orphanedIngredients.length > 0) {
    const orphanIds = orphanedIngredients.map((i) => i.id);
    await prisma.ingredientAlias.deleteMany({
      where: { ingredientId: { in: orphanIds } },
    });
    const deletedIngs = await prisma.ingredient.deleteMany({
      where: { id: { in: orphanIds } },
    });
    console.log(`✓ Cleaned up ${deletedIngs.count} unused/orphaned ingredients.`);
  }

  // 5. Ensure both distribution firms (Lakshmi & Kothittil) have Rhine Life Sciences
  const companies = await prisma.company.findMany({
    where: {
      slug: { in: ["lakshmi-pharma", "kothittil-pharma"] },
    },
  });

  const rhineProducts = await prisma.product.findMany({
    where: { manufacturerId: rhineMfg.id },
  });

  console.log(`\n--- Linking ${rhineProducts.length} Rhine products to distribution firms ---`);

  for (const comp of companies) {
    // Link manufacturer to company
    await prisma.companyManufacturer.upsert({
      where: {
        companyId_manufacturerId: {
          companyId: comp.id,
          manufacturerId: rhineMfg.id,
        },
      },
      update: { isAuthorized: true },
      create: {
        companyId: comp.id,
        manufacturerId: rhineMfg.id,
        isAuthorized: true,
        partnershipDetails: "Authorized Regional Stockist & Wholesale Partner (Rhine Life Sciences)",
      },
    });

    // Link products to company
    const codePrefix = comp.slug === "lakshmi-pharma" ? "LK" : "KT";
    for (const prod of rhineProducts) {
      const itemCode = `${codePrefix}-RHN-${prod.name.replace(/[^\w]/g, "").toUpperCase().substring(0, 8)}`;
      await prisma.companyProduct.upsert({
        where: {
          companyId_productId: {
            companyId: comp.id,
            productId: prod.id,
          },
        },
        update: {
          isPublished: true,
        },
        create: {
          companyId: comp.id,
          productId: prod.id,
          isPublished: true,
          isFeatured: false,
          itemCode,
        },
      });
    }

    console.log(`✓ ${comp.name}: Authorized for ${rhineMfg.name} with ${rhineProducts.length} published products.`);
  }

  // 6. Verify final counts
  const finalMfgs = await prisma.manufacturer.findMany({ select: { name: true, slug: true } });
  const finalProdsCount = await prisma.product.count();
  const finalCompStats = await prisma.company.findMany({
    select: {
      name: true,
      _count: { select: { companyProducts: true, companyManufacturers: true } },
    },
  });

  console.log("\n====================================================");
  console.log("  Database Cleanup Complete!");
  console.log(`  - Remaining Manufacturers: ${finalMfgs.map((m) => m.name).join(", ")}`);
  console.log(`  - Total Products: ${finalProdsCount}`);
  for (const s of finalCompStats) {
    console.log(`  - ${s.name}: ${s._count.companyProducts} products across ${s._count.companyManufacturers} brands`);
  }
  console.log("====================================================\n");
}

main()
  .catch((e) => {
    console.error("Fatal error during cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

