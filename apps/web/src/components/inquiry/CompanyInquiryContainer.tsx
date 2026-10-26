"use client";

import React from "react";
import { useInquiry } from "./InquiryContext";
import { InquiryFloatingBar } from "./InquiryFloatingBar";
import { InquiryModal } from "./InquiryModal";
import { Company } from "@/types";

interface CompanyInquiryContainerProps {
  company: Company;
}

export function CompanyInquiryContainer({ company }: CompanyInquiryContainerProps) {
  const { isOpen, closeInquiry, activeProduct } = useInquiry();

  return (
    <>
      <InquiryFloatingBar
        companyName={company.name}
        accentColor={company.accentColor}
      />
      <InquiryModal
        isOpen={isOpen}
        onClose={closeInquiry}
        companySlug={company.slug}
        companyName={company.name}
        accentColor={company.accentColor}
        initialProduct={activeProduct}
        whatsapp={company.whatsapp}
      />
    </>
  );
}
