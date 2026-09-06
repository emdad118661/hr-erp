// src/app/api/seed/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: "admin@hrerp.com" });
    if (existingAdmin) {
      return NextResponse.json({ 
        message: "⚠️ Admin user already exists!",
        success: false
      });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Admin User",
      email: "admin@hrerp.com",
      password: hashedPassword,
      role: "ADMIN",
    });

    return NextResponse.json({ 
      message: "✅ Admin created successfully!",
      email: "admin@hrerp.com",
      password: "admin123",
      success: true
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ 
      error: "Failed to seed database",
      details: error 
    }, { status: 500 });
  }
}