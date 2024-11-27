// src/scripts/seed.ts

import mongoose from "mongoose";
import dotenv from "dotenv";
import { TenantModel } from "../models/tenant.model";
import { UserModel } from "../models/user.model";

dotenv.config();

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_MAIN_DB}?retryWrites=true&w=majority`;

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Create default tenant
    const defaultTenant = await TenantModel.create({
      name: "OPOR Digital",
      code: "DEMO001",
      status: "active",
      settings: {
        theme: "default",
        language: "th",
      },
    });

    console.log("Created default tenant:", defaultTenant);

    // Create test user
    const testUser = await UserModel.create({
      tenantId: defaultTenant._id,
      username: "testuser",
      email: "test@example.com",
      password: "test123",
      firstName: "Test",
      lastName: "User",
      role: "user",
      status: "active",
    });

    console.log("Created test user:", {
      username: testUser.username,
      email: testUser.email,
      role: testUser.role,
    });

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
