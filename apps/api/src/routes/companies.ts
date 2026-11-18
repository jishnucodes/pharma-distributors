import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "@lk/database";
import { z } from "zod";
import { ApiError } from "../middleware/errorHandler";
import {
  searchCompanyProducts,
  getCompanyFilterMeta,
  getAuthorizedManufacturerIds,
} from "../utils/compositionSearch";
import { findProductsWithMatchingComposition } from "../utils/matchingComposition";
import { memoryCache } from "../utils/cache";

export const companyRouter = Router();

// 1. List all active companies (Cached 60s)
companyRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await memoryCache.getOrSet("all_active_companies", async () => {
      const companies = await prisma.company.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          shortName: true,
          accentColor: true,
          tagline: true,
          description: true,
          serviceAreas: true,
          address: true,
          phone: true,
          email: true,
          whatsapp: true,
          mapUrl: true,
          businessHours: true,
          drugLicenseNo: true,
          gstin: true,
          _count: {
            select: {
              companyProducts: { where: { isPublished: true } },
              companyManufacturers: { where: { isAuthorized: true } },
            },
          },
        },
      });

      return companies.map((c) => ({
        ...c,
        totalProducts: c._count.companyProducts,
        totalManufacturers: c._count.companyManufacturers,
      }));
    }, 60);

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Helper to find company by slug
async function getCompanyBySlug(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
  });
  if (!company || !company.isActive) {
    throw new ApiError(404, `Company '${slug}' not found or inactive`);
  }
  return company;
}

// 2. Get single company details (Cached 60s)
companyRouter.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug;
    const data = await memoryCache.getOrSet(`company_detail:${slug}`, async () => {
      const company = await getCompanyBySlug(slug);

      const authorizedMfgIds = await getAuthorizedManufacturerIds(company.id);

      const [publishedProductsCount, authorizedManufacturersCount, featuredProducts] =
        await Promise.all([
          prisma.companyProduct.count({
            where: {
              companyId: company.id,
              isPublished: true,
              product: { manufacturerId: { in: authorizedMfgIds } },
            },
          }),
          authorizedMfgIds.length,
          prisma.companyProduct.findMany({
            where: {
              companyId: company.id,
              isPublished: true,
              isFeatured: true,
              product: { manufacturerId: { in: authorizedMfgIds } },
            },
            take: 6,
            include: {
              product: {
                include: {
                  manufacturer: true,
                  ingredients: {
                    include: { ingredient: true },
                  },
                },
              },
            },
          }),
        ]);

      return {
        ...company,
        stats: {
          totalProducts: publishedProductsCount,
          totalManufacturers: authorizedManufacturersCount,
        },
        featuredProducts: featuredProducts.map((fp) => ({
          id: fp.product.id,
          slug: fp.product.slug,
          name: fp.product.name,
          dosageForm: fp.product.dosageForm,
          packaging: fp.product.packaging,
          itemCode: fp.itemCode,
          manufacturer: {
            name: fp.product.manufacturer.name,
            slug: fp.product.manufacturer.slug,
            logoUrl: fp.product.manufacturer.logoUrl,
          },
          composition: fp.product.ingredients
            .map((i) => `${i.ingredient.name} ${i.quantity} ${i.unit}`)
            .join(" + "),
        })),
      };
    }, 60);

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// 2b. Fast dedicated filter metadata endpoint (Cached 60s)
companyRouter.get("/:slug/filter-meta", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await getCompanyBySlug(req.params.slug);
    const authMfgIds = await getAuthorizedManufacturerIds(company.id);
    const filterMeta = await getCompanyFilterMeta(company.id, authMfgIds);

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
      },
      data: filterMeta,
    });
  } catch (err) {
    next(err);
  }
});

// 3. Search & filter catalog for company
companyRouter.get("/:slug/products", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await getCompanyBySlug(req.params.slug);

    const {
      q,
      manufacturer,
      dosageForm,
      strength,
      page,
      limit,
      sort,
    } = req.query;

    const result = await searchCompanyProducts(company.id, {
      query: typeof q === "string" ? q : undefined,
      manufacturerSlug: typeof manufacturer === "string" ? manufacturer : undefined,
      dosageForm: typeof dosageForm === "string" ? dosageForm : undefined,
      strength: typeof strength === "string" ? strength : undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 12,
      sort: sort as any,
    });

    res.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        accentColor: company.accentColor,
      },
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

// 4. Get product detail + "Products with matching composition"
companyRouter.get("/:slug/products/:productSlug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await getCompanyBySlug(req.params.slug);
    const { productSlug } = req.params;

    // Verify product is published in this company and its brand is authorized
    const companyProduct = await prisma.companyProduct.findFirst({
      where: {
        companyId: company.id,
        isPublished: true,
        product: {
          slug: productSlug,
          manufacturer: {
            companyManufacturers: {
              some: {
                companyId: company.id,
                isAuthorized: true,
              },
            },
          },
        },
      },
      include: {
        product: {
          include: {
            manufacturer: true,
            ingredients: {
              include: {
                ingredient: {
                  include: { aliases: true },
                },
              },
            },
          },
        },
      },
    });

    if (!companyProduct) {
      throw new ApiError(
        404,
        `Product '${productSlug}' is not available in ${company.name}'s catalog`
      );
    }

    const prod = companyProduct.product;

    // Find products in this company with matching composition
    const matchingComposition = await findProductsWithMatchingComposition(company.id, prod.id);

    res.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        accentColor: company.accentColor,
        phone: company.phone,
        email: company.email,
        whatsapp: company.whatsapp,
      },
      data: {
        id: prod.id,
        slug: prod.slug,
        name: prod.name,
        dosageForm: prod.dosageForm,
        packaging: prod.packaging,
        description: prod.description,
        storageConditions: prod.storageConditions,
        schedule: prod.schedule,
        itemCode: companyProduct.itemCode,
        distributorNotes: companyProduct.distributorNotes,
        isFeatured: companyProduct.isFeatured,
        manufacturer: {
          id: prod.manufacturer.id,
          name: prod.manufacturer.name,
          slug: prod.manufacturer.slug,
          logoUrl: prod.manufacturer.logoUrl,
          website: prod.manufacturer.website,
        },
        ingredients: prod.ingredients.map((pi) => ({
          id: pi.id,
          name: pi.ingredient.name,
          quantity: pi.quantity,
          unit: pi.unit,
          perBasis: pi.perBasis,
          isPrimary: pi.isPrimary,
          aliases: pi.ingredient.aliases.map((a) => a.aliasName),
        })),
        categories: [],
        matchingComposition,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 5. Get company's authorized manufacturers (Cached 60s)
companyRouter.get("/:slug/manufacturers", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await getCompanyBySlug(req.params.slug);

    const data = await memoryCache.getOrSet(`company_mfg_list:${company.id}`, async () => {
      const companyManufacturers = await prisma.companyManufacturer.findMany({
        where: {
          companyId: company.id,
          isAuthorized: true,
        },
        include: {
          manufacturer: {
            include: {
              products: {
                where: {
                  companyProducts: {
                    some: {
                      companyId: company.id,
                      isPublished: true,
                    },
                  },
                },
                select: { id: true },
              },
            },
          },
        },
        orderBy: {
          manufacturer: {
            name: "asc",
          },
        },
      });

      return companyManufacturers.map((cm) => ({
        id: cm.manufacturer.id,
        name: cm.manufacturer.name,
        slug: cm.manufacturer.slug,
        logoUrl: cm.manufacturer.logoUrl,
        website: cm.manufacturer.website,
        isAuthorized: cm.isAuthorized,
        partnershipDetails: cm.partnershipDetails,
        publishedProductCount: cm.manufacturer.products.length,
      }));
    }, 60);

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
      },
      data,
    });
  } catch (err) {
    next(err);
  }
});

// 6. Get single manufacturer in company context
companyRouter.get("/:slug/manufacturers/:mfgSlug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await getCompanyBySlug(req.params.slug);
    const { mfgSlug } = req.params;

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { slug: mfgSlug },
    });

    if (!manufacturer) {
      throw new ApiError(404, `Manufacturer '${mfgSlug}' not found`);
    }

    const companyManufacturer = await prisma.companyManufacturer.findUnique({
      where: {
        companyId_manufacturerId: {
          companyId: company.id,
          manufacturerId: manufacturer.id,
        },
      },
    });

    if (!companyManufacturer || !companyManufacturer.isAuthorized) {
      throw new ApiError(
        404,
        "Manufacturer '" + manufacturer.name + "' is not authorized or distributed by " + company.name
      );
    }

    // Fetch published products from this manufacturer for this company
    const products = await prisma.companyProduct.findMany({
      where: {
        companyId: company.id,
        isPublished: true,
        product: { manufacturerId: manufacturer.id },
      },
      include: {
        product: {
          include: {
            ingredients: {
              include: { ingredient: true },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
      },
      data: {
        id: manufacturer.id,
        name: manufacturer.name,
        slug: manufacturer.slug,
        logoUrl: manufacturer.logoUrl,
        website: manufacturer.website,
        isAuthorized: companyManufacturer?.isAuthorized ?? false,
        partnershipDetails: companyManufacturer?.partnershipDetails ?? null,
        products: products.map((cp) => ({
          id: cp.product.id,
          slug: cp.product.slug,
          name: cp.product.name,
          dosageForm: cp.product.dosageForm,
          packaging: cp.product.packaging,
          composition: cp.product.ingredients
            .map((i) => `${i.ingredient.name} ${i.quantity} ${i.unit}`)
            .join(" + "),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// 7. Submit B2B Inquiry for Company
const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  businessName: z.string().min(2, "Business / Pharmacy name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(8, "Valid phone number is required"),
  message: z.string().min(3, "Inquiry message must be at least 3 characters"),
  productId: z.string().optional().nullable(),
  items: z.array(z.object({
    productId: z.string().optional().nullable(),
    name: z.string(),
    quantity: z.string().optional().nullable(),
    packaging: z.string().optional().nullable(),
    manufacturer: z.string().optional().nullable(),
  })).optional(),
});

companyRouter.post("/:slug/inquiries", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await getCompanyBySlug(req.params.slug);
    const body = inquirySchema.parse(req.body);

    let effectiveProductId: string | null = body.productId || null;

    // If multi-item list is provided but no single productId, pick first valid product
    if (!effectiveProductId && body.items && body.items.length > 0) {
      const firstWithId = body.items.find(i => i.productId);
      if (firstWithId?.productId) {
        effectiveProductId = firstWithId.productId;
      }
    }

    // If effectiveProductId is supplied, validate it belongs to this company's published catalog
    if (effectiveProductId) {
      const listing = await prisma.companyProduct.findFirst({
        where: {
          companyId: company.id,
          productId: effectiveProductId,
          isPublished: true,
        },
      });
      if (!listing) {
        // If not found in catalog, don't fail multi-product inquiries; just clear the single relation
        effectiveProductId = null;
      }
    }

    // Build rich message if multi-item array is passed
    let finalMessage = body.message;
    if (body.items && body.items.length > 0) {
      const formattedItems = body.items
        .map((item, idx) => {
          const qtyText = item.quantity && item.quantity.trim() ? `[Qty: ${item.quantity.trim()}]` : "[Rate & Stock Check]";
          const mfgText = item.manufacturer ? `(${item.manufacturer})` : "";
          const packText = item.packaging ? `· ${item.packaging}` : "";
          return `${idx + 1}. ${item.name} ${mfgText} ${packText} - ${qtyText}`;
        })
        .join("\n");

      finalMessage = `--- Multi-Product Inquiry (${body.items.length} items) ---\n${formattedItems}\n\nAdditional Buyer Notes:\n${body.message}`;
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        companyId: company.id,
        productId: effectiveProductId,
        name: body.name,
        businessName: body.businessName,
        email: body.email || null,
        phone: body.phone,
        message: finalMessage,
        status: "PENDING",
      },
      include: {
        product: {
          select: { name: true, slug: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: `Your inquiry has been submitted to ${company.name}. Our commercial trade desk will review and contact you shortly.`,
      inquiryId: inquiry.id,
    });
  } catch (err) {
    next(err);
  }
});
