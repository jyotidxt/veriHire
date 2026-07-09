"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Sparkles, CheckCircle2, ChevronRight, Play, Eye } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-violet/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      {/* Main hero */}
      <main className="relative z-10 pt-32 pb-20 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Introducing VeriHire Chrome Extension</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Navigate Your Job Search <br />
            <span className="bg-gradient-to-r from-emerald-400 to-indigo-500 bg-clip-text text-transparent">
              With Absolute Trust
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Verify LinkedIn job listings instantly. Get trust scores, company verification signals, and security insights to safeguard your application process.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Start Checking Jobs
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="glass" className="w-full sm:w-auto gap-2 border border-slate-300 dark:border-slate-800">
              <Play className="w-4 h-4 fill-current text-slate-600 dark:text-slate-300" />
              Watch Demo Video
            </Button>
          </div>
        </div>

        {/* Floating Mockup Component (Simulating Chrome extension widget overlaying LinkedIn details) */}
        <div className="mt-20 max-w-4xl mx-auto animate-fade-in-up">
          <Card className="border border-slate-200 dark:border-slate-800 p-0 overflow-hidden shadow-2xl relative">
            <div className="bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="text-xs text-slate-500 font-mono ml-4 truncate">
                https://www.linkedin.com/jobs/view/4092109481
              </div>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Job Details left (LinkedIn simulation) */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">Staff Backend Developer (Remote)</h3>
                  <p className="text-sm text-slate-500">Global Tech Solutions Inc. • New York, NY</p>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">About the Job</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    We are looking for an urgent hire. Candidate will receive $75/hr for completing remote script integrations. Note: You must register on our external site to qualify and purchase a home testing kit.
                  </p>
                </div>
              </div>

              {/* Injected VeriHire Overlay right */}
              <div className="glass-panel p-5 rounded-xl border border-amber-500/20 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">VeriHire Index</span>
                  </div>
                  <Badge variant="warning">Medium Risk</Badge>
                </div>

                <div className="text-center py-2">
                  <div className="text-4xl font-extrabold text-amber-500">62/100</div>
                  <span className="text-[10px] text-slate-500">Calculated Safety Score</span>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400">KEY INDICATORS</div>
                  <ul className="text-[11px] space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>Upfront startup purchase required.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>Verified corporate LinkedIn entity.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Features list */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hoverEffect className="space-y-4">
            <div className="w-10 h-10 rounded-lg bg-brand-violet/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-violet" />
            </div>
            <h3 className="text-lg font-bold">Multidimensional Evaluation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We look beyond keywords, evaluating corporate domain registries, hiring authority verification metrics, and post urgency factors.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold">Never Label as "Fake"</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We focus strictly on objective indicators, risk badges, and actionable guidance, preserving safety without liability.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold">Extension Overlay Injection</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Our lightweight Extension injects evaluations directly into your LinkedIn dashboard, seamlessly integrating with your normal routine.
            </p>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="mt-36 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">How VeriHire Works</h2>
            <p className="text-sm text-slate-500">
              Four simple, automated steps to ensure you never fall victim to recruitment scams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden space-y-4 border-slate-200 dark:border-slate-800">
              <span className="absolute top-2 right-4 text-4xl font-extrabold text-slate-200/50 dark:text-slate-800/40 select-none">01</span>
              <div className="w-9 h-9 rounded-lg bg-brand-violet/10 flex items-center justify-center">
                <span className="text-xs font-bold text-brand-violet">Add</span>
              </div>
              <h4 className="font-bold text-sm">1. Load Extension</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add our lightweight Chrome Extension to your browser in just one click.
              </p>
            </Card>

            <Card className="relative overflow-hidden space-y-4 border-slate-200 dark:border-slate-800">
              <span className="absolute top-2 right-4 text-4xl font-extrabold text-slate-200/50 dark:text-slate-800/40 select-none">02</span>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-500">View</span>
              </div>
              <h4 className="font-bold text-sm">2. Browse Listings</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Open any job post on LinkedIn. The VeriHire floating badge will appear in the corner automatically.
              </p>
            </Card>

            <Card className="relative overflow-hidden space-y-4 border-slate-200 dark:border-slate-800">
              <span className="absolute top-2 right-4 text-4xl font-extrabold text-slate-200/50 dark:text-slate-800/40 select-none">03</span>
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-500">Run</span>
              </div>
              <h4 className="font-bold text-sm">3. Audit Safety</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click the shield badge to parse salaries, domains, metadata, and cross-reference indicators.
              </p>
            </Card>

            <Card className="relative overflow-hidden space-y-4 border-slate-200 dark:border-slate-800">
              <span className="absolute top-2 right-4 text-4xl font-extrabold text-slate-200/50 dark:text-slate-800/40 select-none">04</span>
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <span className="text-xs font-bold text-cyan-500">Go</span>
              </div>
              <h4 className="font-bold text-sm">4. Match & Prepare</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Analyze your resume alignment and generate AI-driven technical and HR coaching interview guides.
              </p>
            </Card>
          </div>
        </div>

        {/* About VeriHire Section */}
        <div className="mt-36 glass-panel rounded-2xl border border-slate-200 dark:border-slate-800/80 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-violet/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Col */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-violet">Our Core Mission</span>
              <h2 className="text-3xl font-extrabold tracking-tight">Securing the Future of Remote Work</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                As the remote job landscape has grown, so has the complexity of recruitment fraud. Job seekers are frequently targeted by identity theft scams, phishing setups, and advance fee check fraud masquerading as verified corporate hires.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                VeriHire was created to bridge this transparency gap. We believe candidates deserve deep, objective visibility into job listings before sharing sensitive CV identifiers, tax forms, or interview schedules.
              </p>
            </div>

            {/* Right Col */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Transparency First</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  We collect details on recruiter domains and communication patterns to establish trust thresholds.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Liability Shield</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Our calculations outline indicators without legal assertions, preventing platform liabilities.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Zero Interruption</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Injected browser cards overlay LinkedIn pages directly without disrupting application tabs.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Privacy by Design</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Your uploaded resumes and search history are sandboxed, encrypted, and isolated to your profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-[#0B0F19]/40 backdrop-blur-md transition-colors py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-200 dark:border-slate-800/60">
            {/* Brand Logo & Info */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                  <Shield className="w-4 h-4 text-emerald-500" />
                </div>
                <span>VeriHire</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Empowering job seekers with AI-driven safety audits. Navigate your job hunt securely on LinkedIn and beyond.
              </p>
            </div>

            {/* Col 1: Platform */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <Link href="/dashboard" className="hover:text-slate-800 dark:hover:text-white transition-colors">
                    Dashboard Overview
                  </Link>
                </li>
                <li>
                  <Link href="/resume" className="hover:text-slate-800 dark:hover:text-white transition-colors">
                    Resume Matcher
                  </Link>
                </li>
                <li>
                  <Link href="/interview-prep" className="hover:text-slate-800 dark:hover:text-white transition-colors">
                    Interview Coach
                  </Link>
                </li>
                <li>
                  <Link href="/saved-jobs" className="hover:text-slate-800 dark:hover:text-white transition-colors">
                    Application Tracker
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 2: Chrome Extension */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Chrome Extension</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <a href="#" className="hover:text-slate-800 dark:hover:text-white transition-colors">
                    Install Extension
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-800 dark:hover:text-white transition-colors">
                    Chrome Web Store
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-800 dark:hover:text-white transition-colors">
                    How it Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Legal & Security */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security & Legal</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <a href="#" className="hover:text-slate-800 dark:hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-800 dark:hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-800 dark:hover:text-white transition-colors">
                    Liability Disclaimer
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm md:text-base font-semibold text-slate-600 dark:text-slate-400">
            <span>&copy; 2026 VeriHire. All rights reserved.</span>
            <div className="flex items-center gap-1 text-slate-800 dark:text-white">
              <span>Made with ❤️ by Jyoti Dixit</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
