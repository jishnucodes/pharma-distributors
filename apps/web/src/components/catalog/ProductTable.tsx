"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, MessageSquare, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { Product } from "@/types";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";

interface ProductTableProps {
  products: Product[];
  companySlug: string;
  onEnquire: (product: Product) => void;
  accentColor?: string;
}

export function ProductTable({
  products,
  companySlug,
  onEnquire,
  accentColor = "teal",
}: ProductTableProps) {
  const isTeal = accentColor === "teal";

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* ============================================================ */}
      {/* 1. DESKTOP COMPACT TABLE VIEW (Visible on md and larger)     */}
      {/* Strictly text-based with manufacturer logos. No product imgs */}
      {/* ============================================================ */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th scope="col" className="py-3.5 px-4">
                Product &amp; Brand
              </th>
              <th scope="col" className="py-3.5 px-4">
                Manufacturer
              </th>
              <th scope="col" className="py-3.5 px-4">
                Active Composition &amp; Strength
              </th>
              {/* <th scope="col" className="py-3.5 px-4">
                Dosage Form
              </th>
              <th scope="col" className="py-3.5 px-4">
                Packaging
              </th> */}
              <th scope="col" className="py-3.5 px-4 text-right">
                Commercial Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const compositionString = product.ingredients
                .map((i) => `${i.name} ${i.quantity} ${i.unit}`)
                .join(" + ");

              return (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Product & Brand */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${companySlug}/products/${product.slug}`}
                          className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors tracking-tight"
                        >
                          {product.name}
                        </Link>
                        {/* {product.isFeatured && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Featured
                          </span>
                        )} */}
                      </div>

                      {/* {product.itemCode && (
                        <span className="text-[10px] font-mono text-slate-400">
                          SKU: {product.itemCode}
                        </span>
                      )} */}

                      {/* Match Reasons Badges */}
                      {product.matchReasons && product.matchReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.matchReasons.slice(0, 2).map((reason, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                              title={reason.detail}
                            >
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>{reason.label}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Manufacturer with Authorized Logo / Text Badge */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col gap-1">
                      <ManufacturerLogo
                        name={product.manufacturer.name}
                        logoUrl={product.manufacturer.logoUrl}
                        size="sm"
                      />
                    </div>
                  </td>

                  {/* Structured Composition with Strengths */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-slate-800 text-xs">
                        {compositionString}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {product.ingredients.map((ing) => (
                          <span
                            key={ing.id}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            <span className="font-bold">{ing.quantity} {ing.unit}</span>
                            <span className="text-slate-400 ml-1">({ing.perBasis})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Dosage Form */}
                  {/* <td className="py-3.5 px-4 align-top">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {product.dosageForm}
                    </span>
                  </td> */}

                  {/* Packaging */}
                  {/* <td className="py-3.5 px-4 align-top text-slate-600 font-medium">
                    {product.packaging}
                  </td> */}

                  {/* Actions */}
                  <td className="py-3.5 px-4 align-top text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/${companySlug}/products/${product.slug}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                        title="View complete product specifications"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => onEnquire(product)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-colors ${
                          isTeal
                            ? "bg-teal-700 hover:bg-teal-800"
                            : "bg-blue-700 hover:bg-blue-800"
                        }`}
                        title="Submit B2B commercial price & supply inquiry"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Enquire</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ============================================================ */}
      {/* 2. MOBILE READABLE TEXT CARDS (Visible on sm and mobile)     */}
      {/* Clean text hierarchy, no empty image placeholders            */}
      {/* ============================================================ */}
      <div className="md:hidden space-y-3">
        {products.map((product) => {
          const compositionString = product.ingredients
            .map((i) => `${i.name} ${i.quantity} ${i.unit}`)
            .join(" + ");

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
            >
              {/* Card Header: Product Name + Manufacturer */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${companySlug}/products/${product.slug}`}
                      className="font-bold text-base text-slate-900 tracking-tight"
                    >
                      {product.name}
                    </Link>
                    {/* {product.isFeatured && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Featured
                      </span>
                    )} */}
                  </div>
                  {/* {product.itemCode && (
                    <span className="text-[10px] font-mono text-slate-400">
                      SKU: {product.itemCode}
                    </span>
                  )} */}
                </div>

                <ManufacturerLogo
                  name={product.manufacturer.name}
                  logoUrl={product.manufacturer.logoUrl}
                  size="sm"
                />
              </div>

              {/* Composition & Strengths */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active Composition
                </span>
                <p className="font-semibold text-slate-800 text-xs">
                  {compositionString}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {product.ingredients.map((ing) => (
                    <span
                      key={ing.id}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white text-slate-600 border border-slate-200"
                    >
                      {ing.quantity} {ing.unit} ({ing.perBasis})
                    </span>
                  ))}
                </div>
              </div>

              {/* Match Reason Badges */}
              {product.matchReasons && product.matchReasons.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.matchReasons.slice(0, 2).map((reason, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{reason.label}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Dosage Form & Packaging */}
              {/* <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-500">Dosage:</span>
                  <span className="font-semibold text-blue-700">{product.dosageForm}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-500">Pack:</span>
                  <span className="font-semibold text-slate-800">{product.packaging}</span>
                </div>
              </div> */}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Link
                  href={`/${companySlug}/products/${product.slug}`}
                  className="flex-1 text-center py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  View Details
                </Link>
                <button
                  type="button"
                  onClick={() => onEnquire(product)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-colors ${
                    isTeal
                      ? "bg-teal-700 hover:bg-teal-800"
                      : "bg-blue-700 hover:bg-blue-800"
                  }`}
                >
                  Enquire Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
