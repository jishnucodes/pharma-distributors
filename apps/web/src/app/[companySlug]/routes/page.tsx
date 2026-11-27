import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompanyRoutes } from "@/lib/server";
import { RouteMapClient } from "./RouteMapClient";

interface Props {
  params: { companySlug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { company } = await getCompanyRoutes(params.companySlug);
  return {
    title: `Field Representatives & Delivery Routes · ${company.name}`,
    description: `Contact area sales officers and delivery beats for ${company.name}. Service schedule for retail pharmacies, clinics, and hospitals in ${company.serviceAreas}.`,
  };
}

export default async function RoutesPage({ params }: Props) {
  const { company, routes } = await getCompanyRoutes(params.companySlug);

  if (!company) {
    notFound();
  }

  return <RouteMapClient company={company} routes={routes || []} />;
}
