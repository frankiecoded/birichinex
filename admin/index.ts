/**
 * Admin control plane.
 *
 * The platform owns the data in two places:
 *   - Supabase `business_state` rows (each user's full store snapshot), and
 *   - server-side JSON/JSONL files (payments ledger, call logs in memory).
 *
 * This module exposes a token-gated control plane that reads BOTH, so the
 * owner can see customers, payments, visits, calls, academy usage and publish
 * BirichiNex posts — without any admin account ever touching the client store:
 * the credentials exist only in the server environment, are compared with a
 * timing-safe digest, and sessions ride on a short-lived HMAC token.
 *
 * The admin page/credentials are intentionally absent from public client code;
 * the endpoint paths are unguessable on purpose, and every call is enforced
 * server-side (fail closed).
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Request, Response, Router } from "express";

const ADMIN_DIR = path.join(process.cwd(), "admin");

// ─── Credentials (env-only, never shipped in code) ──────────────────────────
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
// Stateless session signing secret. Falls back to a per-boot random key so a
// restart invalidates every outstanding token.
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || crypto.randomBytes(48).toString("hex");
const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000; // 12h
const ADMIN_SESSION_S = Math.floor(ADMIN_SESSION_MS / 1000);

export interface AdminDeps {
  applyRateLimit: (req: Request, res: Response) => boolean;
  getSupabase: () => any | null;
  syncEnabled: () => boolean;
  /** in-memory Twilio call status events */
  callStatusLog: () => Array<Record<string, string>>;
  /** in-memory Gemini Live transcripts */
  liveCallTranscripts: () => Array<{ at?: string; streamSid?: string; role?: string; text?: string }>;
}

// ─── Token duties ────────────────────────────────────────────────────────────
function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function signToken(email: string, now: number): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "ADM" }));
  const body = b64url(JSON.stringify({ sub: email, iat: now, exp: now + ADMIN_SESSION_MS }));
  const sig = crypto.createHmac("sha256", ADMIN_TOKEN_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verifyToken(token: string): { email: string; exp: number } | null {
  try {
    const [header, body, sig] = String(token || "").split(".");
    if (!header || !body || !sig) return null;
    const expected = crypto.createHmac("sha256", ADMIN_TOKEN_SECRET).update(`${header}.${body}`).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString()) as { sub: string; exp: number };
    if (!parsed.sub || !parsed.exp || parsed.exp < Date.now()) return null;
    return { email: parsed.sub, exp: parsed.exp };
  } catch {
    return null;
  }
}

function adminTokenFrom(req: Request): string | null {
  const auth = req.get("authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  const header = String(req.get("x-admin-token") || "");
  return header || null;
}

function adminAuthorized(req: Request): { email: string; exp: number } | null {
  const tok = adminTokenFrom(req);
  return tok ? verifyToken(tok) : null;
}

function sha256Hex(value: string): Buffer {
  return crypto.createHash("sha256").update(value).digest();
}

function timingSafeEqualString(a: string, b: string): boolean {
  const x = sha256Hex(a);
  const y = sha256Hex(b);
  return crypto.timingSafeEqual(x, y);
}

// ─── Brute-force guard (memory) ──────────────────────────────────────────────
const LOGIN_LOCK_MS = 15 * 60 * 1000; // 15-minute sliding window
const LOGIN_MAX_FAILS = 6;
const loginFailures = new Map<string, number[]>();

function loginLocked(email: string, ip: string): boolean {
  const key = `${email}|${ip}`;
  const now = Date.now();
  const fails = (loginFailures.get(key) || []).filter((t) => now - t < LOGIN_LOCK_MS);
  loginFailures.set(key, fails);
  return fails.length >= LOGIN_MAX_FAILS;
}

function recordLoginFailure(email: string, ip: string): void {
  const key = `${email}|${ip}`;
  const now = Date.now();
  const fails = (loginFailures.get(key) || []).filter((t) => now - t < LOGIN_LOCK_MS);
  fails.push(now);
  loginFailures.set(key, fails);
}

// ─── File helpers ────────────────────────────────────────────────────────────
function ensureDir(dir: string): void {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {
    /* ignore */
  }
}

function readJsonLines(file: string): unknown[] {
  try {
    const raw = fs.readFileSync(file, "utf8");
    return raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter((l) => l !== null);
  } catch {
    return [];
  }
}

function readJsonFile<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile(file: string, value: unknown): void {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2), "utf8");
}

function appendJsonLine(file: string, entry: Record<string, unknown>): void {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, JSON.stringify(entry) + "\n", "utf8");
}

// ─── Files ───────────────────────────────────────────────────────────────────
const VISITS_FILE = path.join(ADMIN_DIR, "visits.jsonl");
const POSTS_FILE = path.join(ADMIN_DIR, "platform-posts.json");
const ACADEMY_FILE = path.join(ADMIN_DIR, "academy.json");

interface PlatformPost {
  id: string;
  title: string;
  body: string;
  category: string;
  pinned?: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Supabase helpers (guarded) ──────────────────────────────────────────────
type UserRow = {
  user_key?: string;
  updated_at?: string;
  created_at?: string;
  payload?: any;
};

// Summary cache so the dashboard's tab-hopping doesn't hammer Postgres.
let userRowsCache: { rows: UserRow[]; at: number } = { rows: [], at: 0 };

async function fetchAllUserRows(deps: AdminDeps): Promise<UserRow[]> {
  const now = Date.now();
  if (userRowsCache.rows.length && now - userRowsCache.at < 10_000) return userRowsCache.rows;
  const client = deps.getSupabase();
  if (!deps.syncEnabled() || !client) return [];
  try {
    const { data, error } = await client
      .from("business_state")
      .select("user_key, updated_at, payload")
      .limit(5000);
    if (error) throw error;
    const rows = (data || []) as UserRow[];
    userRowsCache = { rows, at: now };
    return rows;
  } catch (err) {
    console.error("[admin] supabase read failed:", err);
    return [];
  }
}

function activeMemberCount(rows: UserRow[]): number {
  return rows.filter((r) => r.payload?.subscription?.status === "active").length;
}

function userDisplayName(row: UserRow): string {
  const p = row.payload || {};
  return String(p.user?.name || p.users?.[row.user_key || ""]?.name || row.user_key?.split("@")[0] || "Guest");
}

function userEmail(row: UserRow): string {
  const p = row.payload || {};
  return String(p.user?.email || row.user_key || "");
}

// ─── Router ──────────────────────────────────────────────────────────────────
export function createAdminRouter(deps: AdminDeps): Router {
  const express = require("express") as typeof import("express");
  const router = express.Router();

  const requireAdmin = (req: Request, res: Response, next: () => void) => {
    if (!adminAuthorized(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // ── Auth ───────────────────────────────────────────────────────────────
  router.post("/login", (req, res) => {
    if (deps.applyRateLimit(req, res)) return;
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return res.status(503).json({ ok: false, error: "Admin is not configured on this server." });
    }
    const ip = (req as any).clientIpForRate ?? "";
    if (loginLocked(email, ip)) {
      return res.status(429).json({ ok: false, error: "Too many attempts. Try again later." });
    }
    const emailOk = timingSafeEqualString(email, ADMIN_EMAIL);
    const passOk = timingSafeEqualString(password, ADMIN_PASSWORD);
    if (!emailOk || !passOk) {
      recordLoginFailure(email, ip);
      return res.status(401).json({ ok: false, error: "Invalid credentials." });
    }
    loginFailures.delete(`${email}|${ip}`);
    const token = signToken(ADMIN_EMAIL, Date.now());
    res.json({ ok: true, token, expiresIn: ADMIN_SESSION_S, email: ADMIN_EMAIL });
  });

  router.get("/me", requireAdmin, (req, res) => {
    const a = adminAuthorized(req)!;
    res.json({ ok: true, email: a.email, expires: a.exp });
  });

  // ── Overview ───────────────────────────────────────────────────────────
  router.get("/overview", requireAdmin, async (req, res) => {
    try {
      const rows = await fetchAllUserRows(deps);
      const now = Date.now();
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      const active30d = rows.filter((r) => {
        const up = Date.parse(String(r.updated_at || ""));
        return !Number.isNaN(up) && up >= monthAgo;
      }).length;
      const newThisMonth = rows.filter((r) => {
        const c = Date.parse(String(r.payload?.user?.createdAt || ""));
        return !Number.isNaN(c) && c >= monthAgo;
      }).length;

      let membershipActive = 0;
      let dropshipActive = 0;
      let totalOrders = 0;
      let totalDropshipOrders = 0;
      let totalContacts = 0;
      let totalInventory = 0;
      let totalTransactions = 0;
      let totalEarned = 0;
      let totalCalls = 0;
      let completedCourses = 0;
      let startedCourses = 0;
      let communityPosts = 0;
      let customers = 0;
      for (const r of rows) {
        const p = r.payload || {};
        if (p.user) customers += 1;
        if (p.subscription?.status === "active") membershipActive += 1;
        const dt = p.dropshipSubscription;
        if (dt?.status === "active" && dt?.tier && dt.tier !== "free" && dt.tier !== "") dropshipActive += 1;
        totalOrders += Array.isArray(p.orders) ? p.orders.length : 0;
        totalDropshipOrders += Array.isArray(p.dropshipOrders) ? p.dropshipOrders.length : 0;
        totalContacts += Array.isArray(p.contacts) ? p.contacts.length : 0;
        totalInventory += Array.isArray(p.inventoryItems) ? p.inventoryItems.length : 0;
        totalTransactions += Array.isArray(p.transactions) ? p.transactions.length : 0;
        totalEarned += Number(p.businessWallet?.totalEarned || 0);
        totalCalls += Array.isArray(p.agentCalls) ? p.agentCalls.length : 0;
        const cp = p.courseProgress || {};
        for (const key of Object.keys(cp)) {
          if (cp[key]?.completed) completedCourses += 1;
          if (cp[key]?.started) startedCourses += 1;
        }
        communityPosts += Array.isArray(p.community?.posts) ? p.community.posts.length : 0;
      }

      const ledger = readJsonLines(path.join(process.cwd(), "payments", "ledger.jsonl")) as {
        at?: string;
        amount?: number;
        currency?: string;
        kind?: string;
        tier?: string;
        email?: string;
      }[];
      const payThisMonth = ledger.filter((e) => {
        const t = Date.parse(String(e.at || ""));
        return !Number.isNaN(t) && t >= monthAgo;
      });

      res.json({
        users: { total: rows.length, customers, newThisMonth, active30d },
        subscriptions: { membershipActive, dropshipActive },
        commerce: {
          orders: totalOrders,
          dropshipOrders: totalDropshipOrders,
          contacts: totalContacts,
          inventory: totalInventory,
          transactions: totalTransactions,
        },
        revenue: {
          businessEarned: Math.round(totalEarned),
          paymentsLedgerCount: ledger.length,
          paymentsLedgerThisMonth: payThisMonth.length,
          ledgerSumMinor: ledger.reduce((s, e) => s + Number(e.amount || 0), 0),
        },
        engagement: {
          calls: totalCalls,
          liveCallEvents: deps.callStatusLog().length,
          completedCourses,
          startedCourses,
          communityPosts,
        },
        visits: summarizeVisits(readJsonLines(VISITS_FILE) as { t?: string }[]),
        generatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("[admin] overview error:", err);
      res.status(500).json({ error: "Failed to load overview" });
    }
  });

  // ── Users / customers ──────────────────────────────────────────────────
  router.get("/users", requireAdmin, async (req, res) => {
    const q = String(req.query.q || "").trim().toLowerCase();
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    try {
      const rows = await fetchAllUserRows(deps);
      const enriched = rows
        .map((r) => {
          const p = r.payload || {};
          const dt = p.dropshipSubscription;
          return {
            key: String(r.user_key || ""),
            email: userEmail(r),
            name: userDisplayName(r),
            accountType: String(p.user?.accountType || ""),
            createdAt: String(p.user?.createdAt || r.created_at || ""),
            lastActive: String(r.updated_at || ""),
            membership: { plan: String(p.subscription?.plan || ""), status: String(p.subscription?.status || "") },
            dropship: {
              tier: String(dt?.tier || ""),
              status: String(dt?.status || ""),
              subscribedAt: String(dt?.subscribedAt || ""),
            },
            walletBalance: Number(p.businessWallet?.balance || 0),
            totalEarned: Number(p.businessWallet?.totalEarned || 0),
            orders: Array.isArray(p.orders) ? p.orders.length : 0,
            dropshipOrders: Array.isArray(p.dropshipOrders) ? p.dropshipOrders.length : 0,
            contacts: Array.isArray(p.contacts) ? p.contacts.length : 0,
            inventory: Array.isArray(p.inventoryItems) ? p.inventoryItems.length : 0,
            transactions: Array.isArray(p.transactions) ? p.transactions.length : 0,
            calls: Array.isArray(p.agentCalls) ? p.agentCalls.length : 0,
            courseProgress: Object.keys(p.courseProgress || {}).length,
            completedCourses: Object.values(p.courseProgress || {}).filter((c: any) => c?.completed).length,
            loyalty: Number(p.loyalty?.points || 0),
            communityPosts: Array.isArray(p.community?.posts) ? p.community.posts.length : 0,
          };
        })
        .filter(
          (u) =>
            !q ||
            u.email.toLowerCase().includes(q) ||
            u.name.toLowerCase().includes(q) ||
            String(u.key).toLowerCase().includes(q),
        )
        .sort((a, b) => String(b.lastActive).localeCompare(String(a.lastActive)));
      res.json({ total: enriched.length, items: enriched.slice(offset, offset + limit) });
    } catch (err: any) {
      console.error("[admin] users error:", err);
      res.status(500).json({ error: "Failed to load users" });
    }
  });

  router.get("/users/:key", requireAdmin, async (req, res) => {
    const key = String(req.params.key || "").toLowerCase();
    try {
      const client = deps.getSupabase();
      if (!client) return res.status(404).json({ error: "No store" });
      const { data } = await client.from("business_state").select("*").eq("user_key", key).maybeSingle();
      if (!data) return res.status(404).json({ error: "User not found" });
      res.json({ key: data.user_key, updatedAt: data.updated_at, payload: data.payload });
    } catch (err: any) {
      console.error("[admin] user detail error:", err);
      res.status(500).json({ error: "Failed to load user" });
    }
  });

  // ── Payments ───────────────────────────────────────────────────────────
  router.get("/payments", requireAdmin, (_req, res) => {
    const ledger = readJsonLines(path.join(process.cwd(), "payments", "ledger.jsonl")) as {
      at?: string;
      reference?: string;
      amount?: number;
      currency?: string;
      channel?: string;
      kind?: string;
      tier?: string;
      billingPeriod?: string;
      email?: string;
    }[];
    const byMonth = new Map<string, { count: number; sumMinor: number }>();
    for (const e of ledger) {
      const mo = String(e.at || "").slice(0, 7) || "unknown";
      const b = byMonth.get(mo) || { count: 0, sumMinor: 0 };
      b.count += 1;
      b.sumMinor += Number(e.amount || 0);
      byMonth.set(mo, b);
    }
    const months = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({
      month,
      count: v.count,
      sumMinor: v.sumMinor,
    }));
    res.json({
      ledger: [...ledger].reverse(),
      months,
      totalCount: ledger.length,
      totalSumMinor: ledger.reduce((s, e) => s + Number(e.amount || 0), 0),
    });
  });

  // ── Visits ─────────────────────────────────────────────────────────────
  router.get("/visits", requireAdmin, (_req, res) => {
    const visits = readJsonLines(VISITS_FILE) as { t?: string; path?: string; email?: string }[];
    res.json({
      total: visits.length,
      daily: summarizeVisits(visits).daily,
      byMonth: summarizeVisits(visits).byMonth,
      today: summarizeVisits(visits).today,
      topPaths: summarizeVisits(visits).topPaths,
      last: [...visits].reverse().slice(0, 100),
    });
  });

  // ── Calls / system ─────────────────────────────────────────────────────
  router.get("/calls", requireAdmin, (_req, res) => {
    res.json({
      liveEvents: deps.callStatusLog(),
      transcripts: deps.liveCallTranscripts(),
    });
  });

  // ── BirichiNex posts ───────────────────────────────────────────────────
  router.get("/posts", requireAdmin, (_req, res) => {
    const store = readJsonFile<{ posts: PlatformPost[] }>(POSTS_FILE, { posts: [] });
    res.json(store);
  });

  router.post("/posts", requireAdmin, (req, res) => {
    const title = String(req.body?.title || "").trim().slice(0, 160);
    const body = String(req.body?.body || "").trim().slice(0, 12_000);
    const category = String(req.body?.category || "News").trim().slice(0, 40);
    if (!title || !body) return res.status(400).json({ error: "title and body are required" });
    const store = readJsonFile<{ posts: PlatformPost[] }>(POSTS_FILE, { posts: [] });
    const id = `bxp_${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}`;
    const now = new Date().toISOString();
    store.posts.unshift({
      id,
      title,
      body,
      category,
      pinned: Boolean(req.body?.pinned),
      published: req.body?.published !== false,
      createdAt: now,
      updatedAt: now,
    });
    writeJsonFile(POSTS_FILE, store);
    res.json({ ok: true, post: store.posts[0] });
  });

  router.put("/posts/:id", requireAdmin, (req, res) => {
    const store = readJsonFile<{ posts: PlatformPost[] }>(POSTS_FILE, { posts: [] });
    const idx = store.posts.findIndex((p) => p.id === String(req.params.id || ""));
    if (idx < 0) return res.status(404).json({ error: "Post not found" });
    const cur = store.posts[idx];
    store.posts[idx] = {
      ...cur,
      title: req.body?.title != null ? String(req.body.title).trim().slice(0, 160) : cur.title,
      body: req.body?.body != null ? String(req.body.body).trim().slice(0, 12_000) : cur.body,
      category: req.body?.category != null ? String(req.body.category).trim().slice(0, 40) : cur.category,
      pinned: req.body?.pinned != null ? Boolean(req.body.pinned) : cur.pinned,
      published: req.body?.published != null ? req.body.published !== false : cur.published,
      updatedAt: new Date().toISOString(),
    };
    writeJsonFile(POSTS_FILE, store);
    res.json({ ok: true, post: store.posts[idx] });
  });

  router.delete("/posts/:id", requireAdmin, (req, res) => {
    const store = readJsonFile<{ posts: PlatformPost[] }>(POSTS_FILE, { posts: [] });
    store.posts = store.posts.filter((p) => p.id !== String(req.params.id || ""));
    writeJsonFile(POSTS_FILE, store);
    res.json({ ok: true });
  });

  // ── Academy control ────────────────────────────────────────────────────
  router.put("/academy", requireAdmin, (req, res) => {
    const disabled = Array.isArray(req.body?.disabled)
      ? (req.body.disabled as string[]).map((s) => String(s).trim().slice(0, 80)).filter(Boolean)
      : [];
    writeJsonFile(ACADEMY_FILE, { disabled });
    res.json({ ok: true, disabled });
  });

  return router;
}

// ─── Public platform feed (community + learning) ─────────────────────────────
function summarizeVisits(visits: { t?: string }[]): {
  total: number;
  today: number;
  daily: { day: string; count: number }[];
  byMonth: { month: string; count: number }[];
  topPaths: { path: string; count: number }[];
} {
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const monthKey = now.toISOString().slice(0, 7);
  const daily = new Map<string, number>();
  const byMonth = new Map<string, number>();
  const paths = new Map<string, number>();
  let total = 0;
  let today = 0;
  for (const v of visits) {
    const t = v.t ? new Date(v.t) : null;
    if (!t || Number.isNaN(t.getTime())) continue;
    const day = t.toISOString().slice(0, 10);
    const mo = day.slice(0, 7);
    daily.set(day, (daily.get(day) || 0) + 1);
    byMonth.set(mo, (byMonth.get(mo) || 0) + 1);
    const path = String((v as any).path || "/").slice(0, 200);
    paths.set(path, (paths.get(path) || 0) + 1);
    total += 1;
    if (day === todayKey) today += 1;
  }
  return {
    total,
    today,
    daily: [...daily.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => ({ day, count })),
    byMonth: [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count })),
    topPaths: [...paths.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([p, count]) => ({ path: p, count })),
  };
}

export function publicVisitsDeps(): { visitFile: string } {
  return { visitFile: VISITS_FILE };
}

export function publicPlatformRouter(): Router {
  const express = require("express") as any;
  const router = express.Router();

  router.get("/posts", (_req: Request, res: Response) => {
    const store = readJsonFile<{ posts: PlatformPost[] }>(POSTS_FILE, { posts: [] });
    const published = store.posts
      .filter((p) => p.published)
      .sort((a, b) => Number(b.pinned || 0) - Number(a.pinned || 0) || String(b.updatedAt).localeCompare(String(a.updatedAt)));
    res.json({ posts: published });
  });

  router.get("/academy", (_req: Request, res: Response) => {
    const store = readJsonFile<{ disabled: string[] }>(ACADEMY_FILE, { disabled: [] });
    res.json(store);
  });

  return router;
}

export { ADMIN_EMAIL, appendJsonLine, VISITS_FILE };