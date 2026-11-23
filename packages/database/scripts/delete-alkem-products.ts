import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteAlkemProducts() {
  console.log("==================================================================");
  console.log("  Deleting All Inserted Alkem Products & Clean Up ");
  console.log("==================================================================\n");

  // 1. Find Alkem manufacturer
  const alkem = await prisma.manufacturer.findFirst({
    where: {
      OR: [
        { slug: "alkem" },
        { name: { contains: "Alkem", mode: "insensitive" } },
      ],
    },
  });

  if (!alkem) {
    console.log("No Alkem manufacturer found in the database. Nothing to delete.");
    return;
  }

  console.log(`• Found Manufacturer: ${alkem.name} (ID: ${alkem.id}, Slug: ${alkem.slug})`);

  // 2. Find all products belonging to Alkem
  const alkemProducts = await prisma.product.findMany({
    where: { manufacturerId: alkem.id },
    select: { id: true, name: true, slug: true },
  });

  console.log(`• Found ${alkemProducts.length} Alkem products to delete.\n`);

  const productIds = alkemProducts.map((p) => p.id);

  if (productIds.length > 0) {
    // A. Detach inquiries referencing these products
    const detachedInquiries = await prisma.inquiry.updateMany({
      where: { productId: { in: productIds } },
      data: { productId: null },
    });
    console.log(`  ✓ Detached ${detachedInquiries.count} inquiries referencing Alkem products`);

    // B. Delete CompanyProduct listings
    const deletedCp = await prisma.companyProduct.deleteMany({
      where: { productId: { in: productIds } },
    });
    console.log(`  ✓ Deleted ${deletedCp.count} company-product catalog listings`);

    // C. Delete ProductIngredient links
    const deletedPi = await prisma.productIngredient.deleteMany({
      where: { productId: { in: productIds } },
    });
    console.log(`  ✓ Deleted ${deletedPi.count} product-ingredient links`);

    // D. Delete ProductCategory links
    const deletedPc = await prisma.productCategory.deleteMany({
      where: { productId: { in: productIds } },
    });
    console.log(`  ✓ Deleted ${deletedPc.count} product-category links`);

    // E. Delete Product records
    const deletedProducts = await prisma.product.deleteMany({
      where: { id: { in: productIds } },
    });
    console.log(`  ✓ Deleted ${deletedProducts.count} Alkem product records`);
  }

  // 3. Delete CompanyManufacturer links for Alkem
  const deletedCm = await prisma.companyManufacturer.deleteMany({
    where: { manufacturerId: alkem.id },
  });
  console.log(`  ✓ Deleted ${deletedCm.count} company-manufacturer authorizations for Alkem`);

  // 4. Delete Manufacturer record for Alkem
  await prisma.manufacturer.delete({
    where: { id: alkem.id },
  });
  console.log(`  ✓ Deleted manufacturer record '${alkem.name}'`);

  // 5. Clean up any orphaned ingredients with 0 remaining products
  console.log("\n--- Cleaning Orphaned Ingredients ---");
  const orphanedIngredients = await prisma.ingredient.findMany({
    where: {
      productIngredients: { none: {} },
    },
    select: { id: true, name: true },
  });

  if (orphanedIngredients.length > 0) {
    const orphanIds = orphanedIngredients.map((i) => i.id);
    const deletedAliases = await prisma.ingredientAlias.deleteMany({
      where: { ingredientId: { in: orphanIds } },
    });
    console.log(`  ✓ Deleted ${deletedAliases.count} aliases for orphaned ingredients`);

    const deletedIngs = await prisma.ingredient.deleteMany({
      where: { id: { in: orphanIds } },
    });
    console.log(`  ✓ Deleted ${deletedIngs.count} orphaned ingredients`);
  } else {
    console.log(`  ✓ No orphaned ingredients found`);
  }

  // 6. Verification
  console.log("\n==================================================================");
  console.log("  Deletion & Verification Completed Successfully!");
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

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { companyProducts: true, companyManufacturers: true } },
    },
  });

  for (const c of companies) {
    console.log(
      `• ${c.name}: ${c._count.companyProducts} products, ${c._count.companyManufacturers} authorized manufacturers`
    );
  }
  console.log("==================================================================\n");
}

if (require.main === module) {
  deleteAlkemProducts()
    .catch((e) => {
      console.error("Fatal error during deletion:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
