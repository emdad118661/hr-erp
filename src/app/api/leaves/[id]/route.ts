// src/app/api/leaves/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { LeaveRequest } from "@/models/LeaveRequest";

// GET: Single leave request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const leave = await LeaveRequest.findById(id)
      .populate("userId", "name email role")
      .populate("reviewedBy", "name email role");

    if (!leave) {
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 }
      );
    }

    // Employee can only view their own
    if (
      session.user.role === "EMPLOYEE" &&
      leave.userId._id.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: leave,
    });
  } catch (error) {
    console.error("GET leave error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave request" },
      { status: 500 }
    );
  }
}

// PATCH: Update status (HR/Admin can change APPROVED ↔ REJECTED)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
      return NextResponse.json(
        { error: "Only HR/Admin can review leave requests" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectDB();

    const body = await request.json();
    const { action, rejectionReason, status } = body;

    if (!action && !status) {
      return NextResponse.json(
        { error: "Please provide action or status" },
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

    const updateData: Record<string, unknown> = {
      reviewedBy: new mongoose.Types.ObjectId(session.user.id),
      reviewedAt: new Date(),
    };

    // Handle status change
    if (status) {
      if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      updateData.status = status;

      if (status === "REJECTED" && rejectionReason?.length < 5) {
        return NextResponse.json(
          {
            error:
              "Rejection reason is required and must contain at least 5 characters",
          },
          { status: 400 }
        );
      }

      if (status === "REJECTED") {
        updateData.rejectionReason = rejectionReason;
      } else {
        updateData.rejectionReason = undefined;
      }
    }

    // Handle action (for backward compatibility)
    if (action) {
      if (action === "REJECT" && rejectionReason?.length < 5) {
        return NextResponse.json(
          {
            error:
              "Rejection reason is required and must contain at least 5 characters",
          },
          { status: 400 }
        );
      }

      updateData.status = action === "APPROVE" ? "APPROVED" : "REJECTED";

      if (action === "REJECT") {
        updateData.rejectionReason = rejectionReason;
      } else {
        updateData.rejectionReason = undefined;
      }
    }

    const updatedLeave = await LeaveRequest.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("userId", "name email role")
      .populate("reviewedBy", "name email role");

    return NextResponse.json({
      success: true,
      data: updatedLeave,
      message: "Leave request updated successfully",
    });
  } catch (error) {
    console.error("PATCH leave error:", error);
    return NextResponse.json(
      { error: "Failed to update leave request" },
      { status: 500 }
    );
  }
}

// DELETE: Single leave request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    await connectDB();

    const leave = await LeaveRequest.findByIdAndDelete(id);

    if (!leave) {
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Leave request deleted successfully",
    });
  } catch (error) {
    console.error("DELETE leave error:", error);
    return NextResponse.json(
      { error: "Failed to delete leave request" },
      { status: 500 }
    );
  }
}