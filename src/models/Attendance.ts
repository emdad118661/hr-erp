// src/models/Attendance.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  userId: string;
  date: Date;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  checkIn?: Date;
  checkOut?: Date;
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ["PRESENT", "ABSENT", "LATE", "HALF_DAY"],
    default: "PRESENT"
  },
  checkIn: { type: Date },
  checkOut: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);