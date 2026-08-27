/**
 * Zahara — AI Finance Agent.
 *
 * The finance brain of BirichiNex. Reads the live business snapshot (wallet,
 * ledger, inventory, orders, loyalty, subscription), produces finance
 * strategies, proposes executable actions, and enforces a hard guardrail:
 * no money moves without explicit owner approval.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type FinanceStrategyCategory =
  | "cashflow"
  | "savings"
  | "inventory"
  | "pricing"
  | "currency"
  | "costcut"
  | "growth";

export interface FinanceStrategy {
  id: string;
  category: FinanceStrategyCategory;
  title: string;
  summary: string;
  rationale: string;
  impact: string;
  confidence: number;
  relatedActionIds: string[];
}

export type FinanceActionType =
  | "withdraw"
  | "purchase"
  | "dropship-order"
  | "transfer-savings"
  | "settle-expense"
  | "restock"
  | "adjust-price"
  | "create-budget"
  | "set-currency"
  | "generate-report";

export type FinanceActionStatus = "pending" | "approved" | "denied" | "executed";

export interface FinanceAction {
  id: string;
  type: FinanceActionType;
  title: string;
  description: string;
  amount?: number;
  targetId?: string;
  targetLabel?: string;
  requiresApproval: boolean;
  createdAt: string;
  status: FinanceActionStatus;
}

export interface FinanceApprovalEvent {
  id: string;
  actionId: string;
  actionTitle: string;
  actionType: FinanceActionType;
  amount?: number;
  decision: "approved" | "denied";
  executed: boolean;
  note: string;
  createdAt: string;
}

export interface FinanceSnapshot {
  walletBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  pendingPayables: number;
  lowStockItems: { id: string; name: string; stock: number; minStock: number }[];
  outOfStockItems: { id: string; name: string }[];
  inventoryValue: number;
  activeOrdersValue: number;
  loyaltyPoints: number;
  subscriptionPlan: string | null;
  cashRunwayMonths: number | null;
}

// ── Per-user business dataset (persisted, refreshed ≤ 24h) ──────────────────

export interface UserBusinessDataset {
  version: number;
  lastSyncedAt: string;
  businessName: string;
  sector: string;
  country: string;
  currency: string;
  monthlyBudget: number;
  goals: string[];
  snapshot: FinanceSnapshot;
  learned: {
    preferredCategories: string[];
    avgOrderValue: number;
    topSellingCategory: string;
    lowStockCount: number;
    healthNotes: string[];
  };
}

export const DATASET_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function isDatasetStale(lastSyncedAt: string | null): boolean {
  if (!lastSyncedAt) return true;
  return Date.now() - new Date(lastSyncedAt).getTime() > DATASET_MAX_AGE_MS;
}

export function buildUserDataset(input: {
  prev?: UserBusinessDataset | null;
  snapshot: FinanceSnapshot;
  meta: {
    businessName: string;
    sector: string;
    country: string;
    currency: string;
    monthlyBudget: number;
    goals: string[];
  };
}): UserBusinessDataset {
  const { prev, snapshot, meta } = input;
  const salesCount = snapshot.totalIncome > 0 ? Math.max(1, Math.round(snapshot.totalIncome / 15000)) : 0;
  const avgOrderValue = salesCount > 0 ? Math.round(snapshot.totalIncome / salesCount) : 0;

  const healthNotes: string[] = [];
  if (snapshot.netFlow < 0) healthNotes.push("Spending exceeds income — cost controls needed.");
  if (snapshot.pendingPayables > 0) healthNotes.push(`${snapshot.pendingPayables.toLocaleString("en-US")} TZS in pending payables.`);
  if (snapshot.outOfStockItems.length > 0) healthNotes.push(`${snapshot.outOfStockItems.length} item(s) out of stock — lost sales risk.`);
  if (snapshot.lowStockItems.length > 0) healthNotes.push(`${snapshot.lowStockItems.length} item(s) below reorder level.`);
  if (snapshot.netFlow >= 0) healthNotes.push("Cash flow positive — runway protected.");

  return {
    version: (prev?.version ?? 0) + 1,
    lastSyncedAt: new Date().toISOString(),
    businessName: meta.businessName,
    sector: meta.sector,
    country: meta.country,
    currency: meta.currency,
    monthlyBudget: meta.monthlyBudget,
    goals: meta.goals,
    snapshot,
    learned: {
      preferredCategories: prev?.learned?.preferredCategories ?? [],
      avgOrderValue,
      topSellingCategory: prev?.learned?.topSellingCategory ?? "Fashion",
      lowStockCount: snapshot.lowStockItems.length + snapshot.outOfStockItems.length,
      healthNotes,
    },
  };
}

// ── Guardrails ────────────────────────────────────────────────────────────────

export interface Guardrail {
  id: string;
  label: string;
  detail: string;
  hard: boolean;
}

export const AGENT_GUARDRAILS: Guardrail[] = [
  {
    id: "no-unauthorized-money",
    label: "No money moves without approval",
    detail: "Withdrawals, purchases, transfers and settlements are always proposed — never executed — until you approve them.",
    hard: true,
  },
  {
    id: "confirm-sensitive",
    label: "Sensitive info needs confirmation",
    detail: "Any action touching your balance, bank details, prices or supplier payments asks for an explicit yes or no first.",
    hard: true,
  },
  {
    id: "full-run",
    label: "Runs the business day-to-day",
    detail: "Zahara tracks cash flow, flags low stock, watches payables and recommends reorders, pricing and budgets automatically.",
    hard: false,
  },
  {
    id: "dataset-plus-web",
    label: "Answers from data + the internet",
    detail: "Advice combines your live business data with the BirichiNex knowledge base and current web research (exchange rates, prices, policy).",
    hard: false,
  },
  {
    id: "audit-trail",
    label: "Every decision is logged",
    detail: "All approvals, denials and executed actions are recorded in an audit trail you can review anytime.",
    hard: true,
  },
];

// ── Snapshot builder ─────────────────────────────────────────────────────────

const EMPTY_SNAPSHOT: FinanceSnapshot = {
  walletBalance: 0,
  totalIncome: 0,
  totalExpenses: 0,
  netFlow: 0,
  pendingPayables: 0,
  lowStockItems: [],
  outOfStockItems: [],
  inventoryValue: 0,
  activeOrdersValue: 0,
  loyaltyPoints: 0,
  subscriptionPlan: null,
  cashRunwayMonths: null,
};

/** Tolerates partial snapshots coming from API bodies or external callers. */
function normalizeSnapshot(s: Partial<FinanceSnapshot> | null | undefined): FinanceSnapshot {
  return { ...EMPTY_SNAPSHOT, ...(s ?? {}) };
}

interface SnapshotInput {
  wallet: { balance: number };
  transactions: {
    id: string;
    type: string;
    amount: { amount: number };
    status: string;
    category: string;
    date: string;
  }[];
  inventory: {
    id: string;
    name: string;
    stock: number;
    minStock: number;
    supplier: string;
    price: { amount: number };
  }[];
  orders: { status: string; total?: number }[];
  loyalty: { points: number };
  subscription: { plan: string | null; status: string };
}

export function buildFinanceSnapshot(input: SnapshotInput): FinanceSnapshot {
  const totalIncome = input.transactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((s, t) => s + t.amount.amount, 0);

  const totalExpenses = input.transactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((s, t) => s + t.amount.amount, 0);

  const pendingPayables = input.transactions
    .filter((t) => t.type === "expense" && t.status === "pending")
    .reduce((s, t) => s + t.amount.amount, 0);

  const lowStockItems = input.inventory
    .filter((i) => i.stock > 0 && i.stock <= i.minStock)
    .map((i) => ({ id: i.id, name: i.name, stock: i.stock, minStock: i.minStock }));

  const outOfStockItems = input.inventory
    .filter((i) => i.stock <= 0)
    .map((i) => ({ id: i.id, name: i.name }));

  const inventoryValue = input.inventory.reduce((s, i) => s + i.stock * i.price.amount, 0);

  const activeOrdersValue = input.orders
    .filter((o) => ["processing", "packed", "in-transit", "pending"].includes(o.status))
    .reduce((s, o) => s + (o.total ?? 0), 0);

  const netFlow = totalIncome - totalExpenses;
  const cashRunwayMonths =
    totalExpenses > 0 ? Math.max(0, Math.round(input.wallet.balance / totalExpenses)) : null;

  return {
    walletBalance: input.wallet.balance,
    totalIncome,
    totalExpenses,
    netFlow,
    pendingPayables,
    lowStockItems,
    outOfStockItems,
    inventoryValue,
    activeOrdersValue,
    loyaltyPoints: input.loyalty.points,
    subscriptionPlan:
      input.subscription.status === "active" ? (input.subscription.plan ?? null) : null,
    cashRunwayMonths,
  };
}

// ── Strategy engine (deterministic local brain) ──────────────────────────────

export function generateFinanceStrategies(input: FinanceSnapshot | Partial<FinanceSnapshot>): FinanceStrategy[] {
  const snapshot = normalizeSnapshot(input);
  const strategies: FinanceStrategy[] = [];
  const actions: FinanceAction[] = [];

  // Cash flow health
  const margin = snapshot.totalIncome > 0 ? snapshot.netFlow / snapshot.totalIncome : 0;
  if (snapshot.netFlow < 0) {
    strategies.push({
      id: "strat-cashflow-bleed",
      category: "cashflow",
      title: "Stop the cash-flow leak",
      summary: "Spending exceeds income this period. List every expense and cut the bottom 20%.",
      rationale: `Net flow is ${fmtTZS(snapshot.netFlow)} against ${fmtTZS(snapshot.totalIncome)} income.`,
      impact: "Protects your runway and keeps suppliers paid on time.",
      confidence: 95,
      relatedActionIds: ["act-report-cashflow"],
    });
  } else if (margin < 0.2 && snapshot.totalIncome > 0) {
    strategies.push({
      id: "strat-cashflow-thin",
      category: "cashflow",
      title: "Thin margins — raise your floor",
      summary: "Profit margin is below 20%. Raise prices 5% on your best sellers or negotiate supplier terms.",
      rationale: `Margin is ${Math.round(margin * 100)}%.`,
      impact: "Adds real profit without needing more sales.",
      confidence: 88,
      relatedActionIds: [],
    });
  }

  // Pending payables
  if (snapshot.pendingPayables > 0) {
    strategies.push({
      id: "strat-settle",
      category: "cashflow",
      title: "Settle pending payables",
      summary: `${fmtTZS(snapshot.pendingPayables)} is owed and still marked pending. Settling on time protects your supplier credit.`,
      rationale: "Late payment damages relationships and discounts.",
      impact: "Keeps credit lines open and negotiable.",
      confidence: 92,
      relatedActionIds: ["act-settle-payables"],
    });
  }

  // Savings target
  if (snapshot.netFlow > 0) {
    const target = Math.round(snapshot.netFlow * 0.1);
    if (target >= 1000) {
      strategies.push({
        id: "strat-savings",
        category: "savings",
        title: "Automate a 10% savings rule",
        summary: `Move ${fmtTZS(target)} to savings — 10% of this period's net flow.`,
        rationale: "Reinvest 80% of profit, keep 10% liquid, save 10% for buffer.",
        impact: "Builds a 3-month operating buffer over time.",
        confidence: 85,
        relatedActionIds: ["act-transfer-savings"],
      });
      actions.push({
        id: "act-transfer-savings",
        type: "transfer-savings",
        title: `Transfer ${fmtTZS(target)} to savings`,
        description: "Creates a savings transfer in the ledger from this period's net flow.",
        amount: target,
        requiresApproval: true,
        createdAt: new Date().toISOString(),
        status: "pending",
      });
    }
  }

  // Stock levels
  if (snapshot.outOfStockItems.length > 0) {
    strategies.push({
      id: "strat-restock-out",
      category: "inventory",
      title: "Restock sold-out items",
      summary: `${snapshot.outOfStockItems.length} item(s) are out of stock and costing you sales.`,
      rationale: "Every out-of-stock day is lost revenue.",
      impact: "Directly recovers sales you are currently losing.",
      confidence: 94,
      relatedActionIds: snapshot.outOfStockItems.map((_, i) => `act-restock-${i}`),
    });
    snapshot.outOfStockItems.slice(0, 3).forEach((item, i) => {
      actions.push({
        id: `act-restock-${i}`,
        type: "restock",
        title: `Restock ${item.name}`,
        description: `Bring ${item.name} back above its reorder level.`,
        targetId: item.id,
        targetLabel: item.name,
        requiresApproval: true,
        createdAt: new Date().toISOString(),
        status: "pending",
      });
    });
  }
  if (snapshot.lowStockItems.length > 0) {
    strategies.push({
      id: "strat-restock-low",
      category: "inventory",
      title: "Top up low-stock items",
      summary: `${snapshot.lowStockItems.length} item(s) are below reorder level.`,
      rationale: "Prevents stockouts before peak demand hits.",
      impact: "Smooth fulfilment during busy weeks.",
      confidence: 80,
      relatedActionIds: [],
    });
  }

  // Growth
  if (snapshot.netFlow > 0 && margin >= 0.2 && snapshot.lowStockItems.length === 0) {
    strategies.push({
      id: "strat-growth",
      category: "growth",
      title: "Reinvest into your best sellers",
      summary: "Cash is healthy and stock is clean. Reinvest profit into your top-selling categories.",
      rationale: `Net flow ${fmtTZS(snapshot.netFlow)} with ${margin >= 0.3 ? "strong" : "solid"} margins.`,
      impact: "Compounds growth in proven demand.",
      confidence: 75,
      relatedActionIds: ["act-report-growth"],
    });
    actions.push({
      id: "act-report-growth",
      type: "generate-report",
      title: "Generate a growth plan",
      description: "Prepares a reinvestment plan for your top categories.",
      requiresApproval: false,
      createdAt: new Date().toISOString(),
      status: "pending",
    });
  }

  return strategies;
}

// ── Action proposals ──────────────────────────────────────────────────────────

export function proposeFinanceActions(input: FinanceSnapshot | Partial<FinanceSnapshot>): FinanceAction[] {
  const snapshot = normalizeSnapshot(input);
  const actions: FinanceAction[] = [];
  const now = new Date().toISOString();

  if (snapshot.pendingPayables > 0) {
    actions.push({
      id: "act-settle-payables",
      type: "settle-expense",
      title: `Settle ${fmtTZS(snapshot.pendingPayables)} in pending payables`,
      description: "Marks all pending expense transactions as settled in the ledger.",
      amount: snapshot.pendingPayables,
      requiresApproval: true,
      createdAt: now,
      status: "pending",
    });
  }

  snapshot.outOfStockItems.slice(0, 3).forEach((item, i) => {
    actions.push({
      id: `act-restock-${i}`,
      type: "restock",
      title: `Restock ${item.name}`,
      description: `Bring ${item.name} back above its reorder level.`,
      targetId: item.id,
      targetLabel: item.name,
      requiresApproval: true,
      createdAt: now,
      status: "pending",
    });
  });

  snapshot.lowStockItems.slice(0, 3).forEach((item, i) => {
    actions.push({
      id: `act-topup-${i}`,
      type: "restock",
      title: `Top up ${item.name}`,
      description: `Raise ${item.name} stock to its reorder level.`,
      targetId: item.id,
      targetLabel: item.name,
      requiresApproval: true,
      createdAt: now,
      status: "pending",
    });
  });

  if (snapshot.netFlow > 0) {
    const target = Math.round(snapshot.netFlow * 0.1);
    if (target >= 1000) {
      actions.push({
        id: "act-transfer-savings",
        type: "transfer-savings",
        title: `Transfer ${fmtTZS(target)} to savings`,
        description: "Creates a savings transfer in the ledger from this period's net flow.",
        amount: target,
        requiresApproval: true,
        createdAt: now,
        status: "pending",
      });
    }
  }

  actions.push({
    id: "act-budget",
    type: "create-budget",
    title: "Set a 70-20-10 budget rule",
    description: "70% operations, 20% growth, 10% savings — applied to your ledger going forward.",
    requiresApproval: false,
    createdAt: now,
    status: "pending",
  });

  actions.push({
    id: "act-report-cashflow",
    type: "generate-report",
    title: "Generate a cash-flow report",
    description: "Prepares a full income, expense and runway report from your ledger.",
    requiresApproval: false,
    createdAt: now,
    status: "pending",
  });

  return actions;
}

// ── Local fallback chat brain ─────────────────────────────────────────────────

export function localFinanceReply(question: string, snapshot: FinanceSnapshot | Partial<FinanceSnapshot>): string {
  const q = question.toLowerCase();
  const s = normalizeSnapshot(snapshot);
  const strategies = generateFinanceStrategies(s);

  if (/(saving|save|rainy)/.test(q)) {
    const t = Math.round(s.netFlow * 0.1);
    return s.netFlow > 0
      ? `Based on your numbers, 10% of your net flow is ${fmtTZS(t)}. I'd move that to savings now — and I'll ask you to confirm first before any money moves. Keep a 3-month operating buffer as your target.`
      : `Your net flow is currently negative (${fmtTZS(s.netFlow)}). Before saving, we stop the leak — I'll show you a cost-cut plan you can approve piece by piece.`;
  }

  if (/(cash.?flow|runway|bleed|bankrupt)/.test(q)) {
    return s.netFlow >= 0
      ? `Cash flow is positive: +${fmtTZS(s.netFlow)} this period on ${fmtTZS(s.totalIncome)} income. Keep margin above 20% and you're on solid ground.`
      : `Heads up — net flow is ${fmtTZS(s.netFlow)}, meaning you're spending more than you earn. Priority: cut the bottom 20% of expenses. Nothing moves without your approval.`;
  }

  if (/(stock|restock|inventory|reorder)/.test(q)) {
    const out = s.outOfStockItems.map((i) => i.name).join(", ");
    const low = s.lowStockItems.map((i) => i.name).join(", ");
    const body =
      out || low ? `Out of stock: ${out || "none"}. Low stock: ${low || "none"}.` : "Stock levels look healthy — nothing below its reorder point.";
    return `${body} I've prepared restock actions — approve them in the Actions tab and I'll update your inventory.`;
  }

  if (/(pricing|price|margin|profit)/.test(q)) {
    const margin = s.totalIncome > 0 ? s.netFlow / s.totalIncome : 0;
    return `Your current margin is ${Math.round(margin * 100)}%. Healthy EA fashion retail runs 30-50%. If you want, I can propose price adjustments on specific items — each one needs your confirmation.`;
  }

  if (/(currency|dollar|usd|exchange|rate)/.test(q)) {
    return `For currency questions I use live research. Ask me "research current USD/TZS rate" and I'll pull the latest figures from the web alongside our dataset.`;
  }

  if (/(withdraw|withdrawal|buy|purchase|transfer|pay)/.test(q)) {
    return `Rule zero: I never withdraw, purchase, transfer or settle on my own. I'll propose the action, show you the exact amount, and only act after you approve. That's a hard guardrail.`;
  }

  if (strategies.length > 0) {
    const top = strategies[0];
    return `Here's my top move right now: ${top.title}. ${top.summary} I've attached the supporting actions to the Actions tab for your approval.`;
  }

  return "I've reviewed your finances. Your ledger is quiet — log some income and expenses and I'll start spotting opportunities automatically.";
}export function localFinanceResearch(query: string): { text: string; citations: string[] } {
  const q = query.toLowerCase();
  const base = [
    "Dataset: BirichiNex East Africa Finance Knowledge Base",
    "Source: Central Bank published rates (indicative, verify live)",
  ];

  if (/usd.*tzs|tzs.*usd|dollar/.test(q)) {
    return {
      text: "Indicative rate: 1 USD ≈ 2,550–2,600 TZS (Tanzania). Rates move daily — use the Research tab with your server AI connected for a live, grounded figure with citations.",
      citations: base,
    };
  }
  if (/usd.*kes|kes.*usd/.test(q)) {
    return {
      text: "Indicative rate: 1 USD ≈ 128–131 KES (Kenya). Rates move daily — use the Research tab with your server AI connected for a live, grounded figure.",
      citations: base,
    };
  }
  if (/usd.*ugx|ugx.*usd/.test(q)) {
    return {
      text: "Indicative rate: 1 USD ≈ 3,650–3,750 UGX (Uganda). Rates move daily — use the Research tab with your server AI connected for a live, grounded figure.",
      citations: base,
    };
  }
  if (/vat|tax/.test(q)) {
    return {
      text: "VAT rates in East Africa (indicative): Tanzania 18%, Kenya 16%, Uganda 18%. EAC countries are moving toward harmonized rates. Confirm current policy before filing.",
      citations: base,
    };
  }
  if (/mobile.?money|m.pesa|momo|mpesa|airtel/.test(q)) {
    return {
      text: "Mobile money is the primary payment rail in EA. Typical merchant withdrawal costs run 0.5–1% of the amount with daily limits varying by tier. A cashless checkout strategy usually lifts conversion 15–30%.",
      citations: base,
    };
  }
  return {
    text: "Here's what our dataset says: keep 30% of working capital liquid, negotiate supplier terms for 30+ days, and reinvest 20% of profit into your best-selling categories. For a current market figure, connect your server AI and use the Research tab for live web-grounded answers.",
    citations: base,
  };
}

// ── Formatting ────────────────────────────────────────────────────────────────

export function fmtTZS(n: number): string {
  const abs = Math.abs(Math.round(n));
  return `${n < 0 ? "-" : ""}TZS ${abs.toLocaleString("en-US")}`;
}
