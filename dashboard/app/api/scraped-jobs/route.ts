import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const rootDir = path.join(process.cwd(), "..");
    const scrapePath = path.join(rootDir, "job_scraper", "latest_scrape.json");
    
    let jobs = [];
    try {
      const fileData = await fs.readFile(scrapePath, "utf-8");
      jobs = JSON.parse(fileData);
    } catch (e) {
      // Return empty array if file does not exist yet
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({ success: true, data: jobs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
