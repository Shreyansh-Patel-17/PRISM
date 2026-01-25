import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { response, question } = body;

    // Validation
    if (!response || !question) {
      return NextResponse.json(
        { error: "Response and question are required" },
        { status: 400 }
      );
    }

    if (
      typeof question !== "object" ||
      typeof question.text !== "string" ||
      !Array.isArray(question.keywords)
    ) {
      return NextResponse.json(
        { error: "Invalid question format" },
        { status: 400 }
      );
    }

    if (response.length > 3000) {
      return NextResponse.json(
        { error: "Response too long" },
        { status: 413 }
      );
    }

    const backendUrl = process.env.AI_BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { error: "AI backend URL not configured" },
        { status: 500 }
      );
    }

    const questionObj = {
      text: question.text,
      expected_keywords: question.keywords.map((kw: string) => ({
        keyword: kw,
        weight: 1.0,
      })),
    };

    const backendRes = await fetch(`${backendUrl}/evaluate-response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        response,
        question: questionObj,
      }),
    });

    if (!backendRes.ok) {
      const errorDetails = await backendRes.text();
      return NextResponse.json(
        {
          error: "AI evaluator failed",
          status: backendRes.status,
          details: errorDetails,
        },
        { status: 500 }
      );
    }

    const result = await backendRes.json();

    // Non-fatal skill score update
    try {
      const session = await getServerSession(authOptions);
      const email = session?.user?.email;
      const skill = question.skill as string | undefined;

      if (email && skill && typeof skill === "string") {
        await connectToDatabase();
        const user = await User.findOne({ email });

        if (user) {
          const finalScore =
            result?.scores?.final ??
            result?.scores?.keyword ??
            0;

          const skillScores =
            (user.skillScores as Map<string, number>) ||
            new Map<string, number>();

          const existing = skillScores.get(skill) ?? 0;
          const updated =
            existing === 0
              ? finalScore
              : existing * 0.7 + finalScore * 0.3;

          skillScores.set(skill, Math.min(100, Math.max(0, updated)));
          user.skillScores = skillScores as any;
          await user.save();
        }
      }
    } catch (e) {
      console.error("Non-fatal skill score update error:", e);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("response-evaluator error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
