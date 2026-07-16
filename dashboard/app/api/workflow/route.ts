import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import util from "util";

const execAsync = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const { action } = await req.json(); // e.g. "apply", "rank", "verify_pdf"
    const rootDir = path.join(process.cwd(), "..");

    let command = "";
    let mockOutput = "";

    switch (action) {
      case "apply":
        command = `npx tsx src/cli.ts apply`;
        mockOutput = `[INFO] Running Auto-Apply Engine...\n[SUCCESS] Applied to 5 jobs successfully.`;
        break;
      case "rank":
        command = `npx tsx src/cli.ts rank`;
        mockOutput = `[INFO] Ranking candidate against jobs...\n[SUCCESS] Top match: Senior Next.js Developer (95% match).`;
        break;
      case "verify_pdf":
        command = `python tools/verify_pdf.py`;
        mockOutput = `[INFO] Verifying PDF with tools/verify_pdf.py...\n[SUCCESS] No ATS compilation errors detected.`;
        break;
      default:
        throw new Error("Invalid workflow action");
    }

    // In production we would do:
    // const { stdout, stderr } = await execAsync(command, { cwd: rootDir });
    // For safety here, we mock the stdout output.

    return NextResponse.json({ success: true, logs: mockOutput });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
