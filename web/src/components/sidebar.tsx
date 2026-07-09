"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, History, Bookmark, Settings, CreditCard, Sparkles, FileText, BrainCircuit } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();
  const { user } = useAuth(false);

  const links = [
    { name: "Overview", href: "/dashboard", icon: LayoutGrid },
    { name: "Getting Started", href: "/getting-started", icon: Sparkles },
    { name: "Scan History", href: "/scan-history", icon: History },
    { name: "Saved Jobs", href: "/saved-jobs", icon: Bookmark },
    { name: "Resume Match", href: "/resume", icon: FileText },
    { name: "Interview Prep", href: "/interview-prep", icon: BrainCircuit },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className={clsx("w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-4rem)] sticky top-16 bg-slate-50/50 dark:bg-[#0B0F19]/20", className)}>
      <div className="flex-1 py-6 px-4 space-y-7">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-3 mb-2">
            WORKSPACE
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                  {
                    "bg-brand-violet/10 text-brand-violet dark:text-violet-400 border-l-2 border-brand-violet rounded-l-none": isActive,
                    "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/40": !isActive,
                  }
                )}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Upgrade card (glassmorphic promo) */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-brand-violet/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center gap-2 text-brand-violet dark:text-violet-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Go Premium</span>
          </div>
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Unlock Unlimited Scans
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mb-3">
            Analyze job boards directly, monitor domain timelines & get expert security metrics.
          </p>
          <Link href="/settings">
            <button className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-xs font-medium py-1.5 rounded-lg transition-colors">
              Upgrade
            </button>
          </Link>
        </div>
      </div>

      {/* User Metadata / Plan Indicator footer */}
      {user && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-violet/10 flex items-center justify-center border border-brand-violet/25 text-xs font-bold text-brand-violet">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
              {user.name}
            </p>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">
                PRO PLAN
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
