import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Simple helper to extract skills from markdown
function extractSkills(content: string): string[] {
  const regex = /\\*\\*(.*?)\\*\\*/g;
  let matches = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1]) matches.push(match[1].toLowerCase().trim());
  }
  return matches;
}

export async function POST(req: Request) {
  try {
    const rootDir = path.join(process.cwd(), "..");
    const scrapePath = path.join(rootDir, "job_scraper", "latest_scrape.json");
    const profilePath = path.join(rootDir, ".claude", "skills", "job-application-assistant", "01-candidate-profile.md");
    
    // 1. Read the profile and extract keywords
    let profileContent = "";
    try {
      profileContent = await fs.readFile(profilePath, "utf-8");
    } catch (e) {
      throw new Error(`Candidate profile not found at ${profilePath}`);
    }
    const profileKeywords = extractSkills(profileContent);

    // 2. Read the latest scrape
    let jobs = [];
    try {
      const fileData = await fs.readFile(scrapePath, "utf-8");
      jobs = JSON.parse(fileData);
    } catch (e) {
      throw new Error(`No scraped jobs found. Please run the scraper first.`);
    }

    // 3. Rank jobs based on keyword match
    const rankedJobs = jobs.map((job: any) => {
      let score = 50; // Base score
      const jobString = JSON.stringify(job).toLowerCase();
      
      let hits = 0;
      profileKeywords.forEach(keyword => {
        if (jobString.includes(keyword)) hits++;
      });

      // Simple scoring formula (max out at 99 to leave room for exact exact matches)
      score = Math.min(99, score + (hits * 5));
      
      // If job requires skills explicitly listed in the array, give bonus
      if (job.skills && Array.isArray(job.skills)) {
        job.skills.forEach((skill: string) => {
          if (profileKeywords.includes(skill.toLowerCase())) score += 10;
        });
      }

      return { ...job, matchScore: Math.min(100, score) };
    });

    // 4. Sort descending by score
    rankedJobs.sort((a: any, b: any) => b.matchScore - a.matchScore);

    // 5. Save the ranked results
    await fs.writeFile(scrapePath, JSON.stringify(rankedJobs, null, 2));

    return NextResponse.json({ success: true, count: rankedJobs.length, topScore: rankedJobs[0]?.matchScore || 0 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
