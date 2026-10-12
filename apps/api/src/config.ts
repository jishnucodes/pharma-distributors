import dotenv from "dotenv";
import path from "path";

// In production (Render), env vars are injected directly.
// In development, load from root .env or local .env file.
dotenv.config({ path: path.resolve(__dirname, "../../../.env"), override: false });
dotenv.config({ override: false });

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "lk-pharma-super-secret-jwt-key-2026-distribution-platform",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:5000",
};
