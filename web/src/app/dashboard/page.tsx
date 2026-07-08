"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Sparkles, TrendingUp, AlertTriangle, ArrowUpRight } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  const recentScans = [
    { id: "1", title: "Remote QA Analyst", company: "Secure-Logistics Ltd.", score: 32, risk: "HIGH", date: "July 7, 2026" },
    { id: "2", title: "Junior Frontend Dev", company: "Novus Web Agency", score: 94, risk: "LOW", date: "July 6, 2026" },
    { id: "3", title: "Data Entry Operator", company: "Global Apex Outsourcing", score: 55, risk: "MEDIUM", date: "July 5, 2026" },
  ];

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
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-5xl mx-auto md:max-w-none">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
              <p className="text-sm text-slate-500">Welcome back, {user.name}! Monitor your scans and safe applying metrics.</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel text-xs text-slate-600 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-brand-violet" />
              <span>You have 15 scans left this month</span>
            </div>
          </div>

          {/* Stats grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Evaluated</span>
                <Shield className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-extrabold">142</h3>
                <p className="text-[10px] text-slate-400 mt-1">Across linked in job listings</p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Trust</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-extrabold text-emerald-500">81%</h3>
                <p className="text-[10px] text-slate-400 mt-1">Solid safety average rating</p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alerts Flagged</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-extrabold text-amber-500">12</h3>
                <p className="text-[10px] text-slate-400 mt-1">Medium/High risks detected</p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved Jobs</span>
                <span className="text-xs font-bold text-brand-violet">★</span>
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-extrabold">14</h3>
                <p className="text-[10px] text-slate-400 mt-1">Flagged to apply later</p>
              </div>
            </Card>
          </div>

          {/* Table feed */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recent Job Evaluations</h2>
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/40 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Job details</th>
                      <th className="p-4 text-center">Safety Score</th>
                      <th className="p-4">Risk Badge</th>
                      <th className="p-4">Evaluated Date</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                    {recentScans.map((scan) => (
                      <tr key={scan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{scan.title}</div>
                          <div className="text-xs text-slate-500">{scan.company}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`font-mono font-bold ${
                            scan.score >= 80 ? "text-emerald-500" : scan.score >= 50 ? "text-amber-500" : "text-rose-500"
                          }`}>
                            {scan.score}/100
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant={scan.risk === "LOW" ? "success" : scan.risk === "MEDIUM" ? "warning" : "error"}>
                            {scan.risk}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-500 text-xs">{scan.date}</td>
                        <td className="p-4 text-right">
                          <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200">
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
