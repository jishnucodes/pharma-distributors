import dotenv from "dotenv";
import path from "path";

// Load root .env if available, or local
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "lk-pharma-super-secret-jwt-key-2026-distribution-platform",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:5000",
};
