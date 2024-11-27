// src/models/user.model.ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  tenantId: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  lastLogin?: Date;
  tokenVersion: number; // เพิ่มสำหรับ refresh token
  refreshToken?: string; // เพิ่มสำหรับเก็บ refresh token
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant ID is required"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["admin", "staff", "user"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    lastLogin: Date,
    tokenVersion: {
      // เพิ่มฟิลด์ tokenVersion
      type: Number,
      default: 0,
    },
    refreshToken: {
      // เพิ่มฟิลด์ refreshToken
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment token version (invalidate all existing refresh tokens)
UserSchema.methods.incrementTokenVersion = async function (): Promise<void> {
  this.tokenVersion += 1;
  await this.save();
};

// Method to update refresh token
UserSchema.methods.updateRefreshToken = async function (
  token: string
): Promise<void> {
  this.refreshToken = token;
  await this.save();
};

// Indexes
UserSchema.index({ tenantId: 1, username: 1 }, { unique: true });
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
UserSchema.index({ refreshToken: 1 }, { sparse: true }); // เพิ่ม index สำหรับ refreshToken

export const UserModel = mongoose.model<IUser>("User", UserSchema);
