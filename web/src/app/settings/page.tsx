"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Key, CreditCard, Shield, Copy, Check } from "lucide-react";


export default function SettingsPage() {
  const [copiedKey, setCopiedKey] = useState(false);
  const apiKeyMock = "vh_live_4a79c938b827cdb4e09f58e1c6";

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKeyMock);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar className="hidden md:flex" />
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-4xl mx-auto md:max-w-none">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-slate-500">Configure your user credentials, developer API keys, and subscriptions.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left and Middle column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Account settings */}
              <Card className="space-y-4">
                <h3 className="text-base font-bold">Profile Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">Full Name</label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">Email Address</label>
                    <input
                      type="email"
                      defaultValue="johndoe@example.com"
                      className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
                    />
                  </div>
                </div>
                <Button className="mt-2">Save Settings</Button>
              </Card>

              {/* Developer credentials */}
              <Card className="space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-brand-violet" />
                  <h3 className="text-base font-bold">API Access</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Generate tokens to query job authenticity endpoints directly or integrate within automated scrapers.
                </p>

                <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex items-center justify-between gap-4">
                  <code className="text-xs font-mono select-all truncate">
                    {apiKeyMock}
                  </code>
                  <Button variant="ghost" size="sm" onClick={handleCopyKey} className="shrink-0 p-2">
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">Rotate API Key</Button>
                  <Button variant="outline" size="sm">Revoke Key</Button>
                </div>
              </Card>
            </div>

            {/* Right subscription card */}
            <div className="space-y-8">
              <Card className="border border-brand-violet/20 relative overflow-hidden space-y-4">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-violet/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-brand-violet dark:text-violet-400 text-xs font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>ACTIVE PLAN</span>
                  </div>
                  <Badge variant="success">PRO</Badge>
                </div>

                <div>
                  <h4 className="text-xl font-extrabold">$9 / mo</h4>
                  <p className="text-xs text-slate-400 mt-1">Renews automatically on Aug 1, 2026</p>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                <ul className="text-xs space-y-2 text-slate-500">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Unlimited Chrome evaluations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Domain history analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Sandbox testing API access
                  </li>
                </ul>

                <Button variant="glass" className="w-full gap-2 border border-slate-200 dark:border-slate-800">
                  <CreditCard className="w-4 h-4" />
                  Manage Billing via Stripe
                </Button>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
