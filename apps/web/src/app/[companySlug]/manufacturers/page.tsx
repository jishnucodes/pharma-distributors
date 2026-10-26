import React from "react";
import { notFound } from "next/navigation";
import { fetchCompany, fetchManufacturers } from "@/lib/api";
import { ManufacturersDirectoryView } from "@/components/manufacturers/ManufacturersDirectoryView";

interface ManufacturersPageProps {
  params: {
    companySlug: string;
  };
}

export default async function CompanyManufacturersPage({ params }: ManufacturersPageProps) {
  const { companySlug } = params;

  let company;
  let manufacturersData;
  try {
    [company, manufacturersData] = await Promise.all([
      fetchCompany(companySlug),
      fetchManufacturers(companySlug),
    ]);
  } catch (err) {
    notFound();
  }

  const manufacturers = manufacturersData.data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ManufacturersDirectoryView company={company} manufacturers={manufacturers} />
    </div>
  );
}
