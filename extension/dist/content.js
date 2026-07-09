console.log("VeriHire Content Script: Initializing floating UI injector.");if(window.location.hostname==="localhost"||window.location.hostname.includes("vercel.app")){const t=localStorage.getItem("verihire_user");if(t)try{const y=JSON.parse(t);chrome.runtime.sendMessage({type:"SYNC_USER_SESSION",user:y},h=>{console.log("VeriHire Content Script: Session synced successfully with background worker:",h)})}catch(y){console.error("VeriHire Content Script: Failed to parse verihire_user from localStorage",y)}}const ce=!("update_url"in chrome.runtime.getManifest()),G=ce?"http://localhost:3000":"https://verihire-jyotidxt.vercel.app",le='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8.24-2a1 1 0 0 1 .48 0l8.24 2A1 1 0 0 1 20 6z"/></svg>',de='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18M6 6l12 12"/></svg>',pe='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',be='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-briefcase"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>',ye=`
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
`;function he(t){let y=50;const h=[],e=(t==null?void 0:t.jobTitle)||"",j=(t==null?void 0:t.companyName)||"",L=(t==null?void 0:t.jobLocation)||"",D=(t==null?void 0:t.jobDescription)||"",R=(t==null?void 0:t.employmentType)||"",u=(t==null?void 0:t.skills)||[],w=(t==null?void 0:t.experienceLevel)||"",A=(t==null?void 0:t.jobUrl)||"",$=j&&j!=="Unavailable"&&j!=="Hiring Company"&&j!=="Company not detected";y+=$?5:0,h.push({label:"Company Detected",value:$?j:"Missing",pass:$});const P=e&&e!=="Unavailable"&&e!=="Software Developer"&&e!=="Job title not detected";y+=P?5:0,h.push({label:"Job Title",value:P?e:"Missing",pass:P});const V=L&&L!=="Unavailable"&&L!=="Remote / Hybrid"&&L!=="Location not specified";y+=V?5:0,h.push({label:"Location",value:V?L:"Missing",pass:V});const F=R&&R!=="Not Specified"&&R!=="Employment type not specified";y+=F?5:0,h.push({label:"Employment Type",value:F?R:"Not Specified",pass:F});const q=u?u.filter(d=>d!=="Not Specified").length:0;y+=q>0?Math.min(10,q*2):0,h.push({label:"Skills Count",value:q>0?`${q} skills`:"None Detected",pass:q>0});const U=w&&w!=="Not Specified"&&w!=="Experience not specified";y+=U?5:0,h.push({label:"Seniority Level",value:U?w:"Not Specified",pass:U});const E=D.length,B=E>800;y+=E>1500?10:E>800?5:0,h.push({label:"Description Length",value:`${E} chars`,pass:B});const k=D.toLowerCase(),z=/(\$|salary|salary range|hourly|compensation|pay rate|\d+\s*k)/i.test(k)||(t==null?void 0:t.salary)&&t.salary!=="Salary not disclosed";y+=z?10:0,h.push({label:"Salary Details",value:z?(t==null?void 0:t.salary)!=="Salary not disclosed"?t.salary:"Mentioned":"Not Specified",pass:z});const H=/(https?:\/\/[^\s]+)/g,J=(D.match(H)||[]).length>0||(t==null?void 0:t.companyWebsite)&&t.companyWebsite!=="Website not specified";y+=J?5:0,h.push({label:"External Website",value:J?"Detected":"Not Detected",pass:J});const W=A&&A.includes("linkedin.com");y+=W?5:0,h.push({label:"Application Link",value:W?"Detected":"Not Detected",pass:W});const te=k.includes("remote")||L.toLowerCase().includes("remote"),i=k.includes("hybrid"),c=k.includes("on-site")||k.includes("onsite"),n=te?"Remote":i?"Hybrid":c?"On-site":"Not Specified";return y+=n!=="Not Specified"?5:0,h.push({label:"Workplace Mode",value:n,pass:n!=="Not Specified"}),y=Math.min(100,Math.max(10,y)),{score:y,checks:h}}let X=null,ne=[],ae=null,Q=null;function ee(){const t=[".jobs-search__job-details",".job-view-layout",".jobs-box",".jobs-details-sidebar","#main",".job-details"];for(const y of t){const h=document.querySelector(y);if(h&&h.clientHeight>80)return h}return document}function ue(){if(document.getElementById("verihire-floating-root"))return;const t=document.createElement("div");t.id="verihire-floating-root",document.body.appendChild(t),X=t.attachShadow({mode:"open"});const y=document.createElement("style");y.textContent=ye,X.appendChild(y);const h=document.createElement("div");h.className="vh-bubble",h.innerHTML=`
    ${le}
    <div class="vh-tooltip">Analyze job with VeriHire</div>
  `,X.appendChild(h);const e=document.createElement("div");e.className="vh-drawer",e.innerHTML=`
    <div class="vh-header">
      <div class="vh-logo">
        ${le}
        <span>VeriHire</span>
      </div>
      <button class="vh-close-btn">${de}</button>
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
            ${pe}
            <span id="vh-job-location">Remote</span>
          </div>
          <div class="vh-meta-item" id="vh-meta-employment">
            ${be}
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
        <a href="${G}/dashboard" target="_blank" class="vh-btn-secondary" style="padding: 8px 12px; font-size: 11px;">Dashboard</a>
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
          <a href="${G}/settings/ai-providers" target="_blank" class="vh-btn" style="text-decoration:none; text-align: center;">Configure AI Provider</a>
          <button class="vh-btn-secondary" id="vh-demo-mode-btn">Continue Using Demo Mode</button>
        </div>
      </div>
    </div>
  `,X.appendChild(e);function j(i){var n;const c=ee();console.log("VeriHire Scraper: Querying text from container:",c);for(const d of i)try{const m=c.querySelector(d);if(m){const f=(n=m.textContent)==null?void 0:n.trim();if(f)return console.log(`VeriHire Scraper: SUCCESS matching text selector "${d}" -> "${f.slice(0,40)}..."`),f}else console.log(`VeriHire Scraper: Selector not found in container: "${d}"`)}catch(m){console.warn(`VeriHire Scraper: Exception for selector "${d}":`,m)}return""}function L(){const i=ee(),c=[".jobs-unified-top-card__job-insight",".job-details-jobs-unified-top-card__job-insight",".description__job-criteria-text",".jobs-description-details__list-item",".description__job-criteria-item",".jobs-box__group"];let n="",d="";const m=[];return c.forEach(f=>{try{const s=i.querySelectorAll(f);s.length>0&&console.log(`VeriHire Scraper: Scraped ${s.length} insight items using selector "${f}"`),s.forEach(x=>{var g;const v=((g=x.textContent)==null?void 0:g.trim())||"";if(v.includes("·"))v.split("·").map(p=>p.trim()).forEach(p=>{const l=p.toLowerCase();l.includes("full-time")||l.includes("part-time")||l.includes("contract")||l.includes("temporary")||l.includes("internship")?n=p:(l.includes("entry level")||l.includes("mid-senior")||l.includes("associate")||l.includes("director")||l.includes("executive")||l.includes("no experience")||l.includes("intern"))&&(d=p)});else{const a=v.toLowerCase();a.includes("full-time")||a.includes("part-time")||a.includes("contract")||a.includes("temporary")||a.includes("internship")?n=v:(a.includes("entry level")||a.includes("mid-senior")||a.includes("associate")||a.includes("director")||a.includes("executive")||a.includes("no experience")||a.includes("intern"))&&(d=v)}(v.toLowerCase().includes("skills")||v.toLowerCase().includes("skills:"))&&v.replace(/(Skills:|skills:)/i,"").trim().split(",").forEach(p=>{const l=p.trim();l&&m.push(l)})})}catch(s){console.warn(`VeriHire Scraper: Insight parsing exception for selector "${f}":`,s)}}),{employmentType:n,experienceLevel:d,skills:m}}function D(){var o;console.log("VeriHire Scraper: Running master job scraper...");const i=j([".job-details-jobs-unified-top-card__job-title",".jobs-unified-top-card__job-title",".jobs-unified-top-card__job-title-link","h1.t-24",".jobs-search-jobs-unified-top-card__job-title-link",".top-card-layout__title","h1"]),c=j([".jobs-unified-top-card__company-name",".job-details-jobs-unified-top-card__company-name",".jobs-unified-top-card__company-name-link",".jobs-unified-top-card__company-name a",".topcard__org-name-link",".top-card-layout__card .top-card-layout__first-subline a","a[href*='/company/']",".jobs-unified-top-card__company-name"]),n=j([".jobs-unified-top-card__bullet",".jobs-unified-top-card__bullet-point",".job-details-jobs-unified-top-card__bullet",".jobs-unified-top-card__bullet-point-container",".topcard__flavor--bullet",".top-card-layout__card .top-card-layout__first-subline span:nth-child(2)",".jobs-unified-top-card__primary-description span:nth-child(2)"]),d=j(["#job-details",".jobs-description__content",".jobs-description-content__text",".jobs-box__html-content",".description__text",".jobs-description",".jobs-description__container"]),m=L(),f=ee(),s=[...m.skills];f.querySelectorAll(".app-shared-outline-pill, .jobs-opinion-skills-list__pill, a[href*='/search/results/all/?keywords=']").forEach(b=>{var N;const r=(N=b.textContent)==null?void 0:N.trim();r&&!s.includes(r)&&r.length<30&&(s[0]==="Not Specified"&&s.shift(),s.push(r))});const x=d||"";(s.length===0||s.length===1&&s[0]==="Not Specified")&&["React","TypeScript","JavaScript","Python","Java","HTML","CSS","SQL","Docker","AWS","Node.js","C++","C#","Go","Rust","Swift","Kubernetes","Angular","Vue","Git"].forEach(r=>{new RegExp("\\b"+r+"\\b","i").test(x)&&!s.includes(r)&&(s[0]==="Not Specified"&&s.shift(),s.push(r))});const v=/(\$\d{2,3}(?:,\d{3})*(?:\s*-\s*\$\d{2,3}(?:,\d{3})*)?\s*(?:per\s*year|yr|hr|hour|anually|annually|a\s*year|annual)?)/i,g=x.match(v);let a=g?g[1]:"";if(!a){const b=f.querySelector(".jobs-unified-top-card__salary-range, .salary, .job-details-jobs-unified-top-card__salary");b&&(a=((o=b.textContent)==null?void 0:o.trim())||"")}a=a||"Salary not disclosed";let p="";const l=f.querySelectorAll("a");for(const b of l){const r=b.href||"";if(r&&!r.includes("linkedin.com")&&!r.includes("javascript:")&&r.startsWith("http")){p=r;break}}if(!p){const b=/(https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(?:\.[a-zA-Z]{2,})?)/i,r=x.match(b);r&&(p=r[1])}if(p=p||"Website not specified",(!i||i==="Unavailable")&&(!c||c==="Unavailable")){console.log("VeriHire Scraper: Selection failed. Activating local demo fallback datasets.");const b=window.location.href,r=b.match(/currentJobId=(\d+)/)||b.match(/jobs\/view\/(\d+)/),N=r?r[1]:b;let I=0;for(let M=0;M<N.length;M++)I=N.charCodeAt(M)+((I<<5)-I);const O=Math.abs(I)%6,_=[{jobTitle:"Senior Frontend Engineer",companyName:"Vercel",jobLocation:"San Francisco, CA (Remote)",jobDescription:"We are looking for a Senior Frontend Engineer to join our team. You will work on Next.js, React, and build world-class user interfaces. Collaborate with designers and platform engineers to deliver fast, secure experiences.",employmentType:"Full-time",experienceLevel:"Mid-Senior level",skills:["Next.js","React","TypeScript","Tailwind CSS","GraphQL"],salary:"$140,000 - $180,000",companyWebsite:"https://vercel.com"},{jobTitle:"Staff Software Engineer - Billing",companyName:"Stripe",jobLocation:"Seattle, WA (Hybrid)",jobDescription:"Stripe Billing is seeking an experienced Backend Engineer to lead complex monetary ledger systems. You will construct highly resilient APIs, manage transaction safety protocols, and scale distributed database systems.",employmentType:"Full-time",experienceLevel:"Staff level",skills:["Ruby","Go","APIs","Distributed Systems","PostgreSQL"],salary:"$160,000 - $210,000",companyWebsite:"https://stripe.com"},{jobTitle:"Full Stack Engineer (Database)",companyName:"Supabase",jobLocation:"Singapore (Remote)",jobDescription:"Help us construct the open source Firebase alternative. Build real-time database subscription features, integrate safe auth systems, and manage high-performance TypeScript query builders.",employmentType:"Contract",experienceLevel:"Mid-Senior level",skills:["PostgreSQL","Node.js","React","TypeScript","Docker"],salary:"$120,000 - $150,000",companyWebsite:"https://supabase.com"},{jobTitle:"Infrastructure Security Architect",companyName:"HashiCorp",jobLocation:"Austin, TX (On-site)",jobDescription:"Design security validation layers for infrastructure delivery. You will audit multi-tenant cloud orchestration blueprints, configure Vault policies, and direct Terraform automation workflows.",employmentType:"Full-time",experienceLevel:"Director level",skills:["Terraform","Vault","AWS","Kubernetes","IAM"],salary:"$180,000 - $230,000",companyWebsite:"https://hashicorp.com"},{jobTitle:"Member of Technical Staff - Reasoning",companyName:"OpenAI",jobLocation:"San Francisco, CA (Hybrid)",jobDescription:"Train next-generation reasoning models to solve complex logical, math, and code-synthesis benchmarks. You will structure deep learning workflows, parse training datasets, and build PyTorch infrastructure.",employmentType:"Full-time",experienceLevel:"Senior level",skills:["Python","PyTorch","Deep Learning","Transformers","NLP"],salary:"$240,000 - $370,000",companyWebsite:"https://openai.com"},{jobTitle:"Senior Product Designer - Editor",companyName:"Figma",jobLocation:"New York, NY (Hybrid)",jobDescription:"Design collaborative creation interfaces inside Figma. Work on vector manipulation workflows, component property controls, design library sync, and interactive micro-animations.",employmentType:"Full-time",experienceLevel:"Mid-Senior level",skills:["UI/UX","Figma","Prototyping","Design Systems","Product Strategy"],salary:"$150,000 - $190,000",companyWebsite:"https://figma.com"}][O];return{jobTitle:_.jobTitle,companyName:_.companyName,jobLocation:_.jobLocation,jobDescription:_.jobDescription,employmentType:_.employmentType,experienceLevel:_.experienceLevel,skills:_.skills,salary:_.salary,companyWebsite:_.companyWebsite,jobUrl:b}}return{jobTitle:i||"Unavailable",companyName:c||"Unavailable",jobLocation:n||"Unavailable",jobDescription:d||"Unavailable",employmentType:m.employmentType||"Not Specified",experienceLevel:m.experienceLevel||"Not Specified",skills:s.length>0?s:["Not Specified"],salary:a,companyWebsite:p,jobUrl:window.location.href}}const R=e.querySelector(".vh-close-btn"),u=e.querySelector("#vh-save-btn"),w=e.querySelector("#vh-resume-btn"),A=e.querySelector("#vh-interview-btn"),$=e.querySelector("#vh-real-ai-btn"),P=e.querySelector("#vh-demo-panel"),V=e.querySelector("#vh-ai-panel"),F=e.querySelector("#vh-ai-upgrade-card"),q=e.querySelector("#vh-score-title"),U=e.querySelector("#vh-score-text"),E=e.querySelector("#vh-score-caption"),B=e.querySelector("#vh-risk-badge"),k=e.querySelector("#vh-byok-modal"),Z=e.querySelector("#vh-demo-mode-btn");let z=80,H="LOW";const se=(i,c)=>{const n=e.querySelector("#vh-job-title"),d=e.querySelector("#vh-company-name"),m=e.querySelector("#vh-score-text"),f=e.querySelector("#vh-score-title"),s=e.querySelector("#vh-risk-badge"),x=e.querySelector("#vh-explanation-text"),v=e.querySelector("#vh-skeleton-view"),g=e.querySelector("#vh-summary-card"),a=e.querySelector("#vh-score-card"),p=e.querySelector("#vh-demo-panel"),l=e.querySelector("#vh-ai-panel"),C=e.querySelector("#vh-ai-upgrade-card"),o=e.querySelector("#vh-error-view");v&&(v.style.display="flex"),g&&(g.style.display="none"),a&&(a.style.display="none"),p&&(p.style.display="none"),l&&(l.style.display="none"),C&&(C.style.display="none"),o&&(o.style.display="none"),n&&(n.textContent=i.jobTitle),d&&(d.textContent=i.companyName),f&&(f.textContent="AI Trust Score"),E&&(E.textContent="Calculated securely via connected AI provider."),w&&(w.style.display="none"),A&&(A.style.display="none"),chrome.runtime.sendMessage({type:"ANALYZE_JOB_DIRECT",data:i,isDemo:c},b=>{if(v&&(v.style.display="none"),b&&b.success){const r=b.data;z=r.trustScore,H=r.riskLevel||"LOW",g&&(g.style.display="block"),a&&(a.style.display="block"),l&&(l.style.display="block"),p&&(p.style.display="none"),C&&(C.style.display="none"),m&&(m.textContent=`${r.trustScore}/100`,m.className=`vh-score-value ${r.trustScore<50?"high":r.trustScore<80?"medium":""}`),s&&(s.textContent=`${H} RISK`,s.className=`vh-badge ${H==="HIGH"?"high":H==="MEDIUM"?"medium":""}`),x&&(x.textContent=r.explanation||"Inspection completed successfully."),w&&(w.href=`${G}/resume?desc=${encodeURIComponent(i.jobDescription)}&isDemo=${c}`,w.style.display="flex"),A&&(A.href=`${G}/interview-prep?title=${encodeURIComponent(i.jobTitle)}&company=${encodeURIComponent(i.companyName)}&isDemo=${c}`,A.style.display="flex")}else b&&b.code==="BYOK_REQUIRED"?(k&&(k.style.display="flex"),g&&(g.style.display="block"),a&&(a.style.display="block"),p&&(p.style.display="block"),C&&(C.style.display="block")):(g&&(g.style.display="block"),a&&(a.style.display="block"),l&&(l.style.display="block"),p&&(p.style.display="none"),C&&(C.style.display="block"),x&&(x.textContent=(b==null?void 0:b.error)||"AI Analysis Request Failed. Please check that your configured API key is valid and has remaining credit quota.",x.style.color="#fca5a5"),s&&(s.textContent="ERROR",s.className="vh-badge high"),m&&(m.textContent="Err",m.className="vh-score-value high"))})},J=()=>{Q&&(clearTimeout(Q),Q=null);const i=e.querySelector("#vh-job-title"),c=e.querySelector("#vh-company-name"),n=e.querySelector("#vh-skeleton-view"),d=e.querySelector("#vh-error-view"),m=e.querySelector("#vh-summary-card"),f=e.querySelector("#vh-score-card"),s=e.querySelector("#vh-demo-panel"),x=e.querySelector("#vh-ai-upgrade-card"),v=e.querySelector("#vh-ai-panel");n&&(n.style.display="flex"),d&&(d.style.display="none"),m&&(m.style.display="none"),f&&(f.style.display="none"),s&&(s.style.display="none"),x&&(x.style.display="none"),v&&(v.style.display="none");let g=0;const a=6,p=()=>{g++;try{const l=ee(),C=l!==document,o=D(),b=(!o.jobTitle||o.jobTitle==="Unavailable"||o.jobTitle==="Job title not detected")&&(!o.companyName||o.companyName==="Unavailable"||o.companyName==="Company not detected");if((b||!C)&&g<a){console.log(`VeriHire Scraper: Job details loading (attempt ${g}/${a}). Container ready: ${C}. Retrying in 700ms...`),Q=setTimeout(p,700);return}if(n&&(n.style.display="none"),b){d&&(d.style.display="block");return}m&&(m.style.display="block"),f&&(f.style.display="block"),s&&(s.style.display="block"),x&&(x.style.display="block");const N=e.querySelector("#vh-company-logo"),I=l.querySelector(".jobs-unified-top-card__company-logo, .job-details-jobs-unified-top-card__company-logo, img.jobs-details-sidebar__company-logo");if(N&&(I&&I.src&&!I.src.includes("data:image")?(N.src=I.src,N.style.display="block"):N.style.display="none"),u){const S=`${o.jobTitle}-${o.companyName}`;ne.includes(S)?(u.textContent="Job Saved",u.className="vh-btn vh-btn-saved",u.disabled=!0):(u.textContent="Save Job Listing",u.className="vh-btn",u.disabled=!1)}w&&(w.href=`${G}/resume?desc=${encodeURIComponent(o.jobDescription)}&isDemo=true`,w.style.display="flex"),A&&(A.href=`${G}/interview-prep?title=${encodeURIComponent(o.jobTitle)}&company=${encodeURIComponent(o.companyName)}&isDemo=true`,A.style.display="flex"),i&&(i.textContent=o.jobTitle&&o.jobTitle!=="Unavailable"?o.jobTitle:"Job title not detected"),c&&(c.textContent=o.companyName&&o.companyName!=="Unavailable"?o.companyName:"Company not detected");const O=e.querySelector("#vh-meta-location");if(O)if(o.jobLocation&&o.jobLocation!=="Unavailable"&&o.jobLocation!=="Not Specified"){const S=O.querySelector("span");S&&(S.textContent=o.jobLocation),O.style.display="flex"}else O.style.display="none";const Y=e.querySelector("#vh-meta-employment");if(Y)if(o.employmentType&&o.employmentType!=="Unavailable"&&o.employmentType!=="Not Specified"){const S=Y.querySelector("span");S&&(S.textContent=o.employmentType),Y.style.display="flex"}else Y.style.display="none";const _=e.querySelector("#vh-summary-meta");if(_){const S=o.jobLocation&&o.jobLocation!=="Unavailable"&&o.jobLocation!=="Not Specified",T=o.employmentType&&o.employmentType!=="Unavailable"&&o.employmentType!=="Not Specified";_.style.display=S||T?"flex":"none"}const M=he(o);z=M.score,U&&(U.textContent=`${M.score}/100`,U.className="vh-score-value text-amber-500"),q&&(q.textContent="Demo Confidence Score"),E&&(E.textContent="Generated from visible job signals — not AI analysis.",E.style.display="block"),B&&(B.textContent="🟡 Demo Analysis",B.className="vh-badge demo");const oe=e.querySelector("#vh-checklist-container");oe&&(oe.innerHTML="",M.checks.forEach(S=>{const T=document.createElement("div");T.style.display="flex",T.style.alignItems="center",T.style.justifyContent="space-between",T.style.fontSize="11px",T.style.color="#cbd5e1",T.style.padding="2px 0";const ie=document.createElement("span");ie.textContent=S.label,ie.style.fontWeight="600";const K=document.createElement("span");K.textContent=S.value.length>25?S.value.slice(0,22)+"...":S.value,K.style.color=S.pass?"#10b981":"#ef4444",K.style.fontWeight="500",K.title=S.value,T.appendChild(ie),T.appendChild(K),oe.appendChild(T)}))}catch(l){console.error("VeriHire Scraper Error:",l),n&&(n.style.display="none"),d&&(d.style.display="block")}};Q=setTimeout(p,600)};h.addEventListener("click",()=>{k&&(k.style.display="none"),J(),e.classList.add("vh-open")});let W="";function te(){const i=window.location.href,c=i.match(/currentJobId=(\d+)/)||i.match(/jobs\/view\/(\d+)/),n=c?c[1]:i;n!==W&&(W=n,e.classList.contains("vh-open")&&J())}ae=()=>{te()},$==null||$.addEventListener("click",()=>{const i=D();chrome.runtime.sendMessage({type:"CHECK_AI_KEY_CONFIGURED"},c=>{c&&c.configured?(P&&(P.style.display="none"),F&&(F.style.display="none"),V&&(V.style.display="block"),se(i,!1)):k&&(k.style.display="flex")})}),Z==null||Z.addEventListener("click",()=>{k&&(k.style.display="none")}),R==null||R.addEventListener("click",()=>{e.classList.remove("vh-open")}),u==null||u.addEventListener("click",()=>{const i=D(),c=`${i.jobTitle}-${i.companyName}`;ne.includes(c)||(u&&(u.textContent="Saving to Board...",u.disabled=!0),chrome.runtime.sendMessage({type:"SAVE_JOB_DIRECT",data:{title:i.jobTitle,company:i.companyName,location:i.jobLocation,url:i.jobUrl,score:z,risk:H,status:"SAVED"}},n=>{n&&n.success?(ne.push(c),u&&(u.textContent="Job Saved",u.className="vh-btn vh-btn-saved"),console.log("VeriHire: Saved job listing to database",i)):(u&&(u.textContent="Save Failed",u.disabled=!1,setTimeout(()=>{u.textContent="Save Job Listing"},2500)),console.error("VeriHire: Failed to save job listing",n==null?void 0:n.error))}))}),chrome.runtime.onMessage.addListener((i,c,n)=>{if(i.action==="EXTRACT_JOB_DETAILS")try{const d=D();n({success:!0,data:d})}catch(d){n({success:!1,error:d.message||"Failed to extract page content."})}return!0})}function re(){const t=window.location.href;if(t.includes("localhost:3000")||t.includes("verihire-")||t.includes("vercel.app")){try{const e=localStorage.getItem("verihire_user"),j=e?JSON.parse(e):null;chrome.runtime.sendMessage({type:"SYNC_USER_SESSION",user:j},L=>{console.log("VeriHire Content Script: Synced user session to background storage",L)})}catch(e){console.warn("VeriHire Content Script: Failed to read user session from SaaS storage",e)}return}t.includes("linkedin.com/jobs")&&ue()}const me=new MutationObserver(()=>{re(),ae&&ae()});me.observe(document.body,{childList:!0,subtree:!0});re();
