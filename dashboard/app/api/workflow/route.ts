import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import util from "util";

const execAsync = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const { action } = await req.json();
    const rootDir = path.join(process.cwd(), "..");

    let command = "";

    switch (action) {
      case "apply":
        // For the real dashboard, 'apply' triggers the auto-apply engine via our other endpoint
        command = `echo "Auto-Apply is handled dynamically from the Application Grid. To trigger it globally, please use the Application Grid actions or send a POST request to /api/auto-apply with a target URL."`;
        break;
      case "rank":
        command = `claude -c "/rank"`; // The original architecture uses claude CLI for this
        break;
      case "verify_pdf":
        // Needs a target PDF file. Assuming they compile main_example.tex to main_example.pdf
        command = `python tools/verify_pdf.py cv/main_example.pdf`;
        break;
      default:
        throw new Error("Invalid workflow action");
    }

    try {
      const { stdout, stderr } = await execAsync(command, { cwd: rootDir });
      return NextResponse.json({ success: true, logs: `[INFO] Executing: ${command}\n\n[OUTPUT]\n${stdout}\n${stderr}` });
    } catch (cmdError: any) {
      let friendlyError = `[ERROR] Workflow failed.\n[DETAILS]\n${cmdError.message}\n${cmdError.stderr || ""}`;
      
      // Provide user-friendly hints for common missing dependencies
      if (cmdError.message.includes("claude' is not recognized")) {
         friendlyError = `[ERROR] Claude CLI is not installed globally.\n\nThe "Job Match Ranking" feature requires the Anthropic Claude CLI to execute agentic reasoning. \nPlease install it by running:\n\n  npm install -g @anthropic-ai/claude-code\n\nThen try again!`;
      }
      
      if (cmdError.message.includes("No such file or directory") && action === "verify_pdf") {
         friendlyError = `[ERROR] PDF not found.\n\nThe ATS Check requires a compiled PDF to scan. It attempted to scan 'cv/main_example.pdf' but the file does not exist yet. Please ensure your LaTeX CV is compiled first.`;
      }

      return NextResponse.json({ 
        success: false, 
        logs: friendlyError
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
