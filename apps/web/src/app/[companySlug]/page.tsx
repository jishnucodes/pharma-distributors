import React from "react";
import { notFound } from "next/navigation";
import { fetchCompany, fetchCatalog } from "@/lib/api";
import { Product, Company } from "@/types";
import { CompanyModernHero } from "@/components/company/CompanyModernHero";
import { CompanyKineticMarquee } from "@/components/company/CompanyKineticMarquee";
import { CompanySupplySteps } from "@/components/company/CompanySupplySteps";
import { CompanyModernCatalogSection } from "@/components/company/CompanyModernCatalogSection";
import { CompanyDefinitionCard } from "@/components/company/CompanyDefinitionCard";
import { CompanyDirectInquiryDesk } from "@/components/company/CompanyDirectInquiryDesk";
import { PharmaSpatialVault } from "@/components/spatial/PharmaSpatialVault";

interface CompanyHomePageProps {
  params: {
    companySlug: string;
  };
}

// Fallback products in case backend is offline during pre-rendering
const LAKSHMI_FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Dolo 650 Tablets",
    slug: "dolo-650",
    dosageForm: "Tablet",
    packaging: "Strip of 15 Tablets",
    composition: "Paracetamol IP 650mg",
    storageConditions: "Store below 30°C in dry place",
    itemCode: "DL-650-TAB",
    manufacturer: { id: "mfg-1", name: "Micro Labs Ltd", slug: "micro-labs" },
    requiresColdChain: false,
    ingredients: [{ id: "ing-1", name: "Paracetamol", quantity: 650, unit: "mg", perBasis: "tablet", isPrimary: true }],
    categories: [{ id: "cat-1", name: "Analgesics & Antipyretics", slug: "analgesics" }],
  },
  {
    id: "prod-2",
    name: "Augmentin 625 Duo",
    slug: "augmentin-625",
    dosageForm: "Tablet",
    packaging: "Strip of 10 Tablets",
    composition: "Amoxicillin 500mg + Clavulanic Acid 125mg",
    storageConditions: "Store below 25°C protected from moisture",
    itemCode: "AUG-625-DUO",
    manufacturer: { id: "mfg-2", name: "GlaxoSmithKline", slug: "gsk" },
    requiresColdChain: false,
    ingredients: [
      { id: "ing-2", name: "Amoxicillin", quantity: 500, unit: "mg", perBasis: "tablet", isPrimary: true },
      { id: "ing-3", name: "Clavulanic Acid", quantity: 125, unit: "mg", perBasis: "tablet", isPrimary: false },
    ],
    categories: [{ id: "cat-2", name: "Antibiotics", slug: "antibiotics" }],
  },
  {
    id: "prod-3",
    name: "Calpol 500mg",
    slug: "calpol-500",
    dosageForm: "Tablet",
    packaging: "Strip of 15 Tablets",
    composition: "Paracetamol IP 500mg",
    storageConditions: "Store below 30°C",
    itemCode: "CAL-500-TAB",
    manufacturer: { id: "mfg-2", name: "GlaxoSmithKline", slug: "gsk" },
    requiresColdChain: false,
    ingredients: [{ id: "ing-1", name: "Paracetamol", quantity: 500, unit: "mg", perBasis: "tablet", isPrimary: true }],
    categories: [{ id: "cat-1", name: "Analgesics & Antipyretics", slug: "analgesics" }],
  },
  {
    id: "prod-4",
    name: "Pantocid 40 Tablets",
    slug: "pantocid-40",
    dosageForm: "Tablet",
    packaging: "Strip of 15 Tablets",
    composition: "Pantoprazole Sodium IP 40mg",
    storageConditions: "Store protected from light & moisture",
    itemCode: "PAN-40-TAB",
    manufacturer: { id: "mfg-3", name: "Sun Pharma", slug: "sun-pharma" },
    requiresColdChain: false,
    ingredients: [{ id: "ing-4", name: "Pantoprazole", quantity: 40, unit: "mg", perBasis: "tablet", isPrimary: true }],
    categories: [{ id: "cat-3", name: "Gastroenterology", slug: "gastro" }],
  },
  {
    id: "prod-5",
    name: "Azithral 500",
    slug: "azithral-500",
    dosageForm: "Tablet",
    packaging: "Strip of 5 Tablets",
    composition: "Azithromycin IP 500mg",
    storageConditions: "Store below 25°C",
    itemCode: "AZI-500-TAB",
    manufacturer: { id: "mfg-4", name: "Alembic / Cipla", slug: "cipla" },
    requiresColdChain: false,
    ingredients: [{ id: "ing-5", name: "Azithromycin", quantity: 500, unit: "mg", perBasis: "tablet", isPrimary: true }],
    categories: [{ id: "cat-2", name: "Antibiotics", slug: "antibiotics" }],
  },
  {
    id: "prod-6",
    name: "Telma 40 Tablets",
    slug: "telma-40",
    dosageForm: "Tablet",
    packaging: "Strip of 30 Tablets",
    composition: "Telmisartan IP 40mg",
    storageConditions: "Store below 30°C",
    itemCode: "TEL-40-TAB",
    manufacturer: { id: "mfg-5", name: "Glenmark", slug: "glenmark" },
    requiresColdChain: false,
    ingredients: [{ id: "ing-6", name: "Telmisartan", quantity: 40, unit: "mg", perBasis: "tablet", isPrimary: true }],
    categories: [{ id: "cat-4", name: "Cardiology", slug: "cardio" }],
  },
  {
    id: "prod-7",
    name: "Glycomet GP 2",
    slug: "glycomet-gp2",
    dosageForm: "Tablet",
    packaging: "Strip of 15 Tablets",
    composition: "Metformin 500mg + Glimepiride 2mg",
    storageConditions: "Store below 25°C",
    itemCode: "GLY-GP2-TAB",
    manufacturer: { id: "mfg-6", name: "USV Private Limited", slug: "usv" },
    requiresColdChain: false,
    ingredients: [
      { id: "ing-7", name: "Metformin", quantity: 500, unit: "mg", perBasis: "tablet", isPrimary: true },
      { id: "ing-8", name: "Glimepiride", quantity: 2, unit: "mg", perBasis: "tablet", isPrimary: false },
    ],
    categories: [{ id: "cat-5", name: "Diabetology", slug: "diabetology" }],
  },
  {
    id: "prod-8",
    name: "Pan 40 Tablets",
    slug: "pan-40",
    dosageForm: "Tablet",
    packaging: "Strip of 15 Tablets",
    composition: "Pantoprazole IP 40mg",
    storageConditions: "Store below 30°C",
    itemCode: "PAN-40-ALK",
    manufacturer: { id: "mfg-7", name: "Alkem Laboratories", slug: "alkem" },
    requiresColdChain: false,
    ingredients: [{ id: "ing-4", name: "Pantoprazole", quantity: 40, unit: "mg", perBasis: "tablet", isPrimary: true }],
    categories: [{ id: "cat-3", name: "Gastroenterology", slug: "gastro" }],
  },
];

const KOTHITTIL_FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod-k1",
    name: "Human Regular Insulin 100IU",
    slug: "human-insulin-100",
    dosageForm: "Vial",
    packaging: "10ml Injection Vial",
    composition: "Recombinant Human Insulin IP 100 IU/ml",
    storageConditions: "2°C to 8°C Cryo-Monitored (Do Not Freeze)",
    itemCode: "INS-REG-10ML",
    manufacturer: { id: "mfg-8", name: "Biocon / Novo", slug: "biocon" },
    requiresColdChain: true,
    ingredients: [{ id: "ing-9", name: "Human Insulin", quantity: 100, unit: "IU/ml", perBasis: "vial", isPrimary: true }],
    categories: [{ id: "cat-6", name: "Biologics & Cold Chain", slug: "biologics" }],
  },
  {
    id: "prod-k2",
    name: "Trastuzumab 440mg Lyophilized",
    slug: "trastuzumab-440",
    dosageForm: "Vial",
    packaging: "Single-dose 440mg Vial with Bacteriostatic Water",
    composition: "Trastuzumab 440mg (Monoclonal Antibody)",
    storageConditions: "2°C to 8°C Monitored Cold Chain",
    itemCode: "TRAST-440-BIO",
    manufacturer: { id: "mfg-9", name: "Roche / Zydus", slug: "zydus" },
    requiresColdChain: true,
    ingredients: [{ id: "ing-10", name: "Trastuzumab", quantity: 440, unit: "mg", perBasis: "vial", isPrimary: true }],
    categories: [{ id: "cat-7", name: "Oncology & Monoclonals", slug: "oncology" }],
  },
  {
    id: "prod-k3",
    name: "Rabies Vaccine (Purified Chick Embryo Cell)",
    slug: "rabies-vaccine",
    dosageForm: "Vial",
    packaging: "1 Dose Vial with Diluent & Syringe",
    composition: "Inactivated Rabies Virus Antigens ≥ 2.5 IU",
    storageConditions: "2°C to 8°C Cryo Monitored",
    itemCode: "RAB-VAC-1DS",
    manufacturer: { id: "mfg-10", name: "Serum Institute of India", slug: "serum-institute" },
    requiresColdChain: true,
    ingredients: [{ id: "ing-11", name: "Rabies Antigens", quantity: 2.5, unit: "IU", perBasis: "dose", isPrimary: true }],
    categories: [{ id: "cat-6", name: "Biologics & Cold Chain", slug: "biologics" }],
  },
  {
    id: "prod-k4",
    name: "Meropenem 1g Injection",
    slug: "meropenem-1g",
    dosageForm: "Injection",
    packaging: "Single Glass Vial for IV Infusion",
    composition: "Meropenem Trihydrate IP eq. to Anhydrous Meropenem 1000mg",
    storageConditions: "Store below 25°C protected from light",
    itemCode: "MERO-1G-IV",
    manufacturer: { id: "mfg-3", name: "Sun Pharma / Cipla", slug: "sun-pharma" },
    requiresColdChain: false,
    ingredients: [{ id: "ing-12", name: "Meropenem", quantity: 1000, unit: "mg", perBasis: "vial", isPrimary: true }],
    categories: [{ id: "cat-8", name: "Critical Care Injections", slug: "critical-care" }],
  },
  {
    id: "prod-k5",
    name: "Enoxaparin 40mg Prefilled Syringe",
    slug: "enoxaparin-40",
    dosageForm: "PFS",
    packaging: "0.4ml Prefilled Syringe with Safety Shield",
    composition: "Enoxaparin Sodium IP 40mg / 0.4ml (Anti-Xa 4000 IU)",
    storageConditions: "Store below 25°C (Do Not Freeze)",
    itemCode: "ENOX-40-PFS",
    manufacturer: { id: "mfg-11", name: "Sanofi India", slug: "sanofi" },
    requiresColdChain: false,
    ingredients: [{ id: "ing-13", name: "Enoxaparin Sodium", quantity: 40, unit: "mg", perBasis: "syringe", isPrimary: true }],
    categories: [{ id: "cat-8", name: "Critical Care Injections", slug: "critical-care" }],
  },
  {
    id: "prod-k6",
    name: "Piperacillin & Tazobactam 4.5g",
    slug: "pip-tazo-45",
    dosageForm: "Injection",
    packaging: "Single Vial for Intravenous Infusion",
    composition: "Piperacillin 4000mg + Tazobactam 500mg",
    storageConditions: "Store below 25°C",
    itemCode: "PIP-TAZO-45",
    manufacturer: { id: "mfg-7", name: "Alkem Laboratories", slug: "alkem" },
    requiresColdChain: false,
    ingredients: [
      { id: "ing-14", name: "Piperacillin", quantity: 4000, unit: "mg", perBasis: "vial", isPrimary: true },
      { id: "ing-15", name: "Tazobactam", quantity: 500, unit: "mg", perBasis: "vial", isPrimary: false },
    ],
    categories: [{ id: "cat-8", name: "Critical Care Injections", slug: "critical-care" }],
  },
  {
    id: "prod-k7",
    name: "Bevacizumab 100mg/4ml",
    slug: "bevacizumab-100",
    dosageForm: "Vial",
    packaging: "4ml Single-use Sterile Infusion Vial",
    composition: "Bevacizumab 100mg (25mg/ml)",
    storageConditions: "2°C to 8°C Strictly Protected from Light",
    itemCode: "BEVA-100-BIO",
    manufacturer: { id: "mfg-9", name: "Zydus Lifesciences", slug: "zydus" },
    requiresColdChain: true,
    ingredients: [{ id: "ing-16", name: "Bevacizumab", quantity: 100, unit: "mg", perBasis: "vial", isPrimary: true }],
    categories: [{ id: "cat-7", name: "Oncology & Monoclonals", slug: "oncology" }],
  },
  {
    id: "prod-k8",
    name: "Ceftriaxone 1g Sterile Injection",
    slug: "ceftriaxone-1g",
    dosageForm: "Injection",
    packaging: "1 Vial with Sterile Water for Injection",
    composition: "Ceftriaxone Sodium IP eq. to Ceftriaxone 1000mg",
    storageConditions: "Store below 25°C",
    itemCode: "CEFT-1G-IV",
    manufacturer: { id: "mfg-4", name: "Cipla Ltd", slug: "cipla" },
    requiresColdChain: false,
    ingredients: [{ id: "ing-17", name: "Ceftriaxone", quantity: 1000, unit: "mg", perBasis: "vial", isPrimary: true }],
    categories: [{ id: "cat-8", name: "Critical Care Injections", slug: "critical-care" }],
  },
];

export default async function CompanyHomePage({ params }: CompanyHomePageProps) {
  const { companySlug } = params;

  if (companySlug !== "lakshmi-pharma" && companySlug !== "kothittil-pharma") {
    notFound();
  }

  let company: Company;
  try {
    company = await fetchCompany(companySlug);
  } catch (err) {
    company = {
      id: companySlug,
      slug: companySlug,
      name:
        companySlug === "lakshmi-pharma"
          ? "Lakshmi Pharma"
          : "The Kothittil Pharmaceutical Distributor",
      shortName: companySlug === "lakshmi-pharma" ? "Lakshmi" : "The Kothittil",
      accentColor: companySlug === "lakshmi-pharma" ? "teal" : "blue",
      tagline:
        companySlug === "lakshmi-pharma"
          ? "Authorized Ethical & Generics Pharmaceutical Distribution"
          : "Specialty Therapeutics, Critical Care & Institutional Supply",
      description:
        companySlug === "lakshmi-pharma"
          ? "Founded in 1998, Lakshmi Pharma supplies 1,400+ verified retail pharmacies and clinical establishments across South India with same-day dispatch and 99.4% order fill rates."
          : "Established in 2005, The Kothittil Pharmaceutical Distributor specializes in cold-chain logistics, cardiology, oncology, and emergency critical care lines for premier tertiary hospitals.",
      serviceAreas: "South India Regional Healthcare Distribution",
      address:
        companySlug === "lakshmi-pharma"
          ? "Door No. 42/1892, Pharma Trade Complex, Market Road, Kochi, Kerala - 682035"
          : "Plot 14B, Healthcare Logistics Hub, NH 66 Bypass, Thiruvananthapuram, Kerala - 695024",
      phone: companySlug === "lakshmi-pharma" ? "+91 484 235 6789" : "+91 471 245 8890",
      email: companySlug === "lakshmi-pharma" ? "orders@lakshmipharma.demo" : "supply@kothittilpharma.demo",
      whatsapp: companySlug === "lakshmi-pharma" ? "+91 94471 23456" : "+91 98460 78901",
      businessHours: "Monday to Saturday: 8:30 AM - 7:30 PM",
      drugLicenseNo: "KL-REG-2024-DL-10928A / 10928B",
      gstin: "32AAAAA0000A1Z5",
      isActive: true,
    } as Company;
  }

  // Fetch real products or fallback
  let products: Product[] = [];
  try {
    const catalogData = await fetchCatalog(companySlug, { limit: 12 });
    if (catalogData && catalogData.products && catalogData.products.length > 0) {
      products = catalogData.products;
    } else {
      products = companySlug === "lakshmi-pharma" ? LAKSHMI_FALLBACK_PRODUCTS : KOTHITTIL_FALLBACK_PRODUCTS;
    }
  } catch (e) {
    products = companySlug === "lakshmi-pharma" ? LAKSHMI_FALLBACK_PRODUCTS : KOTHITTIL_FALLBACK_PRODUCTS;
  }

  const isLakshmi = company.slug === "lakshmi-pharma";

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* 1. bar-topas.ch Inspired Hero with Giant Typographic Identity, Circular Stamp & Direct CTAs */}
      <CompanyModernHero company={company} />

      {/* 2. bar-topas.ch Inspired Dual Opposing Kinetic Marquee */}
      <CompanyKineticMarquee themeColor={isLakshmi ? "emerald" : "blue"} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* 3. bar-topas.ch Inspired 4-Step Procurement Breakdown (01, 02, 03, 04) */}
        <CompanySupplySteps 
          companyName={company.shortName} 
          themeColor={isLakshmi ? "emerald" : "blue"} 
        />

        {/* 4. juliamoresco.com.br Inspired Interactive Cleanroom & Cold-Chain Vault */}
        <PharmaSpatialVault company={company} />

        {/* 5. Digital Marketing Product Catalog with Numbered Cards & Specimen Dossier Modal */}
        <CompanyModernCatalogSection 
          company={company} 
          products={products} 
        />

        {/* 5. bar-topas.ch Inspired Dictionary Definition Stamp Card */}
        <CompanyDefinitionCard company={company} />

        {/* 6. Lead Capture & Instant Commercial Inquiry Desk */}
        <CompanyDirectInquiryDesk company={company} />

      </div>

    </div>
  );
}
