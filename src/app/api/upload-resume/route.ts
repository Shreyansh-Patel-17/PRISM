import { NextRequest, NextResponse } from "next/server";
import rateLimit from "@/middleware/rateLimit";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  await rateLimit(req);

  // 1️⃣ Auth
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2️⃣ Backend URL
  const backendUrl = process.env.AI_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { error: "Backend service not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();

    // 3️⃣ Send resume to FastAPI
    const backendRes = await fetch(`${backendUrl}/parse-resume`, {
      method: "POST",
      body: formData,
    });

    if (!backendRes.ok) {
      const err = await backendRes.text();
      return NextResponse.json(
        { error: "Resume parsing failed", details: err },
        { status: 500 }
      );
    }

    const data = await backendRes.json();

    if (!Array.isArray(data.skills)) {
      return NextResponse.json(
        { error: "Invalid skills returned from parser" },
        { status: 500 }
      );
    }

    const skills = data.skills;

    // 4️⃣ Save skills to MongoDB
    await connectToDatabase();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.skill = skills;
    await user.save();

    // 5️⃣ Success
    return NextResponse.json({
      message: "Resume parsed and skills saved",
      skills: data.skills,
    });
  } catch (error) {
    console.error("Upload resume error:", error);
    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 }
    );
  }
}
