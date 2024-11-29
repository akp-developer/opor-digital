import { Request, Response } from "express";
import { EventCheckinModel } from "../../models/event-checkin.model";
import { EventModel } from "../../models/calendar.model";
import { RequestWithUser } from "../../types/user.types";
import moment from "moment";
import mongoose from "mongoose";

class CheckinController {
  // เช็คอินเข้าร่วมกิจกรรม
  async checkIn(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { location, note } = req.body;
      const userId = req.user?.id;
      const tenantId = req.user?.tenantId;

      if (!userId || !tenantId) {
        res.status(401).json({
          success: false,
          message: "ไม่พบข้อมูลผู้ใช้",
        });
        return;
      }

      // ตรวจสอบว่ากิจกรรมมีอยู่จริง
      const event = await EventModel.findOne({
        _id: eventId,
        tenantId,
        status: "active",
      });

      if (!event) {
        res.status(404).json({
          success: false,
          message: "ไม่พบกิจกรรมที่ต้องการ",
        });
        return;
      }

      // ตรวจสอบว่าผู้ใช้เป็นผู้เข้าร่วมกิจกรรม
      const isParticipant = event.participants?.some(
        (participantId) => participantId.toString() === userId
      );

      if (!isParticipant) {
        res.status(403).json({
          success: false,
          message: "คุณไม่ได้เป็นผู้เข้าร่วมกิจกรรมนี้",
        });
        return;
      }

      // ตรวจสอบการเช็คอินซ้ำ
      const existingCheckin = await EventCheckinModel.findOne({
        eventId,
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (existingCheckin) {
        res.status(400).json({
          success: false,
          message: "คุณได้เช็คอินกิจกรรมนี้ไปแล้ว",
        });
        return;
      }

      // ตรวจสอบสถานะการเข้าร่วม (ตรงเวลา/สาย)
      const now = moment();
      const eventStart = moment(event.startDate);
      const status = now.isAfter(eventStart.add(15, "minutes"))
        ? "late"
        : "present";

      // บันทึกการเช็คอิน
      const checkin = await EventCheckinModel.create({
        eventId,
        userId: new mongoose.Types.ObjectId(userId),
        tenantId: new mongoose.Types.ObjectId(tenantId),
        checkInTime: new Date(),
        location,
        status,
        note,
      });

      await checkin.populate("userId", "username firstName lastName");

      res.status(201).json({
        success: true,
        data: checkin,
      });
    } catch (error) {
      console.error("Check-in error:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการเช็คอิน",
      });
    }
  }

  // เช็คเอาท์ออกจากกิจกรรม
  async checkOut(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { note } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "ไม่พบข้อมูลผู้ใช้",
        });
        return;
      }

      const checkin = await EventCheckinModel.findOne({
        eventId,
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!checkin) {
        res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลการเช็คอิน",
        });
        return;
      }

      if (checkin.checkOutTime) {
        res.status(400).json({
          success: false,
          message: "คุณได้เช็คเอาท์ไปแล้ว",
        });
        return;
      }

      checkin.checkOutTime = new Date();
      if (note) checkin.note = note;
      await checkin.save();

      res.status(200).json({
        success: true,
        data: checkin,
      });
    } catch (error) {
      console.error("Check-out error:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการเช็คเอาท์",
      });
    }
  }

  // ดูรายงานการเข้าร่วมกิจกรรม
  async getEventAttendance(req: RequestWithUser, res: Response): Promise<void> {
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

      const event = await EventModel.findOne({
        _id: eventId,
        tenantId: new mongoose.Types.ObjectId(tenantId),
      });

      if (!event) {
        res.status(404).json({
          success: false,
          message: "ไม่พบกิจกรรมที่ต้องการ",
        });
        return;
      }

      const checkins = await EventCheckinModel.find({ eventId })
        .populate("userId", "username firstName lastName email")
        .sort("checkInTime");

      const summary = {
        total: event.participants?.length || 0,
        present: checkins.filter((c) => c.status === "present").length,
        late: checkins.filter((c) => c.status === "late").length,
        absent: (event.participants?.length || 0) - checkins.length,
      };

      res.status(200).json({
        success: true,
        data: {
          checkins,
          summary,
        },
      });
    } catch (error) {
      console.error("Get attendance error:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลการเข้าร่วม",
      });
    }
  }
}

export default new CheckinController();
