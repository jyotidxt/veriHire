import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

function getAuthenticatedUserId(req: NextRequest) {
  let userId = req.headers.get("x-user-id") || "system_default_user";
  try {
    const authSession = auth();
    if (authSession && authSession.userId) {
      userId = authSession.userId;
    }
  } catch (e) {}
  return userId;
}

export async function POST(req: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(req);
    const body = await req.json();
    const { provider, key } = body;

    if (!provider) {
      return NextResponse.json({ success: false, error: "Provider is required." }, { status: 400 });
    }

    // Determine the active API key to test
    let testKey = key;
    if (!testKey || testKey.includes("••••")) {
      // Fetch saved key from DB
      const config = await prisma.aIConfig.findUnique({
        where: { userId }
      });
      if (!config) {
        return NextResponse.json({ success: false, error: "No saved key found. Please input a key first." }, { status: 400 });
      }

      if (provider === "OPENAI") testKey = decrypt(config.openaiKey || "");
      else if (provider === "GEMINI") testKey = decrypt(config.geminiKey || "");
      else if (provider === "ANTHROPIC") testKey = decrypt(config.anthropicKey || "");
      else if (provider === "GROQ") testKey = decrypt(config.groqKey || "");
      else if (provider === "OPENROUTER") testKey = decrypt(config.openrouterKey || "");
    }

    if (!testKey) {
      return NextResponse.json({ success: false, error: "API key is empty." }, { status: 400 });
    }

    let isConnected = false;
    let errorMessage = "";

    try {
      if (provider === "OPENAI") {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${testKey}` }
        });
        if (res.status === 200) isConnected = true;
        else {
          const errBody = await res.json().catch(() => ({}));
          errorMessage = errBody?.error?.message || `HTTP ${res.status}`;
        }
      } else if (provider === "GEMINI") {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${testKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }] })
        });
        if (res.status === 200) isConnected = true;
        else {
          const errBody = await res.json().catch(() => ({}));
          errorMessage = errBody?.error?.message || `HTTP ${res.status}`;
        }
      } else if (provider === "GROQ") {
        const res = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { Authorization: `Bearer ${testKey}` }
        });
        if (res.status === 200) isConnected = true;
        else {
          const errBody = await res.json().catch(() => ({}));
          errorMessage = errBody?.error?.message || `HTTP ${res.status}`;
        }
      } else if (provider === "OPENROUTER") {
        const res = await fetch("https://openrouter.ai/api/v1/models", {
          headers: { Authorization: `Bearer ${testKey}` }
        });
        if (res.status === 200) isConnected = true;
        else {
          const errBody = await res.json().catch(() => ({}));
          errorMessage = errBody?.error?.message || `HTTP ${res.status}`;
        }
      } else if (provider === "ANTHROPIC") {
        // Anthropic message creation checks keys authorization, we send a lightweight mock request
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": testKey,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1,
            messages: [{ role: "user", content: "ping" }]
          })
        });
        // 400 is acceptable because it means key is authorized but schema properties mismatch, 401 is unauthorized
        if (res.status === 200 || res.status === 400) isConnected = true;
        else {
          const errBody = await res.json().catch(() => ({}));
          errorMessage = errBody?.error?.message || `HTTP ${res.status}`;
        }
      } else {
        errorMessage = "Unknown provider.";
      }
    } catch (fetchErr: any) {
      errorMessage = fetchErr.message || "Network request failed.";
    }

    if (isConnected) {
      // Update database config lastTestedAt timestamp
      await prisma.aIConfig.updateMany({
        where: { userId },
        data: { lastTestedAt: new Date() }
      });
      return NextResponse.json({ success: true, message: "Connection verified successfully!" });
    } else {
      return NextResponse.json({ success: false, error: errorMessage || "Verification failed." }, { status: 401 });
    }
  } catch (error: any) {
    console.error("POST /api/settings/ai-config/test error:", error);
    return NextResponse.json(
      { success: false, error: "Internal test failed", details: error.message || "" },
      { status: 500 }
    );
  }
}
