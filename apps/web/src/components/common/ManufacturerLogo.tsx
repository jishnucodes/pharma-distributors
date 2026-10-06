"use client";

import React, { useState } from "react";

interface ManufacturerLogoProps {
  name: string;
  logoUrl?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ManufacturerLogo({
  name,
  logoUrl,
  className = "",
  size = "md",
}: ManufacturerLogoProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "h-6 max-w-[90px] text-xs px-2 py-0.5",
    md: "h-8 max-w-[130px] text-xs px-2.5 py-1",
    lg: "h-10 max-w-[160px] text-sm px-3 py-1.5",
  }[size];

  // If logoUrl is available and has not failed to load, display authorized SVG / image
  if (logoUrl && !hasError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center bg-white border border-slate-200/80 rounded-md p-1 shadow-xs hover:border-slate-300 transition-colors ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={`${name} authorized manufacturer logo`}
          className={`${sizeClasses} object-contain`}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Clean, high-legibility text fallback badge (No placeholder images)
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 font-medium text-slate-700 tracking-tight select-none shadow-2xs ${sizeClasses} ${className}`}
      title={`Manufacturer: ${name}`}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-slate-200 text-[10px] font-bold text-slate-600">
        {initials}
      </span>
      <span className="truncate font-semibold">{name}</span>
    </div>
  );
}
