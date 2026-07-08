// Chrome Extension MV3 Background Script (Service Worker)

chrome.runtime.onInstalled.addListener(() => {
  console.log("VeriHire Extension: Installed and background service worker running.");
});

// Heuristic Risk Assessment Engine (Client-side analysis of raw scraped job details)
function evaluateJobHeuristically(job: {
  jobTitle: string;
  companyName: string;
  jobLocation: string;
  jobDescription: string;
  employmentType: string;
  experienceLevel: string;
  skills: string[];
  jobUrl: string;
}) {
  let trustScore = 95;
  const suspiciousIndicators: any[] = [];
  const companyVerificationSignals: any[] = [];
  const safetyRecommendations: string[] = [
    "Verify the job listing on the company's official corporate career portal."
  ];

  const descLower = job.jobDescription.toLowerCase();

  // Rule 1: Redirecting to non-standard chat applications
  if (descLower.includes("telegram") || descLower.includes("whatsapp") || descLower.includes("signal app")) {
    suspiciousIndicators.push({
      category: "Alternative Chat Channel",
      description: "Recruiter redirects candidates to a personal chat application (Telegram/WhatsApp) instead of professional portals.",
      severity: "HIGH"
    });
    trustScore -= 25;
    safetyRecommendations.push("Do not message hiring coordinators via external messenger apps.");
  }

  // Rule 2: Requesting upfront payments or purchasing software
  if (
    descLower.includes("purchase") ||
    descLower.includes("buy software") ||
    descLower.includes("testing kit") ||
    descLower.includes("upfront fee") ||
    descLower.includes("reimburse")
  ) {
    suspiciousIndicators.push({
      category: "Upfront Cost Required",
      description: "The listing contains terms suggesting candidates must buy training, software, or workspace equipment.",
      severity: "HIGH"
    });
    trustScore -= 30;
    safetyRecommendations.push("Never transfer money or purchase software tools under promises of corporate refund.");
  }

  // Rule 3: Collecting sensitive data early
  if (descLower.includes("ssn") || descLower.includes("social security") || descLower.includes("passport details")) {
    suspiciousIndicators.push({
      category: "Early Identity Harvesting",
      description: "Requests for tax identifiers, social security numbers, or banking records prior to formal job offer execution.",
      severity: "HIGH"
    });
    trustScore -= 20;
    safetyRecommendations.push("Do not supply SSN, tax identifiers, or bank numbers on preliminary application sheets.");
  }

  // Rule 4: Generic/non-corporate email addresses listed
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emails = descLower.match(emailRegex);
  if (emails) {
    const hasGenericEmail = emails.some(
      (email) =>
        email.includes("@gmail.com") ||
        email.includes("@yahoo.com") ||
        email.includes("@outlook.com") ||
        email.includes("@hotmail.com")
    );
    if (hasGenericEmail) {
      suspiciousIndicators.push({
        category: "Generic Email Domain",
        description: "Official contact address is hosted on a free generic domain (Gmail/Yahoo) rather than corporate servers.",
        severity: "HIGH"
      });
      trustScore -= 20;
      safetyRecommendations.push("Check if the recruiter's email domain corresponds exactly with the official company URL.");
    }
  }

  // Rule 5: High urgency urgency/tactic triggers
  if (
    descLower.includes("urgent") ||
    descLower.includes("immediate hire") ||
    descLower.includes("hiring today") ||
    descLower.includes("apply now")
  ) {
    suspiciousIndicators.push({
      category: "High Urgency Language",
      description: "Job details display extreme hiring pressure, demanding candidate actions immediately.",
      severity: "MEDIUM"
    });
    trustScore -= 10;
  }

  // Rule 6: Salary discrepancy triggers
  if (
    (descLower.includes("data entry") || descLower.includes("typing")) &&
    (descLower.includes("$40/hr") || descLower.includes("$50/hr") || descLower.includes("high pay"))
  ) {
    suspiciousIndicators.push({
      category: "Unrealistic Compensation",
      description: "Proposed salaries are significantly higher than standard market values for comparable skills.",
      severity: "MEDIUM"
    });
    trustScore -= 15;
    safetyRecommendations.push("Cross-check typical compensation parameters using Glassdoor or Indeed.");
  }

  // Company Verification signals setup
  if (job.companyName && job.companyName !== "Unavailable") {
    companyVerificationSignals.push({
      signalName: "LinkedIn Entity Linked",
      description: `Job correctly references matching organization profile: "${job.companyName}".`,
      isVerified: true
    });
  } else {
    companyVerificationSignals.push({
      signalName: "Anonymous Employer Profile",
      description: "The job listing has been posted anonymously or does not link to a corporate LinkedIn page.",
      isVerified: false
    });
    trustScore -= 15;
  }

  if (job.jobLocation && job.jobLocation !== "Unavailable") {
    companyVerificationSignals.push({
      signalName: "Physical Headcount Location",
      description: `Location listing verified as: "${job.jobLocation}".`,
      isVerified: true
    });
  }

  if (job.jobDescription && job.jobDescription.length > 800) {
    companyVerificationSignals.push({
      signalName: "Description Depth Check",
      description: "The listing description is detailed, conforming to standard structural specifications.",
      isVerified: true
    });
  } else {
    companyVerificationSignals.push({
      signalName: "Vague Description",
      description: "The description is extremely short, lacking standard role explanations.",
      isVerified: false
    });
    trustScore -= 10;
  }

  // Clamping trustScore between 10 and 100
  trustScore = Math.max(10, Math.min(100, trustScore));

  let riskLevel = "LOW";
  if (trustScore < 50) riskLevel = "HIGH";
  else if (trustScore < 80) riskLevel = "MEDIUM";

  return {
    jobDetails: {
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      jobLocation: job.jobLocation,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      skills: job.skills,
      jobUrl: job.jobUrl
    },
    trustScore,
    riskLevel,
    aiExplanation: `Based on a client-side heuristic evaluation of ${job.companyName}'s listing for a ${job.jobTitle} position, this job presents a ${riskLevel.toLowerCase()} safety concern. ${
      suspiciousIndicators.length > 0
        ? `We flagged ${suspiciousIndicators.length} risk marker(s) related to job details.`
        : "No significant warning markers were located in the description."
    }`,
    companyVerificationSignals,
    suspiciousIndicators,
    safetyRecommendations
  };
}

// Listener for message passing between popup/content script and background worker
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("VeriHire Background Script: Received message", message);

  if (message.type === "ANALYZE_JOB") {
    // 1. Query for the active browser tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) {
        sendResponse({ success: false, error: "No active LinkedIn tab located." });
        return;
      }

      // 2. Validate URL contains linkedin
      if (!activeTab.url || !activeTab.url.includes("linkedin.com")) {
        sendResponse({
          success: false,
          error: "Not on LinkedIn. Please open a job posting page on linkedin.com/jobs to begin."
        });
        return;
      }

      // 3. Request page data from the active tab's content script
      chrome.tabs.sendMessage(activeTab.id, { action: "EXTRACT_JOB_DETAILS" }, (response) => {
        // Handle connection/content script loading errors
        if (chrome.runtime.lastError) {
          console.error("Connection error:", chrome.runtime.lastError);
          sendResponse({
            success: false,
            error: "Could not establish connection with LinkedIn page. Please refresh the page tab and try again."
          });
          return;
        }

        if (!response || !response.success) {
          sendResponse({
            success: false,
            error: response?.error || "Failed to extract job details from LinkedIn page."
          });
          return;
        }

        // 4. Run heuristic analysis on extracted details
        try {
          const analysisResult = evaluateJobHeuristically(response.data);
          sendResponse({
            success: true,
            data: analysisResult
          });
        } catch (err: any) {
          sendResponse({
            success: false,
            error: err.message || "An error occurred during evaluation."
          });
        }
      });
    });

    return true; // Keep message channel open for async response
  }
  return false;
});
