import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { UserModel } from "../../models/user.model";
import { TenantModel } from "../../models/tenant.model";
import mongoose from "mongoose";

interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const {
        username,
        email,
        password,
        firstName,
        lastName,
        role,
        tenantCode,
      } = req.body;

      // Find tenant
      const tenant = await TenantModel.findOne({
        code: tenantCode,
        status: "active",
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: "Invalid or inactive tenant",
        });
      }

      // Check if user exists
      const existingUser = await UserModel.findOne({
        $or: [{ email }, { username }],
        tenantId: tenant._id,
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Create user
      const user = new UserModel({
        username,
        email,
        password,
        firstName,
        lastName,
        role: role || "user",
        tenantId: tenant._id,
        status: "active",
        tokenVersion: 0,
      });

      await user.save();

      // Generate tokens
      const tokens = await AuthController.generateTokens(user);

      res.status(201).json({
        success: true,
        token: tokens.accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        success: false,
        message: "Error in registration process",
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password, tenantCode } = req.body;

      const tenant = await TenantModel.findOne({
        code: tenantCode,
        status: "active",
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: "Invalid or inactive tenant",
        });
      }

      const user = await UserModel.findOne({
        email,
        tenantId: tenant._id,
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

      const tokens = await AuthController.generateTokens(user);

      res.json({
        success: true,
        token: tokens.accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
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
      const user = await UserModel.findById(req.user?.id).select("-password");

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
          role: user.role,
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
      const token = req.body.refreshToken || req.cookies?.refreshToken;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No refresh token",
        });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || "your-refresh-jwt-secret"
      ) as { id: string };

      const user = await UserModel.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      const tokens = await AuthController.generateTokens(user);

      res.json({
        success: true,
        token: tokens.accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Refresh error:", error);
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
      { expiresIn: "8h" }  // เปลี่ยนเป็น 8 ชั่วโมง
    );

    const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_REFRESH_SECRET || "your-refresh-jwt-secret",
      { expiresIn: "7d" }  // refresh token อายุ 7 วัน
    );

    return { accessToken, refreshToken };
}
}
