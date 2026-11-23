"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  ShieldCheck,
  Save,
  Check,
  X,
  ExternalLink,
  Search,
  Filter,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Trash2,
  Tag,
  Loader2,
} from "lucide-react";
import { AuthUser, Inquiry } from "@/types";
import {
  fetchMe,
  fetchAdminOverview,
  fetchAdminInquiries,
  updateInquiryStatus,
  fetchAdminProducts,
  updateAdminProduct,
  deleteAdminProduct,
  toggleCompanyProductListing,
  fetchAdminManufacturers,
  fetchAdminCompanyManufacturers,
  toggleCompanyManufacturerAuthorization,
  saveManufacturer,
  fetchAdminIngredients,
  saveIngredient,
  updateCompanyProfile,
} from "@/lib/api";
import { ManufacturerLogo } from "@/components/common/ManufacturerLogo";

type AdminTab =
  | "overview"
  | "inquiries"
  | "brand_matrix"
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
  const [companyManufacturers, setCompanyManufacturers] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);

  // Product Search, Filter & Server Pagination
  const [productSearch, setProductSearch] = useState("");
  const [productDosageFilter, setProductDosageFilter] = useState("ALL");
  const [productPage, setProductPage] = useState(1);
  const [productLimit, setProductLimit] = useState(25);
  const [productPagination, setProductPagination] = useState({ total: 0, totalPages: 1 });
  const [productsLoading, setProductsLoading] = useState(false);

  // Content & Action Loading States
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);
  const [savingCompanyProfile, setSavingCompanyProfile] = useState(false);
  const [updatingInquiry, setUpdatingInquiry] = useState(false);
  const [savingMfg, setSavingMfg] = useState(false);
  const [savingIngredient, setSavingIngredient] = useState(false);

  // Selected Inquiry for Modal / Edit
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inquiryStatus, setInquiryStatus] = useState<string>("PENDING");
  const [inquiryNotes, setInquiryNotes] = useState<string>("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>("ALL");
  const [inquirySearch, setInquirySearch] = useState<string>("");

  // Product Edit Modal State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    dosageForm: "",
    packaging: "",
    schedule: "",
    storageConditions: "",
    description: "",
    manufacturerId: "",
    itemCode: "",
    distributorNotes: "",
    companyId: "",
  });
  const [savingProduct, setSavingProduct] = useState(false);

  // Edit Company Profile Form State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [companyProfileForm, setCompanyProfileForm] = useState({
    id: "",
    name: "",
    tagline: "",
    address: "",
    phone: "",
    email: "",
    whatsapp: "",
    businessHours: "",
    serviceAreas: "",
    description: "",
    drugLicenseNo: "",
    gstin: "",
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
    setOverviewLoading(true);
    try {
      const data = await fetchAdminOverview(authToken);
      setOverviewData(data);
      if (data.companies && data.companies.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data.companies[0].id);
        loadCompanyProfile(data.companies[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOverviewLoading(false);
    }
  };

  // Load Inquiries
  const loadInquiries = async () => {
    if (!token) return;
    setInquiriesLoading(true);
    try {
      const res = await fetchAdminInquiries(token);
      setInquiries(res.data);
    } catch (err: any) {
      showStatus("error", err.message);
    } finally {
      setInquiriesLoading(false);
    }
  };

  // Load Products (With Server Pagination & Filtering)
  const loadProducts = async (
    page = productPage,
    search = productSearch,
    dosage = productDosageFilter,
    limit = productLimit
  ) => {
    if (!token) return;
    setProductsLoading(true);
    try {
      const res = await fetchAdminProducts(token, {
        page,
        limit,
        q: search.trim() || undefined,
        dosageForm: dosage !== "ALL" ? dosage : undefined,
      });
      setProducts(res.data);
      if (res.pagination) {
        setProductPagination({
          total: res.pagination.total,
          totalPages: res.pagination.totalPages,
        });
      }
    } catch (err: any) {
      showStatus("error", err.message);
    } finally {
      setProductsLoading(false);
    }
  };

  // Load Manufacturers & Company Brand Authorizations
  const loadManufacturers = async () => {
    if (!token) return;
    setBrandsLoading(true);
    try {
      const [mfgData, cmData] = await Promise.all([
        fetchAdminManufacturers(token),
        fetchAdminCompanyManufacturers(token),
      ]);
      setManufacturers(mfgData);
      setCompanyManufacturers(cmData);
    } catch (err: any) {
      showStatus("error", err.message);
    } finally {
      setBrandsLoading(false);
    }
  };

  // Load Ingredients
  const loadIngredients = async () => {
    if (!token) return;
    setIngredientsLoading(true);
    try {
      const data = await fetchAdminIngredients(token);
      setIngredients(data);
    } catch (err: any) {
      showStatus("error", err.message);
    } finally {
      setIngredientsLoading(false);
    }
  };

  // Load Company Profile for Edit
  const loadCompanyProfile = (company: any) => {
    setSelectedCompanyId(company.id);
    setCompanyProfileForm({
      id: company.id,
      name: company.name || "",
      tagline: company.tagline || "",
      address: company.address || "",
      phone: company.phone || "",
      email: company.email || "",
      whatsapp: company.whatsapp || "",
      businessHours: company.businessHours || "",
      serviceAreas: company.serviceAreas || "",
      description: company.description || "",
      drugLicenseNo: company.drugLicenseNo || "",
      gstin: company.gstin || "",
    });
  };

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 6000);
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
    if (tab === "products") loadProducts();
    if (tab === "brand_matrix") loadManufacturers();
    if (tab === "manufacturers") loadManufacturers();
    if (tab === "ingredients") loadIngredients();
  };

  // Inquiry Update
  const handleUpdateInquiry = async () => {
    if (!token || !selectedInquiry) return;
    setUpdatingInquiry(true);
    try {
      await updateInquiryStatus(token, selectedInquiry.id, inquiryStatus, inquiryNotes);
      showStatus("success", "Inquiry updated successfully");
      setSelectedInquiry(null);
      loadInquiries();
    } catch (err: any) {
      showStatus("error", err.message);
    } finally {
      setUpdatingInquiry(false);
    }
  };

  // Toggle Brand Authorization for a Distributor Company
  const handleToggleBrandAuth = async (companyId: string, manufacturerId: string, currentAuthorized: boolean) => {
    if (!token) return;
    const key = `auth:${companyId}:${manufacturerId}`;
    setActionLoadingKey(key);
    try {
      const res = await toggleCompanyManufacturerAuthorization(token, {
        companyId,
        manufacturerId,
        isAuthorized: !currentAuthorized,
      });
      showStatus("success", res.message || "Brand authorization updated");
      await loadManufacturers();
      if (token) loadOverview(token);
    } catch (err: any) {
      showStatus("error", err.message);
    } finally {
      setActionLoadingKey(null);
    }
  };

  // Open Product Edit Modal
  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod);
    const lakshmiListing = prod.companyProducts?.find((cp: any) => cp.company?.slug === "lakshmi-pharma");
    const kothittilListing = prod.companyProducts?.find((cp: any) => cp.company?.slug === "kothittil-pharma" || cp.company?.slug === "kothottil-pharma");
    const defaultListing = lakshmiListing || kothittilListing || prod.companyProducts?.[0];

    setProductForm({
      name: prod.name,
      slug: prod.slug,
      dosageForm: prod.dosageForm,
      packaging: prod.packaging,
      schedule: prod.schedule || "Schedule H Prescription Drug",
      storageConditions: prod.storageConditions || "Store below 25°C in a dry place. Protect from light.",
      description: prod.description || "",
      manufacturerId: prod.manufacturerId,
      itemCode: defaultListing?.itemCode || "",
      distributorNotes: defaultListing?.distributorNotes || "",
      companyId: defaultListing?.companyId || "",
    });
  };

  // Save Product Changes
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingProduct) return;
    setSavingProduct(true);
    try {
      await updateAdminProduct(token, editingProduct.id, {
        name: productForm.name,
        dosageForm: productForm.dosageForm,
        packaging: productForm.packaging,
        schedule: productForm.schedule || null,
        storageConditions: productForm.storageConditions || null,
        description: productForm.description || null,
        manufacturerId: productForm.manufacturerId,
        itemCode: productForm.itemCode || null,
        distributorNotes: productForm.distributorNotes || null,
        companyId: productForm.companyId || undefined,
      });

      showStatus("success", `Product "${productForm.name}" updated successfully`);
      setEditingProduct(null);
      loadProducts();
    } catch (err: any) {
      showStatus("error", err.message);
    } finally {
      setSavingProduct(false);
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
    const key = `listing:${companyId}:${productId}:${field}`;
    setActionLoadingKey(key);
    try {
      await toggleCompanyProductListing(token, {
        companyId,
        productId,
        [field]: !currentVal,
      });
      showStatus("success", "Catalog status updated");
      await loadProducts(productPage, productSearch, productDosageFilter, productLimit);
    } catch (err: any) {
      showStatus("error", err.message);
    } finally {
      setActionLoadingKey(null);
    }
  };

  // Save Manufacturer
  const handleSaveManufacturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingMfg(true);
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
    } finally {
      setSavingMfg(false);
    }
  };

  // Save Ingredient & Aliases
  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingIngredient(true);
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
    } finally {
      setSavingIngredient(false);
    }
  };

  // Save Company Profile
  const handleSaveCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !companyProfileForm.id) return;
    setSavingCompanyProfile(true);
    try {
      await updateCompanyProfile(token, companyProfileForm.id, {
        address: companyProfileForm.address,
        phone: companyProfileForm.phone,
        email: companyProfileForm.email,
        whatsapp: companyProfileForm.whatsapp || null,
        businessHours: companyProfileForm.businessHours,
        serviceAreas: companyProfileForm.serviceAreas,
        description: companyProfileForm.description,
        drugLicenseNo: companyProfileForm.drugLicenseNo || null,
        gstin: companyProfileForm.gstin || null,
        tagline: companyProfileForm.tagline || null,
      });
      showStatus("success", "Company profile updated successfully");
      loadOverview(token);
    } catch (err: any) {
      showStatus("error", err.message);
    } finally {
      setSavingCompanyProfile(false);
    }
  };

  // Debounced server search & filter for products
  useEffect(() => {
    if (activeTab !== "products" || !token) return;
    const timer = setTimeout(() => {
      setProductPage(1);
      loadProducts(1, productSearch, productDosageFilter, productLimit);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch, productDosageFilter, activeTab, productLimit]);

  // Products are filtered and paginated on PostgreSQL server-side
  const filteredProducts = products;

  // Filtered Inquiries Memo
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchStatus = inquiryStatusFilter === "ALL" || inq.status === inquiryStatusFilter;
      const matchSearch =
        !inquirySearch ||
        inq.businessName?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        inq.name?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        inq.phone?.includes(inquirySearch) ||
        inq.product?.name?.toLowerCase().includes(inquirySearch.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [inquiries, inquiryStatusFilter, inquirySearch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center animate-pulse mb-4 text-teal-400">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold">Verifying Administration Access</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to distributor node...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  const isSuper = currentUser.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-xs">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white h-16 border-b border-slate-800 flex items-center justify-between px-3.5 sm:px-6 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <Link href="/" className="flex items-center gap-2 text-white shrink-0">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-black text-sm">
              L&amp;K
            </div>
            <span className="font-bold text-sm tracking-tight truncate">L &amp; K Admin</span>
          </Link>

          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 truncate">
            {isSuper ? "Super Administrator" : "Company Administrator"}
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <div className="text-right hidden md:block">
            <div className="font-bold text-white text-xs">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400">{currentUser.email}</div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Tabs Pill Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 touch-pan-x sticky top-0 z-20 shadow-xs">
        <button
          type="button"
          onClick={() => handleTabChange("overview")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeTab === "overview" ? "bg-slate-900 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Overview</span>
          {overviewLoading && <Loader2 className="w-3 h-3 animate-spin text-teal-400" />}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("brand_matrix")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeTab === "brand_matrix" ? "bg-slate-900 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Brand Scope</span>
          {brandsLoading && <Loader2 className="w-3 h-3 animate-spin text-teal-400" />}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("products")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeTab === "products" ? "bg-slate-900 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Products</span>
          {productsLoading && <Loader2 className="w-3 h-3 animate-spin text-teal-400" />}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("inquiries")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeTab === "inquiries" ? "bg-slate-900 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Inquiries</span>
          {inquiriesLoading && <Loader2 className="w-3 h-3 animate-spin text-teal-400" />}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("company_profile")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            activeTab === "company_profile" ? "bg-slate-900 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Profiles</span>
          {savingCompanyProfile && <Loader2 className="w-3 h-3 animate-spin text-teal-400" />}
        </button>

        {isSuper && (
          <>
            <button
              type="button"
              onClick={() => handleTabChange("manufacturers")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                activeTab === "manufacturers" ? "bg-slate-900 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Manufacturers</span>
              {brandsLoading && <Loader2 className="w-3 h-3 animate-spin text-teal-400" />}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("ingredients")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                activeTab === "ingredients" ? "bg-slate-900 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Ingredients</span>
              {ingredientsLoading && <Loader2 className="w-3 h-3 animate-spin text-teal-400" />}
            </button>
          </>
        )}
      </div>

      {/* Main Body with Sidebar + Tab Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-3 sm:p-6 gap-4 sm:gap-6 min-w-0">
        {/* Desktop Sidebar Nav */}
        <aside className="hidden md:block w-64 bg-white rounded-2xl border border-slate-200 p-4 shrink-0 shadow-xs space-y-1 self-start sticky top-6">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Distributor Management
          </div>

          <button
            type="button"
            onClick={() => handleTabChange("overview")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-left ${
              activeTab === "overview"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview &amp; Stats</span>
            </div>
            {overviewLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400 shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("brand_matrix")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-left ${
              activeTab === "brand_matrix"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Brand Authorization</span>
            </div>
            {brandsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400 shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("products")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-left ${
              activeTab === "products"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Products &amp; Catalog</span>
            </div>
            <div className="flex items-center gap-1.5">
              {productsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400 shrink-0" />}
              {overviewData?.stats?.totalProducts > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                  {overviewData.stats.totalProducts}
                </span>
              )}
            </div>
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
              <span>Wholesale Inquiries</span>
            </div>
            <div className="flex items-center gap-1.5">
              {inquiriesLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400 shrink-0" />}
              {overviewData?.stats?.pendingInquiries > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {overviewData.stats.pendingInquiries}
                </span>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("company_profile")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-left ${
              activeTab === "company_profile"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4" />
              <span>Company Profiles</span>
            </div>
            {savingCompanyProfile && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400 shrink-0" />}
          </button>

          {isSuper && (
            <>
              <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Principal Configuration
              </div>

              <button
                type="button"
                onClick={() => handleTabChange("manufacturers")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-left ${
                  activeTab === "manufacturers"
                    ? "bg-slate-900 text-white font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4" />
                  <span>Manufacturers &amp; Logos</span>
                </div>
                {brandsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("ingredients")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-left ${
                  activeTab === "ingredients"
                    ? "bg-slate-900 text-white font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FlaskConical className="w-4 h-4" />
                  <span>Active Ingredients</span>
                </div>
                {ingredientsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400 shrink-0" />}
              </button>
            </>
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
        <main className="flex-1 space-y-4 sm:space-y-6 min-w-0">
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
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span className="font-semibold">{statusMessage.text}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: OVERVIEW & STATS                                      */}
          {/* ============================================================ */}
          {activeTab === "overview" && (
            overviewLoading || !overviewData ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-80 bg-slate-100 rounded-md animate-pulse" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading distribution metrics...</span>
                  </div>
                </div>

                {/* 4 KPI Skeletons */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 animate-pulse">
                      <div className="h-3 w-28 bg-slate-200 rounded" />
                      <div className="h-8 w-16 bg-slate-300 rounded-lg" />
                      <div className="h-2.5 w-24 bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>

                {/* Quick Actions Skeleton */}
                <div className="bg-slate-800 rounded-2xl p-6 text-white space-y-3 animate-pulse">
                  <div className="h-4 w-52 bg-slate-700 rounded" />
                  <div className="h-3 w-3/4 bg-slate-700/60 rounded" />
                </div>

                {/* 2 Distributor Company Skeletons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200" />
                        <div className="space-y-2">
                          <div className="h-4 w-36 bg-slate-200 rounded" />
                          <div className="h-3 w-20 bg-slate-100 rounded" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                          <div className="h-2.5 w-20 bg-slate-200 rounded" />
                          <div className="h-6 w-12 bg-slate-300 rounded" />
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                          <div className="h-2.5 w-20 bg-slate-200 rounded" />
                          <div className="h-6 w-12 bg-slate-300 rounded" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <div className="flex-1 h-9 rounded-xl bg-slate-100" />
                        <div className="flex-1 h-9 rounded-xl bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Commercial Overview</span>
                    {overviewLoading && <Loader2 className="w-4 h-4 animate-spin text-teal-600" />}
                  </h2>
                  <p className="text-slate-500">
                    Real-time status across Lakshmi Pharma and The Kothittil Pharmaceutical Distributor.
                  </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="text-slate-500 font-semibold mb-1 text-[11px] sm:text-xs">Catalog Formulations</div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">
                      {overviewData.stats.totalProducts}
                    </div>
                    <div className="text-[10px] text-teal-600 font-semibold mt-1">
                      Rhine Life Sciences
                    </div>
                  </div>

                  <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="text-slate-500 font-semibold mb-1 text-[11px] sm:text-xs">Pending Inquiries</div>
                    <div className="text-xl sm:text-2xl font-black text-amber-600">
                      {overviewData.stats.pendingInquiries}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Awaiting quotation review</div>
                  </div>

                  <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="text-slate-500 font-semibold mb-1 text-[11px] sm:text-xs">Authorized Brands</div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">
                      {overviewData.stats.totalManufacturers}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Configured per firm</div>
                  </div>

                  <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="text-slate-500 font-semibold mb-1 text-[11px] sm:text-xs">Active APIs</div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">
                      {overviewData.stats.totalIngredients}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Canonical compositions</div>
                  </div>
                </div>

                {/* Quick Actions / Configuration Card */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 sm:p-6 text-white space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm text-teal-300 uppercase tracking-wider">
                        Distributor Brand Scope Control
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Configure which brands appear on each distributor firm. Deauthorizing a brand immediately hides all its formulations and composition search results from that company.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTabChange("brand_matrix")}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shrink-0 self-start sm:self-auto"
                    >
                      Configure Brand Scope
                    </button>
                  </div>
                </div>

                {/* Distribution Firms Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {overviewData.companies?.map((company: any) => (
                    <div
                      key={company.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-xs"
                            style={{ backgroundColor: company.accentColor }}
                          >
                            {company.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-900">{company.name}</h3>
                            <div className="text-slate-400 text-[11px]">/{company.slug}</div>
                          </div>
                        </div>
                        <Link
                          href={`/${company.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="text-slate-400 text-[10px] uppercase font-semibold">
                            Published Products
                          </div>
                          <div className="text-lg font-bold text-slate-900 mt-0.5">
                            {company._count.companyProducts}
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="text-slate-400 text-[10px] uppercase font-semibold">
                            Pending Quotes
                          </div>
                          <div className="text-lg font-bold text-amber-600 mt-0.5">
                            {company._count.inquiries}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            loadCompanyProfile(company);
                            setActiveTab("company_profile");
                          }}
                          className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 text-center transition-colors"
                        >
                          Edit Profile &amp; Contact
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTabChange("products")}
                          className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-white text-center transition-colors"
                        >
                          Manage Catalog
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* ============================================================ */}
          {/* TAB 2: BRAND AUTHORIZATION BY FIRM (Admin Config)            */}
          {/* ============================================================ */}
          {activeTab === "brand_matrix" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-teal-600" />
                    <span>Distributor Brand Authorization &amp; Scope</span>
                    {brandsLoading && <Loader2 className="w-4 h-4 animate-spin text-teal-600 ml-1" />}
                  </h2>
                  <p className="text-slate-500 mt-1">
                    Configure which distribution firm carries each pharmaceutical brand. When a brand is disabled for a company, its products are immediately hidden from that firm&apos;s catalog, brand listings, and composition searches.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={brandsLoading}
                  onClick={loadManufacturers}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  {brandsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />}
                  <span>{brandsLoading ? "Refreshing..." : "Refresh Scope"}</span>
                </button>
              </div>

              {/* Informational Guidance Alert */}
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3 text-teal-900">
                <AlertCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-xs">Strict Search &amp; Catalog Isolation</div>
                  <div className="text-[11px] text-teal-800 leading-relaxed">
                    Example: If <strong>Rhine Life Sciences</strong> is disabled for <strong>Lakshmi Pharma</strong>, searching for active compositions like <em>&quot;Bisoprolol&quot;</em> or <em>&quot;Paracetamol&quot;</em> on Lakshmi Pharma will strictly return <strong>zero Rhine products</strong>. On The Kothittil Pharma (where Rhine is enabled), those products will continue to be found.
                  </div>
                </div>
              </div>

              {/* Brand Authorization Cards */}
              <div className="space-y-4">
                {brandsLoading && manufacturers.length === 0 ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden animate-pulse"
                      >
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-28 bg-slate-200 rounded-xl" />
                            <div className="space-y-2">
                              <div className="h-4 w-44 bg-slate-200 rounded" />
                              <div className="h-3 w-28 bg-slate-100 rounded" />
                            </div>
                          </div>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="h-4 w-32 bg-slate-200 rounded" />
                              <div className="h-5 w-24 bg-slate-200 rounded-full" />
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded" />
                            <div className="h-8 w-36 bg-slate-200 rounded-xl mt-3" />
                          </div>
                          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="h-4 w-32 bg-slate-200 rounded" />
                              <div className="h-5 w-24 bg-slate-200 rounded-full" />
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded" />
                            <div className="h-8 w-36 bg-slate-200 rounded-xl mt-3" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : manufacturers.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                    No manufacturers loaded.
                  </div>
                ) : (
                  manufacturers.map((mfg) => {
                    const lakshmiCompany = overviewData?.companies?.find(
                      (c: any) => c.slug === "lakshmi-pharma"
                    );
                    const kothittilCompany = overviewData?.companies?.find(
                      (c: any) => c.slug === "kothittil-pharma" || c.slug === "kothottil-pharma"
                    );

                    // Find authorization records
                    const lakshmiCm = companyManufacturers.find(
                      (cm: any) =>
                        cm.companyId === lakshmiCompany?.id && cm.manufacturerId === mfg.id
                    );
                    const kothittilCm = companyManufacturers.find(
                      (cm: any) =>
                        cm.companyId === kothittilCompany?.id && cm.manufacturerId === mfg.id
                    );

                    const isLakshmiAuth = lakshmiCm ? lakshmiCm.isAuthorized : true;
                    const isKothittilAuth = kothittilCm ? kothittilCm.isAuthorized : true;

                    const isLakshmiUpdating = lakshmiCompany && actionLoadingKey === `auth:${lakshmiCompany.id}:${mfg.id}`;
                    const isKothittilUpdating = kothittilCompany && actionLoadingKey === `auth:${kothittilCompany.id}:${mfg.id}`;

                    return (
                      <div
                        key={mfg.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
                      >
                        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <ManufacturerLogo
                              logoUrl={mfg.logoUrl}
                              name={mfg.name}
                              className="h-10 px-3 bg-white border border-slate-200 rounded-xl"
                            />
                            <div>
                              <h3 className="font-bold text-sm text-slate-900">{mfg.name}</h3>
                              <div className="text-[11px] text-slate-500">
                                {mfg._count?.products || 43} Shared Formulations • {mfg.slug}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {mfg.website && (
                              <a
                                href={mfg.website}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] text-slate-600 font-medium"
                              >
                                <span>Official Website</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Distributor Authorization Switches */}
                        <div className="p-3.5 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {/* Lakshmi Pharma Configuration Card */}
                          {lakshmiCompany && (
                            <div
                              className={`p-4 rounded-xl border transition-all ${
                                isLakshmiAuth
                                  ? "bg-emerald-50/40 border-emerald-200"
                                  : "bg-slate-50 border-slate-200 opacity-80"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: lakshmiCompany.accentColor }}
                                  />
                                  <span className="font-bold text-slate-900">
                                    {lakshmiCompany.name}
                                  </span>
                                </div>

                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isLakshmiAuth
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {isLakshmiAuth ? "Catalog Enabled ✓" : "Hidden from Firm ✗"}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-500 mt-2">
                                {isLakshmiAuth
                                  ? "Products and composition search results are currently active on Lakshmi Pharma."
                                  : "Rhine formulations and composition search matches are strictly HIDDEN on Lakshmi Pharma."}
                              </p>

                              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-700">
                                  Distribution Status:
                                </span>
                                <button
                                  type="button"
                                  disabled={Boolean(isLakshmiUpdating)}
                                  onClick={() =>
                                    handleToggleBrandAuth(lakshmiCompany.id, mfg.id, isLakshmiAuth)
                                  }
                                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed ${
                                    isLakshmiAuth
                                      ? "bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100"
                                      : "bg-emerald-600 text-white hover:bg-emerald-500"
                                  }`}
                                >
                                  {isLakshmiUpdating ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>Updating Scope...</span>
                                    </>
                                  ) : isLakshmiAuth ? (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5" />
                                      <span>Disable for Lakshmi</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Enable for Lakshmi</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Kothittil Pharma Configuration Card */}
                          {kothittilCompany && (
                            <div
                              className={`p-4 rounded-xl border transition-all ${
                                isKothittilAuth
                                  ? "bg-blue-50/40 border-blue-200"
                                  : "bg-slate-50 border-slate-200 opacity-80"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: kothittilCompany.accentColor }}
                                  />
                                  <span className="font-bold text-slate-900">
                                    {kothittilCompany.name}
                                  </span>
                                </div>

                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isKothittilAuth
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {isKothittilAuth ? "Catalog Enabled ✓" : "Hidden from Firm ✗"}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-500 mt-2">
                                {isKothittilAuth
                                  ? "Products and composition search results are currently active on Kothittil Pharma."
                                  : "Rhine formulations and composition search matches are strictly HIDDEN on Kothittil Pharma."}
                              </p>

                              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-700">
                                  Distribution Status:
                                </span>
                                <button
                                  type="button"
                                  disabled={Boolean(isKothittilUpdating)}
                                  onClick={() =>
                                    handleToggleBrandAuth(
                                      kothittilCompany.id,
                                      mfg.id,
                                      isKothittilAuth
                                    )
                                  }
                                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed ${
                                    isKothittilAuth
                                      ? "bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100"
                                      : "bg-blue-600 text-white hover:bg-blue-500"
                                  }`}
                                >
                                  {isKothittilUpdating ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>Updating Scope...</span>
                                    </>
                                  ) : isKothittilAuth ? (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5" />
                                      <span>Disable for Kothittil</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Enable for Kothittil</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: PRODUCTS & CATALOG MANAGEMENT (With Product Edit)    */}
          {/* ============================================================ */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Product Formulations &amp; Scoping
                  </h2>
                  <p className="text-slate-500">
                    View, search, edit product master records, and manage company catalog listings.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={productsLoading}
                    onClick={() => loadProducts(productPage, productSearch, productDosageFilter, productLimit)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    {productsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />}
                    <span>{productsLoading ? "Refreshing..." : "Refresh List"}</span>
                  </button>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by product name, dosage form, packaging, active ingredient..."
                    className="w-full h-10 sm:h-9 pl-9 pr-8 rounded-lg border border-slate-200 text-base sm:text-xs text-slate-900 placeholder:text-slate-400"
                  />
                  {productSearch && (
                    <button
                      type="button"
                      onClick={() => setProductSearch("")}
                      className="absolute right-3 top-3 sm:top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-500 font-semibold">Dosage:</span>
                  <select
                    value={productDosageFilter}
                    onChange={(e) => setProductDosageFilter(e.target.value)}
                    className="h-10 sm:h-9 px-3 rounded-lg border border-slate-200 text-base sm:text-xs text-slate-800 bg-white flex-1 sm:flex-initial"
                  >
                    <option value="ALL">All Dosage Forms</option>
                    <option value="Tablet">Tablets</option>
                    <option value="Capsule">Capsules</option>
                    <option value="Syrup">Syrups</option>
                    <option value="Suspension">Suspensions</option>
                    <option value="Injection">Injections</option>
                    <option value="Ointment">Ointments / Gels</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-2xs relative">
                {/* Active Loading Overlay during pagination / debounced search */}
                {productsLoading && filteredProducts.length > 0 && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10 transition-opacity">
                    <div className="px-4 py-2.5 rounded-xl bg-slate-900 text-white flex items-center gap-2.5 shadow-lg border border-slate-800">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                      <span className="font-semibold text-xs">Updating catalog formulations...</span>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto touch-pan-x min-h-[300px]">
                  <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                        <th className="py-3 px-3 sm:px-4 min-w-[180px]">Product Name &amp; Pack</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[130px]">Brand / Manufacturer</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[160px]">Composition</th>
                        <th className="py-3 px-3 sm:px-4 text-center min-w-[110px]">Lakshmi Pharma</th>
                        <th className="py-3 px-3 sm:px-4 text-center min-w-[110px]">The Kothittil</th>
                        <th className="py-3 px-3 sm:px-4 text-right min-w-[80px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productsLoading && filteredProducts.length === 0 ? (
                        Array.from({ length: 8 }).map((_, idx) => (
                          <tr key={idx} className="animate-pulse">
                            <td className="py-3.5 px-4">
                              <div className="h-4 w-44 bg-slate-200 rounded mb-1.5" />
                              <div className="h-3 w-28 bg-slate-100 rounded" />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="h-4 w-32 bg-slate-200 rounded" />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex gap-1.5">
                                <div className="h-4 w-16 bg-slate-200 rounded" />
                                <div className="h-4 w-16 bg-slate-200 rounded" />
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="h-6 w-16 bg-slate-200 rounded-full mx-auto" />
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="h-6 w-16 bg-slate-200 rounded-full mx-auto" />
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="h-6 w-12 bg-slate-200 rounded ml-auto" />
                            </td>
                          </tr>
                        ))
                      ) : filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No products match your search query.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((prod) => {
                          const lakshmiListing = prod.companyProducts?.find(
                            (cp: any) => cp.company?.slug === "lakshmi-pharma"
                          );
                          const kothittilListing = prod.companyProducts?.find(
                            (cp: any) => cp.company?.slug === "kothittil-pharma" || cp.company?.slug === "kothottil-pharma"
                          );

                          const lakshmiCompany = overviewData?.companies?.find(
                            (c: any) => c.slug === "lakshmi-pharma"
                          );
                          const kothittilCompany = overviewData?.companies?.find(
                            (c: any) => c.slug === "kothittil-pharma" || c.slug === "kothottil-pharma"
                          );

                          const isLakshmiListingUpdating =
                            lakshmiCompany &&
                            actionLoadingKey === `listing:${lakshmiCompany.id}:${prod.id}:isPublished`;
                          const isKothittilListingUpdating =
                            kothittilCompany &&
                            actionLoadingKey === `listing:${kothittilCompany.id}:${prod.id}:isPublished`;

                          return (
                            <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 align-top">
                                <div className="font-bold text-slate-900">{prod.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {prod.dosageForm} • {prod.packaging}
                                </div>
                                {prod.schedule && (
                                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-rose-50 text-rose-700 border border-rose-200">
                                    {prod.schedule}
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 align-top font-semibold text-slate-700">
                                {prod.manufacturer?.name}
                              </td>

                              <td className="py-3 px-4 align-top">
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {prod.ingredients?.map((i: any) => (
                                    <span
                                      key={i.id}
                                      className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]"
                                    >
                                      {i.ingredient?.name} {i.quantity} {i.unit}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              {/* Lakshmi Listing Toggle */}
                              <td className="py-3 px-4 align-top text-center">
                                {lakshmiCompany && (
                                  <button
                                    type="button"
                                    disabled={Boolean(isLakshmiListingUpdating)}
                                    onClick={() =>
                                      handleToggleListing(
                                        lakshmiCompany.id,
                                        prod.id,
                                        "isPublished",
                                        Boolean(lakshmiListing?.isPublished)
                                      )
                                    }
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors inline-flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed ${
                                      lakshmiListing?.isPublished
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                        : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
                                    }`}
                                  >
                                    {isLakshmiListingUpdating && (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    )}
                                    <span>{lakshmiListing?.isPublished ? "Listed ✓" : "Unlisted ✗"}</span>
                                  </button>
                                )}
                              </td>

                              {/* Kothittil Listing Toggle */}
                              <td className="py-3 px-4 align-top text-center">
                                {kothittilCompany && (
                                  <button
                                    type="button"
                                    disabled={Boolean(isKothittilListingUpdating)}
                                    onClick={() =>
                                      handleToggleListing(
                                        kothittilCompany.id,
                                        prod.id,
                                        "isPublished",
                                        Boolean(kothittilListing?.isPublished)
                                      )
                                    }
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors inline-flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed ${
                                      kothittilListing?.isPublished
                                        ? "bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100"
                                        : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
                                    }`}
                                  >
                                    {isKothittilListingUpdating && (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    )}
                                    <span>{kothittilListing?.isPublished ? "Listed ✓" : "Unlisted ✗"}</span>
                                  </button>
                                )}
                              </td>

                              {/* Actions Column */}
                              <td className="py-3 px-4 align-top text-right">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold shadow-2xs transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Server-Side Pagination Bar */}
                <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                    <span className="text-[11px] sm:text-xs">
                      Showing {productPagination.total === 0 ? 0 : (productPage - 1) * productLimit + 1} to{" "}
                      {Math.min(productPage * productLimit, productPagination.total)} of{" "}
                      <strong className="text-slate-900">{productPagination.total}</strong> products
                    </span>
                    <select
                      value={productLimit}
                      onChange={(e) => {
                        const newLimit = parseInt(e.target.value, 10);
                        setProductLimit(newLimit);
                        setProductPage(1);
                        loadProducts(1, productSearch, productDosageFilter, newLimit);
                      }}
                      className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                    >
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={100}>100 / page</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={productPage <= 1 || productsLoading}
                      onClick={() => {
                        const newP = productPage - 1;
                        setProductPage(newP);
                        loadProducts(newP, productSearch, productDosageFilter, productLimit);
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-center"
                    >
                      Previous
                    </button>

                    <span className="px-2 font-semibold text-slate-700 text-[11px] sm:text-xs shrink-0">
                      Page {productPage} / {productPagination.totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={productPage >= productPagination.totalPages || productsLoading}
                      onClick={() => {
                        const newP = productPage + 1;
                        setProductPage(newP);
                        loadProducts(newP, productSearch, productDosageFilter, productLimit);
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-center"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* PRODUCT EDIT MODAL                                           */}
              {/* ============================================================ */}
              {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
                  <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 shadow-xl border border-slate-200 max-h-[92vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          Edit Formulation: {editingProduct.name}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Update product master details, dosage form, packaging, and regulatory schedule.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      >
                        <X className="w-5 h-5 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 block">
                            Brand / Product Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={productForm.name}
                            onChange={(e) =>
                              setProductForm({ ...productForm, name: e.target.value })
                            }
                            className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900 font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 block">
                            Dosage Form <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={productForm.dosageForm}
                            onChange={(e) =>
                              setProductForm({ ...productForm, dosageForm: e.target.value })
                            }
                            placeholder="Tablet / Capsule / Syrup / Injection"
                            className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 block">
                            Commercial Packaging <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={productForm.packaging}
                            onChange={(e) =>
                              setProductForm({ ...productForm, packaging: e.target.value })
                            }
                            placeholder="e.g. 10x10 Alu-Alu / 100ml Bottle"
                            className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 block">
                            Regulatory Schedule
                          </label>
                          <input
                            type="text"
                            value={productForm.schedule}
                            onChange={(e) =>
                              setProductForm({ ...productForm, schedule: e.target.value })
                            }
                            placeholder="e.g. Schedule H Prescription Drug"
                            className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="font-semibold text-slate-700 block">
                            Storage Conditions
                          </label>
                          <input
                            type="text"
                            value={productForm.storageConditions}
                            onChange={(e) =>
                              setProductForm({ ...productForm, storageConditions: e.target.value })
                            }
                            placeholder="e.g. Store below 25°C in a dry place. Protect from direct light."
                            className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="font-semibold text-slate-700 block">
                            Clinical Indications / Description
                          </label>
                          <textarea
                            rows={3}
                            value={productForm.description}
                            onChange={(e) =>
                              setProductForm({ ...productForm, description: e.target.value })
                            }
                            placeholder="Therapeutic classification, indications, B2B wholesale remarks..."
                            className="w-full p-2.5 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Active Ingredients Display */}
                      <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200/80 space-y-2">
                        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                          Active Pharmaceutical Ingredients (Fixed Formulation)
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {editingProduct.ingredients?.map((i: any) => (
                            <span
                              key={i.id}
                              className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-mono text-[10px] sm:text-[11px]"
                            >
                              {i.ingredient?.name} {i.quantity} {i.unit} ({i.perBasis})
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingProduct}
                          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {savingProduct ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                              <span>Saving Changes...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: WHOLESALE INQUIRIES MANAGEMENT                         */}
          {/* ============================================================ */}
          {activeTab === "inquiries" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Wholesale Inquiries &amp; Orders</span>
                    {inquiriesLoading && <Loader2 className="w-4 h-4 animate-spin text-teal-600" />}
                  </h2>
                  <p className="text-slate-500">
                    Review incoming B2B purchase requests, quote inquiries, and customer pharmacy contacts.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={inquiriesLoading}
                  onClick={loadInquiries}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold shrink-0 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  {inquiriesLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />}
                  <span>{inquiriesLoading ? "Refreshing..." : "Refresh Inquiries"}</span>
                </button>
              </div>

              {/* Inquiries Filters */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                  <input
                    type="text"
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    placeholder="Search by pharmacy name, buyer name, phone, or product..."
                    className="w-full h-10 sm:h-9 pl-9 pr-8 rounded-lg border border-slate-200 text-base sm:text-xs text-slate-900"
                  />
                  {inquirySearch && (
                    <button
                      type="button"
                      onClick={() => setInquirySearch("")}
                      className="absolute right-3 top-3 sm:top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-500 font-semibold">Status:</span>
                  <select
                    value={inquiryStatusFilter}
                    onChange={(e) => setInquiryStatusFilter(e.target.value)}
                    className="h-10 sm:h-9 px-3 rounded-lg border border-slate-200 text-base sm:text-xs text-slate-800 bg-white flex-1 sm:flex-initial"
                  >
                    <option value="ALL">All Inquiries</option>
                    <option value="PENDING">PENDING (New)</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="RESPONDED">RESPONDED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-2xs relative">
                {/* Active Loading Overlay */}
                {inquiriesLoading && inquiries.length > 0 && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10 transition-opacity">
                    <div className="px-4 py-2.5 rounded-xl bg-slate-900 text-white flex items-center gap-2.5 shadow-lg border border-slate-800">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                      <span className="font-semibold text-xs">Updating wholesale inquiries...</span>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto touch-pan-x min-h-[220px]">
                  <table className="w-full text-left border-collapse text-xs min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                        <th className="py-3 px-3 sm:px-4 min-w-[90px]">Date / Time</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[120px]">Company</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[150px]">Buyer / Pharmacy</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[160px]">Referenced Product</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[90px]">Status</th>
                        <th className="py-3 px-3 sm:px-4 text-right min-w-[110px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inquiriesLoading && inquiries.length === 0 ? (
                        Array.from({ length: 5 }).map((_, idx) => (
                          <tr key={idx} className="animate-pulse">
                            <td className="py-3.5 px-4">
                              <div className="h-3.5 w-20 bg-slate-200 rounded" />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="h-4 w-28 bg-slate-200 rounded" />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="h-4 w-36 bg-slate-200 rounded mb-1" />
                              <div className="h-3 w-24 bg-slate-100 rounded" />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="h-4 w-32 bg-slate-200 rounded" />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="h-5 w-16 bg-slate-200 rounded-full" />
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="h-6 w-24 bg-slate-200 rounded ml-auto" />
                            </td>
                          </tr>
                        ))
                      ) : filteredInquiries.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            No inquiries match the current filter.
                          </td>
                        </tr>
                      ) : (
                        filteredInquiries.map((inq) => (
                          <tr key={inq.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                              {new Date(inq.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              {inq.company?.name}
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
                                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
                              >
                                Review &amp; Respond
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inquiry Edit Modal */}
              {selectedInquiry && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
                  <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-xl border border-slate-200 max-h-[92vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          Inquiry: {selectedInquiry.businessName}
                        </h3>
                        <div className="text-[11px] text-slate-400">
                          Received on {new Date(selectedInquiry.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedInquiry(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      >
                        <X className="w-5 h-5 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong>Buyer:</strong> {selectedInquiry.name}
                        </div>
                        <a
                          href={`tel:${selectedInquiry.phone}`}
                          className="inline-flex items-center gap-1 text-teal-700 hover:underline font-semibold"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{selectedInquiry.phone}</span>
                        </a>
                      </div>

                      {selectedInquiry.email && (
                        <div className="flex items-center justify-between">
                          <div>
                            <strong>Email:</strong> {selectedInquiry.email}
                          </div>
                          <a
                            href={`mailto:${selectedInquiry.email}`}
                            className="inline-flex items-center gap-1 text-teal-700 hover:underline font-semibold"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Send Email</span>
                          </a>
                        </div>
                      )}

                      <div>
                        <strong>Assigned Distributor:</strong> {selectedInquiry.company?.name}
                      </div>

                      {selectedInquiry.product && (
                        <div>
                          <strong>Referenced Product:</strong> {selectedInquiry.product.name} (
                          {selectedInquiry.product.packaging})
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-200/80">
                        <strong className="block text-slate-400 text-[10px] uppercase">
                          Buyer Message / Order Specs:
                        </strong>
                        <p className="text-slate-800 italic mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                          &quot;{selectedInquiry.message}&quot;
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 block">Inquiry Status</label>
                        <select
                          value={inquiryStatus}
                          onChange={(e) => setInquiryStatus(e.target.value)}
                          className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
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
                          className="w-full p-2.5 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSelectedInquiry(null)}
                        className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={updatingInquiry}
                        onClick={handleUpdateInquiry}
                        className="px-5 py-2.5 rounded-xl text-white bg-slate-900 hover:bg-slate-800 font-bold flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {updatingInquiry ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                            <span>Saving Inquiry...</span>
                          </>
                        ) : (
                          <span>Save Inquiry Status</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: COMPANY PROFILES & SETTINGS                           */}
          {/* ============================================================ */}
          {activeTab === "company_profile" && (
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Company Profiles &amp; Application Control
                  </h2>
                  <p className="text-slate-500">
                    Update official business hours, warehouse addresses, drug license numbers, and contact details.
                  </p>
                </div>

                {/* Company Switcher Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto touch-pan-x no-scrollbar max-w-full">
                  {overviewData?.companies?.map((c: any) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => loadCompanyProfile(c)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-colors ${
                        selectedCompanyId === c.id
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveCompanyProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Company Tagline</label>
                    <input
                      type="text"
                      value={companyProfileForm.tagline}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, tagline: e.target.value })
                      }
                      placeholder="e.g. Authorized B2B Pharmaceutical Distributor"
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Warehouse / Office Address</label>
                    <input
                      type="text"
                      value={companyProfileForm.address}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, address: e.target.value })
                      }
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
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
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Orders &amp; Quote Email</label>
                    <input
                      type="email"
                      value={companyProfileForm.email}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, email: e.target.value })
                      }
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
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
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Operating Hours</label>
                    <input
                      type="text"
                      value={companyProfileForm.businessHours}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, businessHours: e.target.value })
                      }
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Drug License Number</label>
                    <input
                      type="text"
                      value={companyProfileForm.drugLicenseNo}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, drugLicenseNo: e.target.value })
                      }
                      placeholder="e.g. DL-KL-20B-123456"
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">GSTIN Number</label>
                    <input
                      type="text"
                      value={companyProfileForm.gstin}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, gstin: e.target.value })
                      }
                      placeholder="e.g. 32AABCU9603R1ZX"
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Geographic Service Coverage Areas
                    </label>
                    <textarea
                      rows={2}
                      value={companyProfileForm.serviceAreas}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, serviceAreas: e.target.value })
                      }
                      placeholder="Districts, delivery schedule, cold-chain coverage..."
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Company Profile &amp; Overview
                    </label>
                    <textarea
                      rows={3}
                      value={companyProfileForm.description}
                      onChange={(e) =>
                        setCompanyProfileForm({ ...companyProfileForm, description: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={savingCompanyProfile}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors text-center"
                  >
                    {savingCompanyProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                        <span>Saving Profile Updates...</span>
                      </>
                    ) : (
                      <span>Save Profile Updates</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-center"
                  >
                    Back to Overview
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: MANUFACTURERS & LOGOS (Super Admin)                  */}
          {/* ============================================================ */}
          {activeTab === "manufacturers" && isSuper && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Manufacturers &amp; Authorized Logos</span>
                    {brandsLoading && <Loader2 className="w-4 h-4 animate-spin text-teal-600" />}
                  </h2>
                  <p className="text-slate-500">
                    Manage principal drug manufacturers. Only authorized logos and clean text fallbacks are supported.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={brandsLoading}
                  onClick={loadManufacturers}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  {brandsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />}
                  <span>{brandsLoading ? "Refreshing..." : "Refresh List"}</span>
                </button>
              </div>

              {/* Add / Edit Manufacturer Form */}
              <form
                onSubmit={handleSaveManufacturer}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
              >
                <h3 className="font-bold text-sm text-slate-900">
                  Add / Update Manufacturer
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Manufacturer Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={mfgForm.name}
                      onChange={(e) => setMfgForm({ ...mfgForm, name: e.target.value })}
                      placeholder="e.g. Rhine Life Sciences Pvt. Ltd."
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
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
                      placeholder="e.g. rhine-life-sciences"
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
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
                      placeholder="https://www.rhinelifesciences.com"
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
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
                      placeholder="/logos/rhine.svg (Leave empty for clean text fallback)"
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingMfg}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  {savingMfg ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                      <span>Saving Manufacturer...</span>
                    </>
                  ) : (
                    <span>Save Manufacturer</span>
                  )}
                </button>
              </form>

              {/* Manufacturers Table */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-2xs relative">
                {brandsLoading && manufacturers.length > 0 && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10 transition-opacity">
                    <div className="px-4 py-2.5 rounded-xl bg-slate-900 text-white flex items-center gap-2.5 shadow-lg border border-slate-800">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                      <span className="font-semibold text-xs">Updating manufacturers...</span>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto touch-pan-x min-h-[160px]">
                  <table className="w-full text-left border-collapse text-xs min-w-[560px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                        <th className="py-3 px-3 sm:px-4 min-w-[90px]">Brand Logo</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[140px]">Name</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[110px]">Slug</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[80px]">Products</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[100px]">Website</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {brandsLoading && manufacturers.length === 0 ? (
                        Array.from({ length: 3 }).map((_, idx) => (
                          <tr key={idx} className="animate-pulse">
                            <td className="py-3.5 px-4">
                              <div className="h-7 w-20 bg-slate-200 rounded" />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="h-4 w-36 bg-slate-200 rounded" />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="h-4 w-28 bg-slate-100 rounded" />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="h-4 w-8 bg-slate-200 rounded" />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="h-4 w-20 bg-slate-100 rounded" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        manufacturers.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 sm:px-4">
                              <ManufacturerLogo logoUrl={m.logoUrl} name={m.name} className="h-7 w-20" />
                            </td>
                            <td className="py-3 px-3 sm:px-4 font-bold text-slate-900">{m.name}</td>
                            <td className="py-3 px-3 sm:px-4 font-mono text-slate-400">{m.slug}</td>
                            <td className="py-3 px-3 sm:px-4 font-semibold text-slate-700">
                              {m._count?.products || 0}
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-slate-500">
                              {m.website ? (
                                <a
                                  href={m.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-teal-600 hover:underline"
                                >
                                  Visit Site ↗
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 7: CANONICAL INGREDIENTS & ALIASES (Super Admin)        */}
          {/* ============================================================ */}
          {activeTab === "ingredients" && isSuper && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Canonical Ingredients &amp; Search Aliases</span>
                    {ingredientsLoading && <Loader2 className="w-4 h-4 animate-spin text-teal-600" />}
                  </h2>
                  <p className="text-slate-500">
                    Manage active pharmaceutical ingredients (APIs) and synonym mappings (e.g. Paracetamol = Acetaminophen).
                  </p>
                </div>
                <button
                  type="button"
                  disabled={ingredientsLoading}
                  onClick={loadIngredients}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  {ingredientsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />}
                  <span>{ingredientsLoading ? "Refreshing..." : "Refresh Ingredients"}</span>
                </button>
              </div>

              {/* Add Ingredient Form */}
              <form
                onSubmit={handleSaveIngredient}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
              >
                <h3 className="font-bold text-sm text-slate-900">Add Canonical Ingredient</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Canonical Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ingForm.name}
                      onChange={(e) => setIngForm({ ...ingForm, name: e.target.value })}
                      placeholder="e.g. Bisoprolol Fumarate"
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Slug (Optional)</label>
                    <input
                      type="text"
                      value={ingForm.slug}
                      onChange={(e) => setIngForm({ ...ingForm, slug: e.target.value })}
                      placeholder="e.g. bisoprolol-fumarate"
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Search Aliases &amp; Synonyms (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={ingForm.aliasesText}
                      onChange={(e) => setIngForm({ ...ingForm, aliasesText: e.target.value })}
                      placeholder="e.g. Bisoprolol, Bisoprolol Hemifumarate"
                      className="w-full h-10 sm:h-9 px-3 rounded-lg border border-slate-300 text-base sm:text-xs text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingIngredient}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  {savingIngredient ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                      <span>Saving Ingredient...</span>
                    </>
                  ) : (
                    <span>Save Ingredient</span>
                  )}
                </button>
              </form>

              {/* Ingredients Table */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-2xs relative">
                {ingredientsLoading && ingredients.length > 0 && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10 transition-opacity">
                    <div className="px-4 py-2.5 rounded-xl bg-slate-900 text-white flex items-center gap-2.5 shadow-lg border border-slate-800">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                      <span className="font-semibold text-xs">Updating active ingredients...</span>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto touch-pan-x min-h-[160px]">
                  <table className="w-full text-left border-collapse text-xs min-w-[560px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                        <th className="py-3 px-3 sm:px-4 min-w-[150px]">Canonical API Name</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[200px]">Search Aliases &amp; Synonyms</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[100px]">Formulations Using API</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ingredientsLoading && ingredients.length === 0 ? (
                        Array.from({ length: 5 }).map((_, idx) => (
                          <tr key={idx} className="animate-pulse">
                            <td className="py-3.5 px-4">
                              <div className="h-4 w-40 bg-slate-200 rounded" />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex gap-1.5">
                                <div className="h-4 w-20 bg-slate-150 rounded" />
                                <div className="h-4 w-28 bg-slate-100 rounded" />
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="h-4 w-12 bg-slate-200 rounded" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        ingredients.map((ing) => (
                          <tr key={ing.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 sm:px-4 font-bold text-slate-900">{ing.name}</td>
                            <td className="py-3 px-3 sm:px-4">
                              <div className="flex flex-wrap gap-1">
                                {ing.aliases?.map((a: any) => (
                                  <span
                                    key={a.id}
                                    className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]"
                                  >
                                    {a.aliasName}
                                  </span>
                                ))}
                                {(!ing.aliases || ing.aliases.length === 0) && (
                                  <span className="text-slate-400 italic">No aliases</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-4 font-semibold text-slate-700">
                              {ing._count?.productIngredients || 0}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
