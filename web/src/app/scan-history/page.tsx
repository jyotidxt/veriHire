"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Loader } from "@/components/ui/loader";
import { Search, ShieldAlert, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ScanHistoryPage() {
  const { user, loading: authLoading, getAuthHeaders } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [scansLoading, setScansLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        try {
          const res = await fetch("/api/scan-history", {
            headers: getAuthHeaders()
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setHistory(data.data);
          }
        } catch (err) {
          console.error("Failed to load scan history:", err);
        } finally {
          setScansLoading(false);
        }
      };
      fetchHistory();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-slate-500 animate-pulse">Verifying secure session...</div>
      </div>
    );
  }

  // Client-side search query filtering
  const filteredHistory = history.filter(
    (scan) =>
      scan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scans..."
                className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
              />
            </div>
          </div>

          {/* Scans Grid */}
          {scansLoading ? (
            <div className="flex flex-col items-center justify-center p-24 text-center">
              <Loader size="lg" />
              <p className="text-sm text-slate-500 mt-4">Loading your scan history...</p>
            </div>
          ) : history.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-16 text-center max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-brand-violet/10 flex items-center justify-center border border-brand-violet/20">
                <ShieldAlert className="w-6 h-6 text-brand-violet" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Job Scans Yet</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  You haven't run any job verification audits. Open a LinkedIn Job detail page and click our checker badge to inspect your first listing!
                </p>
              </div>
              <a href="/" className="inline-block">
                <Button className="text-xs">Analyze Your First Job</Button>
              </a>
            </Card>
          ) : filteredHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching job scans found for "{searchQuery}".
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredHistory.map((scan) => (
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
          )}

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

                {selectedScan.signals && selectedScan.signals.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification Signals</h5>
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
                )}

                {selectedScan.recs && selectedScan.recs.length > 0 && (
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
                )}
              </div>
            )}
          </Modal>
        </main>
      </div>
    </div>
  );
}
