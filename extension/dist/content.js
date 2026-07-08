console.log("VeriHire Content Script: Initializing floating UI injector.");const u='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8.24-2a1 1 0 0 1 .48 0l8.24 2A1 1 0 0 1 20 6z"/></svg>',m='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18M6 6l12 12"/></svg>',w='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',y='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-briefcase"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>',k=`
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
`;function h(){var e,a,t;const n=document.querySelector(".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24"),r=document.querySelector(".jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__company-name"),i=document.querySelector(".jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet-point");return{title:((e=n==null?void 0:n.textContent)==null?void 0:e.trim())||"Software Developer",company:((a=r==null?void 0:r.textContent)==null?void 0:a.trim())||"Hiring Company",location:((t=i==null?void 0:i.textContent)==null?void 0:t.trim())||"Remote / Hybrid"}}let p=null,b=[];function S(){if(document.getElementById("verihire-floating-root"))return;const n=document.createElement("div");n.id="verihire-floating-root",document.body.appendChild(n),p=n.attachShadow({mode:"open"});const r=document.createElement("style");r.textContent=k,p.appendChild(r);const i=document.createElement("div");i.className="vh-bubble",i.innerHTML=`
    ${u}
    <div class="vh-tooltip">Analyze job with VeriHire</div>
  `,p.appendChild(i);const e=document.createElement("div");e.className="vh-drawer",e.innerHTML=`
    <div class="vh-header">
      <div class="vh-logo">
        ${u}
        <span>VeriHire AI</span>
      </div>
      <button class="vh-close-btn">${m}</button>
    </div>
    
    <div class="vh-content">
      <!-- Scraped metadata card -->
      <div class="vh-card">
        <h3 class="vh-title" id="vh-job-title">Software Developer</h3>
        <p class="vh-company" id="vh-company-name">TechGlobal Solutions</p>
        <div class="vh-meta-row">
          <div class="vh-meta-item">
            ${w}
            <span id="vh-job-location">Remote</span>
          </div>
          <div class="vh-meta-item">
            ${y}
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
  `,p.appendChild(e);const a=e.querySelector(".vh-close-btn"),t=e.querySelector("#vh-save-btn");i.addEventListener("click",()=>{const o=h(),c=e.querySelector("#vh-job-title"),v=e.querySelector("#vh-company-name"),g=e.querySelector("#vh-job-location"),s=e.querySelector("#vh-score-text"),l=e.querySelector("#vh-risk-badge"),d=e.querySelector("#vh-explanation-text");if(c&&(c.textContent=o.title),v&&(v.textContent=o.company),g&&(g.textContent=o.location),o.title.toLowerCase().includes("data entry")||o.company.toLowerCase().includes("freelance")||document.body.innerText.toLowerCase().includes("telegram")?(s&&(s.textContent="42/100",s.className="vh-score-value high"),l&&(l.textContent="High Risk",l.className="vh-badge high"),d&&(d.textContent="Description contains warning parameters (e.g. high pay for simple task). Exercise caution.")):(s&&(s.textContent="88/100",s.className="vh-score-value"),l&&(l.textContent="Low Risk",l.className="vh-badge"),d&&(d.textContent="Hiring company registry checked. Details conform to standard recruitment practices.")),t){const f=`${o.title}-${o.company}`;b.includes(f)?(t.textContent="Job Saved",t.className="vh-btn vh-btn-saved"):(t.textContent="Save Job Listing",t.className="vh-btn")}e.classList.add("vh-open")}),a==null||a.addEventListener("click",()=>{e.classList.remove("vh-open")}),t==null||t.addEventListener("click",()=>{const o=h(),c=`${o.title}-${o.company}`;b.includes(c)||(b.push(c),t&&(t.textContent="Job Saved",t.className="vh-btn vh-btn-saved"),console.log("VeriHire: Saved job listing locally",o))})}function x(){window.location.href.includes("linkedin.com/jobs")&&S()}const C=new MutationObserver(()=>{x()});C.observe(document.body,{childList:!0,subtree:!0});x();chrome.runtime.onMessage.addListener((n,r,i)=>{if(n.action==="EXTRACT_JOB_DETAILS"){const e=h();i({success:!0,data:{jobTitle:e.title,companyName:e.company,jobLocation:e.location,jobDescription:document.body.innerText.substring(0,1e3),employmentType:"Full-time",experienceLevel:"Mid-Senior level",skills:["Scraped"],jobUrl:window.location.href}})}return!0});
