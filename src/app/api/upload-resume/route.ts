import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resume = formData.get("resume") as File;
    const email = formData.get("email") as string;

    if (!resume || !email) {
      return NextResponse.json({ error: "Resume and email are required" }, { status: 400 });
    }

    // Check file type
    if (resume.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Check file size (5MB limit)
    if (resume.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Find user and update resume
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Store resume filename (in a real app, you'd upload to cloud storage)
    user.resume = resume.name;
    await user.save();

    // TODO: Send resume to resume parser (to be implemented by teammate)
    // The resume parser will extract skills and call the resume-parser API to update skills

    return NextResponse.json({ message: "Resume uploaded successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error uploading resume:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
