// src/scripts/reset-password.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model";

dotenv.config();

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_MAIN_DB}?retryWrites=true&w=majority`;

async function resetPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("เชื่อมต่อ MongoDB สำเร็จ");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Test123!", salt);

    // รีเซ็ตรหัสผ่านสำหรับ admin@test.com
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: "admin@test.com" },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (updatedUser) {
      console.log("รีเซ็ตรหัสผ่านสำเร็จสำหรับ:", updatedUser.email);
    } else {
      console.log("ไม่พบผู้ใช้");
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword();
