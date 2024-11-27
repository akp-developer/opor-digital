// src/modules/auth/index.ts

import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';

export class AuthModule {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Auth routes
    this.router.post('/login', AuthController.login);
    this.router.get('/me', AuthMiddleware.protect, AuthController.getMe);
    this.router.post('/logout', AuthMiddleware.protect, AuthController.logout);
    
    // Password management
    this.router.post('/forgot-password', AuthController.forgotPassword);
    this.router.post('/reset-password/:token', AuthController.resetPassword);
    this.router.put(
      '/change-password',
      AuthMiddleware.protect,
      AuthController.changePassword
    );
  }
}

export const authModule = new AuthModule();
export default authModule.router;