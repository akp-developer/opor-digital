import { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "./auth.controller";
import { AuthMiddleware } from "./auth.middleware";
import { registerValidation, loginValidation } from "./auth.validation";

const router = Router();

// Debug middleware for auth routes
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Auth Route:", req.method, req.url);
  console.log("Body:", req.body);
  next();
});

// Public routes
router.post(
  "/register",
  registerValidation,
  (req: Request, res: Response, next: NextFunction) => {
    console.log("Register validation passed");
    next();
  },
  AuthController.register
);

router.post(
  "/login",
  loginValidation,
  (req: Request, res: Response, next: NextFunction) => {
    console.log("Login validation passed");
    next();
  },
  AuthController.login
);

router.post("/refresh", AuthController.refresh);

// Protected routes
router.get("/me", AuthMiddleware.protect, AuthController.getMe);

export const authRoutes = router;
