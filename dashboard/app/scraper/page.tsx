"use client";

import { useState } from "react";
import { Search, Play, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ScraperControl() {
  const [keywords, setKeywords] = useState("Software Engineer");
  const [location, setLocation] = useState("Remote");
  const [board, setBoard] = useState("Freehire");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string>("");

  const handleRun = async () => {
    setLoading(true);
    setLogs("[INFO] Starting Engine...\n");
    
    try {
      const res = await fetch("/api/scraper", {
        method: "POST",
        body: JSON.stringify({ keywords, location, board })
      });
      const data = await res.json();
      setLogs((prev) => prev + data.logs + "\n");
    } catch (e: any) {
      setLogs((prev) => prev + `[ERROR] ${e.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 space-y-8 h-full overflow-y-auto">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">Scraper Control Center</h1>
        <p className="text-foreground/60 text-lg">
          Configure parameters and trigger the backend scraping engines.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-[24px] p-8"
        >
          <h2 className="text-xl font-bold mb-8 flex items-center text-foreground">
            <Search className="w-5 h-5 mr-3 text-primary" /> Target Parameters
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground/70 mb-2 uppercase tracking-wider">Keywords</label>
              <input 
                type="text" 
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-foreground/30 shadow-sm"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. Software Engineer"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {["AI ML", "Agentic AI", "Full Stack Developer", "Backend Developer", "Frontend Developer"].map(kw => (
                  <button
                    key={kw}
                    onClick={() => setKeywords(kw)}
                    className="text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 hover:bg-primary/20 transition-all"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground/70 mb-2 uppercase tracking-wider">Location / Work Mode</label>
              <input 
                type="text" 
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-foreground/30 shadow-sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, India"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {["India", "Remote", "Onsite", "United States", "Europe"].map(loc => (
                  <button
                    key={loc}
                    onClick={() => setLocation(loc)}
                    className="text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 hover:bg-primary/20 transition-all"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground/70 mb-2 uppercase tracking-wider">Target Board</label>
              <select 
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm appearance-none"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
              >
                <option value="Freehire Engine">Freehire Engine</option>
                <option value="LinkedIn Engine">LinkedIn Engine</option>
                <option value="Indeed Engine">Indeed Engine</option>
              </select>
            </div>
            
            <button 
              onClick={handleRun}
              disabled={loading}
              className="w-full mt-8 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-all shadow-[0_4px_14px_0_rgb(0,118,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] hover:bg-[rgba(0,118,255,0.9)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-5 h-5 mr-2 fill-current" />}
              {loading ? "Engine Running..." : "Fire Scraper Engine"}
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-2xl overflow-hidden flex flex-col h-[600px] border border-white/10 shadow-2xl"
        >
          {/* Terminal Header */}
          <div className="bg-[#1a1a1a] px-4 py-3 border-b border-[#333] flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="text-[#888] text-xs font-mono font-medium tracking-widest flex items-center gap-2">
               SCRAPER KERNEL
            </div>
            <div className="w-10" />
          </div>
          <div className="bg-[#0d0d0d] p-6 font-mono text-[13px] leading-relaxed text-[#a1a1aa] flex-1 overflow-y-auto whitespace-pre-wrap shadow-inner">
            {logs || "Ready.\nWaiting for extraction target..."}
            {loading && <span className="animate-pulse">_</span>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
