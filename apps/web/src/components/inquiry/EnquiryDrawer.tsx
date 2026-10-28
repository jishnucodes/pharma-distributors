"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { X, Trash2, CheckCircle2, ClipboardList, MessageCircle, Loader2, AlertCircle } from "lucide-react";
import { Company } from "@/types";
import { submitInquiry } from "@/lib/api";
import { compositionOf, whatsappHref } from "@/lib/companies";
import { useEscape, useScrollLock } from "@/lib/hooks";
import { DoseIcon } from "@/components/ui/DoseIcon";
import { useInquiry } from "./InquiryContext";

const BUYER_KEY = "lk_buyer_details";
type Buyer = { name: string; businessName: string; phone: string; email: string };
const EMPTY_BUYER: Buyer = { name: "", businessName: "", phone: "", email: "" };

export function EnquiryDrawer({ company }: { company: Company }) {
  const { items, isOpen, closeInquiry, removeItem, updateQuantity, clearTray } = useInquiry();
  const [buyer, setBuyer] = useState<Buyer>(EMPTY_BUYER);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ message: string; id: string; summary: string } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useScrollLock(isOpen);
  const close = useCallback(() => {
    closeInquiry();
    // Leave the success screen once the buyer has seen it
    setTimeout(() => setDone(null), 300);
  }, [closeInquiry]);
  useEscape(close, isOpen);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  // Returning buyers shouldn't retype their details
  useEffect(() => {
    try {
      const saved = localStorage.getItem(BUYER_KEY);
      if (saved) setBuyer({ ...EMPTY_BUYER, ...JSON.parse(saved) });
    } catch {}
  }, []);

  const set = (k: keyof Buyer) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBuyer((b) => ({ ...b, [k]: e.target.value }));

  const listText = items
    .map((it, i) => `${i + 1}. ${it.product.name} (${it.product.manufacturer.name}) - ${it.quantity?.trim() || "price & stock"}`)
    .join("\n");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitInquiry(company.slug, {
        name: buyer.name.trim(),
        businessName: buyer.businessName.trim(),
        phone: buyer.phone.trim(),
        email: buyer.email.trim() || undefined,
        message: message.trim() || "Please share price and stock for the listed products.",
        productId: items[0]?.product.id ?? null,
        items: items.map((it) => ({
          productId: it.product.id,
          name: it.product.name,
          quantity: it.quantity?.trim() || undefined,
          packaging: it.product.packaging,
          manufacturer: it.product.manufacturer.name,
        })),
      });
      try {
        localStorage.setItem(BUYER_KEY, JSON.stringify(buyer));
      } catch {}
      setDone({ message: res.message, id: res.inquiryId, summary: listText });
      clearTray();
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send. Please try again or call us.");
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappText =
    `Enquiry for ${company.name}\n` +
    (buyer.businessName ? `From: ${buyer.businessName}${buyer.name ? ` (${buyer.name})` : ""}\n` : "") +
    `\n${listText}` +
    (message ? `\n\nNote: ${message}` : "");

  return (
    <div
      className={`fixed inset-0 z-50 transition-[visibility] ${isOpen ? "visible" : "invisible delay-300"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-title"
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />
      <aside
        className={`absolute inset-x-0 bottom-0 flex max-h-[94svh] flex-col rounded-t-4xl bg-paper shadow-lift transition-transform duration-300 ease-out sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[32rem] sm:rounded-none sm:rounded-l-4xl ${
          isOpen ? "translate-x-0 translate-y-0" : "translate-y-full sm:translate-x-full sm:translate-y-0"
        }`}
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-ink/15 sm:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 pb-4 pt-3 sm:px-7 sm:pt-6">
          <div>
            <h2 id="enquiry-title" className="font-display text-2xl font-semibold">
              {done ? "Enquiry sent" : "Your enquiry list"}
            </h2>
            <p className="text-base text-ink-mute">To {company.name}</p>
          </div>
          <button
            ref={closeRef}
            onClick={close}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-ink shadow-card hover:bg-accent-soft"
            aria-label="Close enquiry list"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 sm:px-7">
          {done ? (
            <div className="pb-10 pt-6 text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-accent" aria-hidden="true" />
              <p className="mt-4 text-lg leading-relaxed">{done.message}</p>
              <p className="mt-3 text-base text-ink-mute">
                Reference: <span className="font-mono font-semibold text-ink">{done.id.slice(-8).toUpperCase()}</span>
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <button onClick={close} className="btn-primary">
                  Continue browsing
                </button>
                {company.whatsapp && (
                  <a
                    href={whatsappHref(company.whatsapp, `Hello, I just sent an enquiry (ref ${done.id.slice(-8).toUpperCase()}).\n\n${done.summary}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                  >
                    <MessageCircle className="h-5 w-5" /> Also send on WhatsApp
                  </a>
                )}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="pb-12 pt-10 text-center">
              <ClipboardList className="mx-auto h-14 w-14 text-ink/20" aria-hidden="true" />
              <p className="mt-4 text-xl font-semibold">Your list is empty</p>
              <p className="mx-auto mt-2 max-w-xs text-base text-ink-mute">
                Tap “Add to enquiry” on any product. You can add many products and send them together.
              </p>
              <Link href={`/${company.slug}/products`} onClick={close} className="btn-primary mt-6">
                Browse products
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-8">
              <section aria-labelledby="list-h">
                <div className="flex items-center justify-between">
                  <h3 id="list-h" className="text-lg font-bold">
                    {items.length} product{items.length > 1 ? "s" : ""}
                  </h3>
                  <button type="button" onClick={clearTray} className="text-base font-semibold text-ink-mute underline-offset-4 hover:underline">
                    Clear all
                  </button>
                </div>
                <ul className="mt-3 space-y-3">
                  {items.map((it) => (
                    <li key={it.product.id} className="rounded-3xl border border-line bg-white p-4">
                      <div className="flex gap-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
                          <DoseIcon form={it.product.dosageForm} className="h-8 w-8" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-lg font-bold leading-snug">{it.product.name}</p>
                          <p className="text-sm text-ink-mute">
                            {it.product.manufacturer.name} · {it.product.packaging}
                          </p>
                          {compositionOf(it.product) && (
                            <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">{compositionOf(it.product)}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(it.product.id)}
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-mute hover:bg-red-50 hover:text-red-700"
                          aria-label={`Remove ${it.product.name}`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <label className="mt-3 block">
                        <span className="text-sm font-semibold text-ink-soft">Quantity (optional)</span>
                        <input
                          value={it.quantity ?? ""}
                          onChange={(e) => updateQuantity(it.product.id, e.target.value)}
                          placeholder="e.g. 10 boxes — leave blank for price & stock"
                          className="field mt-1 min-h-[48px] text-base"
                        />
                      </label>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${company.slug}/products`}
                  onClick={close}
                  className="mt-3 inline-flex min-h-[44px] items-center text-base font-bold text-accent-deep underline-offset-4 hover:underline"
                >
                  + Add more products
                </Link>
              </section>

              <section aria-labelledby="you-h" className="space-y-4">
                <h3 id="you-h" className="text-lg font-bold">
                  Your details
                </h3>
                <Field label="Your name" required>
                  <input className="field" value={buyer.name} onChange={set("name")} required minLength={2} autoComplete="name" />
                </Field>
                <Field label="Pharmacy / business name" required>
                  <input className="field" value={buyer.businessName} onChange={set("businessName")} required minLength={2} autoComplete="organization" />
                </Field>
                <Field label="Phone / WhatsApp number" required>
                  <input
                    className="field"
                    type="tel"
                    inputMode="tel"
                    value={buyer.phone}
                    onChange={set("phone")}
                    required
                    minLength={8}
                    autoComplete="tel"
                  />
                </Field>
                <Field label="Email (optional)">
                  <input className="field" type="email" value={buyer.email} onChange={set("email")} autoComplete="email" />
                </Field>
                <Field label="Message (optional)">
                  <textarea
                    className="field min-h-[96px] py-3"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Delivery area, preferred time to call…"
                  />
                </Field>
              </section>

              {error && (
                <p role="alert" className="flex gap-2 rounded-2xl bg-red-50 p-4 text-base text-red-800">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> {error}
                </p>
              )}

              <div className="sticky bottom-0 -mx-5 space-y-3 border-t border-line bg-paper px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:-mx-7 sm:px-7">
                <button type="submit" disabled={submitting} className="btn-primary w-full text-lg">
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {submitting ? "Sending…" : `Send enquiry · ${items.length} product${items.length > 1 ? "s" : ""}`}
                </button>
                {company.whatsapp && (
                  <a
                    href={whatsappHref(company.whatsapp, whatsappText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline w-full"
                  >
                    <MessageCircle className="h-5 w-5" /> Send on WhatsApp instead
                  </a>
                )}
              </div>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-base font-semibold">
        {label}
        {required && <span className="text-accent-deep"> *</span>}
      </span>
      {children}
    </label>
  );
}
