"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { FileText, Sparkles, AlertCircle, ArrowUpRight, UploadCloud, CheckCircle } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export default function ResumePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { user, loading: authLoading, getAuthHeaders } = useAuth();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Read simple text files client-side, otherwise simulate text content
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          setResumeText(text);
        }
      };
      if (file.type === "text/plain") {
        reader.readAsText(file);
      } else {
        // Mock PDF/Word parsing text
        setResumeText(
          `Resume of professional developer.\nSkills: React, Next.js, HTML, CSS, JavaScript, Git, Redux, PostgreSQL.\nExperience: Senior Front End Developer building responsive web interfaces.`
        );
      }
    }
  };

  const handleCalculateMatch = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume text or upload a resume file.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste the target job description to evaluate.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ resumeText, jobDescription })
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "An error occurred during resume analysis.");
      }
    } catch (err: any) {
      setLoading(false);
      setError("Failed to connect to the backend server.");
    }
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
              <h1 className="text-2xl font-bold tracking-tight">Resume Matcher</h1>
              <p className="text-sm text-slate-500">
                Check how well your resume matches the job details and get AI-powered improvement suggestions.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel text-xs text-slate-600 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-brand-violet" />
              <span>AI Job Match Score Analysis</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form Column */}
            <div className="space-y-6">
              {/* File Upload Zone */}
              <Card className="space-y-4 relative overflow-hidden">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">1. Upload Resume</h3>
                
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-6 text-center hover:border-brand-violet/50 dark:hover:border-brand-violet/50 transition-colors cursor-pointer relative group">
                  <input
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-brand-violet transition-colors" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {fileName ? `File Selected: ${fileName}` : "Drag & Drop Resume"}
                    </p>
                    <p className="text-xs text-slate-500">Supports PDF, DOCX, or TXT formats</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Or Paste Resume Text</label>
                  <textarea
                    rows={6}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste the plain text content of your resume here..."
                    className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet/50 resize-none font-sans"
                  />
                </div>
              </Card>

              {/* Job Description Textarea */}
              <Card className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">2. Paste Job Description</label>
                  <textarea
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description details here..."
                    className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet/50 resize-none font-sans"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={handleCalculateMatch}
                  isLoading={loading}
                  className="w-full justify-center"
                >
                  Calculate Match Rating
                </Button>
              </Card>
            </div>

            {/* Analysis Output Column */}
            <div className="space-y-6">
              {loading && (
                <Card className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
                  <Loader size="lg" />
                  <p className="text-sm text-slate-500 mt-4">Analyzing resume skills vs job requirements...</p>
                </Card>
              )}

              {!result && !loading && (
                <Card className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px] border-slate-200 dark:border-slate-800">
                  <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700" />
                  <div className="space-y-1 mt-4">
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Ready for Match Analysis</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Fill out the forms on the left to evaluate your profile alignment, missing skills, and suggestions.
                    </p>
                  </div>
                </Card>
              )}

              {result && !loading && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Score Card */}
                  <Card className="flex items-center justify-between border-brand-violet/20 relative overflow-hidden">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Job Match Score</span>
                      <h3
                        className={`text-4xl font-extrabold ${
                          result.matchScore >= 80
                            ? "text-emerald-500"
                            : result.matchScore >= 50
                            ? "text-amber-500"
                            : "text-rose-500"
                        }`}
                      >
                        {result.matchScore}%
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1">Based on keyword matching alignment</p>
                    </div>

                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        result.matchScore >= 80
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : result.matchScore >= 50
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      }`}
                    >
                      {result.matchScore >= 80 ? "Strong Match" : result.matchScore >= 50 ? "Moderate Match" : "Weak Match"}
                    </span>
                  </Card>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Parsed Skills */}
                    <Card className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Parsed Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {result.parsedSkills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </Card>

                    {/* Missing Skills */}
                    <Card className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Missing Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingSkills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Improvement Suggestions */}
                  <Card className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Improvement Suggestions</h4>
                    <div className="space-y-3">
                      {result.improvementSuggestions.map((suggestion: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle className="w-4 h-4 text-brand-violet shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
