<p align="center">
  <img src="assets/mascot/pip_flight_loop.gif" alt="Pip, the courier bird" width="200">
</p>

# 🚀 Autonomous AI Job Search & Web SaaS Dashboard

*The ultimate autonomous job application framework—now with a Next.js Dark Mode SaaS Interface.*

<p align="center">
  <a href="#" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Maintained%20by-Prince-8b5cf6?style=for-the-badge" alt="Maintained by Prince"/></a>
  <a href="#" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Architecture-Next.js%20%7C%20Agentic%20CLI-3b82f6?style=for-the-badge" alt="Architecture"/></a>
</p>

An elite, full-stack AI-powered job application engine. This project combines a high-converting, professional **Next.js SaaS Web Interface** with a robust background CLI Agentic framework to fully automate your job search. 

Fork it, load your profile, and let the system intelligently scrape job boards, verify your ATS compatibility, draft LaTeX CVs, and autonomously apply to jobs in the background!

> **Architected and maintained by Prince.** Built to streamline modern DevSecOps, Full-Stack, and Software Engineering career hunting.

---

## 🌟 The New Web Dashboard Interface

We have upgraded the core CLI experience with a premium, glassmorphic Next.js web application. Run the local server to control the entire engine visually!

### Features:
- 📊 **SaaS Overview Hub:** Monitor total jobs scanned, applications managed, and live terminal logs securely in the browser.
- 🎯 **Scraper Control Center:** Trigger regional and keyword-specific job scraping (LinkedIn, Freehire, etc.) with a single click.
- 🗂 **Tailored Application Grid:** Manage all your applications dynamically in an interactive matrix.
- 📝 **AI Candidate Profile Studio:** Edit your core structured Markdown profiles directly from a visual form interface.
- 🤖 **Autonomous One-Click Apply:** Let **Puppeteer** (headless browser automation) take the wheel. The system reads your profile, auto-fills external job board forms, uploads your PDF resume, and cleanly handles CAPTCHAs!

---

## ⚡ Quick Start: Running the SaaS Dashboard

### 1. Clone & Install
```bash
git clone https://github.com/prince-up/ai-job-search.git
cd ai-job-search
```

### 2. Install Dashboard Dependencies
```bash
cd dashboard
npm install
```

### 3. Launch the Web Interface
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. You can now visually configure your profile and trigger the background agents.

---

## 🛠 Core CLI Workflow (For Terminal Power Users)

If you prefer the raw command line, the original Agentic CLI framework is fully preserved.

```text
/setup          /scrape              /apply <url>
  |                |                     |
  v                v                     v
Fill in        Search job           Evaluate fit
your profile   portals              Score & recommend
  |                |                     |
  v                v                     v
Profile        Present matches      Draft CV + Cover Letter
files ready    with fit ratings     (LaTeX, tailored)
                   |                     |
                   v                     v
               Pick a match         Reviewer agent critiques
               -> /apply            -> Revise -> Final output
```

### Key CLI Commands:
- **`/setup`**: Initializes your profile based on PDFs or a chat interview.
- **`/scrape`**: Searches multiple portals and ranks opportunities based on your skills.
- **`/apply`**: Triggers the drafter-reviewer workflow to generate a highly tailored LaTeX CV and Cover Letter.
- **`/upskill`**: Analyzes the gap between your profile and target jobs, producing a learning roadmap.

---

## 🏗 Architecture Details

- **Frontend:** Next.js (App Router), React, Tailwind CSS v4, Framer Motion, Lucide-React.
- **Backend API:** Node.js, `fs/promises`, `child_process`.
- **Automation Layer:** Puppeteer (Headless Browser Auto-Apply).
- **Agentic Engine:** Python 3.10+, Bun (for scraper jobs), LaTeX compilation engine.

## 🤝 Contributing

Contributions are always welcome! Feel free to open a PR to add new job portal scrapers or enhance the Next.js UI dashboard.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. Copyright (c) Prince.
