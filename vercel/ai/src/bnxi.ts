/**
 * BNX Intelligence Core.
 *
 * The single business-intelligence brain behind BirichiNex. It reads a live
 * snapshot of the founder's business and answers the three questions that
 * matter:
 *
 *   1. What changed / needs your attention?
 *   2. What should you do next?
 *   3. What are the pros and cons of each move — personalized to this business?
 *
 * It also powers the marketplace pulse ("what's moving fast and how to boost
 * it") and the BNX social media manager (a weekly content plan generated from
 * real business data).
 *
 * Principle: Understand → Recommend → Execute → Measure → Learn → Verify → Connect.
 */

import { BirichiNexView } from "../../src/types";
import { fmtTZS } from "./finance-agent";

// ── Input snapshot ───────────────────────────────────────────────────────────

export interface BNXState {
  userName: string;
  businessName: string;
  audit: null;
  wallet: { balance: number };
  transactions: {
    id: string;
    type: string;
    amount: { amount: number };
    category: string;
    status: string;
    date: string;
  }[];
  inventory: {
    id: string;
    name: string;
    category: string;
    stock: number;
    minStock: number;
    price: { amount: number };
    status: string;
  }[];
  orders: {
    id: string;
    productName: string;
    quantity: number;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
  dropshipOrders: {
    id: string;
    productName: string;
    quantity: number;
    total: { amount: number };
    status: string;
    placedAt: string;
  }[];
  agentCalls: { id: string; outcome: string; status: string; createdAt: string }[];
  loyalty: { points: number };
  contacts: number;
  subscription: { status: string; plan: string | null };
}

// ── Output types ─────────────────────────────────────────────────────────────

export type BNXAttentionKind = "finance" | "inventory" | "calls" | "orders" | "growth" | "opportunity";

export interface BNXAttention {
  id: string;
  kind: BNXAttentionKind;
  severity: 1 | 2 | 3;
  title: string;
  detail: string;
  view: BirichiNexView;
  chip: string;
}

export interface StrategyProsCons {
  strategy: string;
  view: BirichiNexView;
  action: string;
  pros: string[];
  cons: string[];
  verdict: string;
}

export interface BNXMover {
  product: string;
  orders: number;
  revenue: number;
  share: number;
  status: "up" | "new" | "flat";
}

export interface BNXPulse {
  summary: string;
  movers: BNXMover[];
  slowSellers: string[];
  boostTips: string[];
}

export interface BNXSocialPost {
  day: string;
  channel: string;
  caption: string;
  hashtags: string[];
  goal: string;
  cta: string;
}

export interface BNXSocialPlan {
  summary: string;
  posts: BNXSocialPost[];
  tips: string[];
}

export interface BNXBriefing {
  generatedAt: string;
  userName: string;
  businessName: string;
  summary: string;
  attention: BNXAttention[];
  next: BNXAttention | null;
  pulse: BNXPulse;
  prosCons: StrategyProsCons[];
}

// ── Core aggregations ────────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<BNXAttentionKind, number> = {
  finance: 0,
  inventory: 1,
  calls: 2,
  orders: 3,
  growth: 4,
  opportunity: 5,
};

export function aggregate(state: BNXState) {
  const revenue = state.transactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((s, t) => s + t.amount.amount, 0);
  const expenses = state.transactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((s, t) => s + t.amount.amount, 0);
  const pendingPayables = state.transactions
    .filter((t) => t.type === "expense" && t.status === "pending")
    .reduce((s, t) => s + t.amount.amount, 0);
  const netFlow = revenue - expenses;
  const outOfStock = state.inventory.filter((i) => i.stock <= 0);
  const lowStock = state.inventory.filter((i) => i.stock > 0 && i.stock <= i.minStock);
  const missedCalls = state.agentCalls.filter((c) => c.status === "missed" || c.outcome === "no-answer");
  const activeOrders = state.orders.filter((o) => ["processing", "packed", "in_transit"].includes(o.status));
  const activeOrderValue = activeOrders.reduce((s, o) => s + o.totalAmount, 0);
  return {
    revenue,
    expenses,
    netFlow,
    margin: revenue > 0 ? netFlow / revenue : 0,
    pendingPayables,
    outOfStock,
    lowStock,
    missedCalls,
    activeOrders,
    activeOrderValue,
  };
}

// ── What needs attention ─────────────────────────────────────────────────────

export function buildAttention(state: BNXState): BNXAttention[] {
  const agg = aggregate(state);
  const attention: BNXAttention[] = [];

  if (agg.netFlow < 0) {
    attention.push({
      id: "att-cashflow",
      kind: "finance",
      severity: 3,
      title: "You're spending more than you earn",
      detail: `Net flow is ${fmtTZS(agg.netFlow)} this period. Cut the bottom 20% of expenses — I can help you prioritise.`,
      view: "finance",
      chip: "Help me fix my cash flow",
    });
  }

  if (agg.outOfStock.length > 0) {
    attention.push({
      id: "att-out-of-stock",
      kind: "inventory",
      severity: 3,
      title: `${agg.outOfStock.length} item${agg.outOfStock.length > 1 ? "s are" : " is"} out of stock`,
      detail: `${agg.outOfStock.map((i) => i.name).slice(0, 3).join(", ")}${agg.outOfStock.length > 3 ? "…" : ""} — every day sold out is lost revenue.`,
      view: "inventory",
      chip: "What should I restock?",
    });
  }

  if (agg.missedCalls.length > 0) {
    attention.push({
      id: "att-calls",
      kind: "calls",
      severity: 3,
      title: `${agg.missedCalls.length} call${agg.missedCalls.length > 1 ? "s were" : " was"} missed`,
      detail: "Amani couldn't reach these customers. Let me show you who they were and schedule a callback.",
      view: "ai-agent",
      chip: "Show me my missed calls",
    });
  }

  if (agg.pendingPayables > 0) {
    attention.push({
      id: "att-payables",
      kind: "finance",
      severity: 2,
      title: `${fmtTZS(agg.pendingPayables)} in pending payables`,
      detail: "Settling on time protects your supplier credit and discounts.",
      view: "finance",
      chip: "Settle my pending payables",
    });
  }

  if (agg.lowStock.length > 0) {
    attention.push({
      id: "att-low-stock",
      kind: "inventory",
      severity: 2,
      title: `${agg.lowStock.length} item${agg.lowStock.length > 1 ? "s" : ""} below reorder level`,
      detail: `${agg.lowStock.map((i) => i.name).slice(0, 3).join(", ")}${agg.lowStock.length > 3 ? "…" : ""} — top up before demand peaks.`,
      view: "inventory",
      chip: "Restock my inventory",
    });
  }

  if (agg.activeOrders.length > 0) {
    attention.push({
      id: "att-orders",
      kind: "orders",
      severity: 1,
      title: `${agg.activeOrders.length} active order${agg.activeOrders.length > 1 ? "s" : ""} in transit`,
      detail: `${fmtTZS(agg.activeOrderValue)} of goods are on the move. Follow up when they land for repeat business.`,
      view: "orders",
      chip: "Check my active orders",
    });
  }

  if (agg.netFlow > 0) {
    const target = Math.round(agg.netFlow * 0.1);
    attention.push({
      id: "att-save",
      kind: "opportunity",
      severity: 1,
      title: `Put ${fmtTZS(target)} aside`,
      detail: "You're cash-positive. A 10% savings rule builds your 3-month operating buffer.",
      view: "finance-agent",
      chip: "Move money to savings",
    });
  }

  attention.sort((a, b) => b.severity - a.severity || SEVERITY_ORDER[a.kind] - SEVERITY_ORDER[b.kind]);
  return attention.slice(0, 5);
}

// ── Personalized pros & cons ─────────────────────────────────────────────────

export function strategyProsCons(state: BNXState): StrategyProsCons[] {
  const agg = aggregate(state);
  const results: StrategyProsCons[] = [];

  // Restock fast movers
  const movers = marketplacePulse(state).movers;
  if (agg.outOfStock.length > 0 || agg.lowStock.length > 0) {
    const topMover = movers[0]?.product;
    results.push({
      strategy: "Restock now",
      view: "inventory",
      action: "Approve restocks in inventory",
      pros: [
        "Directly recovers sales you're currently losing",
        topMover ? `${topMover} is your fastest mover — restocking it compounds demand` : "Replenishes sellable stock",
        "Prevents the low-stock drag on repeat customers",
      ],
      cons: [
        `Uses working capital now (≈${fmtTZS(Math.round(agg.expenses * 0.25))} if restocking 25% of the month's spend)`,
        "Locks cash before you confirm the demand is still hot",
      ],
      verdict: agg.netFlow >= 0
        ? "Recommended — you're cash-positive and stock is the immediate revenue lever."
        : "Only if you clear payables first — your cash position is tight right now.",
    });
  }

  // Savings
  if (agg.netFlow > 0) {
    const target = Math.round(agg.netFlow * 0.1);
    results.push({
      strategy: "Automate a 10% savings rule",
      view: "finance-agent",
      action: "Transfer to savings",
      pros: [
        `Builds a ${fmtTZS(target)}-per-period buffer automatically`,
        "Survives slow months and supplier shocks",
        "Reinvest 80%, save 10%, keep 10% liquid",
      ],
      cons: [
        "Slightly less cash available for restock today",
        "Requires discipline to not touch it early",
      ],
      verdict: "Recommended — a 3-month buffer is the difference between surviving and thriving in EA retail.",
    });
  }

  // Price review
  if (agg.margin < 0.3 && agg.revenue > 0) {
    results.push({
      strategy: "Raise prices on best sellers",
      view: "inventory",
      action: "Review pricing",
      pros: [
        `Margin is only ${Math.round(agg.margin * 100)}% — even +5% on movers lifts profit directly`,
        "No extra sales needed to improve the bottom line",
      ],
      cons: [
        "Might soften demand on price-sensitive items",
        "Customers notice sudden jumps on repeat purchases",
      ],
      verdict: "Worth testing on your top 3 movers, not across the board.",
    });
  }

  // Marketplace expansion
  results.push({
    strategy: "Push faster movers to the marketplace",
    view: "marketplace",
    action: "Post to marketplace",
    pros: [
      movers[0] ? `People are already buying ${movers[0]} — market it harder` : "Exposes your catalogue to new buyers",
      "Marketplace visibility compounds with loyalty and wallet incentives",
    ],
    cons: [
      "More orders means more fulfilment load",
      "Marketplace competition can pressure your price",
    ],
    verdict: "Low risk, high reward when focused on your proven movers.",
  });

  return results.slice(0, 3);
}

// ── Marketplace pulse ────────────────────────────────────────────────────────

export function marketplacePulse(state: BNXState): BNXPulse {
  const sold = [
    ...state.orders.filter((o) => !["cancelled", "returned"].includes(o.status)).map((o) => ({
      product: o.productName,
      revenue: o.totalAmount,
      count: o.quantity,
    })),
    ...state.dropshipOrders.filter((o) => o.status !== "cancelled").map((o) => ({
      product: o.productName,
      revenue: o.total.amount,
      count: o.quantity,
    })),
  ];

  const byProduct = new Map<string, { revenue: number; count: number }>();
  sold.forEach((s) => {
    const cur = byProduct.get(s.product) ?? { revenue: 0, count: 0 };
    cur.revenue += s.revenue;
    cur.count += s.count;
    byProduct.set(s.product, cur);
  });

  const rows = [...byProduct.entries()].sort((a, b) => b[1].revenue - a[1].revenue);
  const totalRevenue = rows.reduce((s, [, v]) => s + v.revenue, 0);

  const movers: BNXMover[] = rows.slice(0, 3).map(([product, v], i) => ({
    product,
    orders: v.count,
    revenue: v.revenue,
    share: totalRevenue > 0 ? Math.round((v.revenue / totalRevenue) * 100) : 0,
    status: i === 0 && v.count >= 2 ? "up" : v.count >= 2 ? "flat" : "new",
  }));

  const moverNames = new Set(rows.map(([p]) => p.toLowerCase()));
  const slowSellers = state.inventory
    .filter((i) => i.stock > 0 && !moverNames.has(i.name.toLowerCase()))
    .slice(0, 3)
    .map((i) => i.name);

  const boostTips = [
    movers[0] ? `Run a 24h flash sale on ${movers[0].product} — it's your proven winner (${movers[0].share}% of revenue).` : "Post your top 3 items to the marketplace and let Amani call buyers.",
    "Bundle fast movers with accessories to lift average order value.",
    "Share your movers on WhatsApp Status + Instagram Stories this week — social sells fast in EA.",
    "A five-star loyalty push on repeat buyers keeps your movers moving.",
  ];

  const summary = movers[0]
    ? `${movers[0].product} is moving fastest — ${movers[0].orders} sold, ${fmtTZS(movers[0].revenue)}, ${movers[0].share}% of your revenue.`
    : "No marketplace sales yet — post your best items to get the pulse moving.";

  return { summary, movers, slowSellers, boostTips };
}

// ── Social media manager ─────────────────────────────────────────────────────

export function socialMediaPlan(state: BNXState): BNXSocialPlan {
  const movers = marketplacePulse(state).movers;
  const hero = movers[0]?.product ?? "our latest arrivals";
  const name = state.businessName || "BirichiNex";
  const channels = ["Instagram", "WhatsApp Status", "TikTok", "Instagram Reels", "WhatsApp Broadcast", "Instagram Stories", "TikTok"] as const;
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

  const goals = [
    "Awareness — new eyes on the brand",
    "Demand — push the week's hero product",
    "Trust — show real customer results",
    "Urgency — flash sale countdown",
    "Community — start conversations",
    "Authority — founder insight",
    "Close — convert followers into buyers",
  ];

  const ctas = ["Tap to order", "DM us", "Link in bio", "Order on WhatsApp", "Visit the marketplace", "Comment 'PRICE'", "Share with a friend"];

  const posts: BNXSocialPost[] = days.map((day, i) => {
    const channel = channels[i % channels.length];
    const heroLine =
      i % 3 === 0
        ? `We're moving ${hero} this week — and customers are loving it.`
        : `Behind the scenes at ${name}: sourcing, sorting and quality-checking for you.`;
    return {
      day,
      channel,
      caption: `${i % 2 === 0 ? "New drop" : "Customer love"} — ${heroLine} From bale to boutique, ${name} is building real businesses across East Africa. ${goals[i % goals.length]}.`,
      hashtags: ["#FashionEA", "#DarEsSalaamFashion", "#NairobiStyle", "#MitumbaVibes", "#MadeInAfrica", "#SmallBusiness", "#BNX"],
      goal: goals[i % goals.length],
      cta: ctas[i % ctas.length],
    };
  });

  return {
    summary: `A 7-day ${name} plan built around your real movers — ${hero} leads the content.`,
    posts,
    tips: [
      "Post at 7–9am and 7–9pm — when EA buyers scroll.",
      "Reply to every comment within 30 minutes to boost reach.",
      "Tag your marketplace so followers can buy in one tap.",
      "Stories (behind-the-scenes) get 2x the views of feed posts.",
    ],
  };
}

// ── The briefing ─────────────────────────────────────────────────────────────

export function buildBNXBriefing(state: BNXState): BNXBriefing {
  const attention = buildAttention(state);
  const pulse = marketplacePulse(state);
  const prosCons = strategyProsCons(state);
  const next = attention[0] ?? null;
  const firstName = state.userName.split(" ")[0] || "founder";

  const summary = next
    ? `${firstName}, here's the move that matters most today: ${next.title}. ${next.detail}`
    : `${firstName}, your business looks balanced today. ${pulse.summary} Let's keep the momentum going.`;

  return {
    generatedAt: new Date().toISOString(),
    userName: firstName,
    businessName: state.businessName || "your business",
    summary,
    attention,
    next,
    pulse,
    prosCons,
  };
}

// ── Spoken briefing (Siri/Bixby-style proactive announcement) ────────────────

export function speakableBriefing(state: BNXState): string {
  const agg = aggregate(state);
  const parts: string[] = [];
  if (agg.netFlow < 0) parts.push(`Heads up. You're spending more than you earn by ${fmtTZS(Math.abs(agg.netFlow))}.`);
  if (agg.outOfStock.length > 0) parts.push(`${agg.outOfStock.length} items are out of stock.`);
  if (agg.missedCalls.length > 0) parts.push(`${agg.missedCalls.length} calls were missed.`);
  if (agg.pendingPayables > 0) parts.push(`You have ${fmtTZS(agg.pendingPayables)} in pending payables.`);
  if (parts.length === 0) parts.push("Everything looks on track. No urgent attention needed.");
  const hero = marketplacePulse(state).movers[0];
  parts.push(hero ? `${hero} is your fastest mover. Say open marketplace to see it.` : "Say open finance to review your numbers.");
  return parts.join(" ");
}
