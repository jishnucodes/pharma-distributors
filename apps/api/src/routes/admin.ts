import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "@lk/database";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as bcrypt from "bcryptjs";
import { ApiError } from "../middleware/errorHandler";
import { requireAuth, requireSuperAdmin, checkCompanyAccess } from "../middleware/auth";
import { memoryCache } from "../utils/cache";

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

// 2. Inquiries Management (With Server-Side Pagination & Search)
adminRouter.get("/inquiries", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const isSuper = user.role === "SUPER_ADMIN";
    const { companyId, status, page, limit, search } = req.query;

    const where: any = {};
    if (!isSuper) {
      where.companyId = { in: user.companyIds };
    } else if (companyId && typeof companyId === "string" && companyId !== "ALL") {
      where.companyId = companyId;
    }

    if (status && typeof status === "string" && status !== "ALL") {
      where.status = status;
    }

    if (search && typeof search === "string" && search.trim()) {
      const st = search.trim();
      where.OR = [
        { name: { contains: st, mode: "insensitive" } },
        { businessName: { contains: st, mode: "insensitive" } },
        { phone: { contains: st, mode: "insensitive" } },
        { email: { contains: st, mode: "insensitive" } },
        { message: { contains: st, mode: "insensitive" } },
      ];
    }

    const isAll = limit === "all";
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const takeNum = isAll ? undefined : Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const skipNum = isAll ? undefined : (pageNum - 1) * takeNum!;

    const [total, inquiries] = await Promise.all([
      prisma.inquiry.count({ where }),
      prisma.inquiry.findMany({
        where,
        skip: skipNum,
        take: takeNum,
        include: {
          company: {
            select: { id: true, name: true, slug: true, accentColor: true },
          },
          product: {
            select: { id: true, name: true, slug: true, dosageForm: true, packaging: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        total,
        page: pageNum,
        limit: takeNum || total,
        totalPages: takeNum ? Math.ceil(total / takeNum) || 1 : 1,
      },
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

    memoryCache.clear();

    res.json({
      success: true,
      message: "Company profile updated successfully",
      data: updatedCompany,
    });
  } catch (err) {
    next(err);
  }
});

// 3b. Company Field Representative & Delivery Routes Management
const companyRouteSchema = z.object({
  personName: z.string().min(1, "Person name is required"),
  designation: z.string().optional().nullable(),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().optional().nullable(),
  routeAreas: z.string().min(1, "Route / areas covered is required"),
  schedule: z.string().min(1, "Schedule is required"),
  mapUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  orderIndex: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// List all routes for a company
adminRouter.get("/companies/:id/routes", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    if (!checkCompanyAccess(user, id)) {
      throw new ApiError(403, "Forbidden: You do not have permission to manage this company");
    }

    const routes = await prisma.companyRoute.findMany({
      where: { companyId: id },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
    });

    res.json({
      success: true,
      data: routes,
    });
  } catch (err) {
    next(err);
  }
});

// Create new route representative for a company
adminRouter.post("/companies/:id/routes", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    if (!checkCompanyAccess(user, id)) {
      throw new ApiError(403, "Forbidden: You do not have permission to manage this company");
    }

    const body = companyRouteSchema.parse(req.body);
    const newRoute = await prisma.companyRoute.create({
      data: {
        companyId: id,
        personName: body.personName,
        designation: body.designation || null,
        phone: body.phone,
        email: body.email && body.email.trim() ? body.email.trim() : null,
        routeAreas: body.routeAreas,
        schedule: body.schedule,
        mapUrl: body.mapUrl && body.mapUrl.trim() ? body.mapUrl.trim() : null,
        notes: body.notes && body.notes.trim() ? body.notes.trim() : null,
        orderIndex: body.orderIndex ?? 0,
        isActive: body.isActive ?? true,
      },
    });

    memoryCache.clear();

    res.status(201).json({
      success: true,
      message: "Route representative added successfully",
      data: newRoute,
    });
  } catch (err) {
    next(err);
  }
});

// Update route representative for a company
adminRouter.put("/companies/:id/routes/:routeId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id, routeId } = req.params;

    if (!checkCompanyAccess(user, id)) {
      throw new ApiError(403, "Forbidden: You do not have permission to manage this company");
    }

    const body = companyRouteSchema.partial().parse(req.body);
    const updatedRoute = await prisma.companyRoute.update({
      where: { id: routeId },
      data: {
        ...(body.personName !== undefined && { personName: body.personName }),
        ...(body.designation !== undefined && { designation: body.designation || null }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email && body.email.trim() ? body.email.trim() : null }),
        ...(body.routeAreas !== undefined && { routeAreas: body.routeAreas }),
        ...(body.schedule !== undefined && { schedule: body.schedule }),
        ...(body.mapUrl !== undefined && { mapUrl: body.mapUrl && body.mapUrl.trim() ? body.mapUrl.trim() : null }),
        ...(body.notes !== undefined && { notes: body.notes && body.notes.trim() ? body.notes.trim() : null }),
        ...(body.orderIndex !== undefined && { orderIndex: body.orderIndex }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    memoryCache.clear();

    res.json({
      success: true,
      message: "Route representative updated successfully",
      data: updatedRoute,
    });
  } catch (err) {
    next(err);
  }
});

// Delete route representative for a company
adminRouter.delete("/companies/:id/routes/:routeId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id, routeId } = req.params;

    if (!checkCompanyAccess(user, id)) {
      throw new ApiError(403, "Forbidden: You do not have permission to manage this company");
    }

    await prisma.companyRoute.delete({
      where: { id: routeId },
    });

    memoryCache.clear();

    res.json({
      success: true,
      message: "Route representative deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

// 4. Products Management (With Server-Side Pagination & Filtering)
adminRouter.get("/products", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, q, dosageForm, manufacturerId, companyId } = req.query;

    const where: any = {};

    if (dosageForm && typeof dosageForm === "string" && dosageForm !== "ALL") {
      where.dosageForm = dosageForm;
    }

    if (manufacturerId && typeof manufacturerId === "string" && manufacturerId !== "ALL") {
      where.manufacturerId = manufacturerId;
    }

    if (companyId && typeof companyId === "string" && companyId !== "ALL") {
      where.companyProducts = {
        some: { companyId, isPublished: true },
      };
    }

    if (q && typeof q === "string" && q.trim()) {
      const searchTerm = q.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { slug: { contains: searchTerm, mode: "insensitive" } },
        { packaging: { contains: searchTerm, mode: "insensitive" } },
        {
          ingredients: {
            some: {
              ingredient: {
                name: { contains: searchTerm, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    const isAll = limit === "all";
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const takeNum = isAll ? undefined : Math.max(1, Math.min(200, parseInt(limit as string, 10) || 25));
    const skipNum = isAll ? undefined : (pageNum - 1) * takeNum!;

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: skipNum,
        take: takeNum,
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
      }),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNum,
        limit: takeNum || total,
        totalPages: takeNum ? Math.ceil(total / takeNum) || 1 : 1,
      },
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

    memoryCache.clear();

    res.status(201).json({
      success: true,
      message: "Shared product created successfully",
      data: product,
    });
  } catch (err) {
    next(err);
  }
});

// Update product (Admin & Super Admin)
const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  manufacturerId: z.string().optional(),
  dosageForm: z.string().min(2).optional(),
  packaging: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  storageConditions: z.string().optional().nullable(),
  schedule: z.string().optional().nullable(),
  itemCode: z.string().optional().nullable(),
  distributorNotes: z.string().optional().nullable(),
  companyId: z.string().optional(),
  ingredients: z
    .array(
      z.object({
        ingredientId: z.string(),
        quantity: z.number().positive(),
        unit: z.string(),
        perBasis: z.string().default("per unit"),
        isPrimary: z.boolean().default(false),
      })
    )
    .optional(),
});

adminRouter.put("/products/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const body = updateProductSchema.parse(req.body);

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { ingredients: true },
    });

    if (!existingProduct) {
      throw new ApiError(404, "Product not found");
    }

    if (user.role !== "SUPER_ADMIN" && body.companyId && !checkCompanyAccess(user, body.companyId)) {
      throw new ApiError(403, "Forbidden: You do not have permission to modify this product");
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.manufacturerId !== undefined) updateData.manufacturerId = body.manufacturerId;
    if (body.dosageForm !== undefined) updateData.dosageForm = body.dosageForm;
    if (body.packaging !== undefined) updateData.packaging = body.packaging;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.storageConditions !== undefined) updateData.storageConditions = body.storageConditions;
    if (body.schedule !== undefined) updateData.schedule = body.schedule;

    // Handle ingredients update if provided
    if (body.ingredients && body.ingredients.length > 0) {
      await prisma.$transaction(async (tx) => {
        await tx.productIngredient.deleteMany({
          where: { productId: id },
        });

        await tx.productIngredient.createMany({
          data: body.ingredients!.map((ing) => ({
            productId: id,
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
            perBasis: ing.perBasis,
            isPrimary: ing.isPrimary,
          })),
        });

        if (Object.keys(updateData).length > 0) {
          await tx.product.update({
            where: { id },
            data: updateData,
          });
        }
      });
    } else if (Object.keys(updateData).length > 0) {
      await prisma.product.update({
        where: { id },
        data: updateData,
      });
    }

    // Update company listing specific info if companyId provided
    if (body.companyId && (body.itemCode !== undefined || body.distributorNotes !== undefined)) {
      await prisma.companyProduct.upsert({
        where: {
          companyId_productId: {
            companyId: body.companyId,
            productId: id,
          },
        },
        update: {
          ...(body.itemCode !== undefined ? { itemCode: body.itemCode } : {}),
          ...(body.distributorNotes !== undefined ? { distributorNotes: body.distributorNotes } : {}),
        },
        create: {
          companyId: body.companyId,
          productId: id,
          isPublished: true,
          isFeatured: false,
          itemCode: body.itemCode || null,
          distributorNotes: body.distributorNotes || null,
        },
      });
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        manufacturer: true,
        ingredients: {
          include: { ingredient: true },
        },
        companyProducts: {
          include: {
            company: {
              select: { id: true, name: true, slug: true, accentColor: true },
            },
          },
        },
      },
    });

    memoryCache.clear();

    res.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete("/products/:id", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    memoryCache.clear();
    res.json({ success: true, message: "Product deleted successfully" });
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

    memoryCache.clear();

    res.json({
      success: true,
      message: "Company catalog listing updated",
      data: listing,
    });
  } catch (err) {
    next(err);
  }
});

// 6. Manufacturers & Brand Authorization by Firm
const toggleCompanyMfgSchema = z.object({
  companyId: z.string(),
  manufacturerId: z.string(),
  isAuthorized: z.boolean(),
  partnershipDetails: z.string().optional().nullable(),
});

adminRouter.get("/company-manufacturers", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const isSuper = user.role === "SUPER_ADMIN";
    const companyFilter = isSuper ? {} : { companyId: { in: user.companyIds } };

    const records = await prisma.companyManufacturer.findMany({
      where: companyFilter,
      include: {
        company: {
          select: { id: true, name: true, slug: true, accentColor: true },
        },
        manufacturer: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
      },
      orderBy: [{ company: { name: "asc" } }, { manufacturer: { name: "asc" } }],
    });

    res.json({
      success: true,
      data: records,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/company-manufacturers/toggle", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { companyId, manufacturerId, isAuthorized, partnershipDetails } =
      toggleCompanyMfgSchema.parse(req.body);

    if (!checkCompanyAccess(user, companyId)) {
      throw new ApiError(403, "Forbidden: You cannot modify manufacturer authorization for this company");
    }

    const record = await prisma.companyManufacturer.upsert({
      where: {
        companyId_manufacturerId: {
          companyId,
          manufacturerId,
        },
      },
      update: {
        isAuthorized,
        ...(partnershipDetails !== undefined ? { partnershipDetails } : {}),
      },
      create: {
        companyId,
        manufacturerId,
        isAuthorized,
        partnershipDetails: partnershipDetails || null,
      },
      include: {
        company: {
          select: { id: true, name: true, slug: true },
        },
        manufacturer: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    memoryCache.clear();

    res.json({
      success: true,
      message: `Brand '${record.manufacturer.name}' is now ${isAuthorized ? "authorized & visible" : "hidden"} for ${record.company.name}`,
      data: record,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/manufacturers", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      include: {
        companyManufacturers: {
          include: {
            company: {
              select: { id: true, name: true, slug: true, accentColor: true },
            },
          },
        },
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

// ==========================================
// 12. STAFF & EMPLOYEE MANAGEMENT ENDPOINTS
// ==========================================

/**
 * GET /api/admin/users
 * Lists staff and company admin users.
 * SuperAdmin sees all or filters by company; CompanyAdmin sees their company staff.
 */
adminRouter.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const isSuper = user.role === "SUPER_ADMIN";
    const requestedCompanyId = req.query.companyId as string;

    const where: any = {};

    if (!isSuper) {
      where.memberships = {
        some: {
          companyId: { in: user.companyIds },
        },
      };
    } else if (requestedCompanyId && requestedCompanyId !== "ALL") {
      where.memberships = {
        some: {
          companyId: requestedCompanyId,
        },
      };
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          select: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                shortName: true,
                accentColor: true,
              },
            },
          },
        },
      },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      companies: u.memberships.map((m) => m.company),
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/users
 * Create a new staff or company admin user and assign to distributor company
 */
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email address required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["COMPANY_STAFF", "COMPANY_ADMIN"]),
  companyId: z.string().min(1, "Company assignment is required"),
});

adminRouter.post("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user!;
    const body = createUserSchema.parse(req.body);

    if (currentUser.role !== "SUPER_ADMIN" && !checkCompanyAccess(currentUser, body.companyId)) {
      throw new ApiError(403, "You do not have permission to add staff to this company");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ApiError(409, `An account with email '${body.email}' already exists`);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(body.password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        passwordHash,
        role: body.role,
        memberships: {
          create: {
            companyId: body.companyId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        memberships: {
          include: { company: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: `Staff account created for ${newUser.name}`,
      data: {
        ...newUser,
        companies: newUser.memberships.map((m) => m.company),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/users/:id
 * Edit staff details, company assignment, or reset password
 */
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional().or(z.literal("")),
  role: z.enum(["COMPANY_STAFF", "COMPANY_ADMIN"]).optional(),
  companyId: z.string().optional(),
});

adminRouter.patch("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user!;
    const targetUserId = req.params.id;
    const body = updateUserSchema.parse(req.body);

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { memberships: true },
    });

    if (!targetUser) {
      throw new ApiError(404, "User account not found");
    }

    // Authorization check
    if (currentUser.role !== "SUPER_ADMIN") {
      const isTargetInSameCompany = targetUser.memberships.some((m) =>
        currentUser.companyIds.includes(m.companyId)
      );
      if (!isTargetInSameCompany) {
        throw new ApiError(403, "You do not have permission to manage this user");
      }
      if (body.companyId && !checkCompanyAccess(currentUser, body.companyId)) {
        throw new ApiError(403, "You cannot assign staff to a company outside your jurisdiction");
      }
    }

    const updateData: any = {};
    if (body.name) updateData.name = body.name.trim();
    if (body.email) updateData.email = body.email.toLowerCase().trim();
    if (body.role) updateData.role = body.role;

    if (body.password && body.password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(body.password.trim(), salt);
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
    });

    // Update company membership if companyId was changed
    if (body.companyId) {
      await prisma.companyMembership.deleteMany({
        where: { userId: targetUserId },
      });
      await prisma.companyMembership.create({
        data: {
          userId: targetUserId,
          companyId: body.companyId,
        },
      });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          include: { company: true },
        },
      },
    });

    res.json({
      success: true,
      message: `User '${fullUser?.name}' updated successfully`,
      data: {
        ...fullUser,
        companies: fullUser?.memberships.map((m) => m.company),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/users/:id
 * Remove staff or company admin member
 */
adminRouter.delete("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user!;
    const targetUserId = req.params.id;

    if (currentUser.id === targetUserId) {
      throw new ApiError(400, "You cannot delete your own administrative account");
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { memberships: true },
    });

    if (!targetUser) {
      throw new ApiError(404, "User account not found");
    }

    if (currentUser.role !== "SUPER_ADMIN") {
      const isTargetInSameCompany = targetUser.memberships.some((m) =>
        currentUser.companyIds.includes(m.companyId)
      );
      if (!isTargetInSameCompany) {
        throw new ApiError(403, "You do not have permission to delete this user");
      }
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    res.json({
      success: true,
      message: `Staff member '${targetUser.name}' removed successfully`,
    });
  } catch (err) {
    next(err);
  }
});
