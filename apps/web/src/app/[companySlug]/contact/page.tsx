import { Phone, MessageCircle, Mail, MapPin, Clock, Navigation } from "lucide-react";
import { telHref, whatsappHref } from "@/lib/companies";
import { getCompany } from "@/lib/server";
import { OpenEnquiryButton } from "@/components/inquiry/OpenEnquiryButton";

export const metadata = { title: "Contact" };

export default async function ContactPage({ params }: { params: { companySlug: string } }) {
  const company = await getCompany(params.companySlug);
  const mapsHref =
    company.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`;

  const channels = [
    { icon: Phone, label: "Call", value: company.phone, href: telHref(company.phone) },
    company.whatsapp && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: company.whatsapp,
      href: whatsappHref(company.whatsapp),
      external: true,
    },
    { icon: Mail, label: "Email", value: company.email, href: `mailto:${company.email}` },
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string; value: string; href: string; external?: boolean }>;

  return (
    <div className="container-x pb-16 pt-6 sm:pt-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Contact {company.shortName}</h1>
      <p className="mt-2 max-w-2xl text-lg text-ink-soft">
        Call, WhatsApp or email our trade desk. For a list of products, the enquiry list is quickest.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <ul className="space-y-3">
          {channels.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center gap-4 rounded-3xl border border-line bg-white p-5 shadow-card hover:border-accent"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent text-white">
                  <c.icon className="h-7 w-7" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-ink-mute">{c.label}</span>
                  <span className="block break-words text-xl font-bold">{c.value}</span>
                </span>
              </a>
            </li>
          ))}
          <li className="pt-2">
            <OpenEnquiryButton />
          </li>
        </ul>

        <div className="space-y-4 rounded-4xl bg-accent-deep p-6 text-white sm:p-8">
          <h2 className="font-display text-2xl font-semibold">Visit us</h2>
          <p className="flex gap-3 text-lg">
            <MapPin className="mt-1 h-5 w-5 shrink-0" /> {company.address}
          </p>
          <p className="flex gap-3 text-lg">
            <Clock className="mt-1 h-5 w-5 shrink-0" /> {company.businessHours}
          </p>
          <p className="text-base text-white/75">Serving: {company.serviceAreas}</p>
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn w-full bg-white text-accent-deep hover:bg-accent-soft"
          >
            <Navigation className="h-5 w-5" /> Get directions
          </a>
          {(company.drugLicenseNo || company.gstin) && (
            <div className="border-t border-white/20 pt-4 text-base text-white/75">
              {company.drugLicenseNo && <p>Drug licence: {company.drugLicenseNo}</p>}
              {company.gstin && <p>GSTIN: {company.gstin}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
