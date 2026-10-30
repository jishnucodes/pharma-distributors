import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("--- Starting L & K Pharma Database Seeding ---");

  // 1. Create Companies
  const lakshmi = await prisma.company.upsert({
    where: { slug: "lakshmi-pharma" },
    update: {
      name: "Lakshmi Pharma",
      shortName: "Lakshmi",
      accentColor: "teal",
      tagline: "Authorized Ethical & Generics Pharmaceutical Distribution",
      description:
        "Founded in 1998, Lakshmi Pharma is an authorized distributor of pharmaceutical formulations, essential generics, and hospital supplies serving over 1,400 retail pharmacies, nursing homes, and clinics across South India. With temperature-controlled warehousing and strict batch tracking, we ensure uninterrupted drug supply lines.",
      serviceAreas: "Kerala (Ernakulam, Thrissur, Palakkad, Kozhikode, Malappuram), Tamil Nadu (Coimbatore District)",
      address: "Door No. 42/1892, Pharma Trade Complex, Market Road, Ernakulam, Kochi, Kerala - 682035",
      phone: "+91 484 235 6789",
      email: "orders@lakshmipharma.demo",
      whatsapp: "+91 94471 23456",
      mapUrl: "https://maps.google.com/?q=Kochi+Kerala",
      businessHours: "Monday to Saturday: 8:30 AM - 7:30 PM (Sunday Closed)",
      drugLicenseNo: "KL-EKM-2024-DL-10928A / 10928B (DEMO DATA)",
      gstin: "32AAAAA0000A1Z5 (DEMO DATA)",
      isActive: true,
    },
    create: {
      name: "Lakshmi Pharma",
      slug: "lakshmi-pharma",
      shortName: "Lakshmi",
      accentColor: "teal",
      tagline: "Authorized Ethical & Generics Pharmaceutical Distribution",
      description:
        "Founded in 1998, Lakshmi Pharma is an authorized distributor of pharmaceutical formulations, essential generics, and hospital supplies serving over 1,400 retail pharmacies, nursing homes, and clinics across South India. With temperature-controlled warehousing and strict batch tracking, we ensure uninterrupted drug supply lines.",
      serviceAreas: "Kerala (Ernakulam, Thrissur, Palakkad, Kozhikode, Malappuram), Tamil Nadu (Coimbatore District)",
      address: "Door No. 42/1892, Pharma Trade Complex, Market Road, Ernakulam, Kochi, Kerala - 682035",
      phone: "+91 484 235 6789",
      email: "orders@lakshmipharma.demo",
      whatsapp: "+91 94471 23456",
      mapUrl: "https://maps.google.com/?q=Kochi+Kerala",
      businessHours: "Monday to Saturday: 8:30 AM - 7:30 PM (Sunday Closed)",
      drugLicenseNo: "KL-EKM-2024-DL-10928A / 10928B (DEMO DATA)",
      gstin: "32AAAAA0000A1Z5 (DEMO DATA)",
      isActive: true,
    },
  });

  // Migrate legacy slug and admin email if existing
  await prisma.company.updateMany({
    where: { slug: "kothittil-pharma" },
    data: {
      slug: "kothottil-pharma",
      name: "The Kothottil Pharmaceutical Distributor",
      shortName: "Kothottil",
      email: "supply@kothottilpharma.demo",
    },
  });
  await prisma.user.updateMany({
    where: { email: "admin@kothittilpharma.demo" },
    data: {
      email: "admin@kothottilpharma.demo",
      name: "Kothottil Institutional Lead",
    },
  });

  const kothottil = await prisma.company.upsert({
    where: { slug: "kothottil-pharma" },
    update: {
      name: "The Kothottil Pharmaceutical Distributor",
      shortName: "Kothottil",
      accentColor: "blue",
      tagline: "Specialty Therapeutics, Critical Care & Institutional Supply",
      description:
        "Established in 2005, The Kothottil Pharmaceutical Distributor specializes in cold-chain logistics, cardiology, diabetology, and oncology institutional supply chains. We partner directly with leading research manufacturers to provide verified batch compliance and zero-delay distribution across premier hospitals.",
      serviceAreas: "Kerala (Thiruvananthapuram, Kollam, Alappuzha, Kottayam, Pathanamthitta), Karnataka (Bengaluru Urban)",
      address: "Plot 14B, Healthcare Logistics Hub, NH 66 Bypass, Kazhakkoottam, Thiruvananthapuram, Kerala - 695024",
      phone: "+91 471 245 8890",
      email: "supply@kothottilpharma.demo",
      whatsapp: "+91 98460 78901",
      mapUrl: "https://maps.google.com/?q=Thiruvananthapuram+Kerala",
      businessHours: "Monday to Saturday: 8:00 AM - 8:00 PM (24x7 Critical Care Emergency Support)",
      drugLicenseNo: "KL-TVM-2023-DL-88412A / 88412B (DEMO DATA)",
      gstin: "32BBBBB1111B1Z2 (DEMO DATA)",
      isActive: true,
    },
    create: {
      name: "The Kothottil Pharmaceutical Distributor",
      slug: "kothottil-pharma",
      shortName: "Kothottil",
      accentColor: "blue",
      tagline: "Specialty Therapeutics, Critical Care & Institutional Supply",
      description:
        "Established in 2005, The Kothottil Pharmaceutical Distributor specializes in cold-chain logistics, cardiology, diabetology, and oncology institutional supply chains. We partner directly with leading research manufacturers to provide verified batch compliance and zero-delay distribution across premier hospitals.",
      serviceAreas: "Kerala (Thiruvananthapuram, Kollam, Alappuzha, Kottayam, Pathanamthitta), Karnataka (Bengaluru Urban)",
      address: "Plot 14B, Healthcare Logistics Hub, NH 66 Bypass, Kazhakkoottam, Thiruvananthapuram, Kerala - 695024",
      phone: "+91 471 245 8890",
      email: "supply@kothottilpharma.demo",
      whatsapp: "+91 98460 78901",
      mapUrl: "https://maps.google.com/?q=Thiruvananthapuram+Kerala",
      businessHours: "Monday to Saturday: 8:00 AM - 8:00 PM (24x7 Critical Care Emergency Support)",
      drugLicenseNo: "KL-TVM-2023-DL-88412A / 88412B (DEMO DATA)",
      gstin: "32BBBBB1111B1Z2 (DEMO DATA)",
      isActive: true,
    },
  });

  console.log(`✓ Seeded companies: ${lakshmi.name} & ${kothottil.name}`);

  // 2. Seed Manufacturers (Only authorized logos / clean text fallbacks)
  const manufacturersData = [
    { name: "Cipla", slug: "cipla", website: "https://www.cipla.com", logoUrl: "/logos/cipla.svg" },
    { name: "Micro Labs", slug: "micro-labs", website: "https://www.microlabsltd.com", logoUrl: "/logos/microlabs.svg" },
    { name: "Rhine Biopharm", slug: "rhine-biopharm", website: "https://www.rhinebiopharm.com", logoUrl: "/logos/rhine.svg" },
    { name: "Sun Pharma", slug: "sun-pharma", website: "https://www.sunpharma.com", logoUrl: "/logos/sunpharma.svg" },
    { name: "GlaxoSmithKline", slug: "gsk", website: "https://india-pharma.gsk.com", logoUrl: "/logos/gsk.svg" },
    { name: "Torrent Pharmaceuticals", slug: "torrent-pharma", website: "https://www.torrentpharma.com", logoUrl: null },
    { name: "Alkem Laboratories", slug: "alkem-labs", website: "https://www.alkemlabs.com", logoUrl: null },
  ];

  const manufacturers: Record<string, any> = {};
  for (const m of manufacturersData) {
    manufacturers[m.slug] = await prisma.manufacturer.upsert({
      where: { slug: m.slug },
      update: { name: m.name, website: m.website, logoUrl: m.logoUrl },
      create: { name: m.name, slug: m.slug, website: m.website, logoUrl: m.logoUrl, isDemo: true },
    });
  }
  console.log(`✓ Seeded ${Object.keys(manufacturers).length} manufacturers`);

  // 3. Associate Manufacturers with Companies
  // Lakshmi distributes: Cipla, Micro Labs, Rhine, GSK, Sun Pharma
  const lakshmiMfgSlugs = ["cipla", "micro-labs", "rhine-biopharm", "gsk", "sun-pharma"];
  for (const slug of lakshmiMfgSlugs) {
    await prisma.companyManufacturer.upsert({
      where: {
        companyId_manufacturerId: {
          companyId: lakshmi.id,
          manufacturerId: manufacturers[slug].id,
        },
      },
      update: { isAuthorized: true },
      create: {
        companyId: lakshmi.id,
        manufacturerId: manufacturers[slug].id,
        isAuthorized: true,
        partnershipDetails: "Primary regional wholesale distributor",
      },
    });
  }

  // Kothottil distributes: Micro Labs, Sun Pharma, Torrent, Alkem, Cipla
  const kothottilMfgSlugs = ["micro-labs", "sun-pharma", "torrent-pharma", "alkem-labs", "cipla"];
  for (const slug of kothottilMfgSlugs) {
    await prisma.companyManufacturer.upsert({
      where: {
        companyId_manufacturerId: {
          companyId: kothottil.id,
          manufacturerId: manufacturers[slug].id,
        },
      },
      update: { isAuthorized: true },
      create: {
        companyId: kothottil.id,
        manufacturerId: manufacturers[slug].id,
        isAuthorized: true,
        partnershipDetails: "Direct institutional & specialty supply partner",
      },
    });
  }
  console.log("✓ Seeded company-manufacturer associations");

  // 4. Seed Canonical Ingredients & Aliases
  const ingredientsData = [
    {
      name: "Paracetamol",
      slug: "paracetamol",
      description: "Analgesic and antipyretic agent used for treating mild to moderate pain and reducing fever.",
      aliases: ["Acetaminophen", "APAP", "Paracetamolum", "N-acetyl-p-aminophenol"],
    },
    {
      name: "Amoxicillin",
      slug: "amoxicillin",
      description: "Moderate-spectrum, bacteriolytic, beta-lactam antibiotic used to treat bacterial infections.",
      aliases: ["Amoxycillin", "Amoxicillin Trihydrate"],
    },
    {
      name: "Clavulanic Acid",
      slug: "clavulanic-acid",
      description: "Beta-lactamase inhibitor combined with penicillins to overcome antibiotic resistance.",
      aliases: ["Clavulanate Potassium", "Potassium Clavulanate"],
    },
    {
      name: "Ciprofloxacin",
      slug: "ciprofloxacin",
      description: "Fluoroquinolone antibiotic used to treat a number of bacterial infections.",
      aliases: ["Cipro", "Ciprofloxacin Hydrochloride"],
    },
    {
      name: "Pantoprazole",
      slug: "pantoprazole",
      description: "Proton pump inhibitor that decreases the amount of acid produced in the stomach.",
      aliases: ["Pantoprazole Sodium", "Pantoprazole Sodium Sesquihydrate"],
    },
    {
      name: "Metformin",
      slug: "metformin",
      description: "First-line medication for the treatment of type 2 diabetes.",
      aliases: ["Metformin Hydrochloride", "Glucophage"],
    },
    {
      name: "Cetirizine",
      slug: "cetirizine",
      description: "Second-generation antihistamine used in the treatment of allergic rhinitis and urticaria.",
      aliases: ["Cetirizine Dihydrochloride", "Cetirizine HCl"],
    },
    {
      name: "Azithromycin",
      slug: "azithromycin",
      description: "Macrolide antibiotic used for the treatment of various bacterial infections.",
      aliases: ["Azithromycin Dihydrate", "Zithromax"],
    },
    {
      name: "Phenylephrine",
      slug: "phenylephrine",
      description: "Decongestant used to relieve nasal discomfort caused by colds, allergies, and hay fever.",
      aliases: ["Phenylephrine Hydrochloride", "Phenylephrine HCl"],
    },
    {
      name: "Chlorpheniramine",
      slug: "chlorpheniramine",
      description: "Antihistamine used to treat symptoms of allergies such as runny nose and sneezing.",
      aliases: ["CPM", "Chlorpheniramine Maleate"],
    },
  ];

  const ingredients: Record<string, any> = {};
  for (const ing of ingredientsData) {
    const createdIng = await prisma.ingredient.upsert({
      where: { slug: ing.slug },
      update: { name: ing.name, description: ing.description },
      create: { name: ing.name, slug: ing.slug, description: ing.description },
    });
    ingredients[ing.slug] = createdIng;

    for (const alias of ing.aliases) {
      await prisma.ingredientAlias.upsert({
        where: {
          ingredientId_aliasName: {
            ingredientId: createdIng.id,
            aliasName: alias,
          },
        },
        update: {},
        create: {
          ingredientId: createdIng.id,
          aliasName: alias,
        },
      });
    }
  }
  console.log(`✓ Seeded ${Object.keys(ingredients).length} ingredients with aliases`);

  // 5. Seed Categories
  const categoriesData = [
    { name: "Analgesics & Antipyretics", slug: "analgesics-antipyretics" },
    { name: "Antibiotics & Anti-infectives", slug: "antibiotics" },
    { name: "Gastrointestinal & PPI", slug: "gastrointestinal" },
    { name: "Anti-diabetic", slug: "anti-diabetic" },
    { name: "Respiratory & Antihistamines", slug: "respiratory-antihistamines" },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
  }

  // 6. Seed Structured Products (ABSOLUTELY NO PRODUCT IMAGES)
  // Acceptance Fixture Products:
  // - Dolo 650: Micro Labs, Paracetamol 650mg, Tablet
  // - Calpol 650: GSK, Paracetamol 650mg, Tablet
  const productsData = [
    {
      name: "Dolo 650",
      slug: "dolo-650",
      manufacturerSlug: "micro-labs",
      dosageForm: "Tablet",
      packaging: "15 Tablets / Strip (Blister Pack)",
      description: "Paracetamol 650 mg tablet formulated for antipyretic and analgesic action against high fever, headache, body ache, and mild-to-moderate arthritic pain.",
      storageConditions: "Store protected from light and moisture at a temperature not exceeding 30°C.",
      schedule: "Over The Counter / General Sale",
      categorySlug: "analgesics-antipyretics",
      ingredients: [
        { ingredientSlug: "paracetamol", quantity: 650, unit: "mg", perBasis: "per tablet", isPrimary: true },
      ],
      companies: [
        { companyId: lakshmi.id, isFeatured: true, itemCode: "LK-MIC-DOLO650" },
        { companyId: kothottil.id, isFeatured: false, itemCode: "KT-MIC-DOLO650" },
      ],
    },
    {
      name: "Calpol 650",
      slug: "calpol-650",
      manufacturerSlug: "gsk",
      dosageForm: "Tablet",
      packaging: "15 Tablets / Strip (Blister Pack)",
      description: "Fast-acting Paracetamol 650 mg tablet providing dependable relief from post-immunization fever, viral fevers, toothache, and musculoskeletal discomfort.",
      storageConditions: "Store below 30°C. Protect from moisture.",
      schedule: "Over The Counter / General Sale",
      categorySlug: "analgesics-antipyretics",
      ingredients: [
        { ingredientSlug: "paracetamol", quantity: 650, unit: "mg", perBasis: "per tablet", isPrimary: true },
      ],
      // ONLY listed in Lakshmi Pharma catalog to verify catalog isolation!
      companies: [
        { companyId: lakshmi.id, isFeatured: true, itemCode: "LK-GSK-CALPOL650" },
      ],
    },
    {
      name: "Calpol 500",
      slug: "calpol-500",
      manufacturerSlug: "gsk",
      dosageForm: "Tablet",
      packaging: "15 Tablets / Strip",
      description: "Paracetamol 500 mg standard dosage tablet for fever and body ache management.",
      storageConditions: "Store below 30°C in a dry place.",
      schedule: "Over The Counter",
      categorySlug: "analgesics-antipyretics",
      ingredients: [
        { ingredientSlug: "paracetamol", quantity: 500, unit: "mg", perBasis: "per tablet", isPrimary: true },
      ],
      companies: [
        { companyId: lakshmi.id, isFeatured: false, itemCode: "LK-GSK-CALPOL500" },
      ],
    },
    {
      name: "Augmentin 625 Duo",
      slug: "augmentin-625-duo",
      manufacturerSlug: "gsk",
      dosageForm: "Tablet",
      packaging: "10 Tablets / Strip (Alu-Alu)",
      description: "Potentiated broad-spectrum penicillin antibiotic combining Amoxicillin with Clavulanate Potassium for combating beta-lactamase producing organisms.",
      storageConditions: "Store protected from moisture at a temperature not exceeding 25°C.",
      schedule: "Schedule H1 Prescription Drug",
      categorySlug: "antibiotics",
      ingredients: [
        { ingredientSlug: "amoxicillin", quantity: 500, unit: "mg", perBasis: "per tablet", isPrimary: true },
        { ingredientSlug: "clavulanic-acid", quantity: 125, unit: "mg", perBasis: "per tablet", isPrimary: false },
      ],
      companies: [
        { companyId: lakshmi.id, isFeatured: true, itemCode: "LK-GSK-AUG625" },
      ],
    },
    {
      name: "Moxikind-CV 625",
      slug: "moxikind-cv-625",
      manufacturerSlug: "micro-labs",
      dosageForm: "Tablet",
      packaging: "10 Tablets / Strip (Alu-Alu)",
      description: "Amoxicillin and Potassium Clavulanate tablet formulation for respiratory, urinary tract, and soft tissue bacterial infections.",
      storageConditions: "Store below 25°C in a dry place.",
      schedule: "Schedule H1 Prescription Drug",
      categorySlug: "antibiotics",
      ingredients: [
        { ingredientSlug: "amoxicillin", quantity: 500, unit: "mg", perBasis: "per tablet", isPrimary: true },
        { ingredientSlug: "clavulanic-acid", quantity: 125, unit: "mg", perBasis: "per tablet", isPrimary: false },
      ],
      companies: [
        { companyId: kothottil.id, isFeatured: true, itemCode: "KT-MIC-MOX625" },
      ],
    },
    {
      name: "Ciplox 500",
      slug: "ciplox-500",
      manufacturerSlug: "cipla",
      dosageForm: "Tablet",
      packaging: "10 Tablets / Strip (Blister)",
      description: "Ciprofloxacin 500 mg synthetic broad-spectrum antibacterial agent of the fluoroquinolone class.",
      storageConditions: "Store protected from light and moisture below 30°C.",
      schedule: "Schedule H1 Prescription Drug",
      categorySlug: "antibiotics",
      ingredients: [
        { ingredientSlug: "ciprofloxacin", quantity: 500, unit: "mg", perBasis: "per tablet", isPrimary: true },
      ],
      companies: [
        { companyId: lakshmi.id, isFeatured: false, itemCode: "LK-CIP-CIP500" },
        { companyId: kothottil.id, isFeatured: false, itemCode: "KT-CIP-CIP500" },
      ],
    },
    {
      name: "Pantocid 40",
      slug: "pantocid-40",
      manufacturerSlug: "sun-pharma",
      dosageForm: "Tablet",
      packaging: "15 Tablets / Strip (Alu-Alu)",
      description: "Pantoprazole gastro-resistant 40 mg tablet for the treatment of gastroesophageal reflux disease (GERD) and peptic ulcer disorders.",
      storageConditions: "Store below 25°C. Protect from moisture and light.",
      schedule: "Schedule H Prescription Drug",
      categorySlug: "gastrointestinal",
      ingredients: [
        { ingredientSlug: "pantoprazole", quantity: 40, unit: "mg", perBasis: "per tablet", isPrimary: true },
      ],
      companies: [
        { companyId: lakshmi.id, isFeatured: false, itemCode: "LK-SUN-PAN40" },
        { companyId: kothottil.id, isFeatured: true, itemCode: "KT-SUN-PAN40" },
      ],
    },
    {
      name: "Rhinex Cold",
      slug: "rhinex-cold",
      manufacturerSlug: "rhine-biopharm",
      dosageForm: "Tablet",
      packaging: "10 Tablets / Strip",
      description: "Triple-action anti-cold formulation combining analgesic Paracetamol with decongestant Phenylephrine and antihistaminic Chlorpheniramine.",
      storageConditions: "Store in a cool and dry place.",
      schedule: "Schedule H Prescription Drug",
      categorySlug: "respiratory-antihistamines",
      ingredients: [
        { ingredientSlug: "paracetamol", quantity: 500, unit: "mg", perBasis: "per tablet", isPrimary: true },
        { ingredientSlug: "phenylephrine", quantity: 5, unit: "mg", perBasis: "per tablet", isPrimary: false },
        { ingredientSlug: "chlorpheniramine", quantity: 2, unit: "mg", perBasis: "per tablet", isPrimary: false },
      ],
      companies: [
        { companyId: lakshmi.id, isFeatured: true, itemCode: "LK-RHN-COLD" },
      ],
    },
    {
      name: "Cetcip 10",
      slug: "cetcip-10",
      manufacturerSlug: "cipla",
      dosageForm: "Tablet",
      packaging: "10 Tablets / Strip",
      description: "Cetirizine 10 mg film-coated tablet for rapid relief of allergic symptoms including sneezing, itching, watery eyes, and runny nose.",
      storageConditions: "Store protected from moisture below 30°C.",
      schedule: "Schedule H Prescription Drug",
      categorySlug: "respiratory-antihistamines",
      ingredients: [
        { ingredientSlug: "cetirizine", quantity: 10, unit: "mg", perBasis: "per tablet", isPrimary: true },
      ],
      companies: [
        { companyId: lakshmi.id, isFeatured: false, itemCode: "LK-CIP-CETC10" },
      ],
    },
    {
      name: "Glycomet 500 SR",
      slug: "glycomet-500-sr",
      manufacturerSlug: "torrent-pharma",
      dosageForm: "Sustained Release Tablet",
      packaging: "20 Tablets / Strip",
      description: "Metformin Hydrochloride 500 mg sustained release formulation providing controlled glycemic regulation for adult type 2 diabetes mellitus.",
      storageConditions: "Store protected from light and moisture.",
      schedule: "Schedule H Prescription Drug",
      categorySlug: "anti-diabetic",
      ingredients: [
        { ingredientSlug: "metformin", quantity: 500, unit: "mg", perBasis: "per tablet", isPrimary: true },
      ],
      // Exclusively in Kothottil catalog!
      companies: [
        { companyId: kothottil.id, isFeatured: true, itemCode: "KT-TOR-GLY500" },
      ],
    },
    {
      name: "Azee 500",
      slug: "azee-500",
      manufacturerSlug: "cipla",
      dosageForm: "Tablet",
      packaging: "5 Tablets / Strip",
      description: "Azithromycin 500 mg macrolide antibiotic indicated for acute bacterial sinusitis, community-acquired pneumonia, and skin structure infections.",
      storageConditions: "Store below 30°C. Protect from moisture.",
      schedule: "Schedule H1 Prescription Drug",
      categorySlug: "antibiotics",
      ingredients: [
        { ingredientSlug: "azithromycin", quantity: 500, unit: "mg", perBasis: "per tablet", isPrimary: true },
      ],
      companies: [
        { companyId: kothottil.id, isFeatured: false, itemCode: "KT-CIP-AZEE500" },
      ],
    },
  ];

  for (const prodData of productsData) {
    const product = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: {
        name: prodData.name,
        manufacturerId: manufacturers[prodData.manufacturerSlug].id,
        dosageForm: prodData.dosageForm,
        packaging: prodData.packaging,
        description: prodData.description,
        storageConditions: prodData.storageConditions,
        schedule: prodData.schedule,
      },
      create: {
        name: prodData.name,
        slug: prodData.slug,
        manufacturerId: manufacturers[prodData.manufacturerSlug].id,
        dosageForm: prodData.dosageForm,
        packaging: prodData.packaging,
        description: prodData.description,
        storageConditions: prodData.storageConditions,
        schedule: prodData.schedule,
        isDemo: true,
      },
    });

    // Link category
    await prisma.productCategory.upsert({
      where: {
        productId_categoryId: {
          productId: product.id,
          categoryId: categories[prodData.categorySlug].id,
        },
      },
      update: {},
      create: {
        productId: product.id,
        categoryId: categories[prodData.categorySlug].id,
      },
    });

    // Link ingredients
    for (const ing of prodData.ingredients) {
      await prisma.productIngredient.upsert({
        where: {
          productId_ingredientId: {
            productId: product.id,
            ingredientId: ingredients[ing.ingredientSlug].id,
          },
        },
        update: {
          quantity: ing.quantity,
          unit: ing.unit,
          perBasis: ing.perBasis,
          isPrimary: ing.isPrimary,
        },
        create: {
          productId: product.id,
          ingredientId: ingredients[ing.ingredientSlug].id,
          quantity: ing.quantity,
          unit: ing.unit,
          perBasis: ing.perBasis,
          isPrimary: ing.isPrimary,
        },
      });
    }

    // Link company listings
    for (const cp of prodData.companies) {
      await prisma.companyProduct.upsert({
        where: {
          companyId_productId: {
            companyId: cp.companyId,
            productId: product.id,
          },
        },
        update: {
          isPublished: true,
          isFeatured: cp.isFeatured,
          itemCode: cp.itemCode,
        },
        create: {
          companyId: cp.companyId,
          productId: product.id,
          isPublished: true,
          isFeatured: cp.isFeatured,
          itemCode: cp.itemCode,
        },
      });
    }
  }
  console.log(`✓ Seeded ${productsData.length} structured products across companies`);

  // 7. Seed Admin Users & Company Memberships
  const salt = await bcrypt.genSalt(10);
  const superAdminHash = await bcrypt.hash("SuperAdmin@2026", salt);
  const lakshmiAdminHash = await bcrypt.hash("Lakshmi@2026", salt);
  const kothottilAdminHash = await bcrypt.hash("Kothottil@2026", salt);

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

  const kothottilAdmin = await prisma.user.upsert({
    where: { email: "admin@kothottilpharma.demo" },
    update: { passwordHash: kothottilAdminHash, role: "COMPANY_ADMIN" },
    create: {
      email: "admin@kothottilpharma.demo",
      passwordHash: kothottilAdminHash,
      name: "Kothottil Institutional Lead",
      role: "COMPANY_ADMIN",
    },
  });

  await prisma.companyMembership.upsert({
    where: {
      userId_companyId: {
        userId: kothottilAdmin.id,
        companyId: kothottil.id,
      },
    },
    update: {},
    create: {
      userId: kothottilAdmin.id,
      companyId: kothottil.id,
    },
  });

  console.log("✓ Seeded admin accounts: SuperAdmin, LakshmiAdmin, KothottilAdmin");

  // 8. Seed Sample Inquiries
  const doloProduct = await prisma.product.findUnique({ where: { slug: "dolo-650" } });
  const augProduct = await prisma.product.findUnique({ where: { slug: "augmentin-625-duo" } });
  const glycometProduct = await prisma.product.findUnique({ where: { slug: "glycomet-500-sr" } });

  await prisma.inquiry.createMany({
    data: [
      {
        companyId: lakshmi.id,
        productId: doloProduct?.id,
        name: "Dr. Rajesh Nair",
        businessName: "City Medicos Retail Pharmacy",
        email: "rajesh@citymedicos.demo",
        phone: "+91 98470 11223",
        message: "Requirement for 50 boxes of Dolo 650 strips for month-end pharmacy stock replenishment. Please share current distributor trade discount terms.",
        status: "PENDING",
      },
      {
        companyId: lakshmi.id,
        productId: augProduct?.id,
        name: "Ms. Anita George",
        businessName: "Kochi Community Health Center",
        email: "purchase@kochichc.demo",
        phone: "+91 94460 33445",
        message: "Seeking verified batch availability for Augmentin 625 Duo (30 strips) with minimum 18-month shelf expiry.",
        status: "IN_REVIEW",
        adminNotes: "Stock verified at Palarivattom warehouse. Response email sent.",
      },
      {
        companyId: kothottil.id,
        productId: glycometProduct?.id,
        name: "Mr. Suresh Varma",
        businessName: "Trivandrum Specialty Hospital Supplies",
        email: "procurement@tvmcare.demo",
        phone: "+91 97455 66778",
        message: "Urgent quote requested for Glycomet 500 SR institutional supply (100 boxes).",
        status: "RESPONDED",
        adminNotes: "Quote dispatched via official PDF format.",
      },
    ],
  });

  console.log("✓ Seeded sample inquiries");
  console.log("--- Seeding Completed Successfully ---");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
