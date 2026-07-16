import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

async function getDirectoryFileCount(dirPath: string): Promise<number> {
  try {
    const files = await fs.readdir(dirPath);
    return files.filter(f => f !== ".gitkeep" && f !== "README.md").length;
  } catch (e) {
    return 0;
  }
}

async function getCsvRowCount(filePath: string): Promise<number> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const lines = data.split("\n").filter(line => line.trim().length > 0);
    return lines.length > 1 ? lines.length - 1 : 0; // exclude header
  } catch (e) {
    return 0;
  }
}

export async function GET() {
  try {
    const rootDir = path.join(process.cwd(), "..");
    
    // Read real metrics
    const totalScanned = await getDirectoryFileCount(path.join(rootDir, "job_scraper"));
    const managedApplications = await getCsvRowCount(path.join(rootDir, "job_search_tracker.csv"));
    const gapsIdentified = await getDirectoryFileCount(path.join(rootDir, "upskill"));
    const checkedPDFs = await getDirectoryFileCount(path.join(rootDir, "documents", "applications"));

    return NextResponse.json({
      totalScanned,
      managedApplications,
      gapsIdentified,
      checkedPDFs
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
