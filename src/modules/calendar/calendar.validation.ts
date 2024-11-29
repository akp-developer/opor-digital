import { body, param, query } from "express-validator";

export const calendarValidation = {
  // การตรวจสอบพารามิเตอร์สำหรับการดึงรายการกิจกรรม
  getEvents: [
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("รูปแบบวันที่เริ่มต้นไม่ถูกต้อง"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("รูปแบบวันที่สิ้นสุดไม่ถูกต้อง")
      .custom((endDate, { req }) => {
        if (endDate && req.query.startDate) {
          if (new Date(endDate) < new Date(req.query.startDate as string)) {
            throw new Error("วันที่สิ้นสุดต้องมาหลังวันที่เริ่มต้น");
          }
        }
        return true;
      }),
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

  // การตรวจสอบการสร้างกิจกรรมใหม่
  createEvent: [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("กรุณาระบุชื่อกิจกรรม")
      .isLength({ max: 200 })
      .withMessage("ชื่อกิจกรรมต้องไม่เกิน 200 ตัวอักษร"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("รายละเอียดต้องไม่เกิน 1000 ตัวอักษร"),
    body("startDate")
      .notEmpty()
      .withMessage("กรุณาระบุวันที่เริ่มต้น")
      .isISO8601()
      .withMessage("รูปแบบวันที่เริ่มต้นไม่ถูกต้อง"),
    body("endDate")
      .notEmpty()
      .withMessage("กรุณาระบุวันที่สิ้นสุด")
      .isISO8601()
      .withMessage("รูปแบบวันที่สิ้นสุดไม่ถูกต้อง")
      .custom((endDate, { req }) => {
        if (new Date(endDate) < new Date(req.body.startDate)) {
          throw new Error("วันที่สิ้นสุดต้องมาหลังวันที่เริ่มต้น");
        }
        return true;
      }),
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
    body("reminders")
      .optional()
      .isArray()
      .withMessage("รูปแบบการแจ้งเตือนไม่ถูกต้อง"),
  ],

  // การตรวจสอบการอัพเดทกิจกรรม
  updateEvent: [
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
      .withMessage("รูปแบบวันที่เริ่มต้นไม่ถูกต้อง"),
    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("รูปแบบวันที่สิ้นสุดไม่ถูกต้อง")
      .custom((endDate, { req }) => {
        if (endDate && req.body.startDate) {
          if (new Date(endDate) < new Date(req.body.startDate)) {
            throw new Error("วันที่สิ้นสุดต้องมาหลังวันที่เริ่มต้น");
          }
        }
        return true;
      }),
  ],

  // การตรวจสอบการอัพเดทสถานะ
  updateStatus: [
    param("id").isMongoId().withMessage("รหัสกิจกรรมไม่ถูกต้อง"),
    body("status")
      .isIn(["active", "cancelled", "completed"])
      .withMessage("สถานะไม่ถูกต้อง"),
  ],
};
