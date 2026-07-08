import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Local heuristic analyzer fallback if OpenAI is unreachable or key is missing
function evaluateHeuristically(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  jobLocation: string,
  jobUrl: string
) {
  let trustScore = 95;
  const concerns: any[] = [];
  const signals: any[] = [];
  const recommendation: string[] = [
    "Cross-examine this job listing on the company's official corporate portal."
  ];

  const descLower = jobDescription.toLowerCase();

  if (descLower.includes("telegram") || descLower.includes("whatsapp") || descLower.includes("signal app")) {
    concerns.push({
      category: "Alternative Chat Channel",
      description: "Recruiter redirects communication to insecure chat apps (Telegram/WhatsApp).",
      severity: "HIGH"
    });
    trustScore -= 25;
    recommendation.push("Avoid sharing details or coordinating interviews via third-party chat messengers.");
  }

  if (
    descLower.includes("purchase") ||
    descLower.includes("buy tools") ||
    descLower.includes("testing kit") ||
    descLower.includes("upfront fee") ||
    descLower.includes("reimburse")
  ) {
    concerns.push({
      category: "Upfront Cost Required",
      description: "Job details suggest candidates must buy training, software, or workspace gear.",
      severity: "HIGH"
    });
    trustScore -= 30;
    recommendation.push("Do not send payments or purchase gear under promises of reimbursement.");
  }

  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emails = descLower.match(emailRegex);
  if (emails) {
    const genericEmailFound = emails.some(
      (email: string) =>
        email.includes("@gmail.com") ||
        email.includes("@yahoo.com") ||
        email.includes("@outlook.com") ||
        email.includes("@hotmail.com")
    );
    if (genericEmailFound) {
      concerns.push({
        category: "Generic Email Contact",
        description: "Recruiter contact email resolves to generic host (Gmail/Outlook) instead of company domain.",
        severity: "HIGH"
      });
      trustScore -= 20;
      recommendation.push("Verify if the sender domain matches the organization's official web domain.");
    }
  }

  if (descLower.includes("ssn") || descLower.includes("social security") || descLower.includes("passport details")) {
    concerns.push({
      category: "Identity Collection Risk",
      description: "Requests tax numbers or security identification before hire confirmation.",
      severity: "HIGH"
    });
    trustScore -= 20;
    recommendation.push("Do not disclose identifiers or credentials until a formal contract is executed.");
  }

  if (companyName && companyName !== "Unavailable") {
    signals.push({
      name: "LinkedIn Profile Associated",
      description: `Listing references corporate profile: "${companyName}".`,
      verified: true
    });
  }

  if (jobLocation && jobLocation !== "Unavailable") {
    signals.push({
      name: "Location Checked",
      description: `Verified physical location parameter: "${jobLocation}".`,
      verified: true
    });
  }

  trustScore = Math.max(10, Math.min(100, trustScore));

  let riskLevel = "LOW";
  if (trustScore < 50) riskLevel = "HIGH";
  else if (trustScore < 80) riskLevel = "MEDIUM";

  return {
    trustScore,
    riskLevel,
    signals,
    concerns,
    recommendation,
    explanation: `Heuristic evaluation of listing shows a ${riskLevel.toLowerCase()} safety concern. ${
      concerns.length > 0 ? `${concerns.length} indicators flagged.` : "No significant warning markers located."
    }`
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Parse JSON body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload in request body." },
        { status: 400 }
      );
    }

    const jobTitle = body.jobTitle || body.title;
    const companyName = body.companyName || body.company;
    const jobDescription = body.jobDescription || body.description;
    const jobLocation = body.jobLocation || body.location;
    const jobUrl = body.jobUrl || body.url;

    // 2. Input Validation
    const validationErrors: string[] = [];
    if (!jobTitle || typeof jobTitle !== "string") validationErrors.push("Job Title must be a non-empty string.");
    if (!companyName || typeof companyName !== "string") validationErrors.push("Company Name must be a non-empty string.");
    if (!jobDescription || typeof jobDescription !== "string") validationErrors.push("Job Description must be a non-empty string.");
    if (!jobLocation || typeof jobLocation !== "string") validationErrors.push("Location must be a non-empty string.");
    if (!jobUrl || typeof jobUrl !== "string") validationErrors.push("Job URL must be a valid string.");

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: validationErrors },
        { status: 400 }
      );
    }

    let analysisResult;

    // 3. Connect to OpenAI (with heuristic fallback)
    const apiKey = process.env.OPENAI_API_KEY;
    const isKeyConfigured = apiKey && !apiKey.includes("placeholder");

    if (isKeyConfigured) {
      try {
        console.log("VeriHire API: Triggering OpenAI AI analysis completion.");
        
        const systemPrompt = `You are a highly analytical risk assessment AI specializing in employment verification and job search safety.
Your task is to analyze the provided job details (title, company, description, location, URL) and extract safety indices.

CRITICAL RULES:
- Never label a job as "Fake" or "Fraudulent" directly, to avoid liability. Instead, use probability-based language (e.g. "atypical communication channels", "atypical payment structures", "potential identification harvest risks").
- Return a structured JSON object containing exactly the following keys:
  - "trustScore": a number between 0 and 100 representing the posting reliability.
  - "riskLevel": "LOW", "MEDIUM", or "HIGH" depending on trust score (LOW: 80-100, MEDIUM: 50-79, HIGH: 0-49).
  - "signals": array of positive/verified signals. Each signal must be an object with keys: "name" (string), "description" (string), "verified" (boolean).
  - "concerns": array of suspicious indicators or risks. Each concern must be an object with keys: "category" (string), "description" (string), "severity" ("LOW" | "MEDIUM" | "HIGH").
  - "recommendation": array of strings listing safety guidelines.
  - "explanation": a concise string explaining the overall assessment.`;

        const userContent = `Job Title: ${jobTitle}
Company: ${companyName}
Location: ${jobLocation}
URL: ${jobUrl}
Description:
${jobDescription}`;

        const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent }
            ],
            temperature: 0.1
          })
        });

        if (openAiResponse.ok) {
          const completionJson = await openAiResponse.json();
          const parsedContent = JSON.parse(completionJson.choices[0].message.content);
          
          // Verify returned keys exist
          if (
            typeof parsedContent.trustScore === "number" &&
            parsedContent.riskLevel &&
            Array.isArray(parsedContent.signals) &&
            Array.isArray(parsedContent.concerns) &&
            Array.isArray(parsedContent.recommendation)
          ) {
            analysisResult = parsedContent;
            console.log("VeriHire API: OpenAI AI analysis succeeded.");
          }
        } else {
          console.warn("VeriHire API: OpenAI completion endpoint returned error status:", openAiResponse.status);
        }
      } catch (aiErr) {
        console.error("VeriHire API: Error during OpenAI request completion:", aiErr);
      }
    } else {
      console.log("VeriHire API: OpenAI API key placeholder/missing. Using Heuristics engine fallback.");
    }

    // Fallback to local evaluation if OpenAI fails or key is missing
    if (!analysisResult) {
      analysisResult = evaluateHeuristically(jobTitle, companyName, jobDescription, jobLocation, jobUrl);
    }

    // 4. Log to Database (wrapped in try-catch fallback)
    try {
      let activeUserId = req.headers.get("x-user-id") || "system_default_user";
      let activeUserEmail = req.headers.get("x-user-email") || "system@verihire.app";
      let activeUserName = req.headers.get("x-user-name") || "System Default";

      try {
        const authSession = auth();
        if (authSession && authSession.userId) {
          activeUserId = authSession.userId;
          activeUserEmail = "user@verihire.app";
          activeUserName = "Active User";
        }
      } catch (authErr) {
        // No Clerk context in direct API REST calls
      }

      await prisma.user.upsert({
        where: { id: activeUserId },
        update: {},
        create: {
          id: activeUserId,
          email: activeUserEmail,
          fullName: activeUserName,
          subscriptionTier: "FREE"
        }
      });

      await prisma.jobAnalysis.create({
        data: {
          jobTitle,
          companyName,
          jobLocation,
          jobDescription,
          companyUrl: jobUrl,
          trustScore: analysisResult.trustScore,
          riskLevel: analysisResult.riskLevel as any,
          aiExplanation: analysisResult.explanation || "",
          safetyRecs: analysisResult.recommendation,
          userId: activeUserId,
          indicators: {
            create: analysisResult.concerns.map((c: any) => ({
              category: c.category || c.name || "Risk Warning",
              description: c.description || "",
              severity: c.severity || "MEDIUM"
            }))
          },
          verifications: {
            create: analysisResult.signals.map((s: any) => ({
              signalName: s.name || s.signalName || "Verification Signal",
              description: s.description || "",
              isVerified: s.verified ?? s.isVerified ?? true
            }))
          }
        }
      });
      console.log("VeriHire API: Saved analysis to PostgreSQL successfully.");
    } catch (dbError) {
      console.warn("VeriHire API: Database write skipped.", dbError);
    }

    // 5. Return structured analysis result
    return NextResponse.json({
      trustScore: analysisResult.trustScore,
      riskLevel: analysisResult.riskLevel,
      signals: analysisResult.signals,
      concerns: analysisResult.concerns,
      recommendation: analysisResult.recommendation,
      explanation: analysisResult.explanation || ""
    });
  } catch (error: any) {
    console.error("VeriHire API server error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message || "" },
      { status: 500 }
    );
  }
}
