// src/scripts/seed.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../lib/mongodb";
import { User } from "../models/User";

async function seed() {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: "admin@hrerp.com" });
    if (existingAdmin) {
      console.log("⚠️ Admin user already exists!");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Admin User",
      email: "admin@hrerp.com",
      password: hashedPassword,
      role: "ADMIN",
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@hrerp.com");
    console.log("🔑 Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();