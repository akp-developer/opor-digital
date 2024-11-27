// src/modules/users/user.validation.ts

import { body, param } from "express-validator";

export const userValidation = {
  // สำหรับสร้าง user ใหม่
  createUser: [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username ต้องมีความยาว 3-30 ตัวอักษร")
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage("Username ต้องประกอบด้วยตัวอักษร ตัวเลข - และ _ เท่านั้น"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("กรุณาใส่อีเมลที่ถูกต้อง")
      .normalizeEmail(),

    body("password")
      .isLength({ min: 6 })
      .withMessage("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร")
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
      .withMessage("รหัสผ่านต้องประกอบด้วยตัวอักษรและตัวเลขอย่างน้อย 1 ตัว"),

    body("firstName").trim().notEmpty().withMessage("กรุณาระบุชื่อ"),

    body("lastName").trim().notEmpty().withMessage("กรุณาระบุนามสกุล"),

    body("role")
      .isIn(["admin", "staff", "user"])
      .withMessage("Role ไม่ถูกต้อง"),
  ],

  // สำหรับอัพเดท user
  updateUser: [
    param("id").isMongoId().withMessage("User ID ไม่ถูกต้อง"),

    body("username")
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username ต้องมีความยาว 3-30 ตัวอักษร")
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage("Username ต้องประกอบด้วยตัวอักษร ตัวเลข - และ _ เท่านั้น"),

    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("กรุณาใส่อีเมลที่ถูกต้อง")
      .normalizeEmail(),

    body(["firstName", "lastName"])
      .optional()
      .trim()
      .notEmpty()
      .withMessage("ชื่อและนามสกุลต้องไม่ว่าง"),

    body("role")
      .optional()
      .isIn(["admin", "staff", "user"])
      .withMessage("Role ไม่ถูกต้อง"),
  ],

  // สำหรับเปลี่ยนรหัสผ่าน
  updatePassword: [
    param("id").isMongoId().withMessage("User ID ไม่ถูกต้อง"),

    body("currentPassword").notEmpty().withMessage("กรุณาระบุรหัสผ่านปัจจุบัน"),

    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร")
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
      .withMessage("รหัสผ่านต้องประกอบด้วยตัวอักษรและตัวเลขอย่างน้อย 1 ตัว"),
  ],
};
