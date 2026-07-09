"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Moon, Sun, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Navbar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logoutSession } = useAuth(false);

  useEffect(() => {
    // Sync initial state with document class
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/60 dark:bg-[#0B0F19]/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <span>VeriHire</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/scan-history" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Scan History
            </Link>
            <Link href="/saved-jobs" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Saved Jobs
            </Link>
            <Link href="/resume" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Resume Match
            </Link>
            <Link href="/interview-prep" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Interview Prep
            </Link>
            <Link href="/settings" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Settings
            </Link>

            <span className="w-px h-4 bg-slate-200 dark:bg-slate-800" />

            {/* Theme Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2 rounded-full">
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </Button>

            {user ? (
              <div className="flex items-center gap-2">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-6.5 h-6.5 rounded-full border border-slate-200 dark:border-slate-800/80 object-cover"
                  />
                ) : (
                  <div className="w-6.5 h-6.5 rounded-full bg-brand-violet/10 flex items-center justify-center border border-brand-violet/25">
                    <Shield className="w-3.5 h-3.5 text-brand-violet" />
                  </div>
                )}
                <span className="text-xs text-slate-500 font-medium ml-1">Hello, {user.name}</span>
                <Button variant="ghost" size="sm" onClick={logoutSession} className="text-rose-500 hover:bg-rose-500/10 ml-2">
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                
                <Link href="/register">
                  <Button variant="primary" size="sm" className="gap-1">
                    Get Started
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2 rounded-full">
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] px-4 py-4 space-y-3">
          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300">
            Dashboard
          </Link>
          <Link href="/scan-history" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300">
            Scan History
          </Link>
          <Link href="/saved-jobs" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300">
            Saved Jobs
          </Link>
          <Link href="/resume" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300">
            Resume Match
          </Link>
          <Link href="/interview-prep" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300">
            Interview Prep
          </Link>
          <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300">
            Settings
          </Link>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {user ? (
              <Button variant="outline" onClick={() => { setIsMobileMenuOpen(false); logoutSession(); }} className="w-full text-rose-500 hover:bg-rose-500/10 border-rose-500/20">
                Sign Out
              </Button>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="primary" className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
