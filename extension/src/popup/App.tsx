import { useState, useEffect } from "react";
import {
  Shield,
  Settings,
  Info,
  RefreshCw,
  CheckCircle,
  Sparkles,
  AlertTriangle,
  MapPin,
  Briefcase,
  BookmarkCheck,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("linkedin");

  useEffect(() => {
    // Detect active tab URL on load
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url || "";
        if (!url.includes("linkedin.com")) {
          setActiveTab("non-linkedin");
        } else if (!url.includes("/jobs/")) {
          setActiveTab("linkedin-generic");
        } else {
          setActiveTab("linkedin-job");
        }
      });
    }
  }, []);

  const triggerAnalyze = () => {
    setLoading(true);
    setError(null);
    setData(null);

    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "ANALYZE_JOB" }, (response) => {
        setLoading(false);
        if (response && response.success) {
          setData(response.data);
        } else {
          setError(
            response?.error || "Failed to analyze page. Please reload the tab."
          );
        }
      });
    } else {
      // Mock data for development build testing
      setTimeout(() => {
        setLoading(false);
        setData({
          jobDetails: {
            jobTitle: "Staff Software Engineer",
            companyName: "TechGlobal Solutions",
            jobLocation: "New York, NY (Remote)",
            employmentType: "Full-time",
            experienceLevel: "Mid-Senior level",
            skills: ["TypeScript", "React", "Next.js"],
            jobUrl: "https://www.linkedin.com/jobs/view/mock"
          },
          trustScore: 84,
          riskLevel: "LOW",
          aiExplanation:
            "Heuristic evaluation indicates clean parameters. Recruiter profile matches typical employee footprints.",
          companyVerificationSignals: [
            {
              signalName: "LinkedIn Entity Linked",
              description: 'Job correctly references profile "TechGlobal Solutions".',
              isVerified: true
            },
            {
              signalName: "Physical Headcount Location",
              description: 'Location listing verified as "New York, NY".',
              isVerified: true
            }
          ],
          suspiciousIndicators: [],
          safetyRecommendations: [
            "Verify the listing on TechGlobal's careers portal."
          ]
        });
      }, 1000);
    }
  };

  return (
    <div className="p-4 flex flex-col justify-between min-h-[480px] bg-slate-900 text-slate-100 selection:bg-brand-violet/30">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">VeriHire AI</span>
        </div>
        <button className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 space-y-4">
        {/* Connection status card */}
        {activeTab === "non-linkedin" && (
          <div className="glass-panel p-3 rounded-lg border border-rose-500/20 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Open a LinkedIn Job posting tab to begin.</span>
          </div>
        )}

        {activeTab === "linkedin-generic" && (
          <div className="glass-panel p-3 rounded-lg border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-300">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Navigate to a specific job detail page to check.</span>
          </div>
        )}

        {activeTab === "linkedin-job" && !data && !loading && (
          <div className="glass-panel p-3 rounded-lg border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
            <BookmarkCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>LinkedIn Job detail page detected! Ready to inspect.</span>
          </div>
        )}

        {/* Error panel */}
        {error && (
          <div className="glass-panel p-3 rounded-lg border border-rose-500/20 text-xs text-rose-300 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Inspection Failed</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-400">{error}</p>
          </div>
        )}

        {/* Action Button */}
        {!data && !loading && (
          <div className="text-center py-6 space-y-4">
            <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
              Verify LinkedIn job parameters, suspicious description keywords, and recruiter verification markers.
            </p>
            <button
              onClick={triggerAnalyze}
              disabled={activeTab !== "linkedin-job" && activeTab !== "linkedin-generic" && typeof chrome !== "undefined"}
              className="w-full bg-brand-violet text-white hover:bg-brand-violet/90 transition-all py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-brand-violet/10 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
            >
              Analyze Job Posting
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <RefreshCw className="w-6 h-6 text-brand-violet animate-spin" />
            <span className="text-xs text-slate-400">Scraping and analyzing job page...</span>
          </div>
        )}

        {/* Results Output */}
        {data && !loading && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Extracted Job Header */}
            <div className="glass-panel p-3 rounded-xl border border-slate-800 space-y-2">
              <div>
                <h4 className="font-bold text-sm text-white line-clamp-1">
                  {data.jobDetails.jobTitle}
                </h4>
                <p className="text-xs text-slate-400">{data.jobDetails.companyName}</p>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate max-w-[100px]">{data.jobDetails.jobLocation}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 shrink-0" />
                  <span>{data.jobDetails.employmentType}</span>
                </span>
              </div>
            </div>

            {/* Score and Risk Ring Section */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Trust Score</span>
                <span
                  className={`text-2xl font-mono font-extrabold ${
                    data.trustScore >= 80
                      ? "text-emerald-500"
                      : data.trustScore >= 50
                      ? "text-amber-500"
                      : "text-rose-500"
                  }`}
                >
                  {data.trustScore}/100
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Risk Level</span>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider mt-1 ${
                    data.riskLevel === "LOW"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : data.riskLevel === "MEDIUM"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {data.riskLevel}
                </span>
              </div>
            </div>

            {/* Suspicious Indicators (Alerts) */}
            {data.suspiciousIndicators.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                  Suspicious Indicators ({data.suspiciousIndicators.length})
                </span>
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                  {data.suspiciousIndicators.map((indicator: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-rose-950/20 border border-rose-500/20 text-[11px] flex gap-2 text-rose-300"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">{indicator.category}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {indicator.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Checklist */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                Verification Signals
              </span>
              <ul className="text-[11px] space-y-1.5">
                {data.companyVerificationSignals.map((sig: any, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 bg-slate-900/60 p-2 rounded border border-slate-800/40"
                  >
                    <CheckCircle
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        sig.isVerified ? "text-emerald-500" : "text-slate-600"
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-slate-200">{sig.signalName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {sig.description}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Extracted Skills Section */}
            {data.jobDetails.skills && data.jobDetails.skills[0] !== "Not Specified" && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                  Scraped Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.jobDetails.skills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Link to dashboard details report */}
            <button
              onClick={triggerAnalyze}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-800 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Re-Scan Listing
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-violet" />
          <span>Pro Account Tier</span>
        </div>
        <a
          href="https://verihire.app/dashboard"
          target="_blank"
          rel="noreferrer"
          className="hover:text-slate-300 hover:underline flex items-center gap-0.5"
        >
          SaaS Portal
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
