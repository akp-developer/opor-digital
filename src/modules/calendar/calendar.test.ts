import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import { EventModel } from "../../models/calendar.model";
import { TenantModel } from "../../models/tenant.model";
import { UserModel } from "../../models/user.model";
import jwt from "jsonwebtoken";

describe("Calendar Module", () => {
  let mongoServer: MongoMemoryServer;
  let testTenant: any;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // สร้าง in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // สร้าง test tenant
    testTenant = await TenantModel.create({
      name: "Test Tenant",
      code: "test001",
      status: "active",
    });

    // สร้าง test user
    testUser = await UserModel.create({
      username: "testuser",
      email: "test@example.com",
      password: "Test123!",
      firstName: "Test",
      lastName: "User",
      role: "admin",
      tenantId: testTenant._id,
      status: "active",
    });

    // สร้าง auth token
    authToken = jwt.sign(
      {
        id: testUser._id,
        username: testUser.username,
        role: testUser.role,
        tenantId: testUser.tenantId,
      },
      process.env.JWT_SECRET || "test-secret"
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("GET /api/calendar", () => {
    beforeEach(async () => {
      // สร้างข้อมูลทดสอบ
      await EventModel.create([
        {
          title: "Test Event 1",
          description: "Description 1",
          startDate: new Date("2024-12-01"),
          endDate: new Date("2024-12-02"),
          type: "normal",
          status: "active",
          tenantId: testTenant._id,
          createdBy: testUser._id,
          updatedBy: testUser._id,
        },
        {
          title: "Test Event 2",
          description: "Description 2",
          startDate: new Date("2024-12-03"),
          endDate: new Date("2024-12-04"),
          type: "meeting",
          status: "active",
          tenantId: testTenant._id,
          createdBy: testUser._id,
          updatedBy: testUser._id,
        },
      ]);
    });

    afterEach(async () => {
      await EventModel.deleteMany({});
    });

    it("should return all events for tenant", async () => {
      const response = await request(app)
        .get("/api/calendar")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it("should filter events by date range", async () => {
      const response = await request(app)
        .get("/api/calendar")
        .query({
          startDate: "2024-12-01",
          endDate: "2024-12-02",
        })
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toBe("Test Event 1");
    });
  });

  describe("POST /api/calendar", () => {
    it("should create new event", async () => {
      const newEvent = {
        title: "New Test Event",
        description: "New Description",
        startDate: "2024-12-05",
        endDate: "2024-12-06",
        type: "normal",
        location: "Test Location",
      };

      const response = await request(app)
        .post("/api/calendar")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newEvent);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newEvent.title);
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/calendar")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // เพิ่มการทดสอบอื่นๆ ตามความเหมาะสม
});
