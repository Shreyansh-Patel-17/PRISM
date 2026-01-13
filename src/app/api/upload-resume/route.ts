import { NextRequest, NextResponse } from "next/server";
import rateLimit from "@/middleware/rateLimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  await rateLimit(req);

  const backendUrl = process.env.NEXT_PUBLIC_AI_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { error: "Backend service not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();

    const backendRes = await fetch(`${backendUrl}/parse-resume`, {
      method: "POST",
      body: formData,
    });

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Upload resume proxy error:", error);
    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 }
    );
  }
}
