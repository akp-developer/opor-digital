import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_MAIN_DB}`;

    console.log("Attempting to connect to MongoDB...");
    // console.log('Connection string:', mongoURI); // uncomment for debugging only

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log("Database:", conn.connection.db.databaseName);
    console.log(
      "Collections:",
      await conn.connection.db.listCollections().toArray()
    );

    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log("Successfully pinged MongoDB.");

    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Add connection event listeners
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.info("MongoDB reconnected");
});

export default connectDB;
