import { EmailService } from "../../services/email.service";
import { EventModel } from "../../models/calendar.model";
import { UserModel } from "../../models/user.model";

export class CalendarNotification {
  static async notifyEventParticipants(
    eventId: string,
    type: "create" | "update" | "reminder" | "cancel"
  ): Promise<void> {
    try {
      const event = await EventModel.findById(eventId)
        .populate("participants", "email")
        .populate("createdBy", "email");

      if (!event) {
        throw new Error("ไม่พบกิจกรรมที่ต้องการ");
      }

      // รวบรวมอีเมลของผู้เข้าร่วมทั้งหมด
      const emails = new Set<string>();

      // เพิ่มอีเมลผู้สร้างกิจกรรม
      if (event.createdBy && (event.createdBy as any).email) {
        emails.add((event.createdBy as any).email);
      }

      // เพิ่มอีเมลผู้เข้าร่วม
      if (event.participants && event.participants.length > 0) {
        event.participants.forEach((participant: any) => {
          if (participant.email) {
            emails.add(participant.email);
          }
        });
      }

      // ส่งอีเมลแจ้งเตือนไปยังทุกคน
      for (const email of emails) {
        await EmailService.sendEventNotification(email, event, type);
      }
    } catch (error) {
      console.error("Notify participants error:", error);
      throw error;
    }
  }

  // ตั้งเวลาส่งการแจ้งเตือน
  static async setupReminders(): Promise<void> {
    try {
      // รันทุก 5 นาที
      setInterval(
        async () => {
          await EmailService.scheduleEventReminders();
        },
        5 * 60 * 1000
      );
    } catch (error) {
      console.error("Setup reminders error:", error);
      throw error;
    }
  }
}
