import crypto from "crypto";

// Use a secret defined in environment variables, hashing it to get exactly 32 bytes
const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET || "verihire_default_secure_secret_32_bytes_long_12345";
const IV_LENGTH = 16;

function getSecretKey() {
  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
}

/**
 * Encrypt a plain-text API key.
 */
export function encrypt(text: string): string {
  if (!text) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", getSecretKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an encrypted API key.
 */
export function decrypt(text: string): string {
  if (!text) return "";
  try {
    const parts = text.split(":");
    const iv = Buffer.from(parts.shift() || "", "hex");
    const encryptedText = parts.join(":");
    const decipher = crypto.createDecipheriv("aes-256-cbc", getSecretKey(), iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return "";
  }
}

/**
 * Helper to mask a raw API key for safe client display.
 * Returns sk-...2345 or similar format.
 */
export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 10) return "••••••••";
  return `${key.slice(0, 7)}••••••••${key.slice(-4)}`;
}
