/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mid-payment resume. Paystack redirects the browser away to the hosted
 * checkout and back; the client JS dies during that trip. So before redirecting
 * we park a "pending checkout" in sessionStorage (per-tab, cleared on settle).
 * When the user lands back and revisits the relevant page, the pending record
 * is reloaded, verified against /api/payments/status, and the subscription or
 * order completes.
 */

export interface PendingCheckout {
  reference: string;
  kind: "membership" | "dropship" | "order";
  tier?: string;
  billingPeriod?: string;
  /** Restored into the checkout form after redirect (orders only). */
  shipping?: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    country: string;
    notes: string;
  };
}

const KEY = "birichinex_pending_checkout";

export function savePendingCheckout(pending: PendingCheckout): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(pending));
  } catch {
    // private mode etc. — resume simply won't happen; user can retry the flow
  }
}

export function loadPendingCheckout(): PendingCheckout | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCheckout;
    if (!parsed?.reference || !parsed?.kind) {
      clearPendingCheckout();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingCheckout(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // noop
  }
}