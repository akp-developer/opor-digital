// src/types/user.types.ts
import { Request, Response } from "express";
import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "staff" | "user";
  status: "active" | "inactive" | "suspended";
  tenantId: string;
  tokenVersion: number;
  refreshToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    tenantId: string;
  };
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  tenantId: string;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export type UserControllerMethod = (
  req: RequestWithUser,
  res: Response
) => Promise<void>;

export interface IUserController {
  getUsers: UserControllerMethod;
  getUser: UserControllerMethod;
  createUser: UserControllerMethod;
  updateUser: UserControllerMethod;
  deleteUser: UserControllerMethod;
  updateStatus: UserControllerMethod;
  updatePassword: UserControllerMethod;
}
