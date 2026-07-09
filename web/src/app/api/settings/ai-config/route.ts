import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { encrypt, decrypt, maskApiKey } from "@/lib/encryption";

// Helper to determine the authenticated user ID
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

// GET: Retrieve the active user's AI configurations (with keys masked)
export async function GET(req: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(req);

    // Fetch config or return defaults
    let config = await prisma.aIConfig.findUnique({
      where: { userId }
    });

    if (!config) {
      return NextResponse.json({
        activeProvider: "OPENAI",
        openaiKeySet: false,
        geminiKeySet: false,
        anthropicKeySet: false,
        groqKeySet: false,
        openrouterKeySet: false,
        openaiKeyMasked: "",
        geminiKeyMasked: "",
        anthropicKeyMasked: "",
        groqKeyMasked: "",
        openrouterKeyMasked: "",
        lastTestedAt: null
      });
    }

    const decryptedOpenai = decrypt(config.openaiKey || "");
    const decryptedGemini = decrypt(config.geminiKey || "");
    const decryptedAnthropic = decrypt(config.anthropicKey || "");
    const decryptedGroq = decrypt(config.groqKey || "");
    const decryptedOpenrouter = decrypt(config.openrouterKey || "");

    return NextResponse.json({
      activeProvider: config.activeProvider,
      openaiKeySet: !!config.openaiKey,
      geminiKeySet: !!config.geminiKey,
      anthropicKeySet: !!config.anthropicKey,
      groqKeySet: !!config.groqKey,
      openrouterKeySet: !!config.openrouterKey,
      openaiKeyMasked: decryptedOpenai ? maskApiKey(decryptedOpenai) : "",
      geminiKeyMasked: decryptedGemini ? maskApiKey(decryptedGemini) : "",
      anthropicKeyMasked: decryptedAnthropic ? maskApiKey(decryptedAnthropic) : "",
      groqKeyMasked: decryptedGroq ? maskApiKey(decryptedGroq) : "",
      openrouterKeyMasked: decryptedOpenrouter ? maskApiKey(decryptedOpenrouter) : "",
      lastTestedAt: config.lastTestedAt
    });
  } catch (error: any) {
    console.error("GET /api/settings/ai-config error:", error);
    return NextResponse.json(
      { success: false, error: "Database retrieval failed", details: error.message || "" },
      { status: 500 }
    );
  }
}

// POST: Update AI configs and encrypt new API keys
export async function POST(req: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(req);
    const body = await req.json();

    const {
      activeProvider,
      openaiKey,
      geminiKey,
      anthropicKey,
      groqKey,
      openrouterKey
    } = body;

    // Fetch existing config
    let config = await prisma.aIConfig.findUnique({
      where: { userId }
    });

    const updateData: any = {};
    if (activeProvider) {
      updateData.activeProvider = activeProvider;
    }

    // Process keys: if key has prefix of mask, skip updating (since it wasn't edited)
    // If it's empty, clear it. Otherwise encrypt and save.
    const processKeyUpdate = (newKeyVal: string | undefined, currentEncryptedVal: string | null | undefined) => {
      if (newKeyVal === undefined) return undefined;
      if (newKeyVal === "") return null;
      if (newKeyVal.includes("••••")) return undefined; // No change
      return encrypt(newKeyVal);
    };

    const openaiVal = processKeyUpdate(openaiKey, config?.openaiKey);
    const geminiVal = processKeyUpdate(geminiKey, config?.geminiKey);
    const anthropicVal = processKeyUpdate(anthropicKey, config?.anthropicKey);
    const groqVal = processKeyUpdate(groqKey, config?.groqKey);
    const openrouterVal = processKeyUpdate(openrouterKey, config?.openrouterKey);

    if (openaiVal !== undefined) updateData.openaiKey = openaiVal;
    if (geminiVal !== undefined) updateData.geminiKey = geminiVal;
    if (anthropicVal !== undefined) updateData.anthropicKey = anthropicVal;
    if (groqVal !== undefined) updateData.groqKey = groqVal;
    if (openrouterVal !== undefined) updateData.openrouterKey = openrouterVal;

    // Ensure User profile exists before inserting related AIConfig
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: req.headers.get("x-user-email") || `${userId}@verihire.app`,
        fullName: req.headers.get("x-user-name") || "VeriHire User",
        subscriptionTier: "FREE"
      }
    });

    const updated = await prisma.aIConfig.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        activeProvider: activeProvider || "OPENAI",
        openaiKey: openaiVal || null,
        geminiKey: geminiVal || null,
        anthropicKey: anthropicVal || null,
        groqKey: groqVal || null,
        openrouterKey: openrouterVal || null
      }
    });

    return NextResponse.json({ success: true, provider: updated.activeProvider });
  } catch (error: any) {
    console.error("POST /api/settings/ai-config error:", error);
    return NextResponse.json(
      { success: false, error: "Database update failed", details: error.message || "" },
      { status: 500 }
    );
  }
}
