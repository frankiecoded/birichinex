/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import http from "http";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { WebSocketServer } from "ws";
import {
  TwilioCallContext,
  buildInboundTwiml,
  buildConversationalTwiml,
  buildOutboundTwiml,
  getTwilioConfigStatus,
  isLiveReady,
  placeOutboundCall,
} from "./ai/src/twilio-client";
import {
  handleTwilioMediaStream,
  isGeminiLiveReady,
  isLiveConversationReady,
} from "./ai/src/media-stream";
import { handleLiveVoiceSocket } from "./ai/src/live-session";
import {
  getPaymentMode,
  getPaymentProvider,
  isSimulationProvider,
  verifyFlutterwaveWebhook,
} from "./payments/provider";
import { MEMBERSHIP_TIERS } from "./src/data/platform";
import {
  HF_MODEL,
  callHuggingFaceChat,
  callHuggingFaceStream,
  hfConfigured,
  type HFChatMessage,
} from "./ai/src/hf-client";

dotenv.config({ quiet: true });
// Prefer a local .env.local override when present (dev machines often keep
// secrets there). Server-side keys are read after this, so override wins.
dotenv.config({ path: path.join(process.cwd(), ".env.local"), override: true, quiet: true });

const app = express();
app.disable("x-powered-by");
// Trust the first proxy hop so req.protocol / req.ip reflect the original
// client request (needed for Twilio signature validation behind Caddy/Funnel).
app.set("trust proxy", true);
// Business snapshots (inventory, orders, docs…) can be a few MB of JSON.
// 2mb cap on JSON bodies — larger than any legitimate request this app makes.
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─── Security hardening: headers, origin guard, host guard ───────────────────
// Layered defenses against cross-origin abuse, drive-by scraping, and the
// open-port vector on the VPS.

// Origins that may call this API cross-origin (browser sends Origin). Everything
// else is rejected before any handler runs. Same-origin / server-to-server
// requests (curl, Twilio, Paystack, health checks from the box) send no Origin
// and are governed by the host + header guards below instead.
const ALLOWED_ORIGINS = new Set([
  "https://birichinex.com",
  "https://www.birichinex.com",
  "http://localhost:5173",   // Vite dev server
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "https://portmetals-backend.tailab82b8.ts.net",
]);

// Hosts the API is legitimately served under (Vercel mirrors + the funnel host).
// A request whose Host is the bare public IP (169.58.184.20:3000) or anything
// unknown is rejected unless it originated from the server itself (loopback),
// which keeps local smoke tests working while closing the open-port vector.
const ALLOWED_HOSTS = new Set([
  "birichinex.com",
  "www.birichinex.com",
  "portmetals-backend.tailab82b8.ts.net",
  "localhost",
  "127.0.0.1",
]);

function isLoopback(remote: string): boolean {
  const r = String(remote || "").replace(/^::ffff:/, "");
  return r === "127.0.0.1" || r === "::1" || r === "localhost";
}

function hostAllowed(req: express.Request): boolean {
  const host = String(req.get("host") || "").toLowerCase();
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) return true;
  if (host.endsWith(".vercel.app")) return true;   // Vercel preview/mirror deploys
  if (ALLOWED_HOSTS.has(host)) return true;
  // Requests arriving through the server's own loopback (Caddy/funnel proxy)
  // carry a trusted forwarded host.
  if (isLoopback(req.socket.remoteAddress || "")) return true;
  return false;
}

// Applied to every /api/* request. Ordering matters: reject routing probes,
// block cross-origin callers, then let same-origin/trusted clients through.
app.use("/api", (req, res, next) => {
  const origin = req.get("origin") || "";
  if (origin && !ALLOWED_ORIGINS.has(origin) && !/\.vercel\.app$/.test(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Device-Secret, Authorization");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  if (!hostAllowed(req)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
});

// Standardized security headers on every response (API + SPA assets).
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(self), geolocation=(self), payment=(self)",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: data:",
    "connect-src 'self' wss: ws: https://api.openai.com https://api.anthropic.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
    "form-action 'self'",
  ].join("; "),
};
const HTTPS_SECURITY_HEADERS: Record<string, string> = {
  ...SECURITY_HEADERS,
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

app.use((req, res, next) => {
  const isHttps = String(req.get("x-forwarded-proto") || "").startsWith("https") || req.protocol === "https";
  Object.entries(isHttps ? HTTPS_SECURITY_HEADERS : SECURITY_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  next();
});

const PORT = Number(process.env.PORT) || 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is missing. AI Features will fall back to smart local simulation.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ─── Supabase (Postgres) — cloud state sync ─────────────────────────────────

let supabaseClient: any = null;
function getSupabase(): any {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    supabaseClient = createClient(url, key, { auth: { persistSession: false } });
  }
  return supabaseClient;
}

function syncEnabled(): boolean {
  return Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SYNC_DEVICE_SECRET
  );
}

// Shared device secret gates the sync endpoints. The browser bundle carries the
// matching VITE_SYNC_DEVICE_SECRET value; this stops anonymous drive-by reads/
// writes of business_state while keeping the single-user flow simple. Fails
// closed: if the secret is missing, sync is disabled entirely. The server reads
// either SYNC_DEVICE_SECRET or VITE_SYNC_DEVICE_SECRET, so a deploy can set one
// shared generated value (Render's generateValue) that both sides see.
const SYNC_DEVICE_SECRET = process.env.SYNC_DEVICE_SECRET || process.env.VITE_SYNC_DEVICE_SECRET || "";

function deviceSecretValid(req: express.Request): boolean {
  const provided = String(req.headers["x-device-secret"] || "");
  if (!provided || !SYNC_DEVICE_SECRET) return false;
  const a = crypto.createHash("sha256").update(provided).digest();
  const b = crypto.createHash("sha256").update(SYNC_DEVICE_SECRET).digest();
  return crypto.timingSafeEqual(a, b);
}

// ─── Rate limiting (in-memory, per-IP) ───────────────────────────────────────
// Enough for a single-owner app: a few requests per second on the AI endpoints
// keeps a misbehaving client from burning the free Gemini tier or the VPS.

const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 40; // per window per IP across all AI endpoints
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

// Resolve the *real* client address. X-Forwarded-For is only trusted when the
// immediate peer is the proxy (loopback / Tailscale CGNAT funnel). A caller
// connecting directly to port 3000 with a forged header is rate-limited by
// their actual socket address instead, so spoofing can't evade the budget.
function isTrustedProxy(remote: string): boolean {
  const r = String(remote || "").replace(/^::ffff:/, "");
  if (r === "127.0.0.1" || r === "::1" || r.startsWith("100.")) return true;
  return false;
}

function clientIp(req: express.Request): string {
  const remote = String(req.socket.remoteAddress || "");
  const forwarded = String(req.headers["x-forwarded-for"] || "")
    .split(",")[0]
    ?.trim();
  if (forwarded && isTrustedProxy(remote)) return forwarded;
  return remote || forwarded || "unknown";
}

function rateLimited(req: express.Request): boolean {
  const ip = clientIp(req);
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  if (bucket.count > RATE_MAX) return true;
  return false;
}

function applyRateLimit(req: express.Request, res: express.Response): boolean {
  if (rateLimited(req)) {
    res.status(429).json({ error: "Too many requests. Please slow down." });
    return true;
  }
  return false;
}

// Tighter budgets for the highest-cost endpoints (real money or paid calls).
const COST_ARTIFACT_MAX = 12; // per 60s per IP (e.g. Twilio call placement)
const COST_ARTIFACT_WINDOW_MS = 60_000;
const costArtifactBuckets = new Map<string, { count: number; resetAt: number }>();

function applyCostArtifactRateLimit(req: express.Request, res: express.Response): boolean {
  const ip = clientIp(req);
  const now = Date.now();
  const bucket = costArtifactBuckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    costArtifactBuckets.set(ip, { count: 1, resetAt: now + COST_ARTIFACT_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  if (bucket.count > COST_ARTIFACT_MAX) {
    res.status(429).json({ error: "Too many requests. Please slow down." });
    return true;
  }
  return false;
}

// ─── Ollama (self-hosted Qwen3 on the Contabo VPS) — the primary live provider ──

// Enable by setting OLLAMA_ENABLED=true (or OLLAMA_BASE_URL) in production. In
// local dev with no Ollama install, the server skips it and uses Gemini/local.
const OLLAMA_ENABLED = process.env.OLLAMA_ENABLED === "true" || Boolean(process.env.OLLAMA_BASE_URL);
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1").replace(/\/+$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:4b";
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || "ollama"; // required but ignored by Ollama

let ollamaHealthy: boolean | null = null;
async function checkOllama(): Promise<boolean> {
  if (!OLLAMA_ENABLED) return false;
  if (ollamaHealthy !== null) return ollamaHealthy;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`${OLLAMA_BASE_URL}/models`, { signal: ctrl.signal });
    clearTimeout(timer);
    ollamaHealthy = res.ok;
  } catch {
    ollamaHealthy = false;
  }
  if (!ollamaHealthy) {
    console.warn(`Ollama unreachable at ${OLLAMA_BASE_URL}. Falling back to Gemini/local.`);
  }
  return ollamaHealthy;
}

// Provider resolution: Hugging Face (primary) → Ollama (self-hosted VPS) →
// Gemini (free tier) → local. HF is the user's chosen production AI.
async function getActiveProvider(): Promise<"huggingface" | "ollama" | "gemini" | "local"> {
  if (hfConfigured()) return "huggingface";
  if (await checkOllama()) return "ollama";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "local";
}
async function getActiveModel(): Promise<string> {
  if (hfConfigured()) return HF_MODEL;
  if (await checkOllama()) return OLLAMA_MODEL;
  if (process.env.GEMINI_API_KEY) return "gemini-3.5-flash";
  return "local";
}

interface OllamaChatOptions {
  temperature?: number;
  maxTokens?: number;
}

async function callOllamaChat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options: OllamaChatOptions = {},
): Promise<{ text: string; model: string; citations: string[] }> {
  const res = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OLLAMA_API_KEY}`,
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      temperature: options.temperature ?? 0.85,
      max_tokens: options.maxTokens ?? 2048,
      stream: false,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ollama error ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content || "";
  return { text, model: data?.model || OLLAMA_MODEL, citations: [] };
}

// ─── Gemini TTS (Google AI Studio, free tier) — the copilot's voice ──────────

const GEMINI_TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
// Female, firm, calm — the closest match to Gemini's assistant voice. Other
// free voices: Zephyr, Callirrhoe, Leda, Aoede, Erinome (all female).
const GEMINI_TTS_VOICE = process.env.GEMINI_TTS_VOICE || "Kore";

async function callGeminiTts(
  text: string,
  voice: string,
  model: string = GEMINI_TTS_MODEL,
): Promise<{ audioBase64: string; mimeType: string; model: string; voice: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
        },
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini TTS error ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.find((p: any) => p?.inlineData?.data);
  if (!part) throw new Error("Gemini TTS returned no audio");
  const mimeType: string = part.inlineData.mimeType || "audio/L16;codec=pcm;rate=24000";
  // Gemini TTS returns raw LINEAR16 PCM (audio/L16;codec=pcm;rate=NNNN), which
  // browsers can't decode. Wrap it in a standard WAV container (mono, 16-bit).
  const rateMatch = mimeType.match(/rate=(\d+)/);
  const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
  const pcm = Buffer.from(part.inlineData.data, "base64");
  const wav = pcmToWav(pcm, sampleRate);
  return { audioBase64: wav.toString("base64"), mimeType: "audio/wav", model, voice };
}

function pcmToWav(pcm: Buffer, sampleRate: number): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcm]);
}

// System instructions for the BirichiNex Advisor
const SYSTEM_INSTRUCTION = `
You are Amani, the lead BirichiNex Business Advisor and a trusted peer to the shop owner whose live business data is supplied in the intelligence block of each request — their catalog, inventory, transactions, orders, contacts, wallet, and goals. You reason only from that block; you never invent products, prices, stock, or history that are not present in it.

HOW YOU SPEAK — this governs everything:
- You think before you answer. Reason through the situation inside your head — what is actually happening in their numbers, what it probably means, what the realistic options are — then speak from that reasoning. Your answer should feel like the conclusion of real thinking, not a reflex.
- You talk like a sharp, warm advisor having a conversation, not like a support bot. Use first person ("I'd look at this as..."), vary your sentence rhythm, and let one idea flow into the next. Favor flowing paragraphs over bullet lists; if a short list genuinely helps, keep it to the essentials and weave it into the flow.
- Never open with generic filler like "Great question!" or "Based on your data...". Start with something specific to their actual situation — name what you're seeing in their numbers, or the real question at the heart of what they asked.
- Mirror the owner's language and energy. If they're casual, be direct and warm; if they're formal, be precise and considered. Refer to them naturally ("you"), never as "the user" or "the shop owner".
- Be concrete, not vague. Put numbers in context ("that KSh 4,200 margin is roughly a 22% return on that product") instead of just quoting them.
- Emojis are allowed and used sparingly, only for brief warmth or emphasis — never in every sentence. No markdown headers or code fences; minimal markdown anyway.

HOW YOU REASON:
- When the shop has no data yet (empty inventory, no orders, no transactions), say so plainly and guide the founder toward the next concrete first step: adding inventory, connecting a sales channel, or setting prices. Never fabricate a catalog, prices, or implied past performance.
- Use pricing math (unit cost vs selling price) when margins or profit are discussed, grounding every figure in the shop's actual numbers from the intelligence block. Anchor customer acquisition (marketing, social media, visual merchandising) and financial discipline (reinvesting profit, holding a cash buffer) to the founder's live numbers when they are available.
- If something is genuinely uncertain, say so honestly and give your best judgment with reasoning — don't fake certainty, and don't hedge into mush.

Be factually reliable above all: never quote prices, stock levels, or performance that are not in the intelligence block.
`;

// API Endpoints

// 1. Live Check / Health
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// ─── Cloud State Sync (Supabase Postgres) ─────────────────────────────────────
// The client stores its whole business state as one JSONB document per
// user_key. The service-role key stays server-side; the browser only ever
// calls these endpoints. Without SUPABASE_* env vars the sync layer reports
// "disabled" (503) and the app runs offline exactly as before.

const VALID_USER_KEY = /^[a-zA-Z0-9._%+-@]{1,160}$/;

app.get("/api/sync", async (req, res) => {
  try {
    if (!syncEnabled()) return res.status(503).json({ error: "Sync disabled", enabled: false });
    if (!deviceSecretValid(req)) return res.status(401).json({ error: "Unauthorized" });
    const userKey = String(req.query.userKey || "").trim();
    if (!VALID_USER_KEY.test(userKey)) return res.status(400).json({ error: "Invalid userKey" });
    const db = getSupabase();
    const { data, error } = await db
      .from("business_state")
      .select("payload, version, updated_at")
      .eq("user_key", userKey)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.json({ enabled: true, payload: null, version: 0, updatedAt: null });
    res.json({ enabled: true, payload: data.payload, version: data.version, updatedAt: data.updated_at });
  } catch (error: any) {
    console.error("GET /api/sync error:", error);
    res.status(500).json({ error: "Sync read failed", enabled: true });
  }
});

app.put("/api/sync", async (req, res) => {
  try {
    if (!syncEnabled()) return res.status(503).json({ error: "Sync disabled", enabled: false });
    if (!deviceSecretValid(req)) return res.status(401).json({ error: "Unauthorized" });
    const { userKey, payload } = req.body || {};
    const key = String(userKey || "").trim();
    if (!VALID_USER_KEY.test(key)) return res.status(400).json({ error: "Invalid userKey" });
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return res.status(400).json({ error: "payload must be an object" });
    }
    const db = getSupabase();
    const { data, error } = await db.rpc("save_business_state", {
      p_key: key,
      p_payload: payload,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    res.json({ enabled: true, version: row?.out_version ?? 0, updatedAt: row?.out_updated_at ?? null });
  } catch (error: any) {
    console.error("PUT /api/sync error:", error);
    res.status(500).json({ error: "Sync write failed", enabled: true });
  }
});

app.delete("/api/sync", async (req, res) => {
  try {
    if (!syncEnabled()) return res.status(503).json({ error: "Sync disabled", enabled: false });
    if (!deviceSecretValid(req)) return res.status(401).json({ error: "Unauthorized" });
    const userKey = String(req.query.userKey || "").trim();
    if (!VALID_USER_KEY.test(userKey)) return res.status(400).json({ error: "Invalid userKey" });
    const db = getSupabase();
    const { error } = await db.rpc("clear_business_state", { p_key: userKey });
    if (error) throw error;
    res.json({ enabled: true, cleared: true });
  } catch (error: any) {
    console.error("DELETE /api/sync error:", error);
    res.status(500).json({ error: "Sync delete failed", enabled: true });
  }
});

// ─── Payments & Membership Billing (Flutterwave / local simulation) ──────────
// Subscriptions are charged in USD (matching MEMBERSHIP_TIERS); wallet payouts
// are made in TZS to a configured bank account. Prices are validated server-side
// so the client can never send a discounted amount.

const PAYMENT_REF = /^[a-zA-Z0-9_-]{1,80}$/;
const VALID_BILLING_PERIODS = new Set(["monthly", "yearly"]);
const VALID_PAYMENT_METHODS = new Set(["card", "mpesa"]);
const YEARLY_PRICE_MONTHS = 10; // two months free on annual plans

const PAID_TIER_PRICES = new Map<string, number>();
for (const t of MEMBERSHIP_TIERS) {
  if (t.monthlyPrice !== null && t.monthlyPrice > 0) {
    PAID_TIER_PRICES.set(t.tier, t.monthlyPrice);
  }
}

const WITHDRAW_MIN_TZS = 5_000;
const WITHDRAW_MAX_TZS = 50_000_000;
const VALID_PAYOUT_COUNTRIES = new Set(["TZ", "KE", "UG", "NG", "GH"]);

function paymentOrigin(req: express.Request): string {
  const forwarded = req.get("x-forwarded-proto");
  const proto = forwarded ? forwarded.split(",")[0].trim() : req.protocol;
  return `${proto}://${req.get("host")}`;
}

// 1. Create a checkout (subscription purchase).
app.post("/api/payments/checkout", async (req, res) => {
  try {
    if (applyRateLimit(req, res)) return;
    const { tier, billingPeriod, method, email } = req.body || {};
    const tierName = String(tier || "").toLowerCase();
    const period = String(billingPeriod || "monthly").toLowerCase();
    const payMethod = String(method || "card").toLowerCase();

    const monthlyPrice = PAID_TIER_PRICES.get(tierName);
    if (monthlyPrice === undefined) {
      return res.status(400).json({ error: "Invalid tier. Enterprise is quoted via the sales team." });
    }
    if (!VALID_BILLING_PERIODS.has(period)) {
      return res.status(400).json({ error: "billingPeriod must be monthly or yearly" });
    }
    if (!VALID_PAYMENT_METHODS.has(payMethod)) {
      return res.status(400).json({ error: "method must be card or mpesa" });
    }
    const customerEmail = String(email || "").trim().slice(0, 120);
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const amount = period === "yearly" ? monthlyPrice * YEARLY_PRICE_MONTHS : monthlyPrice;
    const reference = `sub_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
    const provider = getPaymentProvider();
    const { redirectUrl } = await provider.createCheckout({
      reference,
      amount,
      currency: "USD",
      description: `BirichiNex ${tierName} membership — ${period} plan`,
      customerEmail,
      paymentOptions: payMethod === "mpesa" ? ["mobilemoneytz"] : ["card"],
      redirectUrl: `${paymentOrigin(req)}/`,
      meta: { tier: tierName, billingPeriod: period },
    });

    res.json({ reference, amount, currency: "USD", billingPeriod: period, mode: provider.mode, redirectUrl });
  } catch (error: any) {
    console.error("POST /api/payments/checkout error:", error);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// 1b. Create a checkout (order purchase — shop checkout).
app.post("/api/payments/order", async (req, res) => {
  try {
    if (applyRateLimit(req, res)) return;
    const { amount, currency, method, email, description, meta } = req.body || {};
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    const curr = String(currency || "KES").toUpperCase();
    if (!["KES", "TZS", "UGX", "USD"].includes(curr)) {
      return res.status(400).json({ error: "Unsupported currency" });
    }
    const payMethod = String(method || "card").toLowerCase();
    if (!["card", "mpesa"].includes(payMethod)) {
      return res.status(400).json({ error: "method must be card or mpesa" });
    }
    const customerEmail = String(email || "").trim().slice(0, 120);
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    const desc = String(description || "BirichiNex Marketplace Order").slice(0, 191);
    const reference = `ord_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
    const provider = getPaymentProvider();
    const { redirectUrl } = await provider.createCheckout({
      reference,
      amount: amountNum,
      currency: curr as "USD" | "TZS",
      description: desc,
      customerEmail,
      paymentOptions: payMethod === "mpesa" ? ["mobilemoneyke"] : ["card"],
      redirectUrl: `${paymentOrigin(req)}/`,
      meta: { ...(meta || {}), kind: "order" },
    });

    res.json({ reference, amount: amountNum, currency: curr, mode: provider.mode, redirectUrl });
  } catch (error: any) {
    console.error("POST /api/payments/order error:", error);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// 2. Check a checkout's payment status (polled by the client after checkout).
app.get("/api/payments/status", async (req, res) => {
  try {
    if (applyRateLimit(req, res)) return;
    const reference = String(req.query.reference || "").trim();
    if (!PAYMENT_REF.test(reference)) {
      return res.status(400).json({ error: "Invalid reference" });
    }
    const provider = getPaymentProvider();
    const { status, amount, currency } = await provider.getStatus(reference);
    res.json({ reference, status, amount, currency, mode: provider.mode });
  } catch (error: any) {
    console.error("GET /api/payments/status error:", error);
    res.status(500).json({ error: "Status check failed" });
  }
});

// 3. Simulation-only helpers so every flow can be tested end-to-end locally.
function requireSimulation(res: express.Response): boolean {
  const provider = getPaymentProvider();
  if (!isSimulationProvider(provider)) {
    res.status(409).json({ error: "Simulation endpoints are disabled in live mode" });
    return true;
  }
  return false;
}

app.post("/api/payments/simulate-pay", (req, res) => {
  if (applyRateLimit(req, res)) return;
  if (requireSimulation(res)) return;
  const reference = String(req.body?.reference || "").trim();
  if (!PAYMENT_REF.test(reference)) return res.status(400).json({ error: "Invalid reference" });
  const provider = getPaymentProvider();
  if (!isSimulationProvider(provider)) return res.status(409).json({ error: "Not in simulation mode" });
  const ok = provider.markPaid(reference);
  if (!ok) return res.status(404).json({ error: "Unknown reference" });
  res.json({ reference, status: "paid", mode: "simulation" });
});

app.post("/api/payments/simulate-fail", (req, res) => {
  if (applyRateLimit(req, res)) return;
  if (requireSimulation(res)) return;
  const reference = String(req.body?.reference || "").trim();
  if (!PAYMENT_REF.test(reference)) return res.status(400).json({ error: "Invalid reference" });
  const provider = getPaymentProvider();
  if (!isSimulationProvider(provider)) return res.status(409).json({ error: "Not in simulation mode" });
  const ok = provider.markFailed(reference);
  if (!ok) return res.status(404).json({ error: "Unknown reference" });
  res.json({ reference, status: "failed", mode: "simulation" });
});

// 4. Withdraw platform-wallet earnings to a bank account.
app.post("/api/payments/withdraw", async (req, res) => {
  try {
    if (applyRateLimit(req, res)) return;
    if (applyCostArtifactRateLimit(req, res)) return;
    // Moving money out requires the owner device secret, same as sync writes.
    // Real money leaves the account only with the owner device secret. In
    // simulation mode (the default) nothing moves, so it stays frictionless.
    if (!isSimulationProvider(getPaymentProvider()) && !deviceSecretValid(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { amount, bankAccount } = req.body || {};
    const amountNum = Number(amount);
    if (!Number.isInteger(amountNum) || amountNum < WITHDRAW_MIN_TZS || amountNum > WITHDRAW_MAX_TZS) {
      return res.status(400).json({
        error: `Amount must be between ${WITHDRAW_MIN_TZS.toLocaleString("en-US")} and ${WITHDRAW_MAX_TZS.toLocaleString("en-US")} TZS`,
      });
    }
    const accountBank = String(bankAccount?.accountBank || "").trim().slice(0, 64);
    const accountNumber = String(bankAccount?.accountNumber || "").trim().slice(0, 64);
    const accountName = String(bankAccount?.accountName || "").trim().slice(0, 160);
    const country = String(bankAccount?.country || "").trim().toUpperCase().slice(0, 2);
    const destinationBranchCode = String(bankAccount?.destinationBranchCode || "").trim().slice(0, 16) || undefined;
    if (!accountBank || !/^[a-zA-Z0-9 ]+$/.test(accountBank)) {
      return res.status(400).json({ error: "A valid bank code is required" });
    }
    if (!accountNumber || !/^[a-zA-Z0-9-]+$/.test(accountNumber)) {
      return res.status(400).json({ error: "A valid account number is required" });
    }
    if (accountName.length < 2) return res.status(400).json({ error: "Beneficiary name is required" });
    if (!VALID_PAYOUT_COUNTRIES.has(country)) {
      return res.status(400).json({ error: "Payouts are supported for TZ, KE, UG, NG, GH banks" });
    }

    const reference = `wdr_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
    const provider = getPaymentProvider();
    const result = await provider.createPayout({
      reference,
      amount: amountNum,
      currency: "TZS",
      narration: "BirichiNex wallet withdrawal",
      bankAccount: {
        accountBank,
        accountNumber,
        accountName,
        country,
        destinationBranchCode,
      },
    });

    res.json({ reference, amount: amountNum, currency: "TZS", mode: provider.mode, status: result.status, message: result.message });
  } catch (error: any) {
    console.error("POST /api/payments/withdraw error:", error);
    res.status(500).json({ error: "Withdrawal failed" });
  }
});

// 5. Payment config — lets the UI reflect the live/simulation mode.
app.get("/api/payments/config", (_req, res) => {
  const mode = getPaymentMode();
  res.json({
    mode,
    live: mode === "flutterwave",
    currency: "TZS",
    withdraw: { min: WITHDRAW_MIN_TZS, max: WITHDRAW_MAX_TZS, currency: "TZS" },
    subscriptions: { currency: "USD", yearlyMonthsCharged: YEARLY_PRICE_MONTHS },
  });
});

// 6. Flutterwave webhook (production). Signature verified against the secret
//    hash; the client independently confirms via GET /api/payments/status.
app.post("/api/payments/webhook", (req, res) => {
  if (!verifyFlutterwaveWebhook(req.headers as Record<string, string | undefined>, req.body)) {
    return res.status(401).json({ error: "Invalid signature" });
  }
  const txRef = String(req.body?.txRef || req.body?.tx_ref || "");
  const event = String(req.body?.event || "unknown");
  console.log(`[payments-webhook] ${event} → ${txRef}`);
  res.sendStatus(200);
});

// 2. Chat Endpoint (Ollama → Gemini → local)
const MAX_CHAT_MESSAGES = 40;
const MAX_CHAT_MSG_CHARS = 4000;
app.post("/api/chat", async (req, res) => {
  try {
    if (applyRateLimit(req, res)) return;
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages array" });
    }
    if (messages.length > MAX_CHAT_MESSAGES) {
      return res.status(400).json({ error: `Too many messages (max ${MAX_CHAT_MESSAGES})` });
    }
    if (messages.some((m: any) => !m?.role || typeof m.content !== "string" || m.content.length > MAX_CHAT_MSG_CHARS)) {
      return res.status(400).json({ error: `Each message must be text ≤ ${MAX_CHAT_MSG_CHARS} characters` });
    }
    // Whitelist roles so a crafted payload can't smuggle model-level roles
    // (e.g. "tool", "developer") that an upstream provider might misinterpret.
    const ROLE_WHITELIST = new Set(["system", "user", "assistant"]);
    if (messages.some((m: any) => !ROLE_WHITELIST.has(String(m.role)))) {
      return res.status(400).json({ error: "Invalid message role" });
    }

    const provider = await getActiveProvider();

    const clientSystem = (messages.find((m: any) => m.role === "system")?.content || "").trim();
    // qwen3 non-thinking mode marker for local Ollama + a fresh chat context.
    const system = `/no_think\n\n${SYSTEM_INSTRUCTION.trim()}\n\n${clientSystem}`.trim();
    const chat = messages
      .filter((m: any) => m.role !== "system")
      .map((m: any): { role: "user" | "assistant"; content: string } => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content),
      }));

    const wantStream = Boolean(req.body?.stream);
    let streamStarted = false;

    // Primary: Hugging Face (user's production AI).
    if (provider === "huggingface") {
      try {
        const payload: HFChatMessage[] = [
          { role: "system", content: system },
          ...chat,
        ];
        if (wantStream) {
          streamStarted = true;
          res.setHeader("Content-Type", "text/event-stream");
          res.setHeader("Cache-Control", "no-cache, no-transform");
          res.setHeader("Connection", "keep-alive");
          res.setHeader("X-Accel-Buffering", "no");
          res.write(`event: meta\ndata: ${JSON.stringify({ source: "huggingface", model: HF_MODEL, live: true })}\n\n`);
          let received = 0;
          for await (const delta of callHuggingFaceStream(payload)) {
            if (delta) {
              received += delta.length;
              res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            }
          }
          res.write(`event: done\ndata: ${JSON.stringify({ received })}\n\n`);
          res.end();
          return;
        }
        const { text, model } = await callHuggingFaceChat(payload);
        return res.json({ text, source: "huggingface", model, live: true });
      } catch (err: any) {
        console.error("Hugging Face chat failed, falling back:", err);
        if (wantStream && !res.writableEnded) {
          if (streamStarted) {
            // Headers already sent — close the SSE envelope gracefully.
            try { res.write(`event: error\ndata: ${JSON.stringify({ error: "AI stream failed" })}\n\n`); res.end(); } catch { res.end(); }
            return;
          }
          // Nothing written yet — stay on JSON.
          res.removeHeader("Content-Length");
          res.setHeader("Content-Type", "application/json");
          return res.status(502).json({ error: "AI service unavailable", live: true });
        }
      }
    }

    // Secondary: Ollama (self-hosted Qwen3 on the VPS).
    if (provider === "ollama") {
      try {
        const { text, model } = await callOllamaChat([
          { role: "system", content: system },
          ...chat,
        ]);
        return res.json({ text, source: "ollama", model, live: true });
      } catch (err: any) {
        console.error("Ollama chat failed, falling back to Gemini:", err);
        ollamaHealthy = false;
      }
    }

    // Fallback: Gemini.
    const ai = getGeminiClient();
    if (ai) {
      // Convert messages for GoogleGenAI
      const contents = messages.map(m => {
        return {
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        };
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: `${SYSTEM_INSTRUCTION.trim()}\n\n${clientSystem}`.trim(),
          temperature: 0.85,
        }
      });

      return res.json({
        text: response.text || "I apologize, I could not generate a response. Please try again.",
        source: "gemini-3.5-flash",
        live: true
      });
    }

    // Simulate intelligent response if no live provider is configured
    const lastMessage = messages[messages.length - 1]?.content || "";
    const lowerMsg = lastMessage.toLowerCase();
    let mockReply = "";

    if (lowerMsg.includes("start") || lowerMsg.includes("how to")) {
      mockReply = `Starting a business works best when you start with real numbers. Add your first inventory items, set a selling price above your unit cost, and publish them to your storefront. From there we can plan marketing, track orders, and reinvest profit into stock. Would you like a step-by-step first-day plan?`;
    } else if (lowerMsg.includes("price") || lowerMsg.includes("cost") || lowerMsg.includes("margin")) {
      mockReply = `I can only give you accurate pricing math from your own data. Add your inventory with unit costs and target prices in the Inventory tab, and I'll calculate per-unit margins, break-even volume, and which categories earn you the most. Share a product and its cost and I'll run the numbers for you.`;
    } else if (lowerMsg.includes("tech") || lowerMsg.includes("laptop") || lowerMsg.includes("phone")) {
      mockReply = `Tell me which tech products you stock (or want to stock) and your target market, and I'll help you price them, compare financing options, and plan a marketing approach that fits your budget.`;
    } else {
      mockReply = `Welcome to BirichiNex. I'm your business advisor, grounded only in your live shop data. I can help you set prices, plan inventory, manage cash flow, follow up with customers, and grow sales. What is your current priority?`;
    }

    res.json({
      text: mockReply,
      source: "simulated-advisor",
      live: false
    });

  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. AI Quote Analyst Endpoint
const MAX_QUOTE_ITEMS = 60;
const MAX_QUOTE_PROFILE_CHARS = 600;

app.post("/api/quote", async (req, res) => {
  try {
    if (applyRateLimit(req, res)) return;
    const { items, businessProfile } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided for quotation" });
    }
    if (items.length > MAX_QUOTE_ITEMS) {
      return res.status(400).json({ error: `Too many items (max ${MAX_QUOTE_ITEMS})` });
    }
    if (businessProfile && String(JSON.stringify(businessProfile)).length > MAX_QUOTE_PROFILE_CHARS) {
      return res.status(400).json({ error: "Business profile is too large" });
    }
    // Validate/marshal each item so malformed shapes can't crash or get
    // interpreted as model instructions (name/price are numeric fields).
    const VALID_ITEMS = /^.{1,120}$/;
    const itemsClean: Array<{ name: string; quantity: number; price: number }> = [];
    for (const item of items) {
      const name = String(item?.name ?? "").trim();
      const quantity = Number(item?.quantity);
      const priceTZS = Number(item?.priceTZS);
      if (!VALID_ITEMS.test(name) || !name) {
        return res.status(400).json({ error: "Each line item needs a short name" });
      }
      if (!Number.isFinite(quantity) || quantity < 1 || quantity > 100_000) {
        return res.status(400).json({ error: "Quantity must be a positive number" });
      }
      if (!Number.isFinite(priceTZS) || priceTZS < 0 || priceTZS > 10_000_000_000) {
        return res.status(400).json({ error: "Price must be a non-negative number" });
      }
      itemsClean.push({ name, quantity, price: priceTZS });
    }

    const itemsSummary = itemsClean.map((i) => `- ${i.name} (Qty: ${i.quantity}, Price: ${i.price.toLocaleString()} TZS)`).join("\n");
    const profileSummary = businessProfile 
      ? `Business Name: ${businessProfile.businessName}, Location: ${businessProfile.businessLocation}, Experience: ${businessProfile.experience}`
      : "New Entrepreneur";

    const prompt = `
Analyze the following BirichiNex bulk quotation request and generate a personalized 3-part growth playbook:
1. Expected Target Pricing: For the items ordered, what is the ideal retail range in East African markets (TZS/KES), and what is the projected gross profit?
2. Marketing & Audience: How should the buyer advertise these specific items on social media (Instagram, TikTok) or physical showrooms?
3. Sourcing Tips: What's the recommended restock frequency based on these categories?

Items in quote:
${itemsSummary}

Buyer Profile:
${profileSummary}
`;

    // Primary: Hugging Face.
    if (hfConfigured()) {
      try {
        const { text, model } = await callHuggingFaceChat(
          [
            { role: "system", content: SYSTEM_INSTRUCTION },
            { role: "user", content: prompt },
          ],
          { temperature: 0.5, maxTokens: 1200 },
        );
        return res.json({ playbook: text.trim(), source: "huggingface", model });
      } catch (err: any) {
        console.error("Hugging Face quote failed, falling back:", err);
      }
    }

    // Secondary: Ollama.
    if (await checkOllama()) {
      try {
        const { text, model } = await callOllamaChat(
          [
            { role: "system", content: `/no_think\n\n${SYSTEM_INSTRUCTION}` },
            { role: "user", content: prompt },
          ],
          { temperature: 0.5, maxTokens: 1200 },
        );
        return res.json({ playbook: text.trim(), source: "ollama", model });
      } catch (err: any) {
        console.error("Ollama quote failed, falling back to Gemini:", err);
        ollamaHealthy = false;
      }
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Return smart simulated playbook
      const mockPlaybook = `
# BIRICHINEX GROWTH PLAYBOOK
Prepared for: ${businessProfile?.businessName || "Founder"}
Location: ${businessProfile?.businessLocation || "East Africa"}
Quote items: ${itemsSummary}

## 1. Projected Returns & Retail Pricing Strategy
- Set a retail price of 1.8x to 2.5x your all-in unit cost (purchase price plus freight and handling) for each quoted item.
- Calculate your per-item gross margin by subtracting that all-in cost from the retail price; the quoted line items drive the exact figures.
- Target a blended gross margin of at least 40% to leave room for cleaning, branding, and selling costs.

## 2. Dynamic Marketing Playbook
- Content Creation: Show the real quality and condition of each item with unboxing and flat-lay videos; emphasize what makes this stock different for your buyers.
- Social Strategy: Post clean, styled photos on Instagram; use TikTok live selling for the fast-moving items to build urgency and repeat buyers.

## 3. Stocking & Restocking Advisory
- Track sell-through rate per category and reorder before bestsellers run out, using your inventory alerts as the restock trigger.
- Keep a buffer of working capital so a restock never depends on a single sale.
`;
      return res.json({
        playbook: mockPlaybook.trim(),
        source: "simulated-analyst"
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
      }
    });

    res.json({
      playbook: response.text || "Could not generate analysis. Your advisor will contact you shortly.",
      source: "gemini-3.5-flash"
    });

  } catch (error: any) {
    console.error("Error in /api/quote:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Live AI Calling (Twilio Voice) ──────────────────────────────────────────

// Recent Twilio call status events (in-memory; surfaced in logs).
const callStatusLog: Array<Record<string, string>> = [];

// Live conversational call transcript lines (in-memory; latest 200).
const liveCallTranscripts: Array<{ at: string; streamSid: string | null; role: string; text: string }> = [];

// Transcript of recent live AI conversations (owner inbox). No UI consumer
// calls this over the network — it's the operator's private audit of call
// content — so it requires the device secret like the sync endpoints do.
app.get("/api/agent-call/transcripts", (req, res) => {
  if (!deviceSecretValid(req)) return res.status(401).json({ error: "Unauthorized" });
  res.json({ transcripts: liveCallTranscripts.slice(-100) });
});

// AI provider mode — a privacy-friendly boolean only. The UI needs to know
// whether a live brain answered or the built-in one did, never which vendor
// or model is under the hood. (An attacker probing this endpoint gets nothing.)
app.get("/api/ai/mode", async (_req, res) => {
  const provider = await getActiveProvider();
  res.json({ live: provider !== "local" });
});

// Gemini TTS (Google AI Studio, free tier) — the copilot's voice. The Gemini
// assistant uses the same neural voices, so this sounds like Gemini for free.
const MAX_TTS_CHARS = 500;

app.post("/api/ai/voice", async (req, res) => {
  try {
    if (applyRateLimit(req, res)) return;
    const { text, voice, model } = req.body || {};
    const content = String(text || "").trim();
    if (!content) return res.status(400).json({ error: "No text provided" });
    if (content.length > MAX_TTS_CHARS) {
      return res.status(400).json({ error: `Text too long (max ${MAX_TTS_CHARS} characters)` });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "Gemini TTS not configured", voice: false });
    }

    const ttsVoice = voice || GEMINI_TTS_VOICE;
    const ttsModel = model || GEMINI_TTS_MODEL;
    const { audioBase64, mimeType, voice: usedVoice, model: usedModel } = await callGeminiTts(content, ttsVoice, ttsModel);

    res.json({
      audioBase64,
      format: mimeType,
      provider: "gemini",
      model: usedModel,
      voice: usedVoice,
      live: true,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/voice:", error);
    res.status(500).json({ error: "TTS failed", voice: false });
  }
});

// ─── Zahara — AI Finance Agent ────────────────────────────────────────────────

const FINANCE_SYSTEM_INSTRUCTION = `
You are "Zahara", the AI Finance Agent of BirichiNex, a multi-shop business platform for East African entrepreneurs.

You combine the rigor of a professional CFO with the warmth of a trusted East African business partner.

HARD GUARDRAILS — never break these:
1. You NEVER withdraw money, make purchases, or transfer funds on your own. You only PROPOSE such actions; the business owner must approve them.
2. Any action touching balances, prices, supplier payments, or personal data is presented for explicit confirmation.
3. You can run day-to-day analysis, recommend strategies, and create plans autonomously — but money and sensitive changes always require approval.
4. Be honest about uncertainty. If a figure (e.g. exchange rate, tax rate) should be verified live, say so and offer to research it.

Ground every recommendation in the shop owner's own numbers supplied with each request (wallet, transactions, inventory, orders, loyalty, subscription). Never invent balances or outcomes that are not in the data. Whenever a block titled "Live business figures" appears in the request, it is the owner's actual current data — you MUST read and reason from those exact figures and never claim no data was provided. Only when the block is absent or explicitly empty should you say there is no data yet and propose the first step to start tracking finances properly.

HOW YOU SPEAK:
- You reason before you answer: read what is actually happening in their figures, weigh the realistic options, then speak from that. Your answer reads like the conclusion of real thought, not a canned template.
- Speak in warm, flowing business English. Use first person, vary sentence length, and favor paragraphs over bullet lists — if a short list is genuinely clearer, weave it into the prose.
- Never open with filler like "Great question!" or "Based on your data". Start with something concrete about their actual situation — the pattern you see in their numbers, or the real question underneath.
- Be specific, not vague: put figures in context ("your cash buffer covers roughly three weeks of typical spending") rather than just restating them. State the reasoning behind every recommendation. When you propose an action, say exactly what you would do and mark it [NEEDS APPROVAL].
- Emojis allowed sparingly for warmth and emphasis; no markdown headers, no code fences.
`;

app.post("/api/finance/advise", async (req, res) => {
  try {
    if (applyRateLimit(req, res)) return;
    const { question, snapshot, conversation } = req.body || {};
    if (question !== undefined && typeof question !== "string") {
      return res.status(400).json({ error: "Question must be text" });
    }
    const q = String(question || "Give me an overview of my finances.").slice(0, 2000);
    const provider = await getActiveProvider();

    const conv = Array.isArray(conversation) ? conversation.filter((c) => typeof c === "string").slice(-6) : [];
    const priorTurns = conv.join("\n").slice(0, 6000);
    let snapshotBlock = "";
    if (snapshot && typeof snapshot === "object" && Object.keys(snapshot).length > 0) {
      try {
        const serialized = JSON.stringify(snapshot);
        if (serialized.length <= 200_000) {
          snapshotBlock = `Live business figures (the single source of truth — ground every answer in these exact numbers):\n${serialized}`;
        }
      } catch { /* unparseable snapshot → ignore, owner still gets an answer */ }
    }
    const userContent = [
      snapshotBlock,
      priorTurns ? `Prior conversation:\n${priorTurns}` : "",
      `The owner now asks: ${q}`,
    ].filter(Boolean).join("\n\n");

    if (provider === "huggingface") {
      try {
        const { text, model } = await callHuggingFaceChat(
          [
            { role: "system", content: FINANCE_SYSTEM_INSTRUCTION },
            { role: "user", content: userContent },
          ],
          { temperature: 0.6, maxTokens: 900 },
        );
        return res.json({ text, source: "huggingface", model, live: true, grounded: false });
      } catch (err: any) {
        console.error("Hugging Face advise failed, falling back:", err);
      }
    }

    if (provider === "ollama") {
      try {
        const { text, model } = await callOllamaChat(
          [
            { role: "system", content: `/no_think\n\n${FINANCE_SYSTEM_INSTRUCTION}` },
            { role: "user", content: userContent },
          ],
          { temperature: 0.6, maxTokens: 900 },
        );
        return res.json({ text, source: "ollama", model, live: true, grounded: false });
      } catch (err: any) {
        console.error("Ollama advise failed, falling back:", err);
        ollamaHealthy = false;
      }
    }

    const ai = getGeminiClient();
    if (!ai) {
      const { localFinanceReply } = await import("./ai/src/finance-agent");
      const text = localFinanceReply(String(question || "Overview of my finances"), snapshot || {});
      return res.json({ text, source: "simulated-advisor", live: false });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: userContent }] }],
      config: {
        systemInstruction: FINANCE_SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.6,
        maxOutputTokens: 900,
      },
    });
    const text = response.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "I couldn't form an answer.";
    res.json({ text, source: "gemini-3.5-flash", live: true, grounded: Boolean(response.candidates?.[0]?.groundingMetadata) });
  } catch (err) {
    console.error("Finance advise error:", err);
    const { localFinanceReply } = await import("./ai/src/finance-agent");
    const text = localFinanceReply(String(req.body?.question || ""), req.body?.snapshot || {});
    res.json({ text, source: "simulated-advisor", live: false });
  }
});

app.post("/api/finance/research", async (req, res) => {
  try {
    if (applyRateLimit(req, res)) return;
    const { query } = req.body || {};
    const provider = await getActiveProvider();
    const q = String(query || "").slice(0, 2000);

    if (provider === "huggingface") {
      try {
        const { text, model } = await callHuggingFaceChat(
          [
            {
              role: "system",
              content:
                "You are Zahara, a financial research assistant for East African businesses. Answer in flowing, natural prose with the facts you know, and clearly flag anything that should be verified against live sources before acting.",
            },
            { role: "user", content: q },
          ],
          { temperature: 0.5, maxTokens: 850 },
        );
        return res.json({ text, source: "huggingface", model, live: true, citations: [] });
      } catch (err: any) {
        console.error("Hugging Face research failed, falling back:", err);
      }
    }

    if (provider === "ollama") {
      try {
        const { text, model } = await callOllamaChat(
          [
            {
              role: "system",
              content:
                "/no_think\n\nYou are Zahara, a financial research assistant for East African businesses. Answer in flowing, natural prose with the facts you know, and clearly flag anything that should be verified against live sources before acting.",
            },
            { role: "user", content: q },
          ],
          { temperature: 0.5, maxTokens: 850 },
        );
        return res.json({ text, source: "ollama", model, live: true, citations: [] });
      } catch (err: any) {
        console.error("Ollama research failed, falling back:", err);
        ollamaHealthy = false;
      }
    }

    const ai = getGeminiClient();
    if (!ai) {
      const { localFinanceResearch } = await import("./ai/src/finance-agent");
      return res.json(localFinanceResearch(q));
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: q }] }],
      config: {
        systemInstruction: "You are Zahara, a financial research assistant for East African businesses. Research the question using Google Search and answer in flowing, natural prose with the current facts and figures. Note where data should be verified before acting.",
        tools: [{ googleSearch: {} }],
        temperature: 0.5,
        maxOutputTokens: 850,
      },
    });
    const text = response.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "No results.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const citations: string[] = chunks
      .map((c: any) => c.web?.uri || c.retrievedContext?.uri)
      .filter(Boolean)
      .slice(0, 3);
    res.json({ text, source: "gemini-3.5-flash", live: true, citations });
  } catch (err) {
    console.error("Finance research error:", err);
    const { localFinanceResearch } = await import("./ai/src/finance-agent");
    res.json(localFinanceResearch(String(req.body?.query || "")));
  }
});

function twilioContextFromRequest(query: any): TwilioCallContext {
  return {
    to: String(query.to || ""),
    customer: String(query.customer || "Customer"),
    agent: String(query.agent || "Amani"),
    business: String(query.business || "BirichiNex"),
    orderId: query.order ? String(query.order) : undefined,
    productName: query.product ? String(query.product) : undefined,
    orderStatus: query.status ? String(query.status) : undefined,
    opener: query.opener ? String(query.opener) : undefined,
    closing: query.close ? String(query.close) : undefined,
    tone: (query.tone as TwilioCallContext["tone"]) || "warm",
    language: (query.language as TwilioCallContext["language"]) || "en",
    voice: (query.voice as TwilioCallContext["voice"]) || "kore",
    objective: (query.objective as TwilioCallContext["objective"]) || "inform",
    humanTouch: query.human === "true",
    repeatEnabled: query.repeat === "true",
    record: query.record === "true",
    type: query.type === "outbound-sales" ? "outbound-sales" : "outbound-followup",
    conversational: query.live === "true",
  };
}

// 4. Connection status — lets the UI show Live vs Simulation mode.
// Only existence flags are returned; the operator's phone number and the
// internal TwiML base URL stay server-side.
app.get("/api/agent-call/mode", (_req, res) => {
  const status = getTwilioConfigStatus();
  const conversational = isLiveConversationReady();
  res.json({
    mode: conversational ? "conversational" : isLiveReady() ? "live" : "simulated",
    conversational,
    geminiLive: isGeminiLiveReady(),
    configured: status.configured,
    record: status.record,
    hasFromNumber: Boolean(status.fromNumber),
    hasTwimlBaseUrl: Boolean(status.twimlBaseUrl),
  });
});

// Short-lived signed token that authorizes an in-app live voice WebSocket.
// The signature secret is boot-random unless LIVE_SESSION_SECRET is set, so
// stale tokens cannot be replayed across restarts.
const LIVE_SESSION_SECRET =
  process.env.LIVE_SESSION_SECRET ||
  crypto.randomBytes(32).toString("hex");
const LIVE_SESSION_TTL_MS = 5 * 60 * 1000;
const liveSessionCounts = new Map<string, number>();

function issueLiveSessionToken(): string {
  const payload = String(Date.now() + LIVE_SESSION_TTL_MS);
  const sig = crypto.createHmac("sha256", LIVE_SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyLiveSessionToken(token: string): boolean {
  const [payload, sig] = String(token || "").split(".");
  if (!payload || !sig) return false;
  try {
    const expected = crypto.createHmac("sha256", LIVE_SESSION_SECRET).update(payload).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
    return Number(payload) > Date.now();
  } catch {
    return false;
  }
}

app.post("/api/agent-live/token", (req, res) => {
  if (applyRateLimit(req, res)) return;
  if (!isGeminiLiveReady()) {
    return res.status(503).json({ error: "Gemini voice is not configured on this server." });
  }
  // Tokens are short-lived (5 min), HMAC-signed, and the socket is capped at
  // 3 concurrent sessions per IP — the bridge itself refuses duplicates.
  res.json({ token: issueLiveSessionToken(), expiresIn: LIVE_SESSION_TTL_MS / 1000 });
});

// 5. Place an outbound live call. When Gemini + Twilio are configured the
//    call runs as a LIVE AI CONVERSATION (Media Streams -> Gemini Live).
//    Otherwise it falls back to scripted DTMF (live) or simulation.
app.post("/api/agent-call", async (req, res) => {
  try {
    if (applyRateLimit(req, res)) return;
    if (applyCostArtifactRateLimit(req, res)) return;
    const { type, contact, order, config } = req.body || {};

    if (!isLiveReady() || !contact?.phone || type === "inbound") {
      return res.json({ mode: "simulated" });
    }

    // Validate the destination phone so we can't be used to dial arbitrary
    // (premium-rate) numbers.
    const to = String(contact.phone).replace(/[^\d+]/g, "");
    if (!/^\+?\d{7,15}$/.test(to)) {
      return res.status(400).json({ error: "A valid phone number is required" });
    }

    // From here a real paid call is placed — only the owner may do that.
    if (!deviceSecretValid(req)) return res.status(401).json({ error: "Unauthorized" });

    const conversational = isLiveConversationReady();

    const ctx: TwilioCallContext = {
      to,
      customer: String(contact.name || "Customer").slice(0, 120),
      agent: String(config?.name || "Amani").slice(0, 60),
      business: String(config?.business || "BirichiNex").slice(0, 60),
      orderId: order?.id ? String(order.id).slice(0, 40) : undefined,
      productName: order?.productName ? String(order.productName).slice(0, 80) : undefined,
      orderStatus: order?.status ? String(order.status).slice(0, 40) : undefined,
      opener: Array.isArray(config?.openingPhrases) ? String(config.openingPhrases[0]).slice(0, 200) : undefined,
      closing: Array.isArray(config?.closingPhrases) ? String(config.closingPhrases[0]).slice(0, 200) : undefined,
      tone: (config?.tone as TwilioCallContext["tone"]) || "warm",
      language: (config?.language as TwilioCallContext["language"]) || "en",
      voice: (config?.voice as TwilioCallContext["voice"]) || "kore",
      objective: (config?.callObjective as TwilioCallContext["objective"]) || "inform",
      humanTouch: Boolean(config?.humanTouch),
      repeatEnabled: Boolean(config?.repeatOrders),
      record: Boolean(config?.recordCalls),
      type: type === "outbound-sales" ? "outbound-sales" : "outbound-followup",
      conversational,
    };

    const { lines } = conversational ? buildConversationalTwiml(ctx, issueLiveSessionToken()) : buildOutboundTwiml(ctx);
    const placed = await placeOutboundCall(ctx);

    res.json({
      mode: conversational ? "conversational" : "live",
      conversational,
      callSid: placed.callSid,
      status: placed.status,
      to: placed.to,
      transcript: lines.map((text) => ({ speaker: "agent" as const, text })),
    });
  } catch (error: any) {
    console.error("Error placing Twilio call:", error);
    res.status(500).json({ mode: "error", error: "Call placement failed" });
  }
});

// 6. Outbound TwiML — Twilio fetches this to run the live conversation.

// Validates Twilio's X-Twilio-Signature (HMAC-SHA1 over the full request URL +
// sorted form params, keyed by the account auth token). When TWILIO_AUTH_TOKEN
// is set, unsigned/forged requests are rejected; without it (dev), we allow but
// warn — the webhooks only emit TwiML and never expose data.
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";

function twilioSignatureValid(req: express.Request): boolean {
  if (!TWILIO_AUTH_TOKEN) return true; // dev mode — token not configured
  const signature = String(req.headers["x-twilio-signature"] || "");
  if (!signature) return false;
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const params: Record<string, string> = { ...(req.body || {}) };
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join("");
  const expected = crypto.createHmac("sha1", TWILIO_AUTH_TOKEN).update(url + sorted).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

app.all("/api/twilio/twiml", (req, res) => {
  if (!twilioSignatureValid(req)) return res.status(401).send("Signature validation failed");
  const ctx = twilioContextFromRequest(req.query);
  if (ctx.conversational) {
    // Token only when real Twilio is configured, so the signature-less dev
    // mode can't be used to mint media-stream tokens and burn Gemini Live.
    const { twiml } = buildConversationalTwiml(ctx, isLiveReady() ? issueLiveSessionToken() : undefined);
    return res.type("text/xml").send(twiml);
  }
  const digits = String(req.body?.Digits || req.query?.Digits || "");
  const { twiml } = buildOutboundTwiml(ctx, digits || undefined);
  res.type("text/xml").send(twiml);
});

// 7. Inbound TwiML — point a Twilio phone number here to answer real calls.
app.all("/api/twilio/inbound", (req, res) => {
  if (!twilioSignatureValid(req)) return res.status(401).send("Signature validation failed");
  const ctx = twilioContextFromRequest(req.query);
  if (ctx.conversational) {
    const { twiml } = buildConversationalTwiml(ctx, isLiveReady() ? issueLiveSessionToken() : undefined);
    return res.type("text/xml").send(twiml);
  }
  const digits = String(req.body?.Digits || req.query?.Digits || "");
  const { twiml } = buildInboundTwiml(ctx, digits || undefined);
  res.type("text/xml").send(twiml);
});

// 8. Call status callback — rings, answered, completed, no-answer, etc.
app.post("/api/twilio/status", (req, res) => {
  if (!twilioSignatureValid(req)) return res.status(401).send("Signature validation failed");
  const event = {
    at: new Date().toISOString(),
    CallSid: String(req.body?.CallSid || ""),
    CallStatus: String(req.body?.CallStatus || ""),
    To: String(req.body?.To || ""),
    From: String(req.body?.From || ""),
    RecordingUrl: String(req.body?.RecordingUrl || ""),
  };
  callStatusLog.push(event);
  console.log(`[Twilio] ${event.CallSid} → ${event.CallStatus} (${event.To})`);
  res.sendStatus(200);
});

// Vite server integration
async function setupVite() {  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Unknown API routes return a JSON 404 instead of the SPA fallback, so
    // scrapers/bots never receive the app shell.
    app.all("/api/*", (req, res) => {
      res.status(404).json({ error: "Not found", path: req.path });
    });
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from /dist.");
  }

  const server = http.createServer(app);

  // ─── Live conversational call bridge (Twilio Media Streams -> Gemini Live) ─
  // Two path-routed WebSocket servers share ONE http server. ws' built-in
  // path option rejects non-matching upgrades on each listener, so the first
  // server would abort the second's handshakes. Route by pathname ourselves.
  const wss = new WebSocketServer({ noServer: true });
  const liveWss = new WebSocketServer({ noServer: true });

  const dispatchUpgrade = (req, socket, head) => {
    let pathname = "/";
    try {
      pathname = new URL(req.url ?? "/", "http://localhost").pathname;
    } catch { /* keep root */ }
    let target: WebSocketServer | null = null;
    if (pathname === "/api/twilio/media-stream") target = wss;
    else if (pathname === "/api/agent-live") target = liveWss;
    if (!target) {
      socket.write("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }
    target.handleUpgrade(req, socket, head, (ws) => {
      target!.emit("connection", ws, req);
    });
  };
  server.on("upgrade", dispatchUpgrade);

  wss.on("connection", (ws, req) => {
    const params: Record<string, string> = {};
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
      url.searchParams.forEach((value, key) => { params[key] = value; });
    } catch { /* keep empty params */ }

    // Authorization: a memory/currency piracy guard. Twilio connects here with
    // a live-session token minted via the (device-secret + rate-limited) token
    // endpoint; anyone opening the socket without one is refused so the server
    // can't be used to burn Gemini Live minutes or scrape transcripts.
    // Authorization: only accept the socket if Twilio was pointed at it by a
    // TwiML document we minted (which embeds a short-lived signed token).
    // This stops strangers from opening media-streams to burn Gemini Live
    // minutes or force transcript ingestion.
    if (!params.token || !verifyLiveSessionToken(params.token)) {
      ws.close(4001, "unauthorized");
      return;
    }
    const ctx = twilioContextFromRequest(params);
    console.log(`[media-stream] WebSocket connected (${ctx.business} / ${ctx.agent} — ${ctx.customer}).`);
    void handleTwilioMediaStream(ws, ctx, getGeminiClient(), {
      onTranscription: (role, text, partial) => {
        if (partial) return;
        const entry = {
          at: new Date().toISOString(),
          streamSid: null as string | null,
          role,
          text,
        };
        liveCallTranscripts.push(entry);
        if (liveCallTranscripts.length > 200) liveCallTranscripts.splice(0, liveCallTranscripts.length - 200);
        console.log(`[media-stream][${role}] ${text}`);
      },
    });
  });

  // ─── In-app live voice bridge (browser -> /api/agent-live -> Gemini Live) ─
  liveWss.on("connection", (ws, req) => {
    let params: Record<string, string> = {};
    let token = "";
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
      url.searchParams.forEach((value, key) => { params[key] = value; });
      token = params.token || "";
      delete params.token;
    } catch { /* keep empty params */ }

    if (!verifyLiveSessionToken(token)) {
      ws.close(4001, "unauthorized");
      return;
    }

    const ip = req.socket.remoteAddress || "unknown";
    const active = liveSessionCounts.get(ip) || 0;
    if (active >= 3) {
      ws.close(4003, "too many live sessions");
      return;
    }
    liveSessionCounts.set(ip, active + 1);

    const ctx = twilioContextFromRequest(params);
    console.log(`[live-session] In-app voice connected (${ctx.business} / ${ctx.agent}).`);

    const release = () => {
      const n = (liveSessionCounts.get(ip) || 1) - 1;
      if (n <= 0) liveSessionCounts.delete(ip);
      else liveSessionCounts.set(ip, n);
    };
    ws.on("close", release);
    ws.on("error", release);

    handleLiveVoiceSocket(ws, ctx, getGeminiClient());
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`BirichiNex Full-Stack server running on http://localhost:${PORT}`);
  });

  // ─── Graceful shutdown ────────────────────────────────────────────────────
  let shuttingDown = false;
  function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n${signal} received — shutting down gracefully…`);
    const forceExit = setTimeout(() => {
      console.error("Shutdown timed out — forcing exit.");
      process.exit(1);
    }, 10_000);
    forceExit.unref();
    for (const client of wss.clients) {
      try { client.close(1001, "Server shutting down"); } catch { /* already closed */ }
    }
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  }
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

setupVite().catch(err => {
  console.error("Failed to initialize server:", err);
});
