import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    console.log("Received request body:", JSON.stringify(body, null, 2));

    const { response, question } = body;

    if (!response || !question) {
      return NextResponse.json(
        { error: "Response and question are required" },
        { status: 400 }
      );
    }

    console.log("Original question:", JSON.stringify(question, null, 2));

    // Transform question to expected format for evaluator
    const questionObj = {
      text: question.text,
      expected_keywords: (question.keywords || []).map((kw: string) => ({
        keyword: kw,
        weight: 1.0, // Default weight
      })),
    };

    console.log("Transformed question:", JSON.stringify(questionObj, null, 2));

    // Prepare the input for the Python script
    const inputData = JSON.stringify({ response, question: questionObj });

    const result = await runEvaluatorPython(inputData);

    // Try to update skillScores for logged-in user (non-fatal if it fails)
    try {
      const session = await getServerSession();
      const email = session?.user?.email;

      if (email && question.skill) {
        await connectToDatabase();
        const user = await User.findOne({ email });

        if (user) {
          const skill = question.skill as string;
          const finalScore: number =
            result?.scores?.final ?? result?.scores?.keyword ?? 0;

          // Ensure we have a Map
          const skillScores: Map<string, number> =
            (user.skillScores as Map<string, number>) || new Map();

          const existing = skillScores.get(skill) ?? 0;

          // Simple smoothing: 70% old, 30% new
          const updated =
            existing === 0 ? finalScore : existing * 0.7 + finalScore * 0.3;

          skillScores.set(skill, updated);
          user.skillScores = skillScores as any;

          await user.save();
        }
      }
    } catch (e) {
      console.error("Non-fatal error updating skillScores:", e);
      // Do not fail the API because of DB issues; just log them.
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in response-evaluator API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function runEvaluatorPython(inputData: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      "src/modules/response-evaluator/evaluate.py"
    );

    const pythonProcess = spawn("python", [scriptPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        try {
          const trimmed = output.trim();

          // In case any accidental logs sneak in before the JSON:
          const firstBrace = Math.min(
            ...["{", "["]
              .map((ch) => {
                const idx = trimmed.indexOf(ch);
                return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
              })
          );

          const jsonPart =
            firstBrace === Number.MAX_SAFE_INTEGER
              ? trimmed
              : trimmed.slice(firstBrace);

          const result = JSON.parse(jsonPart);
          resolve(result);
        } catch (parseError) {
          console.error(
            "Failed to parse evaluation result. Output:",
            output,
            "Error:",
            parseError
          );
          reject(
            new Error("Failed to parse evaluation result from Python script")
          );
        }
      } else {
        console.error(
          "Python evaluator exited with code:",
          code,
          "stderr:",
          errorOutput
        );
        reject(new Error("Evaluation failed: " + (errorOutput || "unknown")));
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Failed to start Python evaluator process:", error);
      reject(new Error("Failed to start evaluation process"));
    });

    // Send JSON into stdin
    try {
      pythonProcess.stdin.write(inputData);
      pythonProcess.stdin.end();
    } catch (e) {
      console.error("Error writing to Python stdin:", e);
      // Let process close and surface error via 'close' handler
    }
  }).catch((err) => {
    // Convert to a clean error response shape for the caller
    return {
      error: err?.message || "Evaluation error",
    };
  });
}
