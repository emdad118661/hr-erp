// src/app/api/attendance/today/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Attendance } from "@/models/Attendance";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's attendance for current user
    const todayAttendance = await Attendance.findOne({
      userId: session.user.id,
      date: { $gte: today, $lt: tomorrow },
    });

    return NextResponse.json({
      success: true,
      data: todayAttendance || null,
    });
  } catch (error) {
    console.error("Today attendance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch today's attendance" },
      { status: 500 }
    );
  }
}