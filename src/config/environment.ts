// src/config/environment.ts

// ตรวจสอบและกำหนดค่า default สำหรับ NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';

export const environment = {
  port: Number(process.env.PORT) || 3001,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/opor-digital',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  nodeEnv
};