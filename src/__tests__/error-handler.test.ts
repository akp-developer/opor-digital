// src/__tests__/error-handler.test.ts
import { Request, Response } from 'express';
import { AppError, errorHandler } from '../core/middleware/error.handler';

describe('Error Handler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should create AppError with correct properties', () => {
    const error = new AppError(400, 'test error');
    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('test error');
  });

  it('should handle AppError correctly in development mode', () => {
    const error = new AppError(400, 'test error');
    errorHandler(error, mockReq as Request, mockRes as Response, jest.fn());

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        statusCode: 400,
        message: 'test error',
      })
    );
    const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.stack).toBeDefined();
  });

  it('should handle regular Error with 500 status', () => {
    const error = new Error('unknown error');
    errorHandler(error as AppError, mockReq as Request, mockRes as Response, jest.fn());

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        statusCode: 500,
        message: 'unknown error',
      })
    );
  });

  it('should not include stack trace in production', () => {
    process.env.NODE_ENV = 'production';
    const error = new AppError(400, 'test error');
    
    errorHandler(error, mockReq as Request, mockRes as Response, jest.fn());

    const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.stack).toBeUndefined();
  });
});
