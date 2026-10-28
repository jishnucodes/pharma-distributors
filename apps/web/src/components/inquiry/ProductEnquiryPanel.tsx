"use client";

import { useState } from "react";
import { Check, ClipboardList, MessageCircle, Phone, Plus } from "lucide-react";
import { Company, Product } from "@/types";
import { telHref, whatsappHref } from "@/lib/companies";
import { useInquiry } from "./InquiryContext";

/** Takes the place a product photo would normally occupy: everything needed to ask for this item. */
export function ProductEnquiryPanel({ product, company }: { product: Product; company: Company }) {
  const { items, addItem, removeItem, updateQuantity, isInTray, openInquiry } = useInquiry();
  const inList = isInTray(product.id);
  const listQty = items.find((i) => i.product.id === product.id)?.quantity ?? "";
  const [qty, setQty] = useState("");
  const whatsappText = `Hello ${company.name}, please share price and stock for ${product.name} (${product.manufacturer.name}, ${product.packaging})${qty ? ` - quantity: ${qty}` : ""}.`;

  return (
    <section aria-labelledby="ask-h" className="rounded-4xl border border-line bg-white p-5 shadow-card sm:p-6">
      <h2 id="ask-h" className="font-display text-2xl font-semibold">
        Ask for price &amp; stock
      </h2>
      <p className="mt-1 text-base text-ink-soft">No account needed. Add it to your list and send everything together.</p>

      <label className="mt-5 block">
        <span className="text-base font-semibold">Quantity (optional)</span>
        <input
          className="field mt-1.5"
          value={inList ? listQty : qty}
          onChange={(e) => (inList ? updateQuantity(product.id, e.target.value) : setQty(e.target.value))}
          placeholder="e.g. 10 boxes"
        />
      </label>

      {inList ? (
        <div className="mt-3 space-y-2">
          <p className="flex items-center gap-2 rounded-2xl bg-accent-soft px-4 py-3 text-base font-semibold text-accent-deep">
            <Check className="h-5 w-5" aria-hidden="true" /> In your enquiry list
          </p>
          <div className="flex gap-2">
            <button onClick={() => openInquiry()} className="btn-primary flex-1">
              <ClipboardList className="h-5 w-5" aria-hidden="true" /> View list &amp; send
            </button>
            <button onClick={() => removeItem(product.id)} className="btn-outline px-4">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => addItem(product, qty.trim())} className="btn-primary mt-3 w-full min-h-[56px] text-lg">
          <Plus className="h-5 w-5" aria-hidden="true" /> Add to enquiry
        </button>
      )}

      <div className="my-5 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink-mute">
        <span className="h-px flex-1 bg-line" /> or talk to us <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid gap-2">
        <a href={telHref(company.phone)} className="btn-outline justify-start">
          <Phone className="h-5 w-5" aria-hidden="true" /> {company.phone}
        </a>
        {company.whatsapp && (
          <a
            href={whatsappHref(company.whatsapp, whatsappText)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline justify-start"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> Ask on WhatsApp
          </a>
        )}
      </div>
      <p className="mt-4 text-sm text-ink-mute">{company.businessHours}</p>
    </section>
  );
}
