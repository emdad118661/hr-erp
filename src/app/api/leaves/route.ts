// src/app/api/leaves/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { LeaveRequest } from "@/models/LeaveRequest";

const LEAVE_TYPES = ["CASUAL", "SICK", "ANNUAL", "UNPAID"];

function parseDateOnly(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!matched) return null;
  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

// GET: Search + Filter support
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const leaveType = searchParams.get("leaveType") || "";

    const query: Record<string, unknown> = {};

    // Employee শুধু নিজের leave দেখবে
    if (session.user.role === "EMPLOYEE") {
      query.userId = new mongoose.Types.ObjectId(session.user.id);
    }

    // Search by employee name or email
    if (search && session.user.role !== "EMPLOYEE") {
      const users = await mongoose.model("User").find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      });
      query.userId = { $in: users.map((u: any) => u._id) };
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by leave type
    if (leaveType && LEAVE_TYPES.includes(leaveType)) {
      query.leaveType = leaveType;
    }

    const leaves = await LeaveRequest.find(query)
      .populate("userId", "name email role")
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    console.error("GET leave error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}

// POST: Employee leave request (2 attempts max)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "EMPLOYEE") {
      return NextResponse.json(
        { error: "Only employees can submit leave requests" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const leaveType =
      typeof body.leaveType === "string"
        ? body.leaveType.toUpperCase()
        : "";
    const reason =
      typeof body.reason === "string" ? body.reason.trim() : "";

    const startDate = parseDateOnly(body.startDate);
    const endDate = parseDateOnly(body.endDate);

    if (!LEAVE_TYPES.includes(leaveType)) {
      return NextResponse.json(
        { error: "Please select a valid leave type" },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Please select valid leave dates" },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: "End date cannot be before start date" },
        { status: 400 }
      );
    }

    if (reason.length < 5) {
      return NextResponse.json(
        { error: "Leave reason must contain at least 5 characters" },
        { status: 400 }
      );
    }

    const employeeId = new mongoose.Types.ObjectId(session.user.id);
    const leaveKey = `${getDateKey(startDate)}__${getDateKey(endDate)}`;

    // Check for active leave
    const activeLeave = await LeaveRequest.findOne({
      userId: employeeId,
      status: { $in: ["PENDING", "APPROVED"] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    if (activeLeave) {
      const message =
        activeLeave.status === "PENDING"
          ? "You already have a pending leave request for these dates"
          : "You already have an approved leave for these dates";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Check attempt count (max 2)
    const previousAttempts = await LeaveRequest.countDocuments({
      userId: employeeId,
      leaveKey,
    });

    if (previousAttempts >= 2) {
      return NextResponse.json(
        {
          error:
            "Maximum 2 leave request attempts have already been used for this date range",
        },
        { status: 400 }
      );
    }

    const attemptNumber = previousAttempts + 1;

    const leave = await LeaveRequest.create({
      userId: employeeId,
      leaveType,
      startDate,
      endDate,
      leaveKey,
      reason,
      status: "PENDING",
      attemptNumber,
    });

    return NextResponse.json(
      {
        success: true,
        data: leave,
        message: `Leave request submitted successfully. Attempt ${attemptNumber} of 2.`,
        attemptsRemaining: 2 - attemptNumber,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST leave error:", error);
    return NextResponse.json(
      { error: "Failed to submit leave request" },
      { status: 500 }
    );
  }
}

// DELETE: Bulk delete (HR/Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
      return NextResponse.json(
        { error: "Only HR/Admin can delete leave requests" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Please provide leave request IDs to delete" },
        { status: 400 }
      );
    }

    const result = await LeaveRequest.deleteMany({
      _id: { $in: ids },
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} leave request(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("DELETE leave error:", error);
    return NextResponse.json(
      { error: "Failed to delete leave requests" },
      { status: 500 }
    );
  }
}