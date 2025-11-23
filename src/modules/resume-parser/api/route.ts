import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { email, skills } = await request.json();

    if (!email || !skills || !Array.isArray(skills)) {
      return NextResponse.json({ error: "Email and skills array are required" }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Find user and update skills
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update skills
    user.skill = skills;
    await user.save();

    return NextResponse.json({ message: "Skills updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating skills:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
