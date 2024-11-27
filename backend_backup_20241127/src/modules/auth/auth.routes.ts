// src/modules/auth/auth.routes.ts

import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthMiddleware } from "./auth.middleware";

const router = Router();

// Public routes
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh); // เพิ่ม refresh token route

// Protected routes
router.get("/me", AuthMiddleware.protect, AuthController.getMe);

export const authRoutes = router;
