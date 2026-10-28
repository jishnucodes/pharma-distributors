import { Suspense } from "react";
import { getCompany } from "@/lib/server";
import { CatalogView } from "@/components/catalog/CatalogView";

export const metadata = { title: "Products" };

export default async function ProductsPage({ params }: { params: { companySlug: string } }) {
  const company = await getCompany(params.companySlug);
  return (
    <Suspense fallback={<div className="container-x h-[60vh] pt-10" />}>
      <CatalogView company={company} />
    </Suspense>
  );
}
