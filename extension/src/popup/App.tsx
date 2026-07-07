import { useState } from "react";
import { Shield, Settings, Info, RefreshCw, CheckCircle, Sparkles } from "lucide-react";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const triggerAnalyze = () => {
    setLoading(true);
    // Send message to background worker requesting simulated analysis
    chrome.runtime?.sendMessage({ type: "ANALYZE_JOB" }, (response) => {
      setLoading(false);
      if (response && response.success) {
        setData(response.data);
      }
    });

    // Mock fallback if running in dev mode outside extension container
    if (!chrome.runtime?.sendMessage) {
      setTimeout(() => {
        setLoading(false);
        setData({
          trustScore: 84,
          riskLevel: "LOW",
          aiExplanation: "The job listing has solid parameters. Recruiter links match domain footprints.",
          companyVerificationSignals: [
            { signalName: "LinkedIn Verified", description: "Hiring entity is a verified organization.", isVerified: true },
            { signalName: "Domain Match", description: "Official domain matches job context.", isVerified: true }
          ],
          suspiciousIndicators: [],
          safetyRecommendations: [
            "Confirm recruiter identity via official company portals."
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
        {/* Connection info */}
        <div className="glass-panel p-3 rounded-lg border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
          <Info className="w-4 h-4 text-brand-violet shrink-0" />
          <span>Active tab: linkedin.com/jobs</span>
        </div>

        {/* Action Button */}
        {!data && !loading && (
          <div className="text-center py-6 space-y-4">
            <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">
              Verify this job listing. Review safety signals, domain timelines, and employee alignments.
            </p>
            <button
              onClick={triggerAnalyze}
              className="w-full bg-brand-violet text-white hover:bg-brand-violet/90 transition-all py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-brand-violet/10 flex items-center justify-center gap-1.5"
            >
              Analyze Job Posting
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <RefreshCw className="w-6 h-6 text-brand-violet animate-spin" />
            <span className="text-xs text-slate-400">Evaluating safety metrics...</span>
          </div>
        )}

        {/* Results Output */}
        {data && !loading && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Score Ring Section */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Trust Index</span>
                <span className="text-2xl font-mono font-extrabold text-emerald-500">{data.trustScore}/100</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Risk Level</span>
                <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-semibold">
                  {data.riskLevel} RISK
                </span>
              </div>
            </div>

            {/* Signals block */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">VERIFICATION SIGNALS</span>
              <ul className="text-xs space-y-2">
                {data.companyVerificationSignals.map((sig: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded border border-slate-800/40">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">{sig.signalName}</div>
                      <div className="text-[10px] text-slate-400">{sig.description}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
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
          className="hover:text-slate-300 hover:underline"
        >
          Open SaaS Dashboard →
        </a>
      </div>
    </div>
  );
}
