/**
 * Cloud state sync — pushes/pulls the app's business state to Supabase
 * (Postgres JSONB) through the server's /api/sync endpoints. The service-role
 * key never leaves the server.
 *
 * Flow:
 *   pullSnapshot()   — on app load: fetch the user's cloud document, hydrate the store.
 *   schedulePush()   — debounced push after any store mutation (see subscribeToSync).
 *   currentUserKey() — logged-in email, or a per-device id for guests.
 */

import { SYNCED_KEYS, useStore } from "../store/useStore";

const DEVICE_KEY = "birichinex-device";
const PUSH_DEBOUNCE_MS = 1500;

let lastSentJson = "";
let pushTimer: ReturnType<typeof setTimeout> | null = null;

// ── Device secret (gates /api/sync server-side) ─────────────────────────────
// Baked in at build time from VITE_SYNC_DEVICE_SECRET (matches the server's
// SYNC_DEVICE_SECRET). Without it the cloud sync layer stays offline.

let deviceSecretCache: string | null = null;
function deviceSecret(): string {
  if (deviceSecretCache !== null) return deviceSecretCache;
  const envSecret = (import.meta.env.VITE_SYNC_DEVICE_SECRET as string | undefined)?.trim();
  if (envSecret) {
    deviceSecretCache = envSecret;
    return envSecret;
  }
  let local = localStorage.getItem("birichinex-sync-secret");
  if (local) {
    deviceSecretCache = local;
    return local;
  }
  deviceSecretCache = "";
  return "";
}

export function syncConfigured(): boolean {
  return Boolean(deviceSecret());
}

function syncHeaders(): Record<string, string> {
  return { "X-Device-Secret": deviceSecret() };
}

// ── Identity ────────────────────────────────────────────────────────────────

function safeUuid(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* insecure context (plain http) — fall through */
  }
  return "x-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

export function currentUserKey(): string {
  const email = useStore.getState().user?.email?.trim();
  if (email) return email.toLowerCase();
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = "dev-" + safeUuid();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

// ── Serialization ───────────────────────────────────────────────────────────

const SENSITIVE_KEYS = new Set([
  "password",
  "twoFactorCode",
  "recoveryCodes",
  "secret",
  "secretKey",
  "accessToken",
  "refreshToken",
  "apiKey",
  "privateKey",
]);

function stripSensitive(value: unknown, depth = 0): unknown {
  if (depth > 6) return value;
  if (Array.isArray(value)) return value.map((v) => stripSensitive(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(k)) continue;
      out[k] = stripSensitive(v, depth + 1);
    }
    return out;
  }
  return value;
}

export function serializeSnapshot(): Record<string, unknown> {
  const state = useStore.getState() as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of SYNCED_KEYS) {
    const value = state[key];
    if (value !== undefined) out[key] = stripSensitive(value);
  }
  return out;
}

// ── Pull (load from cloud on boot) ──────────────────────────────────────────
//
// On boot the local store may already hold newer business data (the same user
// kept working offline). `requireBlank` (used only at app start) makes the pull
// act as a true restore: it only hydrates when there is nothing local worth
// keeping, protecting against a stale cloud doc clobbering newer work.

const DATA_KEYS: ReadonlyArray<string> = [
  "orders", "contacts", "transactions", "shipments", "inventoryItems",
  "documents", "agentCalls", "dropshipOrders", "withdrawals",
];

function localStoreHasData(): boolean {
  const state = useStore.getState();
  for (const key of DATA_KEYS) {
    const value = state[key];
    if (Array.isArray(value) && value.length > 0) return true;
  }
  return Boolean(state.user) || Boolean(state.settings?.profile?.name);
}

export async function pullSnapshot(opts?: { requireBlank?: boolean }): Promise<{ ok: boolean; hadData: boolean }> {
  if (!syncConfigured()) return { ok: false, hadData: false }; // no device secret — stay offline
  try {
    const userKey = currentUserKey();
    const res = await fetch(`/api/sync?userKey=${encodeURIComponent(userKey)}`, {
      headers: syncHeaders(),
    });
    if (res.status === 503) return { ok: false, hadData: false }; // sync disabled
    if (!res.ok) return { ok: false, hadData: false };
    const data = await res.json();
    const hadData = Boolean(data?.payload && typeof data.payload === "object");
    if (hadData) {
      const cloudVersion = Number(data?.version || 0);
      const localVersion = useStore.getState().syncVersion;
      // The app must always show the freshest state, never stale localStorage:
      // hydrate when (a) cloud is newer than what this device already applied,
      // or (b) this device has nothing local worth keeping (true restore).
      const blank = opts?.requireBlank ? !localStoreHasData() : false;
      const cloudNewer = cloudVersion > localVersion;
      if (blank || cloudNewer) {
        useStore.getState().hydrate(data.payload);
        useStore.getState().setSyncVersion(cloudVersion);
        lastSentJson = JSON.stringify(serializeSnapshot());
        return { ok: true, hadData: true };
      }
      // Local is already at/after the cloud doc — keep it (offline-newer work). 
      return { ok: true, hadData: false };
    }
    return { ok: true, hadData: false };
  } catch (error) {
    console.warn("Sync: pull failed", error);
    return { ok: false, hadData: false };
  }
}

// ── Push (write to cloud) ───────────────────────────────────────────────────
// One automatic retry after a short backoff for transient network/server
// hiccups; a failed push is never silently dropped from the queue.

const PUSH_RETRY_DELAY_MS = 2000;

export async function pushSnapshot(): Promise<boolean> {
  if (!syncConfigured()) return false;
  try {
    const ok = await pushOnce();
    if (!ok) {
      await new Promise((resolve) => setTimeout(resolve, PUSH_RETRY_DELAY_MS));
      return pushOnce();
    }
    return ok;
  } catch (error) {
    console.warn("Sync: push failed", error);
    return false;
  }
}

async function pushOnce(): Promise<boolean> {
  try {
    const userKey = currentUserKey();
    const payload = serializeSnapshot();
    lastSentJson = JSON.stringify(payload);
    const res = await fetch("/api/sync", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...syncHeaders() },
      body: JSON.stringify({ userKey, payload }),
    });
    if (res.status === 503) return false;
    if (!res.ok) {
      console.warn("Sync: push failed", res.status, await res.text().catch(() => ""));
      return false;
    }
    const data = await res.json().catch(() => null);
    const version = Number(data?.version || 0);
    if (version > 0) useStore.getState().setSyncVersion(version);
    return true;
  } catch (error) {
    console.warn("Sync: push failed", error);
    return false;
  }
}

export function schedulePush(): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushSnapshot();
  }, PUSH_DEBOUNCE_MS);
}

// ── Health probe (Settings → Support) ────────────────────────────────────────
// A cheap read against /api/sync tells the user whether cloud backup is live.
// A 2xx from GET means both the server and Postgres are reachable.

export type SyncHealth =
  | { state: "ok" }
  | { state: "disabled" }
  | { state: "offline" }
  | { state: "error"; detail?: string };

export async function probeSync(): Promise<SyncHealth> {
  if (!syncConfigured()) return { state: "offline" };
  try {
    const userKey = currentUserKey();
    const res = await fetch(`/api/sync?userKey=${encodeURIComponent(userKey)}`, {
      headers: syncHeaders(),
    });
    if (res.status === 503) return { state: "disabled" };
    if (!res.ok) return { state: "error", detail: `HTTP ${res.status}` };
    return { state: "ok" };
  } catch (error) {
    return { state: "error", detail: error instanceof Error ? error.message : undefined };
  }
}

// ── Store subscription (deduped, handles identity changes) ──────────────────

let lastSyncedUserKey = currentUserKey();

export function subscribeToSync(): () => void {
  return useStore.subscribe(() => {
    const userKey = currentUserKey();
    if (userKey !== lastSyncedUserKey) {
      // Logged in/out — switch to that user's cloud document.
      lastSyncedUserKey = userKey;
      lastSentJson = "";
      void pullSnapshot().then((r) => {
        if (r.ok && !r.hadData) void pushSnapshot();
      });
      return;
    }
    const json = JSON.stringify(serializeSnapshot());
    if (json === lastSentJson) return;
    lastSentJson = json;
    schedulePush();
  });
}

// ── Global accounts registry ─────────────────────────────────────────────────
// Unlike per-user business_state, the account roster is SHARED across all
// devices (a "Customers" counter must be identical on every phone). These
// helpers pull the registry on boot and push signups/logins so new accounts
// appear everywhere immediately.

export type RegistryAccount = {
  email: string;
  name: string;
  accountType: string;
  createdAt: string | null;
  lastLogin: string | null;
};

export async function pullAccounts(): Promise<RegistryAccount[]> {
  if (!syncConfigured()) return [];
  try {
    const res = await fetch("/api/accounts", {
      headers: syncHeaders(),
    });
    if (res.status === 503 || res.status === 401) return [];
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data?.accounts)) return [];
    return data.accounts as RegistryAccount[];
  } catch (error) {
    console.warn("Accounts: pull failed", error);
    return [];
  }
}

export async function pushAccount(account: RegistryAccount): Promise<boolean> {
  if (!syncConfigured()) return false;
  try {
    const res = await fetch("/api/accounts", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...syncHeaders() },
      body: JSON.stringify(account),
    });
    if (res.status === 503 || res.status === 401) return false;
    return res.ok;
  } catch (error) {
    console.warn("Accounts: push failed", error);
    return false;
  }
}
