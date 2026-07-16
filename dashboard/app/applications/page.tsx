"use client";

import { useEffect, useState } from "react";
import { Search, ExternalLink, Calendar, MapPin, Building2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  datePosted: string;
  status: string;
};

export default function ApplicationGrid() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    fetch('/api/applications')
      .then(res => res.json())
      .then(res => { if(res.success) setJobs(res.data) });
  }, []);

  const handleDeepScan = (job: Job) => {
    setSelectedJob(job);
    // Real implementation would also fetch detail scan from API
  };

  return (
    <div className="p-8 space-y-8 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tailored Application Grid</h1>
        <p className="text-muted-foreground mt-2 text-foreground/70">
          Real-time matrix of scraped and managed job applications.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded-md">
                  {job.status}
                </div>
                <button 
                  onClick={() => handleDeepScan(job)}
                  className="text-foreground/50 hover:text-primary transition-colors"
                  title="Deep Scan"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-foreground truncate" title={job.title}>{job.title}</h3>
              <div className="space-y-2 mt-4 text-sm text-foreground/70">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-primary/70" /> {job.company}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-primary/70" /> {job.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-primary/70" /> {job.datePosted}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedJob && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-card w-full max-w-2xl rounded-2xl border border-border/50 overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Deep Scan Results</h2>
                <button onClick={() => setSelectedJob(null)} className="text-foreground/50 hover:text-foreground">
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p><strong>Target:</strong> {selectedJob.title} at {selectedJob.company}</p>
                <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-green-400">
                  [INFO] Unpacking complete listings...<br/>
                  [INFO] ID: {selectedJob.id}<br/>
                  [SUCCESS] Parsing structural requirements...<br/>
                  [INFO] 85% Match with Candidate Profile.
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={() => setSelectedJob(null)} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
