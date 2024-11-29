import { Request, Response } from "express";
import { QRService } from "../../services/qr.service";
import { ReportService } from "../../services/report.service";
import { RequestWithUser } from "../../types/user.types";

class QRController {
  // สร้าง QR Code สำหรับเช็คอิน
  async generateQR(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { expiresIn } = req.query;

      const qrCode = await QRService.generateEventQR(
        eventId,
        expiresIn ? parseInt(expiresIn as string) : 5
      );

      res.status(200).json({
        success: true,
        data: {
          qrCode,
        },
      });
    } catch (error) {
      console.error("Generate QR error:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการสร้าง QR Code",
      });
    }
  }

  // เช็คอินด้วย QR Code
  async checkInWithQR(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { token } = req.body;

      const isValid = await QRService.verifyQRToken(eventId, token);
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: "QR Code ไม่ถูกต้องหรือหมดอายุ",
        });
        return;
      }

      // ทำการเช็คอิน (ใช้ logic เดิมจาก CheckinController)
      // ...

      res.status(200).json({
        success: true,
        message: "เช็คอินสำเร็จ",
      });
    } catch (error) {
      console.error("QR check-in error:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการเช็คอิน",
      });
    }
  }

  // ดาวน์โหลดรายงานการเข้าร่วมกิจกรรม
  async downloadReport(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: "ไม่พบข้อมูลผู้ใช้",
        });
        return;
      }

      const reportBuffer = await ReportService.generateAttendanceReport(
        eventId,
        tenantId
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=attendance-report.xlsx"
      );

      // แปลง Uint8Array เป็น Buffer
      res.send(Buffer.from(reportBuffer));
    } catch (error) {
      console.error("Download report error:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดาวน์โหลดรายงาน",
      });
    }
  }
}

export default new QRController();
