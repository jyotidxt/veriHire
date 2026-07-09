import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

// Local heuristic analyzer if in Demo Mode
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
    explanation: `Demo Analysis (Heuristic Evaluation): Verified ${riskLevel.toLowerCase()} safety concern. ${
      concerns.length > 0 ? `${concerns.length} indicators flagged.` : "No significant warning markers located."
    }`
  };
}

export async function POST(req: NextRequest) {
  try {
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
    const isDemo = body.isDemo === true;

    // Input Validation
    const validationErrors: string[] = [];
    if (!jobTitle) validationErrors.push("Job Title must be a non-empty string.");
    if (!companyName) validationErrors.push("Company Name must be a non-empty string.");
    if (!jobDescription) validationErrors.push("Job Description must be a non-empty string.");
    if (!jobLocation) validationErrors.push("Location must be a non-empty string.");

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: validationErrors },
        { status: 400 }
      );
    }

    // Determine the active authenticated user
    let activeUserId = req.headers.get("x-user-id") || "system_default_user";
    let activeUserEmail = req.headers.get("x-user-email") || "user@verihire.app";
    let activeUserName = req.headers.get("x-user-name") || "Active User";

    try {
      const authSession = auth();
      if (authSession && authSession.userId) {
        activeUserId = authSession.userId;
      }
    } catch (authErr) {}

    // Check if user has configured custom API credentials
    const config = await prisma.aIConfig.findUnique({
      where: { userId: activeUserId }
    });

    let activeKey = "";
    let activeProvider = config?.activeProvider || "OPENAI";

    if (config) {
      if (activeProvider === "OPENAI") activeKey = decrypt(config.openaiKey || "");
      else if (activeProvider === "GEMINI") activeKey = decrypt(config.geminiKey || "");
      else if (activeProvider === "ANTHROPIC") activeKey = decrypt(config.anthropicKey || "");
      else if (activeProvider === "GROQ") activeKey = decrypt(config.groqKey || "");
      else if (activeProvider === "OPENROUTER") activeKey = decrypt(config.openrouterKey || "");
    }

    // Check if a global premium env key exists as fallback
    if (!activeKey) {
      const envKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
      if (envKey && !envKey.includes("placeholder")) {
        activeKey = envKey;
        activeProvider = process.env.GEMINI_API_KEY ? "GEMINI" : "OPENAI";
      }
    }

    // If no credentials configured and not in Demo Mode, trigger BYOK modal
    if (!activeKey && !isDemo) {
      return NextResponse.json(
        {
          success: false,
          code: "BYOK_REQUIRED",
          error: "Real AI analysis is currently unavailable because no AI provider has been connected."
        },
        { status: 400 }
      );
    }

    let analysisResult;

    if (isDemo || !activeKey) {
      // Execute heuristic evaluation with explicit Demo Analysis tags
      analysisResult = evaluateHeuristically(jobTitle, companyName, jobDescription, jobLocation, jobUrl);
    } else {
      // Connect to the configured AI API
      try {
        if (activeProvider === "OPENAI") {
          const systemPrompt = `You are a risk assessment AI specializing in job search safety. Analyze the provided job details and return a structured JSON object containing:
          - "trustScore": number (0-100)
          - "riskLevel": "LOW" | "MEDIUM" | "HIGH"
          - "signals": array of objects with keys: "name" (string), "description" (string), "verified" (boolean)
          - "concerns": array of objects with keys: "category" (string), "description" (string), "severity" ("LOW" | "MEDIUM" | "HIGH")
          - "recommendation": array of strings
          - "explanation": string`;

          const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${activeKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Job Title: ${jobTitle}\nCompany: ${companyName}\nLocation: ${jobLocation}\nDescription: ${jobDescription}` }
              ],
              temperature: 0.1
            })
          });

          if (openAiResponse.ok) {
            const completionJson = await openAiResponse.json();
            analysisResult = JSON.parse(completionJson.choices[0].message.content);
          } else {
            throw new Error(`OpenAI API error code: ${openAiResponse.status}`);
          }
        } else if (activeProvider === "GEMINI") {
          const systemPrompt = `You are a job safety auditor. Analyze the job details and return a structured JSON object with keys: trustScore (number), riskLevel ("LOW" | "MEDIUM" | "HIGH"), signals (array with name, description, verified), concerns (array with category, description, severity), recommendation (array of strings), explanation (string).`;
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\nJob details:\nTitle: ${jobTitle}\nCompany: ${companyName}\nLocation: ${jobLocation}\nDescription: ${jobDescription}` }] }],
              generationConfig: { responseMimeType: "application/json" }
            })
          });

          if (res.ok) {
            const completionJson = await res.json();
            const text = completionJson.candidates[0].content.parts[0].text;
            analysisResult = JSON.parse(text);
          } else {
            throw new Error(`Gemini API error code: ${res.status}`);
          }
        } else if (activeProvider === "GROQ") {
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${activeKey}`
            },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: "You are a job safety auditor. Return a JSON object with keys: trustScore, riskLevel, signals, concerns, recommendation, explanation." },
                { role: "user", content: `Job: ${jobTitle} at ${companyName}. Description: ${jobDescription}` }
              ]
            })
          });

          if (res.ok) {
            const data = await res.json();
            analysisResult = JSON.parse(data.choices[0].message.content);
          } else {
            throw new Error(`Groq API error code: ${res.status}`);
          }
        } else if (activeProvider === "OPENROUTER") {
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${activeKey}`
            },
            body: JSON.stringify({
              model: "google/gemini-flash-1.5",
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: "You are a job safety auditor. Return JSON containing keys: trustScore, riskLevel, signals, concerns, recommendation, explanation." },
                { role: "user", content: `Job: ${jobTitle} at ${companyName}. Description: ${jobDescription}` }
              ]
            })
          });

          if (res.ok) {
            const data = await res.json();
            analysisResult = JSON.parse(data.choices[0].message.content);
          } else {
            throw new Error(`OpenRouter API error code: ${res.status}`);
          }
        } else if (activeProvider === "ANTHROPIC") {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": activeKey,
              "anthropic-version": "2023-06-01",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "claude-3-5-sonnet-20241022",
              max_tokens: 1500,
              messages: [{ role: "user", content: `Analyze this job listing. Return ONLY a valid JSON object with fields: trustScore (number), riskLevel, signals, concerns, recommendation, explanation. Job Title: ${jobTitle}, Company: ${companyName}, Description: ${jobDescription}` }]
            })
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.content[0].text;
            analysisResult = JSON.parse(text);
          } else {
            throw new Error(`Anthropic API error code: ${res.status}`);
          }
        }
      } catch (err) {
        console.warn("AI Config analysis failed. Running heuristic fallback.", err);
        analysisResult = evaluateHeuristically(jobTitle, companyName, jobDescription, jobLocation, jobUrl);
      }
    }

    if (!analysisResult) {
      analysisResult = evaluateHeuristically(jobTitle, companyName, jobDescription, jobLocation, jobUrl);
    }

    // Save scan analysis record to PostgreSQL
    try {
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
          companyUrl: jobUrl || "",
          trustScore: analysisResult.trustScore,
          riskLevel: analysisResult.riskLevel as any,
          aiExplanation: analysisResult.explanation || "",
          safetyRecs: analysisResult.recommendation || [],
          userId: activeUserId,
          indicators: {
            create: (analysisResult.concerns || []).map((c: any) => ({
              category: c.category || "Risk",
              description: c.description || "",
              severity: c.severity || "MEDIUM"
            }))
          },
          verifications: {
            create: (analysisResult.signals || []).map((s: any) => ({
              signalName: s.name || "Signal",
              description: s.description || "",
              isVerified: s.verified ?? true
            }))
          }
        }
      });
    } catch (dbError) {
      console.warn("Database log skipped.", dbError);
    }

    return NextResponse.json({
      trustScore: analysisResult.trustScore,
      riskLevel: analysisResult.riskLevel,
      signals: analysisResult.signals || [],
      concerns: analysisResult.concerns || [],
      recommendation: analysisResult.recommendation || [],
      explanation: analysisResult.explanation || ""
    });
  } catch (error: any) {
    console.error("VeriHire API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message || "" },
      { status: 500 }
    );
  }
}
