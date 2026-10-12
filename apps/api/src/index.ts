import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";
import { companyRouter } from "./routes/companies";
import { adminRouter } from "./routes/admin";

const app = express();

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Parse allowed origins from CORS_ORIGIN (supports comma-separated values)
const allowedOrigins = config.corsOrigin
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server, health checks)
      if (!origin) return callback(null, true);
      // Allow localhost in development
      if (config.nodeEnv === "development" && origin.includes("localhost")) {
        return callback(null, true);
      }
      // Allow configured origins (Vercel URL, custom domain, etc.)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

// Rate limiter: 250 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 250,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again after 60 seconds.",
  },
});
app.use("/api", limiter);

// Body Parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Static files for uploaded manufacturer logos
const publicDir = path.resolve(__dirname, "../public");
app.use(express.static(publicDir));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "L & K Pharmaceutical Distribution API",
    time: new Date().toISOString(),
  });
});

// Mount Routes
app.use("/api/auth", authRouter);
app.use("/api/companies", companyRouter);
app.use("/api/admin", adminRouter);

// 404 handler for undefined API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route '${req.originalUrl}' not found`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(config.port, () => {
    console.log(`[L & K API] Express Server listening on http://localhost:${config.port}`);
    console.log(`[L & K API] Environment: ${config.nodeEnv}`);
  });
}

export default app;
