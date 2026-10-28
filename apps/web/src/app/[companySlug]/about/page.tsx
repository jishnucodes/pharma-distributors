import { redirect } from "next/navigation";

/** About content now lives on the company overview page. */
export default function AboutPage({ params }: { params: { companySlug: string } }) {
  redirect(`/${params.companySlug}#about`);
}
