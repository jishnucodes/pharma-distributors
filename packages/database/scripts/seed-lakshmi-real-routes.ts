import { prisma } from "../src";

async function main() {
  console.log("Updating real route data for Lakshmi Pharma...");

  const lakshmi = await prisma.company.findFirst({
    where: { slug: "lakshmi-pharma" },
  });

  if (!lakshmi) {
    console.error("Lakshmi Pharma not found in DB!");
    process.exit(1);
  }

  // Delete previous demo routes for Lakshmi Pharma
  const deleted = await prisma.companyRoute.deleteMany({
    where: { companyId: lakshmi.id },
  });
  console.log(`Deleted ${deleted.count} previous demo routes for Lakshmi Pharma.`);

  // Insert real sales executives provided by the user
  const realRoutes = [
    {
      companyId: lakshmi.id,
      personName: "Firosh",
      designation: "Sales Executive",
      phone: "7556466540",
      email: null,
      routeAreas: "Guruvayoor -> Ollur -> Irinjalakuda -> Mannuthy",
      schedule: "Regular Sales & Delivery Beat",
      mapUrl: null,
      notes: null,
      orderIndex: 1,
      isActive: true,
    },
    {
      companyId: lakshmi.id,
      personName: "Anand",
      designation: "Sales Executive",
      phone: "9847123456",
      email: null,
      routeAreas: "Kozhikode -> Feroke -> Ramanattukara -> Kondotty",
      schedule: "Regular Sales & Delivery Beat",
      mapUrl: null,
      notes: null,
      orderIndex: 2,
      isActive: true,
    },
    {
      companyId: lakshmi.id,
      personName: "Meera",
      designation: "Sales Executive",
      phone: "9446987654",
      email: null,
      routeAreas: "Kochi -> Aluva -> Angamaly -> Chalakudy",
      schedule: "Regular Sales & Delivery Beat",
      mapUrl: null,
      notes: null,
      orderIndex: 3,
      isActive: true,
    },
    {
      companyId: lakshmi.id,
      personName: "Shameer",
      designation: "Sales Executive",
      phone: "8086554321",
      email: null,
      routeAreas: "Malappuram -> Manjeri -> Perinthalmanna -> Tirur",
      schedule: "Regular Sales & Delivery Beat",
      mapUrl: null,
      notes: null,
      orderIndex: 4,
      isActive: true,
    },
    {
      companyId: lakshmi.id,
      personName: "Deepak",
      designation: "Sales Executive",
      phone: "9745112233",
      email: null,
      routeAreas: "Palakkad -> Ottapalam -> Shoranur -> Pattambi",
      schedule: "Regular Sales & Delivery Beat",
      mapUrl: null,
      notes: null,
      orderIndex: 5,
      isActive: true,
    },
  ];

  await prisma.companyRoute.createMany({
    data: realRoutes,
  });

  const currentRoutes = await prisma.companyRoute.findMany({
    where: { companyId: lakshmi.id },
    orderBy: { orderIndex: "asc" },
  });

  console.log(`Successfully added ${currentRoutes.length} real sales executives for Lakshmi Pharma:`);
  currentRoutes.forEach((r) => {
    console.log(`  [${r.orderIndex}] ${r.personName} (${r.phone}): ${r.routeAreas}`);
  });
}

main()
  .catch((e) => {
    console.error("Error inserting real routes:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
