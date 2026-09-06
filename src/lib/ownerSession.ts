/**
 * Owner-session helpers.
 *
 * The admin identity deliberately lives OUTSIDE the Zustand store (no
 * persistence, no localStorage) so it can never leak into the user's cloud
 * snapshot or a disk trace on the device beyond the current tab tidily.
 */

const SESSION_KEY = "bxn_owner_session";

export interface OwnerSession {
  token: string;
  email: string;
  expiresAt: number;
}

export function getOwnerSession(): OwnerSession | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OwnerSession;
    if (!parsed?.token || !Number.isFinite(parsed.expiresAt) || Date.now() > parsed.expiresAt) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setOwnerSession(session: OwnerSession): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

export function clearOwnerSession(): void {
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function isOwnerAuthorized(): boolean {
  return Boolean(getOwnerSession());
}

/** Fetch helper that always attaches the owner token and refreshes expiry on success. */
export async function ownerFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const session = getOwnerSession();
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(init?.headers as Record<string, string>) };
  if (session?.token) headers["x-admin-token"] = session.token;
  const res = await fetch(path, { ...init, headers });
  if (res.status === 401) {
    clearOwnerSession();
    throw new Error("unauthorized");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(String((body as { error?: string })?.error || `Request failed (${res.status})`));
  }
  const data = (await res.json()) as T & { ok?: boolean };
  if (!data || typeof data !== "object") return data as T;
  if (data && session?.token) {
    const known = data as unknown as Record<string, unknown>;
    if (typeof known.expiresAt === "number") {
      setOwnerSession({ ...session, expiresAt: known.expiresAt });
    }
  }
  return data;
}