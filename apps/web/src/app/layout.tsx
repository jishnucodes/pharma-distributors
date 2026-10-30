import type { Metadata, Viewport } from "next";
import { Manrope, Fraunces } from "next/font/google";
import "./globals.css";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "L & K Pharma Network | Lakshmi Pharma & The Kothottil Pharmaceutical Distributor",
  description:
    "Browse the wholesale catalogues of Lakshmi Pharma and The Kothottil Pharmaceutical Distributor. Search by brand or composition and send one enquiry for many products at once.",
  keywords: [
    "pharmaceutical distributor",
    "wholesale pharma Kerala",
    "Lakshmi Pharma",
    "The Kothottil Pharmaceutical Distributor",
    "medicine enquiry",
    "B2B pharma catalogue",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F6F4EF",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <head>
        <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={apiOrigin} />
      </head>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
