"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, Pin, Lock, Globe, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function GettingStartedPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-slate-500 animate-pulse">Verifying secure session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar className="hidden md:flex" />
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-4xl mx-auto md:max-w-none">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Getting Started</h1>
            <p className="text-sm text-slate-500">Learn how to configure the VeriHire Chrome Extension overlay and connect your workspace.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Guide Steps Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Install */}
              <Card className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet font-bold text-sm">1</div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Install the Chrome Extension</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Download the VeriHire extension package. Since this is in local developer preview, you will load it as an unpacked directory in Chrome.
                </p>
                
                <div className="p-4 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Installation Instructions</h4>
                  <ul className="text-xs space-y-2 text-slate-500 leading-normal">
                    <li className="flex items-start gap-2">
                      <span className="text-brand-violet font-semibold">1.</span>
                      <span>Navigate to <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded select-all">chrome://extensions/</code> in your address bar.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-violet font-semibold">2.</span>
                      <span>Toggle the **Developer mode** switch at the top right of the extensions dashboard.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-violet font-semibold">3.</span>
                      <span>Click **Load unpacked** at the top left and select the built <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">extension/dist</code> folder.</span>
                    </li>
                  </ul>
                </div>
                <Button className="gap-2 text-xs">
                  <Download className="w-4 h-4" />
                  Download Extension ZIP
                </Button>
              </Card>

              {/* Step 2: Pin */}
              <Card className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet font-bold text-sm">2</div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Pin to browser toolbar</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Keep VeriHire visible to easily access ratings, match logs, and analysis controls during your job hunt.
                </p>
                <div className="flex items-start gap-3 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
                  <Pin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Click the puzzle-piece extensions icon next to your URL bar, locate **VeriHire AI - Job Validator**, and click the Pin icon.
                  </p>
                </div>
              </Card>

              {/* Step 3: Use */}
              <Card className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet font-bold text-sm">3</div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Authenticate and scan</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Open the extension popup in your browser while logged in here. The extension will automatically synchronize user credentials!
                </p>
                <div className="flex items-start gap-3 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Now, visit any LinkedIn Job detail page. You'll see a floating check bubble. Click it to view real-time safety scores, flags, and match diagnostics that log straight to your account feed!
                  </p>
                </div>
              </Card>
            </div>

            {/* Sidebar Overview details column */}
            <div className="space-y-6">
              {/* Scope details */}
              <Card className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-violet" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Supported Platforms</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">LinkedIn Jobs</span>
                    <Badge variant="success">Fully Supported</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Scrapes descriptions, recruiter listings, company badges, and applies AI credibility models.
                  </p>
                </div>
              </Card>

              {/* Privacy and lock credentials details */}
              <Card className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Privacy & Security</h4>
                </div>
                <ul className="text-[11px] space-y-2 text-slate-500 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500">•</span>
                    <span>No password scraping or cookie harvesting.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500">•</span>
                    <span>Data isolation limits audits specifically to your profile ID.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500">•</span>
                    <span>All communications are encrypted using standard SSL.</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
