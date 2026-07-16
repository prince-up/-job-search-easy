"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, ListTodo, UserCircle, Settings, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card/50 glass-card">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/50">
        <Briefcase className="h-6 w-6 text-primary mr-3" />
        <span className="text-lg font-bold text-foreground tracking-tight">AI Job Search</span>
      </div>
      <nav className="flex flex-1 flex-col gap-y-2 overflow-y-auto px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:text-foreground hover:bg-card/80"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-primary" : "text-foreground/50 group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
