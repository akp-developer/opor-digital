// src/scripts/test-db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const testConnection = async () => {
  try {
    const mongoURI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_MAIN_DB}`;

    console.log("Testing MongoDB connection...");

    const conn = await mongoose.connect(mongoURI);

    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(
      "Available collections:",
      collections.map((c) => c.name)
    );

    // Test tenant collection
    const tenants = await conn.connection.db
      .collection("tenants")
      .find({})
      .toArray();
    console.log("Tenants:", tenants);

    await mongoose.disconnect();
    console.log("Test completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
};

testConnection();
