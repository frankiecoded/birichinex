/**
 * BNX Intelligence Board — the closed loop, made visible.
 *
 * Renders the persistent intelligence core live: the live health proxy, the
 * Top 3 priorities (each grounded in a real signal), the open recommendation
 * queue, and the Learning Journal (what was tried and what actually changed).
 *
 * Every action here closes the loop:
 *   Approve      → set the intention
 *   Execute      → navigates to the exact view AND hands the prep to Hey BNX
 *   Done+Measure → records before/after metrics + health delta into the store
 *   Skip         → records the decision
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity, ArrowRight, Brain, Check, CheckCircle2, ChevronDown, CircleSlash,
  Gauge, Globe, Layers, Play, RefreshCw, Sparkles, Target, X,
} from "lucide-react";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import CursorSpotlight from "./three/CursorSpotlight";
import { useStore } from "../store/useStore";
import {
  buildBusinessContext,
  measureOutcome,
  prioritize,
  syncRecommendations,
  readMetric,
} from "../../ai/src/core";
import type { BusinessRecommendation } from "../types";

const PRIORITY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "#FF375F", text: "#ffffff", label: "Critical" },
  high: { bg: "#FF9500", text: "#ffffff", label: "High" },
  medium: { bg: "#5856D6", text: "#ffffff", label: "Medium" },
  low: { bg: "#8E8E93", text: "#ffffff", label: "Low" },
};

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "sw", label: "Kiswahili" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
] as const;

function fmt(n: number, unit?: string): string {
  const v = n.toLocaleString("en-US");
  return unit ? `${v} ${unit}` : v;
}

function healthDelta(after?: number, before?: number): number | null {
  if (after === undefined || before === undefined) return null;
  return after - before;
}

export default function BNXIntelligenceBoard() {
  const recommendations = useStore((s) => s.recommendations);
  const outcomes = useStore((s) => s.outcomes);
  const profile = useStore((s) => s.settings.profile);
  const language = useStore((s) => s.settings.profile.language ?? "en");
  const inventoryItems = useStore((s) => s.getUserInventory());
  const transactions = useStore((s) => s.transactions);
  const contacts = useStore((s) => s.contacts);
  const agentCalls = useStore((s) => s.agentCalls);
  const wallet = useStore((s) => s.wallet);
  const audit = useStore((s) => s.audit);
  const updateSettings = useStore((s) => s.updateSettings);
  const setCurrentView = useStore((s) => s.setCurrentView);
  const setCopilotPrompt = useStore((s) => s.setCopilotPrompt);
  const setRecommendationStatus = useStore((s) => s.setRecommendationStatus);

  const [syncing, setSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [measuring, setMeasuring] = useState<BusinessRecommendation | null>(null);
  const [summary, setSummary] = useState("");
  const [langOpen, setLangOpen] = useState(false);

  const ctx = useMemo(
    () =>
      buildBusinessContext(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recommendations, outcomes, inventoryItems, transactions, contacts, agentCalls, wallet, audit, profile],
  );

  const top3 = prioritize(ctx);
  const openQueue = recommendations.filter((r) => r.status !== "done" && r.status !== "skipped");
  const learning = outcomes;

  const refresh = () => {
    setSyncing(true);
    syncRecommendations();
    setSyncing(false);
    setSyncedAt(new Date().toLocaleTimeString());
  };

  // Diagnose once on mount so the loop is live the moment the board opens.
  useEffect(() => {
    if (recommendations.length === 0) {
      const t = window.setTimeout(refresh, 350);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const execute = (rec: BusinessRecommendation) => {
    setCurrentView(rec.view);
    setCopilotPrompt(rec.prep);
  };

  const preview = measuring
    ? (() => {
        const c = buildBusinessContext();
        const after = readMetric(c, measuring.key) ?? measuring.measure.after ?? 0;
        const before = measuring.measure.before ?? 0;
        const health = healthDelta(c.health.live, measuring.healthAt);
        return { c, after, before, health };
      })()
    : null;

  const record = () => {
    if (!measuring) return;
    measureOutcome(measuring, summary || `Done — ${measuring.title}.`);
    setMeasuring(null);
    setSummary("");
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-6 space-y-6 overflow-y-auto h-full scrollbar-hide">
      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-[14px] bg-gradient-to-br from-brand to-[#d4af37]/80 flex items-center justify-center shadow-lg shadow-brand/20">
            <Brain className="h-5 w-5 text-ink" strokeWidth={1.5} />
            <div className="absolute -inset-1 rounded-[16px] bg-brand/20 animate-[glowPulse_3s_ease-in-out_infinite] blur-[8px] opacity-40" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-ink tracking-tight flex items-center gap-2">
              <span className="text-gradient-brand">BNX Intelligence</span>
              <Badge variant="brand" size="sm">
                <Sparkles className="h-2.5 w-2.5" /> Closed loop
              </Badge>
            </h1>
            <p className="text-[12px] text-ink-tertiary">
              Understand → Diagnose → Prioritize → Guide → Execute → Measure → Learn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language — multilingual by default */}
          <CursorSpotlight className="rounded-[12px]" spotlightColor="rgba(212,175,55,0.06)">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 h-9 px-3 rounded-[12px] border border-glass-border bg-surface-secondary/50 hover:bg-surface-secondary text-ink-secondary transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="text-[12px] font-semibold uppercase">{language}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-10 w-40 rounded-[12px] border border-glass-border bg-surface/95 backdrop-blur-xl shadow-xl p-1 z-30">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        updateSettings({ profile: { ...profile, language: l.code } });
                        setLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-[12px] transition-colors ${
                        language === l.code
                          ? "bg-brand/10 text-brand-dark font-semibold"
                          : "text-ink-secondary hover:bg-surface-secondary"
                      }`}
                    >
                      {l.label}
                      {language === l.code && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CursorSpotlight>

          <Button variant="secondary" size="sm" icon={<RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />} onClick={refresh}>
            Re-diagnose
          </Button>
        </div>
      </motion.div>

      {/* ── Health proxy strip ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="glass-material rounded-[20px] border border-glass-border/60 p-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(142,142,147,0.15)" strokeWidth="7" />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke={ctx.health.live >= 60 ? "#30D158" : ctx.health.live >= 40 ? "#FF9500" : "#FF375F"}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${(ctx.health.live / 100) * 163.4} 163.4`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[17px] font-bold text-ink">{ctx.health.live}</span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="h-3.5 w-3.5 text-brand" />
              <span className="text-[13px] font-semibold text-ink">Live business health</span>
              {ctx.health.auditScore !== null && (
                <Badge variant="info" size="sm">audit {ctx.health.auditScore}/100</Badge>
              )}
            </div>
            <p className="text-[12px] text-ink-tertiary leading-relaxed">
              {ctx.next[0]
                ? `Now: ${ctx.next[0].title.toLowerCase().length > 60 ? ctx.next[0].title.slice(0, 60) + "…" : ctx.next[0].title}.`
                : "No urgent signals — the business is running clean."}{" "}
              Net flow {fmt(ctx.finance.netFlow)} · {ctx.stock.outOfStock.length + ctx.stock.lowStock.length} stock risk(s) · {ctx.customers.missedCalls7d} missed call(s)
            </p>
            {syncedAt && <p className="text-[10px] text-ink-quaternary mt-0.5">Diagnosed {syncedAt}</p>}
          </div>
        </div>
      </motion.div>

      {/* ── Top 3 priorities ───────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-brand" />
          <h2 className="text-[13px] font-bold text-ink tracking-wide uppercase">Top priorities this period</h2>
          <span className="text-[11px] text-ink-quaternary ml-auto">{top3.length} of 3</span>
        </div>

        {top3.length === 0 ? (
          <div className="glass-material rounded-[16px] border border-glass-border/50 p-5 text-center">
            <Activity className="h-5 w-5 text-success mx-auto mb-2" />
            <p className="text-[13px] font-medium text-ink">Nothing critical flagged</p>
            <p className="text-[12px] text-ink-tertiary mt-1">
              {profile.company} is running clean — I'll keep watching inventory, cash flow and calls.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {top3.map(({ rec, why, urgency }, i) => {
              const style = PRIORITY_STYLE[urgency];
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.12 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-material rounded-[18px] border border-glass-border/60 p-4 hover:border-brand/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 h-8 w-8 rounded-[10px] flex items-center justify-center mt-0.5" style={{ backgroundColor: `${style.bg}1a` }}>
                      <span className="text-[13px] font-bold" style={{ color: style.bg }}>{i + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-semibold text-ink leading-tight">{rec.title}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md" style={{ backgroundColor: style.bg, color: style.text }}>
                          {style.label}
                        </span>
                        {rec.status === "approved" && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-500">Approved</span>
                        )}
                      </div>
                      <p className="text-[12px] text-ink-tertiary mt-1 leading-relaxed">{rec.detail}</p>
                      <p className="text-[11px] text-ink-quaternary mt-1.5 font-mono">Signal: {why}</p>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Button size="sm" variant="brand" icon={<Play className="h-3 w-3" />} onClick={() => execute(rec)}>
                          Do it
                        </Button>
                        <Button size="sm" variant="secondary" icon={<CheckCircle2 className="h-3 w-3" />} onClick={() => setMeasuring(rec)}>
                          Done & measure
                        </Button>
                        {rec.status !== "approved" && (
                          <Button size="sm" variant="ghost" onClick={() => setRecommendationStatus(rec.id, "approved")}>
                            Approve
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" icon={<CircleSlash className="h-3 w-3" />} onClick={() => setRecommendationStatus(rec.id, "skipped")}>
                          Skip
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* ── Open queue ──────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-4 w-4 text-brand" />
          <h2 className="text-[13px] font-bold text-ink tracking-wide uppercase">Open queue</h2>
          <span className="text-[11px] text-ink-quaternary ml-auto">{openQueue.length} open</span>
        </div>
        {openQueue.length === 0 ? (
          <p className="text-[12px] text-ink-quaternary">All clear.</p>
        ) : (
          <div className="space-y-2">
            {openQueue.map((rec) => (
              <div key={rec.id} className="glass-material rounded-[14px] border border-glass-border/50 px-4 py-3 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-ink truncate">{rec.title}</span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${PRIORITY_STYLE[rec.priority].bg}15`, color: PRIORITY_STYLE[rec.priority].bg }}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-tertiary truncate mt-0.5">{rec.measure.metric}: {fmt(rec.measure.before ?? 0, rec.measure.unit)} baseline</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button size="sm" variant="ghost" icon={<Play className="h-3 w-3" />} onClick={() => execute(rec)}>
                    Do
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setMeasuring(rec)}>
                    Measure
                  </Button>
                  <Button size="sm" variant="ghost" icon={<CircleSlash className="h-3 w-3" />} onClick={() => setRecommendationStatus(rec.id, "skipped")}>
                    Skip
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* ── Learning journal ────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-brand" />
          <h2 className="text-[13px] font-bold text-ink tracking-wide uppercase">What we did & what changed</h2>
          <span className="text-[11px] text-ink-quaternary ml-auto">{learning.length} measured</span>
        </div>

        {learning.length === 0 ? (
          <div className="glass-material rounded-[16px] border border-glass-border/50 p-5 text-center">
            <p className="text-[12px] text-ink-tertiary">
              No outcomes recorded yet. Execute a priority, then hit <span className="text-brand font-semibold">Done & measure</span> —
              the AI will log the before/after and learn from it.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {learning.slice(0, 6).map((o) => {
              const delta = healthDelta(o.healthAfter, o.healthBefore);
              const m = o.metrics[0];
              return (
                <div key={o.id} className="glass-material rounded-[14px] border border-glass-border/50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                    <span className="text-[13px] font-medium text-ink leading-tight">{o.recommendationTitle}</span>
                    {delta !== null && (
                      <span className={`ml-auto shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${delta >= 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                        health {delta >= 0 ? "+" : ""}{delta}pts
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-ink-tertiary mt-1 leading-relaxed">{o.summary}</p>
                  {m && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-medium text-ink-secondary">{m.label}:</span>
                      <span className="text-[11px] font-mono text-ink-quaternary">{fmt(m.before, m.unit)}</span>
                      <ArrowRight className="h-3 w-3 text-brand" />
                      <span className="text-[11px] font-mono font-bold" style={{ color: m.after >= m.before ? (m.label.toLowerCase().includes("out-of-stock") || m.label.toLowerCase().includes("missed") || m.label.toLowerCase().includes("low") ? "#FF375F" : "#30D158") : (m.label.toLowerCase().includes("out-of-stock") || m.label.toLowerCase().includes("missed") || m.label.toLowerCase().includes("low") ? "#30D158" : "#FF375F") }}>
                        {fmt(m.after, m.unit)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* ── Measure modal ───────────────────────────────────── */}
      <AnimatePresence>
        {measuring && preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setMeasuring(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 12, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md glass-material rounded-[20px] border border-glass-border bg-surface/95 p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-ink">Measure & learn</h3>
                <button onClick={() => setMeasuring(null)} className="p-1.5 rounded-lg hover:bg-surface-secondary text-ink-tertiary">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-[13px] font-medium text-ink mb-1">{measuring.title}</p>
              <p className="text-[12px] text-ink-tertiary mb-4">{measuring.detail}</p>

              <div className="rounded-[14px] border border-glass-border/60 bg-surface-secondary/40 p-3 space-y-2 mb-4">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-ink-tertiary">{measuring.measure.metric}</span>
                  <span className="font-mono text-ink-secondary">{fmt(preview.before, measuring.measure.unit)} → <b style={{ color: "#30D158" }}>{fmt(preview.after, measuring.measure.unit)}</b></span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-ink-tertiary">Live health</span>
                  <span className="font-mono text-ink-secondary">
                    {preview.health !== null ? `${preview.c.health.live} (${preview.health >= 0 ? "+" : ""}${preview.health}pts from diagnosis)` : `${preview.c.health.live}/100`}
                  </span>
                </div>
              </div>

              <label className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide block mb-1.5">What actually happened?</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                placeholder="e.g. Restocked 40 units of Ladies Jeans and relisted on the marketplace."
                className="w-full rounded-[12px] border border-glass-border bg-surface-secondary/50 px-3 py-2 text-[13px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-1 focus:ring-brand/30 resize-none mb-4"
              />

              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setMeasuring(null)}>Cancel</Button>
                <Button variant="brand" size="sm" icon={<Check className="h-3.5 w-3.5" />} onClick={record}>
                  Record & learn
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}