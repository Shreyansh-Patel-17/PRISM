// src/app/api/generate-questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = process.env.AI_BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { error: "AI backend URL not configured" },
        { status: 500 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return cached questions
    if (user.generatedQuestions && Object.keys(user.generatedQuestions || {}).length > 0) {
      return NextResponse.json({
        alreadyGenerated: true,
        questions: Object.fromEntries(user.generatedQuestions as any),
      });
    }

    const skills = (user.skill || []);//.slice(0, 10);
    if (!skills.length) {
      return NextResponse.json(
        { error: "No skills found for user" },
        { status: 400 }
      );
    }

    const backendRes = await fetch(`${backendUrl}/generate-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ skills }),
    });

    if (!backendRes.ok) {
      const err = await backendRes.text();
      return NextResponse.json(
        { error: "AI backend failed", details: err },
        { status: 500 }
      );
    }

    const questions = await backendRes.json();

    const grouped: Record<string, { text: string; keywords: string[] }[]> = {};

    questions.forEach((q: any) => {
      if (!q.skill || !q.text) return;
      if (!grouped[q.skill]) grouped[q.skill] = [];
      grouped[q.skill].push({
        text: q.text,
        keywords: q.keywords || [],
      });
    });

    if (!Object.keys(grouped).length) {
      return NextResponse.json(
        { error: "No valid questions returned" },
        { status: 500 }
      );
    }

    user.generatedQuestions = grouped as any;
    await user.save();

    return NextResponse.json({
      message: "Questions generated successfully",
      questions: grouped,
    });
  } catch (error: any) {
    console.error("generate-questions error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
