import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { spawn, spawnSync } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Accept email from session OR request body (helps API clients)
    const session = await getServerSession();
    const body = await request.json().catch(() => ({}));
    const email = session?.user?.email || body?.email;
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized or missing email' }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get skills from user
    const skills = user.skill;
    if (!skills || skills.length === 0) {
      return NextResponse.json({ error: 'No skills found for user' }, { status: 400 });
    }

    // Generate questions using Python script
    const questions = await generateQuestions(skills);

    // Build generatedQuestions defensively to avoid runtime errors:
    // - support questions as array of objects
    // - support questions as object mapping skill -> array
    // - support single question object
    const generatedQuestions: Record<string, { text: string; keywords?: string[] }[]> = {};

    if (Array.isArray(questions)) {
      questions.forEach((q: any) => {
        const skill = q.skill || 'general';
        if (!generatedQuestions[skill]) generatedQuestions[skill] = [];
        generatedQuestions[skill].push({
          text: q.text ?? q.question ?? '',
          keywords: q.keywords ?? q.tags ?? [],
        });
      });
    } else if (questions && typeof questions === 'object') {
      // If it's already a mapping (skill -> list), normalize entries
      for (const [skill, list] of Object.entries(questions)) {
        if (!Array.isArray(list)) continue;
        generatedQuestions[skill] = list.map((q: any) => ({
          text: q.text ?? q.question ?? '',
          keywords: q.keywords ?? q.tags ?? [],
        }));
      }
    } else if (questions) {
      // Single object fallback
      const q = questions as any;
      const skill = q.skill || 'general';
      generatedQuestions[skill] = [
        {
          text: q.text ?? q.question ?? '',
          keywords: q.keywords ?? q.tags ?? [],
        },
      ];
    }

    user.generatedQuestions = generatedQuestions;
    await user.save();

    return NextResponse.json({ message: 'Questions generated and stored successfully', questions: generatedQuestions });

  } catch (error: any) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

async function generateQuestions(skills: string[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'src/modules/question-generator/question_bank/generate_for_skills.py');
    const cwd = path.dirname(scriptPath);

    // Find a working python executable: env PYTHON, then 'py', 'python3', 'python'
    const candidates = [process.env.PYTHON, 'py', 'python3', 'python'].filter(Boolean) as string[];
    let pythonCmd: string | null = null;
    for (const c of candidates) {
      try {
        const res = spawnSync(c, ['--version'], { stdio: ['ignore', 'pipe', 'pipe'] });
        if (res && res.status === 0) {
          pythonCmd = c;
          break;
        }
      } catch {
        // ignore and try next
      }
    }
    if (!pythonCmd) {
      // Provide clear error for missing python binary
      reject(new Error('No Python executable found. Set PYTHON env or ensure py/python3/python is on PATH.'));
      return;
    }

    const pythonProcess = spawn(pythonCmd, [scriptPath], { cwd, env: process.env });

    let output = '';
    let errorOutput = '';

    // send skills via stdin (some scripts expect JSON from stdin)
    try {
      pythonProcess.stdin.write(JSON.stringify(skills));
      pythonProcess.stdin.end();
    } catch (e) {
      // not critical; keep going
    }

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // safety timeout in case script hangs
    const TIMEOUT_MS = 30_000;
    const timeout = setTimeout(() => {
      try { pythonProcess.kill(); } catch {}
    }, TIMEOUT_MS);

    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        // include stderr to help debugging
        reject(new Error(`Python script exited with code ${code}. stderr: ${errorOutput.trim()}`));
        return;
      }

      const out = (output || '').trim();
      if (!out) {
        // no output -> return empty list rather than fail
        resolve([]);
        return;
      }

      // Try to extract JSON payload if logs are present before JSON
      try {
        const firstObj = out.indexOf('{');
        const firstArr = out.indexOf('[');
        let start = -1;
        if (firstObj !== -1 && firstArr !== -1) start = Math.min(firstObj, firstArr);
        else start = Math.max(firstObj, firstArr);

        const toParse = start !== -1 ? out.slice(start) : out;
        const parsed = JSON.parse(toParse);
        resolve(Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []));
      } catch (parseError: any) {
        // Log stdout/stderr for debugging and return empty array to avoid breaking flow
        console.error('Failed to parse Python output. stdout:', output, 'stderr:', errorOutput, 'parseError:', parseError?.message);
        resolve([]); // fallback: treat as no questions
      }
    });

    pythonProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}
