import mongoose, { Schema, Document } from "mongoose";

// Interface สำหรับ Event
export interface IEvent extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  type: "normal" | "holiday" | "meeting";
  status: "active" | "cancelled" | "completed";
  tenantId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  participants?: mongoose.Types.ObjectId[];
  recurrence?: {
    type: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate: Date;
  };
  reminders?: {
    type: "email" | "notification";
    before: number; // จำนวนนาทีก่อนเริ่มกิจกรรม
  }[];
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  // เพิ่มใน interface IEvent
  qrToken?: {
    token: string;
    expiresAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schema สำหรับ Event
const EventSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "กรุณาระบุชื่อกิจกรรม"],
      trim: true,
      maxlength: [200, "ชื่อกิจกรรมต้องไม่เกิน 200 ตัวอักษร"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "รายละเอียดต้องไม่เกิน 1000 ตัวอักษร"],
    },
    startDate: {
      type: Date,
      required: [true, "กรุณาระบุวันที่เริ่มกิจกรรม"],
    },
    endDate: {
      type: Date,
      required: [true, "กรุณาระบุวันที่สิ้นสุดกิจกรรม"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [500, "สถานที่ต้องไม่เกิน 500 ตัวอักษร"],
    },
    type: {
      type: String,
      enum: ["normal", "holiday", "meeting"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "completed"],
      default: "active",
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    recurrence: {
      type: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
      },
      interval: {
        type: Number,
        min: 1,
      },
      endDate: Date,
    },
    reminders: [
      {
        type: {
          type: String,
          enum: ["email", "notification"],
          required: true,
        },
        before: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    attachments: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
      },
    ],
    // เพิ่มใน EventSchema
    qrToken: {
      token: String,
      expiresAt: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Middleware ก่อนบันทึก
EventSchema.pre("save", function (next) {
  // ตรวจสอบว่า endDate ต้องมาหลัง startDate
  if (this.endDate < this.startDate) {
    next(new Error("วันที่สิ้นสุดต้องมาหลังวันที่เริ่มต้น"));
  }
  next();
});

// สร้าง index
EventSchema.index({ tenantId: 1, startDate: 1 });
EventSchema.index({ tenantId: 1, status: 1 });
EventSchema.index({ tenantId: 1, createdBy: 1 });

export const EventModel = mongoose.model<IEvent>("Event", EventSchema);
