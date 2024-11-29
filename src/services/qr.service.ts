import QRCode from "qrcode";
import { EventModel } from "../models/calendar.model";
import crypto from "crypto";

export class QRService {
  // สร้าง QR Code สำหรับเช็คอิน
  static async generateEventQR(
    eventId: string,
    expiresIn: number = 5
  ): Promise<string> {
    try {
      const event = await EventModel.findById(eventId);
      if (!event) {
        throw new Error("ไม่พบกิจกรรม");
      }

      // สร้าง token สำหรับ QR Code
      const token = crypto.randomBytes(32).toString("hex");
      const expiryTime = Date.now() + expiresIn * 60 * 1000; // แปลงเป็นมิลลิวินาที

      // อัพเดทข้อมูลกิจกรรมด้วย QR token
      event.qrToken = {
        token,
        expiresAt: new Date(expiryTime),
      };
      await event.save();

      // สร้าง QR Code
      const qrData = {
        eventId: event._id,
        token,
        expiresAt: expiryTime,
      };

      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
      return qrCode;
    } catch (error) {
      console.error("Generate QR error:", error);
      throw error;
    }
  }

  // ตรวจสอบ QR Code
  static async verifyQRToken(eventId: string, token: string): Promise<boolean> {
    try {
      const event = await EventModel.findById(eventId);
      if (!event || !event.qrToken) {
        return false;
      }

      // ตรวจสอบว่า token ตรงกันและยังไม่หมดอายุ
      return (
        event.qrToken.token === token && event.qrToken.expiresAt > new Date()
      );
    } catch (error) {
      console.error("Verify QR error:", error);
      return false;
    }
  }
}
