import React from "react";
import { notFound } from "next/navigation";
import { fetchCompany } from "@/lib/api";
import { CompanyAboutView } from "@/components/about/CompanyAboutView";

interface AboutPageProps {
  params: {
    companySlug: string;
  };
}

export default async function CompanyAboutPage({ params }: AboutPageProps) {
  const { companySlug } = params;

  let company;
  try {
    company = await fetchCompany(companySlug);
  } catch (err) {
    notFound();
  }

  return <CompanyAboutView company={company} />;
}
