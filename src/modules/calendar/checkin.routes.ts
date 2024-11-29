import { Router } from "express";
import { body, param } from "express-validator";
import CheckinController from "./checkin.controller";
import { AuthMiddleware } from "../auth/auth.middleware";
import { validateRequest } from "../../core/middleware/validation.middleware";

const router = Router();

// Protect all routes
router.use(AuthMiddleware.protect);

// Validation rules
const checkinValidation = {
  checkIn: [
    param("eventId").isMongoId().withMessage("รหัสกิจกรรมไม่ถูกต้อง"),
    body("location")
      .optional()
      .isObject()
      .withMessage("รูปแบบตำแหน่งไม่ถูกต้อง"),
    body("location.latitude")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("ละติจูดไม่ถูกต้อง"),
    body("location.longitude")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("ลองจิจูดไม่ถูกต้อง"),
    body("note")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage("บันทึกต้องไม่เกิน 500 ตัวอักษร"),
  ],
  checkOut: [
    param("eventId").isMongoId().withMessage("รหัสกิจกรรมไม่ถูกต้อง"),
    body("note")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage("บันทึกต้องไม่เกิน 500 ตัวอักษร"),
  ],
};

// Routes
// Check-in to event
router.post(
  "/:eventId/checkin",
  checkinValidation.checkIn,
  validateRequest,
  CheckinController.checkIn
);

// Check-out from event
router.post(
  "/:eventId/checkout",
  checkinValidation.checkOut,
  validateRequest,
  CheckinController.checkOut
);

// Get event attendance report
router.get(
  "/:eventId/attendance",
  param("eventId").isMongoId().withMessage("รหัสกิจกรรมไม่ถูกต้อง"),
  validateRequest,
  CheckinController.getEventAttendance
);

export default router;
