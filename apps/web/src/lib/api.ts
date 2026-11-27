import {
  Company,
  CatalogResponse,
  Product,
  Manufacturer,
  InquiryPayload,
  Inquiry,
  AuthUser,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchCompanies(): Promise<Company[]> {
  const res = await fetch(`${API_BASE}/companies`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error("Failed to fetch companies");
  const data = await res.json();
  return data.data;
}

export async function fetchCompany(slug: string): Promise<Company> {
  const res = await fetch(`${API_BASE}/companies/${slug}`, { next: { revalidate: 300 }, credentials: "omit" });
  if (!res.ok) throw new Error(`Company '${slug}' not found`);
  const data = await res.json();
  return data.data;
}

export async function fetchCompanyFilterMeta(slug: string): Promise<import("@/types").FilterMeta> {
  const res = await fetch(`${API_BASE}/companies/${slug}/filter-meta`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Filter metadata for '${slug}' not found`);
  const data = await res.json();
  return data.data;
}

export async function fetchCatalog(
  slug: string,
  params: {
    q?: string;
    manufacturer?: string;
    dosageForm?: string;
    category?: string;
    strength?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }
): Promise<CatalogResponse> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.manufacturer) query.set("manufacturer", params.manufacturer);
  if (params.dosageForm) query.set("dosageForm", params.dosageForm);
  if (params.strength) query.set("strength", params.strength);
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.sort) query.set("sort", params.sort);

  // Unfiltered requests can use ISR cache (60s) for ultra-fast instant loads, dynamic filters use no-store
  const isFiltered = !!(params.q || params.manufacturer || params.dosageForm || params.strength || (params.page && params.page > 1) || params.sort);
  const fetchOpts = isFiltered ? { cache: "no-store" as const } : { next: { revalidate: 60 } };

  const res = await fetch(`${API_BASE}/companies/${slug}/products?${query.toString()}`, fetchOpts);
  if (!res.ok) throw new Error("Failed to fetch product catalog");
  return res.json();
}

export async function fetchProduct(
  companySlug: string,
  productSlug: string
): Promise<{ company: Company; data: Product }> {
  const res = await fetch(`${API_BASE}/companies/${companySlug}/products/${productSlug}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Product not found in this catalog");
  return res.json();
}

export async function fetchManufacturers(companySlug: string): Promise<{
  company: { id: string; name: string; slug: string };
  data: Manufacturer[];
}> {
  const res = await fetch(`${API_BASE}/companies/${companySlug}/manufacturers`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch manufacturers");
  return res.json();
}

export async function fetchManufacturerDetail(
  companySlug: string,
  mfgSlug: string
): Promise<{
  company: { id: string; name: string; slug: string };
  data: Manufacturer & { products: Array<{ id: string; slug: string; name: string; dosageForm: string; packaging: string; composition: string }> };
}> {
  const res = await fetch(`${API_BASE}/companies/${companySlug}/manufacturers/${mfgSlug}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch manufacturer details");
  return res.json();
}

export async function submitInquiry(
  companySlug: string,
  payload: InquiryPayload
): Promise<{ success: boolean; message: string; inquiryId: string }> {
  const res = await fetch(`${API_BASE}/companies/${companySlug}/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "Failed to submit inquiry");
  }
  return data;
}

// Authentication & Admin helpers
export async function login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Unauthorized");
  return data.user;
}

export async function fetchAdminOverview(token: string) {
  const res = await fetch(`${API_BASE}/admin/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch admin overview");
  return data.data;
}

export async function fetchAdminInquiries(
  token: string,
  filter?: { companyId?: string; status?: string; page?: number; limit?: number | "all"; search?: string }
): Promise<{ data: Inquiry[]; pagination?: { total: number; page: number; limit: number; totalPages: number } }> {
  const query = new URLSearchParams();
  if (filter?.companyId) query.set("companyId", filter.companyId);
  if (filter?.status) query.set("status", filter.status);
  if (filter?.page) query.set("page", filter.page.toString());
  if (filter?.limit) query.set("limit", filter.limit.toString());
  if (filter?.search) query.set("search", filter.search);

  const res = await fetch(`${API_BASE}/admin/inquiries?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch inquiries");
  return { data: data.data, pagination: data.pagination };
}

export async function updateInquiryStatus(token: string, id: string, status: string, adminNotes?: string) {
  const res = await fetch(`${API_BASE}/admin/inquiries/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, adminNotes }),
  });
  return res.json();
}

export async function updateCompanyProfile(token: string, id: string, payload: any) {
  const res = await fetch(`${API_BASE}/admin/companies/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function toggleCompanyProductListing(token: string, payload: {
  companyId: string;
  productId: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  itemCode?: string;
  distributorNotes?: string;
}) {
  const res = await fetch(`${API_BASE}/admin/company-products/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchAdminProducts(
  token: string,
  options?: { page?: number; limit?: number | "all"; q?: string; dosageForm?: string; manufacturerId?: string; companyId?: string }
): Promise<{ data: any[]; pagination?: { total: number; page: number; limit: number; totalPages: number } }> {
  const query = new URLSearchParams();
  if (options?.page) query.set("page", options.page.toString());
  if (options?.limit) query.set("limit", options.limit.toString());
  if (options?.q) query.set("q", options.q);
  if (options?.dosageForm) query.set("dosageForm", options.dosageForm);
  if (options?.manufacturerId) query.set("manufacturerId", options.manufacturerId);
  if (options?.companyId) query.set("companyId", options.companyId);

  const res = await fetch(`${API_BASE}/admin/products?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch products");
  return { data: data.data, pagination: data.pagination };
}

export async function fetchAdminManufacturers(token: string) {
  const res = await fetch(`${API_BASE}/admin/manufacturers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data;
}

export async function fetchAdminIngredients(token: string) {
  const res = await fetch(`${API_BASE}/admin/ingredients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data;
}

export async function saveManufacturer(token: string, payload: { name: string; slug: string; website?: string; logoUrl?: string }) {
  const res = await fetch(`${API_BASE}/admin/manufacturers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function saveIngredient(token: string, payload: { name: string; slug: string; description?: string; aliases: string[] }) {
  const res = await fetch(`${API_BASE}/admin/ingredients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateAdminProduct(token: string, id: string, payload: any) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update product");
  return data;
}

export async function deleteAdminProduct(token: string, id: string) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete product");
  return data;
}

export async function fetchAdminCompanyManufacturers(token: string) {
  const res = await fetch(`${API_BASE}/admin/company-manufacturers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch company brand authorizations");
  return data.data;
}

export async function toggleCompanyManufacturerAuthorization(
  token: string,
  payload: { companyId: string; manufacturerId: string; isAuthorized: boolean; partnershipDetails?: string }
) {
  const res = await fetch(`${API_BASE}/admin/company-manufacturers/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update brand authorization");
  return data;
}

// ==========================================
// EMPLOYEE / STAFF PORTAL API FUNCTIONS
// ==========================================

export async function fetchEmployeeStats(slug: string, token: string): Promise<import("@/types").EmployeeDashboardData> {
  const res = await fetch(`${API_BASE}/companies/${slug}/employee/stats`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch employee dashboard data");
  return data.data;
}

export async function fetchEmployeeInquiries(
  slug: string,
  token: string,
  params: { status?: string; q?: string; page?: number; limit?: number } = {}
) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.q) query.set("q", params.q);
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/companies/${slug}/employee/inquiries?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch distributor inquiries");
  return data;
}

export async function createEmployeeInquiry(
  slug: string,
  token: string,
  payload: {
    name: string;
    businessName: string;
    phone: string;
    email?: string;
    message: string;
    productId?: string | null;
    adminNotes?: string;
    status?: string;
  }
) {
  const res = await fetch(`${API_BASE}/companies/${slug}/employee/inquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to log counter/phone order");
  return data;
}

export async function updateEmployeeInquiry(
  slug: string,
  token: string,
  inquiryId: string,
  payload: { status?: string; adminNotes?: string }
) {
  const res = await fetch(`${API_BASE}/companies/${slug}/employee/inquiries/${inquiryId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update inquiry");
  return data;
}

export async function fetchEmployeeWholesaleProducts(
  slug: string,
  token: string,
  params: {
    q?: string;
    manufacturer?: string;
    dosageForm?: string;
    division?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.manufacturer) query.set("manufacturer", params.manufacturer);
  if (params.dosageForm) query.set("dosageForm", params.dosageForm);
  if (params.division) query.set("division", params.division);
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/companies/${slug}/employee/products/wholesale?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch wholesale products");
  return data;
}

export async function fetchEmployeeRateSheet(slug: string, token: string, manufacturer?: string): Promise<import("@/types").RateSheetData> {
  const query = new URLSearchParams();
  if (manufacturer) query.set("manufacturer", manufacturer);

  const res = await fetch(`${API_BASE}/companies/${slug}/employee/rate-sheet?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch rate sheet");
  return data.data;
}

// ==========================================
// ADMIN STAFF & EMPLOYEE MANAGEMENT API
// ==========================================

export async function fetchAdminUsers(token: string, companyId?: string) {
  const query = new URLSearchParams();
  if (companyId) query.set("companyId", companyId);

  const res = await fetch(`${API_BASE}/admin/users?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch staff members");
  return data.data;
}

export async function createAdminUser(
  token: string,
  payload: {
    name: string;
    email: string;
    password: string;
    role: "COMPANY_STAFF" | "COMPANY_ADMIN";
    companyId: string;
  }
) {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create staff account");
  return data;
}

export async function updateAdminUser(
  token: string,
  userId: string,
  payload: {
    name?: string;
    email?: string;
    password?: string;
    role?: "COMPANY_STAFF" | "COMPANY_ADMIN";
    companyId?: string;
  }
) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update staff account");
  return data;
}

export async function deleteAdminUser(token: string, userId: string) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete staff member");
  return data;
}

// ==========================================
// Field Representative & Delivery Route APIs
// ==========================================

export async function fetchCompanyRoutes(slug: string): Promise<{ company: any; routes: any[] }> {
  const res = await fetch(`${API_BASE}/companies/${slug}/routes`, {
    next: { revalidate: 30 },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch company routes");
  return data.data;
}

export async function fetchAdminCompanyRoutes(token: string, companyId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/admin/companies/${companyId}/routes`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Failed to load company routes");
  return data.data;
}

export async function createAdminCompanyRoute(
  token: string,
  companyId: string,
  payload: {
    personName: string;
    designation?: string;
    phone: string;
    email?: string;
    routeAreas: string;
    schedule: string;
    mapUrl?: string;
    notes?: string;
    orderIndex?: number;
    isActive?: boolean;
  }
) {
  const res = await fetch(`${API_BASE}/admin/companies/${companyId}/routes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Failed to add route representative");
  return data;
}

export async function updateAdminCompanyRoute(
  token: string,
  companyId: string,
  routeId: string,
  payload: {
    personName?: string;
    designation?: string;
    phone?: string;
    email?: string;
    routeAreas?: string;
    schedule?: string;
    mapUrl?: string;
    notes?: string;
    orderIndex?: number;
    isActive?: boolean;
  }
) {
  const res = await fetch(`${API_BASE}/admin/companies/${companyId}/routes/${routeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Failed to update route representative");
  return data;
}

export async function deleteAdminCompanyRoute(token: string, companyId: string, routeId: string) {
  const res = await fetch(`${API_BASE}/admin/companies/${companyId}/routes/${routeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Failed to delete route representative");
  return data;
}
