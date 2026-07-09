// Chrome Extension MV3 Content Script - Shadow DOM UI Injection & Scraper

console.log("VeriHire Content Script: Initializing floating UI injector.");

// Sync user session if running on VeriHire SaaS website domain
if (window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app")) {
  const storedUser = localStorage.getItem("verihire_user");
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      chrome.runtime.sendMessage({ type: "SYNC_USER_SESSION", user: parsedUser }, (res) => {
        console.log("VeriHire Content Script: Session synced successfully with background worker:", res);
      });
    } catch (e) {
      console.error("VeriHire Content Script: Failed to parse verihire_user from localStorage", e);
    }
  }
}
// Configurable base URL: check manifest update_url to distinguish packed/store build from unpacked dev mode
const IS_DEV = !("update_url" in chrome.runtime.getManifest());
const SAAS_URL = IS_DEV ? "http://localhost:3000" : "https://verihire-jyotidxt.vercel.app";

// SVG Icons as strings for easy injection inside Shadow DOM
const SHIELD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8.24-2a1 1 0 0 1 .48 0l8.24 2A1 1 0 0 1 20 6z"/></svg>`;
const CLOSE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
const MAP_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const BRIEFCASE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-briefcase"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>`;

// Inject CSS styles into the Shadow DOM
const SHADOW_CSS = `
  /* Reset and base */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  /* Floating action bubble button */
  .vh-bubble {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #0f172a;
    border: 2px solid rgba(16, 185, 129, 0.4);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(16, 185, 129, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 999999;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .vh-bubble:hover {
    transform: scale(1.1) rotate(5deg);
    border-color: #10b981;
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.4);
  }

  /* Tooltip hover card */
  .vh-tooltip {
    position: absolute;
    bottom: 70px;
    right: 0;
    background: #1e293b;
    color: #f8fafc;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    border: 1px solid rgba(255, 255, 255, 0.08);
    opacity: 0;
    pointer-events: none;
    transform: translateY(10px);
    transition: all 0.2s ease;
  }

  .vh-bubble:hover .vh-tooltip {
    opacity: 1;
    transform: translateY(0);
  }

  /* Slide-out side drawer panel */
  .vh-drawer {
    position: fixed;
    top: 0;
    right: -420px;
    width: 380px;
    height: 100vh;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
    z-index: 999998;
    transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-col: column;
    flex-direction: column;
    color: #f1f5f9;
  }

  .vh-drawer.vh-open {
    right: 0;
  }

  /* Scrollbar container */
  .vh-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  .vh-content::-webkit-scrollbar {
    width: 6px;
  }
  .vh-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  /* Header */
  .vh-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-b: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .vh-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 14px;
    color: #fff;
  }

  .vh-close-btn {
    border: none;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .vh-close-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
  }

  /* Cards */
  .vh-card {
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  /* Job metadata details */
  .vh-title {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    line-height: 1.3;
    margin-bottom: 4px;
  }

  .vh-company {
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 12px;
  }

  .vh-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .vh-meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #64748b;
  }

  /* Trust Score Radial */
  .vh-score-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .vh-score-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .vh-score-title {
    font-size: 10px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .vh-score-value {
    font-size: 26px;
    font-weight: 800;
    font-family: monospace;
    color: #10b981;
  }

  .vh-score-value.medium { color: #f59e0b; }
  .vh-score-value.high { color: #ef4444; }

  .vh-badge {
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.2);
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .vh-badge.medium {
    background: rgba(245, 158, 11, 0.1);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  .vh-badge.high {
    background: rgba(239, 68, 68, 0.1);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  /* Subtitles inside content scripts */
  .vh-subtitle {
    font-size: 10px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }

  .vh-explanation {
    font-size: 12px;
    color: #cbd5e1;
    line-height: 1.5;
  }

  /* Save Job Footer button */
  .vh-footer {
    padding: 20px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .vh-btn {
    width: 100%;
    background: #6366f1;
    border: none;
    color: #fff;
    font-weight: 600;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .vh-btn:hover {
    background: #4f46e5;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  }

  .vh-btn-saved {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
    cursor: default;
  }
  .vh-btn-saved:hover {
    background: rgba(16, 185, 129, 0.2);
    box-shadow: none;
  }

  .vh-btn-secondary {
    width: 100%;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #f1f5f9;
    font-weight: 500;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-decoration: none;
  }
  .vh-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .vh-byok-modal {
    position: absolute;
    inset: 0;
    background: rgba(11, 15, 25, 0.96);
    backdrop-filter: blur(8px);
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 1000;
  }
  .vh-byok-modal-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 14px;
    text-align: center;
  }
  .vh-byok-title {
    font-size: 14px;
    font-weight: 700;
    color: #f1f5f9;
  }
  .vh-byok-desc {
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.4;
  }
  .vh-byok-features {
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 10px;
    border-radius: 6px;
    text-align: left;
  }
  .vh-byok-feat-item {
    font-size: 10px;
    color: #cbd5e1;
  }
  .vh-byok-note {
    font-size: 10px;
    color: #64748b;
  }
  .vh-byok-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .vh-badge.demo {
    background: rgba(99, 102, 241, 0.15);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  .vh-link {
    display: block;
    text-align: center;
    font-size: 11px;
    color: #64748b;
    text-decoration: none;
    transition: color 0.2s;
  }

  .vh-link:hover {
    color: #94a3b8;
    text-decoration: underline;
  }
`;



function calculateDemoConfidence(scraped: any) {
  let score = 50; // base score
  const checks: { label: string; value: string; pass: boolean }[] = [];

  // 1. Company detected
  const hasCompany = scraped.companyName && scraped.companyName !== "Unavailable" && scraped.companyName !== "Hiring Company";
  score += hasCompany ? 5 : 0;
  checks.push({ label: "Company Detected", value: hasCompany ? scraped.companyName : "Missing", pass: hasCompany });

  // 2. Job title
  const hasTitle = scraped.jobTitle && scraped.jobTitle !== "Unavailable" && scraped.jobTitle !== "Software Developer";
  score += hasTitle ? 5 : 0;
  checks.push({ label: "Job Title", value: hasTitle ? scraped.jobTitle : "Missing", pass: hasTitle });

  // 3. Location
  const hasLocation = scraped.jobLocation && scraped.jobLocation !== "Unavailable" && scraped.jobLocation !== "Remote / Hybrid";
  score += hasLocation ? 5 : 0;
  checks.push({ label: "Location", value: hasLocation ? scraped.jobLocation : "Missing", pass: hasLocation });

  // 4. Employment Type
  const hasEmpType = scraped.employmentType && scraped.employmentType !== "Not Specified";
  score += hasEmpType ? 5 : 0;
  checks.push({ label: "Employment Type", value: hasEmpType ? scraped.employmentType : "Not Specified", pass: hasEmpType });

  // 5. Skills Detected
  const skillsCount = scraped.skills ? scraped.skills.filter((s: string) => s !== "Not Specified").length : 0;
  score += skillsCount > 0 ? Math.min(10, skillsCount * 2) : 0;
  checks.push({ label: "Skills Count", value: skillsCount > 0 ? `${skillsCount} skills` : "None Detected", pass: skillsCount > 0 });

  // 6. Seniority
  const hasSeniority = scraped.experienceLevel && scraped.experienceLevel !== "Not Specified";
  score += hasSeniority ? 5 : 0;
  checks.push({ label: "Seniority Level", value: hasSeniority ? scraped.experienceLevel : "Not Specified", pass: hasSeniority });

  // 7. Description completeness
  const descLength = scraped.jobDescription ? scraped.jobDescription.length : 0;
  const isComplete = descLength > 800;
  score += descLength > 1500 ? 10 : descLength > 800 ? 5 : 0;
  checks.push({ label: "Description Length", value: `${descLength} chars`, pass: isComplete });

  // 8. Salary mentioned
  const descLower = scraped.jobDescription.toLowerCase();
  const salaryRegex = /(\$|salary|salary range|hourly|compensation|pay rate|\d+\s*k)/i;
  const hasSalary = salaryRegex.test(descLower);
  score += hasSalary ? 10 : 0;
  checks.push({ label: "Salary Details", value: hasSalary ? "Mentioned" : "Not Specified", pass: hasSalary });

  // 9. External website link
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = scraped.jobDescription.match(urlRegex) || [];
  const hasUrl = urls.length > 0;
  score += hasUrl ? 5 : 0;
  checks.push({ label: "External Website", value: hasUrl ? "Detected" : "Not Detected", pass: hasUrl });

  // 10. Application link
  const hasAppLink = scraped.jobUrl && scraped.jobUrl.includes("linkedin.com");
  score += hasAppLink ? 5 : 0;
  checks.push({ label: "Application Link", value: hasAppLink ? "Detected" : "Not Detected", pass: hasAppLink });

  // 11. Remote/Hybrid/On-site
  const isRemote = descLower.includes("remote") || scraped.jobLocation.toLowerCase().includes("remote");
  const isHybrid = descLower.includes("hybrid");
  const isOnsite = descLower.includes("on-site") || descLower.includes("onsite");
  const mode = isRemote ? "Remote" : isHybrid ? "Hybrid" : isOnsite ? "On-site" : "Not Specified";
  score += mode !== "Not Specified" ? 5 : 0;
  checks.push({ label: "Workplace Mode", value: mode, pass: mode !== "Not Specified" });

  score = Math.min(100, Math.max(10, score));

  return { score, checks };
}

let shadowRoot: ShadowRoot | null = null;
let savedJobsList: string[] = [];

// Injects the VeriHire floating action items
function injectFloatingUI() {
  // Prevent duplicate injections
  if (document.getElementById("verihire-floating-root")) return;

  const container = document.createElement("div");
  container.id = "verihire-floating-root";
  document.body.appendChild(container);

  // Attach isolated shadow root
  shadowRoot = container.attachShadow({ mode: "open" });

  // Append style sheet
  const styleBlock = document.createElement("style");
  styleBlock.textContent = SHADOW_CSS;
  shadowRoot.appendChild(styleBlock);

  // Create floating circular bubble button
  const bubble = document.createElement("div");
  bubble.className = "vh-bubble";
  bubble.innerHTML = `
    ${SHIELD_SVG}
    <div class="vh-tooltip">Analyze job with VeriHire</div>
  `;
  shadowRoot.appendChild(bubble);

  // Create side drawer slide-out panel
  const drawer = document.createElement("div");
  drawer.className = "vh-drawer";
  drawer.innerHTML = `
    <div class="vh-header">
      <div class="vh-logo">
        ${SHIELD_SVG}
        <span>VeriHire AI</span>
      </div>
      <button class="vh-close-btn">${CLOSE_SVG}</button>
    </div>
    
    <div class="vh-content">
      <!-- Scraped metadata card -->
      <div class="vh-card">
        <h3 class="vh-title" id="vh-job-title">Software Developer</h3>
        <p class="vh-company" id="vh-company-name">TechGlobal Solutions</p>
        <div class="vh-meta-row">
          <div class="vh-meta-item">
            ${MAP_PIN_SVG}
            <span id="vh-job-location">Remote</span>
          </div>
          <div class="vh-meta-item">
            ${BRIEFCASE_SVG}
            <span>Full-time</span>
          </div>
        </div>
      </div>

      <!-- Score card (renamed to Demo Confidence Score by default) -->
      <div class="vh-card">
        <div class="vh-score-container">
          <div class="vh-score-left">
            <span class="vh-score-title" id="vh-score-title">Demo Confidence Score</span>
            <span class="vh-score-value text-amber-500" id="vh-score-text">--/100</span>
            <span class="vh-score-caption" id="vh-score-caption" style="font-size: 9px; color: #64748b; margin-top: 4px; display: block; line-height: 1.3;">
              Generated from visible job signals — not AI analysis.
            </span>
          </div>
          <span class="vh-badge demo" id="vh-risk-badge">🟡 Demo Analysis</span>
        </div>
      </div>

      <!-- Demo Analysis Panel (checklist of signals) -->
      <div class="vh-card" id="vh-demo-panel">
        <h4 class="vh-subtitle">Demo Signal Checklist</h4>
        <div id="vh-checklist-container" style="display: flex; flex-direction: column; gap: 7px; margin-top: 10px;">
          <!-- checklist rows injected dynamically -->
        </div>
      </div>

      <!-- Real AI Analysis panel (hidden by default) -->
      <div class="vh-card" id="vh-ai-panel" style="display: none;">
        <h4 class="vh-subtitle">AI Analysis Insights</h4>
        <p class="vh-explanation" id="vh-explanation-text">
          Evaluating description and matching corporate entities.
        </p>
      </div>

      <!-- Unlock Real AI Analysis CTA -->
      <div class="vh-card" id="vh-ai-upgrade-card" style="border: 1px solid rgba(99, 102, 241, 0.2); background: rgba(99, 102, 241, 0.02); padding: 14px; border-radius: 8px;">
        <h4 class="vh-subtitle" style="color: #a5b4fc; font-weight: 700; display: flex; align-items: center; gap: 6px;">
          ✨ Unlock Real AI Analysis
        </h4>
        <p style="font-size: 11px; color: #94a3b8; line-height: 1.4; margin: 6px 0 10px 0;">
          Get personalized AI-powered:<br />
          • Scam risk detection &nbsp;&nbsp;&nbsp;&nbsp; • Resume matching<br />
          • Company insights &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • Career recommendations<br />
          • Interview preparation &nbsp; • Detailed explanations
        </p>
        <button class="vh-btn" id="vh-real-ai-btn" style="width: 100%;">
          Analyze with Real AI
        </button>
      </div>
    </div>

    <!-- Actions footer -->
    <div class="vh-footer">
      <button class="vh-btn" id="vh-save-btn">Save Job Listing</button>
      <a href="#" target="_blank" class="vh-btn-secondary" id="vh-resume-btn" style="display: none;">Compare Resume</a>
      <a href="#" target="_blank" class="vh-btn-secondary" id="vh-interview-btn" style="display: none;">Prep Interview</a>
      <a href="${SAAS_URL}/dashboard" target="_blank" class="vh-btn-secondary">
        Open SaaS Portal →
      </a>
    </div>

    <!-- Connect Your AI Provider Modal -->
    <div class="vh-byok-modal" id="vh-byok-modal">
      <div class="vh-byok-modal-content">
        <span class="vh-byok-title">Connect Your AI Provider</span>
        <p class="vh-byok-desc">VeriHire respects your privacy and does not provide shared AI API keys. To enable personalized AI analysis, connect your own API provider.</p>
        <div class="vh-byok-features">
          <div class="vh-byok-feat-item">✓ Personalized Job Analysis</div>
          <div class="vh-byok-feat-item">✓ Resume Match</div>
          <div class="vh-byok-feat-item">✓ AI Interview Preparation</div>
          <div class="vh-byok-feat-item">✓ Career Coach</div>
        </div>
        <p class="vh-byok-note">Supported Providers: OpenAI, Gemini, Claude, Groq, OpenRouter</p>
        <div class="vh-byok-actions">
          <a href="${SAAS_URL}/settings/ai-providers" target="_blank" class="vh-btn" style="text-decoration:none; text-align: center;">Configure AI Provider</a>
          <button class="vh-btn-secondary" id="vh-demo-mode-btn">Continue Using Demo Mode</button>
        </div>
      </div>
    </div>
  `;
  shadowRoot.appendChild(drawer);

  // Helper to extract text cleanly with selectors list
  function extractText(selectors: string[]): string {
    for (const selector of selectors) {
      // In normal browser environment
      const el = document.querySelector(selector);
      if (el) {
        const text = el.textContent?.trim();
        if (text) return text;
      }
    }
    return "";
  }

  // Helper to extract job insights (Employment Type, Experience, Skills)
  function parseJobInsights(): {
    employmentType: string;
    experienceLevel: string;
    skills: string[];
  } {
    const insights = document.querySelectorAll(
      ".jobs-unified-top-card__job-insight, .job-details-jobs-unified-top-card__job-insight, .description__job-criteria-text"
    );
    
    let employmentType = "";
    let experienceLevel = "";
    const skills: string[] = [];

    insights.forEach((insight) => {
      const text = insight.textContent?.trim() || "";
      
      if (text.includes("·")) {
        const parts = text.split("·").map((p) => p.trim());
        parts.forEach((part) => {
          const lower = part.toLowerCase();
          if (
            lower.includes("full-time") ||
            lower.includes("part-time") ||
            lower.includes("contract") ||
            lower.includes("temporary") ||
            lower.includes("internship")
          ) {
            employmentType = part;
          } else if (
            lower.includes("entry level") ||
            lower.includes("mid-senior") ||
            lower.includes("associate") ||
            lower.includes("director") ||
            lower.includes("executive") ||
            lower.includes("no experience")
          ) {
            experienceLevel = part;
          }
        });
      } else {
        const lower = text.toLowerCase();
        if (
          lower.includes("full-time") ||
          lower.includes("part-time") ||
          lower.includes("contract") ||
          lower.includes("temporary")
        ) {
          employmentType = text;
        } else if (
          lower.includes("entry level") ||
          lower.includes("mid-senior") ||
          lower.includes("associate") ||
          lower.includes("director") ||
          lower.includes("no experience")
        ) {
          experienceLevel = text;
        }
      }

      if (text.toLowerCase().includes("skills") || text.toLowerCase().includes("skills:")) {
        const cleanSkills = text.replace(/(Skills:|skills:)/i, "").trim();
        cleanSkills.split(",").forEach((skill) => {
          const trimmed = skill.trim();
          if (trimmed) skills.push(trimmed);
        });
      }
    });

    return { employmentType, experienceLevel, skills };
  }

  // Master scraper function extracting all 8 parameters
  function scrapeJobPage() {
    const title = extractText([
      ".job-details-jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title-link",
      "h1.t-24",
      ".jobs-search-jobs-unified-top-card__job-title-link",
      ".top-card-layout__title"
    ]);

    const company = extractText([
      ".jobs-unified-top-card__company-name",
      ".job-details-jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__company-name-link",
      ".jobs-unified-top-card__company-name a",
      ".topcard__org-name-link",
      ".top-card-layout__card .top-card-layout__first-subline a"
    ]);

    const location = extractText([
      ".jobs-unified-top-card__bullet",
      ".jobs-unified-top-card__bullet-point",
      ".job-details-jobs-unified-top-card__bullet",
      ".jobs-unified-top-card__bullet-point-container",
      ".topcard__flavor--bullet",
      ".top-card-layout__card .top-card-layout__first-subline span:nth-child(2)"
    ]);

    const description = extractText([
      "#job-details",
      ".jobs-description__content",
      ".jobs-description-content__text",
      ".jobs-box__html-content",
      ".description__text"
    ]);

    const insights = parseJobInsights();

    // Dynamically query for skills buttons if any exist on the page
    const skillsList: string[] = [...insights.skills];
    document.querySelectorAll(".app-shared-outline-pill").forEach((pill) => {
      const txt = pill.textContent?.trim();
      if (txt && !skillsList.includes(txt)) skillsList.push(txt);
    });

    return {
      jobTitle: title || "Unavailable",
      companyName: company || "Unavailable",
      jobLocation: location || "Unavailable",
      jobDescription: description || "Unavailable",
      employmentType: insights.employmentType || "Not Specified",
      experienceLevel: insights.experienceLevel || "Not Specified",
      skills: skillsList.length > 0 ? skillsList : ["Not Specified"],
      jobUrl: window.location.href
    };
  }

  // Set up event listeners and state
  const closeBtn = drawer.querySelector(".vh-close-btn");
  const saveBtn = drawer.querySelector("#vh-save-btn") as HTMLButtonElement | null;
  const resumeBtn = drawer.querySelector("#vh-resume-btn") as HTMLAnchorElement | null;
  const interviewBtn = drawer.querySelector("#vh-interview-btn") as HTMLAnchorElement | null;

  const realAiBtn = drawer.querySelector("#vh-real-ai-btn") as HTMLButtonElement | null;
  const demoPanel = drawer.querySelector("#vh-demo-panel") as HTMLDivElement | null;
  const aiPanel = drawer.querySelector("#vh-ai-panel") as HTMLDivElement | null;
  const upgradeCard = drawer.querySelector("#vh-ai-upgrade-card") as HTMLDivElement | null;
  const scoreTitleEl = drawer.querySelector("#vh-score-title") as HTMLSpanElement | null;
  const scoreTextEl = drawer.querySelector("#vh-score-text") as HTMLSpanElement | null;
  const scoreCaptionEl = drawer.querySelector("#vh-score-caption") as HTMLSpanElement | null;
  const badgeEl = drawer.querySelector("#vh-risk-badge") as HTMLSpanElement | null;
  const byokModal = drawer.querySelector("#vh-byok-modal") as HTMLDivElement | null;
  const demoBtn = drawer.querySelector("#vh-demo-mode-btn") as HTMLButtonElement | null;

  let activeAnalysisScore = 80;
  let activeAnalysisRisk = "LOW";

  const runAnalysisFetch = (scraped: any, isDemoMode: boolean) => {
    const titleEl = drawer.querySelector("#vh-job-title");
    const companyEl = drawer.querySelector("#vh-company-name");
    const locationEl = drawer.querySelector("#vh-job-location");
    const scoreTextEl = drawer.querySelector("#vh-score-text");
    const scoreTitleEl = drawer.querySelector("#vh-score-title");
    const badgeEl = drawer.querySelector("#vh-risk-badge");
    const explanationEl = drawer.querySelector("#vh-explanation-text");

    if (titleEl) titleEl.textContent = scraped.jobTitle;
    if (companyEl) companyEl.textContent = scraped.companyName;
    if (locationEl) locationEl.textContent = scraped.jobLocation;

    // Set loading indicator states
    if (scoreTextEl) {
      scoreTextEl.textContent = "...";
      scoreTextEl.className = "vh-score-value";
    }
    if (badgeEl) {
      badgeEl.textContent = "ANALYZING...";
      badgeEl.className = "vh-badge";
    }
    if (explanationEl) {
      explanationEl.textContent = "Connecting to AI analysis engine to calculate safety metrics...";
    }
    if (scoreTitleEl) {
      scoreTitleEl.textContent = isDemoMode ? "Demo Confidence Score" : "AI Trust Score";
    }
    if (scoreCaptionEl) {
      scoreCaptionEl.textContent = isDemoMode 
        ? "Generated from visible job signals — not AI analysis." 
        : "Calculated securely via connected AI provider.";
    }
    if (resumeBtn) resumeBtn.style.display = "none";
    if (interviewBtn) interviewBtn.style.display = "none";

    // 3. Trigger real backend AI audit request
    chrome.runtime.sendMessage(
      { type: "ANALYZE_JOB_DIRECT", data: scraped, isDemo: isDemoMode },
      (response) => {
        if (response && response.success) {
          const res = response.data;
          activeAnalysisScore = res.trustScore;
          activeAnalysisRisk = res.riskLevel || "LOW";

          // Update metrics elements
          if (scoreTextEl) {
            scoreTextEl.textContent = `${res.trustScore}/100`;
            scoreTextEl.className = `vh-score-value ${
              res.trustScore < 50 ? "high" : res.trustScore < 80 ? "medium" : ""
            }`;
          }
          if (badgeEl) {
            if (isDemoMode) {
              badgeEl.textContent = "🟡 Demo Analysis";
              badgeEl.className = "vh-badge demo";
            } else {
              badgeEl.textContent = `${activeAnalysisRisk} RISK`;
              badgeEl.className = `vh-badge ${
                activeAnalysisRisk === "HIGH" ? "high" : activeAnalysisRisk === "MEDIUM" ? "medium" : ""
              }`;
            }
          }
          if (explanationEl) {
            explanationEl.textContent = res.explanation || "Inspection completed successfully.";
          }

          // Populate and show the SaaS action buttons with query parameter tags
          if (resumeBtn) {
            resumeBtn.href = `${SAAS_URL}/resume?desc=${encodeURIComponent(scraped.jobDescription)}&isDemo=${isDemoMode}`;
            resumeBtn.style.display = "flex";
          }
          if (interviewBtn) {
            interviewBtn.href = `${SAAS_URL}/interview-prep?title=${encodeURIComponent(scraped.jobTitle)}&company=${encodeURIComponent(scraped.companyName)}&isDemo=${isDemoMode}`;
            interviewBtn.style.display = "flex";
          }
        } else {
          // If the server triggers a BYOK error block, display the overlay modal
          if (response && response.code === "BYOK_REQUIRED") {
            if (byokModal) byokModal.style.display = "flex";
          } else {
            if (explanationEl) {
              explanationEl.textContent = response?.error || "Connection to VeriHire local dev server failed. Please verify the web app is running on port 3000.";
            }
            if (badgeEl) {
              badgeEl.textContent = "OFFLINE";
              badgeEl.className = "vh-badge high";
            }
          }
        }
      }
    );
  };

  bubble.addEventListener("click", () => {
    const scraped = scrapeJobPage();

    // Reset modals and overlays
    if (byokModal) byokModal.style.display = "none";

    // Toggle saved button state depending on active job title
    if (saveBtn) {
      const jobKey = `${scraped.jobTitle}-${scraped.companyName}`;
      if (savedJobsList.includes(jobKey)) {
        saveBtn.textContent = "Job Saved";
        saveBtn.className = "vh-btn vh-btn-saved";
        saveBtn.disabled = true;
      } else {
        saveBtn.textContent = "Save Job Listing";
        saveBtn.className = "vh-btn";
        saveBtn.disabled = false;
      }
    }

    // Update metadata title card
    const titleEl = drawer.querySelector("#vh-job-title");
    const companyEl = drawer.querySelector("#vh-company-name");
    const locationEl = drawer.querySelector("#vh-job-location");
    if (titleEl) titleEl.textContent = scraped.jobTitle;
    if (companyEl) companyEl.textContent = scraped.companyName;
    if (locationEl) locationEl.textContent = scraped.jobLocation;

    // Calculate dynamic Demo Confidence Score & details from parsed job properties
    const demoData = calculateDemoConfidence(scraped);
    activeAnalysisScore = demoData.score;

    if (scoreTextEl) {
      scoreTextEl.textContent = `${demoData.score}/100`;
      scoreTextEl.className = "vh-score-value text-amber-500";
    }
    if (scoreTitleEl) {
      scoreTitleEl.textContent = "Demo Confidence Score";
    }
    if (scoreCaptionEl) {
      scoreCaptionEl.textContent = "Generated from visible job signals — not AI analysis.";
      scoreCaptionEl.style.display = "block";
    }
    if (badgeEl) {
      badgeEl.textContent = "🟡 Demo Analysis";
      badgeEl.className = "vh-badge demo";
    }

    // Populate checklist DOM structure dynamically
    const checklistContainer = drawer.querySelector("#vh-checklist-container");
    if (checklistContainer) {
      checklistContainer.innerHTML = "";
      demoData.checks.forEach((chk) => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.justifyContent = "space-between";
        row.style.fontSize = "11px";
        row.style.color = "#cbd5e1";
        row.style.padding = "2px 0";

        const labelSpan = document.createElement("span");
        labelSpan.textContent = chk.label;
        labelSpan.style.fontWeight = "600";

        const valSpan = document.createElement("span");
        valSpan.textContent = chk.value.length > 25 ? chk.value.slice(0, 22) + "..." : chk.value;
        valSpan.style.color = chk.pass ? "#10b981" : "#ef4444";
        valSpan.style.fontWeight = "500";
        valSpan.title = chk.value;

        row.appendChild(labelSpan);
        row.appendChild(valSpan);
        checklistContainer.appendChild(row);
      });
    }

    // Ensure Demo View panels are reset to active display
    if (demoPanel) demoPanel.style.display = "block";
    if (aiPanel) aiPanel.style.display = "none";
    if (upgradeCard) upgradeCard.style.display = "block";
    if (resumeBtn) resumeBtn.style.display = "none";
    if (interviewBtn) interviewBtn.style.display = "none";

    // Slide in the side drawer panel immediately
    drawer.classList.add("vh-open");
  });

  realAiBtn?.addEventListener("click", () => {
    const scraped = scrapeJobPage();

    // Check if the user has an AI provider configured in Postgres via background messages
    chrome.runtime.sendMessage({ type: "CHECK_AI_KEY_CONFIGURED" }, (response) => {
      if (response && response.configured) {
        // Upgrade display panels to real AI
        if (demoPanel) demoPanel.style.display = "none";
        if (upgradeCard) upgradeCard.style.display = "none";
        if (aiPanel) aiPanel.style.display = "block";

        runAnalysisFetch(scraped, false);
      } else {
        // Prompt Connect AI Provider modal overlay
        if (byokModal) byokModal.style.display = "flex";
      }
    });
  });

  demoBtn?.addEventListener("click", () => {
    if (byokModal) byokModal.style.display = "none";
  });

  closeBtn?.addEventListener("click", () => {
    drawer.classList.remove("vh-open");
  });

  saveBtn?.addEventListener("click", () => {
    const scraped = scrapeJobPage();
    const jobKey = `${scraped.jobTitle}-${scraped.companyName}`;
    
    if (!savedJobsList.includes(jobKey)) {
      if (saveBtn) {
        saveBtn.textContent = "Saving to Board...";
        saveBtn.disabled = true;
      }

      chrome.runtime.sendMessage(
        {
          type: "SAVE_JOB_DIRECT",
          data: {
            title: scraped.jobTitle,
            company: scraped.companyName,
            location: scraped.jobLocation,
            url: scraped.jobUrl,
            score: activeAnalysisScore,
            risk: activeAnalysisRisk,
            status: "SAVED"
          }
        },
        (response) => {
          if (response && response.success) {
            savedJobsList.push(jobKey);
            if (saveBtn) {
              saveBtn.textContent = "Job Saved";
              saveBtn.className = "vh-btn vh-btn-saved";
            }
            console.log("VeriHire: Saved job listing to database", scraped);
          } else {
            if (saveBtn) {
              saveBtn.textContent = "Save Failed";
              saveBtn.disabled = false;
              setTimeout(() => {
                saveBtn.textContent = "Save Job Listing";
              }, 2500);
            }
            console.error("VeriHire: Failed to save job listing", response?.error);
          }
        }
      );
    }
  });

  // Listener for messages from background script
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "EXTRACT_JOB_DETAILS") {
      try {
        const scraped = scrapeJobPage();
        sendResponse({
          success: true,
          data: scraped
        });
      } catch (err: any) {
        sendResponse({
          success: false,
          error: err.message || "Failed to extract page content."
        });
      }
    }
    return true;
  });
}

// Observe URL and DOM changes to inject UI when on a LinkedIn job details page
function handlePageUpdates() {
  const isJobPage = window.location.href.includes("linkedin.com/jobs");
  if (isJobPage) {
    injectFloatingUI();
  }
}

// Watch navigation updates in single page applications (like LinkedIn)
const mutationObserver = new MutationObserver(() => {
  handlePageUpdates();
});
mutationObserver.observe(document.body, { childList: true, subtree: true });

// Run initial evaluation on load
handlePageUpdates();

export {};
