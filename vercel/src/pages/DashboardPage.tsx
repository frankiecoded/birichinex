import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp, Users, Package, ArrowUpRight, Clock, Zap, Shield,
  DollarSign, Brain, Check, Flame, ChevronRight, Sparkles, Library,
  CalendarCheck, Headset, Calendar, Target, Building2, Timer, BookOpen,
  Megaphone, ArrowRight, AlertCircle,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import TiltCard from "../components/three/TiltCard";
import ParticleField from "../components/three/ParticleField";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import CursorSpotlight from "../components/three/CursorSpotlight";
import { useStore } from "../store/useStore";
import { formatPrice } from "../data/platform";
import { BirichiNexView, ActionPlanHorizon, FOUNDER_JOURNEY_STAGES } from "../types";
import { INSTITUTION_RUNGS, InstitutionRung } from "../data/frameworks";
import { scoreTone } from "../../ai/src/discovery";
import { buildBNXBriefing, marketplacePulse, BNXState } from "../../ai/src/bnxi";

interface DashboardPageProps {
  onNavigate: (view: BirichiNexView) => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function getDateLine(): string {
  return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const HORIZONS: { id: ActionPlanHorizon; label: string; icon: typeof Timer; color: string }[] = [
  { id: "now", label: "Now", icon: Flame, color: "#FF453A" },
  { id: "30-days", label: "30 Days", icon: Calendar, color: "#FF9F0A" },
  { id: "90-days", label: "90 Days", icon: Target, color: "#007AFF" },
  { id: "long-term", label: "Long-Term", icon: Building2, color: "#AF52DE" },
];

function scoreColor(score: number): string {
  return score >= 70 ? "#30D158" : score >= 45 ? "#FF9F0A" : "#FF453A";
}

// ─── Radial Gauge ───────────────────────────────────────────────────────────

function RadialGauge({ score, size = 170 }: { score: number; size?: number }) {
  const stroke = 13;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);
  const tone = scoreTone(score);

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(128,128,128,0.14)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[40px] font-bold text-ink tracking-tight leading-none">{score}</span>
        <span className="text-[9px] text-ink-tertiary uppercase tracking-wider font-semibold mt-1">Health Score</span>
        <Badge variant="success" size="sm" dot>{tone.label}</Badge>
      </div>
    </div>
  );
}

// ─── Score Bar ──────────────────────────────────────────────────────────────

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = scoreColor(score);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-semibold text-ink">{label}</span>
        <span className="text-[13px] font-bold" style={{ color }}>{score}</span>
      </div>
      <div className="h-2 rounded-full bg-ink/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { settings, contacts, transactions, inventoryItems, courseProgress, selectedCurrency, audit, agentCalls, wallet, orders, dropshipOrders, loyalty, subscription } = useStore();
  const setCopilotOpen = useStore((s) => s.setCopilotOpen);
  const setCopilotPrompt = useStore((s) => s.setCopilotPrompt);
  const [activeHorizon, setActiveHorizon] = useState<ActionPlanHorizon>("now");

  const firstName = settings.profile.name.split(" ")[0];

  const bnx = useMemo<BNXState>(
    () => ({
      userName: settings.profile.name || "founder",
      businessName: audit?.businessProfile.name || settings.profile.company || "your business",
      audit: null,
      wallet: { balance: wallet.balance },
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        status: t.status,
        date: t.date,
      })),
      inventory: inventoryItems.map((i) => ({
        id: i.id,
        name: i.name,
        category: i.category,
        stock: i.stock,
        minStock: i.minStock,
        price: i.price,
        status: i.status,
      })),
      orders: orders.map((o) => ({
        id: o.id,
        productName: o.productName,
        quantity: o.quantity,
        totalAmount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
      })),
      dropshipOrders: dropshipOrders.map((d) => ({
        id: d.id,
        productName: d.productName,
        quantity: d.quantity,
        total: d.total,
        status: d.status,
        placedAt: d.placedAt,
      })),
      agentCalls: agentCalls.map((c) => ({
        id: c.id,
        outcome: c.outcome,
        status: c.status,
        createdAt: c.createdAt,
      })),
      loyalty: { points: loyalty.points },
      contacts: contacts.length,
      subscription: { status: subscription.status, plan: subscription.plan },
    }),
    [settings, audit, wallet, transactions, inventoryItems, orders, dropshipOrders, agentCalls, loyalty, contacts, subscription],
  );

  const briefing = useMemo(() => buildBNXBriefing(bnx), [bnx]);
  const pulse = useMemo(() => marketplacePulse(bnx), [bnx]);

  const stats = useMemo(() => {
    const totalContacts = contacts.length;
    const totalRevenue = transactions
      .filter((t) => t.type === "income" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount.amount, 0);
    const inventoryCount = inventoryItems.length;
    const activeCourses = Object.values(courseProgress).filter((c) => c.started && !c.completed).length;
    return { totalContacts, totalRevenue, inventoryCount, activeCourses };
  }, [contacts, transactions, inventoryItems, courseProgress]);

  const recentActivity = useMemo(() => {
    const items: { id: string; title: string; time: string; badge: string | null; navigateTo: BirichiNexView }[] = [];

    const sortedContacts = [...contacts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    sortedContacts.slice(0, 2).forEach((c) => {
      items.push({ id: `c-${c.id}`, title: `New customer: ${c.name}`, time: timeAgo(c.createdAt), badge: "New", navigateTo: "crm" });
    });

    const sortedTx = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    sortedTx.slice(0, 2).forEach((t) => {
      if (t.type === "income" && t.status === "completed") {
        items.push({ id: `t-${t.id}`, title: `Payment received: ${formatPrice(t.amount.amount, selectedCurrency)}`, time: timeAgo(t.date), badge: "Payment", navigateTo: "finance" });
      }
    });

    if (agentCalls.length > 0) {
      const last = [...agentCalls].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      items.push({ id: `call-${last.id}`, title: `Amani ${last.status === "missed" ? "missed" : "handled"} a call · ${last.outcome}`, time: timeAgo(last.createdAt), badge: "AI Call", navigateTo: "ai-agent" });
    }

    const lowStock = inventoryItems.filter((i) => i.status === "low-stock" || i.status === "out-of-stock");
    if (lowStock.length > 0) {
      items.push({ id: "low-stock", title: `${lowStock.length} item${lowStock.length > 1 ? "s" : ""} low on stock`, time: "Inventory check", badge: "Alert", navigateTo: "inventory" });
    }

    items.sort((a, b) => {
      const order = { New: 0, Payment: 1, "AI Call": 2, Alert: 3 };
      return (order[a.badge as keyof typeof order] ?? 4) - (order[b.badge as keyof typeof order] ?? 4);
    });

    return items.slice(0, 5);
  }, [contacts, transactions, inventoryItems, selectedCurrency, agentCalls]);

  const journeyIndex = audit
    ? Math.max(0, FOUNDER_JOURNEY_STAGES.indexOf(audit.businessProfile.growthStage))
    : 3;

  const RUNG_BY_STAGE: InstitutionRung[] = [
    "product", "product", "business", "business", "business",
    "company", "organisation", "institution", "institution", "legacy",
  ];
  const currentRungIndex = Math.max(
    0,
    INSTITUTION_RUNGS.findIndex((r) => r.id === RUNG_BY_STAGE[journeyIndex]),
  );
  const currentRung = INSTITUTION_RUNGS[currentRungIndex];
  const nextRung = currentRungIndex < INSTITUTION_RUNGS.length - 1 ? INSTITUTION_RUNGS[currentRungIndex + 1] : null;

  const horizonItems = audit?.actionPlan.filter((item) => item.horizon === activeHorizon) ?? [];

  const weakAreas = useMemo(() => {
    if (!audit) return [];
    return ([
      { label: "Founder Readiness", score: audit.scores.founderReadiness },
      { label: "Business Maturity", score: audit.scores.businessMaturity },
      { label: "Growth Readiness", score: audit.scores.growthReadiness },
      { label: "Digital Readiness", score: audit.scores.digitalReadiness },
      { label: "Marketplace Readiness", score: audit.scores.marketplaceReadiness },
    ] as const)
      .filter((d) => d.score < 70)
      .sort((a, b) => a.score - b.score);
  }, [audit]);

  const recommendations = useMemo(() => {
    const weakest = audit
      ? Math.min(
          audit.scores.founderReadiness,
          audit.scores.businessMaturity,
          audit.scores.growthReadiness,
          audit.scores.digitalReadiness,
          audit.scores.marketplaceReadiness,
        )
      : 100;
    const firstFocus =
      !audit || audit.scores.founderReadiness <= weakest
        ? "frameworks"
        : audit.scores.growthReadiness <= weakest
          ? "routines"
          : "ai-advisor";

    const list = [
      {
        label: "Framework Library",
        color: "#D4AF37",
        icon: Library,
        reason: audit ? `Business Health ${audit.scores.businessHealth}` : "Your knowledge layer",
        view: "frameworks" as BirichiNexView,
        focus: firstFocus === "frameworks",
      },
      {
        label: "Founder Routines",
        color: "#FF9F0A",
        icon: CalendarCheck,
        reason: "Daily Reflection & Weekly Review",
        view: "routines" as BirichiNexView,
        focus: firstFocus === "routines",
      },
      {
        label: "AI Advisor",
        color: "#FF6482",
        icon: Sparkles,
        reason: "Always on · grounded in your audit",
        view: "ai-advisor" as BirichiNexView,
        focus: firstFocus === "ai-advisor",
      },
      {
        label: "Academy",
        color: "#0A84FF",
        icon: BookOpen,
        reason: `${stats.activeCourses} course${stats.activeCourses === 1 ? "" : "s"} in progress`,
        view: "learning" as BirichiNexView,
        focus: false,
      },
      {
        label: "Customers",
        color: "#5856D6",
        icon: Users,
        reason: `${contacts.length} customer${contacts.length === 1 ? "" : "s"}`,
        view: "crm" as BirichiNexView,
        focus: false,
      },
      {
        label: "Finance",
        color: "#00C7BE",
        icon: DollarSign,
        reason: formatPrice(stats.totalRevenue, selectedCurrency),
        view: "finance" as BirichiNexView,
        focus: false,
      },
    ];
    return list;
  }, [audit, stats.activeCourses, contacts.length, stats.totalRevenue, selectedCurrency]);

  const nextMove = recommendations.find((r) => r.focus) ?? recommendations[0];
  const quickLinks = recommendations.filter((r) => r !== nextMove).slice(0, 3);

  return (
    <CursorSpotlight className="rounded-2xl">
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 relative">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.div
        id="guide-hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.14)_0%,transparent_70%)] blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(100,210,255,0.1)_0%,transparent_70%)] blur-[50px] pointer-events-none" />
        <div className="absolute -top-6 right-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(175,82,222,0.1)_0%,transparent_70%)] blur-[60px] pointer-events-none" />

        {/* 3D particle field */}
        <div className="absolute inset-0 opacity-50 pointer-events-none">
          <ParticleField particleCount={55} color="#d4af37" showGeometry />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-caption text-ink-tertiary font-semibold uppercase tracking-wider">{getDateLine()}</p>
            <h1 className="text-headline text-gradient-brand tracking-tight leading-none">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-callout text-ink-tertiary mt-1.5 max-w-xl">
              {audit
                ? "Here's where your business stands today — and the one move that matters most."
                : "Welcome in. Tell me about your business and I'll build your dashboard around it."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setCopilotOpen(true)}
              className="flex items-center gap-2 h-11 px-4 rounded-[14px] glass-sheet text-subhead font-semibold text-ink hover:border-brand/40 transition-colors"
            >
              <span className="relative h-6 w-6">
                <span className="absolute inset-0 rounded-full copilot-orb" />
                <span className="relative h-full w-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" strokeWidth={2.2} />
                </span>
              </span>
              Ask your copilot
            </motion.button>
            {!audit && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => useStore.getState().openAiSetup()}
                className="h-11 px-4 rounded-[14px] bg-emphasis text-on-emphasis text-subhead font-semibold hover:bg-emphasis/90 transition-colors"
              >
                Start discovery
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── BNX Briefing ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard padding="lg" variant="elevated" hover className="border-brand/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-[10px] bg-brand/12 flex items-center justify-center">
                <Megaphone className="h-4 w-4 text-brand-dark" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-subhead font-bold text-ink">BNX Briefing</h3>
                <p className="text-caption text-ink-tertiary mt-0.5">What changed, what matters, what to do next — read by your copilot</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCopilotPrompt("What should I focus on today?")}
                className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-brand/10 border border-brand/15 text-[11px] font-semibold text-brand-dark hover:bg-brand/15 transition-colors"
              >
                <Sparkles className="h-3 w-3" strokeWidth={2} />
                Ask your copilot
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-2.5">
              <p className="text-callout text-ink leading-relaxed">{briefing.summary}</p>
              <div className="flex flex-col gap-2">
                {briefing.attention.slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-center gap-3">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: a.severity === 3 ? "#FF453A" : a.severity === 2 ? "#FF9F0A" : "#30D158" }}
                    />
                    <p className="flex-1 text-callout text-ink leading-snug">{a.title}</p>
                    <button
                      onClick={() => onNavigate(a.view)}
                      className="shrink-0 flex items-center gap-1 px-3 h-7 rounded-full bg-surface-secondary/80 border border-glass-border text-[11px] font-semibold text-ink-tertiary hover:text-ink hover:border-brand/30 transition-colors"
                    >
                      Open <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {briefing.attention.length === 0 && (
                  <p className="text-callout text-ink-tertiary">Nothing needs you right now — a healthy, calm day. Keep going.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-[14px] bg-surface-secondary/50 border border-glass-border p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-brand-dark shrink-0 mt-0.5" strokeWidth={1.8} />
                <div>
                  <p className="text-caption font-bold text-ink">Marketplace pulse</p>
                  <p className="text-[13px] text-ink-tertiary leading-snug mt-1">{pulse.summary}</p>
                  {pulse.movers.length > 0 && (
                    <p className="text-[13px] text-ink leading-snug mt-1.5 font-semibold">{pulse.movers[0].product} · {pulse.movers[0].orders} sold</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCopilotPrompt("What's moving fast? How do I boost my sales?")}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-emphasis text-on-emphasis text-[11px] font-semibold hover:bg-emphasis/90 transition-colors"
                >
                  <TrendingUp className="h-3 w-3" strokeWidth={2} />
                  Boost sales
                </button>
                <button
                  onClick={() => setCopilotPrompt("Show me my social media plan")}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-surface-secondary border border-glass-border text-[11px] font-semibold text-ink-tertiary hover:text-ink hover:border-brand/30 transition-colors"
                >
                  <CalendarCheck className="h-3 w-3" strokeWidth={2} />
                  Social plan
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── Health + Next Move ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Health */}
        <motion.div
          id="guide-health"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-2"
        >
          <GlassCard padding="lg" variant="elevated" hover className="h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-[10px] bg-brand/12 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-brand-dark" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-subhead font-bold text-ink">Business Health</h3>
                  <p className="text-caption text-ink-tertiary mt-0.5">Your AI score from the Discovery Conversation</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("ai-advisor")}
                className="hidden sm:flex items-center gap-1 text-caption font-semibold text-brand-dark hover:text-brand transition-colors"
              >
                Ask AI <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            {audit ? (
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                <div className="relative shrink-0">
                  <div className="absolute -inset-5 gold-glow opacity-70 pointer-events-none" />
                  <div className="relative float-slow">
                    <div className="absolute -inset-1 rounded-full border border-brand/20 halo-ring pointer-events-none" />
                    <RadialGauge score={audit.scores.businessHealth} />
                  </div>
                </div>
                <div className="flex-1 w-full space-y-3.5">
                  <ScoreBar label="Founder Readiness" score={audit.scores.founderReadiness} />
                  <ScoreBar label="Business Maturity" score={audit.scores.businessMaturity} />
                  <ScoreBar label="Growth Readiness" score={audit.scores.growthReadiness} />
                  <ScoreBar label="Digital Readiness" score={audit.scores.digitalReadiness} />
                  <ScoreBar label="Marketplace Readiness" score={audit.scores.marketplaceReadiness} />
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-caption text-ink-tertiary mb-3">
                  Complete your Discovery Conversation to see your Business Health.
                </p>
                <button
                  onClick={() => useStore.getState().openAiSetup()}
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[12px] bg-emphasis text-on-emphasis text-subhead font-semibold hover:bg-emphasis/90 transition-colors"
                >
                  Run discovery <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Next Move */}
        <motion.div
          id="guide-next"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard padding="lg" variant="brand" hover className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-[10px] bg-brand/15 flex items-center justify-center">
                <Zap className="h-4 w-4 text-brand-dark" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-subhead font-bold text-ink">Your next move</h3>
                <p className="text-caption text-ink-tertiary mt-0.5">Chosen by AI · highest value first</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-5">
                <div className="h-11 w-11 rounded-[13px] flex items-center justify-center mb-3" style={{ backgroundColor: `${nextMove.color}16` }}>
                  <nextMove.icon className="h-5 w-5" style={{ color: nextMove.color }} strokeWidth={2} />
                </div>
                <p className="text-title font-bold text-ink tracking-tight">{nextMove.label}</p>
                <p className="text-callout text-ink-secondary mt-1 leading-snug">
                  {audit && weakAreas.length > 0
                    ? `Your ${weakAreas[0].label} needs the most attention right now. Start here and watch your score climb.`
                    : nextMove.reason}
                </p>
              </div>

              <button
                onClick={() => onNavigate(nextMove.view)}
                className="group flex items-center justify-between h-12 px-4 rounded-[14px] bg-emphasis text-on-emphasis text-subhead font-semibold hover:bg-emphasis/90 transition-colors"
              >
                Go to {nextMove.label}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {quickLinks.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => onNavigate(q.view)}
                    className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-surface/60 border border-glass-border text-caption font-semibold text-ink-tertiary hover:text-ink hover:border-brand/30 transition-colors"
                  >
                    <q.icon className="h-3 w-3" style={{ color: q.color }} strokeWidth={2} />
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: stats.totalRevenue, icon: DollarSign, color: "#30D158", formatted: true, view: "finance" as BirichiNexView },
          { label: "Customers", value: stats.totalContacts, icon: Users, color: "#007AFF", formatted: false, view: "crm" as BirichiNexView },
          { label: "Inventory Items", value: stats.inventoryCount, icon: Package, color: "#FF9500", formatted: false, view: "inventory" as BirichiNexView },
          { label: "AI Calls Taken", value: agentCalls.length, icon: Headset, color: "#AF52DE", formatted: false, view: "ai-agent" as BirichiNexView },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard onClick={() => onNavigate(stat.view)} className="cursor-pointer group">
              <GlassCard padding="md" hover className="shine-sweep">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-caption text-ink-tertiary uppercase tracking-wider font-semibold">{stat.label}</p>
                    {stat.formatted ? (
                      <p className="text-title font-bold text-ink tracking-tight">{formatPrice(stat.value, selectedCurrency)}</p>
                    ) : (
                      <p className="text-title font-bold text-ink tracking-tight">
                        <AnimatedCounter value={stat.value} />
                      </p>
                    )}
                    <p className="flex items-center gap-0.5 text-[10px] font-semibold text-ink-quaternary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      Open {stat.label} <ArrowUpRight className="h-2.5 w-2.5" />
                    </p>
                  </div>
                  <motion.div
                    className="h-10 w-10 rounded-[13px] icon-tile flex items-center justify-center"
                    style={{ animationDelay: `${i * 0.5}s` }}
                    whileHover={{ scale: 1.12, rotate: 6 }}
                  >
                    <stat.icon className="h-[18px] w-[18px]" style={{ color: stat.color }} strokeWidth={2} />
                  </motion.div>
                </div>
              </GlassCard>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* ── Action Plan ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-[10px] bg-[#30D158]/12 flex items-center justify-center">
                  <Check className="h-4 w-4 text-[#30D158]" strokeWidth={1.5} />
                </div>
                <h3 className="text-subhead font-bold text-ink">Your action plan</h3>
              </div>
              <p className="text-caption text-ink-tertiary mt-1.5">Every step connects to a tool. Tap to act.</p>
            </div>
            <div className="flex gap-1.5 bg-surface-secondary/70 rounded-[12px] p-1">
              {HORIZONS.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setActiveHorizon(h.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[12px] font-semibold transition-all ${
                    activeHorizon === h.id ? "bg-surface shadow-sm text-ink" : "text-ink-tertiary hover:text-ink-secondary"
                  }`}
                >
                  <h.icon className="h-3.5 w-3.5" style={{ color: activeHorizon === h.id ? h.color : undefined }} strokeWidth={2} />
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeHorizon}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {horizonItems.length === 0 && (
                <div className="col-span-2 py-6 text-center">
                  <p className="text-caption text-ink-tertiary mb-4">
                    Nothing planned for this horizon yet — your AI Advisor can build one in seconds.
                  </p>
                  <button
                    onClick={() => onNavigate("ai-advisor")}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[11px] bg-emphasis text-on-emphasis text-caption font-semibold hover:bg-emphasis/90 transition-colors cursor-pointer"
                  >
                    Ask AI Advisor to build it <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {horizonItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="p-4 rounded-[16px] bg-surface-secondary/50 border border-glass-border/50 hover:border-brand/25 hover:bg-surface-secondary transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-[10px] bg-surface flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Zap className="h-4 w-4 text-brand" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-subhead font-bold text-ink leading-snug">{item.title}</p>
                      <p className="text-caption text-ink-tertiary mt-1 leading-relaxed">{item.rationale}</p>
                      <button
                        onClick={() => onNavigate(item.view)}
                        className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-brand-dark hover:text-brand transition-colors"
                      >
                        {item.actionLabel} <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {weakAreas.length > 0 && (
            <div className="mt-5 pt-5 border-t border-glass-border/50">
              <p className="text-caption font-semibold text-ink mb-2 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-brand" />
                Focus areas right now
              </p>
              <div className="flex flex-wrap gap-2">
                {weakAreas.map((area) => (
                  <button
                    key={area.label}
                    onClick={() => onNavigate("ai-advisor")}
                    className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-secondary/70 border border-glass-border/50 transition-all duration-300 hover:border-brand/50 hover:bg-brand/10 cursor-pointer"
                  >
                    <span className="text-[12px] font-semibold text-ink">{area.label}</span>
                    <span className="text-[11px] font-bold" style={{ color: scoreColor(area.score) }}>{area.score}</span>
                    <ArrowUpRight className="h-3 w-3 text-ink-quaternary group-hover:text-brand transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* ── Journey + Activity ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Founder Journey */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-1"
        >
          <GlassCard padding="lg" className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-subhead font-bold text-ink">Your Founder Journey</h3>
              <Badge variant="info" size="sm">Stage {journeyIndex + 1} / {FOUNDER_JOURNEY_STAGES.length}</Badge>
            </div>

            <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide pb-2">
              {FOUNDER_JOURNEY_STAGES.map((stage, i) => {
                const isCurrent = i === journeyIndex;
                const isPast = i < journeyIndex;
                return (
                  <div key={stage} className="flex items-center shrink-0">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                        isCurrent
                          ? "bg-brand/15 border-brand text-brand-dark"
                          : isPast
                            ? "bg-success/10 border-success/25 text-success"
                            : "bg-surface-secondary/60 border-glass-border/60 text-ink-quaternary"
                      }`}
                    >
                      {isPast ? (
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      ) : isCurrent ? (
                        <Flame className="h-3 w-3" strokeWidth={2} />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                      )}
                      <span className="text-[11px] font-bold whitespace-nowrap">{stage}</span>
                    </div>
                    {i < FOUNDER_JOURNEY_STAGES.length - 1 && (
                      <div className={`h-px w-2 ${isPast ? "bg-success/40" : "bg-ink-quaternary/20"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-glass-border/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-caption font-semibold text-ink flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-[#AF52DE]" />
                  Institutional Maturity
                </p>
                <span className="text-caption text-ink-tertiary">
                  <span className="font-bold text-[#AF52DE]">{currentRung.label}</span>
                  {nextRung && <> → {nextRung.label}</>}
                </span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                {INSTITUTION_RUNGS.map((rung, i) => {
                  const isCurrent = i === currentRungIndex;
                  const isPast = i < currentRungIndex;
                  return (
                    <div key={rung.id} className="flex items-center shrink-0">
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all ${
                          isCurrent
                            ? "bg-[#AF52DE]/12 border-[#AF52DE] text-[#AF52DE]"
                            : isPast
                              ? "bg-success/10 border-success/25 text-success"
                              : "bg-surface-secondary/60 border-glass-border/60 text-ink-quaternary"
                        }`}
                      >
                        <span className="text-[10px] font-bold whitespace-nowrap">{rung.label}</span>
                      </div>
                      {i < INSTITUTION_RUNGS.length - 1 && (
                        <div className={`h-px w-1.5 ${isPast ? "bg-success/40" : "bg-ink-quaternary/20"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => onNavigate("entrepreneur-hub")}
              className="mt-4 w-full flex items-center justify-center gap-1.5 h-10 rounded-[12px] bg-surface-secondary/70 border border-glass-border text-caption font-semibold text-ink-secondary hover:text-ink hover:border-brand/30 transition-colors"
            >
              Explore the hub <ArrowUpRight className="h-3 w-3" />
            </button>
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-2"
        >
          <GlassCard padding="lg" className="h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-ink-tertiary" strokeWidth={1.5} />
                <h3 className="text-subhead font-bold text-ink">Recent activity</h3>
              </div>
              {recentActivity.length > 0 && (
                <button
                  onClick={() => onNavigate(recentActivity[0].navigateTo)}
                  className="text-caption font-semibold text-brand-dark hover:text-brand transition-colors"
                >
                  View all
                </button>
              )}
            </div>
            <div className="space-y-1">
              {recentActivity.length === 0 && (
                <p className="text-caption text-ink-quaternary py-4 text-center">
                  No recent activity yet. Add customers or let Amani take her first call.
                </p>
              )}
              {recentActivity.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => onNavigate(activity.navigateTo)}
                  className="w-full flex items-center gap-3 p-3 rounded-[12px] hover:bg-surface-secondary/60 transition-colors text-left"
                >
                  <div className="h-2 w-2 rounded-full bg-brand shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-subhead text-ink truncate">{activity.title}</p>
                    <p className="text-caption text-ink-quaternary flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3 w-3" strokeWidth={1.5} />
                      {activity.time}
                    </p>
                  </div>
                  {activity.badge && (
                    <Badge
                      variant={activity.badge === "New" ? "success" : activity.badge === "Payment" ? "brand" : "info"}
                      size="sm"
                    >
                      {activity.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Verified Business ID strip ───────────────────────────────────── */}
      {audit && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard variant="brand" padding="lg" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-[14px] bg-brand/15 flex items-center justify-center">
                <Shield className="h-6 w-6 text-brand-dark" strokeWidth={1.5} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-subhead font-bold text-ink">{audit.businessProfile.name}</h3>
                  <Badge variant="success" size="sm" dot>Verified</Badge>
                </div>
                <p className="text-caption text-ink-tertiary mt-0.5">
                  {audit.businessProfile.growthStage} Stage · {audit.businessProfile.industry} · BirichiNex Verified Business ID
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("profile")}
              className="flex items-center gap-1.5 h-10 px-4 rounded-[12px] bg-emphasis text-on-emphasis text-caption font-semibold hover:bg-emphasis/90 transition-colors"
            >
              View profile <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </GlassCard>
        </motion.div>
      )}
    </div>
    </CursorSpotlight>
  );
}
