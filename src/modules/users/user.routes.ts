// src/modules/users/user.routes.ts

import { Router } from "express";
import { param } from "express-validator"; // เพิ่ม import นี้
import userController from "./user.controller";
import { AuthMiddleware } from "../auth/auth.middleware";
import { checkRole } from "../../core/middleware/role.middleware";
import { validateRequest } from "../../core/middleware/validation.middleware";
import { userValidation } from "./user.validation";

const router = Router();

// Protect all routes
router.use(AuthMiddleware.protect);

// Routes with validation
router.get("/", checkRole(["admin"]), userController.getUsers);

router.get(
  "/:id",
  checkRole(["admin", "staff"]),
  param("id").isMongoId().withMessage("User ID ไม่ถูกต้อง"),
  validateRequest,
  userController.getUser
);

router.post(
  "/",
  checkRole(["admin"]),
  userValidation.createUser,
  validateRequest,
  userController.createUser
);

router.put(
  "/:id",
  checkRole(["admin"]),
  userValidation.updateUser,
  validateRequest,
  userController.updateUser
);

router.delete(
  "/:id",
  checkRole(["admin"]),
  param("id").isMongoId().withMessage("User ID ไม่ถูกต้อง"),
  validateRequest,
  userController.deleteUser
);

router.put(
  "/:id/password",
  userValidation.updatePassword,
  validateRequest,
  userController.updatePassword
);

export default router;