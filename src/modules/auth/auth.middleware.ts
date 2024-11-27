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
      // 1. Check for Bearer token
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Not authorized to access this route",
        });
      }

      // 2. Verify JWT token
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-jwt-secret"
      ) as JwtPayload;

      // 3. Check if user exists and is active
      const user = await UserModel.findById(decoded.id).select("-password");
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

      // 4. Check if tenant exists and is active
      const tenant = await TenantModel.findById(decoded.tenantId);
      if (!tenant || tenant.status !== "active") {
        return res.status(401).json({
          success: false,
          message: "Tenant is inactive or no longer exists",
        });
      }

      // 5. Set user object in request
      req.user = {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        tenantId: user.tenantId.toString(),
      };

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }
  }

  // Add roles middleware
  static roles(...allowedRoles: string[]) {
    return (req: RequestWithUser, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
      }

      next();
    };
  }
}
