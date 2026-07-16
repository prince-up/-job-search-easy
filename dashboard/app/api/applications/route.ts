import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const rootDir = path.join(process.cwd(), "..");
    // Simulate fetching from the core JSON storage
    
    const mockJobs = [
      { id: "job-101", title: "Senior Next.js Developer", company: "Vercel", location: "Remote", datePosted: "2026-07-15", status: "Applied" },
      { id: "job-102", title: "Full Stack Engineer", company: "OpenAI", location: "San Francisco, CA", datePosted: "2026-07-14", status: "Pending" },
      { id: "job-103", title: "Frontend Architect", company: "Stripe", location: "Remote", datePosted: "2026-07-12", status: "Interviewing" },
      { id: "job-104", title: "MERN Stack Dev", company: "Google", location: "Mountain View, CA", datePosted: "2026-07-10", status: "Applied" },
    ];

    return NextResponse.json({ success: true, data: mockJobs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
