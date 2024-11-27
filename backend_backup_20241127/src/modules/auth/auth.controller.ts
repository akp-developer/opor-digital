// src/modules/auth/auth.controller.ts

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../../models/user.model";
import { TenantModel } from "../../models/tenant.model";

// Define interface for tokens
interface ITokens {
  accessToken: string;
  refreshToken: string;
}

// AuthController class with proper export
export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password, tenantCode } = req.body;

      if (!username || !password || !tenantCode) {
        return res.status(400).json({
          success: false,
          message: "Please provide username, password and tenant code",
        });
      }

      const tenant = await TenantModel.findOne({ code: tenantCode });
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: "Tenant not found",
        });
      }

      const user = await UserModel.findOne({
        tenantId: tenant._id,
        username: username.toLowerCase(),
        status: "active",
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Update last login and increment token version
      user.lastLogin = new Date();
      user.tokenVersion += 1;
      await user.save();

      // Generate tokens
      const tokens = await AuthController.generateTokens(user);

      // Set refresh token in cookie
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        token: tokens.accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Error in login process",
      });
    }
  }

  static async getMe(req: Request & { user?: any }, res: Response) {
    try {
      const user = await UserModel.findById(req.user?.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
        },
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        success: false,
        message: "Error getting user information",
      });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token not found",
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "your-refresh-jwt-secret"
      ) as { id: string; tokenVersion: number };

      // Get user
      const user = await UserModel.findById(decoded.id);
      if (!user || user.tokenVersion !== decoded.tokenVersion) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      // Generate new tokens
      const tokens = await AuthController.generateTokens(user);

      // Set new refresh token
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        token: tokens.accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
        },
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
  }

  private static async generateTokens(user: any): Promise<ITokens> {
    const accessToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET || "your-jwt-secret",
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        id: user._id,
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_REFRESH_SECRET || "your-refresh-jwt-secret",
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
  }
}
