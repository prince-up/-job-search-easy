import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const PROFILE_PATH = path.join(process.cwd(), "..", ".claude", "skills", "job-application-assistant", "01-candidate-profile.md");

export async function GET() {
  try {
    let content = "";
    try {
      content = await fs.readFile(PROFILE_PATH, "utf-8");
    } catch (e) {
      // Fallback content if file doesn't exist yet
      content = `# Candidate Profile\n\nName: John Doe\nRole: Full-Stack Engineer\n\n## Skills\n- React\n- Next.js\n- Node.js\n`;
    }
    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    
    // Ensure directories exist
    const dir = path.dirname(PROFILE_PATH);
    await fs.mkdir(dir, { recursive: true });

    // Write back exactly preserving format
    await fs.writeFile(PROFILE_PATH, content, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
