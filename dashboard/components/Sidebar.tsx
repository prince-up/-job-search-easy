"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, ListTodo, UserCircle, Settings, Briefcase, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navigation = [
  { name: "Overview Hub", href: "/", icon: LayoutDashboard },
  { name: "Scraper Control", href: "/scraper", icon: Search },
  { name: "Application Grid", href: "/applications", icon: ListTodo },
  { name: "Profile Studio", href: "/profile", icon: UserCircle },
  { name: "Workflow Hub", href: "/workflow", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-[calc(100vh-48px)] my-6 ml-6 w-64 flex-col rounded-[32px] glass-card overflow-hidden z-20 transition-all">
      <div className="flex h-20 shrink-0 items-center px-6 border-b border-border/20">
        <div className="bg-primary text-white p-2.5 rounded-2xl mr-3 shadow-md shadow-primary/20">
          <Briefcase className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight">Autolycus</span>
          <span className="text-[10px] uppercase tracking-widest text-foreground/50 font-semibold flex items-center gap-1"><Zap className="w-3 h-3 text-accent"/> Autonomous</span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-y-2 overflow-y-auto px-3 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-x-3 rounded-[16px] px-3 py-2.5 text-sm font-semibold transition-all duration-300",
                isActive
                  ? "text-primary bg-primary/10 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                  : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-105",
                  isActive ? "text-primary" : "text-foreground/50 group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-white/5">
        <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mb-2 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
          <span className="text-xs text-foreground/50 font-medium">Agents Online</span>
        </div>
      </div>
    </div>
  );
}
