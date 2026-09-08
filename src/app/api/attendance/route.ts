// src/app/api/attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Attendance } from "@/models/Attendance";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

// GET - Get attendance records
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const requestStatus = searchParams.get("requestStatus");

    let query: any = {};

    // Employee দেখবে শুধু নিজের ডাটা
    if (session.user.role === "EMPLOYEE") {
      query.userId = new mongoose.Types.ObjectId(session.user.id);
      
      if (requestStatus !== "PENDING") {
        query.requestStatus = "APPROVED";
      }
    } 
    // HR/Admin সব দেখতে পাবে
    else {
      if (userId) {
        query.userId = new mongoose.Types.ObjectId(userId);
      }
      if (requestStatus) {
        query.requestStatus = requestStatus;
      }
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const attendances = await Attendance.find(query)
      .populate("userId", "name email role")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: attendances });
  } catch (error) {
    console.error("GET attendance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance", details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create attendance request or Mark Attendance
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { userId, status, checkIn, date: bodyDate } = body;

    // Determine who the attendance is for
    const targetUserId = userId
      ? new mongoose.Types.ObjectId(userId)
      : new mongoose.Types.ObjectId(session.user.id);

    // Get target date
    const targetDate = bodyDate ? new Date(bodyDate) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // ✅ Check existing attendance - Allow resubmission if REJECTED
    const existing = await Attendance.findOne({
      userId: targetUserId,
      date: { $gte: targetDate, $lt: nextDay },
    });

    if (existing) {
      // ✅ If REJECTED, allow resubmission (delete old and create new)
      if (existing.requestStatus === "REJECTED") {
        await Attendance.findByIdAndDelete(existing._id);
        console.log("Deleted rejected request, allowing resubmission");
      } 
      // ❌ If PENDING or APPROVED, block new request
      else if (existing.requestStatus === "PENDING") {
        return NextResponse.json(
          { 
            error: "You already have a pending request for this date. Wait for HR approval or contact HR.",
            existingId: existing._id 
          },
          { status: 400 }
        );
      } 
      else if (existing.requestStatus === "APPROVED") {
        return NextResponse.json(
          { error: "Attendance already approved for this date" },
          { status: 400 }
        );
      }
    }

    const checkInTime = checkIn ? new Date(checkIn) : new Date();

    // Determine status based on check-in time
    let attendanceStatus = status || "PRESENT";
    if (!attendanceStatus) {
      attendanceStatus = checkInTime.getHours() >= 10 ? "LATE" : "PRESENT";
    }

    // HR/Admin can mark directly (APPROVED)
    // Employee creates request (PENDING)
    const requestStatus =
      session.user.role === "ADMIN" || session.user.role === "HR"
        ? "APPROVED"
        : "PENDING";

    const attendance = await Attendance.create({
      userId: targetUserId,
      date: targetDate,
      status: attendanceStatus,
      requestStatus,
      checkIn: requestStatus === "APPROVED" ? checkInTime : undefined,
      reviewedBy:
        requestStatus === "APPROVED" ? new mongoose.Types.ObjectId(session.user.id) : undefined,
      reviewedAt: requestStatus === "APPROVED" ? new Date() : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        data: attendance,
        message:
          requestStatus === "APPROVED"
            ? "Attendance marked successfully"
            : existing?.requestStatus === "REJECTED"
            ? "Previous request was rejected. New request submitted successfully."
            : "Check-in request submitted. Waiting for HR approval.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST attendance error:", error);
    return NextResponse.json(
      { error: "Failed to create attendance", details: String(error) },
      { status: 500 }
    );
  }
}