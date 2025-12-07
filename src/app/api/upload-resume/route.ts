import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { spawn } from "child_process";
import rateLimit from "@/middleware/rateLimit";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  await rateLimit(req);
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const email = form.get("email") as string | null;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    // Save temp file - simplified: Node environment specifics required; here we forward bytes to python via stdin is not ideal for file read, so write to temp file
    const arrayBuffer = await file.arrayBuffer();
    const tmpPath = path.join(process.cwd(), "tmp", `${Date.now()}_${file.name}`);
    // Node fs is required; using dynamic import to avoid SSR issues
    const fs = await import("fs/promises");
    await fs.mkdir(path.dirname(tmpPath), { recursive: true });
    await fs.writeFile(tmpPath, Buffer.from(arrayBuffer));

    // Call python parser
    const scriptPath = path.join(process.cwd(), "src", "modules", "resume-parser", "resume_parser.py");
    const python = process.env.PYTHON || "python";
    return await runParserAndRespond(python, scriptPath, tmpPath, email);
  } catch (err: any) {
    console.error("Upload resume error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

async function runParserAndRespond(pythonCmd: string, scriptPath: string, filePath: string, email: string): Promise<Response> {
  return new Promise(async (resolve) => {
    const proc = spawn(pythonCmd, [scriptPath, filePath], { env: process.env });
    let out = "";
    let errOut = "";
    proc.stdout.on("data", (d) => (out += d.toString()));
    proc.stderr.on("data", (d) => (errOut += d.toString()));
    proc.on("close", async (code) => {
      console.log("Python process exited with code:", code);
      console.log("stdout:", out);
      console.log("stderr:", errOut);
      if (code !== 0) {
        resolve(NextResponse.json({ error: "Parser failed", stderr: errOut }, { status: 500 }));
        return;
      }
      try {
        console.log("Raw stdout:", JSON.stringify(out));
        const json = JSON.parse(out.trim());
        // Extract only technical skills
        const technicalSkills = json["Technical Skills"] || [];
        // Save technical skills to database
        await connectToDatabase();
        const user = await User.findOne({ email });
        if (user) {
          user.skill = technicalSkills;
          await user.save();
        }
        resolve(NextResponse.json({ parsed: json, message: "Technical skills saved successfully" }, { status: 200 }));
      } catch (e) {
        resolve(NextResponse.json({ error: "Invalid parser output", raw: out, stderr: errOut }, { status: 500 }));
      }
    });
  });
}
