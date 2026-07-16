import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

// Helper function to extract info from markdown
function extractField(content: string, field: string): string {
  const regex = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.*)`);
  const match = content.match(regex);
  if (match && match[1]) {
    // If it's a markdown link [text](url), extract the url
    const linkMatch = match[1].match(/\\]\\((.*?)\\)/);
    if (linkMatch && linkMatch[1]) return linkMatch[1];
    return match[1].trim();
  }
  return "";
}

export async function POST(req: Request) {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    const { job_id, application_url } = await req.json();
    log(`[INFO] Received Auto-Apply request for Job ID: ${job_id}`);
    log(`[INFO] Target URL: ${application_url}`);

    // 1. Context Assembly
    const profilePath = path.join(process.cwd(), "..", ".claude", "skills", "job-application-assistant", "01-candidate-profile.md");
    log(`[INFO] Reading candidate profile from ${profilePath}...`);
    
    let profileContent = "";
    try {
      profileContent = await fs.readFile(profilePath, "utf-8");
    } catch (e) {
      throw new Error(`Candidate profile not found at ${profilePath}`);
    }

    const candidate = {
      firstName: extractField(profileContent, "Name").split(' ')[0] || "John",
      lastName: extractField(profileContent, "Name").split(' ').slice(1).join(' ') || "Doe",
      email: extractField(profileContent, "Email"),
      phone: extractField(profileContent, "Phone"),
      linkedin: extractField(profileContent, "LinkedIn"),
      github: extractField(profileContent, "GitHub"),
    };

    log(`[SUCCESS] Extracted Data: ${candidate.firstName} ${candidate.lastName}, ${candidate.email}`);

    // 2. Asset Gathering
    const resumePath = path.join(process.cwd(), "..", "cv", "resume.pdf");
    // Ensure resume directory exists for the test if it doesn't
    try {
      await fs.access(resumePath);
    } catch (e) {
      log(`[WARNING] Resume not found at ${resumePath}. Please make sure you have generated your PDF.`);
    }

    // 3. Browser Automation Loop
    log(`[Browser] Launching Headless Puppeteer...`);
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    try {
      const page = await browser.newPage();
      
      // Setup evasion and user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      log(`[Browser] Navigating to ${application_url}...`);
      
      // We wrap the navigation in a try-catch to catch structural / network errors gracefully
      try {
        await page.goto(application_url, { waitUntil: 'networkidle2', timeout: 30000 });
      } catch (navError) {
        throw new Error(`Failed to navigate to ${application_url}. Site might be down or blocking bots.`);
      }

      // Check for common Bot Protection indicators
      const content = await page.content();
      if (content.includes("Cloudflare") || content.includes("Please verify you are human") || content.includes("g-recaptcha")) {
        throw new Error("CAPTCHA_DETECTED_MANUAL_INTERVENTION_REQUIRED");
      }

      log(`[Browser] Scanning form for input fields...`);

      // 4. Fuzzy Locator & Autofill Logic
      // This runs within the browser context
      await page.evaluate(async (data) => {
        const inputs = Array.from(document.querySelectorAll('input, textarea')) as HTMLInputElement[];
        
        const fillInput = (el: HTMLInputElement, value: string) => {
          if (!el || !value) return;
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        for (const input of inputs) {
          const type = (input.type || '').toLowerCase();
          if (type === 'hidden' || type === 'submit' || type === 'button' || type === 'file') continue;

          const ident = ((input.name || '') + ' ' + (input.id || '') + ' ' + (input.placeholder || '') + ' ' + (input.getAttribute('aria-label') || '')).toLowerCase();
          
          if (ident.includes('first') && ident.includes('name')) fillInput(input, data.firstName);
          else if (ident.includes('last') && ident.includes('name')) fillInput(input, data.lastName);
          else if (ident.includes('name')) fillInput(input, data.firstName + ' ' + data.lastName);
          else if (ident.includes('email')) fillInput(input, data.email);
          else if (ident.includes('phone') || ident.includes('tel')) fillInput(input, data.phone);
          else if (ident.includes('linkedin')) fillInput(input, data.linkedin);
          else if (ident.includes('github') || ident.includes('portfolio') || ident.includes('website')) fillInput(input, data.github);
        }
      }, candidate);
      
      log(`[Browser] Injected Candidate Profile Data into fields.`);

      // 5. Upload Resume
      log(`[Browser] Attempting to locate file upload fields...`);
      const fileInputs = await page.$$('input[type="file"]');
      if (fileInputs.length > 0) {
        try {
          await fileInputs[0].uploadFile(resumePath);
          log(`[SUCCESS] Attached resume.pdf successfully.`);
        } catch (uploadError) {
          log(`[WARNING] Could not attach file. Either path is invalid or input is restricted.`);
        }
      } else {
        log(`[INFO] No resume file input detected on this page.`);
      }

      // 6. Submit Application
      // Note: In a real bot we would trigger a click on the submit button. 
      // For safety, we will locate it but avoid actually submitting unless specifically configured.
      log(`[Browser] Attempting to locate Submit Button...`);
      const submitButtons = await page.$$('button[type="submit"], input[type="submit"], button:not([type])');
      
      let foundSubmit = false;
      for (const btn of submitButtons) {
        const text = await page.evaluate(el => (el.textContent || el.value || '').toLowerCase(), btn);
        if (text.includes('apply') || text.includes('submit')) {
          foundSubmit = true;
          // await btn.click(); // Commented out to prevent accidental real submissions during testing
          log(`[Browser] Found submit button ("${text.trim()}"). Execution halted before final commit for safety.`);
          break;
        }
      }

      if (!foundSubmit) {
        log(`[WARNING] Could not definitively find a submit button. Manual intervention may be required.`);
      }

      log(`[SUCCESS] Autonomous workflow completed gracefully.`);

    } finally {
      log(`[Browser] Closing session...`);
      await browser.close();
    }

    return NextResponse.json({ success: true, logs });

  } catch (error: any) {
    log(`[ERROR] ${error.message}`);
    return NextResponse.json({ success: false, logs, error: error.message }, { status: 500 });
  }
}
