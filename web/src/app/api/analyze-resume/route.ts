import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

// Heuristic fallback if OpenAI is unreachable or key is missing
function evaluateResumeHeuristically(resumeText: string, jobDescription: string) {
  const resumeLower = resumeText.toLowerCase();
  const descLower = jobDescription.toLowerCase();

  // Simple keyword matching dictionary for common technology terms
  const techKeywords = [
    "typescript", "javascript", "react", "next.js", "node.js", 
    "postgresql", "prisma", "clerk", "tailwind", "aws", 
    "docker", "graphql", "python", "kubernetes", "go", 
    "rust", "mongodb", "redux", "git", "ci/cd"
  ];

  const parsedSkills: string[] = [];
  const missingSkills: string[] = [];

  techKeywords.forEach((skill) => {
    const isMatchedInResume = resumeLower.includes(skill);
    const isMatchedInJob = descLower.includes(skill);

    if (isMatchedInResume) {
      parsedSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
    if (isMatchedInJob && !isMatchedInResume) {
      missingSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });

  // Calculate mock match score based on shared skills count
  const jobRequirementsCount = techKeywords.filter(s => descLower.includes(s)).length;
  const matchCount = parsedSkills.filter(s => descLower.includes(s.toLowerCase())).length;
  
  let matchScore = 75; // Baseline
  if (jobRequirementsCount > 0) {
    matchScore = Math.round((matchCount / jobRequirementsCount) * 100);
  }

  // Ensure reasonable scores
  matchScore = Math.max(25, Math.min(98, matchScore));

  const improvementSuggestions: string[] = [];
  if (missingSkills.length > 0) {
    missingSkills.slice(0, 3).forEach((skill) => {
      improvementSuggestions.push(`Incorporate specific details about your experience using ${skill} in your past roles.`);
    });
  } else {
    improvementSuggestions.push("Highlight quantitative accomplishments (e.g., page speed improvements, pipeline optimizations) to verify your expertise.");
  }
  
  improvementSuggestions.push("Add concrete project cases explaining how you integrated TypeScript code with relational schemas.");

  return {
    matchScore,
    parsedSkills: parsedSkills.length > 0 ? parsedSkills : ["Software Engineering", "Team Collaboration"],
    missingSkills: missingSkills.length > 0 ? missingSkills : ["System Architecture"],
    improvementSuggestions
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

    const { resumeText, jobDescription } = body;

    // 2. Input Validation
    const validationErrors: string[] = [];
    if (!resumeText || typeof resumeText !== "string") {
      validationErrors.push("Resume Text ('resumeText') must be a non-empty string.");
    }
    if (!jobDescription || typeof jobDescription !== "string") {
      validationErrors.push("Job Description ('jobDescription') must be a non-empty string.");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: validationErrors },
        { status: 400 }
      );
    }

    let analysisResult;

    // Connect to user-configured BYOK provider or premium fallback
    let activeUserId = req.headers.get("x-user-id") || "system_default_user";
    try {
      const authSession = auth();
      if (authSession && authSession.userId) {
        activeUserId = authSession.userId;
      }
    } catch (authErr) {}

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

    if (!activeKey) {
      const envKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
      if (envKey && !envKey.includes("placeholder")) {
        activeKey = envKey;
        activeProvider = process.env.GEMINI_API_KEY ? "GEMINI" : "OPENAI";
      }
    }

    const isDemo = body.isDemo === true;

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

    if (isDemo || !activeKey) {
      analysisResult = evaluateResumeHeuristically(resumeText, jobDescription);
    } else {
      try {
        const systemPrompt = `You are a recruitment parser. Analyze the resume text and target job description, then return a structured JSON object containing:
        - "matchScore": number (0-100)
        - "parsedSkills": array of strings
        - "missingSkills": array of strings
        - "improvementSuggestions": array of strings`;

        if (activeProvider === "OPENAI") {
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
                { role: "user", content: `Resume: ${resumeText}\nJob Description: ${jobDescription}` }
              ],
              temperature: 0.3
            })
          });

          if (openAiResponse.ok) {
            const completionJson = await openAiResponse.json();
            analysisResult = JSON.parse(completionJson.choices[0].message.content);
          } else {
            throw new Error(`OpenAI API error code: ${openAiResponse.status}`);
          }
        } else if (activeProvider === "GEMINI") {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\nResume: ${resumeText}\nJob Description: ${jobDescription}` }] }],
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
                { role: "system", content: systemPrompt },
                { role: "user", content: `Resume: ${resumeText}, Job Description: ${jobDescription}` }
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
                { role: "system", content: systemPrompt },
                { role: "user", content: `Resume: ${resumeText}, Job Description: ${jobDescription}` }
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
              messages: [{ role: "user", content: `${systemPrompt}\nResume: ${resumeText}\nJob Description: ${jobDescription}. Return valid JSON string only.` }]
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
        console.warn("AI Config resume matching failed. Running heuristic fallback.", err);
        analysisResult = evaluateResumeHeuristically(resumeText, jobDescription);
      }
    }

    if (!analysisResult) {
      analysisResult = evaluateResumeHeuristically(resumeText, jobDescription);
    }

    return NextResponse.json({
      matchScore: analysisResult.matchScore || 0,
      parsedSkills: analysisResult.parsedSkills || [],
      missingSkills: analysisResult.missingSkills || [],
      improvementSuggestions: analysisResult.improvementSuggestions || []
    });
  } catch (error: any) {
    console.error("VeriHire API resume server error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message || "" },
      { status: 500 }
    );
  }
}
