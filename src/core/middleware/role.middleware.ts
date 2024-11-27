// src/core/middleware/role.middleware.ts

import { Request, Response, NextFunction } from "express";
import { CustomError } from "./error.handler";

// Type augmentation for Request
interface RequestWithUser extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    tenantId: string;
  };
}

export const checkRole = (allowedRoles: string[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role;

      if (!userRole || !allowedRoles.includes(userRole)) {
        res.status(403).json({
          success: false,
          message: "Permission denied. Insufficient role.",
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error checking user role",
      });
    }
  };
};
