"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles,
  AlertCircle,
  HelpCircle,
  Code,
  Building,
  UserCheck,
  Cpu,
  ChevronDown,
  ChevronUp
} from "lucide-react";

type Question = {
  question: string;
  suggestion: string;
};

type CodingQuestion = {
  question: string;
  problemDescription: string;
  solutionStub: string;
  suggestion: string;
};

type PrepGuide = {
  hrQuestions: Question[];
  technicalQuestions: Question[];
  companyQuestions: Question[];
  codingQuestions: CodingQuestion[];
};

export default function InterviewPrepPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PrepGuide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hr" | "tech" | "company" | "coding">("hr");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const { user, loading: authLoading, getAuthHeaders } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const title = params.get("title");
      const comp = params.get("company");
      if (title) setJobTitle(title);
      if (comp) setCompanyName(comp);
    }
  }, []);

  const handleGenerateGuide = async () => {
    if (!jobTitle.trim()) {
      setError("Please enter the target Job Title.");
      return;
    }
    if (!companyName.trim()) {
      setError("Please enter the Company Name.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setExpandedIndex(null);

    try {
      const response = await fetch("/api/analyze-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ jobTitle, companyName, jobDescription })
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "An error occurred during interview guide generation.");
      }
    } catch (err: any) {
      setLoading(false);
      setError("Failed to connect to the backend server.");
    }
  };

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  if (authLoading || !user) {
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
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-5xl mx-auto md:max-w-none">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI Interview Preparation</h1>
              <p className="text-sm text-slate-500">
                Generate tailored interview questions, coding challenges, and recommended answer strategies.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel text-xs text-slate-600 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-brand-violet" />
              <span>AI Coaching Enabled</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Inputs Column */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Interview Setup</h3>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. React Developer"
                      className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Vercel"
                      className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">Job Description (Optional)</label>
                    <textarea
                      rows={5}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the listing details to get ultra-tailored questions..."
                      className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet/50 resize-none font-sans"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={handleGenerateGuide}
                  isLoading={loading}
                  className="w-full justify-center"
                >
                  Generate Prep Guide
                </Button>
              </Card>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-2 space-y-6">
              {loading && (
                <Card className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[350px]">
                  <Loader size="lg" />
                  <p className="text-sm text-slate-500 mt-4">Generating target interview questions...</p>
                </Card>
              )}

              {!result && !loading && (
                <Card className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
                  <Cpu className="w-16 h-16 text-slate-300 dark:text-slate-700" />
                  <div className="space-y-1 mt-4">
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Ready for Interview Prep</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Fill in the job details on the left to load customized questions, suggestions, and solution templates.
                    </p>
                  </div>
                </Card>
              )}

              {result && !loading && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Category Tabs */}
                  <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
                    <button
                      onClick={() => { setActiveTab("hr"); setExpandedIndex(null); }}
                      className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                        activeTab === "hr"
                          ? "border-brand-violet text-slate-900 dark:text-white"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      HR & Culture
                    </button>
                    <button
                      onClick={() => { setActiveTab("tech"); setExpandedIndex(null); }}
                      className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                        activeTab === "tech"
                          ? "border-brand-violet text-slate-900 dark:text-white"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Technical
                    </button>
                    <button
                      onClick={() => { setActiveTab("company"); setExpandedIndex(null); }}
                      className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                        activeTab === "company"
                          ? "border-brand-violet text-slate-900 dark:text-white"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Company Specific
                    </button>
                    <button
                      onClick={() => { setActiveTab("coding"); setExpandedIndex(null); }}
                      className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                        activeTab === "coding"
                          ? "border-brand-violet text-slate-900 dark:text-white"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Coding
                    </button>
                  </div>

                  {/* Accordion List for non-coding */}
                  {activeTab !== "coding" && (
                    <div className="space-y-4">
                      {((activeTab === "hr" ? result.hrQuestions : activeTab === "tech" ? result.technicalQuestions : result.companyQuestions) || []).map((item, idx) => (
                        <Card key={idx} className="p-0 overflow-hidden">
                          <div
                            onClick={() => toggleExpand(idx)}
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <HelpCircle className="w-4.5 h-4.5 text-brand-violet shrink-0 mt-0.5" />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-normal">
                                {item.question}
                              </span>
                            </div>
                            {expandedIndex === idx ? (
                              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-4" />
                            )}
                          </div>

                          {expandedIndex === idx && (
                            <div className="bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-200 dark:border-slate-800 p-4 space-y-2 animate-in slide-in-from-top duration-250">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-violet">
                                AI Suggestion
                              </span>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {item.suggestion}
                              </p>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Coding tab with mock editor */}
                  {activeTab === "coding" && (
                    <div className="space-y-6">
                      {(result.codingQuestions || []).map((challenge, idx) => (
                        <div key={idx} className="space-y-4">
                          <Card className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Code className="w-4.5 h-4.5 text-brand-violet shrink-0" />
                              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{challenge.question}</h4>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                              {challenge.problemDescription}
                            </p>
                          </Card>

                          {/* Code Editor block */}
                          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="bg-slate-100 dark:bg-[#0B0F19] px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                              <span className="text-[10px] font-mono text-slate-500">solution.ts</span>
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">TypeScript</span>
                            </div>
                            <textarea
                              rows={8}
                              readOnly
                              value={challenge.solutionStub}
                              className="w-full bg-[#030712] text-slate-300 p-4 font-mono text-xs focus:outline-none resize-none"
                            />
                          </div>

                          <Card className="space-y-2 border-brand-violet/20 bg-brand-violet/5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-violet">Solution Approach Suggestion</span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {challenge.suggestion}
                            </p>
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
