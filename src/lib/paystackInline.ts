/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Paystack Inline checkout. Instead of navigating the whole tab to Paystack's
 * hosted checkout page (which sits behind a Cloudflare bot-wall that stalls on
 * some devices), this injects Paystack's inline.js and opens the card / M-Pesa
 * popup directly over our page. The server reference is unchanged, so payment
 * status is still verified server-side via /api/payments/status and the webhook
 * ledger still records every charge.
 *
 * Security: the popup runs inside Paystack's own sandboxed iframe. We never
 * touch card data — we only pass the amount/reference through the public key.
 */

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

export interface InlinePayParams {
  /** Paystack public key (from the server checkout response). */
  key: string;
  email: string;
  /** Charge amount in MAJOR units (e.g. KSh 6,622). X100 happens here. */
  amount: number;
  /** Charge currency, e.g. "KES". */
  currency: string;
  reference: string;
  channel: "card" | "mpesa";
  onSuccess: (transactionRef: string) => void;
  onClose: () => void;
}

let scriptPromise: Promise<void> | null = null;

export function loadPaystackInline(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("browser only"));
  if (window.PaystackPop && window.PaystackPop.setup) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-paystack-inline]');
    if (existing) {
      const finish = () => {
        if (window.PaystackPop) resolve();
        else reject(new Error("Paystack inline failed to initialise"));
      };
      existing.addEventListener("load", finish);
      existing.addEventListener("error", () => reject(new Error("no network")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    s.dataset.paystackInline = "1";
    s.onload = () => {
      if (window.PaystackPop) resolve();
      else reject(new Error("Paystack inline did not expose an API"));
    };
    s.onerror = () => reject(new Error("no network"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function openPaystackInline(p: InlinePayParams): void {
  const pop = window.PaystackPop;
  if (!pop) throw new Error("Paystack inline is not ready");
  // Paystack's Inline amounts are minor units (same rule as the REST API).
  const minor = Math.round(p.amount * 100);
  pop.setup({
    key: p.key,
    email: p.email || "owner@portmetals.co.tz",
    amount: minor,
    currency: p.currency,
    ref: p.reference,
    metadata: { birichinex: true },
    channels: p.channel === "mpesa" ? ["mobile_money"] : ["card"],
    callback: (response: Record<string, unknown>) => {
      const txnRef = String(response?.reference || response?.trxref || p.reference);
      p.onSuccess(txnRef);
    },
    onClose: p.onClose,
  }).openIframe();
}