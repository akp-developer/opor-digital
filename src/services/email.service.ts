import nodemailer from "nodemailer";
import { EventModel, IEvent } from "../models/calendar.model";
import { IUser } from "../types/user.types";
import moment from "moment";
import "moment/locale/th";
import mongoose from "mongoose";

interface PopulatedEvent extends Omit<IEvent, "participants"> {
  participants: Array<IUser & { _id: mongoose.Types.ObjectId }>;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendEventNotification(
    recipientEmail: string,
    event: any,
    type: "create" | "update" | "reminder" | "cancel"
  ): Promise<void> {
    try {
      moment.locale("th");

      const startDate = moment(event.startDate).format("LLL");
      const endDate = moment(event.endDate).format("LLL");

      let subject = "";
      let content = "";

      switch (type) {
        case "create":
          subject = `แจ้งเตือน: กิจกรรมใหม่ - ${event.title}`;
          content = `
            <h2>กิจกรรมใหม่ได้ถูกสร้างขึ้น</h2>
            <p><strong>ชื่อกิจกรรม:</strong> ${event.title}</p>
            <p><strong>รายละเอียด:</strong> ${event.description || "-"}</p>
            <p><strong>วันที่เริ่ม:</strong> ${startDate}</p>
            <p><strong>วันที่สิ้นสุด:</strong> ${endDate}</p>
            <p><strong>สถานที่:</strong> ${event.location || "-"}</p>
          `;
          break;

        case "update":
          subject = `แจ้งเตือน: กิจกรรมมีการเปลี่ยนแปลง - ${event.title}`;
          content = `
            <h2>กิจกรรมมีการเปลี่ยนแปลง</h2>
            <p><strong>ชื่อกิจกรรม:</strong> ${event.title}</p>
            <p><strong>รายละเอียด:</strong> ${event.description || "-"}</p>
            <p><strong>วันที่เริ่ม:</strong> ${startDate}</p>
            <p><strong>วันที่สิ้นสุด:</strong> ${endDate}</p>
            <p><strong>สถานที่:</strong> ${event.location || "-"}</p>
          `;
          break;

        case "reminder":
          subject = `แจ้งเตือน: กิจกรรมจะเริ่มในอีก 30 นาที - ${event.title}`;
          content = `
            <h2>แจ้งเตือนกิจกรรม</h2>
            <p>กิจกรรม "${event.title}" จะเริ่มในอีก 30 นาที</p>
            <p><strong>วันที่เริ่ม:</strong> ${startDate}</p>
            <p><strong>สถานที่:</strong> ${event.location || "-"}</p>
          `;
          break;

        case "cancel":
          subject = `แจ้งเตือน: กิจกรรมถูกยกเลิก - ${event.title}`;
          content = `
            <h2>กิจกรรมถูกยกเลิก</h2>
            <p><strong>ชื่อกิจกรรม:</strong> ${event.title}</p>
            <p><strong>วันที่เดิม:</strong> ${startDate}</p>
          `;
          break;
      }

      const mailOptions = {
        from: `"OPOR Digital" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: subject,
        html: `
          <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
            ${content}
            <hr>
            <p style="color: #666; font-size: 0.9em;">
              อีเมลนี้ถูกส่งโดยระบบอัตโนมัติ กรุณาอย่าตอบกลับ
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email notification sent to ${recipientEmail}`);
    } catch (error) {
      console.error("Send email error:", error);
      throw error;
    }
  }

  static async scheduleEventReminders(): Promise<void> {
    try {
      // ค้นหากิจกรรมที่จะเริ่มในอีก 30 นาที
      const thirtyMinutesFromNow = moment().add(30, "minutes").toDate();
      const events = await EventModel.find({
        startDate: {
          $gte: moment().toDate(),
          $lte: thirtyMinutesFromNow,
        },
        status: "active",
        "reminders.type": "email",
      }).populate<{
        participants: Array<IUser & { _id: mongoose.Types.ObjectId }>;
      }>("participants", "email username");

      // ส่งอีเมลแจ้งเตือนไปยังผู้เข้าร่วมทุกคน
      for (const event of events) {
        if (event.participants && event.participants.length > 0) {
          for (const participant of event.participants) {
            if (participant.email) {
              await this.sendEventNotification(
                participant.email,
                event,
                "reminder"
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Schedule reminders error:", error);
      throw error;
    }
  }
}
