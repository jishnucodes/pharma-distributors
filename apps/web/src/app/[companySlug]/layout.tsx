import React from "react";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingTradeSpeedDial } from "@/components/common/FloatingTradeSpeedDial";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { fetchCompany } from "@/lib/api";

import { ScrollAnimatedBackground } from "@/components/common/ScrollAnimatedBackground";
import { InquiryProvider } from "@/components/inquiry/InquiryContext";
import { CompanyInquiryContainer } from "@/components/inquiry/CompanyInquiryContainer";

interface CompanyLayoutProps {
  children: React.ReactNode;
  params: {
    companySlug: string;
  };
}

export default async function CompanyLayout({ children, params }: CompanyLayoutProps) {
  const { companySlug } = params;

  if (companySlug !== "lakshmi-pharma" && companySlug !== "kothittil-pharma") {
    notFound();
  }

  let company;
  try {
    company = await fetchCompany(companySlug);
  } catch (err) {
    // If backend is unreachable during static pre-rendering, fallback safely
    company = {
      id: companySlug,
      slug: companySlug,
      name:
        companySlug === "lakshmi-pharma"
          ? "Lakshmi Pharma"
          : "The Kothittil Pharmaceutical Distributor",
      shortName: companySlug === "lakshmi-pharma" ? "Lakshmi" : "Kothittil",
      accentColor: companySlug === "lakshmi-pharma" ? "teal" : "blue",
      description: "Authorized Pharmaceutical Distributor",
      serviceAreas: "South India Regional Healthcare Distribution",
      address:
        companySlug === "lakshmi-pharma"
          ? "Market Road, Kochi, Kerala - 682035"
          : "NH 66 Bypass, Thiruvananthapuram, Kerala - 695024",
      phone: companySlug === "lakshmi-pharma" ? "+91 484 235 6789" : "+91 471 245 8890",
      email: companySlug === "lakshmi-pharma" ? "orders@lakshmipharma.demo" : "supply@kothittilpharma.demo",
      whatsapp: companySlug === "lakshmi-pharma" ? "+91 94471 23456" : "+91 98460 78901",
      businessHours: "Mon - Sat: 8:30 AM - 7:30 PM",
      drugLicenseNo: "KL-REG-2024-DL (DEMO)",
      isActive: true,
    } as any;
  }

  const isLakshmi = company.slug === "lakshmi-pharma";

  return (
    <InquiryProvider companySlug={companySlug}>
      <div
        className={`min-h-screen flex flex-col relative ${
          isLakshmi ? "theme-lakshmi" : "theme-kothittil"
        }`}
      >
        {/* 2026 Modern Scroll-Animated Pharmaceutical Background */}
        <ScrollAnimatedBackground companySlug={companySlug} />

        <TopBar company={company} />
        <Header currentCompany={company} />
        <main className="flex-1 pb-24 lg:pb-0 relative overflow-x-hidden pt-2 sm:pt-3">{children}</main>
        <Footer currentCompany={company} />
        <FloatingTradeSpeedDial company={company} />
        <MobileBottomNav currentCompany={company} />
        <CompanyInquiryContainer company={company} />
      </div>
    </InquiryProvider>
  );
}
