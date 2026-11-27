import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { prisma } from "@lk/database";
import { ApiError } from "./errorHandler";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "COMPANY_ADMIN" | "COMPANY_STAFF";
  companyIds: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
      company?: any;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication token missing or invalid");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        memberships: {
          select: {
            companyId: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(401, "User not found or session expired");
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "SUPER_ADMIN" | "COMPANY_ADMIN" | "COMPANY_STAFF",
      companyIds: user.memberships.map((m) => m.companyId),
    };

    next();
  } catch (err: any) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Invalid or expired token"));
    }
    next(err);
  }
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new ApiError(401, "Unauthorized"));
  }
  if (req.user.role !== "SUPER_ADMIN") {
    return next(new ApiError(403, "Forbidden: Super Administrator privileges required"));
  }
  next();
}

export function checkCompanyAccess(user: AuthUser, companyId: string): boolean {
  if (user.role === "SUPER_ADMIN") return true;
  return user.companyIds.includes(companyId);
}

/**
 * Middleware that verifies the authenticated user has staff or admin access
 * to the company specified in the route slug (:slug or :companySlug).
 */
export async function requireCompanyStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const rawSlug = req.params.slug || req.params.companySlug;
    if (!rawSlug) {
      throw new ApiError(400, "Company identifier parameter missing");
    }

    const s = rawSlug.toLowerCase().trim();
    const candidateSlugs =
      s === "kothottil-pharma" || s === "kothittil-pharma" || s === "kothootil-pharma"
        ? ["kothottil-pharma", "kothittil-pharma", "kothootil-pharma"]
        : [s];

    const company = await prisma.company.findFirst({
      where: {
        slug: { in: candidateSlugs },
        isActive: true,
      },
    });

    if (!company) {
      throw new ApiError(404, `Company '${rawSlug}' not found or inactive`);
    }

    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!checkCompanyAccess(req.user, company.id)) {
      throw new ApiError(403, `Access denied: You are not an authorized staff member of ${company.name}`);
    }

    req.company = company;
    next();
  } catch (err) {
    next(err);
  }
}
