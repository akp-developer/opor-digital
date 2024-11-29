import { Request, Response } from "express";
import { EventModel, IEvent } from "../../models/calendar.model";
import { RequestWithUser } from "../../types/user.types";
import mongoose from "mongoose";

class CalendarController {
  // ดึงรายการกิจกรรมทั้งหมด พร้อม pagination และ filters
  async getEvents(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const type = req.query.type as string;
      const status = req.query.status as string;

      const query: any = { tenantId: req.user?.tenantId };

      // เพิ่ม filters ตามเงื่อนไข
      if (startDate && endDate) {
        query.startDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      if (type) query.type = type;
      if (status) query.status = status;

      // ค้นหาและนับจำนวนทั้งหมด
      const [events, total] = await Promise.all([
        EventModel.find(query)
          .populate("createdBy", "username firstName lastName")
          .populate("participants", "username firstName lastName")
          .sort({ startDate: 1 })
          .skip((page - 1) * limit)
          .limit(limit),
        EventModel.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        data: events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม",
      });
    }
  }

  // ดึงรายละเอียดกิจกรรม
  async getEvent(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const eventId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        res.status(400).json({
          success: false,
          message: "รูปแบบ ID ไม่ถูกต้อง",
        });
        return;
      }

      const event = await EventModel.findOne({
        _id: eventId,
        tenantId: req.user?.tenantId,
      })
        .populate("createdBy", "username firstName lastName")
        .populate("participants", "username firstName lastName");

      if (!event) {
        res.status(404).json({
          success: false,
          message: "ไม่พบกิจกรรมที่ต้องการ",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      console.error("Get event error:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม",
      });
    }
  }

  // สร้างกิจกรรมใหม่
  async createEvent(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const eventData = {
        ...req.body,
        tenantId: req.user?.tenantId,
        createdBy: req.user?.id,
        updatedBy: req.user?.id,
      };

      // ตรวจสอบวันที่
      const startDate = new Date(eventData.startDate);
      const endDate = new Date(eventData.endDate);

      if (endDate < startDate) {
        res.status(400).json({
          success: false,
          message: "วันที่สิ้นสุดต้องมาหลังวันที่เริ่มต้น",
        });
        return;
      }

      const event = await EventModel.create(eventData);
      await event.populate("createdBy", "username firstName lastName");
      await event.populate("participants", "username firstName lastName");

      res.status(201).json({
        success: true,
        data: event,
      });
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการสร้างกิจกรรม",
      });
    }
  }

  // อัพเดทกิจกรรม
  async updateEvent(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const eventId = req.params.id;
      const updateData = {
        ...req.body,
        updatedBy: req.user?.id,
      };

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        res.status(400).json({
          success: false,
          message: "รูปแบบ ID ไม่ถูกต้อง",
        });
        return;
      }

      // ตรวจสอบวันที่
      if (updateData.startDate && updateData.endDate) {
        const startDate = new Date(updateData.startDate);
        const endDate = new Date(updateData.endDate);

        if (endDate < startDate) {
          res.status(400).json({
            success: false,
            message: "วันที่สิ้นสุดต้องมาหลังวันที่เริ่มต้น",
          });
          return;
        }
      }

      const event = await EventModel.findOneAndUpdate(
        {
          _id: eventId,
          tenantId: req.user?.tenantId,
        },
        updateData,
        { new: true }
      )
        .populate("createdBy", "username firstName lastName")
        .populate("participants", "username firstName lastName");

      if (!event) {
        res.status(404).json({
          success: false,
          message: "ไม่พบกิจกรรมที่ต้องการแก้ไข",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      console.error("Update event error:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการแก้ไขกิจกรรม",
      });
    }
  }

  // ลบกิจกรรม
  async deleteEvent(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const eventId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        res.status(400).json({
          success: false,
          message: "รูปแบบ ID ไม่ถูกต้อง",
        });
        return;
      }

      const event = await EventModel.findOneAndDelete({
        _id: eventId,
        tenantId: req.user?.tenantId,
      });

      if (!event) {
        res.status(404).json({
          success: false,
          message: "ไม่พบกิจกรรมที่ต้องการลบ",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "ลบกิจกรรมสำเร็จ",
      });
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการลบกิจกรรม",
      });
    }
  }

  // อัพเดทสถานะกิจกรรม
  async updateStatus(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const eventId = req.params.id;
      const { status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        res.status(400).json({
          success: false,
          message: "รูปแบบ ID ไม่ถูกต้อง",
        });
        return;
      }

      const event = await EventModel.findOneAndUpdate(
        {
          _id: eventId,
          tenantId: req.user?.tenantId,
        },
        {
          status,
          updatedBy: req.user?.id,
        },
        { new: true }
      )
        .populate("createdBy", "username firstName lastName")
        .populate("participants", "username firstName lastName");

      if (!event) {
        res.status(404).json({
          success: false,
          message: "ไม่พบกิจกรรมที่ต้องการแก้ไข",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      console.error("Update event status error:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการแก้ไขสถานะกิจกรรม",
      });
    }
  }
}

export default new CalendarController();
