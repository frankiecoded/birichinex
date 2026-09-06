/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Server-side payment gateway abstraction.
 *
 * Two providers sit behind one interface:
 *   - Paystack (live) — hosted checkout (cards, bank transfer, mobile money)
 *     through api.paystack.co. Money settles to the owner's Paystack account
 *     and is reported per transaction via webhooks. The owner is a Kenyan
 *     business, so the settlement currency is KES by default (see
 *     PAYSTACK_CURRENCY). Payouts are NOT wired yet — they arrive with the
 *     fund-tracking update.
 *   - Simulation (local) — an in-memory provider so every flow (checkout →
 *     paid → activate) works end-to-end before real API keys exist.
 *
 * This module is server-only: it reads process.env and never ships to the
 * browser. The client only ever talks to /api/payments/*.
 */

import crypto from "crypto";

export type PaymentMode = "paystack" | "simulation";

export interface CheckoutRequest {
  reference: string;
  /** Amount in `currency` below (major units, e.g. 49 USD or 78000 TZS). */
  amount: number;
  /** Charged currency, e.g. "USD" | "TZS" | "KES" | "NGN". Paystack minor = ×100. */
  currency: string;
  description: string;
  customerEmail?: string;
  /** Paystack channels shorthand, e.g. ["card"] or ["card", "mobilemoneyke"]. */
  paymentOptions?: string[];
  /** Where Paystack returns the customer after paying. */
  redirectUrl?: string;
  /** Arbitrary customer/service metadata echoed back on the webhook. */
  meta?: Record<string, string>;
}

export interface CheckoutResult {
  /** Hosted checkout link. Null in simulation → the client shows the local modal. */
  redirectUrl: string | null;
}

export type PaymentStatus = "paid" | "pending" | "failed" | "unknown";

export interface PayoutBankAccount {
  /** Bank name, e.g. "NMB Bank Tanzania". */
  accountBank: string;
  accountNumber: string;
  accountName: string;
  /** ISO country of the receiving bank: TZ | KE | UG | NG | GH. */
  country: string;
  /** Optional branch code required by some TZ banks. */
  destinationBranchCode?: string;
}

export interface PayoutRequest {
  reference: string;
  amount: number; // major units
  currency: string;
  bankAccount: PayoutBankAccount;
  narration?: string;
}

export interface PayoutResult {
  status: "completed" | "pending" | "failed";
  message: string;
}

export interface PaymentProvider {
  readonly mode: PaymentMode;
  createCheckout(req: CheckoutRequest): Promise<CheckoutResult>;
  getStatus(reference: string): Promise<{ status: PaymentStatus; amount?: number; currency?: string }>;
  createPayout(req: PayoutRequest): Promise<PayoutResult>;
}

// ─── Paystack (live) ─────────────────────────────────────────────────────────

const PS_BASE = "https://api.paystack.co";

export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
export const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || "";

function psEnabled(): boolean {
  return Boolean(PAYSTACK_SECRET_KEY);
}

async function psFetch(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${PS_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.status === false) {
    const msg = body?.message || body?.errors?.[0]?.message || `Paystack ${res.status}`;
    throw new Error(String(msg));
  }
  return body;
}

/** Timing-safe HMAC-SHA512 signature check (Paystack `x-paystack-signature`). */
export function verifyPaystackWebhook(
  headers: Record<string, string | undefined>,
  rawBody: Buffer | null | undefined,
): boolean {
  if (!PAYSTACK_SECRET_KEY) return false; // fail closed when not configured
  const signature = headers["x-paystack-signature"] || "";
  if (!signature || !rawBody || rawBody.length === 0) return false;
  const expected = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto_timingSafeEqual(a, b);
}

function crypto_timingSafeEqual(a: Buffer, b: Buffer): boolean {
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Map the app's payment_options shorthand to Paystack channels. */
function toPaystackChannels(options?: string[]): string[] {
  const wanted = new Set((options || []).map((o) => o.toLowerCase()));
  if (wanted.size === 0) return ["card"];
  const channels: string[] = [];
  if (wanted.has("card")) channels.push("card");
  if (
    wanted.has("mobilemoney") ||
    wanted.has("mobilemoneyke") ||
    wanted.has("mobilemoneytz") ||
    wanted.has("mpesa")
  ) {
    channels.push("bank", "mobile_money");
  }
  if (wanted.has("bank") || wanted.has("transfer")) channels.push("bank");
  return channels.length > 0 ? channels : ["card"];
}

class PaystackProvider implements PaymentProvider {
  readonly mode: PaymentMode = "paystack";

  async createCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
    const body: Record<string, any> = {
      email: req.customerEmail || "owner@portmetals.co.tz",
      amount: Math.round(req.amount * 100), // Paystack charges minor units (×100)
      currency: req.currency,
      reference: req.reference,
      channels: toPaystackChannels(req.paymentOptions),
      metadata: {
        birichinex: true,
        ...(req.meta || {}),
      },
    };
    if (req.description) body.description = req.description.slice(0, 120);
    if (req.redirectUrl) body.callback_url = req.redirectUrl;

    const res = await psFetch("/transaction/initialize", { method: "POST", body: JSON.stringify(body) });
    const link: string | null = res?.data?.authorization_url || null;
    if (!link) throw new Error("Paystack returned no checkout link");
    return { redirectUrl: link };
  }

  async getStatus(reference: string): Promise<{ status: PaymentStatus; amount?: number; currency?: string }> {
    const res = await psFetch(`/transaction/verify/${encodeURIComponent(reference)}`);
    const data = res?.data || {};
    const status = String(data?.status || "").toLowerCase();
    const matches = String(data?.reference || "") === reference;
    if (status === "success" && matches) {
      return { status: "paid", amount: data?.amount, currency: data?.currency };
    }
    if (status === "abandoned" || status === "failed") return { status: "failed" };
    return { status: "pending" };
  }

  async createPayout(_req: PayoutRequest): Promise<PayoutResult> {
    return {
      status: "failed",
      message:
        "Payouts via Paystack are not enabled yet — they arrive with the fund-tracking update. Funds settle straight to your Paystack account for now.",
    };
  }
}

// ─── Simulation (local) ──────────────────────────────────────────────────────

interface SimCheckout {
  status: PaymentStatus;
  amount?: number;
  currency?: string;
}

const simCheckouts = new Map<string, SimCheckout>();

class SimulationProvider implements PaymentProvider {
  readonly mode: PaymentMode = "simulation";

  async createCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
    simCheckouts.set(req.reference, {
      status: "pending",
      amount: req.amount,
      currency: req.currency,
    });
    return { redirectUrl: null };
  }

  markPaid(reference: string): boolean {
    const entry = simCheckouts.get(reference);
    if (!entry) return false;
    entry.status = "paid";
    return true;
  }

  markFailed(reference: string): boolean {
    const entry = simCheckouts.get(reference);
    if (!entry) return false;
    entry.status = "failed";
    return true;
  }

  async getStatus(reference: string): Promise<{ status: PaymentStatus; amount?: number; currency?: string }> {
    const entry = simCheckouts.get(reference);
    if (!entry) return { status: "unknown" };
    return { status: entry.status, amount: entry.amount, currency: entry.currency };
  }

  async createPayout(req: PayoutRequest): Promise<PayoutResult> {
    return {
      status: "completed",
      message: `Simulated transfer of ${req.amount.toLocaleString("en-US")} ${req.currency} to ${req.bankAccount.accountName} (${req.bankAccount.accountNumber})`,
    };
  }
}

// ─── Provider resolution ─────────────────────────────────────────────────────

let provider: PaymentProvider | null = null;

/** Lazy singleton resolved from env. PAYSTACK_SECRET_KEY present → live. */
export function getPaymentProvider(): PaymentProvider {
  if (provider) return provider;
  if (psEnabled()) {
    console.log("Payments: Paystack provider active.");
    provider = new PaystackProvider();
  } else {
    console.log("Payments: simulation provider active (set PAYSTACK_SECRET_KEY to go live).");
    provider = new SimulationProvider();
  }
  return provider;
}

export function getPaymentMode(): PaymentMode {
  return getPaymentProvider().mode;
}

export function isSimulationProvider(provider: PaymentProvider): provider is SimulationProvider {
  return provider.mode === "simulation";
}