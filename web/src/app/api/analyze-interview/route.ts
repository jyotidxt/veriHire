import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

// Local heuristic fallback if OpenAI is unreachable or key is missing
function generateInterviewPrepHeuristically(jobTitle: string, companyName: string) {
  const titleLower = jobTitle.toLowerCase();
  
  // Custom mock guides based on job title keywords
  const isFrontend = titleLower.includes("front") || titleLower.includes("react") || titleLower.includes("ui");
  const isBackend = titleLower.includes("back") || titleLower.includes("node") || titleLower.includes("api") || titleLower.includes("system");

  const hrQuestions = [
    {
      question: "Why do you want to join " + companyName + " at this point in your career?",
      suggestion: "Research the company's product philosophy. Align your personal career goals with their growth trajectory."
    },
    {
      question: "Describe a project where you faced a tight timeline or ambiguous requirements. How did you deliver?",
      suggestion: "Use the STAR method (Situation, Task, Action, Result). Highlight communication steps and tradeoffs you made."
    }
  ];

  let technicalQuestions = [
    {
      question: "Describe how you optimize the loading performance of a web application.",
      suggestion: "Mention code splitting, image lazy loading, tree shaking, caching headers, and bundle size profiling."
    },
    {
      question: "Explain the differences between SQL database design normalization and denormalization.",
      suggestion: "Explain read/write speeds, consistency tradeoffs, indexes, and write locks."
    }
  ];

  if (isFrontend) {
    technicalQuestions = [
      {
        question: "Explain React's reconciliation process and virtual DOM.",
        suggestion: "Explain how React diffs fibers, state batching updates, and keys optimization."
      },
      {
        question: "How do you manage client-side state propagation in a Next.js App Router setup?",
        suggestion: "Explain Server Components vs Client Components boundary design, context APIs, or Zustand."
      }
    ];
  } else if (isBackend) {
    technicalQuestions = [
      {
        question: "How do you manage relational schema migrations without causing production service downtime?",
        suggestion: "Discuss backward-compatible column migrations, double-writing phases, and database locks."
      },
      {
        question: "Explain how you design a rate-limiter system for public REST APIs.",
        suggestion: "Mention Redis token buckets, sliding logs, and HTTP headers like 429 Too Many Requests."
      }
    ];
  }

  const companyQuestions = [
    {
      question: "How would you improve the developer experience or core product offering of " + companyName + "?",
      suggestion: "Pinpoint a minor feature lag or developer tool integration of the company and propose a clear deployment strategy."
    },
    {
      question: "How do you handle scaling challenges for " + companyName + "'s target audience?",
      suggestion: "Align your solution to their key users (e.g. business users for SaaS, tech developers for tooling)."
    }
  ];

  let codingQuestions = [
    {
      question: "Two Sum Match",
      problemDescription: "Given an array of integers 'nums' and an integer 'target', return indices of the two numbers such that they add up to 'target'. You may assume that each input would have exactly one solution.",
      solutionStub: `function twoSum(nums: number[], target: number): number[] {\n  // Write your code here\n  return [];\n}`,
      suggestion: "Use a Hash Map helper to store lookup indices. This achieves a linear time complexity O(N) compared to a brute force O(N^2)."
    }
  ];

  if (isFrontend) {
    codingQuestions = [
      {
        question: "Array Prototype GroupBy",
        problemDescription: "Write a function that groups an array of objects by a specific key, returning an object mapped by group keys.",
        solutionStub: `function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {\n  // Write your code here\n  return {};\n}`,
        suggestion: "Use a standard Array.reduce accumulator or a for...of loop to instantiate arrays on the target key dynamically."
      }
    ];
  } else if (isBackend) {
    codingQuestions = [
      {
        question: "Sliding Window Maximum",
        problemDescription: "Given an array of integers, there is a sliding window of size k which is moving from the very left of the array to the very right. Find the maximum values inside each window frame.",
        solutionStub: `function maxSlidingWindow(nums: number[], k: number): number[] {\n  // Write your code here\n  return [];\n}`,
        suggestion: "Use a Monotonic Deque queue to store indices. This allows checking maximums in O(N) linear time."
      }
    ];
  }

  return {
    hrQuestions,
    technicalQuestions,
    companyQuestions,
    codingQuestions
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

    const { jobTitle, companyName, jobDescription = "" } = body;

    const validationErrors: string[] = [];
    if (!jobTitle || typeof jobTitle !== "string") {
      validationErrors.push("Job Title ('jobTitle') is a required non-empty string parameter.");
    }
    if (!companyName || typeof companyName !== "string") {
      validationErrors.push("Company Name ('companyName') is a required non-empty string parameter.");
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
      analysisResult = generateInterviewPrepHeuristically(jobTitle, companyName);
    } else {
      try {
        const systemPrompt = `You are a professional technical interviewer. Generate interview preparation questions.
        Return a structured JSON object containing exactly the following keys:
        - "hrQuestions": array of objects with keys: "question" (string), "suggestion" (string).
        - "technicalQuestions": array of objects with keys: "question" (string), "suggestion" (string).
        - "companyQuestions": array of objects with keys: "question" (string), "suggestion" (string).
        - "codingQuestions": array of objects with keys: "question" (string), "problemDescription" (string), "solutionStub" (string), "suggestion" (string).`;

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
                { role: "user", content: `Job Title: ${jobTitle}\nCompany: ${companyName}\nDescription: ${jobDescription}` }
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
              contents: [{ parts: [{ text: `${systemPrompt}\n\nJob details:\nTitle: ${jobTitle}\nCompany: ${companyName}\nDescription: ${jobDescription}` }] }],
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
                { role: "user", content: `Job details: Title: ${jobTitle}, Company: ${companyName}, Description: ${jobDescription}` }
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
                { role: "user", content: `Job details: Title: ${jobTitle}, Company: ${companyName}, Description: ${jobDescription}` }
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
              messages: [{ role: "user", content: `${systemPrompt}\nJob Title: ${jobTitle}, Company: ${companyName}, Description: ${jobDescription}. Return valid JSON string only.` }]
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
        console.warn("AI Config interview prep failed. Running heuristic fallback.", err);
        analysisResult = generateInterviewPrepHeuristically(jobTitle, companyName);
      }
    }

    if (!analysisResult) {
      analysisResult = generateInterviewPrepHeuristically(jobTitle, companyName);
    }

    return NextResponse.json({
      hrQuestions: analysisResult.hrQuestions || [],
      technicalQuestions: analysisResult.technicalQuestions || [],
      companyQuestions: analysisResult.companyQuestions || [],
      codingQuestions: analysisResult.codingQuestions || []
    });
  } catch (error: any) {
    console.error("VeriHire API interview prep server error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message || "" },
      { status: 500 }
    );
  }
}
