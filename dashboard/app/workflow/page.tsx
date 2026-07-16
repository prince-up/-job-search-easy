"use client";

import { useState } from "react";
import { Settings, FileCheck, Send, BarChart2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkflowHub() {
  const [logs, setLogs] = useState<string>("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const runWorkflow = async (action: string) => {
    setLoadingAction(action);
    setLogs(`[INFO] Executing workflow: ${action}...\n`);
    try {
      const res = await fetch("/api/workflow", {
        method: "POST",
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      setLogs(prev => prev + data.logs + "\n");
    } catch (e: any) {
      setLogs(prev => prev + `[ERROR] ${e.message}\n`);
    } finally {
      setLoadingAction(null);
    }
  };

  const workflows = [
    { id: "apply", name: "Auto-Apply Engine", icon: Send, description: "Submit targeted applications based on the current candidate profile." },
    { id: "rank", name: "Job Match Ranking", icon: BarChart2, description: "Score and rank collected jobs against your skillset." },
    { id: "verify_pdf", name: "Verify CV / ATS Check", icon: FileCheck, description: "Run python tools/verify_pdf.py to ensure your compiled LaTeX CV is readable." },
  ];

  return (
    <div className="p-8 space-y-8 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Workflow Hub & Asset Vault</h1>
        <p className="text-muted-foreground mt-2 text-foreground/70">
          Execute internal workflow triggers and manage your compiled documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div className="space-y-6">
          {workflows.map((wf, idx) => (
            <motion.div 
              key={wf.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card rounded-xl p-6 border border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-lg shrink-0">
                  <wf.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{wf.name}</h3>
                  <p className="text-sm text-foreground/70 mt-1">{wf.description}</p>
                </div>
              </div>
              <button 
                onClick={() => runWorkflow(wf.id)}
                disabled={loadingAction !== null}
                className="shrink-0 bg-secondary text-secondary-foreground border border-border hover:bg-primary hover:text-primary-foreground font-medium py-2 px-4 rounded-lg flex items-center transition-all disabled:opacity-50"
              >
                {loadingAction === wf.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
                {loadingAction === wf.id ? "Running..." : "Execute"}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl border border-border/50 overflow-hidden flex flex-col h-full min-h-[400px]"
        >
          <div className="bg-card/80 px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Workflow Logs</h3>
          </div>
          <div className="bg-black/50 p-6 font-mono text-sm text-green-400 flex-1 overflow-y-auto whitespace-pre-wrap">
            {logs || "Standby..."}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
