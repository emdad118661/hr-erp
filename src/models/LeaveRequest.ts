// src/models/LeaveRequest.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ILeaveRequest extends Document {
  userId: Types.ObjectId;
  leaveType: "CASUAL" | "SICK" | "ANNUAL" | "UNPAID";
  startDate: Date;
  endDate: Date;
  leaveKey: string;
  reason: string;
  status: LeaveStatus;
  attemptNumber: number;
  rejectionReason?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  leaveType: {
    type: String,
    enum: ["CASUAL", "SICK", "ANNUAL", "UNPAID"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  leaveKey: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING",
  },
  attemptNumber: {
    type: Number,
    default: 1,
    min: 1,
    max: 2, // ✅ 2 attempts only
  },
  rejectionReason: {
    type: String,
    trim: true,
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviewedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

LeaveRequestSchema.index({ userId: 1, leaveKey: 1 });

export const LeaveRequest =
  mongoose.models.LeaveRequest ||
  mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);