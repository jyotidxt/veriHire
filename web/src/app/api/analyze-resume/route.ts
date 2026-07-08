import { NextRequest, NextResponse } from "next/server";

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

    // 3. Connect to OpenAI (with heuristic fallback)
    const apiKey = process.env.OPENAI_API_KEY;
    const isKeyConfigured = apiKey && !apiKey.includes("placeholder");

    if (isKeyConfigured) {
      try {
        console.log("VeriHire API: Triggering OpenAI Resume Match completions query.");
        
        const systemPrompt = `You are a professional recruitment parser and AI talent advisor.
Your task is to analyze the provided resume text and target job description, then output a structured JSON analysis.

CRITICAL RULES:
- Evaluate skills matching, score the alignment, and outline improvement pathways.
- Under no circumstances hardcode keys. Only return the requested JSON object format.
- Return a structured JSON object containing exactly the following keys:
  - "matchScore": a number between 0 and 100 representing how well the candidate matches the job criteria.
  - "parsedSkills": array of strings listing key skills extracted from the resume.
  - "missingSkills": array of strings listing skills required/mentioned in the job description that are missing from the resume.
  - "improvementSuggestions": array of strings providing actionable guidance on how the resume can be revised to increase match alignment.`;

        const userContent = `Resume Text:
${resumeText}

Job Description:
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
            temperature: 0.2
          })
        });

        if (openAiResponse.ok) {
          const completionJson = await openAiResponse.json();
          const parsedContent = JSON.parse(completionJson.choices[0].message.content);
          
          if (
            typeof parsedContent.matchScore === "number" &&
            Array.isArray(parsedContent.parsedSkills) &&
            Array.isArray(parsedContent.missingSkills) &&
            Array.isArray(parsedContent.improvementSuggestions)
          ) {
            analysisResult = parsedContent;
            console.log("VeriHire API: OpenAI Resume Match succeeded.");
          }
        } else {
          console.warn("VeriHire API: OpenAI completion endpoint returned error status:", openAiResponse.status);
        }
      } catch (aiErr) {
        console.error("VeriHire API: Error during OpenAI resume analysis request:", aiErr);
      }
    } else {
      console.log("VeriHire API: OpenAI API key placeholder/missing. Using Heuristic Resume engine fallback.");
    }

    // Fallback to local evaluation if OpenAI fails or key is missing
    if (!analysisResult) {
      analysisResult = evaluateResumeHeuristically(resumeText, jobDescription);
    }

    // 4. Return structured analysis result
    return NextResponse.json({
      matchScore: analysisResult.matchScore,
      parsedSkills: analysisResult.parsedSkills,
      missingSkills: analysisResult.missingSkills,
      improvementSuggestions: analysisResult.improvementSuggestions
    });
  } catch (error: any) {
    console.error("VeriHire API resume server error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message || "" },
      { status: 500 }
    );
  }
}
