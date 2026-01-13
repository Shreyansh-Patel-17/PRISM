// app/api/skill-scores/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const map = user.skillScores || new Map();
    const skillScores: Record<string, number> = {};
    // If it's a Mongoose Map, it has forEach
    (map as any).forEach((value: number, key: string) => {
      skillScores[key] = value;
    });

    return NextResponse.json({ skillScores });
  } catch (e: any) {
    console.error("Error in /api/skill-scores:", e);
    return NextResponse.json(
      { error: e?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
