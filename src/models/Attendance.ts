// src/models/Attendance.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAttendance extends Document {
  userId: Types.ObjectId;
  date: Date;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  requestStatus: "PENDING" | "APPROVED" | "REJECTED"; // ✅ নতুন ফিল্ড
  checkIn?: Date;
  checkOut?: Date;
  reviewedBy?: Types.ObjectId; // ✅ HR who approved
  reviewedAt?: Date;
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["PRESENT", "ABSENT", "LATE", "HALF_DAY"],
    default: "PRESENT",
  },
  requestStatus: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING", // ✅ Default PENDING
  },
  checkIn: { type: Date },
  checkOut: { type: Date },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Attendance =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", AttendanceSchema);