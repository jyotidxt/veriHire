// Chrome Extension MV3 Background Script (Service Worker)

chrome.runtime.onInstalled.addListener(() => {
  console.log("VeriHire Extension installed and running.");
});

// Listener for message passing between popup/content script and background worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message in service worker:", message, "from sender:", sender);

  if (message.type === "ANALYZE_JOB") {
    // Simulated API response for Milestone 1
    setTimeout(() => {
      sendResponse({
        success: true,
        data: {
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
        }
      });
    }, 1000);

    return true; // Keeps channel open for async response
  }
  return false;
});
