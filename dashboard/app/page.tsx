"use client";

import { useEffect, useState } from "react";
import { Activity, Briefcase, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardHub() {
  const [metrics, setMetrics] = useState({
    totalScanned: 0,
    managedApplications: 0,
    gapsIdentified: 0,
    checkedPDFs: 0
  });

  useEffect(() => {
    fetch('/api/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error);
  }, []);

  const stats = [
    { name: 'Jobs Scanned', value: metrics.totalScanned, icon: Activity },
    { name: 'Managed Applications', value: metrics.managedApplications, icon: Briefcase },
    { name: 'Upskill Gaps', value: metrics.gapsIdentified, icon: FileText },
    { name: 'PDFs Checked', value: metrics.checkedPDFs, icon: CheckCircle2 },
  ];

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview Hub</h1>
        <p className="text-muted-foreground mt-2 text-foreground/70">
          High-level metrics and system status for your automated job search.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground/70">{stat.name}</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
              </div>
              <div className="p-3 bg-primary/20 rounded-lg">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-xl border border-border/50 overflow-hidden flex flex-col mt-8">
        <div className="bg-card/80 px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Live Process Logger</h3>
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
        <div className="bg-black/50 p-6 font-mono text-sm text-green-400 h-64 overflow-y-auto">
          <p>[14:45:01] INFO: Agentic Job Search Engine initialized.</p>
          <p>[14:45:03] SUCCESS: Connected to core configuration profiles.</p>
          <p className="animate-pulse">_ Waiting for commands...</p>
        </div>
      </div>
    </div>
  );
}
