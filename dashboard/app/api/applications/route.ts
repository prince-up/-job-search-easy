import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const rootDir = path.join(process.cwd(), "..");
    const trackerPath = path.join(rootDir, "job_search_tracker.csv");
    
    let csvData = "";
    try {
      csvData = await fs.readFile(trackerPath, "utf-8");
    } catch (e) {
      // If file doesn't exist yet, return empty array
      return NextResponse.json({ success: true, data: [] });
    }

    const lines = csvData.split("\n").filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    
    const jobs = lines.slice(1).map((line, index) => {
      // Simple CSV parsing (does not perfectly handle quotes containing commas, but works for basic trackers)
      const values = line.split(",").map(v => v.trim());
      
      const job: any = {
        id: `job-${index}`,
        title: "Unknown Title",
        company: "Unknown Company",
        location: "Remote",
        datePosted: new Date().toISOString().split('T')[0],
        status: "Tracked"
      };

      headers.forEach((header, i) => {
        if (header.includes("title") || header.includes("role")) job.title = values[i];
        if (header.includes("company")) job.company = values[i];
        if (header.includes("location")) job.location = values[i];
        if (header.includes("date") || header.includes("applied")) job.datePosted = values[i];
        if (header.includes("status") || header.includes("outcome")) job.status = values[i];
      });

      return job;
    });

    return NextResponse.json({ success: true, data: jobs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
