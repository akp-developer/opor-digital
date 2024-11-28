import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authRoutes } from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import tenantRoutes from "./modules/tenants/tenant.routes"; // เพิ่มบรรทัดนี้

const app = express();

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  if (req.body && Object.keys(req.body).length) {
    console.log("Body:", req.body);
  }
  next();
});

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/health", (req, res) => {
  console.log("Health check requested");
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Base route
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to OPOR Digital API" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tenants", tenantRoutes); // เพิ่มบรรทัดนี้

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error occurred:", {
      method: req.method,
      url: req.url,
      error: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

// Handle 404
app.use((req, res) => {
  console.log("404 Not Found:", req.method, req.url);
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
