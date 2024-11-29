import { Request, Response, NextFunction } from "express";
import { EventModel } from "../../models/calendar.model";
import { RequestWithUser } from "../../types/user.types";

export class CalendarMiddleware {
  // ตรวจสอบสิทธิ์ในการจัดการกิจกรรม
  static async checkEventPermission(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const eventId = req.params.id;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const event = await EventModel.findById(eventId);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบกิจกรรมที่ต้องการ",
        });
      }

      // ตรวจสอบว่าเป็น admin หรือเป็นผู้สร้างกิจกรรม
      if (userRole === "admin" || event.createdBy.toString() === userId) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: "ไม่มีสิทธิ์ในการดำเนินการนี้",
        });
      }
    } catch (error) {
      console.error("Check event permission error:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์",
      });
    }
  }

  // ตรวจสอบการซ้ำซ้อนของกิจกรรม
  static async checkEventConflict(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { startDate, endDate, participants } = req.body;
      const tenantId = req.user?.tenantId;
      const eventId = req.params.id; // สำหรับกรณี update

      // ตรวจสอบการซ้ำซ้อนของเวลาสำหรับผู้เข้าร่วม
      if (participants && participants.length > 0) {
        const conflictQuery = {
          tenantId,
          status: "active",
          participants: { $in: participants },
          $or: [
            {
              startDate: { $lt: new Date(endDate) },
              endDate: { $gt: new Date(startDate) },
            },
          ],
        };

        // ถ้าเป็นการ update ไม่นับรวมตัวเอง
        if (eventId) {
          Object.assign(conflictQuery, { _id: { $ne: eventId } });
        }

        const conflictingEvent = await EventModel.findOne(conflictQuery);

        if (conflictingEvent) {
          return res.status(409).json({
            success: false,
            message: "มีกิจกรรมที่ซ้ำซ้อนกับผู้เข้าร่วมในช่วงเวลานี้",
            conflictingEvent: {
              id: conflictingEvent._id,
              title: conflictingEvent.title,
              startDate: conflictingEvent.startDate,
              endDate: conflictingEvent.endDate,
            },
          });
        }
      }

      next();
    } catch (error) {
      console.error("Check event conflict error:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบการซ้ำซ้อน",
      });
    }
  }

  // ตรวจสอบความถูกต้องของการทำซ้ำกิจกรรม
  static validateRecurrence(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) {
    const { recurrence } = req.body;

    if (recurrence) {
      const { type, interval, endDate } = recurrence;

      // ตรวจสอบว่า endDate ของการทำซ้ำต้องมาหลัง startDate ของกิจกรรม
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        return res.status(400).json({
          success: false,
          message: "วันที่สิ้นสุดการทำซ้ำต้องมาหลังวันที่เริ่มต้นกิจกรรม",
        });
      }

      // ตรวจสอบความถี่ของการทำซ้ำ
      if (interval < 1) {
        return res.status(400).json({
          success: false,
          message: "ความถี่ของการทำซ้ำต้องมากกว่า 0",
        });
      }

      // ตรวจสอบประเภทการทำซ้ำ
      const validTypes = ["daily", "weekly", "monthly", "yearly"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "ประเภทการทำซ้ำไม่ถูกต้อง",
        });
      }
    }

    next();
  }
}
