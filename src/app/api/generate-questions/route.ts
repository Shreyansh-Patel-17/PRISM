import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import path from "path";
import { spawn, spawnSync } from "child_process";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

// ---- Python bridge (unchanged in behavior, just with stronger logs) ---- //

async function generateQuestions(skills: string[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      "src/modules/question-generator/question_bank/generate_for_skills.py"
    );
    const cwd = path.dirname(scriptPath);

    const pythonCmd = "c:\\python64\\python.exe";
    try {
      const res = spawnSync(pythonCmd, ["--version"], {
        stdio: ["ignore", "pipe", "pipe"],
      });
      if (!res || res.status !== 0) {
        console.error("Python version check failed:", res?.stderr?.toString());
        reject(new Error("Python executable not found or not working."));
        return;
      }
    } catch (err) {
      console.error("Python version check error:", err);
      reject(new Error("Python executable not found or not working."));
      return;
    }

    console.log("[generateQuestions] Using skills:", skills);

    const pythonProcess = spawn(pythonCmd, [scriptPath], {
      cwd,
      env: {
        ...process.env,
        PYTHONPATH: "c:\\python64\\Lib\\site-packages",
        PATH: "c:\\python64;" + process.env.PATH,
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let output = "";
    let errorOutput = "";

    try {
      pythonProcess.stdin?.write(JSON.stringify(skills));
      pythonProcess.stdin?.end();
    } catch (e) {
      console.error("[generateQuestions] Failed to write skills to stdin:", e);
    }

    pythonProcess.stdout?.on("data", (data: Buffer) => {
      const chunk = data.toString();
      output += chunk;
    });

    pythonProcess.stderr?.on("data", (data: Buffer) => {
      const chunk = data.toString();
      errorOutput += chunk;
    });

    const TIMEOUT_MS = 90_000;
    const timeout = setTimeout(() => {
      try {
        pythonProcess.kill();
      } catch {}
    }, TIMEOUT_MS);

    pythonProcess.on("close", (code: number | null, signal: NodeJS.Signals | null) => {
      clearTimeout(timeout);
      console.log("[generateQuestions] Python exited with code:", code);
      if (errorOutput) {
        console.log("[generateQuestions] stderr:", errorOutput);
      }
      console.log("[generateQuestions] raw stdout:", output);
      
      if (signal) {
        reject(
          new Error(
            `Python process killed by signal ${signal}. stderr: ${errorOutput.trim()}`
          )
        );
        return;
      }

      if (code !== 0) {
        reject(
          new Error(
            `Python script exited with code ${code}. stderr: ${errorOutput.trim()}`
          )
        );
        return;
      }

      const out = (output || "").trim();
      if (!out) {
        console.warn("[generateQuestions] No output from Python script");
        resolve([]);
        return;
      }

      try {
        // Extract JSON, ignoring any logger noise
        const firstObj = out.indexOf("{");
        const firstArr = out.indexOf("[");
        let start = -1;
        if (firstObj !== -1 && firstArr !== -1) start = Math.min(firstObj, firstArr);
        else start = Math.max(firstObj, firstArr);

        const toParse = start !== -1 ? out.slice(start) : out;
        const parsed = JSON.parse(toParse);
        console.log("[generateQuestions] Parsed questions:", parsed);
        resolve(Array.isArray(parsed) ? parsed : parsed ? [parsed] : []);
      } catch (parseError: any) {
        console.error(
          "[generateQuestions] Failed to parse Python output. stdout:",
          output,
          "stderr:",
          errorOutput,
          "parseError:",
          parseError?.message
        );
        resolve([]); // fallback: empty
      }
    });

    pythonProcess.on("error", (err: Error) => {
      clearTimeout(timeout);
      console.error("[generateQuestions] Python process error:", err);
      reject(err);
    });
  });
}

// ---- Main handler ---- //

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession();
    const body = await request.json().catch(() => ({}));
    const email = session?.user?.email || body?.email;

    if (!email) {
      console.warn("[generate-questions] No email/session");
      return NextResponse.json(
        { error: "Unauthorized or missing email" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      console.warn("[generate-questions] User not found:", email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(
      "[generate-questions] Found user:",
      email,
      "skills:",
      user.skill,
      "existing generatedQuestions keys:",
      user.generatedQuestions ? Array.from(user.generatedQuestions.keys?.() ?? []) : []
    );

    // If questions already generated, return them
    if (
      user.generatedQuestions &&
      user.generatedQuestions.size &&
      user.generatedQuestions.size > 0
    ) {
      console.log("[generate-questions] Questions already generated, returning existing");
      return NextResponse.json({
        message: "Questions already generated",
        questions: Object.fromEntries(user.generatedQuestions as any),
        alreadyGenerated: true,
      });
    }

    const skills: string[] = user.skill || [];
    if (!skills.length) {
      console.warn("[generate-questions] No skills found for user");
      return NextResponse.json(
        { error: "No skills found for user" },
        { status: 400 }
      );
    }

    const questions = await generateQuestions(skills);
    console.log("[generate-questions] Questions array length:", questions.length);

    if (!questions || questions.length === 0) {
      console.error(
        "[generate-questions] Python returned no questions. NOT saving to DB."
      );
      return NextResponse.json(
        {
          error:
            "Question generation returned no questions. Check Python logs / Gemini output.",
        },
        { status: 500 }
      );
    }

    const generatedQuestions: Record<
      string,
      { text: string; keywords?: string[] }[]
    > = {};

    if (Array.isArray(questions)) {
      questions.forEach((q: any) => {
        if (typeof q === "string") {
          const skill = "general";
          if (!generatedQuestions[skill]) generatedQuestions[skill] = [];
          generatedQuestions[skill].push({ text: q, keywords: [] });
          return;
        }
        const skill = q.skill || "general";
        if (!generatedQuestions[skill]) generatedQuestions[skill] = [];
        generatedQuestions[skill].push({
          text: q.text ?? q.question ?? (typeof q === "string" ? q : ""),
          keywords: q.keywords ?? q.tags ?? [],
        });
      });
    } else if (questions && typeof questions === "object") {
      for (const [skill, list] of Object.entries(questions)) {
        if (!Array.isArray(list)) continue;
        generatedQuestions[skill] = list.map((q: any) => {
          if (typeof q === "string") {
            return { text: q, keywords: [] };
          }
          return {
            text: q.text ?? q.question ?? "",
            keywords: q.keywords ?? q.tags ?? [],
          };
        });
      }
    }

    console.log(
      "[generate-questions] Normalized generatedQuestions object:",
      JSON.stringify(generatedQuestions, null, 2)
    );

    // Extra safety: ensure it's not empty after normalization
    if (!Object.keys(generatedQuestions).length) {
      console.error(
        "[generate-questions] Normalized generatedQuestions is empty. NOT saving."
      );
      return NextResponse.json(
        {
          error:
            "Normalized generated questions is empty. Check generator output format.",
        },
        { status: 500 }
      );
    }

    // Mongoose Map will happily accept plain object here
    user.generatedQuestions = generatedQuestions as any;
    await user.save();

    console.log("[generate-questions] Saved generatedQuestions for user:", email);

    return NextResponse.json({
      message: "Questions generated and stored successfully",
      questions: generatedQuestions,
    });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
