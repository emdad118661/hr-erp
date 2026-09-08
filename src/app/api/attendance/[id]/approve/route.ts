// src/app/api/attendance/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Attendance } from "@/models/Attendance";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "HR")) {
      return NextResponse.json(
        { error: "Only HR/Admin can approve requests" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectDB();

    const body = await request.json();
    const { action } = body;

    if (!action || (action !== "APPROVE" && action !== "REJECT")) {
      return NextResponse.json(
        { error: "Invalid action. Use APPROVE or REJECT" },
        { status: 400 }
      );
    }

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance not found" },
        { status: 404 }
      );
    }

    if (attendance.requestStatus !== "PENDING") {
      return NextResponse.json(
        { error: "This request is already processed" },
        { status: 400 }
      );
    }

    const updateData: any = {
      requestStatus: action === "APPROVE" ? "APPROVED" : "REJECTED",
      reviewedBy: new mongoose.Types.ObjectId(session.user.id),
      reviewedAt: new Date(),
    };

    if (action === "APPROVE") {
      updateData.checkIn = attendance.checkIn || new Date();
    }

    const updated = await Attendance.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("userId", "name email").populate("reviewedBy", "name");

    return NextResponse.json({
      success: true,
      data: updated,
      message:
        action === "APPROVE"
          ? "Attendance approved successfully"
          : "Attendance request rejected",
    });
  } catch (error) {
    console.error("Approve attendance error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: String(error) },
      { status: 500 }
    );
  }
}