// src/modules/auth/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../../models/user.model";
import { TenantModel } from "../../models/tenant.model";

interface RequestWithUser extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    tenantId: string;
  };
}

interface JwtPayload {
  id: string;
  username: string;
  role: string;
  tenantId: string;
}

export class AuthMiddleware {
  static async protect(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Not authorized to access this route",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-jwt-secret"
      ) as JwtPayload;

      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists",
        });
      }

      if (user.status !== "active") {
        return res.status(401).json({
          success: false,
          message: "User account is not active",
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }
  }
}
