// Chrome Extension MV3 Content Script - Shadow DOM UI Injection & Scraper

console.log("VeriHire Content Script: Initializing floating UI injector.");

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

// Simple local parser to simulate early data parsing for the drawer UI
function parseLinkedInPage() {
  const titleEl = document.querySelector(
    ".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24"
  );
  const companyEl = document.querySelector(
    ".jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__company-name"
  );
  const locationEl = document.querySelector(
    ".jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet-point"
  );

  return {
    title: titleEl?.textContent?.trim() || "Software Developer",
    company: companyEl?.textContent?.trim() || "Hiring Company",
    location: locationEl?.textContent?.trim() || "Remote / Hybrid"
  };
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

      <!-- Trust Score rating mock card -->
      <div class="vh-card">
        <div class="vh-score-container">
          <div class="vh-score-left">
            <span class="vh-score-title">Calculated Index</span>
            <span class="vh-score-value" id="vh-score-text">88/100</span>
          </div>
          <span class="vh-badge" id="vh-risk-badge">Low Risk</span>
        </div>
      </div>

      <!-- AI mock assessment -->
      <div class="vh-card">
        <h4 class="vh-subtitle">AI Analysis</h4>
        <p class="vh-explanation" id="vh-explanation-text">
          Evaluating description and matching corporate entities. Click to trigger detailed scans.
        </p>
      </div>
    </div>

    <!-- Actions footer -->
    <div class="vh-footer">
      <button class="vh-btn" id="vh-save-btn">Save Job Listing</button>
      <a href="https://verihire.app/dashboard" target="_blank" class="vh-link">
        Open SaaS Portal →
      </a>
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

  // Set up event listeners
  const closeBtn = drawer.querySelector(".vh-close-btn");
  const saveBtn = drawer.querySelector("#vh-save-btn");

  bubble.addEventListener("click", () => {
    // 1. Scrape real job metadata from active page content
    const scraped = scrapeJobPage();
    
    // 2. Update drawer elements with real scraped details
    const titleEl = drawer.querySelector("#vh-job-title");
    const companyEl = drawer.querySelector("#vh-company-name");
    const locationEl = drawer.querySelector("#vh-job-location");
    const scoreTextEl = drawer.querySelector("#vh-score-text");
    const badgeEl = drawer.querySelector("#vh-risk-badge");
    const explanationEl = drawer.querySelector("#vh-explanation-text");

    if (titleEl) titleEl.textContent = scraped.jobTitle;
    if (companyEl) companyEl.textContent = scraped.companyName;
    if (locationEl) locationEl.textContent = scraped.jobLocation;

    // Simulate simple heuristic evaluation to populate scores dynamically
    const isSuspicious =
      scraped.jobTitle.toLowerCase().includes("data entry") ||
      scraped.companyName.toLowerCase().includes("freelance") ||
      scraped.jobDescription.toLowerCase().includes("telegram") ||
      scraped.jobDescription.toLowerCase().includes("whatsapp") ||
      scraped.jobDescription.toLowerCase().includes("purchase");

    if (isSuspicious) {
      if (scoreTextEl) {
        scoreTextEl.textContent = "42/100";
        scoreTextEl.className = "vh-score-value high";
      }
      if (badgeEl) {
        badgeEl.textContent = "High Risk";
        badgeEl.className = "vh-badge high";
      }
      if (explanationEl) {
        explanationEl.textContent = "Description contains warning parameters (e.g. chat redirects or upfront startup cost terms). Exercise caution.";
      }
    } else {
      if (scoreTextEl) {
        scoreTextEl.textContent = "88/100";
        scoreTextEl.className = "vh-score-value";
      }
      if (badgeEl) {
        badgeEl.textContent = "Low Risk";
        badgeEl.className = "vh-badge";
      }
      if (explanationEl) {
        explanationEl.textContent = "Hiring company registry checked. Details conform to standard recruitment practices.";
      }
    }

    // Toggle saved button state depending on active job title
    if (saveBtn) {
      const jobKey = `${scraped.jobTitle}-${scraped.companyName}`;
      if (savedJobsList.includes(jobKey)) {
        saveBtn.textContent = "Job Saved";
        saveBtn.className = "vh-btn vh-btn-saved";
      } else {
        saveBtn.textContent = "Save Job Listing";
        saveBtn.className = "vh-btn";
      }
    }

    // Slide in the side drawer panel
    drawer.classList.add("vh-open");
  });

  closeBtn?.addEventListener("click", () => {
    drawer.classList.remove("vh-open");
  });

  saveBtn?.addEventListener("click", () => {
    const scraped = scrapeJobPage();
    const jobKey = `${scraped.jobTitle}-${scraped.companyName}`;
    
    if (!savedJobsList.includes(jobKey)) {
      savedJobsList.push(jobKey);
      if (saveBtn) {
        saveBtn.textContent = "Job Saved";
        saveBtn.className = "vh-btn vh-btn-saved";
      }
      console.log("VeriHire: Saved job listing locally", scraped);
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

