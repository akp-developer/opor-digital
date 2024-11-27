import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { connectToDB } from '../server';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Server Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await connectToDB(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should connect to MongoDB', async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('should respond to GET /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Hello, world!' });
  });

  it('should respond to POST /data', async () => {
    const payload = { name: 'test', value: 123 };
    const response = await request(app).post('/data').send(payload);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  // ทดสอบการตอบสนองจาก Health Check Route
  it('should respond to GET /health', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message', 'Server is running');
  });

  // ทดสอบการตอบสนองจากเส้นทางที่ไม่ถูกต้อง (404 Error)
  it('should return 404 for non-existent route', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Route not found');
  });

  // ทดสอบกรณีป้อนข้อมูลที่ไม่สมบูรณ์ (เช่น Validation Error)
  it('should return 400 for invalid POST /data request', async () => {
    const payload = { name: 'test' }; // ขาดข้อมูล 'value'
    const response = await request(app).post('/data').send(payload);
    expect(response.status).toBe(400); // คาดหวังว่า status code จะเป็น 400 (Bad Request)
    expect(response.body).toHaveProperty('message', 'Value is required'); // ข้อความที่แสดงจากการ validation
  });

  // ทดสอบการตอบสนองจาก POST /health (ตรวจสอบการรับข้อมูล)
  it('should respond to POST /health', async () => {
    const payload = { test: 'data' };
    const response = await request(app).post('/health').send(payload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('received', payload);
  });
});
