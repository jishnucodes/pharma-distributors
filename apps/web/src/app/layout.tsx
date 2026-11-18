import type { Metadata, Viewport } from "next";
import { Manrope, Fraunces } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "L & K Pharma Network | Lakshmi Pharma & The Kothittil Pharmaceutical Distributor",
    template: "%s | L & K Pharma Network",
  },
  description:
    "Browse the wholesale catalogues of Lakshmi Pharma and The Kothittil Pharmaceutical Distributor. Search by brand or composition and send one enquiry for many products at once.",
  keywords: [
    "pharmaceutical distributor",
    "wholesale pharma Kerala",
    "Lakshmi Pharma",
    "The Kothittil Pharmaceutical Distributor",
    "medicine enquiry",
    "B2B pharma catalogue",
    "active pharmaceutical ingredients",
    "composition search",
  ],
  authors: [{ name: "L & K Pharma Network" }],
  creator: "L & K Pharma Network",
  publisher: "L & K Pharma Network",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "L & K Pharma Network",
    title: "L & K Pharma Network | Authorised Wholesale Distributors",
    description: "Browse wholesale catalogues of Lakshmi Pharma and The Kothittil Pharmaceutical Distributor. Search by salt or brand.",
  },
  twitter: {
    card: "summary_large_image",
    title: "L & K Pharma Network | Authorised Wholesale Distributors",
    description: "Browse wholesale catalogues of Lakshmi Pharma and The Kothittil Pharmaceutical Distributor. Search by salt or brand.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F6F4EF",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "L & K Pharma Network",
    description: "Wholesale pharmaceutical distribution network for Lakshmi Pharma and The Kothittil Pharmaceutical Distributor.",
    url: siteUrl,
    areaServed: "Kerala, India",
    knowsAbout: ["Pharmaceutical Distribution", "Prescription Formulations", "Active Pharmaceutical Ingredients"],
  };

  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <head>
        <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={apiOrigin} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen font-sans">
        <NextTopLoader
          color="#2563eb"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563eb, 0 0 5px #3b82f6"
          zIndex={99999}
          showAtBottom={false}
        />
        {children}
      </body>
    </html>
  );
}
