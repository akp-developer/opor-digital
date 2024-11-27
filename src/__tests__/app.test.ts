import request from 'supertest';
import app from '../app';
import { AppError, errorHandler } from '../core/middleware/error.handler';
import { environment } from '../config/environment';

describe('App Setup', () => {
  it('health check should return ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });

  it('should have CORS enabled', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['access-control-allow-origin']).toBe('*');
  });

  it('should have security headers (helmet)', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('should handle JSON parsing', async () => {
    const response = await request(app)
      .post('/health') // เปลี่ยนเป็น POST method
      .send({ test: 'data' }) // ส่งข้อมูล JSON
      .set('Content-Type', 'application/json'); // ตั้งค่า Content-Type

    // ตรวจสอบว่า Content-Type ของ response เป็น JSON
    expect(response.headers['content-type']).toMatch(/json/);
    // ตรวจสอบเนื้อหาใน response body
    expect(response.body).toEqual({ received: { test: 'data' } });
  });
});

describe('Error Handler', () => {
  it('should create AppError with correct properties', () => {
    const error = new AppError(400, 'test error');
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('test error');
    expect(error.stack).toBeDefined();
  });

  it('should handle errors correctly in middleware', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const error = new AppError(400, 'test error');
    errorHandler(error, {} as any, mockResponse, {} as any);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        statusCode: 400,
        message: 'test error',
      })
    );
  });
});

describe('Environment Configuration', () => {
  it('should have correct default values', () => {
    expect(environment.port).toBeDefined();
    expect(environment.mongoUri).toContain('mongodb://');
    expect(environment.jwtSecret).toBeDefined();
    expect(environment.nodeEnv).toBeDefined();
  });
});
