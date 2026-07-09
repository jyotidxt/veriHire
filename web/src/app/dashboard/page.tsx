"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Sparkles, TrendingUp, AlertTriangle, ArrowUpRight, Cpu, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, loading, getAuthHeaders } = useAuth();
  
  const [stats, setStats] = useState({
    totalEvaluated: 0,
    averageTrust: 0,
    alertsFlagged: 0,
    savedJobs: 0,
    recentScans: [] as any[]
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchDashboardStats = async () => {
        try {
          const response = await fetch("/api/dashboard-stats", {
            headers: getAuthHeaders()
          });
          if (response.ok) {
            const data = await response.json();
            setStats(data);
          }
        } catch (err) {
          console.error("Failed to load dashboard stats:", err);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchDashboardStats();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-slate-500 animate-pulse">Verifying secure session...</div>
      </div>
    );
  }

  // Calculate actual chart coordinate points dynamically based on real scan history
  const chartPoints = [...stats.recentScans].reverse().map((scan, idx) => {
    const totalPoints = stats.recentScans.length;
    // Distribute X evenly across graph width viewBox (from X=50 to X=550)
    const x = totalPoints > 1 
      ? Math.round((idx / (totalPoints - 1)) * 500) + 50 
      : 300;
    // Map score (0 to 100) to Y axis (Y=20 for score=100, Y=130 for score=0)
    const y = Math.round(130 - (scan.score * 1.1));
    return { x, y, score: scan.score, date: scan.date };
  });

  const pathD = chartPoints.length > 0
    ? chartPoints.map((pt, idx) => `${idx === 0 ? "M" : "L"}${pt.x},${pt.y}`).join(" ")
    : "";

  const areaD = chartPoints.length > 0
    ? `${pathD} L${chartPoints[chartPoints.length - 1].x},135 L${chartPoints[0].x},135 Z`
    : "";

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
              <span>Real-Time Audit Active</span>
            </div>
          </div>

          {/* Onboarding Checklist Stepper for First-Time Users */}
          {stats.totalEvaluated === 0 && !statsLoading && (
            <Card className="p-6 border border-brand-violet/20 bg-brand-violet/[0.01] relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-violet/10 rounded-full blur-3xl pointer-events-none" />
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Welcome to VeriHire! Let's get you set up</h3>
                <p className="text-xs text-slate-500 mt-1">Complete this 5-step checklist to configure the browser validator and start tracking verified applications.</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-brand-violet">Onboarding Progress</span>
                  <span>20% Completed</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-violet w-[20%] transition-all" />
                </div>
              </div>

              {/* Checklist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5 text-[10px] font-bold">✓</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">1. Create Account</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Your VeriHire SaaS workspace profile is active.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-brand-violet/10 border border-brand-violet/30 flex items-center justify-center text-brand-violet shrink-0 mt-0.5 text-[10px] font-bold">→</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">2. Install Chrome Extension</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Load our AI validator unpacked package directly into Chrome.</p>
                    <a href="/getting-started" className="inline-block mt-2">
                      <button className="bg-brand-violet text-white hover:bg-brand-violet/90 text-[9px] font-semibold px-2.5 py-1 rounded">
                        Install Extension
                      </button>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0 mt-0.5 text-xs font-bold">3</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400">3. Pin the Extension</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Pin the VeriHire AI validator badge to your Chrome browser toolbar.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0 mt-0.5 text-xs font-bold">4</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400">4. Login inside Toolbar</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Open the extension popup in your browser toolbar while logged in here to auto-sync.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 md:col-span-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0 mt-0.5 text-xs font-bold">5</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400">5. Visit LinkedIn & Analyze First Job</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Browse jobs on LinkedIn and click our floating check bubble. Your evaluations will auto-sync!</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Stats grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Evaluated</span>
                <Shield className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-extrabold">
                  {statsLoading ? "..." : stats.totalEvaluated}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Across job listings</p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Trust</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-extrabold text-emerald-500">
                  {statsLoading ? "..." : `${stats.averageTrust}%`}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Safety credibility average</p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alerts Flagged</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-extrabold text-amber-500">
                  {statsLoading ? "..." : stats.alertsFlagged}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Medium/High risk alerts</p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved Jobs</span>
                <span className="text-xs font-bold text-brand-violet">★</span>
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-extrabold">
                  {statsLoading ? "..." : stats.savedJobs}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Jobs inside tracker</p>
              </div>
            </Card>
          </div>

          {/* SVG Analytics Chart Card */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Scan Activity & Trust Indices</h3>
                <p className="text-xs text-slate-500 mt-0.5">Average credibility metrics plotted over active scanning timelines.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-500">Credibility Index</span>
                </div>
              </div>
            </div>

            <div className="w-full h-48 relative pt-2">
              {stats.totalEvaluated === 0 && !statsLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <Cpu className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                  <h4 className="text-xs font-bold mt-2 text-slate-400 uppercase">No Activity Registered</h4>
                  <p className="text-[10px] text-slate-500 max-w-xs mt-1">
                    Your scans timeline chart will dynamically plot here once you run evaluations via the extension overlay.
                  </p>
                </div>
              ) : (
                <svg viewBox="0 0 600 150" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="600" y2="30" stroke="currentColor" className="text-slate-200 dark:text-slate-800/60" strokeDasharray="4 4" />
                  <line x1="0" y1="75" x2="600" y2="75" stroke="currentColor" className="text-slate-200 dark:text-slate-800/60" strokeDasharray="4 4" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="currentColor" className="text-slate-200 dark:text-slate-800/60" strokeDasharray="4 4" />

                  {/* Gradient Area Fill */}
                  {areaD && (
                    <path
                      d={areaD}
                      fill="url(#chart-grad)"
                    />
                  )}

                  {/* Polyline path */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#line-grad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Circles on vertices */}
                  {chartPoints.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      className={`fill-white dark:fill-[#0B0F19] stroke-2 ${
                        pt.score >= 80 ? "stroke-emerald-500" : pt.score >= 50 ? "stroke-amber-500" : "stroke-rose-500"
                      }`}
                    />
                  ))}

                  {/* Text dates */}
                  {chartPoints.map((pt, idx) => (
                    <text
                      key={idx}
                      x={pt.x}
                      y="145"
                      textAnchor="middle"
                      className="text-[9px] fill-slate-400 font-medium"
                    >
                      {pt.date.split(",")[0]}
                    </text>
                  ))}
                </svg>
              )}
            </div>
          </Card>

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
                    {statsLoading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-xs text-slate-400 animate-pulse">
                          Loading evaluation history...
                        </td>
                      </tr>
                    ) : stats.recentScans.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-xs text-slate-400">
                          No recent evaluations found. Use the Chrome Extension on LinkedIn to run your first audit.
                        </td>
                      </tr>
                    ) : (
                      stats.recentScans.map((scan) => (
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
                      ))
                    )}
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
