// src/server.ts

import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/database";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

import { CalendarNotification } from "./modules/calendar/calendar.notification";
// เริ่มระบบแจ้งเตือนอัตโนมัติ
CalendarNotification.setupReminders().catch(console.error);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});
