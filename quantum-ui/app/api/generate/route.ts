// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

const PROJECT_DIR = path.resolve(process.cwd(), "../");
const VAE_SCRIPT = path.join(PROJECT_DIR, "molecular_vae.py");

export async function POST(req: NextRequest) {
  const { count = 1, diversity = 0.8 } = await req.json();

  if (!fs.existsSync(VAE_SCRIPT)) {
    return NextResponse.json(
      { error: `VAE script not found at ${VAE_SCRIPT}.` },
      { status: 500 }
    );
  }

  // Generation can take a while for large batches
  const timeout = 120000;

  let stdout = "";
  try {
    const output = await execAsync(
      `python "${VAE_SCRIPT}" --generate --count ${count} --diversity ${diversity} --json`,
      { cwd: PROJECT_DIR, timeout }
    );
    stdout = output.stdout;
  } catch (err: any) {
    stdout = err.stdout || "";
    if (!stdout && err.message) {
      return NextResponse.json({ error: "Exception running VAE: " + err.message }, { status: 500 });
    }
  }

  try {
    const result = JSON.parse(stdout.trim());

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "VAE generation failed" },
        { status: 500 }
      );
    }
    
    // Return the list of molecules
    return NextResponse.json(result);
  } catch (parseErr) {
    return NextResponse.json(
      { error: "Failed to parse VAE output. Raw: " + stdout.substring(0, 200) },
      { status: 500 }
    );
  }
}
