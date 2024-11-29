import { Request } from "express";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export class CalendarAttachment {
  private static readonly UPLOAD_DIR = "uploads/calendar";
  private static readonly ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  static async upload(
    file: Express.Multer.File,
    tenantId: string
  ): Promise<string> {
    try {
      // ตรวจสอบประเภทไฟล์
      if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
        throw new Error("ประเภทไฟล์ไม่ได้รับอนุญาต");
      }

      // ตรวจสอบขนาดไฟล์
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error("ขนาดไฟล์ใหญ่เกินไป");
      }

      // สร้างโฟลเดอร์สำหรับแต่ละ tenant
      const tenantDir = path.join(this.UPLOAD_DIR, tenantId);
      await fs.mkdir(tenantDir, { recursive: true });

      // สร้างชื่อไฟล์ใหม่
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(tenantDir, fileName);

      // บันทึกไฟล์
      await fs.writeFile(filePath, file.buffer);

      // ส่งคืน URL สำหรับเข้าถึงไฟล์
      return `/api/calendar/attachments/${tenantId}/${fileName}`;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  }

  static async delete(fileUrl: string): Promise<void> {
    try {
      // แยกส่วนประกอบของ URL
      const urlParts = fileUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const tenantId = urlParts[urlParts.length - 2];

      // สร้าง path ไฟล์
      const filePath = path.join(this.UPLOAD_DIR, tenantId, fileName);

      // ตรวจสอบว่าไฟล์มีอยู่จริง
      await fs.access(filePath);

      // ลบไฟล์
      await fs.unlink(filePath);
    } catch (error) {
      console.error("File delete error:", error);
      throw error;
    }
  }

  static async validateAttachments(attachments: any[]): Promise<void> {
    if (!Array.isArray(attachments)) {
      throw new Error("รูปแบบไฟล์แนบไม่ถูกต้อง");
    }

    for (const attachment of attachments) {
      if (!attachment.name || !attachment.url || !attachment.type) {
        throw new Error("ข้อมูลไฟล์แนบไม่ครบถ้วน");
      }
    }
  }
}
