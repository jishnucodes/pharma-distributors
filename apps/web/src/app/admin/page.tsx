"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Layers,
  FlaskConical,
  Building2,
  LogOut,
  Plus,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Shield,
  Save,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { AuthUser, Inquiry } from "@/types";
import {
  fetchMe,
  fetchAdminOverview,
  fetchAdminInquiries,
  updateInquiryStatus,
  fetchAdminProducts,
  toggleCompanyProductListing,
  fetchAdminManufacturers,
  saveManufacturer,
  fetchAdminIngredients,
  saveIngredient,
  updateCompanyProfile,
} from "@/lib/api";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";

type AdminTab =
  | "overview"
  | "inquiries"
  | "listings"
  | "products"
  | "manufacturers"
  | "ingredients"
  | "company_profile";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Tab Data States
  const [overviewData, setOverviewData] = useState<any>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);

  // Selected Inquiry for Modal / Edit
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inquiryStatus, setInquiryStatus] = useState<string>("PENDING");
  const [inquiryNotes, setInquiryNotes] = useState<string>("");

  // Edit Company Profile Form State
  const [companyProfileForm, setCompanyProfileForm] = useState({
    id: "",
    address: "",
    phone: "",
    email: "",
    whatsapp: "",
    businessHours: "",
    serviceAreas: "",
    description: "",
  });

  // New Manufacturer Form State
  const [mfgForm, setMfgForm] = useState({
    name: "",
    slug: "",
    website: "",
    logoUrl: "",
  });

  // New Ingredient Form State
  const [ingForm, setIngForm] = useState({
    name: "",
    slug: "",
    description: "",
    aliasesText: "",
  });

  // 1. Initial Auth Check
  useEffect(() => {
    const savedToken = localStorage.getItem("lk_auth_token");
    if (!savedToken) {
      router.push("/admin/login");
      return;
    }

    setToken(savedToken);
    fetchMe(savedToken)
      .then((user) => {
        setCurrentUser(user);
        loadOverview(savedToken);
      })
      .catch(() => {
        localStorage.removeItem("lk_auth_token");
        router.push("/admin/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Load Overview Data
  const loadOverview = async (authToken: string) => {
    try {
      const data = await fetchAdminOverview(authToken);
      setOverviewData(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load Inquiries
  const loadInquiries = async () => {
    if (!token) return;
    try {
      const data = await fetchAdminInquiries(token);
      setInquiries(data);
    } catch (err: any) {
      showStatus("error", err.message);
    }
  };

  // Load Products
  const loadProducts = async () => {
    if (!token) return;
    try {
      const data = await fetchAdminProducts(token);
      setProducts(data);
    } catch (err: any) {
      showStatus("error", err.message);
    }
  };

  // Load Manufacturers
  const loadManufacturers = async () => {
    if (!token) return;
    try {
      const data = await fetchAdminManufacturers(token);
      setManufacturers(data);
    } catch (err: any) {
      showStatus("error", err.message);
    }
  };

  // Load Ingredients
  const loadIngredients = async () => {
    if (!token) return;
    try {
      const data = await fetchAdminIngredients(token);
      setIngredients(data);
    } catch (err: any) {
      showStatus("error", err.message);
    }
  };

  // Load Company Profile for Edit
  const loadCompanyProfile = (company: any) => {
    setCompanyProfileForm({
      id: company.id,
      address: company.address || "",
      phone: company.phone || "",
      email: company.email || "",
      whatsapp: company.whatsapp || "",
      businessHours: company.businessHours || "",
      serviceAreas: company.serviceAreas || "",
      description: company.description || "",
    });
  };

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem("lk_auth_token");
    localStorage.removeItem("lk_auth_user");
    router.push("/admin/login");
  };

  // Switch Tab Handler
  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    if (!token) return;
    if (tab === "inquiries") loadInquiries();
    if (tab === "listings" || tab === "products") loadProducts();
    if (tab === "manufacturers") loadManufacturers();
    if (tab === "ingredients") loadIngredients();
  };

  // Inquiry Update
  const handleUpdateInquiry = async () => {
    if (!token || !selectedInquiry) return;
    try {
      await updateInquiryStatus(token, selectedInquiry.id, inquiryStatus, inquiryNotes);
      showStatus("success", "Inquiry updated successfully");
      setSelectedInquiry(null);
      loadInquiries();
    } catch (err: any) {
      showStatus("error", err.message);
    }
  };

  // Toggle Listing Publication / Featured
  const handleToggleListing = async (
    companyId: string,
    productId: string,
    field: "isPublished" | "isFeatured",
    currentVal: boolean
  ) => {
    if (!token) return;
    try {
      await toggleCompanyProductListing(token, {
        companyId,
        productId,
        [field]: !currentVal,
      });
      showStatus("success", "Catalog status updated");
      loadProducts();
    } catch (err: any) {
      showStatus("error", err.message);
    }
  };

  // Save Manufacturer
  const handleSaveManufacturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await saveManufacturer(token, {
        name: mfgForm.name,
        slug: mfgForm.slug || mfgForm.name.toLowerCase().replace(/\s+/g, "-"),
        website: mfgForm.website || undefined,
        logoUrl: mfgForm.logoUrl || undefined,
      });
      showStatus("success", `Manufacturer "${mfgForm.name}" saved successfully`);
      setMfgForm({ name: "", slug: "", website: "", logoUrl: "" });
      loadManufacturers();
    } catch (err: any) {
      showStatus("error", err.message);
    }
  };

  // Save Ingredient & Aliases
  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const aliases = ingForm.aliasesText
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      await saveIngredient(token, {
        name: ingForm.name,
        slug: ingForm.slug || ingForm.name.toLowerCase().replace(/\s+/g, "-"),
        description: ingForm.description || undefined,
        aliases,
      });

      showStatus("success", `Canonical ingredient "${ingForm.name}" & aliases saved`);
      setIngForm({ name: "", slug: "", description: "", aliasesText: "" });
      loadIngredients();
    } catch (err: any) {
      showStatus("error", err.message);
    }
  };

  // Save Company Profile
  const handleSaveCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !companyProfileForm.id) return;
    try {
      await updateCompanyProfile(token, companyProfileForm.id, {
        address: companyProfileForm.address,
        phone: companyProfileForm.phone,
        email: companyProfileForm.email,
        whatsapp: companyProfileForm.whatsapp || null,
        businessHours: companyProfileForm.businessHours,
        serviceAreas: companyProfileForm.serviceAreas,
        description: companyProfileForm.description,
      });
      showStatus("success", "Company profile updated successfully");
      loadOverview(token);
    } catch (err: any) {
      showStatus("error", err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xs text-slate-500 font-medium">Verifying administrator credentials...</div>
      </div>
    );
  }

  if (!currentUser) return null;

  const isSuper = currentUser.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-xs">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white h-16 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-black text-sm">
              L&amp;K
            </div>
            <span className="font-bold text-sm tracking-tight">L &amp; K Administration</span>
          </Link>

          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {isSuper ? "Super Administrator" : "Company Administrator"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="font-bold text-white text-xs">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400">{currentUser.email}</div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar + Tab Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-white rounded-2xl border border-slate-200 p-4 shrink-0 shadow-xs space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Portal Navigation
          </div>

          <button
            type="button"
            onClick={() => handleTabChange("overview")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-left ${
              activeTab === "overview"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview &amp; Stats</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("inquiries")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-left ${
              activeTab === "inquiries"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4" />
              <span>Incoming Inquiries</span>
            </div>
            {overviewData?.stats?.pendingInquiries > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {overviewData.stats.pendingInquiries}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("listings")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-left ${
              activeTab === "listings"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Company Catalog Listings</span>
          </button>

          {isSuper && (
            <button
              type="button"
              onClick={() => handleTabChange("products")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-left ${
                activeTab === "products"
                  ? "bg-slate-900 text-white font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Shared Products Master</span>
            </button>
          )}

          {isSuper && (
            <button
              type="button"
              onClick={() => handleTabChange("manufacturers")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-left ${
                activeTab === "manufacturers"
                  ? "bg-slate-900 text-white font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Manufacturers &amp; Logos</span>
            </button>
          )}

          {isSuper && (
            <button
              type="button"
              onClick={() => handleTabChange("ingredients")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-left ${
                activeTab === "ingredients"
                  ? "bg-slate-900 text-white font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>Ingredients &amp; Aliases</span>
            </button>
          )}

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <span>View Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2 ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="font-medium">{statusMessage.text}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: OVERVIEW                                             */}
          {/* ============================================================ */}
          {activeTab === "overview" && overviewData && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  System Overview
                </h2>
                <p className="text-slate-500">
                  Real-time status across L &amp; K pharmaceutical distribution network.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Master Formulations
                  </span>
                  <p className="text-3xl font-black text-slate-900">
                    {overviewData.stats.totalProducts}
                  </p>
                  <span className="text-[10px] text-slate-500">Structured products</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Manufacturers
                  </span>
                  <p className="text-3xl font-black text-slate-900">
                    {overviewData.stats.totalManufacturers}
                  </p>
                  <span className="text-[10px] text-slate-500">Authorized partners</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Canonical Ingredients
                  </span>
                  <p className="text-3xl font-black text-slate-900">
                    {overviewData.stats.totalIngredients}
                  </p>
                  <span className="text-[10px] text-slate-500">With search aliases</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pending Inquiries
                  </span>
                  <p className="text-3xl font-black text-amber-600">
                    {overviewData.stats.pendingInquiries}
                  </p>
                  <span className="text-[10px] text-slate-500">Awaiting review</span>
                </div>
              </div>

              {/* Companies Cards with Edit Trigger */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900">Configured Companies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overviewData.companies.map((c: any) => (
                    <div
                      key={c.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900">{c.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.slug === "lakshmi-pharma"
                              ? "bg-teal-50 text-teal-800"
                              : "bg-blue-50 text-blue-800"
                          }`}
                        >
                          {c.slug === "lakshmi-pharma" ? "Teal Theme" : "Blue Theme"}
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-600 text-xs">
                        <div className="flex items-center justify-between">
                          <span>Published Catalog Items:</span>
                          <span className="font-bold text-slate-900">
                            {c._count.companyProducts}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Pending Inquiries:</span>
                          <span className="font-bold text-amber-600">
                            {c._count.inquiries}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          href={`/${c.slug}`}
                          target="_blank"
                          className="text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Visit Live Portal &rarr;
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            loadCompanyProfile(c);
                            setActiveTab("company_profile");
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit Profile</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: INQUIRIES MANAGEMENT                                 */}
          {/* ============================================================ */}
          {activeTab === "inquiries" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Wholesale Inquiries
                  </h2>
                  <p className="text-slate-500">
                    Incoming B2B purchase requests, quote inquiries, and pharmacy orders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadInquiries}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold"
                >
                  Refresh
                </button>
              </div>

              {inquiries.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                  No inquiries recorded yet.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                        <th className="py-3 px-4">Date / Time</th>
                        <th className="py-3 px-4">Company</th>
                        <th className="py-3 px-4">Buyer / Pharmacy</th>
                        <th className="py-3 px-4">Referenced Product</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {inq.company.name}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{inq.businessName}</div>
                            <div className="text-[11px] text-slate-500">
                              {inq.name} • {inq.phone}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {inq.product ? (
                              <span className="font-semibold text-slate-800">
                                {inq.product.name} ({inq.product.packaging})
                              </span>
                            ) : (
                              <span className="text-slate-400">General Catalog Inquiry</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                inq.status === "PENDING"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : inq.status === "IN_REVIEW"
                                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                                  : inq.status === "RESPONDED"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {inq.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInquiry(inq);
                                setInquiryStatus(inq.status);
                                setInquiryNotes(inq.adminNotes || "");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                            >
                              Review &amp; Update
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Inquiry Edit Modal */}
              {selectedInquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="font-bold text-sm text-slate-900">
                        Inquiry Details: {selectedInquiry.businessName}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSelectedInquiry(null)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <strong>Buyer:</strong> {selectedInquiry.name} ({selectedInquiry.phone})
                      </div>
                      {selectedInquiry.email && (
                        <div>
                          <strong>Email:</strong> {selectedInquiry.email}
                        </div>
                      )}
                      <div>
                        <strong>Assigned Company:</strong> {selectedInquiry.company.name}
                      </div>
                      {selectedInquiry.product && (
                        <div>
                          <strong>Referenced Product:</strong> {selectedInquiry.product.name}
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-200/80">
                        <strong className="block text-slate-400 text-[10px] uppercase">
                          Message:
                        </strong>
                        <p className="text-slate-800 italic mt-0.5">{selectedInquiry.message}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 block">Status</label>
                        <select
                          value={inquiryStatus}
                          onChange={(e) => setInquiryStatus(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-900"
                        >
                          <option value="PENDING">PENDING (Awaiting Review)</option>
                          <option value="IN_REVIEW">IN_REVIEW (Stock Checking)</option>
                          <option value="RESPONDED">RESPONDED (Quote Sent)</option>
                          <option value="CLOSED">CLOSED (Fulfilled / Archived)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 block">
                          Internal Trade Notes
                        </label>
                        <textarea
                          rows={3}
                          value={inquiryNotes}
                          onChange={(e) => setInquiryNotes(e.target.value)}
                          placeholder="Batch verification, trade discount quoted, dispatch batch number..."
                          className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedInquiry(null)}
                        className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdateInquiry}
                        className="px-4 py-2 rounded-lg text-white bg-slate-900 hover:bg-slate-800 font-bold"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: COMPANY CATALOG LISTINGS TOGGLE                       */}
          {/* ============================================================ */}
          {activeTab === "listings" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Company Catalog Listings &amp; Scoping
                </h2>
                <p className="text-slate-500">
                  Control which shared formulations appear in Lakshmi Pharma vs. The Kothittil Pharma catalogs.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Manufacturer</th>
                      <th className="py-3 px-4">Structured Composition</th>
                      <th className="py-3 px-4 text-center">Lakshmi Pharma</th>
                      <th className="py-3 px-4 text-center">The Kothittil Pharma</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((prod) => {
                      const lakshmiListing = prod.companyProducts.find(
                        (cp: any) => cp.company.slug === "lakshmi-pharma"
                      );
                      const kothittilListing = prod.companyProducts.find(
                        (cp: any) => cp.company.slug === "kothittil-pharma"
                      );

                      const lakshmiCompany = overviewData?.companies?.find(
                        (c: any) => c.slug === "lakshmi-pharma"
                      );
                      const kothittilCompany = overviewData?.companies?.find(
                        (c: any) => c.slug === "kothittil-pharma"
                      );

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 align-top">
                            <div className="font-bold text-slate-900">{prod.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {prod.dosageForm} • {prod.packaging}
                            </div>
                          </td>
                          <td className="py-3 px-4 align-top font-semibold text-slate-700">
                            {prod.manufacturer.name}
                          </td>
                          <td className="py-3 px-4 align-top">
                            {prod.ingredients.map((i: any) => (
                              <span
                                key={i.id}
                                className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]"
                              >
                                {i.ingredient.name} {i.quantity} {i.unit}
                              </span>
                            ))}
                          </td>

                          {/* Lakshmi Column */}
                          <td className="py-3 px-4 align-top text-center">
                            {lakshmiCompany && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleListing(
                                    lakshmiCompany.id,
                                    prod.id,
                                    "isPublished",
                                    Boolean(lakshmiListing?.isPublished)
                                  )
                                }
                                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                  lakshmiListing?.isPublished
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
                                }`}
                              >
                                {lakshmiListing?.isPublished ? "Listed ✓" : "Unlisted ✗"}
                              </button>
                            )}
                          </td>

                          {/* Kothittil Column */}
                          <td className="py-3 px-4 align-top text-center">
                            {kothittilCompany && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleListing(
                                    kothittilCompany.id,
                                    prod.id,
                                    "isPublished",
                                    Boolean(kothittilListing?.isPublished)
                                  )
                                }
                                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                  kothittilListing?.isPublished
                                    ? "bg-blue-50 text-blue-800 border-blue-300"
                                    : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
                                }`}
                              >
                                {kothittilListing?.isPublished ? "Listed ✓" : "Unlisted ✗"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: MANUFACTURERS & LOGOS (Super Admin)                  */}
          {/* ============================================================ */}
          {activeTab === "manufacturers" && isSuper && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Manufacturers &amp; Authorized Logos
                </h2>
                <p className="text-slate-500">
                  Manage principal drug manufacturers. Only authorized logos and clean text fallbacks are supported (No product images).
                </p>
              </div>

              {/* Add / Edit Manufacturer Form */}
              <form
                onSubmit={handleSaveManufacturer}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
              >
                <h3 className="font-bold text-sm text-slate-900">
                  Add / Update Manufacturer
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Manufacturer Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={mfgForm.name}
                      onChange={(e) => setMfgForm({ ...mfgForm, name: e.target.value })}
                      placeholder="e.g. Cipla / Sun Pharma / Micro Labs"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      URL Slug (Optional)
                    </label>
                    <input
                      type="text"
                      value={mfgForm.slug}
                      onChange={(e) => setMfgForm({ ...mfgForm, slug: e.target.value })}
                      placeholder="e.g. cipla (auto-generated if empty)"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Authorized Website URL
                    </label>
                    <input
                      type="url"
                      value={mfgForm.website}
                      onChange={(e) => setMfgForm({ ...mfgForm, website: e.target.value })}
                      placeholder="https://www.cipla.com"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Authorized Logo SVG / Asset Path
                    </label>
                    <input
                      type="text"
                      value={mfgForm.logoUrl}
                      onChange={(e) => setMfgForm({ ...mfgForm, logoUrl: e.target.value })}
                      placeholder="/logos/cipla.svg (Leave empty for clean text fallback badge)"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-900 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  Save Manufacturer
                </button>
              </form>

              {/* Manufacturers List */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                      <th className="py-3 px-4">Display Name</th>
                      <th className="py-3 px-4">Authorized Logo Preview</th>
                      <th className="py-3 px-4">Products</th>
                      <th className="py-3 px-4">Website</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {manufacturers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{m.name}</td>
                        <td className="py-3 px-4">
                          <ManufacturerLogo name={m.name} logoUrl={m.logoUrl} size="sm" />
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {m._count?.products ?? 0} formulations
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {m.website ? (
                            <a
                              href={m.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {m.website}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setMfgForm({
                                name: m.name,
                                slug: m.slug,
                                website: m.website || "",
                                logoUrl: m.logoUrl || "",
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: INGREDIENTS & ALIASES (Super Admin)                  */}
          {/* ============================================================ */}
          {activeTab === "ingredients" && isSuper && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Canonical Ingredients &amp; Search Aliases
                </h2>
                <p className="text-slate-500">
                  Manage active drug substances and map synonyms/aliases (e.g. Paracetamol &lt;-&gt; Acetaminophen, APAP) for accurate search discovery.
                </p>
              </div>

              {/* Add / Edit Ingredient Form */}
              <form
                onSubmit={handleSaveIngredient}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
              >
                <h3 className="font-bold text-sm text-slate-900">
                  Add / Update Canonical Ingredient
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Canonical Substance Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ingForm.name}
                      onChange={(e) => setIngForm({ ...ingForm, name: e.target.value })}
                      placeholder="e.g. Paracetamol / Amoxicillin"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Search Aliases (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={ingForm.aliasesText}
                      onChange={(e) => setIngForm({ ...ingForm, aliasesText: e.target.value })}
                      placeholder="e.g. Acetaminophen, APAP, Paracetamolum"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Description / Pharmacological Category
                    </label>
                    <input
                      type="text"
                      value={ingForm.description}
                      onChange={(e) => setIngForm({ ...ingForm, description: e.target.value })}
                      placeholder="Analgesic and antipyretic agent..."
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  Save Ingredient &amp; Aliases
                </button>
              </form>

              {/* Ingredients List */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                      <th className="py-3 px-4">Canonical Ingredient</th>
                      <th className="py-3 px-4">Search Aliases / Synonyms</th>
                      <th className="py-3 px-4">Linked Formulations</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ingredients.map((ing) => (
                      <tr key={ing.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{ing.name}</div>
                          {ing.description && (
                            <div className="text-[10px] text-slate-500">{ing.description}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {ing.aliases?.map((a: any) => (
                              <span
                                key={a.id}
                                className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono"
                              >
                                {a.aliasName}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {ing._count?.productIngredients ?? 0}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setIngForm({
                                name: ing.name,
                                slug: ing.slug,
                                description: ing.description || "",
                                aliasesText: ing.aliases?.map((a: any) => a.aliasName).join(", ") || "",
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: EDIT COMPANY PROFILE                                 */}
          {/* ============================================================ */}
          {activeTab === "company_profile" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Edit Company Profile
                </h2>
                <p className="text-slate-500">
                  Update official business hours, phone numbers, warehouse address, and service areas.
                </p>
              </div>

              <form onSubmit={handleSaveCompanyProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Warehouse Address</label>
                    <input
                      type="text"
                      value={companyProfileForm.address}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, address: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Commercial Phone</label>
                    <input
                      type="text"
                      value={companyProfileForm.phone}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, phone: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Orders Email</label>
                    <input
                      type="email"
                      value={companyProfileForm.email}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, email: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">WhatsApp Number</label>
                    <input
                      type="text"
                      value={companyProfileForm.whatsapp}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, whatsapp: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 block">Operating Hours</label>
                    <input
                      type="text"
                      value={companyProfileForm.businessHours}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, businessHours: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Service Coverage Areas
                    </label>
                    <textarea
                      rows={2}
                      value={companyProfileForm.serviceAreas}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, serviceAreas: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Company Description
                    </label>
                    <textarea
                      rows={3}
                      value={companyProfileForm.description}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, description: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                  >
                    Save Profile Updates
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Back to Overview
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
