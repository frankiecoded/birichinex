import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Landmark, Shield, ShieldCheck, Check, X, RefreshCw, Globe,
  Sparkles, Lock, BadgeCheck, Clock, Database,
  Send, AlertTriangle, ChevronRight, PencilLine,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { useStore } from "../store/useStore";
import {
  AGENT_GUARDRAILS,
  buildFinanceSnapshot,
  buildUserDataset,
  fmtTZS,
  isDatasetStale,
  localFinanceReply,
  localFinanceResearch,
  FinanceAction,
} from "../../ai/src/finance-agent";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 shrink-0 ${on ? "bg-brand" : "bg-surface-secondary"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

const ACTION_META: Record<FinanceAction["type"], { label: string; tone: string; needsApproval: boolean }> = {
  withdraw: { label: "Withdrawal", tone: "#FF453A", needsApproval: true },
  purchase: { label: "Purchase", tone: "#FF9500", needsApproval: true },
  "dropship-order": { label: "Dropship order", tone: "#AF52DE", needsApproval: true },
  "transfer-savings": { label: "Transfer", tone: "#30D158", needsApproval: true },
  "settle-expense": { label: "Settle payable", tone: "#007AFF", needsApproval: true },
  restock: { label: "Restock", tone: "#FF9500", needsApproval: true },
  "adjust-price": { label: "Price change", tone: "#d4af37", needsApproval: true },
  "create-budget": { label: "Budget rule", tone: "#30D158", needsApproval: false },
  "set-currency": { label: "Currency", tone: "#8E8E93", needsApproval: false },
  "generate-report": { label: "Report", tone: "#8E8E93", needsApproval: false },
};

type ChatMessage = { role: "user" | "agent"; text: string };

export default function FinanceAgentPage() {
  // ── Store ──────────────────────────────────────────────────────────────
  const wallet = useStore((s) => s.wallet);
  const transactions = useStore((s) => s.transactions);
  const inventoryItems = useStore((s) => s.inventoryItems);
  const orders = useStore((s) => s.orders);
  const dropshipOrders = useStore((s) => s.dropshipOrders);
  const loyalty = useStore((s) => s.loyalty);
  const subscription = useStore((s) => s.subscription);
  const settings = useStore((s) => s.settings);
  const selectedCurrency = useStore((s) => s.selectedCurrency);
  const user = useStore((s) => s.user);

  const agentActions = useStore((s) => s.agentActions);
  const agentApprovals = useStore((s) => s.agentApprovals);
  const proposeAgentAction = useStore((s) => s.proposeAgentAction);
  const executeAgentAction = useStore((s) => s.executeAgentAction);
  const clearAgentActions = useStore((s) => s.clearAgentActions);
  const userDataset = useStore((s) => s.userDataset);
  const setUserDataset = useStore((s) => s.setUserDataset);

  // ── Local state ─────────────────────────────────────────────────────────
  const [tab, setTab] = useState<"advise" | "actions" | "guardrails" | "research" | "dataset">("advise");
  const [connection, setConnection] = useState<"live" | "simulated" | "checking">("checking");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [researchQuery, setResearchQuery] = useState("");
  const [research, setResearch] = useState<{ text: string; source: string; citations: string[] } | null>(null);
  const [researching, setResearching] = useState(false);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [autoTopUp, setAutoTopUp] = useState(true);
  const [flash, setFlash] = useState<string | null>(null);

  // Dataset meta form
  const [meta, setMeta] = useState({
    businessName: "",
    sector: "",
    country: "",
    monthlyBudget: 0,
    goals: "",
  });

  const snapshot = useMemo(
    () =>
      buildFinanceSnapshot({
        wallet: { balance: wallet.balance },
        transactions,
        inventory: inventoryItems.map((i) => ({
          id: i.id,
          name: i.name,
          stock: i.stock,
          minStock: i.minStock,
          supplier: i.supplier,
          price: { amount: i.price.amount },
        })),
        orders: [
          ...orders.map((o) => ({ status: o.status, total: o.totalAmount })),
          ...dropshipOrders.map((o) => ({ status: o.status, total: o.total.amount })),
        ],
        loyalty: { points: loyalty.points },
        subscription: { plan: subscription.plan, status: subscription.status },
      }),
    [wallet, transactions, inventoryItems, orders, dropshipOrders, loyalty, subscription],
  );

  const businessName = settings.profile.company || user?.name || "My Business";
  const pendingCount = agentActions.filter((a) => a.status === "pending").length;

  // ── Connection status (server AI brain: Ollama on VPS or Gemini) ───────
  useEffect(() => {
    fetch("/api/ai/mode")
      .then((r) => r.json())
      .then((d) => setConnection(d?.live ? "live" : "simulated"))
      .catch(() => setConnection("simulated"));
  }, []);

  // ── Dataset sync: never older than 24h ──────────────────────────────────
  const syncDataset = () => {
    const goals = meta.goals.split(",").map((g) => g.trim()).filter(Boolean);
    const dataset = buildUserDataset({
      prev: userDataset,
      snapshot,
      meta: {
        businessName: meta.businessName || businessName,
        sector: meta.sector,
        country: meta.country,
        currency: selectedCurrency,
        monthlyBudget: meta.monthlyBudget > 0 ? meta.monthlyBudget : snapshot.totalExpenses,
        goals: goals.length > 0 ? goals : ["Grow monthly profit", "Build a 3-month cash buffer"],
      },
    });
    setUserDataset(dataset);
    setFlash("Dataset updated just now — every figure is current.");
    setTimeout(() => setFlash(null), 4000);
  };

  useEffect(() => {
    if (!userDataset) {
      syncDataset();
    } else if (isDatasetStale(userDataset.lastSyncedAt)) {
      syncDataset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      if (isDatasetStale(userDataset?.lastSyncedAt ?? null)) syncDataset();
    }, 60 * 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDataset, snapshot]);

  const nextSyncIn = useMemo(() => {
    const last = userDataset?.lastSyncedAt;
    if (!last) return "updating…";
    const age = Date.now() - new Date(last).getTime();
    const due = 24 * 60 * 60 * 1000 - age;
    if (due <= 0) return "due now";
    const h = Math.floor(due / 3600000);
    const m = Math.floor((due % 3600000) / 60000);
    return `${h}h ${m}m`;
  }, [userDataset]);

  // ── Chat ────────────────────────────────────────────────────────────────
  const sendMessage = async (text?: string) => {
    const q = (text ?? chatInput).trim();
    if (!q || thinking) return;
    setChatInput("");
    setChat((c) => [...c, { role: "user", text: q }]);
    setThinking(true);
    try {
      const res = await fetch("/api/finance/advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          snapshot,
          conversation: chat.slice(-6).map((m) => `${m.role}: ${m.text}`),
        }),
      });
      const data = await res.json();
      setChat((c) => [...c, { role: "agent", text: data?.text ?? localFinanceReply(q, snapshot) }]);
    } catch {
      setChat((c) => [...c, { role: "agent", text: localFinanceReply(q, snapshot) }]);
    }
    setThinking(false);
  };

  // ── Research ────────────────────────────────────────────────────────────
  const runResearch = async () => {
    const q = researchQuery.trim();
    if (!q || researching) return;
    setResearching(true);
    setResearch(null);
    try {
      const res = await fetch("/api/finance/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setResearch({
        text: data?.text ?? localFinanceResearch(q).text,
        source: data?.source ?? "simulated",
        citations: data?.citations ?? [],
      });
    } catch {
      const fallback = localFinanceResearch(q);
      setResearch({ ...fallback, source: "simulated" });
    }
    setResearching(false);
  };

  const approve = (actionId: string) => executeAgentAction(actionId, "approved");
  const deny = (actionId: string) => executeAgentAction(actionId, "denied");

  const activeActions = agentActions.filter((a) => a.status === "pending");
  const resolvedActions = agentApprovals.slice(0, 12);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-11 w-11 rounded-[14px] glass-material flex items-center justify-center shrink-0">
            <div className="absolute -inset-1 rounded-[16px] gold-glow opacity-60" />
            <Landmark className="h-5 w-5 text-brand-dark" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[20px] font-bold text-gradient-brand tracking-tight leading-tight">
              Zahara — AI Finance Agent
            </h1>
            <p className="text-caption text-ink-tertiary truncate">
              Your CFO that runs the books, spots opportunities and never moves money without you.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Badge variant={connection === "live" ? "brand" : "default"} size="sm">
            {connection === "checking" ? "Connecting…" : connection === "live" ? "Server AI · live" : "Local brain · safe"}
          </Badge>
          <Badge variant={pendingCount > 0 ? "brand" : "default"} size="sm">
            {pendingCount} action{pendingCount === 1 ? "" : "s"} awaiting approval
          </Badge>
          <Badge variant="default" size="sm">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Approval-gated
          </Badge>
        </div>
      </motion.div>

      {flash && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-[13px] font-semibold text-ink bg-brand/10 border border-brand/20 rounded-[12px] px-4 py-2.5"
        >
          <BadgeCheck className="h-4 w-4 text-brand-dark" />
          {flash}
        </motion.div>
      )}

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-surface-secondary/70 backdrop-blur-sm p-1 rounded-[14px] border border-glass-border overflow-x-auto scrollbar-hide w-fit max-w-full">
        {(
          [
            ["advise", "Advise", Sparkles],
            ["actions", `Actions${pendingCount ? ` (${pendingCount})` : ""}`, Shield],
            ["guardrails", "Guardrails", Lock],
            ["research", "Research", Globe],
            ["dataset", "Dataset", Database],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex items-center gap-1.5 px-3.5 h-9 rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-colors ${
              tab === id ? "text-ink" : "text-ink-tertiary hover:text-ink-secondary"
            }`}
          >
            {tab === id && (
              <motion.span
                layoutId="zahara-tab"
                className="absolute inset-0 bg-surface rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-glass-border"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <Icon className="relative z-10 h-3.5 w-3.5 shrink-0" style={{ color: tab === id ? "#aa7c11" : undefined }} strokeWidth={tab === id ? 2 : 1.6} />
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {/* ═══ ADVISE ═══════════════════════════════════════════════ */}
          {tab === "advise" && (
            <>
              {/* Snapshot strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Wallet balance", value: fmtTZS(snapshot.walletBalance), tone: "#007AFF" },
                  { label: "Net flow", value: fmtTZS(snapshot.netFlow), tone: snapshot.netFlow >= 0 ? "#30D158" : "#FF453A" },
                  { label: "Pending payables", value: fmtTZS(snapshot.pendingPayables), tone: snapshot.pendingPayables > 0 ? "#FF9500" : "#8E8E93" },
                  { label: "Inventory value", value: fmtTZS(snapshot.inventoryValue), tone: "#d4af37" },
                ].map((s) => (
                  <div key={s.label} className="glass-material rounded-[14px] p-4">
                    <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide">{s.label}</p>
                    <p className="text-[17px] font-bold text-ink mt-1" style={{ color: s.tone }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chat */}
              <div className="content-frame p-5 lg:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-[10px] bg-brand/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-brand-dark" />
                  </div>
                  <h2 className="text-subhead font-bold text-ink">Ask Zahara about your finances</h2>
                </div>
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {chat.length === 0 && (
                    <p className="text-caption text-ink-tertiary">
                      Try: “Should I restock now?”, “Is my cash flow healthy?”, “How much can I move to savings?”,
                      or “Can you buy a new bale this week?”
                    </p>
                  )}
                  {chat.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-[14px] px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
                          m.role === "user"
                            ? "bg-brand text-white"
                            : "glass-material text-ink"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {thinking && (
                    <div className="flex items-center gap-2 text-caption text-ink-tertiary">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Zahara is thinking…
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask about cash flow, stock, savings, purchases…"
                    className="flex-1 h-11 px-4 rounded-[12px] glass-material text-[13px] text-ink placeholder:text-ink-quaternary outline-none"
                  />
                  <Button onClick={() => sendMessage()} disabled={thinking || !chatInput.trim()}>
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* ═══ ACTIONS ═══════════════════════════════════════════════ */}
          {tab === "actions" && (
            <>
              <div className="flex items-start gap-3 glass-material rounded-[14px] p-4 border border-brand/20">
                <ShieldCheck className="h-5 w-5 text-brand-dark shrink-0 mt-0.5" />
                <p className="text-[13px] text-ink-secondary leading-relaxed">
                  Every action here is <b>proposed, never executed</b>. Money moves, purchases, restocks and price
                  changes run only after you press <b>Approve</b>. Denied actions change nothing. This is a hard
                  guardrail — Zahara cannot bypass it.
                </p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <h2 className="text-subhead font-bold text-ink">Proposed actions</h2>
                <button
                  onClick={() => clearAgentActions()}
                  className="text-caption font-semibold text-ink-tertiary hover:text-ink transition-colors"
                >
                  Clear resolved
                </button>
              </div>

              {activeActions.length === 0 ? (
                <div className="content-frame p-8 text-center">
                  <p className="text-subhead font-semibold text-ink">All clear</p>
                  <p className="text-caption text-ink-tertiary mt-1">
                    No pending proposals. Log more activity and Zahara will spot new opportunities.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeActions.map((a) => {
                    const meta = ACTION_META[a.type];
                    const open = expandedAction === a.id;
                    return (
                      <div key={a.id} className="glass-material rounded-[14px] p-4 border border-glass-border">
                        <div className="flex items-center gap-3">
                          <span
                            className="h-8 w-8 rounded-[10px] flex items-center justify-center shrink-0"
                            style={{ background: `${meta.tone}1a`, color: meta.tone }}
                          >
                            {a.requiresApproval ? <Lock className="h-4 w-4" /> : <PencilLine className="h-4 w-4" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[13px] font-bold text-ink truncate">{a.title}</p>
                              <Badge size="sm" variant="default">{meta.label}</Badge>
                              {a.requiresApproval && <Badge size="sm" variant="brand">Needs approval</Badge>}
                            </div>
                            {a.amount && (
                              <p className="text-[12px] font-semibold mt-0.5" style={{ color: meta.tone }}>
                                {fmtTZS(a.amount)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => setExpandedAction(open ? null : a.id)}
                            className="text-ink-tertiary hover:text-ink transition-colors shrink-0"
                          >
                            <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
                          </button>
                        </div>
                        <AnimatePresence>
                          {open && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="text-[13px] text-ink-secondary leading-relaxed pt-3 border-t border-glass-border mt-3">
                                {a.description}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-glass-border">
                          <Button variant="primary" onClick={() => approve(a.id)} className="flex-1">
                            <Check className="h-3.5 w-3.5" /> Approve & execute
                          </Button>
                          <Button variant="ghost" onClick={() => deny(a.id)} className="flex-1">
                            <X className="h-3.5 w-3.5" /> Deny
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Audit trail */}
              {resolvedActions.length > 0 && (
                <div className="content-frame p-5">
                  <h2 className="text-subhead font-bold text-ink mb-4">Decision audit trail</h2>
                  <div className="space-y-2">
                    {resolvedActions.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-start gap-3 rounded-[12px] bg-surface-secondary/50 p-3"
                      >
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                            ev.decision === "approved" && ev.executed ? "bg-green-500/15 text-[#30D158]" : "bg-red-500/10 text-[#FF453A]"
                          }`}
                        >
                          {ev.decision === "approved" && ev.executed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-ink">
                            {ev.actionTitle}
                            {ev.amount ? <span className="text-ink-tertiary font-normal"> · {fmtTZS(ev.amount)}</span> : null}
                          </p>
                          <p className="text-[12px] text-ink-tertiary leading-relaxed">{ev.note}</p>
                          <p className="text-[11px] text-ink-quaternary mt-0.5">
                            {ev.decision === "approved" ? "Approved" : "Denied"} · {new Date(ev.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══ GUARDRAILS ════════════════════════════════════════════ */}
          {tab === "guardrails" && (
            <div className="space-y-3">
              {AGENT_GUARDRAILS.map((g) => (
                <div key={g.id} className="glass-material rounded-[14px] p-5 border border-glass-border flex items-start gap-4">
                  <div
                    className={`h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0 ${
                      g.hard ? "bg-[#FF453A]/10 text-[#FF453A]" : "bg-brand/10 text-brand-dark"
                    }`}
                  >
                    {g.hard ? <Shield className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-bold text-ink">{g.label}</p>
                      <Badge size="sm" variant={g.hard ? "brand" : "default"}>
                        {g.hard ? "Hard rule" : "Operating mode"}
                      </Badge>
                    </div>
                    <p className="text-[13px] text-ink-tertiary leading-relaxed mt-1">{g.detail}</p>
                  </div>
                </div>
              ))}

              <div className="glass-material rounded-[14px] p-5 border border-glass-border flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-ink">Auto-restock suggestions</p>
                  <p className="text-[13px] text-ink-tertiary mt-0.5">
                    Zahara proactively proposes restock actions when stock drops below reorder level. Every restock
                    still waits for your approval.
                  </p>
                </div>
                <Toggle on={autoTopUp} onToggle={() => setAutoTopUp(!autoTopUp)} />
              </div>
            </div>
          )}

          {/* ═══ RESEARCH ═══════════════════════════════════════════════ */}
          {tab === "research" && (
            <div className="content-frame p-5 lg:p-6">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-4 w-4 text-brand-dark" />
                <h2 className="text-subhead font-bold text-ink">Live financial research</h2>
              </div>
              <p className="text-caption text-ink-tertiary mb-4">
                Current exchange rates, taxes, mobile money and market prices — grounded on the web when your
                server AI is connected, dataset-backed otherwise.
              </p>
              <div className="flex gap-2">
                <input
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runResearch()}
                  placeholder="e.g. current USD to TZS rate, VAT in Kenya, M-Pesa charges…"
                  className="flex-1 h-11 px-4 rounded-[12px] glass-material text-[13px] text-ink placeholder:text-ink-quaternary outline-none"
                />
                <Button onClick={runResearch} disabled={researching || !researchQuery.trim()}>
                  {researching ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
                  Research
                </Button>
              </div>

              {research && (
                <div className="mt-5 glass-material rounded-[14px] p-5 border border-glass-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      size="sm"
                      variant={research.source === "gemini-3.5-flash" ? "brand" : research.source === "ollama" ? "info" : "default"}
                    >
                      {research.source === "gemini-3.5-flash"
                        ? "Web-grounded · live"
                        : research.source === "ollama"
                          ? "Live research"
                          : "Dataset answer"}
                    </Badge>
                  </div>
                  <p className="text-[13px] text-ink leading-relaxed whitespace-pre-wrap">{research.text}</p>
                  {research.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-glass-border">
                      <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide mb-1.5">Sources</p>
                      {research.citations.map((c, i) => (
                        <a
                          key={i}
                          href={c}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[12px] text-brand-dark hover:underline truncate"
                        >
                          {c}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══ DATASET ═══════════════════════════════════════════════ */}
          {tab === "dataset" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="glass-material rounded-[14px] p-5">
                  <div className="flex items-center gap-2 text-caption text-ink-tertiary mb-1">
                    <Database className="h-3.5 w-3.5" /> Your business dataset
                  </div>
                  <p className="text-[15px] font-bold text-ink">{businessName}</p>
                  <p className="text-caption text-ink-tertiary">
                    Version {userDataset?.version ?? 1} · saved for {user?.name ?? "you"}
                  </p>
                </div>
                <div className="glass-material rounded-[14px] p-5">
                  <div className="flex items-center gap-2 text-caption text-ink-tertiary mb-1">
                    <Clock className="h-3.5 w-3.5" /> Last updated
                  </div>
                  <p className="text-[15px] font-bold text-ink">
                    {userDataset ? new Date(userDataset.lastSyncedAt).toLocaleString() : "Updating…"}
                  </p>
                  <p className="text-caption text-ink-tertiary">
                    Next auto-update in <b>{nextSyncIn}</b> (max 24h)
                  </p>
                </div>
                <div className="glass-material rounded-[14px] p-5 flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-2 text-caption text-ink-tertiary">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh policy
                  </div>
                  <p className="text-[13px] text-ink-secondary leading-relaxed">
                    Your data re-syncs automatically at most 24 hours after the last update — and instantly whenever
                    you press update.
                  </p>
                  <Button variant="primary" onClick={syncDataset} className="w-full">
                    <RefreshCw className="h-3.5 w-3.5" /> Update now
                  </Button>
                </div>
              </div>

              {/* Meta form */}
              <div className="content-frame p-5">
                <h2 className="text-subhead font-bold text-ink mb-4">Business profile fed to Zahara</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-caption text-ink-tertiary">Business name</span>
                    <input
                      value={meta.businessName}
                      onChange={(e) => setMeta({ ...meta, businessName: e.target.value })}
                      placeholder={businessName}
                      className="mt-1 w-full h-10 px-3 rounded-[10px] glass-material text-[13px] text-ink placeholder:text-ink-quaternary outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-caption text-ink-tertiary">Sector</span>
                    <input
                      value={meta.sector}
                      onChange={(e) => setMeta({ ...meta, sector: e.target.value })}
                      className="mt-1 w-full h-10 px-3 rounded-[10px] glass-material text-[13px] text-ink outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-caption text-ink-tertiary">Country</span>
                    <input
                      value={meta.country}
                      onChange={(e) => setMeta({ ...meta, country: e.target.value })}
                      className="mt-1 w-full h-10 px-3 rounded-[10px] glass-material text-[13px] text-ink outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-caption text-ink-tertiary">Monthly budget (TZS)</span>
                    <input
                      type="number"
                      value={meta.monthlyBudget || ""}
                      onChange={(e) => setMeta({ ...meta, monthlyBudget: Number(e.target.value) })}
                      placeholder={snapshot.totalExpenses ? String(snapshot.totalExpenses) : "0"}
                      className="mt-1 w-full h-10 px-3 rounded-[10px] glass-material text-[13px] text-ink placeholder:text-ink-quaternary outline-none"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-caption text-ink-tertiary">Goals (comma separated)</span>
                    <input
                      value={meta.goals}
                      onChange={(e) => setMeta({ ...meta, goals: e.target.value })}
                      className="mt-1 w-full h-10 px-3 rounded-[10px] glass-material text-[13px] text-ink outline-none"
                    />
                  </label>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="primary" onClick={syncDataset}>
                    <Database className="h-3.5 w-3.5" /> Save profile & sync
                  </Button>
                </div>
              </div>

              {/* Learned metrics */}
              {userDataset && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Avg order value", value: fmtTZS(userDataset.learned.avgOrderValue) },
                    { label: "Top category", value: userDataset.learned.topSellingCategory },
                    { label: "Stock alerts", value: String(userDataset.learned.lowStockCount) },
                    { label: "Wallet balance", value: fmtTZS(userDataset.snapshot.walletBalance) },
                  ].map((m) => (
                    <div key={m.label} className="glass-material rounded-[14px] p-4">
                      <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide">{m.label}</p>
                      <p className="text-[15px] font-bold text-ink mt-1">{m.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Health notes */}
              {userDataset && userDataset.learned.healthNotes.length > 0 && (
                <div className="content-frame p-5">
                  <h2 className="text-subhead font-bold text-ink mb-3">Current health notes</h2>
                  <ul className="space-y-2">
                    {userDataset.learned.healthNotes.map((n, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-ink-secondary">
                        <AlertTriangle className="h-3.5 w-3.5 text-brand-dark shrink-0 mt-0.5" />
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
