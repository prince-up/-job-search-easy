import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import util from "util";

const execAsync = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const { keywords, location, board } = await req.json();
    const rootDir = path.join(process.cwd(), "..");
    const scraperDir = path.join(rootDir, "job_scraper");

    // Ensure job_scraper dir exists
    try {
      await fs.access(scraperDir);
    } catch {
      await fs.mkdir(scraperDir, { recursive: true });
    }

    let command = "";
    let targetDir = "";

    // Map the selected board to the correct CLI agent tool
    if (board === "LinkedIn Engine") {
      targetDir = path.join(rootDir, ".agents", "skills", "linkedin-search", "cli");
      command = `bun run src/cli.ts search "${keywords}" -l "${location}"`;
    } else if (board === "Freehire Engine" || board === "Freehire") {
      targetDir = path.join(rootDir, ".agents", "skills", "freehire-search", "cli");
      command = `bun run src/cli.ts search "${keywords}"`; 
    } else {
      // Fallback
      targetDir = path.join(rootDir, ".agents", "skills", "linkedin-search", "cli");
      command = `bun run src/cli.ts search "${keywords}" -l "${location}"`;
    }

    try {
      const { stdout } = await execAsync(command, { cwd: targetDir, maxBuffer: 1024 * 1024 * 10 });
      
      let parsedJobs = [];
      
      try {
        // Strip out any CLI prefix logs to find the first JSON structure
        const jsonStartIndex = stdout.search(/[\{\[]/);
        if (jsonStartIndex !== -1) {
          const jsonString = stdout.substring(jsonStartIndex);
          const parsedData = JSON.parse(jsonString);
          
          if (parsedData && parsedData.results && Array.isArray(parsedData.results)) {
            parsedJobs = parsedData.results;
          } else if (Array.isArray(parsedData)) {
            parsedJobs = parsedData;
          }
        }
        
        if (parsedJobs.length > 0) {
          await fs.writeFile(
            path.join(scraperDir, "latest_scrape.json"), 
            JSON.stringify(parsedJobs, null, 2)
          );
        }
      } catch (e) {
        console.error("Failed to parse JSON from scraper output", e);
      }

      const formattedLogs = `[INFO] Starting Engine...\n[INFO] Initializing ${board} Scraper Engine...\n[INFO] Executing: ${command}\n\n[SUCCESS] Extracted ${parsedJobs.length} jobs and saved to latest_scrape.json.\n`;
      
      return NextResponse.json({ success: true, logs: formattedLogs });
    } catch (cmdError: any) {
      return NextResponse.json({ 
        success: false, 
        logs: `[ERROR] Failed to execute Scraper.\n[DETAILS]\n${cmdError.message}\n${cmdError.stderr || ""}` 
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
