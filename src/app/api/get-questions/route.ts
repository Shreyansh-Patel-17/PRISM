import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

type QuestionDTO = {
  questionId: string;
  text: string;
  skill: string;
  keywords: string[];
};

export async function GET(request: NextRequest) {
  try {
    // 1. Auth
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. DB
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const rawGenerated = user.generatedQuestions;

    // 3. If nothing stored yet, return empty list
    if (!rawGenerated || 
       (rawGenerated instanceof Map && rawGenerated.size === 0)) {
      return NextResponse.json([] as QuestionDTO[]);
    }

    const questions: QuestionDTO[] = [];

    // -----------------------------
    // SAFE HANDLING OF BOTH TYPES:
    // - Mongoose Map: rawGenerated instanceof Map
    // - Plain Object: typeof rawGenerated === 'object'
    // -----------------------------
    if (rawGenerated instanceof Map) {
      // Mongoose Map case
      rawGenerated.forEach((qList: any[], skill: string) => {
        if (!Array.isArray(qList)) return;

        qList.forEach((q, index) => {
          if (!q?.text) return;
          questions.push({
            questionId: `${skill}-${index}`,
            text: q.text,
            skill,
            keywords: Array.isArray(q.keywords) ? q.keywords : [],
          });
        });
      });
    } else {
      // Plain JS object case (e.g. lean() or JSON)
      Object.keys(rawGenerated).forEach((skill) => {
        const qList = (rawGenerated as any)[skill];
        if (!Array.isArray(qList)) return;

        qList.forEach((q, index) => {
          if (!q?.text) return;
          questions.push({
            questionId: `${skill}-${index}`,
            text: q.text,
            skill,
            keywords: Array.isArray(q.keywords) ? q.keywords : [],
          });
        });
      });
    }

    return NextResponse.json(questions);
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
