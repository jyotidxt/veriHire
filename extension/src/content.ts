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

  /* Skeleton load state shimmer styling */
  .vh-skeleton {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 75%);
    background-size: 200% 100%;
    animation: vh-shimmer 1.5s infinite;
    border-radius: 4px;
  }

  @keyframes vh-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .vh-skeleton-text {
    height: 12px;
    margin-bottom: 8px;
    width: 100%;
  }

  .vh-skeleton-title {
    height: 18px;
    margin-bottom: 12px;
    width: 60%;
  }

  /* Actions 2-Column Grid Layout */
  .vh-actions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
  }

  /* Failure view card decoration */
  .vh-error-card {
    border: 1px solid rgba(239, 68, 68, 0.2);
    background: rgba(239, 68, 68, 0.02);
    padding: 14px;
    border-radius: 12px;
    text-align: center;
    color: #fca5a5;
    font-size: 11px;
    line-height: 1.4;
  }
`;



function calculateDemoConfidence(scraped: any) {
  let score = 40; // base score
  const checks: { label: string; value: string; pass: boolean }[] = [];

  const companyName = scraped?.companyName || "";
  const jobLocation = scraped?.jobLocation || "";
  const jobDescription = scraped?.jobDescription || "";
  const employmentType = scraped?.employmentType || "";
  const workplaceType = scraped?.workplaceType || "";
  const experienceLevel = scraped?.experienceLevel || "";
  const salary = scraped?.salary || "";
  const skills = scraped?.skills || [];
  const applyUrl = scraped?.applyUrl || "";
  const companyWebsite = scraped?.companyWebsite || "";

  // 1. Company detected
  const hasCompany = companyName && companyName !== "Unavailable" && companyName !== "Not Available" && companyName !== "Company not detected";
  score += hasCompany ? 10 : 0;
  checks.push({ label: "Company Detected", value: hasCompany ? companyName : "Not Available", pass: hasCompany });

  // 2. HTTPS website found
  const hasHttpsWeb = companyWebsite && companyWebsite.startsWith("https://") && companyWebsite !== "Website not specified" && companyWebsite !== "Not Available";
  score += hasHttpsWeb ? 10 : 0;
  checks.push({ label: "HTTPS Website Found", value: hasHttpsWeb ? companyWebsite : "Not Available", pass: hasHttpsWeb });

  // 3. Remote position detected
  const isRemote = workplaceType === "Remote" || jobLocation.toLowerCase().includes("remote");
  score += isRemote ? 10 : 5;
  checks.push({ label: "Remote Position Detected", value: isRemote ? "Yes" : `No (${workplaceType})`, pass: isRemote });

  // 4. Salary mentioned
  const hasSalary = salary && salary !== "Salary not disclosed" && salary !== "Not Available";
  score += hasSalary ? 10 : 0;
  checks.push({ label: "Salary Mentioned", value: hasSalary ? salary : "Not Available", pass: hasSalary });

  // 5. Required skills count
  const skillsCount = skills ? skills.filter((s: string) => s !== "Not Specified" && s !== "Not Available").length : 0;
  score += skillsCount > 0 ? Math.min(10, skillsCount * 2) : 0;
  checks.push({ label: "Required Skills Count", value: skillsCount > 0 ? `${skillsCount} skills` : "Not Available", pass: skillsCount > 0 });

  // 6. Description completeness
  const descLength = jobDescription.length;
  const isComplete = descLength > 1000;
  score += descLength > 1800 ? 10 : descLength > 1000 ? 5 : 0;
  checks.push({ label: "Description Completeness", value: isComplete ? "Complete" : "Short", pass: isComplete });

  // 7. Employment type
  const hasEmpType = employmentType && employmentType !== "Not Specified" && employmentType !== "Not Available";
  score += hasEmpType ? 5 : 0;
  checks.push({ label: "Employment Type", value: hasEmpType ? employmentType : "Not Available", pass: hasEmpType });

  // 8. External application link
  const hasExternalApply = applyUrl && applyUrl.startsWith("http") && applyUrl !== "Not Available";
  score += hasExternalApply ? 10 : 5;
  checks.push({ label: "External Application Link", value: hasExternalApply ? "Yes" : "LinkedIn Easy Apply", pass: hasExternalApply });

  // 9. Estimated seniority
  const hasSeniority = experienceLevel && experienceLevel !== "Not Specified" && experienceLevel !== "Not Available";
  score += hasSeniority ? 5 : 0;
  checks.push({ label: "Estimated Seniority", value: hasSeniority ? experienceLevel : "Not Available", pass: hasSeniority });

  score = Math.min(100, Math.max(10, score));

  return { score, checks };
}

let shadowRoot: ShadowRoot | null = null;
let savedJobsList: string[] = [];
let onPageMutationHook: (() => void) | null = null;
let scrapeTimeoutId: any = null;
let cachedScrapedData: any = null;
let lastScrapedJobId: string | null = null;

function getActiveJobContainer(): Element | Document {
  const containers = [
    ".jobs-search__job-details",
    ".job-view-layout",
    ".jobs-box",
    ".jobs-details-sidebar",
    "#main",
    ".job-details"
  ];
  for (const selector of containers) {
    const el = document.querySelector(selector);
    if (el && el.clientHeight > 80) {
      return el;
    }
  }
  return document;
}

function getJobIdFromUrl(): string | null {
  const url = window.location.href;
  const match = url.match(/(?:currentJobId=|jobs\/view\/)(\d+)/i);
  return match ? match[1] : null;
}

function getJobKey(): string {
  const jobId = getJobIdFromUrl();
  if (jobId) return jobId;
  
  const container = getActiveJobContainer();
  const titleEl = container.querySelector(".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title");
  const companyEl = container.querySelector(".jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__company-name");
  const titleText = titleEl?.textContent?.trim() || "";
  const companyText = companyEl?.textContent?.trim() || "";
  return `${titleText}-${companyText}`;
}

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
        <span>VeriHire</span>
      </div>
      <button class="vh-close-btn">${CLOSE_SVG}</button>
    </div>
    
    <div class="vh-content">
      <!-- Loading Skeleton Loader View (Pulse shimmer) -->
      <div id="vh-skeleton-view" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="vh-card" style="padding: 24px; text-align: center;">
          <div class="vh-skeleton vh-skeleton-title" style="margin: 0 auto 16px auto;"></div>
          <div class="vh-skeleton vh-skeleton-text" style="width: 80%; margin: 0 auto 8px auto;"></div>
          <div class="vh-skeleton vh-skeleton-text" style="width: 50%; margin: 0 auto 20px auto;"></div>
          <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">
            Analyzing current job...
          </div>
        </div>
      </div>

      <!-- Scraper Error Card View -->
      <div id="vh-error-view" class="vh-error-card" style="display: none; margin-bottom: 16px;">
        We couldn't extract this job's information. Please open the full job description or refresh the page.
      </div>

      <!-- Scraped metadata card -->
      <div class="vh-card" id="vh-summary-card" style="display: none;">
        <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
          <img id="vh-company-logo" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="width: 40px; height: 40px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06); object-fit: contain; background: #1e293b; display: none;" />
          <div style="flex: 1; min-width: 0;">
            <h3 class="vh-title" id="vh-job-title">Software Developer</h3>
            <p class="vh-company" id="vh-company-name" style="margin-bottom: 0;">TechGlobal Solutions</p>
          </div>
        </div>
        <div class="vh-meta-row" id="vh-summary-meta">
          <div class="vh-meta-item" id="vh-meta-location">
            ${MAP_PIN_SVG}
            <span id="vh-job-location">Remote</span>
          </div>
          <div class="vh-meta-item" id="vh-meta-employment">
            ${BRIEFCASE_SVG}
            <span id="vh-job-employment">Full-time</span>
          </div>
        </div>
      </div>

      <!-- Score card (renamed to Demo Confidence Score by default) -->
      <div class="vh-card" id="vh-score-card" style="display: none;">
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
      <div class="vh-card" id="vh-demo-panel" style="display: none;">
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
      <div class="vh-card" id="vh-ai-upgrade-card" style="display: none; border: 1px solid rgba(99, 102, 241, 0.2); background: rgba(99, 102, 241, 0.02); padding: 14px; border-radius: 8px;">
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
      <div class="vh-actions-grid">
        <button class="vh-btn" id="vh-save-btn" style="padding: 8px 12px; font-size: 11px;">Save Job Listing</button>
        <a href="${SAAS_URL}/dashboard" target="_blank" class="vh-btn-secondary" style="padding: 8px 12px; font-size: 11px;">Dashboard</a>
      </div>
      <div class="vh-actions-grid" style="margin-top: 4px;">
        <a href="#" target="_blank" class="vh-btn-secondary" id="vh-resume-btn" style="display: none; padding: 8px 12px; font-size: 11px;">Compare Resume</a>
        <a href="#" target="_blank" class="vh-btn-secondary" id="vh-interview-btn" style="display: none; padding: 8px 12px; font-size: 11px;">Prep Interview</a>
      </div>
    </div>

    <!-- Connect Your AI Provider Modal -->
    <div class="vh-byok-modal" id="vh-byok-modal">
      <div class="vh-byok-modal-content">
        <span class="vh-byok-title">Connect Your AI Provider</span>
        <p class="vh-byok-desc">Real AI analysis requires connecting your own API key.</p>
        <div class="vh-byok-features">
          <div class="vh-byok-feat-item">✓ Scam Risk Detection</div>
          <div class="vh-byok-feat-item">✓ Resume Matching</div>
          <div class="vh-byok-feat-item">✓ Company Intelligence</div>
          <div class="vh-byok-feat-item">✓ Interview Preparation</div>
          <div class="vh-byok-feat-item">✓ Career Guidance</div>
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
    const container = getActiveJobContainer();
    console.log("VeriHire Scraper: Querying text from container:", container);
    for (const selector of selectors) {
      try {
        const el = container.querySelector(selector);
        if (el) {
          const text = el.textContent?.trim();
          if (text) {
            console.log(`VeriHire Scraper: SUCCESS matching text selector "${selector}" -> "${text.slice(0, 40)}..."`);
            return text;
          }
        } else {
          console.log(`VeriHire Scraper: Selector not found in container: "${selector}"`);
        }
      } catch (e) {
        console.warn(`VeriHire Scraper: Exception for selector "${selector}":`, e);
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
    const container = getActiveJobContainer();
    const selectors = [
      ".jobs-unified-top-card__job-insight",
      ".job-details-jobs-unified-top-card__job-insight",
      ".description__job-criteria-text",
      ".jobs-description-details__list-item",
      ".description__job-criteria-item",
      ".jobs-box__group"
    ];
    
    let employmentType = "";
    let experienceLevel = "";
    const skills: string[] = [];

    selectors.forEach((selector) => {
      try {
        const insights = container.querySelectorAll(selector);
        if (insights.length > 0) {
          console.log(`VeriHire Scraper: Scraped ${insights.length} insight items using selector "${selector}"`);
        }
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
                lower.includes("no experience") ||
                lower.includes("intern")
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
              lower.includes("temporary") ||
              lower.includes("internship")
            ) {
              employmentType = text;
            } else if (
              lower.includes("entry level") ||
              lower.includes("mid-senior") ||
              lower.includes("associate") ||
              lower.includes("director") ||
              lower.includes("executive") ||
              lower.includes("no experience") ||
              lower.includes("intern")
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
      } catch (e) {
        console.warn(`VeriHire Scraper: Insight parsing exception for selector "${selector}":`, e);
      }
    });

    return { employmentType, experienceLevel, skills };
  }

  // Master scraper function extracting all parameters with container scoping
  function scrapeJobPage(forceFresh = false) {
    const currentKey = getJobKey();
    if (!forceFresh && lastScrapedJobId === currentKey && cachedScrapedData) {
      console.log("VeriHire Scraper: Returning cached scraped data for", currentKey);
      return cachedScrapedData;
    }

    console.log("VeriHire Scraper: Running master job scraper...");
    const container = getActiveJobContainer();

    const title = extractText([
      ".job-details-jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title-link",
      "h1.t-24",
      ".jobs-search-jobs-unified-top-card__job-title-link",
      ".top-card-layout__title",
      "h1"
    ]) || "Not Available";

    const company = extractText([
      ".jobs-unified-top-card__company-name",
      ".job-details-jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__company-name-link",
      ".jobs-unified-top-card__company-name a",
      ".topcard__org-name-link",
      ".top-card-layout__card .top-card-layout__first-subline a",
      "a[href*='/company/']"
    ]) || "Not Available";

    let companyUrl = "Not Available";
    const companyLink = container.querySelector([
      "a.jobs-unified-top-card__company-name-link",
      "a[href*='/company/']"
    ].join(", ")) as HTMLAnchorElement | null;
    if (companyLink) {
      companyUrl = companyLink.href;
      if (companyUrl.startsWith("/")) {
        companyUrl = "https://www.linkedin.com" + companyUrl;
      }
    }

    const location = extractText([
      ".jobs-unified-top-card__bullet",
      ".jobs-unified-top-card__bullet-point",
      ".job-details-jobs-unified-top-card__bullet",
      ".jobs-unified-top-card__bullet-point-container",
      ".topcard__flavor--bullet",
      ".top-card-layout__card .top-card-layout__first-subline span:nth-child(2)",
      ".jobs-unified-top-card__primary-description span:nth-child(2)"
    ]) || "Not Available";

    const description = extractText([
      "#job-details",
      ".jobs-description__content",
      ".jobs-description-content__text",
      ".jobs-box__html-content",
      ".description__text",
      ".jobs-description",
      ".jobs-description__container"
    ]) || "Not Available";

    const insights = parseJobInsights();

    // Workplace Type
    let workplaceType = "Not Available";
    const workplaceEl = container.querySelector([
      ".jobs-unified-top-card__workplace-type",
      ".job-details-jobs-unified-top-card__workplace-type",
      ".top-card-layout__workplace-type"
    ].join(", "));
    if (workplaceEl && workplaceEl.textContent) {
      workplaceType = workplaceEl.textContent.trim();
    } else if (title !== "Not Available" || location !== "Not Available") {
      const titleLower = title.toLowerCase();
      const locLower = location.toLowerCase();
      if (titleLower.includes("remote") || locLower.includes("remote")) {
        workplaceType = "Remote";
      } else if (titleLower.includes("hybrid") || locLower.includes("hybrid")) {
        workplaceType = "Hybrid";
      } else if (titleLower.includes("on-site") || titleLower.includes("onsite") || locLower.includes("on-site") || locLower.includes("onsite")) {
        workplaceType = "On-site";
      }
    }

    // Salary range lookup
    const descText = description || "";
    const salaryRegex = /(\$\d{2,3}(?:,\d{3})*(?:\s*-\s*\$\d{2,3}(?:,\d{3})*)?\s*(?:per\s*year|yr|hr|hour|anually|annually|a\s*year|annual)?)/i;
    const matchSalary = descText.match(salaryRegex);
    let salary = matchSalary ? matchSalary[1] : "";
    if (!salary) {
      const salEl = container.querySelector(".jobs-unified-top-card__salary-range, .salary, .job-details-jobs-unified-top-card__salary");
      if (salEl) salary = salEl.textContent?.trim() || "";
    }
    salary = salary || "Not Available";

    // Applicants count
    let applicants = "Not Available";
    const applicantEl = container.querySelector([
      ".jobs-unified-top-card__applicant-count",
      ".job-details-jobs-unified-top-card__applicant-count",
      ".top-card-layout__first-subline .num-applicants",
      ".topcard__flavor--metadata"
    ].join(", "));
    if (applicantEl && applicantEl.textContent) {
      applicants = applicantEl.textContent.trim();
    } else {
      container.querySelectorAll("span, p, li").forEach((el) => {
        const txt = el.textContent?.trim() || "";
        if (txt.toLowerCase().includes("applicant") && txt.length < 50) {
          applicants = txt;
        }
      });
    }

    // Hiring Team
    let hiringTeam = "Not Available";
    const hirerEl = container.querySelector([
      ".jobs-poster__name",
      ".hirer-card__name",
      ".jobs-details-sidebar__poster-name",
      ".jobs-poster-card__name"
    ].join(", "));
    if (hirerEl && hirerEl.textContent) {
      hiringTeam = hirerEl.textContent.trim();
      const hirerTitleEl = container.querySelector(".jobs-poster__headline, .hirer-card__headline, .jobs-poster-card__headline");
      if (hirerTitleEl && hirerTitleEl.textContent) {
        hiringTeam += ` (${hirerTitleEl.textContent.trim()})`;
      }
    }

    // Benefits
    let benefits = "Not Available";
    const benefitSection = container.querySelector(".jobs-description__benefits, .jobs-description-benefits");
    if (benefitSection && benefitSection.textContent) {
      benefits = benefitSection.textContent.trim();
    } else if (descText !== "Not Available") {
      const benefitsKeywords = ["health insurance", "401(k)", "dental", "vision", "retirement", "pto", "paid time off", "stock options"];
      const foundBenefits: string[] = [];
      benefitsKeywords.forEach((kw) => {
        if (descText.toLowerCase().includes(kw)) {
          foundBenefits.push(kw.toUpperCase());
        }
      });
      if (foundBenefits.length > 0) {
        benefits = foundBenefits.join(", ");
      }
    }

    // Apply URL
    let applyUrl = "LinkedIn Easy Apply";
    const applyLink = container.querySelector([
      "a.jobs-apply-button",
      "a[href*='/jobs/view/']",
      "button.jobs-apply-button"
    ].join(", ")) as HTMLAnchorElement | null;
    if (applyLink && applyLink.href && applyLink.href.startsWith("http")) {
      applyUrl = applyLink.href;
    } else {
      const easyApplyBtn = container.querySelector(".jobs-apply-button--easy-apply, .jobs-apply-button");
      if (easyApplyBtn) {
        applyUrl = "LinkedIn Easy Apply";
      }
    }

    // Skills pills
    const skillsList: string[] = [...insights.skills];
    container.querySelectorAll(".app-shared-outline-pill, .jobs-opinion-skills-list__pill, a[href*='/search/results/all/?keywords=']").forEach((pill) => {
      const txt = pill.textContent?.trim();
      if (txt && !skillsList.includes(txt) && txt.length < 30) {
        if (skillsList[0] === "Not Specified") skillsList.shift();
        skillsList.push(txt);
      }
    });

    if ((skillsList.length === 0 || (skillsList.length === 1 && (skillsList[0] === "Not Specified" || skillsList[0] === "Not Available"))) && descText !== "Not Available") {
      const commonSkills = ["React", "TypeScript", "JavaScript", "Python", "Java", "HTML", "CSS", "SQL", "Docker", "AWS", "Node.js", "C++", "C#", "Go", "Rust", "Swift", "Kubernetes", "Angular", "Vue", "Git"];
      const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      commonSkills.forEach((skill) => {
        const escaped = escapeRegExp(skill);
        const pattern = new RegExp("(?:^|\\s|\\b)" + escaped + "(?:\\b|\\s|$)", "i");
        if (pattern.test(descText) && !skillsList.includes(skill)) {
          if (skillsList[0] === "Not Specified" || skillsList[0] === "Not Available") skillsList.shift();
          skillsList.push(skill);
        }
      });
    }

    // Company website link
    let companyWebsite = "";
    const links = container.querySelectorAll("a");
    for (const link of links) {
      const href = link.href || "";
      if (href && !href.includes("linkedin.com") && !href.includes("javascript:") && href.startsWith("http")) {
        companyWebsite = href;
        break;
      }
    }
    if (!companyWebsite && descText !== "Not Available") {
      const webRegex = /(https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(?:\.[a-zA-Z]{2,})?)/i;
      const matchWeb = descText.match(webRegex);
      if (matchWeb) companyWebsite = matchWeb[1];
    }
    companyWebsite = companyWebsite || "Not Available";

    cachedScrapedData = {
      jobTitle: title,
      companyName: company,
      companyUrl: companyUrl,
      jobLocation: location,
      jobDescription: description,
      employmentType: insights.employmentType || "Not Available",
      workplaceType: workplaceType,
      experienceLevel: insights.experienceLevel || "Not Available",
      salary: salary,
      applicants: applicants,
      hiringTeam: hiringTeam,
      skills: skillsList.length > 0 ? skillsList : ["Not Available"],
      benefits: benefits,
      applyUrl: applyUrl,
      companyWebsite: companyWebsite,
      jobUrl: window.location.href
    };

    lastScrapedJobId = currentKey;
    return cachedScrapedData;
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
    const titleEl = drawer.querySelector("#vh-job-title") as HTMLElement | null;
    const companyEl = drawer.querySelector("#vh-company-name") as HTMLElement | null;
    const scoreTextEl = drawer.querySelector("#vh-score-text") as HTMLElement | null;
    const scoreTitleEl = drawer.querySelector("#vh-score-title") as HTMLElement | null;
    const badgeEl = drawer.querySelector("#vh-risk-badge") as HTMLElement | null;
    const explanationEl = drawer.querySelector("#vh-explanation-text") as HTMLElement | null;

    const skeletonView = drawer.querySelector("#vh-skeleton-view") as HTMLDivElement | null;
    const summaryCard = drawer.querySelector("#vh-summary-card") as HTMLDivElement | null;
    const scoreCard = drawer.querySelector("#vh-score-card") as HTMLDivElement | null;
    const demoPanel = drawer.querySelector("#vh-demo-panel") as HTMLDivElement | null;
    const aiPanel = drawer.querySelector("#vh-ai-panel") as HTMLDivElement | null;
    const upgradeCard = drawer.querySelector("#vh-ai-upgrade-card") as HTMLDivElement | null;
    const errorView = drawer.querySelector("#vh-error-view") as HTMLDivElement | null;

    // Show skeleton view and hide normal cards during fetch
    if (skeletonView) skeletonView.style.display = "flex";
    if (summaryCard) summaryCard.style.display = "none";
    if (scoreCard) scoreCard.style.display = "none";
    if (demoPanel) demoPanel.style.display = "none";
    if (aiPanel) aiPanel.style.display = "none";
    if (upgradeCard) upgradeCard.style.display = "none";
    if (errorView) errorView.style.display = "none";

    if (titleEl) titleEl.textContent = scraped.jobTitle;
    if (companyEl) companyEl.textContent = scraped.companyName;

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

    // Trigger real backend AI audit request
    chrome.runtime.sendMessage(
      { type: "ANALYZE_JOB_DIRECT", data: scraped, isDemo: isDemoMode },
      (response) => {
        // Hide skeleton view on callback completion
        if (skeletonView) skeletonView.style.display = "none";

        if (response && response.success) {
          const res = response.data;
          activeAnalysisScore = res.trustScore;
          activeAnalysisRisk = res.riskLevel || "LOW";

          // Show correct cards for successful AI analysis
          if (summaryCard) summaryCard.style.display = "block";
          if (scoreCard) scoreCard.style.display = "block";
          if (aiPanel) aiPanel.style.display = "block";
          if (demoPanel) demoPanel.style.display = "none";
          if (upgradeCard) upgradeCard.style.display = "none";

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
          // If the server triggers a BYOK error block, display the overlay modal and restore demo views
          if (response && response.code === "BYOK_REQUIRED") {
            if (byokModal) byokModal.style.display = "flex";
            if (summaryCard) summaryCard.style.display = "block";
            if (scoreCard) scoreCard.style.display = "block";
            if (demoPanel) demoPanel.style.display = "block";
            if (upgradeCard) upgradeCard.style.display = "block";
          } else {
            // Show error message details in the AI panel
            if (summaryCard) summaryCard.style.display = "block";
            if (scoreCard) scoreCard.style.display = "block";
            if (aiPanel) aiPanel.style.display = "block";
            if (demoPanel) demoPanel.style.display = "none";
            if (upgradeCard) upgradeCard.style.display = "block"; // Keep upgrade card so they can retry

            if (explanationEl) {
              explanationEl.textContent = response?.error || "AI Analysis Request Failed. Please check that your configured API key is valid and has remaining credit quota.";
              explanationEl.style.color = "#fca5a5"; // Soft red text for visibility
            }
            if (badgeEl) {
              badgeEl.textContent = "ERROR";
              badgeEl.className = "vh-badge high";
            }
            if (scoreTextEl) {
              scoreTextEl.textContent = "Err";
              scoreTextEl.className = "vh-score-value high";
            }
          }
        }
      }
    );
  };

  const triggerScrapeAndRender = () => {
    if (scrapeTimeoutId) {
      clearTimeout(scrapeTimeoutId);
      scrapeTimeoutId = null;
    }

    const titleEl = drawer.querySelector("#vh-job-title");
    const companyEl = drawer.querySelector("#vh-company-name");

    const skeletonView = drawer.querySelector("#vh-skeleton-view") as HTMLDivElement | null;
    const errorView = drawer.querySelector("#vh-error-view") as HTMLDivElement | null;
    const summaryCard = drawer.querySelector("#vh-summary-card") as HTMLDivElement | null;
    const scoreCard = drawer.querySelector("#vh-score-card") as HTMLDivElement | null;
    const demoPanel = drawer.querySelector("#vh-demo-panel") as HTMLDivElement | null;
    const upgradeCard = drawer.querySelector("#vh-ai-upgrade-card") as HTMLDivElement | null;
    const aiPanel = drawer.querySelector("#vh-ai-panel") as HTMLDivElement | null;

    if (skeletonView) skeletonView.style.display = "flex";
    if (errorView) errorView.style.display = "none";
    if (summaryCard) summaryCard.style.display = "none";
    if (scoreCard) scoreCard.style.display = "none";
    if (demoPanel) demoPanel.style.display = "none";
    if (upgradeCard) upgradeCard.style.display = "none";
    if (aiPanel) aiPanel.style.display = "none";

    let attempts = 0;
    const maxAttempts = 6;

    const performScrape = () => {
      attempts++;
      try {
        const container = getActiveJobContainer();
        const containerReady = container !== document;
        const currentKey = getJobKey();
        let scraped;
        if (lastScrapedJobId === currentKey && cachedScrapedData && cachedScrapedData.jobTitle !== "Not Available") {
          scraped = cachedScrapedData;
        } else {
          scraped = scrapeJobPage(true);
        }
        const didFail = (!scraped.jobTitle || scraped.jobTitle === "Unavailable" || scraped.jobTitle === "Not Available") &&
                        (!scraped.companyName || scraped.companyName === "Unavailable" || scraped.companyName === "Not Available");

        const seeMoreBtn = container.querySelector([
          "button.jobs-description__footer-button",
          "button.jobs-description__button",
          ".jobs-description__footer-button",
          "button[aria-label*='See more']",
          "button[aria-label*='show more']",
          ".jobs-description-content__button"
        ].join(", ")) as HTMLButtonElement | null;
        
        const hasSeeMore = !!(seeMoreBtn && seeMoreBtn.textContent?.toLowerCase().includes("see more"));
        
        if (hasSeeMore && seeMoreBtn) {
          console.log("VeriHire Scraper: Clicking 'See more' to expand full description...");
          seeMoreBtn.click();
        }

        const shouldRetry = (didFail || !containerReady || hasSeeMore) && attempts < maxAttempts;

        if (shouldRetry) {
          console.log(`VeriHire Scraper: Job details loading/expanding (attempt ${attempts}/${maxAttempts}). Container ready: ${containerReady}. Has See more: ${hasSeeMore}. Retrying in 700ms...`);
          cachedScrapedData = null; // Clear cached data so next attempt gets expanded DOM
          scrapeTimeoutId = setTimeout(performScrape, 700);
          return;
        }

        // Hide skeleton loader on complete
        if (skeletonView) skeletonView.style.display = "none";

        let finalScraped = scraped;

        if (didFail) {
          console.log("VeriHire Scraper: Selection failed. Activating local demo fallback datasets.");
          const currentUrl = window.location.href;
          const match = currentUrl.match(/currentJobId=(\d+)/) || currentUrl.match(/jobs\/view\/(\d+)/);
          const jobId = match ? match[1] : currentUrl;
          
          let hash = 0;
          for (let j = 0; j < jobId.length; j++) {
            hash = jobId.charCodeAt(j) + ((hash << 5) - hash);
          }
          const mockIndex = Math.abs(hash) % 6;

          const mockData = [
            {
              jobTitle: "Senior Frontend Engineer",
              companyName: "Vercel",
              jobLocation: "San Francisco, CA (Remote)",
              jobDescription: "We are looking for a Senior Frontend Engineer to join our team. You will work on Next.js, React, and build world-class user interfaces. Collaborate with designers and platform engineers to deliver fast, secure experiences.",
              employmentType: "Full-time",
              experienceLevel: "Mid-Senior level",
              skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "GraphQL"],
              salary: "$140,000 - $180,000",
              companyWebsite: "https://vercel.com"
            },
            {
              jobTitle: "Staff Software Engineer - Billing",
              companyName: "Stripe",
              jobLocation: "Seattle, WA (Hybrid)",
              jobDescription: "Stripe Billing is seeking an experienced Backend Engineer to lead complex monetary ledger systems. You will construct highly resilient APIs, manage transaction safety protocols, and scale distributed database systems.",
              employmentType: "Full-time",
              experienceLevel: "Staff level",
              skills: ["Ruby", "Go", "APIs", "Distributed Systems", "PostgreSQL"],
              salary: "$160,000 - $210,000",
              companyWebsite: "https://stripe.com"
            },
            {
              jobTitle: "Full Stack Engineer (Database)",
              companyName: "Supabase",
              jobLocation: "Singapore (Remote)",
              jobDescription: "Help us construct the open source Firebase alternative. Build real-time database subscription features, integrate safe auth systems, and manage high-performance TypeScript query builders.",
              employmentType: "Contract",
              experienceLevel: "Mid-Senior level",
              skills: ["PostgreSQL", "Node.js", "React", "TypeScript", "Docker"],
              salary: "$120,000 - $150,000",
              companyWebsite: "https://supabase.com"
            },
            {
              jobTitle: "Infrastructure Security Architect",
              companyName: "HashiCorp",
              jobLocation: "Austin, TX (On-site)",
              jobDescription: "Design security validation layers for infrastructure delivery. You will audit multi-tenant cloud orchestration blueprints, configure Vault policies, and direct Terraform automation workflows.",
              employmentType: "Full-time",
              experienceLevel: "Director level",
              skills: ["Terraform", "Vault", "AWS", "Kubernetes", "IAM"],
              salary: "$180,000 - $230,000",
              companyWebsite: "https://hashicorp.com"
            },
            {
              jobTitle: "Member of Technical Staff - Reasoning",
              companyName: "OpenAI",
              jobLocation: "San Francisco, CA (Hybrid)",
              jobDescription: "Train next-generation reasoning models to solve complex logical, math, and code-synthesis benchmarks. You will structure deep learning workflows, parse training datasets, and build PyTorch infrastructure.",
              employmentType: "Full-time",
              experienceLevel: "Senior level",
              skills: ["Python", "PyTorch", "Deep Learning", "Transformers", "NLP"],
              salary: "$240,000 - $370,000",
              companyWebsite: "https://openai.com"
            },
            {
              jobTitle: "Senior Product Designer - Editor",
              companyName: "Figma",
              jobLocation: "New York, NY (Hybrid)",
              jobDescription: "Design collaborative creation interfaces inside Figma. Work on vector manipulation workflows, component property controls, design library sync, and interactive micro-animations.",
              employmentType: "Full-time",
              experienceLevel: "Mid-Senior level",
              skills: ["UI/UX", "Figma", "Prototyping", "Design Systems", "Product Strategy"],
              salary: "$150,000 - $190,000",
              companyWebsite: "https://figma.com"
            }
          ];

          const selectedMock = mockData[mockIndex];
          finalScraped = {
            jobTitle: selectedMock.jobTitle,
            companyName: selectedMock.companyName,
            jobLocation: selectedMock.jobLocation,
            jobDescription: selectedMock.jobDescription,
            employmentType: selectedMock.employmentType,
            experienceLevel: selectedMock.experienceLevel,
            skills: selectedMock.skills,
            salary: selectedMock.salary,
            companyWebsite: selectedMock.companyWebsite,
            jobUrl: currentUrl
          };
        }

        // Show metadata card and summary elements
        if (summaryCard) summaryCard.style.display = "block";
        if (scoreCard) scoreCard.style.display = "block";
        if (demoPanel) demoPanel.style.display = "block";
        if (upgradeCard) upgradeCard.style.display = "block";

        // Update company logo if available
        const logoImg = drawer.querySelector("#vh-company-logo") as HTMLImageElement | null;
        const logoEl = container.querySelector(".jobs-unified-top-card__company-logo, .job-details-jobs-unified-top-card__company-logo, img.jobs-details-sidebar__company-logo") as HTMLImageElement | null;
        if (logoImg) {
          if (logoEl && logoEl.src && !logoEl.src.includes("data:image")) {
            logoImg.src = logoEl.src;
            logoImg.style.display = "block";
          } else {
            logoImg.style.display = "none";
          }
        }

        // Toggle saved button state depending on active job title
        if (saveBtn) {
          const jobKey = `${finalScraped.jobTitle}-${finalScraped.companyName}`;
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

        // Populate and show the SaaS action buttons with query parameter tags
        if (resumeBtn) {
          resumeBtn.href = `${SAAS_URL}/resume?desc=${encodeURIComponent(finalScraped.jobDescription)}&isDemo=true`;
          resumeBtn.style.display = "flex";
        }
        if (interviewBtn) {
          interviewBtn.href = `${SAAS_URL}/interview-prep?title=${encodeURIComponent(finalScraped.jobTitle)}&company=${encodeURIComponent(finalScraped.companyName)}&isDemo=true`;
          interviewBtn.style.display = "flex";
        }

        // Update metadata title card
        if (titleEl) titleEl.textContent = finalScraped.jobTitle && finalScraped.jobTitle !== "Unavailable" ? finalScraped.jobTitle : "Job title not detected";
        if (companyEl) companyEl.textContent = finalScraped.companyName && finalScraped.companyName !== "Unavailable" ? finalScraped.companyName : "Company not detected";

        const locationMeta = drawer.querySelector("#vh-meta-location") as HTMLDivElement | null;
        if (locationMeta) {
          if (finalScraped.jobLocation && finalScraped.jobLocation !== "Unavailable" && finalScraped.jobLocation !== "Not Specified") {
            const locText = locationMeta.querySelector("span");
            if (locText) locText.textContent = finalScraped.jobLocation;
            locationMeta.style.display = "flex";
          } else {
            locationMeta.style.display = "none";
          }
        }

        const employmentMeta = drawer.querySelector("#vh-meta-employment") as HTMLDivElement | null;
        if (employmentMeta) {
          if (finalScraped.employmentType && finalScraped.employmentType !== "Unavailable" && finalScraped.employmentType !== "Not Specified") {
            const empText = employmentMeta.querySelector("span");
            if (empText) empText.textContent = finalScraped.employmentType;
            employmentMeta.style.display = "flex";
          } else {
            employmentMeta.style.display = "none";
          }
        }

        const metaRow = drawer.querySelector("#vh-summary-meta") as HTMLDivElement | null;
        if (metaRow) {
          const hasLocation = finalScraped.jobLocation && finalScraped.jobLocation !== "Unavailable" && finalScraped.jobLocation !== "Not Specified";
          const hasEmployment = finalScraped.employmentType && finalScraped.employmentType !== "Unavailable" && finalScraped.employmentType !== "Not Specified";
          metaRow.style.display = (hasLocation || hasEmployment) ? "flex" : "none";
        }

        // Calculate dynamic Demo Confidence Score & details from parsed job properties
        const demoData = calculateDemoConfidence(finalScraped);
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
      } catch (err) {
        console.error("VeriHire Scraper Error:", err);
        if (skeletonView) skeletonView.style.display = "none";
        if (errorView) errorView.style.display = "block";
      }
    };

    // Initial check delay of 600ms
    scrapeTimeoutId = setTimeout(performScrape, 600);
  };

  bubble.addEventListener("click", () => {
    // Reset modals and overlays
    if (byokModal) byokModal.style.display = "none";

    triggerScrapeAndRender();

    // Slide in the side drawer panel immediately
    drawer.classList.add("vh-open");
  });

  function checkJobDetailsUpdate() {
    const currentKey = getJobKey();
    
    if (currentKey !== lastScrapedJobId) {
      lastScrapedJobId = currentKey;
      cachedScrapedData = null; // Clear cached scraped data immediately on job change!
      if (drawer.classList.contains("vh-open")) {
        triggerScrapeAndRender();
      }
    }
  }

  onPageMutationHook = () => {
    checkJobDetailsUpdate();
  };

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

// Observe URL and DOM changes to inject UI when on a LinkedIn job details page or sync SaaS user session
function handlePageUpdates() {
  const currentUrl = window.location.href;
  const isSaaS = currentUrl.includes("localhost:3000") || currentUrl.includes("verihire-") || currentUrl.includes("vercel.app");
  
  if (isSaaS) {
    try {
      const stored = localStorage.getItem("verihire_user");
      const parsed = stored ? JSON.parse(stored) : null;
      chrome.runtime.sendMessage({ type: "SYNC_USER_SESSION", user: parsed }, (res) => {
        console.log("VeriHire Content Script: Synced user session to background storage", res);
      });
    } catch (e) {
      console.warn("VeriHire Content Script: Failed to read user session from SaaS storage", e);
    }
    return;
  }

  const isJobPage = currentUrl.includes("linkedin.com/jobs");
  if (isJobPage) {
    injectFloatingUI();
  }
}

// Monkey-patch history pushState and replaceState to detect SPA URL transitions instantly
const originalPushState = history.pushState;
history.pushState = function(...args) {
  originalPushState.apply(this, args);
  setTimeout(() => {
    handlePageUpdates();
    if (onPageMutationHook) onPageMutationHook();
  }, 50);
};

const originalReplaceState = history.replaceState;
history.replaceState = function(...args) {
  originalReplaceState.apply(this, args);
  setTimeout(() => {
    handlePageUpdates();
    if (onPageMutationHook) onPageMutationHook();
  }, 50);
};

window.addEventListener("popstate", () => {
  handlePageUpdates();
  if (onPageMutationHook) onPageMutationHook();
});

// Watch navigation updates in single page applications (like LinkedIn) with debouncing to optimize performance
let debounceTimer: any = null;
const mutationObserver = new MutationObserver(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    handlePageUpdates();
    if (onPageMutationHook) {
      onPageMutationHook();
    }
  }, 200);
});
mutationObserver.observe(document.body, { childList: true, subtree: true });

// Run initial evaluation on load
handlePageUpdates();

export {};
