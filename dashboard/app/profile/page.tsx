"use client";

import { useEffect, useState } from "react";
import { Save, UserCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfileStudio() {
  const [profile, setProfile] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProfile(data.content);
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: "POST",
        body: JSON.stringify({ content: profile })
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Candidate Profile Studio</h1>
          <p className="text-muted-foreground mt-2 text-foreground/70">
            Edit and update your structural markdown profiles.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-6 rounded-lg flex items-center transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl border border-border/50 flex-1 flex flex-col overflow-hidden"
      >
        <div className="bg-card/80 px-6 py-4 border-b border-border/50 flex items-center">
          <UserCircle className="w-5 h-5 text-primary mr-2" />
          <h3 className="font-semibold text-foreground">01-candidate-profile.md</h3>
        </div>
        <div className="flex-1 p-0 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <textarea
              className="w-full h-full bg-transparent text-foreground p-6 font-mono text-sm focus:outline-none resize-none"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              spellCheck="false"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
