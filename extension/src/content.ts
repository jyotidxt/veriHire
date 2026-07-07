// Chrome Extension MV3 Content Script

console.log("VeriHire Content Script initialized on LinkedIn.");

// Listener for messages from background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request, "from sender:", sender);
  
  if (request.action === "GET_PAGE_DATA") {
    // Basic DOM scraping mock. In future milestones, this parses the LinkedIn DOM tree.
    const jobTitle = document.querySelector(".jobs-unified-top-card__job-title")?.textContent?.trim() || "Mock Job Title";
    const companyName = document.querySelector(".jobs-unified-top-card__company-name")?.textContent?.trim() || "Mock Company Name";
    const jobDescription = document.querySelector(".jobs-box__html-content")?.textContent?.trim() || "Mock Job Description content...";

    sendResponse({
      title: jobTitle,
      company: companyName,
      description: jobDescription,
      url: window.location.href
    });
  }
});

// Setup MutationObserver to watch LinkedIn page updates and logs
const observer = new MutationObserver(() => {
  const jobContainer = document.querySelector(".jobs-search__results-list") || document.querySelector(".jobs-description");
  if (jobContainer) {
    console.log("VeriHire: Detected LinkedIn job container on page.");
  }
});

observer.observe(document.body, { childList: true, subtree: true });
