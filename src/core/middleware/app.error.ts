import { CustomError } from './error.handler';

export class AppError extends CustomError {
  status: string;
  
  constructor(message: string, statusCode: number = 500, status: string = 'error') {
    super(message, statusCode);
    this.status = status;
  }
}

export const appErrorHandler = (error: AppError | Error) => {
  console.error(error);
  return {
    success: false,
    message: error.message || "Internal server error",
    statusCode: error instanceof CustomError ? error.statusCode : 500
  };
};