"use client";

import { useEffect, useState } from "react";
import { Search, ExternalLink, Calendar, MapPin, Building2, Eye, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  datePosted: string;
  status: string;
  matchScore?: number;
  url?: string;
};

export default function ApplicationGrid() {
  const [activeTab, setActiveTab] = useState<"tracked" | "pipeline">("tracked");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scrapedJobs, setScrapedJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isBatchApplying, setIsBatchApplying] = useState(false);
  const [batchLogs, setBatchLogs] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/applications')
      .then(res => res.json())
      .then(res => { if(res.success) setJobs(res.data) });
      
    fetch('/api/scraped-jobs')
      .then(res => res.json())
      .then(res => { if(res.success) setScrapedJobs(res.data) });
  }, []);

  const handleDeepScan = (job: Job) => {
    setSelectedJob(job);
  };

  const runBatchRank = async () => {
    try {
      const res = await fetch('/api/batch-rank', { method: 'POST' });
      const data = await res.json();
      if(data.success) {
        // Refresh scraped jobs
        const refresh = await fetch('/api/scraped-jobs').then(r => r.json());
        if(refresh.success) setScrapedJobs(refresh.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const runBatchApply = async () => {
    setIsBatchApplying(true);
    setBatchLogs(["[SYSTEM] Initiating Batch Autonomous Application Workflow..."]);
    
    // Filter jobs with high match score
    const targetJobs = scrapedJobs.filter(j => (j.matchScore || 0) > 80);
    
    if (targetJobs.length === 0) {
      setBatchLogs(prev => [...prev, "[WARNING] No jobs found with Match Score > 80. Aborting."]);
      setTimeout(() => setIsBatchApplying(false), 3000);
      return;
    }

    setBatchLogs(prev => [...prev, `[INFO] Identified ${targetJobs.length} high-match targets.`]);

    for (let i = 0; i < targetJobs.length; i++) {
      const job = targetJobs[i];
      setBatchLogs(prev => [...prev, `\n[TARGET ${i+1}/${targetJobs.length}] Launching Puppeteer for ${job.company}...`]);
      
      try {
        const res = await fetch('/api/auto-apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: job.id, application_url: job.url })
        });
        const data = await res.json();
        
        if (data.logs) {
          setBatchLogs(prev => [...prev, ...data.logs]);
        }
      } catch (err: any) {
        setBatchLogs(prev => [...prev, `[ERROR] Failed to apply to ${job.company}: ${err.message}`]);
      }
    }

    setBatchLogs(prev => [...prev, `\n[SUCCESS] Batch Application Workflow Completed!`]);
    setTimeout(() => setIsBatchApplying(false), 5000);
  };

  const renderGrid = (items: Job[], type: "tracked" | "pipeline") => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-foreground/50">
          <Search className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No {type === "tracked" ? "tracked" : "scraped"} applications yet.</p>
          <p className="text-sm mt-1">Run the Scraper Engine to populate this grid.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((job, idx) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card glass-card-hover rounded-2xl p-6 relative group"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <div className="bg-foreground/5 border border-foreground/10 text-foreground/80 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    {job.status || "Scraped"}
                  </div>
                  {job.matchScore !== undefined && (
                    <div className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${job.matchScore > 80 ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-orange-500/10 text-orange-600 border border-orange-500/20'}`}>
                      {job.matchScore}% Match
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => handleDeepScan(job)}
                  className="text-foreground/40 hover:text-primary transition-colors bg-foreground/5 p-1.5 rounded-full hover:bg-foreground/10"
                  title="Deep Scan"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-foreground truncate mb-1" title={job.title}>{job.title}</h3>
              <div className="space-y-2 mt-4 text-sm text-foreground/60 font-medium">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-foreground/40" /> {job.company}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-foreground/40" /> {job.location || "Remote"}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-foreground/40" /> {job.datePosted || new Date().toISOString().split('T')[0]}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6 h-full flex flex-col relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-1">Application Grid</h1>
          <p className="text-foreground/60 text-lg">
            Manage your autonomous pipeline from discovery to submission.
          </p>
        </div>
        
        <div className="flex bg-card p-1.5 rounded-[20px] shadow-sm border border-border">
          <button 
            onClick={() => setActiveTab("tracked")}
            className={`px-6 py-2.5 rounded-2xl font-semibold transition-all ${activeTab === "tracked" ? "bg-white dark:bg-[#1c1c1e] text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.1)]" : "text-foreground/60 hover:text-foreground"}`}
          >
            Tracked
          </button>
          <button 
            onClick={() => setActiveTab("pipeline")}
            className={`px-6 py-2.5 rounded-2xl font-semibold transition-all flex items-center gap-2 ${activeTab === "pipeline" ? "bg-white dark:bg-[#1c1c1e] text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.1)]" : "text-foreground/60 hover:text-foreground"}`}
          >
            Pipeline Queue <span className="bg-foreground/10 text-foreground text-xs px-2 py-0.5 rounded-full font-bold">{scrapedJobs.length}</span>
          </button>
        </div>
      </div>

      {activeTab === "pipeline" && scrapedJobs.length > 0 && (
        <div className="flex justify-end gap-4 border-b border-border/40 pb-6">
           <button 
             onClick={runBatchRank}
             className="px-5 py-2.5 bg-white/5 border border-white/10 text-foreground rounded-xl font-semibold hover:bg-white/10 hover:border-white/20 transition-all"
           >
             1. Evaluate & Rank Fits
           </button>
           <button 
             onClick={runBatchApply}
             className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
           >
             <Zap className="w-5 h-5 fill-current" /> 2. Auto-Apply to Best Matches
           </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        {activeTab === "tracked" ? renderGrid(jobs, "tracked") : renderGrid(scrapedJobs, "pipeline")}
      </div>

      <AnimatePresence>
        {isBatchApplying && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }} 
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/60"
          >
             <div className="w-full max-w-4xl bg-[#0d0d0d] rounded-2xl overflow-hidden border border-[#333] shadow-[0_0_100px_rgba(139,92,246,0.15)] flex flex-col h-[600px]">
               {/* Terminal Header */}
               <div className="bg-[#1a1a1a] px-4 py-3 border-b border-[#333] flex items-center justify-between">
                 <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                   <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                   <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                 </div>
                 <div className="text-[#888] text-xs font-mono font-medium tracking-widest flex items-center gap-2">
                   <Zap className="w-3 h-3 text-primary animate-pulse" /> AUTOLYCUS KERNEL
                 </div>
                 <div className="w-10" />
               </div>
               
               {/* Terminal Body */}
               <div className="flex-1 p-6 font-mono text-[13px] leading-relaxed overflow-y-auto bg-[#0d0d0d] text-[#a1a1aa] shadow-inner">
                 {batchLogs.map((log, i) => (
                   <motion.div 
                     initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
                     key={i} 
                     className={log.includes("ERROR") ? "text-[#ef4444]" : log.includes("SUCCESS") ? "text-[#22c55e] font-semibold" : log.includes("TARGET") ? "text-[#06b6d4] mt-6 font-bold" : log.includes("SYSTEM") ? "text-primary font-bold mb-4" : ""}
                   >
                     {log.includes("[") ? 
                       <><span className="text-[#666] mr-2">{new Date().toISOString().split('T')[1].slice(0,-1)}</span>{log}</> 
                       : log}
                   </motion.div>
                 ))}
                 <div className="mt-4 flex items-center text-[#22c55e]">
                   <span className="mr-2">❯</span>
                   <span className="w-2 h-4 bg-[#22c55e] animate-pulse" />
                 </div>
               </div>
             </div>
          </motion.div>
        )}

        {selectedJob && !isBatchApplying && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-2xl font-bold text-white">Target Analysis</h2>
                <button onClick={() => setSelectedJob(null)} className="text-foreground/50 hover:text-white bg-black/20 p-2 rounded-full transition-colors">✕</button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedJob.title}</h3>
                  <p className="text-primary font-medium">{selectedJob.company}</p>
                </div>
                {selectedJob.url && (
                  <p className="text-sm"><strong>Source URL:</strong> <a href={selectedJob.url} target="_blank" rel="noreferrer" className="text-accent hover:underline break-all">{selectedJob.url}</a></p>
                )}
                <div className="bg-[#0d0d0d] p-5 rounded-xl font-mono text-sm border border-[#333] shadow-inner text-[#a1a1aa]">
                  <span className="text-[#22c55e]">[INFO]</span> GUID: {selectedJob.id}<br/>
                  {selectedJob.matchScore ? <><span className="text-primary">[SCORING]</span> Calculated Match Density: <span className="text-white font-bold">{selectedJob.matchScore}%</span><br/></> : ""}
                  <span className="text-[#06b6d4]">[STATUS]</span> Awaiting execution directive...
                </div>
                <div className="flex justify-end pt-2 gap-4">
                  <button onClick={() => setSelectedJob(null)} className="px-6 py-2.5 border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-colors">Dismiss</button>
                  {selectedJob.url && (
                    <button onClick={async () => {
                      setSelectedJob(null);
                      setIsBatchApplying(true);
                      setBatchLogs(["[SYSTEM] Engaging Single Auto-Apply Routine..."]);
                      const res = await fetch('/api/auto-apply', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ job_id: selectedJob.id, application_url: selectedJob.url })
                      });
                      const data = await res.json();
                      if (data.logs) setBatchLogs(prev => [...prev, ...data.logs]);
                      setTimeout(() => setIsBatchApplying(false), 4000);
                    }} className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] flex items-center gap-2 transition-all transform hover:-translate-y-0.5">
                      <Zap className="w-4 h-4 fill-current" /> Engage Auto-Apply
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
