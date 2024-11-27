import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public statusCode: number, public message: string) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = 'statusCode' in error ? error.statusCode : 500;
  const stack = process.env.NODE_ENV === 'development' ? error.stack : undefined;
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: error.message,
    ...(stack && { stack })
  });
};