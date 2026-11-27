import { prisma } from "../src";

async function main() {
  console.log("Seeding Field Sales Representative & Delivery Beat Routes...");

  const lakshmi = await prisma.company.findFirst({
    where: { slug: "lakshmi-pharma" },
  });
  const kothottil = await prisma.company.findFirst({
    where: { slug: { in: ["kothottil-pharma", "kothittil-pharma"] } },
  });

  if (!lakshmi || !kothottil) {
    console.error("Distributor companies not found in DB!");
    return;
  }

  // Clear existing routes for idempotent seeding
  await prisma.companyRoute.deleteMany({
    where: {
      companyId: { in: [lakshmi.id, kothottil.id] },
    },
  });

  // Lakshmi Pharma Routes
  const lakshmiRoutes = [
    {
      companyId: lakshmi.id,
      personName: "Rajesh K.",
      designation: "Senior Field Sales Officer",
      phone: "+91 98471 23456",
      email: "rajesh.sales@lakshmipharma.demo",
      routeAreas: "Ernakulam City, MG Road, Marine Drive, Ravipuram, Panampilly Nagar, Kadavanthra Clinics",
      schedule: "Daily (Monday to Saturday) - Morning Beat 9:30 AM to 1:30 PM",
      mapUrl: "https://maps.google.com/?q=Ernakulam+Kerala",
      notes: "Express delivery cutoff 2:00 PM for same-day evening dispensary supply",
      orderIndex: 1,
      isActive: true,
    },
    {
      companyId: lakshmi.id,
      personName: "Arun Thomas",
      designation: "Area Medical Representative",
      phone: "+91 98472 34567",
      email: "arun.mr@lakshmipharma.demo",
      routeAreas: "Aluva, Angamaly, Nedumbassery, Kalamassery Medical City & Apollo Adlux Belt",
      schedule: "Monday, Wednesday, Friday (10:00 AM - 5:30 PM)",
      mapUrl: "https://maps.google.com/?q=Aluva+Kerala",
      notes: "Direct delivery van departs 11:00 AM from Kalamassery junction",
      orderIndex: 2,
      isActive: true,
    },
    {
      companyId: lakshmi.id,
      personName: "Dileep Varma",
      designation: "Delivery Logistics Associate",
      phone: "+91 98473 45678",
      email: "logistics@lakshmipharma.demo",
      routeAreas: "Tripunithura, Maradu, Thoppumpady, Fort Kochi & West Kochi Retail Chemists",
      schedule: "Tuesday, Thursday, Saturday (10:00 AM - 4:00 PM)",
      mapUrl: "https://maps.google.com/?q=Tripunithura+Kerala",
      notes: "Refrigerated cold-chain insulin & vaccines delivery route",
      orderIndex: 3,
      isActive: true,
    },
    {
      companyId: lakshmi.id,
      personName: "Manoj Kumar",
      designation: "Institutional Sales Lead",
      phone: "+91 98474 56789",
      email: "manoj.inst@lakshmipharma.demo",
      routeAreas: "Kakkanad InfoPark, Edappally, Aster Medcity & Amrita Institute Hospitals",
      schedule: "Monday to Friday (9:00 AM - 6:00 PM)",
      mapUrl: "https://maps.google.com/?q=Kakkanad+Kerala",
      notes: "Bulk hospital orders, critical care and oncology institutional inquiries",
      orderIndex: 4,
      isActive: true,
    },
  ];

  // The Kothottil Pharma Routes
  const kothottilRoutes = [
    {
      companyId: kothottil.id,
      personName: "Shabeer Rahman",
      designation: "Territory Sales Officer",
      phone: "+91 98461 11223",
      email: "shabeer.sales@kothottil.demo",
      routeAreas: "Kozhikode City, SM Street, Mavoor Road, Baby Memorial Hospital Area & Calicut Medical College",
      schedule: "Daily (Monday to Saturday) - 9:00 AM to 5:00 PM",
      mapUrl: "https://maps.google.com/?q=Kozhikode+Kerala",
      notes: "Emergency clinic dispatches twice daily (11:30 AM and 4:30 PM)",
      orderIndex: 1,
      isActive: true,
    },
    {
      companyId: kothottil.id,
      personName: "Pradeep Nambiar",
      designation: "Area Medical Representative",
      phone: "+91 98462 22334",
      email: "pradeep.mr@kothottil.demo",
      routeAreas: "Vadakara, Koyilandy, Payyoli, Thalassery Coastal Chemist Beat",
      schedule: "Monday, Wednesday, Friday (9:30 AM - 5:30 PM)",
      mapUrl: "https://maps.google.com/?q=Vadakara+Kerala",
      notes: "NH 66 retail chemist beat plan; advance booking encouraged",
      orderIndex: 2,
      isActive: true,
    },
    {
      companyId: kothottil.id,
      personName: "Faisal K.",
      designation: "Malappuram & Tirur Beat Executive",
      phone: "+91 98463 33445",
      email: "faisal.beat@kothottil.demo",
      routeAreas: "Feroke, Ramanattukara, Kondotty, Manjeri & Malappuram Town",
      schedule: "Tuesday, Thursday, Saturday (10:00 AM - 5:00 PM)",
      mapUrl: "https://maps.google.com/?q=Malappuram+Kerala",
      notes: "Covering all government taluk hospital adjacent retail dispensaries",
      orderIndex: 3,
      isActive: true,
    },
    {
      companyId: kothottil.id,
      personName: "Santhosh Nair",
      designation: "High-Range & Wayanad Logistics Lead",
      phone: "+91 98464 44556",
      email: "wayanad.logistics@kothottil.demo",
      routeAreas: "Thamarassery, Kalpetta, Sulthan Bathery, Mananthavady Clinics",
      schedule: "Wednesday & Saturday (High-Range Mountain Beat)",
      mapUrl: "https://maps.google.com/?q=Kalpetta+Wayanad+Kerala",
      notes: "Temperature-controlled carrier for antibiotics, syrups & IV fluids",
      orderIndex: 4,
      isActive: true,
    },
  ];

  await prisma.companyRoute.createMany({
    data: [...lakshmiRoutes, ...kothottilRoutes],
  });

  const totalCount = await prisma.companyRoute.count();
  console.log(`Successfully seeded ${totalCount} field representative routes!`);
}

main()
  .catch((e) => {
    console.error("Error seeding routes:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
