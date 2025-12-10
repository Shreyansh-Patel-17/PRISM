import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
const execAsync = promisify(exec);

export async function POST(request: NextRequest): Promise<Response> {
  console.log('Speech-to-text API called');
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      console.log('No audio file provided');
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }
    console.log('Audio file received, size:', audioFile.size);

    // Save the audio file temporarily
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const tempInputPath = path.join(tempDir, `input_${Date.now()}.webm`);
    const tempWavPath = path.join(tempDir, `output_${Date.now()}.wav`);
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    fs.writeFileSync(tempInputPath, buffer);

    // Convert webm to wav using ffmpeg
    try {
      await execAsync(`ffmpeg -i "${tempInputPath}" -acodec pcm_s16le -ar 16000 "${tempWavPath}" -y`);
    } catch (conversionError) {
      console.error('FFmpeg conversion failed:', conversionError);
      // Clean up temp files
      try {
        fs.unlinkSync(tempInputPath);
      } catch (err) {
        console.error('Error cleaning up input file:', err);
      }
      return NextResponse.json({
        error: 'Audio conversion failed',
        details: 'FFmpeg conversion error'
      }, { status: 500 });
    }

    // Clean up input file
    try {
      fs.unlinkSync(tempInputPath);
    } catch (err) {
      console.error('Error cleaning up input file:', err);
    }

    // Run the Python script
    const pythonScriptPath = path.join(process.cwd(), 'src/modules/Speech-to-Text/speech_to_text01.py');

    return new Promise((resolve) => {
      const pythonProcess = spawn('python', [pythonScriptPath, tempWavPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let transcription = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Python stdout:', output);
        // Capture explicit ERROR lines from stdout (some scripts print errors to stdout)
        const outErrMatch = output.match(/ERROR:\s*(.+)/);
        if (outErrMatch) {
          if (errorOutput) errorOutput += '\n';
          errorOutput += outErrMatch[1].trim();
        }
        // Extract transcription from output (match either "User said" or "You said")
        const match = output.match(/SUCCESS:\s*(?:You|User)\s+said:\s*(.+)/i);
        if (match) {
          transcription = match[1].trim();
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        const s = data.toString();
        console.error('Python stderr:', s);
        // Some errors may appear on stderr; try to extract ERROR lines
        const stderrErrMatch = s.match(/ERROR:\s*(.+)/);
        if (stderrErrMatch) {
          if (errorOutput) errorOutput += '\n';
          errorOutput += stderrErrMatch[1].trim();
        } else {
          // keep full stderr as fallback
          if (errorOutput) errorOutput += '\n';
          errorOutput += s.trim();
        }
      });

      pythonProcess.on('close', (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempWavPath);
        } catch (err) {
          console.error('Error cleaning up temp file:', err);
        }

        if (code === 0) {
          // If script printed explicit ERROR: message, surface that to client
          if (errorOutput) {
            console.error('Speech recognition reported error:', errorOutput);
            resolve(NextResponse.json({ error: errorOutput }, { status: 400 }));
          } else if (transcription) {
            resolve(NextResponse.json({ transcription }));
          } else {
            // No transcription and no explicit error -> inform client
            console.error('Python process exited with 0 but no transcription produced. Stderr:', errorOutput);
            resolve(NextResponse.json({ error: 'Speech recognition returned no transcription' }, { status: 500 }));
          }
        } else {
          console.error('Python process exited with code:', code);
          console.error('Error output:', errorOutput);
          resolve(NextResponse.json({ error: 'Speech recognition failed', details: errorOutput }, { status: 500 }));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        // Clean up temp file
        try {
          fs.unlinkSync(tempWavPath);
        } catch (err) {
          console.error('Error cleaning up temp file:', err);
        }
        resolve(NextResponse.json({ error: 'Failed to start speech recognition process' }, { status: 500 }));
      });
    });

  } catch (error) {
    console.error('Error in speech-to-text API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
