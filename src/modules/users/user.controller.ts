import { Request, Response } from "express";
import { UserModel, IUser } from "../../models/user.model";

interface UserResponse extends Omit<IUser, "password" | "refreshToken"> {
  password?: string;
  refreshToken?: string;
}

class UserController {
  // Get all users for a tenant
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore - req.user จะถูกเพิ่มโดย auth middleware
      const tenantId = req.user?.tenantId;
      const users = await UserModel.find({ tenantId })
        .select("-password -refreshToken")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching users",
      });
    }
  }

  // Get single user
  async getUser(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const tenantId = req.user?.tenantId;
      const user = await UserModel.findOne({
        _id: req.params.id,
        tenantId,
      }).select("-password -refreshToken");

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching user",
      });
    }
  }

  // Create new user
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const tenantId = req.user?.tenantId;
      const userData = {
        ...req.body,
        tenantId,
      };

      const user = await UserModel.create(userData);

      // แทนที่จะใช้ delete ใช้การสร้าง object ใหม่แทน
      const userResponse: UserResponse = user.toObject();
      const { password, refreshToken, ...responseData } = userResponse;

      res.status(201).json({
        success: true,
        data: responseData,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: "Username or email already exists",
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: "Error creating user",
      });
    }
  }

  // Update user
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const tenantId = req.user?.tenantId;
      const { password, refreshToken, tenantId: _, ...updates } = req.body;

      const user = await UserModel.findOneAndUpdate(
        { _id: req.params.id, tenantId },
        updates,
        { new: true, runValidators: true }
      ).select("-password -refreshToken");

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating user",
      });
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const tenantId = req.user?.tenantId;
      const user = await UserModel.findOneAndDelete({
        _id: req.params.id,
        tenantId,
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting user",
      });
    }
  }

  // Update password
  async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.params.id;
      // @ts-ignore
      const tenantId = req.user?.tenantId;

      const user = await UserModel.findOne({ _id: userId, tenantId });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Check current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
        return;
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating password",
      });
    }
  }
}

export default new UserController();
