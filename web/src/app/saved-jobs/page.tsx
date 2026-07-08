"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Loader } from "@/components/ui/loader";
import {
  Briefcase,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Edit,
  Plus,
  StickyNote,
  Search,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

type Application = {
  id: string;
  jobIdExternal: string;
  jobTitle: string;
  companyName: string;
  trustScore: number;
  riskLevel: string;
  status: "SAVED" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  notes?: string;
  reminderDate?: string;
  savedAt: string;
};

const COLUMNS = [
  { id: "SAVED", title: "Saved Listings", color: "border-slate-500/20" },
  { id: "APPLIED", title: "Applied", color: "border-indigo-500/20" },
  { id: "INTERVIEW", title: "Interviewing", color: "border-amber-500/20" },
  { id: "OFFER", title: "Offers", color: "border-emerald-500/20" },
  { id: "REJECTED", title: "Archive", color: "border-rose-500/20" }
];

export default function SavedJobsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Edit Form Fields State
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState<any>("SAVED");
  const [editReminder, setEditReminder] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (res.ok && data.success && data.data.length > 0) {
        setApplications(data.data);
      } else {
        // Mock applications fallback if database is offline or empty
        setApplications([
          {
            id: "mock-1",
            jobIdExternal: "101",
            jobTitle: "Senior Frontend Engineer",
            companyName: "Vercel",
            trustScore: 95,
            riskLevel: "LOW",
            status: "SAVED",
            notes: "Ready to apply. Tailoring my resume matches first.",
            savedAt: new Date().toISOString()
          },
          {
            id: "mock-2",
            jobIdExternal: "102",
            jobTitle: "Security Analyst",
            companyName: "Stripe",
            trustScore: 92,
            riskLevel: "LOW",
            status: "APPLIED",
            notes: "Submitted application via corporate site.",
            savedAt: new Date().toISOString()
          },
          {
            id: "mock-3",
            jobIdExternal: "103",
            jobTitle: "Data Entry Operator",
            companyName: "Global Apex Solutions",
            trustScore: 42,
            riskLevel: "HIGH",
            status: "INTERVIEW",
            notes: "Recruiter messaging me on WhatsApp. Asked me to purchase a startup kit. HIGH RISK.",
            reminderDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            savedAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.warn("VeriHire: Applications API unreachable. Loading mock Kanban cards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenEdit = (app: Application) => {
    setSelectedApp(app);
    setEditNotes(app.notes || "");
    setEditStatus(app.status);
    setEditReminder(app.reminderDate ? app.reminderDate.split("T")[0] : "");
    setIsEditModalOpen(true);
  };

  const handleUpdateApplication = async () => {
    if (!selectedApp) return;

    // Optimistically update UI
    const updated = applications.map((app) => {
      if (app.id === selectedApp.id) {
        return {
          ...app,
          status: editStatus,
          notes: editNotes,
          reminderDate: editReminder ? new Date(editReminder).toISOString() : undefined
        };
      }
      return app;
    });
    setApplications(updated);
    setIsEditModalOpen(false);

    try {
      await fetch("//api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedApp.id,
          status: editStatus,
          notes: editNotes,
          reminderDate: editReminder || null
        })
      });
    } catch (err) {
      console.warn("VeriHire: Database offline, changes preserved client-side.");
    }
  };

  const handleDeleteApplication = async (id: string) => {
    // Optimistic delete
    setApplications(applications.filter((app) => app.id !== id));
    setIsEditModalOpen(false);

    try {
      await fetch(`/api/applications?id=${id}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.warn("VeriHire: Database offline, deletion preserved client-side.");
    }
  };

  const moveStatus = async (app: Application, direction: "left" | "right") => {
    const currentIndex = COLUMNS.findIndex((col) => col.id === app.status);
    let nextIndex = direction === "right" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= COLUMNS.length) return;

    const newStatus = COLUMNS[nextIndex].id as any;

    setApplications(
      applications.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
    );

    try {
      await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: app.id,
          status: newStatus
        })
      });
    } catch (err) {
      console.warn("VeriHire: Status updated client-side.");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar className="hidden md:flex" />
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto md:max-w-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Application Tracker</h1>
              <p className="text-sm text-slate-500">
                Track your job search progress, follow up reminders, and monitor AI trust scores in a unified workspace.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={fetchApplications} variant="outline" className="gap-1.5">
                Refresh Board
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-24 text-center">
              <Loader size="lg" />
              <p className="text-sm text-slate-500 mt-4">Loading your tracking board...</p>
            </div>
          ) : (
            /* Kanban Grid Scroll */
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 items-start overflow-x-auto pb-4">
              {COLUMNS.map((column) => {
                const columnApps = applications.filter((app) => app.status === column.id);
                return (
                  <div
                    key={column.id}
                    className={`flex flex-col gap-4 min-w-[220px] bg-slate-100/40 dark:bg-slate-900/40 border ${column.color} rounded-xl p-4 min-h-[500px] transition-colors`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {column.title}
                      </h3>
                      <span className="text-[11px] font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                        {columnApps.length}
                      </span>
                    </div>

                    {/* Cards Container */}
                    <div className="flex flex-col gap-3">
                      {columnApps.map((app) => (
                        <div
                          key={app.id}
                          className="glass-card p-4 hover:translate-y-[-2px] transition-all hover:shadow-lg duration-200 border border-slate-200 dark:border-slate-800/80 cursor-pointer space-y-3"
                          onClick={() => handleOpenEdit(app)}
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                              {app.jobTitle}
                            </h4>
                            <p className="text-[10px] text-slate-500">{app.companyName}</p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                            {/* Score indicator */}
                            <div className="flex items-center gap-1">
                              <ShieldCheck className={`w-3.5 h-3.5 ${
                                app.trustScore >= 80 ? "text-emerald-500" : app.trustScore >= 50 ? "text-amber-500" : "text-rose-500"
                              }`} />
                              <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                                {app.trustScore}/100
                              </span>
                            </div>

                            {/* Move triggers */}
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => moveStatus(app, "left")}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                                disabled={column.id === "SAVED"}
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveStatus(app, "right")}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                                disabled={column.id === "REJECTED"}
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Task Reminder pill if present */}
                          {app.reminderDate && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-violet/10 border border-brand-violet/20 text-[9px] text-brand-violet dark:text-violet-400 w-fit">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>Remind: {app.reminderDate.split("T")[0]}</span>
                            </div>
                          )}

                          {/* Notes snippet */}
                          {app.notes && (
                            <div className="flex items-start gap-1 text-[9px] text-slate-500 leading-normal line-clamp-2">
                              <StickyNote className="w-2.5 h-2.5 mt-0.5 shrink-0" />
                              <span>{app.notes}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal to update Application Details */}
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title="Edit Application Tracker Card"
          >
            {selectedApp && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold">{selectedApp.jobTitle}</h4>
                  <p className="text-xs text-slate-500">{selectedApp.companyName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Status Dropdown */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
                    >
                      {COLUMNS.map((col) => (
                        <option key={col.id} value={col.id}>{col.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Reminder Date Selector */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">Reminder Date</label>
                    <input
                      type="date"
                      value={editReminder}
                      onChange={(e) => setEditReminder(e.target.value)}
                      className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
                    />
                  </div>
                </div>

                {/* Candidate Notes Textarea */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Notes</label>
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Enter reminders, coordinator emails, or interview questions..."
                    className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-violet/50 resize-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => handleDeleteApplication(selectedApp.id)}
                    className="text-rose-500 hover:bg-rose-500/10 gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Card
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateApplication}>
                      Save Changes
                    </Button>
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
