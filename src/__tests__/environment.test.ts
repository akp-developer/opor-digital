// src/__tests__/environment.test.ts
describe('Environment Configuration', () => {
  // เก็บค่าเดิมของ environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear cache ของ module
    jest.resetModules();
    // Reset environment variables
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // คืนค่า environment variables เดิม
    process.env = originalEnv;
  });

  it('should use default values when environment variables are not set', () => {
    // ล้างค่า environment variables ที่เกี่ยวข้อง
    process.env.PORT = '';
    process.env.MONGO_URI = '';
    process.env.JWT_SECRET = '';
    process.env.NODE_ENV = '';

    // Re-import environment module เพื่อให้ได้ค่าใหม่
    const { environment } = jest.requireActual('../config/environment');

    // ทดสอบค่า default
    expect(environment.port).toBe(3001);
    expect(environment.mongoUri).toBe('mongodb://localhost:27017/opor-digital');
    expect(environment.jwtSecret).toBeDefined();
    expect(environment.nodeEnv).toBe('development');
  });

  it('should use provided environment variables when set', () => {
    // กำหนดค่า environment variables
    process.env.PORT = '4000';
    process.env.MONGO_URI = 'mongodb://test:27017/test-db';
    process.env.JWT_SECRET = 'test-secret';
    process.env.NODE_ENV = 'production';

    // Re-import environment module
    const { environment } = jest.requireActual('../config/environment');

    // ทดสอบค่าที่กำหนด
    expect(environment.port).toBe(4000);
    expect(environment.mongoUri).toBe('mongodb://test:27017/test-db');
    expect(environment.jwtSecret).toBe('test-secret');
    expect(environment.nodeEnv).toBe('production');
  });
});