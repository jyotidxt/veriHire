console.log("VeriHire Content Script: Initializing floating UI injector.");if(window.location.hostname==="localhost"||window.location.hostname.includes("vercel.app")){const t=localStorage.getItem("verihire_user");if(t)try{const c=JSON.parse(t);chrome.runtime.sendMessage({type:"SYNC_USER_SESSION",user:c},p=>{console.log("VeriHire Content Script: Session synced successfully with background worker:",p)})}catch(c){console.error("VeriHire Content Script: Failed to parse verihire_user from localStorage",c)}}const xe=!("update_url"in chrome.runtime.getManifest()),ie=xe?"http://localhost:3000":"https://verihire-jyotidxt.vercel.app",fe='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8.24-2a1 1 0 0 1 .48 0l8.24 2A1 1 0 0 1 20 6z"/></svg>',Se='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18M6 6l12 12"/></svg>',ke='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',je='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-briefcase"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>',we=`
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
`;function _e(t){let c=40;const p=[],e=(t==null?void 0:t.companyName)||"",q=(t==null?void 0:t.jobLocation)||"",J=(t==null?void 0:t.jobDescription)||"",C=(t==null?void 0:t.employmentType)||"",R=(t==null?void 0:t.workplaceType)||"",b=(t==null?void 0:t.experienceLevel)||"",A=(t==null?void 0:t.salary)||"",N=(t==null?void 0:t.skills)||[],B=(t==null?void 0:t.applyUrl)||"",P=(t==null?void 0:t.companyWebsite)||"",Z=e&&e!=="Unavailable"&&e!=="Not Available"&&e!=="Company not detected";c+=Z?10:0,p.push({label:"Company Detected",value:Z?e:"Not Available",pass:Z});const X=P&&P.startsWith("https://")&&P!=="Website not specified"&&P!=="Not Available";c+=X?10:0,p.push({label:"HTTPS Website Found",value:X?P:"Not Available",pass:X});const ee=R==="Remote"||q.toLowerCase().includes("remote");c+=ee?10:5,p.push({label:"Remote Position Detected",value:ee?"Yes":`No (${R})`,pass:ee});const O=A&&A!=="Salary not disclosed"&&A!=="Not Available";c+=O?10:0,p.push({label:"Salary Mentioned",value:O?A:"Not Available",pass:O});const T=N?N.filter(re=>re!=="Not Specified"&&re!=="Not Available").length:0;c+=T>0?Math.min(10,T*2):0,p.push({label:"Required Skills Count",value:T>0?`${T} skills`:"Not Available",pass:T>0});const G=J.length,L=G>1e3;c+=G>1800?10:G>1e3?5:0,p.push({label:"Description Completeness",value:L?"Complete":"Short",pass:L});const Y=C&&C!=="Not Specified"&&C!=="Not Available";c+=Y?5:0,p.push({label:"Employment Type",value:Y?C:"Not Available",pass:Y});const K=B&&B.startsWith("http")&&B!=="Not Available";c+=K?10:5,p.push({label:"External Application Link",value:K?"Yes":"LinkedIn Easy Apply",pass:K});const $=b&&b!=="Not Specified"&&b!=="Not Available";return c+=$?5:0,p.push({label:"Estimated Seniority",value:$?b:"Not Available",pass:$}),c=Math.min(100,Math.max(10,c)),{score:c,checks:p}}let pe=null,ue=[],z=null,ne=null,H=null,ae=null;function se(){const t=[".jobs-search__job-details",".job-view-layout",".jobs-box",".jobs-details-sidebar","#main",".job-details"];for(const c of t){const p=document.querySelector(c);if(p&&p.clientHeight>80)return p}return document}function Ae(){const c=window.location.href.match(/(?:currentJobId=|jobs\/view\/)(\d+)/i);return c?c[1]:null}function ye(){var C,R;const t=Ae();if(t)return t;const c=se(),p=c.querySelector(".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title"),e=c.querySelector(".jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__company-name"),q=((C=p==null?void 0:p.textContent)==null?void 0:C.trim())||"",J=((R=e==null?void 0:e.textContent)==null?void 0:R.trim())||"";return`${q}-${J}`}function Ce(){if(document.getElementById("verihire-floating-root"))return;const t=document.createElement("div");t.id="verihire-floating-root",document.body.appendChild(t),pe=t.attachShadow({mode:"open"});const c=document.createElement("style");c.textContent=we,pe.appendChild(c);const p=document.createElement("div");p.className="vh-bubble",p.innerHTML=`
    ${fe}
    <div class="vh-tooltip">Analyze job with VeriHire</div>
  `,pe.appendChild(p);const e=document.createElement("div");e.className="vh-drawer",e.innerHTML=`
    <div class="vh-header">
      <div class="vh-logo">
        ${fe}
        <span>VeriHire</span>
      </div>
      <button class="vh-close-btn">${Se}</button>
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
            ${ke}
            <span id="vh-job-location">Remote</span>
          </div>
          <div class="vh-meta-item" id="vh-meta-employment">
            ${je}
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
        <a href="${ie}/dashboard" target="_blank" class="vh-btn-secondary" style="padding: 8px 12px; font-size: 11px;">Dashboard</a>
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
          <a href="${ie}/settings/ai-providers" target="_blank" class="vh-btn" style="text-decoration:none; text-align: center;">Configure AI Provider</a>
          <button class="vh-btn-secondary" id="vh-demo-mode-btn">Continue Using Demo Mode</button>
        </div>
      </div>
    </div>
  `,pe.appendChild(e);function q(l){var i;const h=se();console.log("VeriHire Scraper: Querying text from container:",h);for(const u of l)try{const m=h.querySelector(u);if(m){const f=(i=m.textContent)==null?void 0:i.trim();if(f)return console.log(`VeriHire Scraper: SUCCESS matching text selector "${u}" -> "${f.slice(0,40)}..."`),f}else console.log(`VeriHire Scraper: Selector not found in container: "${u}"`)}catch(m){console.warn(`VeriHire Scraper: Exception for selector "${u}":`,m)}return""}function J(){const l=se(),h=[".jobs-unified-top-card__job-insight",".job-details-jobs-unified-top-card__job-insight",".description__job-criteria-text",".jobs-description-details__list-item",".description__job-criteria-item",".jobs-box__group"];let i="",u="";const m=[];return h.forEach(f=>{try{const v=l.querySelectorAll(f);v.length>0&&console.log(`VeriHire Scraper: Scraped ${v.length} insight items using selector "${f}"`),v.forEach(j=>{var k;const S=((k=j.textContent)==null?void 0:k.trim())||"";if(S.includes("·"))S.split("·").map(y=>y.trim()).forEach(y=>{const n=y.toLowerCase();n.includes("full-time")||n.includes("part-time")||n.includes("contract")||n.includes("temporary")||n.includes("internship")?i=y:(n.includes("entry level")||n.includes("mid-senior")||n.includes("associate")||n.includes("director")||n.includes("executive")||n.includes("no experience")||n.includes("intern"))&&(u=y)});else{const a=S.toLowerCase();a.includes("full-time")||a.includes("part-time")||a.includes("contract")||a.includes("temporary")||a.includes("internship")?i=S:(a.includes("entry level")||a.includes("mid-senior")||a.includes("associate")||a.includes("director")||a.includes("executive")||a.includes("no experience")||a.includes("intern"))&&(u=S)}(S.toLowerCase().includes("skills")||S.toLowerCase().includes("skills:"))&&S.replace(/(Skills:|skills:)/i,"").trim().split(",").forEach(y=>{const n=y.trim();n&&m.push(n)})})}catch(v){console.warn(`VeriHire Scraper: Insight parsing exception for selector "${f}":`,v)}}),{employmentType:i,experienceLevel:u,skills:m}}function C(l=!1){var oe;const h=ye();if(!l&&ae===h&&H)return console.log("VeriHire Scraper: Returning cached scraped data for",h),H;console.log("VeriHire Scraper: Running master job scraper...");const i=se(),u=q([".job-details-jobs-unified-top-card__job-title",".jobs-unified-top-card__job-title",".jobs-unified-top-card__job-title-link","h1.t-24",".jobs-search-jobs-unified-top-card__job-title-link",".top-card-layout__title","h1"])||"Not Available",m=q([".jobs-unified-top-card__company-name",".job-details-jobs-unified-top-card__company-name",".jobs-unified-top-card__company-name-link",".jobs-unified-top-card__company-name a",".topcard__org-name-link",".top-card-layout__card .top-card-layout__first-subline a","a[href*='/company/']"])||"Not Available";let f="Not Available";const v=i.querySelector(["a.jobs-unified-top-card__company-name-link","a[href*='/company/']"].join(", "));v&&(f=v.href,f.startsWith("/")&&(f="https://www.linkedin.com"+f));const j=q([".jobs-unified-top-card__bullet",".jobs-unified-top-card__bullet-point",".job-details-jobs-unified-top-card__bullet",".jobs-unified-top-card__bullet-point-container",".topcard__flavor--bullet",".top-card-layout__card .top-card-layout__first-subline span:nth-child(2)",".jobs-unified-top-card__primary-description span:nth-child(2)"])||"Not Available",S=q(["#job-details",".jobs-description__content",".jobs-description-content__text",".jobs-box__html-content",".description__text",".jobs-description",".jobs-description__container"])||"Not Available",k=J();let a="Not Available";const y=i.querySelector([".jobs-unified-top-card__workplace-type",".job-details-jobs-unified-top-card__workplace-type",".top-card-layout__workplace-type"].join(", "));if(y&&y.textContent)a=y.textContent.trim();else if(u!=="Not Available"||j!=="Not Available"){const d=u.toLowerCase(),o=j.toLowerCase();d.includes("remote")||o.includes("remote")?a="Remote":d.includes("hybrid")||o.includes("hybrid")?a="Hybrid":(d.includes("on-site")||d.includes("onsite")||o.includes("on-site")||o.includes("onsite"))&&(a="On-site")}const n=S,w=/(\$\d{2,3}(?:,\d{3})*(?:\s*-\s*\$\d{2,3}(?:,\d{3})*)?\s*(?:per\s*year|yr|hr|hour|anually|annually|a\s*year|annual)?)/i,V=n.match(w);let _=V?V[1]:"";if(!_){const d=i.querySelector(".jobs-unified-top-card__salary-range, .salary, .job-details-jobs-unified-top-card__salary");d&&(_=((oe=d.textContent)==null?void 0:oe.trim())||"")}_=_||"Not Available";let g="Not Available";const te=i.querySelector([".jobs-unified-top-card__applicant-count",".job-details-jobs-unified-top-card__applicant-count",".top-card-layout__first-subline .num-applicants",".topcard__flavor--metadata"].join(", "));te&&te.textContent?g=te.textContent.trim():i.querySelectorAll("span, p, li").forEach(d=>{var r;const o=((r=d.textContent)==null?void 0:r.trim())||"";o.toLowerCase().includes("applicant")&&o.length<50&&(g=o)});let M="Not Available";const Q=i.querySelector([".jobs-poster__name",".hirer-card__name",".jobs-details-sidebar__poster-name",".jobs-poster-card__name"].join(", "));if(Q&&Q.textContent){M=Q.textContent.trim();const d=i.querySelector(".jobs-poster__headline, .hirer-card__headline, .jobs-poster-card__headline");d&&d.textContent&&(M+=` (${d.textContent.trim()})`)}let ce="Not Available";const s=i.querySelector(".jobs-description__benefits, .jobs-description-benefits");if(s&&s.textContent)ce=s.textContent.trim();else if(n!=="Not Available"){const d=["health insurance","401(k)","dental","vision","retirement","pto","paid time off","stock options"],o=[];d.forEach(r=>{n.toLowerCase().includes(r)&&o.push(r.toUpperCase())}),o.length>0&&(ce=o.join(", "))}let F="LinkedIn Easy Apply";const D=i.querySelector(["a.jobs-apply-button","a[href*='/jobs/view/']","button.jobs-apply-button"].join(", "));D&&D.href&&D.href.startsWith("http")?F=D.href:i.querySelector(".jobs-apply-button--easy-apply, .jobs-apply-button")&&(F="LinkedIn Easy Apply");const x=[...k.skills];if(i.querySelectorAll(".app-shared-outline-pill, .jobs-opinion-skills-list__pill, a[href*='/search/results/all/?keywords=']").forEach(d=>{var r;const o=(r=d.textContent)==null?void 0:r.trim();o&&!x.includes(o)&&o.length<30&&(x[0]==="Not Specified"&&x.shift(),x.push(o))}),(x.length===0||x.length===1&&(x[0]==="Not Specified"||x[0]==="Not Available"))&&n!=="Not Available"){const d=["React","TypeScript","JavaScript","Python","Java","HTML","CSS","SQL","Docker","AWS","Node.js","C++","C#","Go","Rust","Swift","Kubernetes","Angular","Vue","Git"],o=r=>r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");d.forEach(r=>{const W=o(r);new RegExp("(?:^|\\s|\\b)"+W+"(?:\\b|\\s|$)","i").test(n)&&!x.includes(r)&&((x[0]==="Not Specified"||x[0]==="Not Available")&&x.shift(),x.push(r))})}let E="";const de=i.querySelectorAll("a");for(const d of de){const o=d.href||"";if(o&&!o.includes("linkedin.com")&&!o.includes("javascript:")&&o.startsWith("http")){E=o;break}}if(!E&&n!=="Not Available"){const d=/(https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(?:\.[a-zA-Z]{2,})?)/i,o=n.match(d);o&&(E=o[1])}return E=E||"Not Available",H={jobTitle:u,companyName:m,companyUrl:f,jobLocation:j,jobDescription:S,employmentType:k.employmentType||"Not Available",workplaceType:a,experienceLevel:k.experienceLevel||"Not Available",salary:_,applicants:g,hiringTeam:M,skills:x.length>0?x:["Not Available"],benefits:ce,applyUrl:F,companyWebsite:E,jobUrl:window.location.href},ae=h,H}const R=e.querySelector(".vh-close-btn"),b=e.querySelector("#vh-save-btn"),A=e.querySelector("#vh-resume-btn"),N=e.querySelector("#vh-interview-btn"),B=e.querySelector("#vh-real-ai-btn"),P=e.querySelector("#vh-demo-panel"),Z=e.querySelector("#vh-ai-panel"),X=e.querySelector("#vh-ai-upgrade-card"),ee=e.querySelector("#vh-score-title"),O=e.querySelector("#vh-score-text"),T=e.querySelector("#vh-score-caption"),G=e.querySelector("#vh-risk-badge"),L=e.querySelector("#vh-byok-modal"),Y=e.querySelector("#vh-demo-mode-btn");let K=80,$="LOW";const re=(l,h)=>{const i=e.querySelector("#vh-job-title"),u=e.querySelector("#vh-company-name"),m=e.querySelector("#vh-score-text"),f=e.querySelector("#vh-score-title"),v=e.querySelector("#vh-risk-badge"),j=e.querySelector("#vh-explanation-text"),S=e.querySelector("#vh-skeleton-view"),k=e.querySelector("#vh-summary-card"),a=e.querySelector("#vh-score-card"),y=e.querySelector("#vh-demo-panel"),n=e.querySelector("#vh-ai-panel"),w=e.querySelector("#vh-ai-upgrade-card"),V=e.querySelector("#vh-error-view");S&&(S.style.display="flex"),k&&(k.style.display="none"),a&&(a.style.display="none"),y&&(y.style.display="none"),n&&(n.style.display="none"),w&&(w.style.display="none"),V&&(V.style.display="none"),i&&(i.textContent=l.jobTitle),u&&(u.textContent=l.companyName),f&&(f.textContent="AI Trust Score"),T&&(T.textContent="Calculated securely via connected AI provider."),A&&(A.style.display="none"),N&&(N.style.display="none"),chrome.runtime.sendMessage({type:"ANALYZE_JOB_DIRECT",data:l,isDemo:h},_=>{if(S&&(S.style.display="none"),_&&_.success){const g=_.data;K=g.trustScore,$=g.riskLevel||"LOW",k&&(k.style.display="block"),a&&(a.style.display="block"),n&&(n.style.display="block"),y&&(y.style.display="none"),w&&(w.style.display="none"),m&&(m.textContent=`${g.trustScore}/100`,m.className=`vh-score-value ${g.trustScore<50?"high":g.trustScore<80?"medium":""}`),v&&(v.textContent=`${$} RISK`,v.className=`vh-badge ${$==="HIGH"?"high":$==="MEDIUM"?"medium":""}`),j&&(j.textContent=g.explanation||"Inspection completed successfully."),A&&(A.href=`${ie}/resume?desc=${encodeURIComponent(l.jobDescription)}&isDemo=${h}`,A.style.display="flex"),N&&(N.href=`${ie}/interview-prep?title=${encodeURIComponent(l.jobTitle)}&company=${encodeURIComponent(l.companyName)}&isDemo=${h}`,N.style.display="flex")}else _&&_.code==="BYOK_REQUIRED"?(L&&(L.style.display="flex"),k&&(k.style.display="block"),a&&(a.style.display="block"),y&&(y.style.display="block"),w&&(w.style.display="block")):(k&&(k.style.display="block"),a&&(a.style.display="block"),n&&(n.style.display="block"),y&&(y.style.display="none"),w&&(w.style.display="block"),j&&(j.textContent=(_==null?void 0:_.error)||"AI Analysis Request Failed. Please check that your configured API key is valid and has remaining credit quota.",j.style.color="#fca5a5"),v&&(v.textContent="ERROR",v.className="vh-badge high"),m&&(m.textContent="Err",m.className="vh-score-value high"))})},me=()=>{ne&&(clearTimeout(ne),ne=null);const l=e.querySelector("#vh-job-title"),h=e.querySelector("#vh-company-name"),i=e.querySelector("#vh-skeleton-view"),u=e.querySelector("#vh-error-view"),m=e.querySelector("#vh-summary-card"),f=e.querySelector("#vh-score-card"),v=e.querySelector("#vh-demo-panel"),j=e.querySelector("#vh-ai-upgrade-card"),S=e.querySelector("#vh-ai-panel");i&&(i.style.display="flex"),u&&(u.style.display="none"),m&&(m.style.display="none"),f&&(f.style.display="none"),v&&(v.style.display="none"),j&&(j.style.display="none"),S&&(S.style.display="none");let k=0;const a=6,y=()=>{var n;k++;try{const w=se(),V=w!==document,_=ye();let g;ae===_&&H&&H.jobTitle!=="Not Available"?g=H:g=C(!0);const te=(!g.jobTitle||g.jobTitle==="Unavailable"||g.jobTitle==="Not Available")&&(!g.companyName||g.companyName==="Unavailable"||g.companyName==="Not Available"),M=w.querySelector(["button.jobs-description__footer-button","button.jobs-description__button",".jobs-description__footer-button","button[aria-label*='See more']","button[aria-label*='show more']",".jobs-description-content__button"].join(", ")),Q=!!(M&&((n=M.textContent)!=null&&n.toLowerCase().includes("see more")));if(Q&&M&&(console.log("VeriHire Scraper: Clicking 'See more' to expand full description..."),M.click()),(te||!V||Q)&&k<a){console.log(`VeriHire Scraper: Job details loading/expanding (attempt ${k}/${a}). Container ready: ${V}. Has See more: ${Q}. Retrying in 700ms...`),H=null,ne=setTimeout(y,700);return}i&&(i.style.display="none");let s=g;if(te){console.log("VeriHire Scraper: Selection failed. Activating local demo fallback datasets.");const o=window.location.href,r=o.match(/currentJobId=(\d+)/)||o.match(/jobs\/view\/(\d+)/),W=r?r[1]:o;let I=0;for(let be=0;be<W.length;be++)I=W.charCodeAt(be)+((I<<5)-I);const ge=Math.abs(I)%6,U=[{jobTitle:"Senior Frontend Engineer",companyName:"Vercel",jobLocation:"San Francisco, CA (Remote)",jobDescription:"We are looking for a Senior Frontend Engineer to join our team. You will work on Next.js, React, and build world-class user interfaces. Collaborate with designers and platform engineers to deliver fast, secure experiences.",employmentType:"Full-time",experienceLevel:"Mid-Senior level",skills:["Next.js","React","TypeScript","Tailwind CSS","GraphQL"],salary:"$140,000 - $180,000",companyWebsite:"https://vercel.com"},{jobTitle:"Staff Software Engineer - Billing",companyName:"Stripe",jobLocation:"Seattle, WA (Hybrid)",jobDescription:"Stripe Billing is seeking an experienced Backend Engineer to lead complex monetary ledger systems. You will construct highly resilient APIs, manage transaction safety protocols, and scale distributed database systems.",employmentType:"Full-time",experienceLevel:"Staff level",skills:["Ruby","Go","APIs","Distributed Systems","PostgreSQL"],salary:"$160,000 - $210,000",companyWebsite:"https://stripe.com"},{jobTitle:"Full Stack Engineer (Database)",companyName:"Supabase",jobLocation:"Singapore (Remote)",jobDescription:"Help us construct the open source Firebase alternative. Build real-time database subscription features, integrate safe auth systems, and manage high-performance TypeScript query builders.",employmentType:"Contract",experienceLevel:"Mid-Senior level",skills:["PostgreSQL","Node.js","React","TypeScript","Docker"],salary:"$120,000 - $150,000",companyWebsite:"https://supabase.com"},{jobTitle:"Infrastructure Security Architect",companyName:"HashiCorp",jobLocation:"Austin, TX (On-site)",jobDescription:"Design security validation layers for infrastructure delivery. You will audit multi-tenant cloud orchestration blueprints, configure Vault policies, and direct Terraform automation workflows.",employmentType:"Full-time",experienceLevel:"Director level",skills:["Terraform","Vault","AWS","Kubernetes","IAM"],salary:"$180,000 - $230,000",companyWebsite:"https://hashicorp.com"},{jobTitle:"Member of Technical Staff - Reasoning",companyName:"OpenAI",jobLocation:"San Francisco, CA (Hybrid)",jobDescription:"Train next-generation reasoning models to solve complex logical, math, and code-synthesis benchmarks. You will structure deep learning workflows, parse training datasets, and build PyTorch infrastructure.",employmentType:"Full-time",experienceLevel:"Senior level",skills:["Python","PyTorch","Deep Learning","Transformers","NLP"],salary:"$240,000 - $370,000",companyWebsite:"https://openai.com"},{jobTitle:"Senior Product Designer - Editor",companyName:"Figma",jobLocation:"New York, NY (Hybrid)",jobDescription:"Design collaborative creation interfaces inside Figma. Work on vector manipulation workflows, component property controls, design library sync, and interactive micro-animations.",employmentType:"Full-time",experienceLevel:"Mid-Senior level",skills:["UI/UX","Figma","Prototyping","Design Systems","Product Strategy"],salary:"$150,000 - $190,000",companyWebsite:"https://figma.com"}][ge];s={jobTitle:U.jobTitle,companyName:U.companyName,jobLocation:U.jobLocation,jobDescription:U.jobDescription,employmentType:U.employmentType,experienceLevel:U.experienceLevel,skills:U.skills,salary:U.salary,companyWebsite:U.companyWebsite,jobUrl:o}}m&&(m.style.display="block"),f&&(f.style.display="block"),v&&(v.style.display="block"),j&&(j.style.display="block");const F=e.querySelector("#vh-company-logo"),D=w.querySelector(".jobs-unified-top-card__company-logo, .job-details-jobs-unified-top-card__company-logo, img.jobs-details-sidebar__company-logo");if(F&&(D&&D.src&&!D.src.includes("data:image")?(F.src=D.src,F.style.display="block"):F.style.display="none"),b){const o=`${s.jobTitle}-${s.companyName}`;ue.includes(o)?(b.textContent="Job Saved",b.className="vh-btn vh-btn-saved",b.disabled=!0):(b.textContent="Save Job Listing",b.className="vh-btn",b.disabled=!1)}A&&(A.href=`${ie}/resume?desc=${encodeURIComponent(s.jobDescription)}&isDemo=true`,A.style.display="flex"),N&&(N.href=`${ie}/interview-prep?title=${encodeURIComponent(s.jobTitle)}&company=${encodeURIComponent(s.companyName)}&isDemo=true`,N.style.display="flex"),l&&(l.textContent=s.jobTitle&&s.jobTitle!=="Unavailable"?s.jobTitle:"Job title not detected"),h&&(h.textContent=s.companyName&&s.companyName!=="Unavailable"?s.companyName:"Company not detected");const x=e.querySelector("#vh-meta-location");if(x)if(s.jobLocation&&s.jobLocation!=="Unavailable"&&s.jobLocation!=="Not Specified"){const o=x.querySelector("span");o&&(o.textContent=s.jobLocation),x.style.display="flex"}else x.style.display="none";const E=e.querySelector("#vh-meta-employment");if(E)if(s.employmentType&&s.employmentType!=="Unavailable"&&s.employmentType!=="Not Specified"){const o=E.querySelector("span");o&&(o.textContent=s.employmentType),E.style.display="flex"}else E.style.display="none";const de=e.querySelector("#vh-summary-meta");if(de){const o=s.jobLocation&&s.jobLocation!=="Unavailable"&&s.jobLocation!=="Not Specified",r=s.employmentType&&s.employmentType!=="Unavailable"&&s.employmentType!=="Not Specified";de.style.display=o||r?"flex":"none"}const oe=_e(s);K=oe.score,O&&(O.textContent=`${oe.score}/100`,O.className="vh-score-value text-amber-500"),ee&&(ee.textContent="Demo Confidence Score"),T&&(T.textContent="Generated from visible job signals — not AI analysis.",T.style.display="block"),G&&(G.textContent="🟡 Demo Analysis",G.className="vh-badge demo");const d=e.querySelector("#vh-checklist-container");d&&(d.innerHTML="",oe.checks.forEach(o=>{const r=document.createElement("div");r.style.display="flex",r.style.alignItems="center",r.style.justifyContent="space-between",r.style.fontSize="11px",r.style.color="#cbd5e1",r.style.padding="2px 0";const W=document.createElement("span");W.textContent=o.label,W.style.fontWeight="600";const I=document.createElement("span");I.textContent=o.value.length>25?o.value.slice(0,22)+"...":o.value,I.style.color=o.pass?"#10b981":"#ef4444",I.style.fontWeight="500",I.title=o.value,r.appendChild(W),r.appendChild(I),d.appendChild(r)}))}catch(w){console.error("VeriHire Scraper Error:",w),i&&(i.style.display="none"),u&&(u.style.display="block")}};ne=setTimeout(y,600)};p.addEventListener("click",()=>{L&&(L.style.display="none"),me(),e.classList.add("vh-open")});function ve(){const l=ye();l!==ae&&(ae=l,H=null,e.classList.contains("vh-open")&&me())}z=()=>{ve()},B==null||B.addEventListener("click",()=>{const l=C();chrome.runtime.sendMessage({type:"CHECK_AI_KEY_CONFIGURED"},h=>{h&&h.configured?(P&&(P.style.display="none"),X&&(X.style.display="none"),Z&&(Z.style.display="block"),re(l,!1)):L&&(L.style.display="flex")})}),Y==null||Y.addEventListener("click",()=>{L&&(L.style.display="none")}),R==null||R.addEventListener("click",()=>{e.classList.remove("vh-open")}),b==null||b.addEventListener("click",()=>{const l=C(),h=`${l.jobTitle}-${l.companyName}`;ue.includes(h)||(b&&(b.textContent="Saving to Board...",b.disabled=!0),chrome.runtime.sendMessage({type:"SAVE_JOB_DIRECT",data:{title:l.jobTitle,company:l.companyName,location:l.jobLocation,url:l.jobUrl,score:K,risk:$,status:"SAVED"}},i=>{i&&i.success?(ue.push(h),b&&(b.textContent="Job Saved",b.className="vh-btn vh-btn-saved"),console.log("VeriHire: Saved job listing to database",l)):(b&&(b.textContent="Save Failed",b.disabled=!1,setTimeout(()=>{b.textContent="Save Job Listing"},2500)),console.error("VeriHire: Failed to save job listing",i==null?void 0:i.error))}))}),chrome.runtime.onMessage.addListener((l,h,i)=>{if(l.action==="EXTRACT_JOB_DETAILS")try{const u=C();i({success:!0,data:u})}catch(u){i({success:!1,error:u.message||"Failed to extract page content."})}return!0})}function le(){const t=window.location.href;if(t.includes("localhost:3000")||t.includes("verihire-")||t.includes("vercel.app")){try{const e=localStorage.getItem("verihire_user"),q=e?JSON.parse(e):null;chrome.runtime.sendMessage({type:"SYNC_USER_SESSION",user:q},J=>{console.log("VeriHire Content Script: Synced user session to background storage",J)})}catch(e){console.warn("VeriHire Content Script: Failed to read user session from SaaS storage",e)}return}t.includes("linkedin.com/jobs")&&Ce()}const Ne=history.pushState;history.pushState=function(...t){Ne.apply(this,t),setTimeout(()=>{le(),z&&z()},50)};const Te=history.replaceState;history.replaceState=function(...t){Te.apply(this,t),setTimeout(()=>{le(),z&&z()},50)};window.addEventListener("popstate",()=>{le(),z&&z()});let he=null;const Le=new MutationObserver(()=>{he&&clearTimeout(he),he=setTimeout(()=>{le(),z&&z()},200)});Le.observe(document.body,{childList:!0,subtree:!0});le();
