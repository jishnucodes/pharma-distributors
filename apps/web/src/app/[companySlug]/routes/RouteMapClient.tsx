"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building2,
  Navigation,
  FileText,
  AlertCircle,
  Truck,
  UserCheck,
} from "lucide-react";
import { Company, CompanyRoute } from "@/types";
import { companyColor, telHref, whatsappHref } from "@/lib/companies";
import { OpenEnquiryButton } from "@/components/inquiry/OpenEnquiryButton";

const WEEKDAYS = ["All Days", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function RouteMapClient({
  company,
  routes,
}: {
  company: Company;
  routes: CompanyRoute[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState("All Days");

  const color = companyColor(company.slug);
  const isLakshmi = company.slug === "lakshmi-pharma";

  // Filter routes based on search text and selected day
  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      // Day filter
      if (selectedDay !== "All Days") {
        const sched = (r.schedule || "").toLowerCase();
        const day = selectedDay.toLowerCase();
        // Check if schedule includes the day or says "Daily"
        const matchesDay = sched.includes("daily") || sched.includes(day) || sched.includes(day.slice(0, 3));
        if (!matchesDay) return false;
      }

      // Search query filter (search person name, designation, areas, notes)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = (r.personName || "").toLowerCase().includes(q);
        const inDesig = (r.designation || "").toLowerCase().includes(q);
        const inAreas = (r.routeAreas || "").toLowerCase().includes(q);
        const inNotes = (r.notes || "").toLowerCase().includes(q);
        const inPhone = (r.phone || "").replace(/\s+/g, "").includes(q);
        if (!inName && !inDesig && !inAreas && !inNotes && !inPhone) return false;
      }

      return true;
    });
  }, [routes, searchQuery, selectedDay]);

  return (
    <div className="container-x pb-20 pt-6 sm:pt-10">
      {/* Page Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
          style={{ backgroundColor: `${color.main}15`, color: color.main }}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Field Representation &amp; Delivery Logistics</span>
        </div>
        <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-ink">
          Field Route Map &amp; Beat Schedule
        </h1>
        <p className="mt-2 text-base sm:text-lg text-ink-soft">
          Connect directly with your designated {company.shortName} territory sales officer, medical representative, or delivery vehicle.
          Direct contact for licensed retail chemists, hospital pharmacies, and medical clinics.
        </p>
      </div>

      {/* Quick Distributor Highlights */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-line shadow-xs">
          <p className="text-[11px] sm:text-xs font-semibold text-ink-mute uppercase tracking-wide">Coverage Territory</p>
          <p className="mt-1 text-xs sm:text-sm font-bold text-ink line-clamp-2">{company.serviceAreas}</p>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-line shadow-xs">
          <p className="text-[11px] sm:text-xs font-semibold text-ink-mute uppercase tracking-wide">Operating Hours</p>
          <p className="mt-1 text-xs sm:text-sm font-bold text-ink">{company.businessHours}</p>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-line shadow-xs">
          <p className="text-[11px] sm:text-xs font-semibold text-ink-mute uppercase tracking-wide">Active Field Beats</p>
          <p className="mt-1 text-base sm:text-lg font-bold" style={{ color: color.main }}>
            {routes.length} Designated Routes
          </p>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-line shadow-xs">
          <p className="text-[11px] sm:text-xs font-semibold text-ink-mute uppercase tracking-wide">Drug Licence</p>
          <p className="mt-1 text-xs sm:text-sm font-mono font-bold text-ink truncate">{company.drugLicenseNo || "Verified Wholesale"}</p>
        </div>
      </div>

      {/* Search & Weekday Filters Bar */}
      <div className="mt-8 bg-white p-4 sm:p-5 rounded-3xl border border-line shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mute" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by town, landmark, hospital area, or rep name (e.g. Aluva, Kakkanad, Medical College)..."
              className="w-full h-11 pl-10 pr-4 rounded-2xl border border-line bg-paper/50 text-sm sm:text-base text-ink placeholder:text-ink-mute/70 focus:outline-none focus:border-accent focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-mute hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-soft whitespace-nowrap">Filter Day:</span>
            <div className="sm:hidden flex-1">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full h-11 px-3 rounded-2xl border border-line bg-paper/50 text-xs font-semibold text-ink"
              >
                {WEEKDAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Desktop / Tablet Day Pills */}
        <div className="hidden sm:flex flex-wrap items-center gap-1.5 pt-1 border-t border-line/60">
          {WEEKDAYS.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? "text-white shadow-xs"
                    : "bg-paper text-ink-soft hover:text-ink hover:bg-black/5"
                }`}
                style={isSelected ? { backgroundColor: color.main } : undefined}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Status & Count */}
      <div className="mt-6 flex items-center justify-between text-xs sm:text-sm text-ink-soft">
        <p>
          Showing <span className="font-bold text-ink">{filteredRoutes.length}</span> of {routes.length} field representative routes
          {selectedDay !== "All Days" && <span> on <strong className="text-ink">{selectedDay}</strong></span>}
          {searchQuery && <span> matching &ldquo;<strong className="text-ink">{searchQuery}</strong>&rdquo;</span>}
        </p>
        {(searchQuery || selectedDay !== "All Days") && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedDay("All Days");
            }}
            className="font-semibold text-accent hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Routes Grid */}
      {filteredRoutes.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredRoutes.map((route, idx) => (
            <div
              key={route.id}
              className="flex flex-col justify-between rounded-3xl border border-line bg-white p-5 sm:p-6 shadow-card hover:border-accent transition-all duration-200"
            >
              <div>
                {/* Rep Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-lg text-white shadow-xs shrink-0"
                      style={{ backgroundColor: color.main }}
                    >
                      {route.personName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg sm:text-xl font-bold text-ink">
                          {route.personName}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          <span>Active Beat</span>
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-ink-mute">
                        {route.designation || "Territory Field Officer"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-ink-mute px-2 py-1 rounded-lg bg-paper">
                    Beat #{route.orderIndex || idx + 1}
                  </span>
                </div>

                {/* Beat Territory / Areas Covered */}
                <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-paper/60 border border-line/60 space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                        Territory &amp; Route Stops
                      </span>
                      {route.routeAreas.includes("->") ? (
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {route.routeAreas.split("->").map((stop, sIdx, arr) => (
                            <React.Fragment key={sIdx}>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-white border border-line text-xs font-bold text-ink shadow-2xs">
                                {stop.trim()}
                              </span>
                              {sIdx < arr.length - 1 && (
                                <span className="text-accent font-bold text-xs select-none">→</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm font-semibold text-ink mt-0.5 leading-relaxed">
                          {route.routeAreas}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="flex items-start gap-2 pt-2 border-t border-line/50">
                    <Calendar className="w-4 h-4 text-ink-mute shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                        Visit Schedule &amp; Timings
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-ink mt-0.5">
                        {route.schedule}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes if present */}
                {route.notes && (
                  <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-snug">{route.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons: Direct Call, WhatsApp & Map */}
              <div className="mt-6 pt-4 border-t border-line/80 flex flex-wrap items-center gap-2">
                <a
                  href={telHref(route.phone)}
                  className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-xs transition-transform active:scale-[0.98]"
                  style={{ backgroundColor: color.main }}
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {route.phone}</span>
                </a>

                <a
                  href={whatsappHref(
                    route.phone,
                    `Hello ${route.personName}, I am contacting you regarding a wholesale pharmaceutical inquiry for ${company.shortName}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-xs transition-colors"
                  title="WhatsApp Representative"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>

                {route.mapUrl && (
                  <a
                    href={route.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-line bg-paper hover:bg-line/40 text-xs font-semibold text-ink transition-colors"
                    title="View route map link"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-ink-mute" />
                    <span className="hidden sm:inline">Map</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="mt-8 rounded-3xl border border-line bg-white p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-paper grid place-items-center text-ink-mute mb-4">
            <MapPin className="w-7 h-7" />
          </div>
          <h3 className="font-display text-lg font-bold text-ink">No Routes Found</h3>
          <p className="mt-1 text-sm text-ink-soft">
            No field representative matches &ldquo;{searchQuery || selectedDay}&rdquo;. Try another town, district, or reset your search filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedDay("All Days");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Support & Central Order Desk Banner */}
      <div className="mt-12 rounded-3xl sm:rounded-4xl bg-ink p-6 sm:p-10 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-soft">
              Direct Central Order Desk
            </span>
            <h2 className="font-display text-xl sm:text-3xl font-semibold">
              Don&apos;t see your clinic or pharmacy area listed?
            </h2>
            <p className="text-sm sm:text-base text-white/75">
              Our central order logistics desk arranges custom courier, express dispatch, or cold-chain delivery for hospitals, institutions, and unlisted beats across Kerala.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={telHref(company.phone)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-white text-ink hover:bg-white/90 shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4 text-accent" />
              <span>Call Order Desk</span>
            </a>
            <Link
              href={`/${company.slug}/contact`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <span>Contact Details</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
