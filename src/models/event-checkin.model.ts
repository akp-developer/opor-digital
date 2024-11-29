import mongoose, { Schema, Document } from "mongoose";

export interface IEventCheckin extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  checkInTime: Date;
  checkOutTime?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: "present" | "late" | "absent";
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventCheckinSchema: Schema = new Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    checkInTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
    },
    location: {
      latitude: Number,
      longitude: Number,
    },
    status: {
      type: String,
      enum: ["present", "late", "absent"],
      default: "present",
    },
    note: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// สร้าง Index
EventCheckinSchema.index({ eventId: 1, userId: 1 }, { unique: true });
EventCheckinSchema.index({ tenantId: 1 });
EventCheckinSchema.index({ checkInTime: 1 });
EventCheckinSchema.index({ status: 1 });

export const EventCheckinModel = mongoose.model<IEventCheckin>(
  "EventCheckin",
  EventCheckinSchema
);
