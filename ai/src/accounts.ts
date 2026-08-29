/**
 * BNX Customer Accounts — the always-live, per-customer view behind every
 * conversation and every follow-up.
 *
 * Two deterministic layers, both rebuilt from the real store on every call:
 *
 *   1. buildCustomerAccounts()   — one account per contact, consolidated from
 *      contacts + orders + agent calls (lifetime spend, recency, active
 *      orders, repeat cycle, missed callbacks, lifecycle state).
 *
 *   2. buildFollowUps()          — account-driven follow-up triggers that turn
 *      those accounts into a prioritized queue (who needs a nudge, why, on
 *      which channel, with a ready-to-say script). Never generic: every item
 *      cites the customer's real numbers.
 *
 * This makes the AI "always updated": the same engine feeds the sales agent's
 * follow-up queue AND the grounding block every advisor/copilot prompt carries
 * (see buildCustomerAwareness).
 *
 * The engine is PURE — it takes a plain snapshot of store data and returns
 * plain data, so it can be imported by the store, pages and core without any
 * circular dependency. Inputs are structurally typed so the real store slices
 * (Contact[], TrackedOrder[], AgentCall[]) plug in directly.
 */

import { TrackedOrder } from "../../src/data/delivery";
import {
  CustomerAccount,
  FollowUpChannel,
  FollowUpItem,
  FollowUpKind,
} from "../../src/types";

// ── Snapshot input (structurally matches the real store slices) ─────────────

export interface AccountCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  createdAt: string;
  lastContactAt: string;
}

export interface AccountCall {
  customerId: string;
  customerName: string;
  outcome: string;
  status: string;
  createdAt: string;
}

export interface AccountInput {
  contacts: AccountCustomer[];
  orders: TrackedOrder[];
  agentCalls: AccountCall[];
  currency: string;
}

// ── Time helpers ─────────────────────────────────────────────────────────────

const DAY = 24 * 60 * 60 * 1000;
const NOW = () => Date.now();

const ORDER_REVENUE_STATUS = new Set([
  "placed",
  "confirmed",
  "processing",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
]);

const ACTIVE_STATUS = new Set([
  "processing",
  "picked_up",
  "in_transit",
  "out_for_delivery",
]);

const STALE_STATUS = new Set(["placed", "confirmed"]);

function daysBetween(fromMs: number, toMs: number): number {
  return Math.max(0, Math.floor((toMs - fromMs) / DAY));
}

function fmt(firstName: string): string {
  return firstName.trim().split(/\s+/)[0] || "there";
}

// ── Aggregate: one always-live account per contact ──────────────────────────

export function buildCustomerAccounts(input: AccountInput): CustomerAccount[] {
  const { contacts, orders, agentCalls } = input;

  const ordersFor = (c: AccountCustomer): TrackedOrder[] => {
    const phone = (c.phone || "").replace(/\s+/g, "").toLowerCase();
    return orders.filter((o) => {
      if (o.customerName && o.customerName === c.name) return true;
      if (phone && o.customerPhone) {
        return o.customerPhone.replace(/\s+/g, "").toLowerCase() === phone;
      }
      return false;
    });
  };

  const wasMissed = (c: AccountCustomer): boolean => {
    const within = NOW() - 7 * DAY;
    return agentCalls.some(
      (a) =>
        (a.customerId === c.id || (a.customerName && a.customerName === c.name)) &&
        (a.status === "missed" || a.outcome === "no-answer") &&
        new Date(a.createdAt).getTime() >= within,
    );
  };

  return contacts.map((c): CustomerAccount => {
    const owned = ordersFor(c);
    const revenue = owned.filter((o) => ORDER_REVENUE_STATUS.has(o.status));
    const timed = revenue
      .map((o) => new Date(o.createdAt).getTime())
      .sort((a, b) => a - b);
    const lifetimeSpend = revenue.reduce((t, o) => t + (o.totalAmount || 0), 0);
    const active = owned.filter((o) => ACTIVE_STATUS.has(o.status));
    const activeOrderValue = active.reduce((t, o) => t + (o.totalAmount || 0), 0);

    let repeatCycleDays: number | null = null;
    if (timed.length >= 2) {
      const gaps: number[] = [];
      for (let i = 1; i < timed.length; i++) gaps.push(daysBetween(timed[i - 1], timed[i]));
      const avg = Math.round(gaps.reduce((t, g) => t + g, 0) / gaps.length);
      repeatCycleDays = Math.max(2, avg);
    }

    const latest = revenue
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      status: (c.status as CustomerAccount["status"]) || "lead",
      tags: (c as any).tags ?? [],
      createdAt: c.createdAt,
      lastContactAt: c.lastContactAt,
      orderCount: revenue.length,
      lifetimeSpend,
      avgOrderValue: revenue.length > 0 ? Math.round(lifetimeSpend / revenue.length) : 0,
      firstOrderAt: timed.length > 0 ? new Date(timed[0]).toISOString() : null,
      lastOrderAt: timed.length > 0 ? new Date(timed[timed.length - 1]).toISOString() : null,
      lastProduct: latest?.productName,
      activeOrderCount: active.length,
      activeOrderValue,
      missedCallback: wasMissed(c),
      repeatCycleDays,
    };
  });
}

// ── Follow-up engine: account state → prioritized, grounded queue ───────────

const FOLLOWUP_PRIORITY: Record<FollowUpKind, "critical" | "high" | "medium" | "low"> = {
  "missed-callback": "critical",
  "unpaid-order": "high",
  "lapsed-high-value": "high",
  "reorder-window": "medium",
  "delivery-confirm": "medium",
  "lead-first-touch": "medium",
};

const KIND_CHANNEL: Record<FollowUpKind, FollowUpChannel> = {
  "missed-callback": "call",
  "unpaid-order": "call",
  "lapsed-high-value": "whatsapp",
  "reorder-window": "whatsapp",
  "delivery-confirm": "whatsapp",
  "lead-first-touch": "whatsapp",
};

const KIND_ORDER = ["missed-callback", "unpaid-order", "lapsed-high-value", "reorder-window", "delivery-confirm", "lead-first-touch"] as const;

function makeItem(
  input: AccountInput,
  account: CustomerAccount,
  kind: FollowUpKind,
  title: string,
  detail: string,
  script: string,
  extra?: { orderId?: string; productName?: string; amount?: number },
): FollowUpItem {
  const now = new Date().toISOString();
  return {
    id: `${kind}:${account.id}`,
    kind,
    customerId: account.id,
    customerName: account.name,
    customerPhone: account.phone,
    title,
    detail,
    channel: KIND_CHANNEL[kind],
    priority: FOLLOWUP_PRIORITY[kind],
    status: "open",
    createdAt: now,
    dueAt: now,
    script,
    ...extra,
  };
}

export function buildFollowUps(input: AccountInput): FollowUpItem[] {
  const currency = (input.currency || "KES").toUpperCase();
  const accounts = buildCustomerAccounts(input);
  const now = NOW();
  const results: FollowUpItem[] = [];

  for (const acc of accounts) {
    const name = fmt(acc.name);
    const money = (n: number) => `${n.toLocaleString()} ${currency}`;

    // 1. We called and couldn't reach them this week — callback is the sale you lost.
    if (acc.missedCallback) {
      results.push(
        makeItem(
          input,
          acc,
          "missed-callback",
          `${acc.name} never picked up`,
          `${acc.phone || "no number on file"} — Amani called this week and couldn't get through. A quick callback moves the deal.`,
          `Hi ${name}, this is the team that called you this week — we didn't get through. Ring us back any time and we'll sort you out in one go.`,
        ),
      );
      continue;
    }

    // 2. Goods are sitting unpaid / unconfirmed — confirm or ship before they shop elsewhere.
    const staleStuck = input.orders.find(
      (o) =>
        (o.customerName === acc.name || (acc.phone && o.customerPhone === acc.phone)) &&
        STALE_STATUS.has(o.status) &&
        daysBetween(new Date(o.createdAt).getTime(), now) >= 1,
    );
    if (staleStuck) {
      const latestByCustomer = input.orders
        .filter((o) => o.customerName === acc.name || (acc.phone && o.customerPhone === acc.phone))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      results.push(
        makeItem(
          input,
          acc,
          "unpaid-order",
          `${acc.name} has a pending order`,
          `${latestByCustomer.id} — ${latestByCustomer.productName} (${money(latestByCustomer.totalAmount || 0)}) has been sitting at "${latestByCustomer.status}" for over a day.`,
          `Hi ${name}, just checking on order ${latestByCustomer.id} (${latestByCustomer.productName}). It's still waiting on confirmation — want to sort the details now so we can ship it today?`,
          {
            orderId: latestByCustomer.id,
            productName: latestByCustomer.productName,
            amount: latestByCustomer.totalAmount || 0,
          },
        ),
      );
      continue;
    }

    // 3. Your biggest account went quiet — protect the revenue.
    const lastOrderMs = acc.lastOrderAt ? new Date(acc.lastOrderAt).getTime() : null;
    if (acc.lifetimeSpend >= 1_000_000 && (lastOrderMs === null || daysBetween(lastOrderMs, now) >= 45)) {
      results.push(
        makeItem(
          input,
          acc,
          "lapsed-high-value",
          `${acc.name} has gone quiet`,
          `${money(acc.lifetimeSpend)} lifetime, last order ${lastOrderMs ? `${daysBetween(lastOrderMs, now)} days ago` : "on file"}. Worth a personal reach-out before they drift.`,
          `Hi ${name}, it's been a while since we last shipped to you — you've been one of our strongest accounts. I'd like to make sure the current stock has what you need. Can I send you a list today?`,
        ),
      );
      continue;
    }

    // 4. Their reorder window is due — offer to repeat the last order.
    const cycle = acc.repeatCycleDays ?? 30;
    if (acc.lastOrderAt && daysBetween(new Date(acc.lastOrderAt).getTime(), now) >= cycle) {
      results.push(
        makeItem(
          input,
          acc,
          "reorder-window",
          `${acc.name} is due a reorder`,
          `Last order ${daysBetween(new Date(acc.lastOrderAt).getTime(), now)} days ago (usually every ${cycle}d).${acc.lastProduct ? ` Offer to repeat ${acc.lastProduct}.` : ""}`,
          `Hi ${name}, it's about ${cycle} days since your last ${acc.lastProduct || "order"} with us. Stock's in and I can have it on the road within 24h — want me to repeat it?`,
          { productName: acc.lastProduct },
        ),
      );
      continue;
    }

    // 5. Goods just landed — confirm delivery, lock the repeat.
    const recentDelivery = input.orders.find(
      (o) =>
        (o.customerName === acc.name || (acc.phone && o.customerPhone === acc.phone)) &&
        o.status === "delivered" &&
        o.deliveredAt &&
        daysBetween(new Date(o.deliveredAt).getTime(), now) <= 4,
    );
    if (recentDelivery) {
      results.push(
        makeItem(
          input,
          acc,
          "delivery-confirm",
          `Confirm ${acc.name}'s delivery`,
          `${recentDelivery.productName} from order ${recentDelivery.id} landed recently — a delivery check protects reviews and repeat orders.`,
          `Hi ${name}, did the ${recentDelivery.productName} land OK? If anything's off, tell me now and I'll fix it same-day. Otherwise I'll set your reorder aside for next week.`,
          { orderId: recentDelivery.id, productName: recentDelivery.productName },
        ),
      );
      continue;
    }

    // 6. A lead still waiting for a first touch.
    if (
      acc.orderCount === 0 &&
      (acc.status as string) === "lead" &&
      daysBetween(new Date(acc.createdAt).getTime(), now) >= 3
    ) {
      results.push(
        makeItem(
          input,
          acc,
          "lead-first-touch",
          `${acc.name} hasn't had a first call`,
          `Lead created ${daysBetween(new Date(acc.createdAt).getTime(), now)} days ago with no order and no outreach yet — hand the warm-up to Amani.`,
          `Hi ${name}, we met when you signed up with us — anything you're looking for right now? Happy to price it for you today.`,
        ),
      );
    }
  }

  const priorityRank: Record<FollowUpItem["priority"], number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const kindRank = (k: FollowUpKind) => KIND_ORDER.indexOf(k);
  return results.sort(
    (a, b) =>
      priorityRank[a.priority] - priorityRank[b.priority] ||
      kindRank(a.kind) - kindRank(b.kind) ||
      a.customerName.localeCompare(b.customerName),
  );
}

// ── Grounding block: every AI prompt carries the live customer reality ──────
// Compact on purpose — it feeds the advisor + copilot system prompt so Amani
// "is always updated" and references real customers instead of generic advice.

export function buildCustomerAwareness(input: AccountInput): string {
  const accounts = buildCustomerAccounts(input);
  const followUps = buildFollowUps(input).filter((f) => f.status === "open");
  const fmtAmount = (n: number) => `${n.toLocaleString()} ${(input.currency || "KES").toUpperCase()}`;

  const spenders = accounts
    .slice()
    .sort((a, b) => b.lifetimeSpend - a.lifetimeSpend)
    .slice(0, 3)
    .filter((a) => a.lifetimeSpend > 0);

  const accountLines =
    accounts.length === 0
      ? "No customers on file yet — the founder hasn't added any contacts, so focus on building the first customers."
      : spenders.length > 0
        ? `Strongest accounts: ${spenders.map((a) => `${a.name} (${fmtAmount(a.lifetimeSpend)} lifetime${a.lastOrderAt ? `, last order ${daysBetween(new Date(a.lastOrderAt).getTime(), Date.now())}d ago` : ""})`).join(" | ")}`
        : `${accounts.length} customer(s) on file, no revenue yet — focus on converting leads to first orders.`;

  const queueLines =
    followUps.length === 0
      ? "No customers need a follow-up right now."
      : `Follow-ups on deck (${followUps.length}): ${followUps
          .slice(0, 4)
          .map((f) => `[${f.priority}] ${f.customerName} (${f.customerPhone || "no phone"}): ${f.title}`)
          .join(" | ")}${followUps.length > 4 ? ` (+${followUps.length - 4} more)` : ""}`;

  return `- ${accountLines}
- ${queueLines}`;
}