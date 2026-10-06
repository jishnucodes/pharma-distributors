import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "@lk/database";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../middleware/errorHandler";
import { requireAuth, requireSuperAdmin, checkCompanyAccess } from "../middleware/auth";

export const adminRouter = Router();

// All admin routes require authentication
adminRouter.use(requireAuth);

// 1. Admin Dashboard Overview
adminRouter.get("/overview", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const isSuper = user.role === "SUPER_ADMIN";
    const companyFilter = isSuper ? {} : { id: { in: user.companyIds } };

    const [companies, totalProducts, totalIngredients, totalManufacturers, pendingInquiries] =
      await Promise.all([
        prisma.company.findMany({
          where: companyFilter,
          select: {
            id: true,
            name: true,
            slug: true,
            accentColor: true,
            _count: {
              select: {
                companyProducts: { where: { isPublished: true } },
                inquiries: { where: { status: "PENDING" } },
              },
            },
          },
        }),
        prisma.product.count(),
        prisma.ingredient.count(),
        prisma.manufacturer.count(),
        prisma.inquiry.count({
          where: {
            status: "PENDING",
            ...(isSuper ? {} : { companyId: { in: user.companyIds } }),
          },
        }),
      ]);

    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalCompanies: companies.length,
          totalProducts,
          totalIngredients,
          totalManufacturers,
          pendingInquiries,
        },
        companies,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 2. Inquiries Management
adminRouter.get("/inquiries", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const isSuper = user.role === "SUPER_ADMIN";
    const { companyId, status } = req.query;

    const where: any = {};
    if (!isSuper) {
      where.companyId = { in: user.companyIds };
    } else if (companyId && typeof companyId === "string") {
      where.companyId = companyId;
    }

    if (status && typeof status === "string") {
      where.status = status;
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true, slug: true, accentColor: true },
        },
        product: {
          select: { id: true, name: true, slug: true, dosageForm: true, packaging: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: inquiries,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/inquiries/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      throw new ApiError(404, "Inquiry not found");
    }

    if (!checkCompanyAccess(user, inquiry.companyId)) {
      throw new ApiError(403, "Forbidden: You cannot modify inquiries for this company");
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
    });

    res.json({
      success: true,
      message: "Inquiry updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// 3. Company Profile Management
const companyUpdateSchema = z.object({
  description: z.string().optional(),
  serviceAreas: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  whatsapp: z.string().optional().nullable(),
  mapUrl: z.string().optional().nullable(),
  businessHours: z.string().optional(),
  drugLicenseNo: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  tagline: z.string().optional().nullable(),
});

adminRouter.put("/companies/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    if (!checkCompanyAccess(user, id)) {
      throw new ApiError(403, "Forbidden: You do not have permission to manage this company");
    }

    const body = companyUpdateSchema.parse(req.body);
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: body,
    });

    res.json({
      success: true,
      message: "Company profile updated successfully",
      data: updatedCompany,
    });
  } catch (err) {
    next(err);
  }
});

// 4. Products Management (List all, create shared, update shared)
adminRouter.get("/products", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        manufacturer: true,
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        companyProducts: {
          include: {
            company: {
              select: { id: true, name: true, slug: true, accentColor: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (err) {
    next(err);
  }
});

// Create shared product (Super admin only - strictly NO product images)
const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  manufacturerId: z.string(),
  dosageForm: z.string().min(2),
  packaging: z.string().min(2),
  description: z.string().optional(),
  storageConditions: z.string().optional(),
  schedule: z.string().optional(),
  ingredients: z.array(
    z.object({
      ingredientId: z.string(),
      quantity: z.number().positive(),
      unit: z.string(),
      perBasis: z.string(),
      isPrimary: z.boolean().default(false),
    })
  ).min(1, "At least one active ingredient is required"),
});

adminRouter.post("/products", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createProductSchema.parse(req.body);

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        manufacturerId: body.manufacturerId,
        dosageForm: body.dosageForm,
        packaging: body.packaging,
        description: body.description,
        storageConditions: body.storageConditions,
        schedule: body.schedule,
        ingredients: {
          create: body.ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
            perBasis: ing.perBasis,
            isPrimary: ing.isPrimary,
          })),
        },
      },
      include: {
        manufacturer: true,
        ingredients: {
          include: { ingredient: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Shared product created successfully",
      data: product,
    });
  } catch (err) {
    next(err);
  }
});

// 5. Toggle Company Listing (Publish / Feature)
const toggleListingSchema = z.object({
  companyId: z.string(),
  productId: z.string(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  itemCode: z.string().optional().nullable(),
  distributorNotes: z.string().optional().nullable(),
});

adminRouter.post("/company-products/toggle", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { companyId, productId, isPublished, isFeatured, itemCode, distributorNotes } =
      toggleListingSchema.parse(req.body);

    if (!checkCompanyAccess(user, companyId)) {
      throw new ApiError(403, "Forbidden: You cannot modify catalog listings for this company");
    }

    const listing = await prisma.companyProduct.upsert({
      where: {
        companyId_productId: {
          companyId,
          productId,
        },
      },
      update: {
        ...(isPublished !== undefined ? { isPublished } : {}),
        ...(isFeatured !== undefined ? { isFeatured } : {}),
        ...(itemCode !== undefined ? { itemCode } : {}),
        ...(distributorNotes !== undefined ? { distributorNotes } : {}),
      },
      create: {
        companyId,
        productId,
        isPublished: isPublished ?? true,
        isFeatured: isFeatured ?? false,
        itemCode: itemCode || null,
        distributorNotes: distributorNotes || null,
      },
    });

    res.json({
      success: true,
      message: "Company catalog listing updated",
      data: listing,
    });
  } catch (err) {
    next(err);
  }
});

// 6. Manufacturers Management & Logo Updates
adminRouter.get("/manufacturers", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      include: {
        _count: {
          select: {
            products: true,
            companyManufacturers: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: manufacturers,
    });
  } catch (err) {
    next(err);
  }
});

// Super Admin: Create or edit manufacturer display name and logo URL
const manufacturerSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  website: z.string().url().optional().nullable().or(z.literal("")),
  logoUrl: z.string().optional().nullable().or(z.literal("")),
});

adminRouter.post("/manufacturers", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = manufacturerSchema.parse(req.body);

    const manufacturer = await prisma.manufacturer.upsert({
      where: { slug: body.slug },
      update: {
        name: body.name,
        website: body.website || null,
        logoUrl: body.logoUrl || null,
      },
      create: {
        name: body.name,
        slug: body.slug,
        website: body.website || null,
        logoUrl: body.logoUrl || null,
        isDemo: false,
      },
    });

    res.json({
      success: true,
      message: "Manufacturer updated successfully",
      data: manufacturer,
    });
  } catch (err) {
    next(err);
  }
});

// 7. Multer storage for manufacturer logos ONLY
const uploadDir = path.resolve(__dirname, "../../public/uploads/logos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `mfg_logo_${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max for logos
  fileFilter: (req, file, cb) => {
    const allowed = [".png", ".jpg", ".jpeg", ".svg", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only authorized image and SVG formats (.svg, .png, .jpg) are allowed for manufacturer logos"));
    }
  },
});

adminRouter.post(
  "/upload-logo",
  requireSuperAdmin,
  upload.single("logo"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new ApiError(400, "No logo file uploaded");
      }

      const relativeUrl = `/uploads/logos/${req.file.filename}`;
      res.json({
        success: true,
        logoUrl: relativeUrl,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 8. Canonical Ingredients & Aliases Management
adminRouter.get("/ingredients", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      include: {
        aliases: true,
        _count: {
          select: {
            productIngredients: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: ingredients,
    });
  } catch (err) {
    next(err);
  }
});

const ingredientSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional().nullable(),
  aliases: z.array(z.string()).default([]),
});

adminRouter.post("/ingredients", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = ingredientSchema.parse(req.body);

    const ingredient = await prisma.ingredient.upsert({
      where: { slug: body.slug },
      update: {
        name: body.name,
        description: body.description || null,
      },
      create: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
      },
    });

    // Sync aliases
    if (body.aliases && body.aliases.length > 0) {
      for (const alias of body.aliases) {
        const trimmed = alias.trim();
        if (trimmed) {
          await prisma.ingredientAlias.upsert({
            where: {
              ingredientId_aliasName: {
                ingredientId: ingredient.id,
                aliasName: trimmed,
              },
            },
            update: {},
            create: {
              ingredientId: ingredient.id,
              aliasName: trimmed,
            },
          });
        }
      }
    }

    const fullIngredient = await prisma.ingredient.findUnique({
      where: { id: ingredient.id },
      include: { aliases: true },
    });

    res.json({
      success: true,
      message: "Ingredient & aliases saved",
      data: fullIngredient,
    });
  } catch (err) {
    next(err);
  }
});
