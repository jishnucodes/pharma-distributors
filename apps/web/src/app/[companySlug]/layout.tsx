import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPANY_SLUGS, isCompanySlug } from "@/lib/companies";
import { getCompany } from "@/lib/server";
import { InquiryProvider } from "@/components/inquiry/InquiryContext";
import { EnquiryDrawer } from "@/components/inquiry/EnquiryDrawer";
import { CompanyHeader } from "@/components/site/CompanyHeader";
import { MobileTabBar } from "@/components/site/MobileTabBar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CompanyIntro } from "@/components/site/CompanyIntro";

export const revalidate = 300;

export function generateStaticParams() {
  return COMPANY_SLUGS.map((companySlug) => ({ companySlug }));
}

export async function generateMetadata({ params }: { params: { companySlug: string } }): Promise<Metadata> {
  if (!isCompanySlug(params.companySlug)) return {};
  const company = await getCompany(params.companySlug);
  return {
    title: { default: `${company.name} | L&K Pharma`, template: `%s | ${company.name}` },
    description: company.tagline ?? company.description,
  };
}

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { companySlug: string };
}) {
  const { companySlug } = params;
  if (!isCompanySlug(companySlug)) notFound();

  const [company, ...others] = await Promise.all([
    getCompany(companySlug),
    ...COMPANY_SLUGS.filter((s) => s !== companySlug).map((s) => getCompany(s)),
  ]);

  return (
    <InquiryProvider companySlug={companySlug}>
      <div data-company={companySlug} className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <CompanyHeader company={company} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter companies={[company, ...others]} />
        <div className="h-16 bg-ink pb-[env(safe-area-inset-bottom)] lg:hidden" aria-hidden="true" />
        <MobileTabBar slug={companySlug} />
        <EnquiryDrawer company={company} />
        <CompanyIntro slug={companySlug} name={company.name} />
      </div>
    </InquiryProvider>
  );
}
