export type CompanySlug = "lakshmi-pharma" | "kothottil-pharma";

export interface Company {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  accentColor: "teal" | "blue" | string;
  tagline?: string | null;
  description: string;
  serviceAreas: string;
  address: string;
  phone: string;
  email: string;
  whatsapp?: string | null;
  mapUrl?: string | null;
  businessHours: string;
  drugLicenseNo?: string | null;
  gstin?: string | null;
  isActive: boolean;
  totalProducts?: number;
  totalManufacturers?: number;
  stats?: {
    totalProducts: number;
    totalManufacturers: number;
  };
  featuredProducts?: Array<{
    id: string;
    slug: string;
    name: string;
    dosageForm: string;
    packaging: string;
    itemCode?: string | null;
    manufacturer: {
      name: string;
      slug: string;
      logoUrl?: string | null;
    };
    composition: string;
  }>;
}

export interface Manufacturer {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  website?: string | null;
  isAuthorized?: boolean;
  partnershipDetails?: string | null;
  publishedProductCount?: number;
}

export interface StructuredIngredient {
  id: string;
  ingredientId?: string;
  name: string;
  quantity: number;
  unit: string;
  perBasis: string;
  isPrimary: boolean;
  aliases?: string[];
}

export interface MatchReason {
  type: "exact_composition" | "ingredient" | "ingredient_alias" | "brand_name" | "strength" | "manufacturer";
  label: string;
  detail?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  dosageForm: string;
  packaging: string;
  description?: string | null;
  storageConditions?: string | null;
  schedule?: string | null;
  isFeatured?: boolean;
  itemCode?: string | null;
  distributorNotes?: string | null;
  composition?: string;
  requiresColdChain?: boolean;
  manufacturer: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    website?: string | null;
  };
  ingredients: StructuredIngredient[];
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  matchScore?: number;
  matchReasons?: MatchReason[];
  matchingComposition?: {
    disclaimer: string;
    matches: Array<{
      id: string;
      slug: string;
      name: string;
      dosageForm: string;
      packaging: string;
      manufacturer: {
        id: string;
        name: string;
        slug: string;
        logoUrl?: string | null;
      };
      compositionSummary: string;
    }>;
  };
}

export interface FilterMeta {
  manufacturers: Array<{ name: string; slug: string; count: number }>;
  dosageForms: Array<{ name: string; count: number }>;
  categories: Array<{ name: string; slug: string; count: number }>;
}

export interface CatalogResponse {
  success: boolean;
  company: {
    id: string;
    name: string;
    slug: string;
    accentColor: string;
  };
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filterMeta: FilterMeta;
}

export interface InquiryItem {
  product: Product;
  quantity?: string; // Optional (e.g., "50 boxes", "10 strips", or empty for stock/rate check)
  notes?: string;
}

export interface InquiryPayload {
  name: string;
  businessName: string;
  email?: string;
  phone: string;
  message: string;
  productId?: string | null;
  items?: Array<{
    productId?: string | null;
    name: string;
    quantity?: string;
    packaging?: string;
    manufacturer?: string;
  }>;
}

export interface Inquiry {
  id: string;
  companyId: string;
  productId?: string | null;
  name: string;
  businessName: string;
  email?: string | null;
  phone: string;
  message: string;
  status: "PENDING" | "IN_REVIEW" | "RESPONDED" | "CLOSED";
  adminNotes?: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    slug: string;
    accentColor: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    dosageForm: string;
    packaging: string;
  } | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "COMPANY_ADMIN";
  companies: Array<{
    id: string;
    name: string;
    slug: string;
    shortName: string;
  }>;
}
