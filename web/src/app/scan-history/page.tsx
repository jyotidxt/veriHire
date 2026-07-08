"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Search, ShieldAlert, ArrowUpRight, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export default function ScanHistoryPage() {
  const { user, loading } = useAuth();
  const [selectedScan, setSelectedScan] = useState<any>(null);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-slate-500 animate-pulse">Verifying secure session...</div>
      </div>
    );
  }

  const history = [
    {
      id: "1",
      title: "Remote QA Analyst",
      company: "Secure-Logistics Ltd.",
      score: 32,
      risk: "HIGH",
      date: "July 7, 2026",
      desc: "Urgent remote requirement typing code scripts. Upfront software testing package required via Telegram recruiter @hr_secure.",
      signals: ["No verified company badge", "Requires upfront payment details", "Alternative chat redirect"],
      recs: ["Do not buy startup equipment", "Verify recruiter email matching Secure-Logistics domains"]
    },
    {
      id: "2",
      title: "Junior Frontend Dev",
      company: "Novus Web Agency",
      score: 94,
      risk: "LOW",
      date: "July 6, 2026",
      desc: "Requires React, TypeScript experience. Application processed securely on corporate ATS.",
      signals: ["Official domain matching registration", "LinkedIn verified organization header", "Matches employee statistics"],
      recs: ["Standard professional verification protocols apply"]
    },
    {
      id: "3",
      title: "Data Entry Operator",
      company: "Global Apex Outsourcing",
      score: 55,
      risk: "MEDIUM",
      date: "July 5, 2026",
      desc: "Help team scan invoice records. Payment via check redirect. Domain registered 1 month ago.",
      signals: ["Short domain existence history", "High salary metrics relative to market standards"],
      recs: ["Verify details on Glassdoor reviews", "Request corporate details package before submitting documents"]
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar className="hidden md:flex" />
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-5xl mx-auto md:max-w-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Scan History</h1>
              <p className="text-sm text-slate-500">Access every evaluated job listing saved from your Chrome extension.</p>
            </div>
            
            {/* Search Input Mock */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search scans..."
                className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
              />
            </div>
          </div>

          {/* Scans Grid */}
          <div className="grid grid-cols-1 gap-4">
            {history.map((scan) => (
              <Card key={scan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{scan.title}</h3>
                    <Badge variant={scan.risk === "LOW" ? "success" : scan.risk === "MEDIUM" ? "warning" : "error"}>
                      {scan.risk}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">{scan.company} • Scanned {scan.date}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 max-w-2xl">{scan.desc}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className={`text-xl font-mono font-bold ${
                      scan.score >= 80 ? "text-emerald-500" : scan.score >= 50 ? "text-amber-500" : "text-rose-500"
                    }`}>
                      {scan.score}/100
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Safety score</span>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setSelectedScan(scan)} className="gap-1">
                    Details
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Modal overlay showing specific detail metrics */}
          <Modal
            isOpen={selectedScan !== null}
            onClose={() => setSelectedScan(null)}
            title="Analysis Detail Report"
          >
            {selectedScan && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold">{selectedScan.title}</h4>
                    <Badge variant={selectedScan.risk === "LOW" ? "success" : selectedScan.risk === "MEDIUM" ? "warning" : "error"}>
                      {selectedScan.risk}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{selectedScan.company} • Scanned {selectedScan.date}</p>
                </div>

                <div className="p-4 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg text-center space-y-1">
                  <div className={`text-3xl font-mono font-extrabold ${
                    selectedScan.score >= 80 ? "text-emerald-500" : selectedScan.score >= 50 ? "text-amber-500" : "text-rose-500"
                  }`}>
                    {selectedScan.score}/100
                  </div>
                  <p className="text-xs text-slate-400">VeriHire Safety Score index rating</p>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description parsed</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-100/20 dark:bg-slate-900/20 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                    {selectedScan.desc}
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suspicious / Verification Signals</h5>
                  <ul className="space-y-2 text-xs">
                    {selectedScan.signals.map((sig: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        {selectedScan.risk === "HIGH" ? (
                          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        )}
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Safety Recommendations</h5>
                  <div className="p-3 bg-brand-violet/5 border border-brand-violet/10 rounded-lg text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                    {selectedScan.recs.map((rec: string, idx: number) => (
                      <p key={idx} className="flex items-start gap-1.5">
                        <span className="text-brand-violet">•</span>
                        <span>{rec}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </main>
      </div>
    </div>
  );
}
