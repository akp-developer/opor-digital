import 'express';

declare module 'express' {
  export interface Request {
    user?: {
      id: string;
      username: string;
      role: string;
      tenantId: string;
    };
  }
}