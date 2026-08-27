/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Server-side payment gateway abstraction.
 *
 * Two providers sit behind one interface:
 *   - Flutterwave (live) — card / M-Pesa collections settle to the owner's
 *     Flutterwave balance and can be paid out to a bank account in TZ/KE/UG/NG.
 *   - Simulation (local) — an in-memory provider so every flow (checkout →
 *     paid → activate → withdraw) works end-to-end before real API keys exist.
 *
 * This module is server-only: it reads process.env and never ships to the
 * browser. The client only ever talks to /api/payments/*.
 */

import crypto from "crypto";

export type PaymentMode = "flutterwave" | "simulation";

export interface CheckoutRequest {
  reference: string;
  amount: number; // in the currency below (major units, e.g. 49 USD or 250000 TZS)
  currency: "USD" | "TZS";
  description: string;
  customerEmail?: string;
  /** Flutterwave payment_options, e.g. ["card", "mobilemoneytz"] */
  paymentOptions?: string[];
  /** Where Flutterwave returns the customer after paying. */
  redirectUrl?: string;
  meta?: Record<string, string>;
}

export interface CheckoutResult {
  /** Hosted checkout link. Null in simulation → the client shows the local modal. */
  redirectUrl: string | null;
}

export type PaymentStatus = "paid" | "pending" | "failed" | "unknown";

export interface PayoutBankAccount {
  /** Flutterwave bank code, e.g. "NMB" for NMB Tanzania. */
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
  amount: number; // TZS, major units
  currency: "TZS";
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

// ─── Flutterwave (live) ──────────────────────────────────────────────────────

const FLW_BASE = "https://api.flutterwave.com/v3";

const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || "";
export const FLW_SECRET_HASH = process.env.FLUTTERWAVE_SECRET_HASH || "";

function flwEnabled(): boolean {
  return Boolean(FLW_SECRET_KEY);
}

async function flwFetch(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${FLW_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.status === "error") {
    const msg = body?.message || body?.data?.[0]?.message || `Flutterwave ${res.status}`;
    throw new Error(String(msg));
  }
  return body;
}

export function verifyFlutterwaveWebhook(headers: Record<string, string | undefined>, body: any): boolean {
  if (!FLW_SECRET_HASH) return false; // fail closed when not configured
  const signature = headers["verif-hash"] || "";
  if (!signature || !body || typeof body !== "object") return false;
  const expected = FLW_SECRET_HASH;
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

class FlutterwaveProvider implements PaymentProvider {
  readonly mode: PaymentMode = "flutterwave";

  async createCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
    const body: Record<string, any> = {
      tx_ref: req.reference,
      amount: req.amount,
      currency: req.currency,
      description: req.description.slice(0, 191),
      payment_options: req.paymentOptions?.join(",") || "card,mobilemoneytz",
      customer: { email: req.customerEmail || "owner@portmetals.co.tz" },
      customizations: {
        title: "BirichiNex Membership",
        description: req.description.slice(0, 191),
        logo: "https://portmetals.co.tz/logo.png",
      },
    };
    if (req.redirectUrl) body.redirect_url = req.redirectUrl;
    const res = await flwFetch("/payments", { method: "POST", body: JSON.stringify(body) });
    const link: string | null = res?.data?.link || null;
    if (!link) throw new Error("Flutterwave returned no checkout link");
    return { redirectUrl: link };
  }

  async getStatus(reference: string): Promise<{ status: PaymentStatus; amount?: number; currency?: string }> {
    const res = await flwFetch(
      `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
    );
    const status = String(res?.data?.status || "").toLowerCase();
    if (status === "successful") {
      return { status: "paid", amount: res?.data?.amount, currency: res?.data?.currency };
    }
    if (status === "failed" || status === "cancelled") return { status: "failed" };
    return { status: "pending" };
  }

  async createPayout(req: PayoutRequest): Promise<PayoutResult> {
    const body: Record<string, any> = {
      account_bank: req.bankAccount.accountBank,
      account_number: req.bankAccount.accountNumber,
      amount: req.amount,
      currency: req.currency,
      narration: req.narration || "BirichiNex wallet withdrawal",
      reference: req.reference,
      beneficiary_name: req.bankAccount.accountName,
      beneficiary_country: req.bankAccount.country,
    };
    if (req.bankAccount.destinationBranchCode) {
      body.destination_branch_code = req.bankAccount.destinationBranchCode;
    }
    const res = await flwFetch("/transfers", { method: "POST", body: JSON.stringify(body) });
    const data = res?.data || {};
    return {
      status: "completed",
      message: `Transfer ${data.id || req.reference} submitted to Flutterwave`,
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
      message: `Simulated transfer of ${req.amount.toLocaleString("en-US")} TZS to ${req.bankAccount.accountName} (${req.bankAccount.accountNumber})`,
    };
  }
}

// ─── Provider resolution ─────────────────────────────────────────────────────

let provider: PaymentProvider | null = null;

/** Lazy singleton resolved from env. FLUTTERWAVE_ENABLED=true + a secret key → live. */
export function getPaymentProvider(): PaymentProvider {
  if (provider) return provider;
  if (flwEnabled()) {
    console.log("Payments: Flutterwave provider active.");
    provider = new FlutterwaveProvider();
  } else {
    console.log("Payments: simulation provider active (set FLUTTERWAVE_SECRET_KEY to go live).");
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
