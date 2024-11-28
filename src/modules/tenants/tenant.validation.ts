import { body, query, param } from "express-validator";

const moduleList: string[] = [
  "user_management",
  "calendar",
  "news_management",
  "garbage_fee",
  "e_document",
];

export const tenantValidation = {
  createTenant: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("กรุณาระบุชื่อ tenant")
      .isLength({ min: 3, max: 100 }),

    body("code")
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9-]+$/),

    body("modules")
      .isArray({ min: 1 })
      .custom((modules: string[]) =>
        modules.every((m: string) => moduleList.includes(m))
      ),
  ],

  updateTenant: [
    param("id").isMongoId(),
    body("name").optional().trim().isLength({ min: 3 }),
    body("domain").optional().isURL(),
    body("modules")
      .optional()
      .isArray()
      .custom((modules: string[]) =>
        modules.every((m: string) => moduleList.includes(m))
      ),
  ],

  getTenant: [param("id").isMongoId()],

  getTenantByCode: [param("code").trim().notEmpty()],

  searchTenants: [query("name").optional().trim().isLength({ min: 2 })],

  updateStatus: [
    param("id").isMongoId(),
    body("status").isIn(["active", "inactive", "suspended"]),
  ],

  updateModules: [
    param("id").isMongoId(),
    body("modules")
      .isArray({ min: 1 })
      .custom((modules: string[]) =>
        modules.every((m: string) => moduleList.includes(m))
      ),
  ],
};
