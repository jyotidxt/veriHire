"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Trash2 } from "lucide-react";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([
    { id: "1", title: "React Developer", company: "Meta Platforms", score: 98, risk: "LOW", location: "Menlo Park, CA (Hybrid)" },
    { id: "2", title: "Cloud Security Engineer", company: "Vercel Inc.", score: 95, risk: "LOW", location: "Remote, US" },
    { id: "3", title: "Technical Writer", company: "Stripe", score: 91, risk: "LOW", location: "Seattle, WA" },
  ]);

  const handleDelete = (id: string) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar className="hidden md:flex" />
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-5xl mx-auto md:max-w-none">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Saved Jobs</h1>
            <p className="text-sm text-slate-500">Manage and follow up on listings marked as verified and safe to apply.</p>
          </div>

          {jobs.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <Star className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <div className="space-y-1">
                <h3 className="text-base font-bold">No saved jobs found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Click the bookmark icon inside your Chrome extension sidebar to track jobs here.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Card key={job.id} hoverEffect className="flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{job.title}</h4>
                        <p className="text-xs text-slate-500 font-semibold">{job.company}</p>
                      </div>
                      <Badge variant={job.risk === "LOW" ? "success" : job.risk === "MEDIUM" ? "warning" : "error"}>
                        {job.risk}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>📍</span>
                      <span className="truncate">{job.location}</span>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200 dark:bg-slate-800" />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-mono font-bold text-emerald-500">{job.score}/100</div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Trust Score</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg" onClick={() => handleDelete(job.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="p-2 gap-1.5 rounded-lg">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
