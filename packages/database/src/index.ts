import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

// Load root and package .env files
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

const defaultDbPath = path.resolve(__dirname, "../prisma/dev.db").replace(/\\/g, "/");
const dbUrl = process.env.DATABASE_URL || `file:${defaultDbPath}`;

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export * from "@prisma/client";
