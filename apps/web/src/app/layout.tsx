import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "L & K | Pharmaceutical Distributors | Lakshmi Pharma & The Kothittil Distributor",
  description:
    "Integrated B2B pharmaceutical distribution platform for Lakshmi Pharma (Ethical & Generics) and The Kothittil Pharmaceutical Distributor (Specialty & Critical Care). Composition-based catalog search, authorized manufacturers, and wholesale healthcare supply.",
  keywords: [
    "pharmaceutical distributor",
    "wholesale pharma",
    "Lakshmi Pharma",
    "The Kothittil Pharmaceutical Distributor",
    "Dolo 650",
    "Calpol 650",
    "Paracetamol distributor",
    "Cipla distributor",
    "Micro Labs distributor",
    "B2B pharma catalog",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-white">
      <body className="min-h-full flex flex-col font-sans antialiased text-slate-900 bg-white">
        {children}
      </body>
    </html>
  );
}
