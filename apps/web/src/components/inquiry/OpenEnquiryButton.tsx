"use client";

import { ClipboardList } from "lucide-react";
import { useInquiry } from "./InquiryContext";

export function OpenEnquiryButton({ className = "" }: { className?: string }) {
  const { openInquiry, totalCount } = useInquiry();
  return (
    <button onClick={() => openInquiry()} className={`btn-ink w-full text-lg ${className}`}>
      <ClipboardList className="h-5 w-5" aria-hidden="true" />
      {totalCount ? `Open enquiry list (${totalCount})` : "Open enquiry list"}
    </button>
  );
}
