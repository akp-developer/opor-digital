import { Router } from "express";
import tenantController from "./tenant.controller";
import { AuthMiddleware } from "../auth/auth.middleware";
import { checkRole } from "../../core/middleware/role.middleware";
import { validateRequest } from "../../core/middleware/validation.middleware";
import { tenantValidation } from "./tenant.validation";

const router = Router();

// Initialize system route (ต้องอยู่ก่อน middleware)
router.post("/initialize", tenantController.initializeSystem);

// Protect all routes below
router.use(AuthMiddleware.protect);


// Public routes (still need authentication)
router.get(
  "/search",
  tenantValidation.searchTenants,
  validateRequest,
  tenantController.searchTenants
);

router.get(
  "/code/:code",
  tenantValidation.getTenantByCode,
  validateRequest,
  tenantController.getTenantByCode
);

// Admin only routes
router.use(checkRole(["admin"]));

router
  .route("/")
  .get(tenantController.getTenants)
  .post(
    tenantValidation.createTenant,
    validateRequest,
    tenantController.createTenant
  );

router
  .route("/:id")
  .get(tenantValidation.getTenant, validateRequest, tenantController.getTenant)
  .put(
    tenantValidation.updateTenant,
    validateRequest,
    tenantController.updateTenant
  )
  .delete(
    tenantValidation.getTenant,
    validateRequest,
    tenantController.deleteTenant
  );

router.patch(
  "/:id/status",
  tenantValidation.updateStatus,
  validateRequest,
  tenantController.updateStatus
);

router.patch(
  "/:id/modules",
  tenantValidation.updateModules,
  validateRequest,
  tenantController.updateModules
);

export default router;
