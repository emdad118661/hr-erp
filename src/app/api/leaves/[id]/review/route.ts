// src/app/api/leaves/[id]/review/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { LeaveRequest } from "@/models/LeaveRequest";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "HR")
    ) {
      return NextResponse.json(
        { error: "Only HR/Admin can review leave requests" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectDB();

    const body = await request.json();
    const { action, rejectionReason } = body;

    if (!action || (action !== "APPROVE" && action !== "REJECT")) {
      return NextResponse.json(
        { error: "Invalid action. Use APPROVE or REJECT" },
        { status: 400 }
      );
    }

    // ✅ Reject করলে reason বাধ্যতামূলক
    if (action === "REJECT" && (!rejectionReason || rejectionReason.trim() === "")) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 }
      );
    }

    if (leave.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request is already processed" },
        { status: 400 }
      );
    }

    const updateData: any = {
      status: action === "APPROVE" ? "APPROVED" : "REJECTED",
      reviewedBy: new mongoose.Types.ObjectId(session.user.id),
      reviewedAt: new Date(),
    };

    if (action === "REJECT") {
      updateData.rejectionReason = rejectionReason.trim();
    }

    const updated = await LeaveRequest.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("userId", "name email")
      .populate("reviewedBy", "name");

    return NextResponse.json({
      success: true,
      data: updated,
      message:
        action === "APPROVE"
          ? "Leave request approved"
          : "Leave request rejected",
    });
  } catch (error) {
    console.error("Review leave error:", error);
    return NextResponse.json(
      { error: "Failed to review request", details: String(error) },
      { status: 500 }
    );
  }
}