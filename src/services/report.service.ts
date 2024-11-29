import { EventModel } from "../models/calendar.model";
import { EventCheckinModel } from "../models/event-checkin.model";
import { UserModel } from "../models/user.model";
import ExcelJS from "exceljs";
import moment from "moment";
import "moment/locale/th";

export class ReportService {
  static async generateAttendanceReport(
    eventId: string,
    tenantId: string
  ): Promise<ExcelJS.Buffer> {
    try {
      moment.locale("th");

      const event = await EventModel.findOne({
        _id: eventId,
        tenantId,
      }).populate("createdBy", "firstName lastName");

      if (!event) {
        throw new Error("ไม่พบกิจกรรม");
      }

      const checkins = await EventCheckinModel.find({ eventId })
        .populate("userId", "username firstName lastName email")
        .sort("checkInTime");

      const participants = await UserModel.find({
        _id: { $in: event.participants },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("การเข้าร่วมกิจกรรม");

      // กำหนดหัวตาราง
      worksheet.columns = [
        { header: "ลำดับ", key: "no", width: 8 },
        { header: "ชื่อ-นามสกุล", key: "name", width: 30 },
        { header: "อีเมล", key: "email", width: 30 },
        { header: "สถานะ", key: "status", width: 15 },
        { header: "เวลาเช็คอิน", key: "checkInTime", width: 20 },
        { header: "เวลาเช็คเอาท์", key: "checkOutTime", width: 20 },
        { header: "หมายเหตุ", key: "note", width: 30 },
      ];

      // ใส่ข้อมูลกิจกรรม
      worksheet.addRow([]);
      worksheet.addRow(["รายงานการเข้าร่วมกิจกรรม"]);
      worksheet.addRow([`ชื่อกิจกรรม: ${event.title}`]);
      worksheet.addRow([
        `วันที่: ${moment(event.startDate).format("LLL")} - ${moment(event.endDate).format("LLL")}`,
      ]);
      worksheet.addRow([
        `ผู้จัด: ${(event.createdBy as any).firstName} ${(event.createdBy as any).lastName}`,
      ]);
      worksheet.addRow([]);

      // ใส่ข้อมูลผู้เข้าร่วม
      let rowNo = 1;
      participants.forEach((participant) => {
        const checkin = checkins.find(
          (c) => c.userId.toString() === participant._id.toString()
        );

        worksheet.addRow({
          no: rowNo++,
          name: `${participant.firstName} ${participant.lastName}`,
          email: participant.email,
          status: checkin
            ? checkin.status === "present"
              ? "เข้าร่วม"
              : checkin.status === "late"
                ? "มาสาย"
                : "ไม่เข้าร่วม"
            : "ไม่เข้าร่วม",
          checkInTime: checkin
            ? moment(checkin.checkInTime).format("LLL")
            : "-",
          checkOutTime: checkin?.checkOutTime
            ? moment(checkin.checkOutTime).format("LLL")
            : "-",
          note: checkin?.note || "-",
        });
      });

      // จัดรูปแบบตาราง
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(2).font = { bold: true };

      // สร้างสรุป
      worksheet.addRow([]);
      worksheet.addRow(["สรุปการเข้าร่วม"]);
      worksheet.addRow([`จำนวนผู้เข้าร่วมทั้งหมด: ${participants.length} คน`]);
      worksheet.addRow([
        `เข้าร่วมตรงเวลา: ${checkins.filter((c) => c.status === "present").length} คน`,
      ]);
      worksheet.addRow([
        `มาสาย: ${checkins.filter((c) => c.status === "late").length} คน`,
      ]);
      worksheet.addRow([
        `ไม่เข้าร่วม: ${participants.length - checkins.length} คน`,
      ]);

      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      console.error("Generate report error:", error);
      throw error;
    }
  }
}
