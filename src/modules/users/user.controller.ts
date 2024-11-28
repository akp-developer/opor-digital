import { Request, Response } from "express";
import mongoose from "mongoose";
import { UserModel, IUser } from "../../models/user.model";

// รวม interfaces
interface RequestWithUser extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    tenantId: string;
  };
}

interface UserResponse extends Omit<IUser, "password" | "refreshToken"> {
  password?: string;
  refreshToken?: string;
}

class UserController {
  // Get all users with pagination
  async getUsers(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const search = req.query.search as string;

      const query: any = { tenantId: req.user?.tenantId };

      if (search) {
        query.$or = [
          { username: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
          { firstName: new RegExp(search, "i") },
          { lastName: new RegExp(search, "i") },
        ];
      }

      const [users, total] = await Promise.all([
        UserModel.find(query)
          .select("-password -refreshToken")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        UserModel.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching users",
      });
    }
  }

  // Get specific user
  async getUser(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
        return;
      }

      const user = await UserModel.findOne({
        _id: userId,
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
      console.error("Get user error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching user",
      });
    }
  }

  // Create new user
  async createUser(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { email, username } = req.body;

      const existingUser = await UserModel.findOne({
        tenantId,
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message:
            existingUser.email === email
              ? "Email already exists"
              : "Username already exists",
        });
        return;
      }

      const userData = {
        ...req.body,
        tenantId,
        status: "active",
        tokenVersion: 0,
      };

      const user = await UserModel.create(userData);
      const userResponse: UserResponse = user.toObject();
      const { password, refreshToken, ...responseData } = userResponse;

      res.status(201).json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating user",
      });
    }
  }

  // Update user
  async updateUser(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
        return;
      }

      const { email, username } = req.body;

      if (email || username) {
        const existingUser = await UserModel.findOne({
          tenantId,
          _id: { $ne: userId },
          $or: [
            { email: email || undefined },
            { username: username || undefined },
          ],
        });

        if (existingUser) {
          res.status(400).json({
            success: false,
            message:
              existingUser.email === email
                ? "Email already exists"
                : "Username already exists",
          });
          return;
        }
      }

      const { password, refreshToken, tenantId: _, ...updates } = req.body;

      const user = await UserModel.findOneAndUpdate(
        { _id: userId, tenantId },
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
      console.error("Update user error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating user",
      });
    }
  }

  // Update status
  async updateStatus(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const tenantId = req.user?.tenantId;
      const userId = req.params.id;

      if (!["active", "inactive", "suspended"].includes(status)) {
        res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
        return;
      }

      const user = await UserModel.findOneAndUpdate(
        { _id: userId, tenantId },
        { status },
        { new: true }
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
      console.error("Update status error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating user status",
      });
    }
  }
  // เพิ่ม method เหล่านี้ในคลาส UserController

  // Delete user
  async deleteUser(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
        return;
      }

      const user = await UserModel.findOneAndDelete({
        _id: userId,
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
      console.error("Delete user error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting user",
      });
    }
  }

  // Update password
  async updatePassword(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.params.id;
      const { currentPassword, newPassword } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
        return;
      }

      const user = await UserModel.findOne({
        _id: userId,
        tenantId,
      });

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
      console.error("Update password error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating password",
      });
    }
  }
}

export default new UserController();
