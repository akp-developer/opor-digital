// src/core/middleware/error.handler.ts

export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (error: any) => {
  // Log error for debugging
  console.error(error);

  // Return formatted error response
  return {
    success: false,
    message: error.message || "Internal server error",
    statusCode: error.statusCode || 500,
  };
};
