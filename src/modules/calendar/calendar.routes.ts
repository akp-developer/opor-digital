import { Router } from "express";
import { body, query, param } from "express-validator";
import CalendarController from "./calendar.controller";
import { AuthMiddleware } from "../auth/auth.middleware";
import { validateRequest } from "../../core/middleware/validation.middleware";
import { CalendarMiddleware } from "./calendar.middleware";
import multer from "multer";
import qrController from "./qr.controller";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Protect all routes
router.use(AuthMiddleware.protect);

// Validation rules
const eventValidation = {
  create: [
    body("title")
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("ชื่อกิจกรรมต้องมีความยาว 1-200 ตัวอักษร"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("รายละเอียดต้องไม่เกิน 1000 ตัวอักษร"),
    body("startDate").isISO8601().withMessage("วันที่เริ่มต้นไม่ถูกต้อง"),
    body("endDate").isISO8601().withMessage("วันที่สิ้นสุดไม่ถูกต้อง"),
    body("location")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("สถานที่ต้องไม่เกิน 500 ตัวอักษร"),
    body("type")
      .isIn(["normal", "holiday", "meeting"])
      .withMessage("ประเภทกิจกรรมไม่ถูกต้อง"),
    body("participants")
      .optional()
      .isArray()
      .withMessage("รูปแบบผู้เข้าร่วมไม่ถูกต้อง"),
    body("participants.*")
      .optional()
      .isMongoId()
      .withMessage("รหัสผู้เข้าร่วมไม่ถูกต้อง"),
    body("recurrence")
      .optional()
      .isObject()
      .withMessage("รูปแบบการทำซ้ำไม่ถูกต้อง"),
    body("recurrence.type")
      .optional()
      .isIn(["daily", "weekly", "monthly", "yearly"])
      .withMessage("ประเภทการทำซ้ำไม่ถูกต้อง"),
    body("recurrence.interval")
      .optional()
      .isInt({ min: 1 })
      .withMessage("ช่วงเวลาการทำซ้ำต้องมากกว่า 0"),
    body("recurrence.endDate")
      .optional()
      .isISO8601()
      .withMessage("วันที่สิ้นสุดการทำซ้ำไม่ถูกต้อง"),
  ],
  update: [
    param("id").isMongoId().withMessage("รหัสกิจกรรมไม่ถูกต้อง"),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("ชื่อกิจกรรมต้องมีความยาว 1-200 ตัวอักษร"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("รายละเอียดต้องไม่เกิน 1000 ตัวอักษร"),
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("วันที่เริ่มต้นไม่ถูกต้อง"),
    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("วันที่สิ้นสุดไม่ถูกต้อง"),
  ],
  updateStatus: [
    param("id").isMongoId().withMessage("รหัสกิจกรรมไม่ถูกต้อง"),
    body("status")
      .isIn(["active", "cancelled", "completed"])
      .withMessage("สถานะไม่ถูกต้อง"),
  ],
  getEvents: [
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("วันที่เริ่มต้นไม่ถูกต้อง"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("วันที่สิ้นสุดไม่ถูกต้อง"),
    query("type")
      .optional()
      .isIn(["normal", "holiday", "meeting"])
      .withMessage("ประเภทกิจกรรมไม่ถูกต้อง"),
    query("status")
      .optional()
      .isIn(["active", "cancelled", "completed"])
      .withMessage("สถานะไม่ถูกต้อง"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("หน้าต้องเป็นตัวเลขที่มากกว่า 0"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("จำนวนรายการต่อหน้าต้องอยู่ระหว่าง 1-100"),
  ],
};

// Routes
// Get all events with filters and pagination
router.get(
  "/",
  eventValidation.getEvents,
  validateRequest,
  CalendarController.getEvents
);

// Get specific event
router.get(
  "/:id",
  param("id").isMongoId().withMessage("รหัสกิจกรรมไม่ถูกต้อง"),
  validateRequest,
  CalendarController.getEvent
);

// Create new event
router.post(
  "/",
  eventValidation.create,
  validateRequest,
  CalendarController.createEvent
);

// Update event
router.put(
  "/:id",
  eventValidation.update,
  validateRequest,
  CalendarController.updateEvent
);

// Delete event
router.delete(
  "/:id",
  param("id").isMongoId().withMessage("รหัสกิจกรรมไม่ถูกต้อง"),
  validateRequest,
  CalendarController.deleteEvent
);

// Update event status
router.patch(
  "/:id/status",
  eventValidation.updateStatus,
  validateRequest,
  CalendarController.updateStatus
);

// เพิ่ม middleware ในเส้นทางที่ต้องการ
router.post(
  "/",
  upload.array("attachments", 5), // รองรับการอัพโหลดไฟล์สูงสุด 5 ไฟล์
  eventValidation.create,
  validateRequest,
  CalendarMiddleware.validateRecurrence,
  CalendarMiddleware.checkEventConflict,
  CalendarController.createEvent
);

router.put(
  "/:id",
  upload.array("attachments", 5),
  eventValidation.update,
  validateRequest,
  CalendarMiddleware.checkEventPermission,
  CalendarMiddleware.validateRecurrence,
  CalendarMiddleware.checkEventConflict,
  CalendarController.updateEvent
);


// QR Code routes
router.get("/:eventId/qr", AuthMiddleware.protect, qrController.generateQR);

router.post(
  "/:eventId/qr-checkin",
  AuthMiddleware.protect,
  qrController.checkInWithQR
);

// Report route
router.get(
  "/:eventId/report",
  AuthMiddleware.protect,
  qrController.downloadReport
);

export default router;
