import { Request, Response } from "express";
import { AuthController } from "./auth.controller";

export class ExtendedAuthController extends AuthController {
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error in logout process",
      });
    }
  }
}
