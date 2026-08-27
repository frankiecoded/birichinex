/**
 * BNX Intelligence Core — the closed-loop brain behind BirichiNex.
 *
 * ONE persistent intelligence core shared by every AI surface (Advisor chat,
 * Amani the sales agent, Zahara the finance agent, the Hey BNX copilot, the
 * Intelligence Board). It answers the full loop:
 *
 *   UNDERSTAND → buildBusinessContext()         (one live business snapshot)
 *   DIAGNOSE   → buildAttention()               (what needs your attention)
 *   PRIORITIZE → prioritize()                   (the Top 3 — never generic)
 *   GUIDE      → recommend()                    (data-grounded recs w/ measure)
 *   EXECUTE    → rec.prep + view                (connected to a real action)
 *   MEASURE    → measureOutcome()               (before → after on the metric)
 *   LEARN      → recordOutcome() + learnings()  (feeds every future prompt)
 *   VERIFY     → buildSystemContext()           (LLM always cites real figures)
 *   CONNECT    → rec.view / academy / ecosystem (each move links forward)
 *   GROW       → liveHealth()                   (health proxy responds to change)
 *
 * Everything is deterministic and grounded in the actual store — when a
 * business is quiet there is NO invented fluff, and when it is busy the AI
 * cites precise numbers, names and deltas.
 */

import { useStore } from "../../src/store/useStore";
import { fmtTZS } from "./finance-agent";
import {
  aggregate,
  buildAttention,
  marketplacePulse,
  BNXState,
  BNXAttention,
  BNXMover,
} from "./bnxi";
import {
  ActionPlanHorizon,
  BirichiNexView,
  BusinessRecommendation,
  RecommendationOutcome,
  RecommendationPriority,
  RecommendationSource,
} from "../../src/types";

export type BNXLanguage = "en" | "sw" | "fr" | "de";

export interface BNXStockItem {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
}

export interface BNXBusinessContext {
  builtAt: string;
  profile: { userName: string; businessName: string; language: BNXLanguage };
  health: { live: number; auditCompleted: boolean; auditScore: number | null };
  finance: {
    revenue: number;
    expenses: number;
    netFlow: number;
    margin: number;
    pendingPayables: number;
    walletBalance: number;
    savingsTarget: number;
  };
  stock: { outOfStock: BNXStockItem[]; lowStock: BNXStockItem[]; marketplaceListings: number };
  commerce: { movers: BNXMover[]; activeOrders: number; activeOrderValue: number };
  customers: { contacts: number; activeContacts: number; missedCalls7d: number };
  loop: { open: BusinessRecommendation[]; done: number; outcomes: RecommendationOutcome[] };
  memory: {
    journey: string | null;
    threads: { you: string; amani: string }[]; // most recent first, compact
  };

  // ── The persistent intelligence.
  context: BusinessRecommendation[]; // diagnosed, deduplicated, measurable
  next: BNXAttention[]; // what changed / needs attention
  pulse: ReturnType<typeof marketplacePulse>;
}

// ── Languages the platform can communicate in ───────────────────────────────
export const BNX_LANGUAGES: BNXLanguage[] = ["en", "sw", "fr", "de"];

const PRIORITY_WEIGHT: Record<RecommendationPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// ── Metric registry — how each recommendation is measured / verified ────────

interface MetricReader {
  label: string;
  unit: string;
  direction: "up" | "down" | "zero";
  read: (c: BNXBusinessContext) => number;
}

export function readMetric(c: BNXBusinessContext, key: string): number | undefined {
  const m = metricForKey(key);
  return m ? m.read(c) : undefined;
}

function metricForKey(key: string): MetricReader | undefined {
  const registry: Record<string, MetricReader> = {
    cashflow: {
      label: "Net cash flow",
      unit: "TZS",
      direction: "up",
      read: (c) => c.finance.netFlow,
    },
    restock: {
      label: "Out-of-stock items",
      unit: "items",
      direction: "down",
      read: (c) => c.stock.outOfStock.length,
    },
    lowstock: {
      label: "Low-stock items",
      unit: "items",
      direction: "down",
      read: (c) => c.stock.lowStock.length,
    },
    payables: {
      label: "Pending payables",
      unit: "TZS",
      direction: "down",
      read: (c) => c.finance.pendingPayables,
    },
    callbacks: {
      label: "Missed calls (7d)",
      unit: "calls",
      direction: "down",
      read: (c) => c.customers.missedCalls7d,
    },
    savings: {
      label: "Operating buffer",
      unit: "TZS",
      direction: "up",
      read: (c) => c.finance.walletBalance,
    },
    movers: {
      label: "Marketplace listings",
      unit: "items",
      direction: "up",
      read: (c) => c.stock.marketplaceListings,
    },
    leads: {
      label: "Active customers",
      unit: "customers",
      direction: "up",
      read: (c) => c.customers.activeContacts,
    },
    orders: {
      label: "Active orders delivered",
      unit: "orders",
      direction: "up",
      read: (c) => c.commerce.activeOrders,
    },
  };
  return registry[key];
}

// ── Live health proxy ───────────────────────────────────────────────────────
// Deterministic and transparent: the same inputs always produce the same
// score, so measuring an action before/after shows the real impact.

export function computeLiveHealth(c: {
  finance: BNXBusinessContext["finance"];
  stock: BNXBusinessContext["stock"];
  customers: BNXBusinessContext["customers"];
}): number {
  let s = 50;
  // Profitability (up to +22)
  s += Math.max(-22, Math.min(22, Math.round(c.finance.margin * 55)));
  // Stock health (−3 per risk item, to −12)
  s -= Math.min(12, (c.stock.outOfStock.length + c.stock.lowStock.length) * 3);
  // Cash pressure (deficit vs revenue pulls up to −12)
  if (c.finance.netFlow < 0 && c.finance.revenue > 0) {
    s -= Math.min(12, Math.round((Math.abs(c.finance.netFlow) / c.finance.revenue) * 20));
  }
  // Outstanding payables (−2 hundred thousands each, to −8)
  s -= Math.min(8, Math.round(c.finance.pendingPayables / 100_000) * 2);
  // Missed follow-ups (−2 each, to −8)
  s -= Math.min(8, c.customers.missedCalls7d * 2);
  // A growing customer base (+ up to 8)
  s += Math.min(8, c.customers.activeContacts * 2);
  return Math.max(0, Math.min(100, s));
}

// ── Adapter: assemble ONE live context from the real store ─────────────────

function toBNXState(s: ReturnType<typeof useStore.getState>): BNXState {
  return {
    userName: s.settings.profile.name || "Founder",
    businessName: s.settings.profile.company || "your business",
    audit: null,
    wallet: { balance: s.wallet.balance },
    contacts: s.contacts.length,
    loyalty: { points: s.loyalty.points },
    subscription: {
      status: s.subscription.status,
      plan: s.subscription.plan,
    },
    transactions: s.transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: { amount: t.amount.amount },
      category: t.category,
      status: t.status,
      date: t.date,
    })),
    inventory: s.inventoryItems.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      stock: i.stock,
      minStock: i.minStock,
      price: { amount: i.price.amount },
      status: i.status,
    })),
    orders: s.orders.map((o) => ({
      id: (o as any).id ?? crypto.randomUUID(),
      productName: (o as any).productName ?? o.productName ?? "Order",
      quantity: (o as any).quantity ?? 1,
      totalAmount: (o as any).totalAmount ?? (o as any).total?.amount ?? 0,
      status: (o as any).status ?? "processing",
      createdAt: (o as any).createdAt ?? new Date().toISOString(),
    })),
    dropshipOrders: s.dropshipOrders.map((o) => ({
      id: o.id,
      productName: o.productName,
      quantity: o.quantity,
      total: { amount: o.total.amount },
      status: o.status,
      placedAt: o.placedAt,
    })),
    agentCalls: s.agentCalls.map((c) => ({
      id: c.id,
      outcome: c.outcome,
      status: c.status,
      createdAt: c.createdAt,
    })),
  };
}

export function buildBusinessContext(): BNXBusinessContext {
  const s = useStore.getState();
  const bnxi = toBNXState(s);
  const agg = aggregate(bnxi);
  const attention = buildAttention(bnxi);
  const pulse = marketplacePulse(bnxi);

  const outOfStock: BNXStockItem[] = s.inventoryItems
    .filter((i) => i.stock <= 0)
    .map((i) => ({ id: i.id, name: i.name, stock: i.stock, minStock: i.minStock, price: i.price.amount }));
  const lowStock: BNXStockItem[] = s.inventoryItems
    .filter((i) => i.stock > 0 && i.stock <= i.minStock)
    .map((i) => ({ id: i.id, name: i.name, stock: i.stock, minStock: i.minStock, price: i.price.amount }));

  const activeOrders = s.orders.filter((o) => ["processing", "packed", "in_transit"].includes((o as any).status ?? ""));
  const activeOrderValue = activeOrders.reduce((t, o) => t + ((o as any).totalAmount ?? (o as any).total?.amount ?? 0), 0);
  const missedCalls7d = s.agentCalls.filter(
    (c) => (c.status === "missed" || c.outcome === "no-answer") &&
      Date.now() - new Date(c.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000,
  ).length;

  const base = {
    finance: {
      revenue: agg.revenue,
      expenses: agg.expenses,
      netFlow: agg.netFlow,
      margin: agg.margin,
      pendingPayables: agg.pendingPayables,
      walletBalance: s.wallet.balance,
      savingsTarget: agg.netFlow > 0 ? Math.round(agg.netFlow * 0.1) : 0,
    },
    stock: {
      outOfStock,
      lowStock,
      marketplaceListings: s.inventoryItems.filter((i) => i.postedToMarketplace).length,
    },
    commerce: { movers: pulse.movers, activeOrders: activeOrders.length, activeOrderValue },
    customers: {
      contacts: s.contacts.length,
      activeContacts: s.contacts.filter((c) => c.status === "active").length,
      missedCalls7d,
    },
  };

  const profile = {
    userName: s.settings.profile.name || "Founder",
    businessName: s.settings.profile.company || "your business",
    language: (s.settings.profile as any).language ?? ("en" as BNXLanguage),
  };

  // ── Memory: the founder's journey + recent threads (true conversation memory).
  const journey = s.audit
    ? `Audit completed ${new Date(s.audit.completedAt).toLocaleDateString()} — stage "${s.audit.maturityStage}" (${s.audit.scores.businessHealth}/100 health, ${s.audit.actionPlan.length} actions in the plan). Growth "${s.audit.businessProfile.growthStage}"`
    : null;
  const threads: { you: string; amani: string }[] = [...s.aiConversations]
    .filter((c) => c.assistantType === "advisor" && c.messages.length > 0)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3)
    .map((c) => {
      const msgs = c.messages.slice(-2);
      const you = msgs.find((m) => m.role === "user")?.content ?? "";
      const amani = [...msgs].reverse().find((m) => m.role === "assistant")?.content ?? "";
      return { you: trimText(you, 160), amani: trimText(amani, 220) };
    })
    .filter((t) => t.you);

  const live = computeLiveHealth(base);

  return {
    builtAt: new Date().toISOString(),
    profile,
    health: {
      live,
      auditCompleted: s.auditCompleted,
      auditScore: s.audit?.scores.businessHealth ?? null,
    },
    ...base,
    loop: {
      open: s.recommendations.filter((r) => r.status === "suggested" || r.status === "approved"),
      done: s.outcomes.length,
      outcomes: s.outcomes,
    },
    memory: { journey, threads },
    context: s.recommendations,
    next: attention,
    pulse,
  };
}

export function getPreferredLanguage(): BNXLanguage {
  const s = useStore.getState();
  return (s.settings.profile as any).language ?? "en";
}

// ── DIAGNOSE + PRIORITIZE ───────────────────────────────────────────────────
// Each priority cites the exact signal. No generic lists.

export interface TopPriority {
  rec: BusinessRecommendation;
  why: string;
  urgency: RecommendationPriority;
}

const HORIZON: Partial<Record<string, ActionPlanHorizon>> = {
  cashflow: "now",
  restock: "now",
  lowstock: "30-days",
  payables: "now",
  callbacks: "30-days",
  savings: "30-days",
  movers: "30-days",
  leads: "30-days",
  orders: "90-days",
};

const VIEW: Partial<Record<string, BirichiNexView>> = {
  cashflow: "finance",
  restock: "inventory",
  lowstock: "inventory",
  payables: "finance",
  callbacks: "ai-agent",
  savings: "finance-agent",
  movers: "marketplace",
  leads: "crm",
  orders: "orders",
};

const SOURCE: Partial<Record<string, RecommendationSource>> = {
  cashflow: "finance",
  restock: "inventory",
  lowstock: "inventory",
  payables: "finance",
  callbacks: "sales",
  savings: "finance",
  movers: "growth",
  leads: "sales",
  orders: "sales",
};

export function recommend(c: BNXBusinessContext): BusinessRecommendation[] {
  const agg = c.finance;
  const drafts: BusinessRecommendation[] = [];
  const now = new Date().toISOString();
  const lang = c.profile.language;

  const make = (
    key: string,
    priority: RecommendationPriority,
    title: string,
    detail: string,
    rationale: string,
    prep: string,
  ): BusinessRecommendation => {
    const metric = metricForKey(key)!;
    const id = `rec-${key}`;
    return {
      id,
      key,
      source: SOURCE[key] ?? "diagnosis",
      priority,
      status: "suggested",
      createdAt: now,
      updatedAt: now,
      title,
      detail,
      rationale,
      horizon: HORIZON[key] ?? "30-days",
      view: VIEW[key] ?? "dashboard",
      actionLabel: key === "cashflow" ? "Fix cash flow" : key === "restock" ? "Restock & relist" : key === "callbacks" ? "Call them back" : "Open & do it",
      prep: prep || `Open ${VIEW[key]}`,
      measure: { metric: metric.label, direction: metric.direction, unit: metric.unit, before: metric.read(c) },
      healthAt: computeLiveHealth(autoHealthBase(c)),
    };
  };

  // 1. Cash flow is negative — the most urgent truth.
  if (agg.netFlow < 0) {
    drafts.push(
      make(
        "cashflow",
        "critical",
        "You're spending more than you earn",
        `Net flow is ${fmtTZS(agg.netFlow)} against ${fmtTZS(agg.revenue)} income — you're burning ${fmtTZS(Math.abs(agg.netFlow))} this period.`,
        `Live ledger shows income ${fmtTZS(agg.revenue)} vs expenses ${fmtTZS(agg.expenses)} (${Math.max(0, Math.round(-agg.margin * 100))}% deficit).`,
        "Show me how to cut my bottom 20% of expenses",
      ),
    );
  }

  // 2. Stock is blocking sales.
  if (c.stock.outOfStock.length > 0) {
    drafts.push(
      make(
        "restock",
        "critical",
        `${c.stock.outOfStock.length} item${c.stock.outOfStock.length > 1 ? "s are" : " is"} out of stock`,
        `${fmtList(c.stock.outOfStock.map((i) => i.name))} — every day sold out is revenue you can't get back.`,
        `Inventory shows ${c.stock.outOfStock.map((i) => `${i.name} (${fmtTZS(i.price)})`).join(", ")} at 0 stock.`,
        `Restock ${c.stock.outOfStock[0].name} now`,
      ),
    );
  } else if (c.stock.lowStock.length > 0) {
    drafts.push(
      make(
        "lowstock",
        "high",
        `${c.stock.lowStock.length} item${c.stock.lowStock.length > 1 ? "s" : ""} below reorder level`,
        `${fmtList(c.stock.lowStock.map((i) => i.name))} — top up before demand peaks.`,
        `Inventory shows ${c.stock.lowStock.length} item(s) at or under their minimum: ${fmtList(c.stock.lowStock.map((i) => `${i.name} (${i.stock}/${i.minStock})`))}.`,
        "Restock my low-stock items",
      ),
    );
  }

  // 3. Pending payables threaten supplier goodwill.
  if (agg.pendingPayables > 0) {
    drafts.push(
      make(
        "payables",
        "high",
        `${fmtTZS(agg.pendingPayables)} in pending payables`,
        "Settling on time protects your supplier credit and keeps discounts open.",
        `Your ledger has ${fmtTZS(agg.pendingPayables)} still marked pending for suppliers.`,
        "Settle my pending payables",
      ),
    );
  }

  // 4. Missed calls = missed orders.
  if (c.customers.missedCalls7d > 0) {
    drafts.push(
      make(
        "callbacks",
        "high",
        `${c.customers.missedCalls7d} customer call${c.customers.missedCalls7d > 1 ? "s" : ""} missed this week`,
        `Amani couldn't reach ${c.customers.missedCalls7d} buyer${c.customers.missedCalls7d > 1 ? "s" : ""} — a callback converts these leads into orders.`,
        `Agent call log shows ${c.customers.missedCalls7d} no-answer/missed in the last 7 days.`,
        "Call back the customers Amani missed",
      ),
    );
  }

  // 5. Cash-positive → automate the 10% buffer rule.
  if (agg.netFlow > 0 && agg.savingsTarget > 0) {
    drafts.push(
      make(
        "savings",
        "medium",
        `Put ${fmtTZS(agg.savingsTarget)} into your operating buffer`,
        "You're cash-positive — a 10% savings rule funds the slow months and your next restock.",
        `Net flow is ${fmtTZS(agg.netFlow)} this period; 10% = ${fmtTZS(agg.savingsTarget)}.`,
        "Move my 10% savings rule into action",
      ),
    );
  }

  // 6. Push proven movers out to the marketplace.
  const topMover = c.pulse.movers[0];
  if (topMover) {
    drafts.push(
      make(
        "movers",
        "medium",
        `List your movers on the marketplace`,
        `${topMover.product} is ${topMover.share}% of your revenue — make it visible to more buyers.`,
        `Order history shows ${topMover.orders} sold of ${topMover.product} (${fmtTZS(topMover.revenue)}), ${topMover.share}% of revenue; only ${c.stock.marketplaceListings} item(s) currently listed.`,
        "Post my fastest movers to the marketplace",
      ),
    );
  }

  // 7. Stale leads sitting in the CRM.
  const staleLeads = useStore.getState().contacts.filter((c) => c.status !== "active");
  if (staleLeads.length > 0) {
    drafts.push(
      make(
        "leads",
        "medium",
        `${staleLeads.length} customer${staleLeads.length > 1 ? "s" : ""} waiting for a follow-up`,
        `${fmtList(staleLeads.slice(0, 3).map((c) => c.name))}${staleLeads.length > 3 ? "…" : ""} haven't converted yet. A call or message moves them to active.`,
        `CRM has ${staleLeads.length} contact(s) with a non-active status (${fmtList(staleLeads.slice(0, 3).map((l) => l.name))}${staleLeads.length > 3 ? ", …" : ""}).`,
        "Call my missed customers",
      ),
    );
  }

  // 8. Follow up when goods land.
  if (c.commerce.activeOrders > 0) {
    drafts.push(
      make(
        "orders",
        "low",
        `Follow up on ${c.commerce.activeOrders} active order${c.commerce.activeOrders > 1 ? "s" : ""}`,
        `${fmtTZS(c.commerce.activeOrderValue)} of goods are in transit — a delivery-day message turns the order into a repeat buyer.`,
        `${c.commerce.activeOrders} order(s) are processing/packing/in-transit worth ${fmtTZS(c.commerce.activeOrderValue)}.`,
        "Follow up on my active orders",
      ),
    );
  }

  // Never invent advice for a business that is genuinely calm.
  if (drafts.length === 0) {
    drafts.push(
      make(
        "growth",
        "low",
        "Protect your quiet momentum",
        "No urgent flags today. Keep publishing, keep calling repeat buyers, and keep posting to the marketplace.",
        `Diagnosis found no critical signals: net flow ${fmtTZS(agg.netFlow)}, no stock or payable alerts, no missed calls.`,
        "Show me my weekly growth plan",
      ),
    );
  }

  // Language-aware footnote so the AI never answers at the wrong register.
  if (lang !== "en") {
    for (const d of drafts) {
      (d as any).languageHint = lang;
    }
  }

  return drafts;
}

function fmtList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function trimText(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

// ── Sync the diagnosis into the persistent loop ─────────────────────────────

export function syncRecommendations(): BusinessRecommendation[] {
  const s = useStore.getState();
  const ctx = buildBusinessContext();
  const drafts = recommend(ctx);
  const byId = new Map(s.recommendations.map((r) => [r.id, r]));
  const now = new Date().toISOString();

  for (const d of drafts) {
    const existing = byId.get(d.id);
    if (existing) {
      // Preserve approval state; refresh the numbers so the advice stays exact.
      byId.set(d.id, {
        ...d,
        status: existing.status,
        createdAt: existing.createdAt,
        updatedAt: now,
        measure: { ...d.measure, before: existing.measure.before ?? d.measure.before },
        outcomeId: existing.outcomeId,
        executedAt: existing.executedAt,
      });
    } else {
      byId.set(d.id, { ...d, createdAt: now, updatedAt: now });
    }
  }

  // Auto-close *suggested* items whose signal disappeared (truthful, measured).
  const resolved: BusinessRecommendation[] = [];
  for (const existing of byId.values()) {
    if (existing.status !== "suggested") continue;
    if (drafts.find((d) => d.id === existing.id)) continue;
    const after = readMetric(ctx, existing.key ?? "growth");
    resolved.push({
      ...existing,
      status: "done",
      executedAt: now,
      updatedAt: now,
      outcomeId: undefined,
      measure: { ...existing.measure, after: after ?? existing.measure.after },
    });
  }

  const next = [...byId.values(), ...resolved];
  s.mergeRecommendations(
    drafts.map((d) => {
      const kept = next.find((r) => r.id === d.id);
      return { ...d, ...(kept && kept.status !== "suggested" ? { status: kept.status } : {}) };
    }),
  );

  const closedKeys = new Set(resolved.map((r) => r.key));
  if (resolved.length > 0) {
    for (const r of resolved) {
      const cleared = r.title.toLowerCase().includes("out of stock");
      s.recordOutcome({
        id: crypto.randomUUID(),
        recommendationKey: r.key,
        recommendationTitle: r.title,
        summary: cleared
          ? `${r.title} — condition cleared, stock is available again.`
          : `${r.title} — the signal cleared before action was needed.`,
        metrics: [
          {
            label: r.measure.metric,
            before: r.measure.before ?? 0,
            after: r.measure.after ?? 0,
            unit: r.measure.unit ?? "",
          },
        ],
        healthBefore: r.healthAt ?? (r.measure.before ? computeLiveHealth(autoHealthBase(ctx)) : undefined),
        healthAfter: ctx.health.live,
        recordedAt: now,
        source: "diagnosis",
      });
      void closedKeys;
    }
  }

  return next.filter((r) => r.status === "suggested" || r.status === "approved");
}

function autoHealthBase(c: BNXBusinessContext) {
  return { finance: c.finance, stock: c.stock, customers: c.customers };
}

// ── PRIORITIZE: the Top 3 ───────────────────────────────────────────────────

export function prioritize(c: BNXBusinessContext): TopPriority[] {
  const open = c.loop.open;
  const fresh = recommend(c);
  const merged = new Map<number, BusinessRecommendation>();
  fresh.forEach((f, i) => merged.set(i, f));
  open.forEach((o) => {
    const idx = fresh.findIndex((f) => f.id === o.id);
    if (idx >= 0) merged.set(idx, o);
  });

  const list = [...merged.values()]
    .filter((r) => r.status === "suggested" || r.status === "approved")
    .sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] || a.createdAt.localeCompare(b.createdAt));

  return list.slice(0, 3).map((rec) => ({
    rec,
    why: rec.rationale,
    urgency: rec.priority,
  }));
}

// ── MEASURE → LEARN: close the loop ─────────────────────────────────────────

export function measureOutcome(rec: BusinessRecommendation, summary?: string): RecommendationOutcome {
  const c = buildBusinessContext();
  const after = readMetric(c, rec.key) ?? rec.measure.after ?? 0;
  const outcome: RecommendationOutcome = {
    id: crypto.randomUUID(),
    recommendationKey: rec.key,
    recommendationTitle: rec.title,
    summary: summary?.trim() || `Executed: ${rec.title}.`,
    metrics: [
      {
        label: rec.measure.metric,
        before: rec.measure.before ?? 0,
        after,
        unit: rec.measure.unit ?? "",
      },
    ],
    healthBefore: rec.healthAt ?? (rec.measure.before !== undefined ? computeLiveHealth(autoHealthBase(c)) : undefined),
    healthAfter: c.health.live,
    recordedAt: new Date().toISOString(),
    source: rec.source,
  };
  useStore.getState().recordOutcome(outcome, rec.id);
  return outcome;
}

// Called by the Hey BNX executor after a real action lands, so EXECUTE always
// feeds MEASURE + LEARN. Only records deltas that are true (before is captured
// from the recommendation it fulfils).
export function captureExecutionOutcome(
  intent: string,
  ok: boolean,
  title: string,
  detail: string,
): RecommendationOutcome | null {
  if (!ok) return null;
  const keyMap: Partial<Record<string, string>> = {
    makeCall: "callbacks",
    addContact: "leads",
    restock: "restock",
    postToMarketplace: "movers",
    logTransaction: "cashflow",
    placeDropshipOrder: "movers",
  };
  const key = keyMap[intent as keyof typeof keyMap];
  if (!key) return null;
  const s = useStore.getState();
  const open = s.recommendations.find((r) => r.key === key && (r.status === "suggested" || r.status === "approved"));
  if (!open) return null;

  const c = buildBusinessContext();
  const after = readMetric(c, key) ?? open.measure.after ?? 0;
  const summary = `${title}. ${detail}`.slice(0, 240);
  const outcome: RecommendationOutcome = {
    id: crypto.randomUUID(),
    recommendationKey: key,
    recommendationTitle: open.title,
    summary,
    metrics: [
      {
        label: open.measure.metric,
        before: open.measure.before ?? 0,
        after,
        unit: open.measure.unit ?? "",
      },
    ],
    healthBefore: open.healthAt ?? (open.measure.before !== undefined ? computeLiveHealth(autoHealthBase(c)) : undefined),
    healthAfter: c.health.live,
    recordedAt: new Date().toISOString(),
    source: "copilot",
  };
  s.recordOutcome(outcome, open.id);
  return outcome;
}

// ── LEARNINGS: what this business tried, and what changed ───────────────────

export function learnings(c: BNXBusinessContext): string[] {
  return c.loop.outcomes.slice(-5).reverse().map((o) => {
    const delta = o.metrics[0]
      ? `${o.metrics[0].label}: ${o.metrics[0].before.toLocaleString()} → ${o.metrics[0].after.toLocaleString()} ${o.metrics[0].unit}`
      : "";
    const health = o.healthAfter !== undefined && o.healthBefore !== undefined
      ? (o.healthAfter - o.healthBefore >= 0 ? "+" : "") + (o.healthAfter - o.healthBefore)
      : undefined;
    return `${o.recommendationTitle} — ${delta}${health !== undefined ? ` · health ${health}pts` : ""}`;
  });
}

// ── VERIFY: the grounding block every LLM prompt must carry ────────────────
// This is what makes the AI "never generic" — it cites the actual business.

export function buildSystemContext(c: BNXBusinessContext): string {
  const f = c.finance;
  const top = prioritize(c);
  const prior = top.length > 0
    ? top.map((t, i) => `${i + 1}. [${t.urgency}] ${t.rec.title} — ${t.rec.detail}`).join("\n")
    : "No priority flags right now — the business is running clean.";
  const learned = learnings(c);
  const lastLearned = learned.length > 0 ? learned.map((l) => `- ${l}`).join("\n") : "- This business has not closed an AI-driven action yet.";

  const memoryJourney = c.memory.journey ? `- ${c.memory.journey}` : "- No audit run yet — the founder hasn't completed discovery.";
  const memoryThreads =
    c.memory.threads.length > 0
      ? c.memory.threads.map((t, i) => `- Thread ${i + 1}: you → "${t.you}" → ${t.amani}`).join("\n")
      : "- No previous conversations on this device yet. Start fresh, warm, and specific.";

  const movers = c.pulse.movers[0]
    ? `Fastest mover: ${c.pulse.movers[0].product} (${c.pulse.movers[0].orders} sold, ${fmtTZS(c.pulse.movers[0].revenue)}, ${c.pulse.movers[0].share}% of revenue).`
    : "No sales recorded yet — focus on sourcing + first customers.";

  return `## LIVE BUSINESS INTELLIGENCE (mandatory grounding — cite these exact figures, never give generic advice)
- Business: ${c.profile.businessName} | Owner: ${c.profile.userName} | Preferred language: ${c.profile.language}
- Live health proxy: ${c.health.live}/100${c.health.auditScore !== null ? ` (founder audit: ${c.health.auditScore}/100)` : ""}
- Cash flow: net ${fmtTZS(f.netFlow)} (revenue ${fmtTZS(f.revenue)}, expenses ${fmtTZS(f.expenses)}, margin ${Math.round(f.margin * 100)}%) | payables ${fmtTZS(f.pendingPayables)} | wallet ${fmtTZS(f.walletBalance)}
- Stock: ${c.stock.outOfStock.length} out of stock, ${c.stock.lowStock.length} low (${c.stock.outOfStock.map((i) => i.name).slice(0, 3).join(", ") || "none"}), ${c.stock.marketplaceListings} listed on marketplace
- Customers: ${c.customers.contacts} contacts (${c.customers.activeContacts} active), ${c.customers.missedCalls7d} missed calls this week
- ${movers}
- TOP PRIORITIES THIS PERIOD:
${prior}
- WHAT WE TRIED AND MEASURED ON THIS BUSINESS:
${lastLearned}
- THE FOUNDER'S JOURNEY (memory):
${memoryJourney}
- RECENT CONVERSATIONS (continue these threads like a partner who remembers):
${memoryThreads}
Write like an operator who is inside this business, references these numbers, continues these threads, and turns the top priorities into concrete next steps. Keep it fluent, never templated.`;
}

// ── Spoken briefing for the proactive "good morning" ────────────────────────

export function dailyBriefing(): string {
  const c = buildBusinessContext();
  const top = prioritize(c);
  const name = c.profile.userName.split(" ")[0] || "boss";
  if (top.length === 0) return `${name}, ${c.profile.businessName} is running clean. Live health ${c.health.live}/100, net flow ${fmtTZS(c.finance.netFlow)}. Keep the momentum.`;
  const [first] = top;
  return `${name}, good morning. The move that matters most today: ${first.rec.title}. ${first.rec.detail} Your live health is ${c.health.live}/100.`;
}