// src/scripts/test-db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserModel } from "../models/user.model";
import { TenantModel } from "../models/tenant.model";

dotenv.config();

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_MAIN_DB}?retryWrites=true&w=majority`;

async function testDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("เชื่อมต่อ MongoDB สำเร็จ");

    // ตรวจสอบ Tenant
    const tenant = await TenantModel.findOne({ code: "DEMO001" });
    console.log("ข้อมูล Tenant:", {
      id: tenant?._id,
      code: tenant?.code,
      status: tenant?.status,
    });

    // ตรวจสอบ Users
    const users = await UserModel.find().select("-password");
    console.log("\nรายการผู้ใช้ทั้งหมด:");
    users.forEach((user) => {
      console.log({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
  } finally {
    await mongoose.disconnect();
  }
}

testDB();
