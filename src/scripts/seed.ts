// src/scripts/seed.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { TenantModel } from "../models/tenant.model";
import { UserModel } from "../models/user.model";

dotenv.config();

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_MAIN_DB}?retryWrites=true&w=majority`;

async function seed() {
  try {
    // เชื่อมต่อ MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("เชื่อมต่อ MongoDB สำเร็จ");

    // สร้าง tenant เริ่มต้น
    const defaultTenant = await TenantModel.findOneAndUpdate(
      { code: "DEMO001" },
      {
        name: "OPOR Digital",
        code: "DEMO001",
        status: "active",
        settings: {
          theme: "default",
          language: "th",
        },
      },
      { upsert: true, new: true }
    );

    console.log("สร้าง tenant เริ่มต้น:", defaultTenant);

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash("Test123!", 10);

    // สร้างผู้ใช้ทดสอบ
    const testUser = await UserModel.findOneAndUpdate(
      { email: "test@example.com" },
      {
        tenantId: defaultTenant._id,
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
        firstName: "Test",
        lastName: "User",
        role: "user",
        status: "active",
      },
      { upsert: true, new: true }
    );

    console.log("สร้างผู้ใช้ทดสอบ:", {
      username: testUser.username,
      email: testUser.email,
      role: testUser.role,
    });

    console.log("เพิ่มข้อมูลเริ่มต้นสำเร็จ!");
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
