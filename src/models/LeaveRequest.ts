// src/models/LeaveRequest.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILeaveRequest extends Document {
  userId: Types.ObjectId;
  type: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy?: string;
  createdAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>({
  userId: { 
    type: Schema.Types.ObjectId,   // ✅ পরিবর্তন
    ref: "User", 
    required: true 
  },
  type: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING",
  },
  reviewedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const LeaveRequest =
  mongoose.models.LeaveRequest ||
  mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);