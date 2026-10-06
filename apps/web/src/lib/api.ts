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
  const res = await fetch(`${API_BASE}/companies`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch companies");
  const data = await res.json();
  return data.data;
}

export async function fetchCompany(slug: string): Promise<Company> {
  const res = await fetch(`${API_BASE}/companies/${slug}`, { credentials: "omit" });
  if (!res.ok) throw new Error(`Company '${slug}' not found`);
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
  if (params.category) query.set("category", params.category);
  if (params.strength) query.set("strength", params.strength);
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.sort) query.set("sort", params.sort);

  const res = await fetch(`${API_BASE}/companies/${slug}/products?${query.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch product catalog");
  return res.json();
}

export async function fetchProduct(
  companySlug: string,
  productSlug: string
): Promise<{ company: Company; data: Product }> {
  const res = await fetch(`${API_BASE}/companies/${companySlug}/products/${productSlug}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Product not found in this catalog");
  return res.json();
}

export async function fetchManufacturers(companySlug: string): Promise<{
  company: { id: string; name: string; slug: string };
  data: Manufacturer[];
}> {
  const res = await fetch(`${API_BASE}/companies/${companySlug}/manufacturers`, {
    cache: "no-store",
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
    cache: "no-store",
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

export async function fetchAdminInquiries(token: string, filter?: { companyId?: string; status?: string }): Promise<Inquiry[]> {
  const query = new URLSearchParams();
  if (filter?.companyId) query.set("companyId", filter.companyId);
  if (filter?.status) query.set("status", filter.status);

  const res = await fetch(`${API_BASE}/admin/inquiries?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch inquiries");
  return data.data;
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

export async function fetchAdminProducts(token: string) {
  const res = await fetch(`${API_BASE}/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data;
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
