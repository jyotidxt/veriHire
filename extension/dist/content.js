console.log("VeriHire Content Script: Initializing floating UI injector.");if(window.location.hostname==="localhost"||window.location.hostname.includes("vercel.app")){const e=localStorage.getItem("verihire_user");if(e)try{const c=JSON.parse(e);chrome.runtime.sendMessage({type:"SYNC_USER_SESSION",user:c},p=>{console.log("VeriHire Content Script: Session synced successfully with background worker:",p)})}catch(c){console.error("VeriHire Content Script: Failed to parse verihire_user from localStorage",c)}}const H=!("update_url"in chrome.runtime.getManifest()),D=H?"http://localhost:3000":"https://verihire-jyotidxt.vercel.app",M='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8.24-2a1 1 0 0 1 .48 0l8.24 2A1 1 0 0 1 20 6z"/></svg>',P='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18M6 6l12 12"/></svg>',O='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',J='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-briefcase"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>',V=`
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
`;function F(e){let c=50;const p=[],o=e.companyName&&e.companyName!=="Unavailable"&&e.companyName!=="Hiring Company";c+=o?5:0,p.push({label:"Company Detected",value:o?e.companyName:"Missing",pass:o});const k=e.jobTitle&&e.jobTitle!=="Unavailable"&&e.jobTitle!=="Software Developer";c+=k?5:0,p.push({label:"Job Title",value:k?e.jobTitle:"Missing",pass:k});const A=e.jobLocation&&e.jobLocation!=="Unavailable"&&e.jobLocation!=="Remote / Hybrid";c+=A?5:0,p.push({label:"Location",value:A?e.jobLocation:"Missing",pass:A});const S=e.employmentType&&e.employmentType!=="Not Specified";c+=S?5:0,p.push({label:"Employment Type",value:S?e.employmentType:"Not Specified",pass:S});const m=e.skills?e.skills.filter(_=>_!=="Not Specified").length:0;c+=m>0?Math.min(10,m*2):0,p.push({label:"Skills Count",value:m>0?`${m} skills`:"None Detected",pass:m>0});const s=e.experienceLevel&&e.experienceLevel!=="Not Specified";c+=s?5:0,p.push({label:"Seniority Level",value:s?e.experienceLevel:"Not Specified",pass:s});const v=e.jobDescription?e.jobDescription.length:0,y=v>800;c+=v>1500?10:v>800?5:0,p.push({label:"Description Length",value:`${v} chars`,pass:y});const g=e.jobDescription.toLowerCase(),w=/(\$|salary|salary range|hourly|compensation|pay rate|\d+\s*k)/i.test(g);c+=w?10:0,p.push({label:"Salary Details",value:w?"Mentioned":"Not Specified",pass:w});const E=/(https?:\/\/[^\s]+)/g,C=(e.jobDescription.match(E)||[]).length>0;c+=C?5:0,p.push({label:"External Website",value:C?"Detected":"Not Detected",pass:C});const x=e.jobUrl&&e.jobUrl.includes("linkedin.com");c+=x?5:0,p.push({label:"Application Link",value:x?"Detected":"Not Detected",pass:x});const N=g.includes("remote")||e.jobLocation.toLowerCase().includes("remote"),f=g.includes("hybrid"),T=g.includes("on-site")||g.includes("onsite"),j=N?"Remote":f?"Hybrid":T?"On-site":"Not Specified";return c+=j!=="Not Specified"?5:0,p.push({label:"Workplace Mode",value:j,pass:j!=="Not Specified"}),c=Math.min(100,Math.max(10,c)),{score:c,checks:p}}let z=null,q=[];function G(){if(document.getElementById("verihire-floating-root"))return;const e=document.createElement("div");e.id="verihire-floating-root",document.body.appendChild(e),z=e.attachShadow({mode:"open"});const c=document.createElement("style");c.textContent=V,z.appendChild(c);const p=document.createElement("div");p.className="vh-bubble",p.innerHTML=`
    ${M}
    <div class="vh-tooltip">Analyze job with VeriHire</div>
  `,z.appendChild(p);const o=document.createElement("div");o.className="vh-drawer",o.innerHTML=`
    <div class="vh-header">
      <div class="vh-logo">
        ${M}
        <span>VeriHire AI</span>
      </div>
      <button class="vh-close-btn">${P}</button>
    </div>
    
    <div class="vh-content">
      <!-- Scraped metadata card -->
      <div class="vh-card">
        <h3 class="vh-title" id="vh-job-title">Software Developer</h3>
        <p class="vh-company" id="vh-company-name">TechGlobal Solutions</p>
        <div class="vh-meta-row">
          <div class="vh-meta-item">
            ${O}
            <span id="vh-job-location">Remote</span>
          </div>
          <div class="vh-meta-item">
            ${J}
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
      <a href="${D}/dashboard" target="_blank" class="vh-btn-secondary">
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
          <a href="${D}/settings/ai-providers" target="_blank" class="vh-btn" style="text-decoration:none; text-align: center;">Configure AI Provider</a>
          <button class="vh-btn-secondary" id="vh-demo-mode-btn">Continue Using Demo Mode</button>
        </div>
      </div>
    </div>
  `,z.appendChild(o);function k(i){var l;for(const r of i){const b=document.querySelector(r);if(b){const u=(l=b.textContent)==null?void 0:l.trim();if(u)return u}}return""}function A(){const i=document.querySelectorAll(".jobs-unified-top-card__job-insight, .job-details-jobs-unified-top-card__job-insight, .description__job-criteria-text");let l="",r="";const b=[];return i.forEach(u=>{var h;const a=((h=u.textContent)==null?void 0:h.trim())||"";if(a.includes("·"))a.split("·").map(d=>d.trim()).forEach(d=>{const n=d.toLowerCase();n.includes("full-time")||n.includes("part-time")||n.includes("contract")||n.includes("temporary")||n.includes("internship")?l=d:(n.includes("entry level")||n.includes("mid-senior")||n.includes("associate")||n.includes("director")||n.includes("executive")||n.includes("no experience"))&&(r=d)});else{const t=a.toLowerCase();t.includes("full-time")||t.includes("part-time")||t.includes("contract")||t.includes("temporary")?l=a:(t.includes("entry level")||t.includes("mid-senior")||t.includes("associate")||t.includes("director")||t.includes("no experience"))&&(r=a)}(a.toLowerCase().includes("skills")||a.toLowerCase().includes("skills:"))&&a.replace(/(Skills:|skills:)/i,"").trim().split(",").forEach(d=>{const n=d.trim();n&&b.push(n)})}),{employmentType:l,experienceLevel:r,skills:b}}function S(){const i=k([".job-details-jobs-unified-top-card__job-title",".jobs-unified-top-card__job-title",".jobs-unified-top-card__job-title-link","h1.t-24",".jobs-search-jobs-unified-top-card__job-title-link",".top-card-layout__title"]),l=k([".jobs-unified-top-card__company-name",".job-details-jobs-unified-top-card__company-name",".jobs-unified-top-card__company-name-link",".jobs-unified-top-card__company-name a",".topcard__org-name-link",".top-card-layout__card .top-card-layout__first-subline a"]),r=k([".jobs-unified-top-card__bullet",".jobs-unified-top-card__bullet-point",".job-details-jobs-unified-top-card__bullet",".jobs-unified-top-card__bullet-point-container",".topcard__flavor--bullet",".top-card-layout__card .top-card-layout__first-subline span:nth-child(2)"]),b=k(["#job-details",".jobs-description__content",".jobs-description-content__text",".jobs-box__html-content",".description__text"]),u=A(),a=[...u.skills];return document.querySelectorAll(".app-shared-outline-pill").forEach(h=>{var d;const t=(d=h.textContent)==null?void 0:d.trim();t&&!a.includes(t)&&a.push(t)}),{jobTitle:i||"Unavailable",companyName:l||"Unavailable",jobLocation:r||"Unavailable",jobDescription:b||"Unavailable",employmentType:u.employmentType||"Not Specified",experienceLevel:u.experienceLevel||"Not Specified",skills:a.length>0?a:["Not Specified"],jobUrl:window.location.href}}const m=o.querySelector(".vh-close-btn"),s=o.querySelector("#vh-save-btn"),v=o.querySelector("#vh-resume-btn"),y=o.querySelector("#vh-interview-btn"),g=o.querySelector("#vh-real-ai-btn"),I=o.querySelector("#vh-demo-panel"),w=o.querySelector("#vh-ai-panel"),E=o.querySelector("#vh-ai-upgrade-card"),R=o.querySelector("#vh-score-title"),C=o.querySelector("#vh-score-text"),x=o.querySelector("#vh-score-caption"),N=o.querySelector("#vh-risk-badge"),f=o.querySelector("#vh-byok-modal"),T=o.querySelector("#vh-demo-mode-btn");let j=80,_="LOW";const $=(i,l)=>{const r=o.querySelector("#vh-job-title"),b=o.querySelector("#vh-company-name"),u=o.querySelector("#vh-job-location"),a=o.querySelector("#vh-score-text"),h=o.querySelector("#vh-score-title"),t=o.querySelector("#vh-risk-badge"),d=o.querySelector("#vh-explanation-text");r&&(r.textContent=i.jobTitle),b&&(b.textContent=i.companyName),u&&(u.textContent=i.jobLocation),a&&(a.textContent="...",a.className="vh-score-value"),t&&(t.textContent="ANALYZING...",t.className="vh-badge"),d&&(d.textContent="Connecting to AI analysis engine to calculate safety metrics..."),h&&(h.textContent="AI Trust Score"),x&&(x.textContent="Calculated securely via connected AI provider."),v&&(v.style.display="none"),y&&(y.style.display="none"),chrome.runtime.sendMessage({type:"ANALYZE_JOB_DIRECT",data:i,isDemo:l},n=>{if(n&&n.success){const L=n.data;j=L.trustScore,_=L.riskLevel||"LOW",a&&(a.textContent=`${L.trustScore}/100`,a.className=`vh-score-value ${L.trustScore<50?"high":L.trustScore<80?"medium":""}`),t&&(t.textContent=`${_} RISK`,t.className=`vh-badge ${_==="HIGH"?"high":_==="MEDIUM"?"medium":""}`),d&&(d.textContent=L.explanation||"Inspection completed successfully."),v&&(v.href=`${D}/resume?desc=${encodeURIComponent(i.jobDescription)}&isDemo=${l}`,v.style.display="flex"),y&&(y.href=`${D}/interview-prep?title=${encodeURIComponent(i.jobTitle)}&company=${encodeURIComponent(i.companyName)}&isDemo=${l}`,y.style.display="flex")}else n&&n.code==="BYOK_REQUIRED"?f&&(f.style.display="flex"):(d&&(d.textContent=(n==null?void 0:n.error)||"Connection to VeriHire local dev server failed. Please verify the web app is running on port 3000."),t&&(t.textContent="OFFLINE",t.className="vh-badge high"))})};p.addEventListener("click",()=>{const i=S();if(f&&(f.style.display="none"),s){const h=`${i.jobTitle}-${i.companyName}`;q.includes(h)?(s.textContent="Job Saved",s.className="vh-btn vh-btn-saved",s.disabled=!0):(s.textContent="Save Job Listing",s.className="vh-btn",s.disabled=!1)}const l=o.querySelector("#vh-job-title"),r=o.querySelector("#vh-company-name"),b=o.querySelector("#vh-job-location");l&&(l.textContent=i.jobTitle),r&&(r.textContent=i.companyName),b&&(b.textContent=i.jobLocation);const u=F(i);j=u.score,C&&(C.textContent=`${u.score}/100`,C.className="vh-score-value text-amber-500"),R&&(R.textContent="Demo Confidence Score"),x&&(x.textContent="Generated from visible job signals — not AI analysis.",x.style.display="block"),N&&(N.textContent="🟡 Demo Analysis",N.className="vh-badge demo");const a=o.querySelector("#vh-checklist-container");a&&(a.innerHTML="",u.checks.forEach(h=>{const t=document.createElement("div");t.style.display="flex",t.style.alignItems="center",t.style.justifyContent="space-between",t.style.fontSize="11px",t.style.color="#cbd5e1",t.style.padding="2px 0";const d=document.createElement("span");d.textContent=h.label,d.style.fontWeight="600";const n=document.createElement("span");n.textContent=h.value.length>25?h.value.slice(0,22)+"...":h.value,n.style.color=h.pass?"#10b981":"#ef4444",n.style.fontWeight="500",n.title=h.value,t.appendChild(d),t.appendChild(n),a.appendChild(t)})),I&&(I.style.display="block"),w&&(w.style.display="none"),E&&(E.style.display="block"),v&&(v.style.display="none"),y&&(y.style.display="none"),o.classList.add("vh-open")}),g==null||g.addEventListener("click",()=>{const i=S();chrome.runtime.sendMessage({type:"CHECK_AI_KEY_CONFIGURED"},l=>{l&&l.configured?(I&&(I.style.display="none"),E&&(E.style.display="none"),w&&(w.style.display="block"),$(i,!1)):f&&(f.style.display="flex")})}),T==null||T.addEventListener("click",()=>{f&&(f.style.display="none")}),m==null||m.addEventListener("click",()=>{o.classList.remove("vh-open")}),s==null||s.addEventListener("click",()=>{const i=S(),l=`${i.jobTitle}-${i.companyName}`;q.includes(l)||(s&&(s.textContent="Saving to Board...",s.disabled=!0),chrome.runtime.sendMessage({type:"SAVE_JOB_DIRECT",data:{title:i.jobTitle,company:i.companyName,location:i.jobLocation,url:i.jobUrl,score:j,risk:_,status:"SAVED"}},r=>{r&&r.success?(q.push(l),s&&(s.textContent="Job Saved",s.className="vh-btn vh-btn-saved"),console.log("VeriHire: Saved job listing to database",i)):(s&&(s.textContent="Save Failed",s.disabled=!1,setTimeout(()=>{s.textContent="Save Job Listing"},2500)),console.error("VeriHire: Failed to save job listing",r==null?void 0:r.error))}))}),chrome.runtime.onMessage.addListener((i,l,r)=>{if(i.action==="EXTRACT_JOB_DETAILS")try{const b=S();r({success:!0,data:b})}catch(b){r({success:!1,error:b.message||"Failed to extract page content."})}return!0})}function U(){window.location.href.includes("linkedin.com/jobs")&&G()}const B=new MutationObserver(()=>{U()});B.observe(document.body,{childList:!0,subtree:!0});U();
