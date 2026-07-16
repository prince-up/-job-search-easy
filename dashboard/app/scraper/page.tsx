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
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Scraper Control Center</h1>
        <p className="text-muted-foreground mt-2 text-foreground/70">
          Configure parameters and trigger the backend scraping engines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-6 border border-border/50"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Search className="w-5 h-5 mr-2 text-primary" /> Target Parameters
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Keywords</label>
              <input 
                type="text" 
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Location</label>
              <input 
                type="text" 
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Target Board</label>
              <select 
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
              >
                <option value="Freehire">Freehire Client</option>
                <option value="LinkedIn">LinkedIn Engine</option>
                <option value="Indeed">Indeed Engine</option>
              </select>
            </div>
            
            <button 
              onClick={handleRun}
              disabled={loading}
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-all shadow-[0_0_15px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-5 h-5 mr-2" />}
              {loading ? "Engine Running..." : "Fire Scraper Engine"}
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl border border-border/50 overflow-hidden flex flex-col"
        >
          <div className="bg-card/80 px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Execution Output</h3>
          </div>
          <div className="bg-black/50 p-6 font-mono text-sm text-green-400 h-full min-h-[300px] overflow-y-auto whitespace-pre-wrap">
            {logs || "Ready."}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
