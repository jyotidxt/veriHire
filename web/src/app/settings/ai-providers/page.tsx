"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Shield, Cpu, RefreshCw, Key, Trash2, CheckCircle2, AlertCircle, HelpCircle, ExternalLink } from "lucide-react";

interface ProviderDetails {
  id: string;
  name: string;
  logo: string;
  setupUrl: string;
  placeholder: string;
  instructions: string;
}

const PROVIDERS: ProviderDetails[] = [
  {
    id: "OPENAI",
    name: "OpenAI",
    logo: "⚡",
    setupUrl: "https://platform.openai.com/api-keys",
    placeholder: "sk-proj-...",
    instructions: "Generate a secret key in your OpenAI developer dashboard. Recommended model: gpt-4o-mini."
  },
  {
    id: "GEMINI",
    name: "Google Gemini",
    logo: "♊",
    setupUrl: "https://aistudio.google.com/app/apikey",
    placeholder: "AIzaSy...",
    instructions: "Get a free or pay-as-you-go key from Google AI Studio. Recommended model: gemini-1.5-flash."
  },
  {
    id: "ANTHROPIC",
    name: "Anthropic Claude",
    logo: "🎨",
    setupUrl: "https://console.anthropic.com/settings/keys",
    placeholder: "sk-ant-...",
    instructions: "Generate a console key in Anthropic. Recommended model: claude-3-5-sonnet."
  },
  {
    id: "GROQ",
    name: "Groq Llama",
    logo: "🚀",
    setupUrl: "https://console.groq.com/keys",
    placeholder: "gsk_...",
    instructions: "Create a fast Groq API key in your console dashboard. Recommended model: llama-3.1-8b-instant."
  },
  {
    id: "OPENROUTER",
    name: "OpenRouter",
    logo: "🌐",
    setupUrl: "https://openrouter.ai/settings/keys",
    placeholder: "sk-or-...",
    instructions: "Get an OpenRouter key to aggregate models from various LLM developers."
  }
];

export default function AIProvidersPage() {
  const { user, loading: authLoading, getAuthHeaders } = useAuth();
  const [activeProvider, setActiveProvider] = useState("OPENAI");
  const [keys, setKeys] = useState<Record<string, string>>({
    OPENAI: "",
    GEMINI: "",
    ANTHROPIC: "",
    GROQ: "",
    OPENROUTER: ""
  });
  const [keyMasks, setKeyMasks] = useState<Record<string, string>>({
    OPENAI: "",
    GEMINI: "",
    ANTHROPIC: "",
    GROQ: "",
    OPENROUTER: ""
  });
  const [testStates, setTestStates] = useState<Record<string, "idle" | "testing" | "success" | "error">>({
    OPENAI: "idle",
    GEMINI: "idle",
    ANTHROPIC: "idle",
    GROQ: "idle",
    OPENROUTER: "idle"
  });
  const [testErrors, setTestErrors] = useState<Record<string, string>>({
    OPENAI: "",
    GEMINI: "",
    ANTHROPIC: "",
    GROQ: "",
    OPENROUTER: ""
  });
  
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lastTested, setLastTested] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAIConfig();
    }
  }, [user]);

  const fetchAIConfig = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/settings/ai-config", {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setActiveProvider(data.activeProvider || "OPENAI");
        setKeyMasks({
          OPENAI: data.openaiKeyMasked || "",
          GEMINI: data.geminiKeyMasked || "",
          ANTHROPIC: data.anthropicKeyMasked || "",
          GROQ: data.groqKeyMasked || "",
          OPENROUTER: data.openrouterKeyMasked || ""
        });
        setKeys({
          OPENAI: data.openaiKeyMasked ? "••••••••••••••••" : "",
          GEMINI: data.geminiKeyMasked ? "••••••••••••••••" : "",
          ANTHROPIC: data.anthropicKeyMasked ? "••••••••••••••••" : "",
          GROQ: data.groqKeyMasked ? "••••••••••••••••" : "",
          OPENROUTER: data.openrouterKeyMasked ? "••••••••••••••••" : ""
        });
        if (data.lastTestedAt) {
          setLastTested(new Date(data.lastTestedAt).toLocaleString());
        }
      }
    } catch (err) {
      console.error("Failed to load AI credentials configuration", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);

      const payload = {
        activeProvider,
        openaiKey: keys.OPENAI,
        geminiKey: keys.GEMINI,
        anthropicKey: keys.ANTHROPIC,
        groqKey: keys.GROQ,
        openrouterKey: keys.OPENROUTER
      };

      const res = await fetch("/api/settings/ai-config", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        await fetchAIConfig();
      }
    } catch (err) {
      console.error("Save credentials config error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (providerId: string) => {
    try {
      setTestStates(prev => ({ ...prev, [providerId]: "testing" }));
      setTestErrors(prev => ({ ...prev, [providerId]: "" }));

      const res = await fetch("/api/settings/ai-config/test", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          provider: providerId,
          key: keys[providerId]
        })
      });

      if (res.ok) {
        setTestStates(prev => ({ ...prev, [providerId]: "success" }));
        setLastTested(new Date().toLocaleString());
      } else {
        const data = await res.json();
        setTestStates(prev => ({ ...prev, [providerId]: "error" }));
        setTestErrors(prev => ({ ...prev, [providerId]: data.error || "Key validation failed." }));
      }
    } catch (err: any) {
      setTestStates(prev => ({ ...prev, [providerId]: "error" }));
      setTestErrors(prev => ({ ...prev, [providerId]: err.message || "Network error." }));
    }
  };

  const handleClearKey = (providerId: string) => {
    setKeys(prev => ({ ...prev, [providerId]: "" }));
    setKeyMasks(prev => ({ ...prev, [providerId]: "" }));
    setTestStates(prev => ({ ...prev, [providerId]: "idle" }));
  };

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-slate-500 animate-pulse">Loading AI settings registry...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar className="hidden md:flex" />
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-4xl mx-auto md:max-w-none">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI Providers (BYOK)</h1>
              <p className="text-sm text-slate-500">Configure your secret credentials to unlock fully functional AI analysis features.</p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-violet/10 text-brand-violet text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>SaaS Bring Your Own Key</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Providers Column */}
            <div className="lg:col-span-2 space-y-6">
              {PROVIDERS.map((prov) => {
                const isSelected = activeProvider === prov.id;
                const keySet = keyMasks[prov.id];
                const testState = testStates[prov.id];
                const testError = testErrors[prov.id];

                return (
                  <Card 
                    key={prov.id}
                    className={`p-6 border transition-all relative overflow-hidden space-y-4 ${
                      isSelected 
                        ? "border-brand-violet ring-1 ring-brand-violet/20 bg-brand-violet/[0.01]" 
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {/* Badge active selector */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{prov.logo}</span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{prov.name}</h3>
                          <span className="text-[10px] text-slate-400">Supported for Scans, Resumes, and Interviews</span>
                        </div>
                      </div>
                      <Button
                        variant={isSelected ? "primary" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => setActiveProvider(prov.id)}
                      >
                        {isSelected ? "Active Provider" : "Select Provider"}
                      </Button>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed bg-slate-100/40 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                      {prov.instructions}
                    </p>

                    {/* Inputs and action buttons */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input
                            type="password"
                            className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg p-2 pl-9 text-xs focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
                            placeholder={prov.placeholder}
                            value={keys[prov.id]}
                            onChange={(e) => setKeys(prev => ({ ...prev, [prov.id]: e.target.value }))}
                          />
                        </div>
                        {keySet && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-9"
                            onClick={() => handleClearKey(prov.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {/* Display Key masked description indicator */}
                      {keySet && !keys[prov.id].includes("••••") && (
                        <p className="text-[10px] text-amber-500 font-semibold">⚠️ You edited the key. Press Save to encrypt and update.</p>
                      )}
                      {keySet && keys[prov.id].includes("••••") && (
                        <p className="text-[10px] text-slate-400">
                          Active API Key: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-600 dark:text-slate-300">{keySet}</code>
                        </p>
                      )}

                      {/* Test Connection Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-2 text-xs font-semibold"
                          disabled={testState === "testing" || !keys[prov.id]}
                          onClick={() => handleTestConnection(prov.id)}
                        >
                          {testState === "testing" ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            "Test Connection"
                          )}
                        </Button>

                        {/* Status Label */}
                        <div>
                          {testState === "success" && (
                            <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Connection Active</span>
                            </div>
                          )}
                          {testState === "error" && (
                            <div className="flex items-center gap-1.5 text-rose-500 text-xs font-semibold max-w-[200px] truncate" title={testError}>
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span className="truncate">Failed: {testError}</span>
                            </div>
                          )}
                          {testState === "idle" && keySet && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Key Saved</span>
                            </div>
                          )}
                          {!keySet && testState === "idle" && (
                            <span className="text-xs text-slate-400 italic">No credentials configured</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {/* Main Save Bar */}
              <Card className="p-4 flex items-center justify-between border-brand-violet/20 bg-brand-violet/[0.01]">
                <div className="text-xs text-slate-500">
                  {lastTested ? `Last connection tested: ${lastTested}` : "No connection tests registered."}
                </div>
                <div className="flex items-center gap-3">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-500 font-semibold animate-pulse">✓ Configurations Saved</span>
                  )}
                  <Button
                    onClick={handleSaveConfig}
                    disabled={saving}
                    className="bg-brand-violet hover:bg-brand-violet/90 text-white font-semibold text-xs h-9 px-5"
                  >
                    {saving ? "Saving..." : "Save API Configuration"}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Help / Setup Column */}
            <div className="space-y-6">
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-violet" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Setup Help</h4>
                </div>
                <div className="space-y-4 text-xs text-slate-500 leading-relaxed">
                  <p>
                    VeriHire leverages a secure **Bring Your Own Key (BYOK)** model. Credentials are encrypted on database write and verified using official endpoints.
                  </p>
                  <ul className="space-y-2 list-disc pl-4 text-[11px] text-slate-400">
                    <li>OpenAI keys start with <code className="bg-slate-100 dark:bg-slate-800 px-0.5 rounded">sk-...</code></li>
                    <li>Gemini keys start with <code className="bg-slate-100 dark:bg-slate-800 px-0.5 rounded">AIzaSy...</code></li>
                    <li>Anthropic keys start with <code className="bg-slate-100 dark:bg-slate-800 px-0.5 rounded">sk-ant-...</code></li>
                  </ul>
                  <p>
                    Connecting a provider unlocks **unlimited, secure, and instant evaluations** with no rate caps.
                  </p>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Isolation</h4>
                </div>
                <div className="text-xs text-slate-500 leading-relaxed space-y-2">
                  <p>
                    Your keys are protected by cryptographic standards:
                  </p>
                  <p className="font-semibold text-slate-600 dark:text-slate-400">
                    ✓ AES-256 Encrypted on Database Write
                  </p>
                  <p className="font-semibold text-slate-600 dark:text-slate-400">
                    ✓ Decrypted Server-Side Only
                  </p>
                  <p className="font-semibold text-slate-600 dark:text-slate-400">
                    ✓ Never Exposed Raw to Frontend
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
