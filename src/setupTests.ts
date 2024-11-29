import mongoose from "mongoose";

beforeAll(async () => {
  // Test setup
});

afterAll(async () => {
  await mongoose.connection.close();
});

jest.setTimeout(30000);
