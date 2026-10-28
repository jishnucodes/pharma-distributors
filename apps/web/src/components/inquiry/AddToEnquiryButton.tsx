"use client";

import { Check, Plus } from "lucide-react";
import { Product } from "@/types";
import { useInquiry } from "./InquiryContext";

export function AddToEnquiryButton({
  product,
  size = "md",
  className = "",
}: {
  product: Product;
  /** "icon" is a round button for dense rows on phones */
  size?: "icon" | "sm" | "md" | "lg";
  className?: string;
}) {
  const { addItem, removeItem, isInTray } = useInquiry();
  const added = isInTray(product.id);
  const Icon = added ? Check : Plus;
  const label = added ? `Remove ${product.name} from enquiry list` : `Add ${product.name} to enquiry list`;
  const onClick = () => (added ? removeItem(product.id) : addItem(product));

  if (size === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={added}
        aria-label={label}
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-full transition-colors ${
          added ? "border-2 border-accent bg-accent-soft text-accent-deep" : "bg-accent text-white hover:bg-accent-deep"
        } ${className}`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </button>
    );
  }

  const sizing = { sm: "min-h-[44px] px-4 text-[0.95rem]", md: "", lg: "min-h-[56px] px-7 text-lg" }[size];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={added}
      aria-label={label}
      className={`${
        added ? "btn border-2 border-accent bg-accent-soft text-accent-deep hover:bg-white" : "btn-primary"
      } ${sizing} ${className}`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {added ? "Added" : size === "sm" ? "Add" : "Add to enquiry"}
    </button>
  );
}
