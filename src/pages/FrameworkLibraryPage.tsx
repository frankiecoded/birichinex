import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, ChevronRight, X, Sparkles, Brain, Rocket,
  Check, ArrowUpRight, Compass, ScrollText, Shield,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import CursorSpotlight from "../components/three/CursorSpotlight";
import { useStore } from "../store/useStore";
import { BirichiNexView } from "../types";
import {
  LAWS,
  FRAMEWORKS,
  DOMAIN_META,
  FrameworkDomain,
  INSTITUTION_RUNGS,
  InstitutionRung,
  FrameworkDefinition,
} from "../data/frameworks";
import { scoreTone } from "../../ai/src/discovery";

interface FrameworkLibraryPageProps {
  onNavigate: (view: BirichiNexView) => void;
}

const HEALTH_INDICATORS = [
  { key: "vision", label: "Vision", color: "#D4AF37", recommendation: "Sharpen and document your long-term vision, then socialise it with your team so every decision aligns." },
  { key: "customers", label: "Customers", color: "#AF52DE", recommendation: "Define your ideal customer precisely and redesign your offers around the transformation they seek." },
  { key: "revenue", label: "Revenue", color: "#30D158", recommendation: "Build predictable revenue streams — repeatable sales, retainers, and recurring offers." },
  { key: "cashflow", label: "Cash Flow", color: "#00C7BE", recommendation: "Forecast cash flow weekly, tighten payment terms, and build a working-capital reserve." },
  { key: "operations", label: "Operations", color: "#FF9500", recommendation: "Document your core processes and remove the biggest bottleneck in your daily operations." },
  { key: "team", label: "Team", color: "#FF375F", recommendation: "Invest in one key hire or develop a current teammate's leadership capability this quarter." },
  { key: "systems", label: "Systems", color: "#5856D6", recommendation: "Convert your most repeated task into a documented, repeatable system or automated workflow." },
  { key: "marketing", label: "Marketing", color: "#007AFF", recommendation: "Focus marketing on one customer segment and one message — clarity compounds." },
  { key: "innovation", label: "Innovation", color: "#FF9F0A", recommendation: "Schedule regular customer interviews to find the improvement that matters most to buyers." },
  { key: "leadership", label: "Leadership", color: "#0A84FF", recommendation: "Lead as a steward — develop your character, competence, and ability to build the organisation." },
];

const DOMAIN_ORDER: FrameworkDomain[] = [
  "Institution", "Growth", "Customer", "Founder", "Assessment",
  "Decision", "Operations", "Leadership", "Partnership", "Innovation", "Review",
];

// ─── Assessment: Business Health ────────────────────────────────────────────

function BusinessHealthAssessment() {
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const base: Record<string, number> = {};
    HEALTH_INDICATORS.forEach((h) => (base[h.key] = 55));
    return base;
  });

  const overall = Math.round(
    HEALTH_INDICATORS.reduce((sum, h) => sum + scores[h.key], 0) / HEALTH_INDICATORS.length,
  );
  const tone = scoreTone(overall);
  const toneColor = tone.tone === "high" ? "#30D158" : tone.tone === "medium" ? "#FF9F0A" : "#FF453A";

  const weak = useMemo(
    () =>
      HEALTH_INDICATORS.map((h) => ({ ...h, score: scores[h.key] }))
        .filter((h) => h.score < 70)
        .sort((a, b) => a.score - b.score)
        .slice(0, 4),
    [scores],
  );

  const setScore = (key: string, value: number) =>
    setScores((prev) => ({ ...prev, [key]: value }));

  return (
    <GlassCard padding="lg" variant="elevated">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-8 w-8 rounded-[10px] bg-[#30D158]/12 flex items-center justify-center">
              <Brain className="h-4 w-4 text-[#30D158]" strokeWidth={1.5} />
            </div>
            <h3 className="text-subhead font-bold text-ink">The Business Health Assessment™️</h3>
          </div>
          <p className="text-caption text-ink-tertiary mt-1.5 max-w-2xl">
            Rate your business honestly on a scale of 0–100 across the ten health indicators.
            Every indicator receives a score and a recommendation for improvement.
          </p>
        </div>
        <button
          onClick={() => {
            const reset: Record<string, number> = {};
            HEALTH_INDICATORS.forEach((h) => (reset[h.key] = 55));
            setScores(reset);
          }}
          className="text-caption font-semibold text-ink-quaternary hover:text-ink transition-colors whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders */}
        <div className="lg:col-span-2 space-y-4">
          {HEALTH_INDICATORS.map((h) => {
            const value = scores[h.key];
            return (
              <div key={h.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-subhead font-semibold text-ink flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: h.color }} />
                    {h.label}
                  </span>
                  <span className="text-subhead font-bold tabular-nums" style={{ color: h.color }}>{value}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={value}
                  onChange={(e) => setScore(h.key, Number(e.target.value))}
                  className="w-full h-1.5 appearance-none rounded-full bg-ink/8 accent-brand cursor-pointer"
                />
              </div>
            );
          })}
        </div>

        {/* Result */}
        <div className="space-y-5">
          <div className="p-5 rounded-[18px] bg-surface-secondary/70 border border-glass-border">
            <p className="text-overline text-ink-tertiary mb-1">Overall Health</p>
            <div className="flex items-end gap-2">
              <span className="text-[52px] font-bold text-ink tracking-tight leading-none">{overall}</span>
              <span className="text-[13px] text-ink-tertiary mb-1.5">/ 100</span>
            </div>
            <div className="h-2 rounded-full bg-ink/8 overflow-hidden mt-3">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: toneColor }}
                initial={{ width: 0 }}
                animate={{ width: `${overall}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="mt-3">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full"
                style={{ backgroundColor: `${toneColor}14`, color: toneColor }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: toneColor }} />
                {tone.label}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-[18px] bg-surface-secondary/70 border border-glass-border">
            <p className="text-overline text-ink-tertiary mb-3">Prioritise These First</p>
            {weak.length === 0 ? (
              <p className="text-caption text-success">Strong across all indicators. Time to build the institution.</p>
            ) : (
              <div className="space-y-3">
                {weak.map((h) => (
                  <div key={h.key} className="flex gap-3">
                    <div className="h-6 w-6 rounded-[8px] shrink-0 flex items-center justify-center" style={{ backgroundColor: `${h.color}14` }}>
                      <span className="text-[11px] font-bold" style={{ color: h.color }}>{h.score}</span>
                    </div>
                    <p className="text-caption text-ink-secondary leading-relaxed">
                      <span className="font-bold text-ink">{h.label}: </span>
                      {h.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Assessment: Build Beyond Business ──────────────────────────────────────

function BuildBeyondBusinessAssessment() {
  const [rung, setRung] = useState<InstitutionRung>("business");
  const rungIndex = INSTITUTION_RUNGS.findIndex((r) => r.id === rung);

  return (
    <GlassCard padding="lg" variant="elevated">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="h-8 w-8 rounded-[10px] bg-[#AF52DE]/12 flex items-center justify-center">
          <Rocket className="h-4 w-4 text-[#AF52DE]" strokeWidth={1.5} />
        </div>
        <h3 className="text-subhead font-bold text-ink">The Build Beyond Business Assessment™️</h3>
      </div>
      <p className="text-caption text-ink-tertiary mt-1.5 mb-6 max-w-2xl">
        Growth is measured not only by revenue but by organisational maturity. Select the rung
        that best describes your organisation today.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          {INSTITUTION_RUNGS.map((r, i) => {
            const isActive = rung === r.id;
            const isReached = i <= rungIndex;
            return (
              <button
                key={r.id}
                onClick={() => setRung(r.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-[14px] border transition-all text-left ${
                  isActive
                    ? "border-[#AF52DE]/40 bg-[#AF52DE]/8 shadow-sm"
                    : "border-glass-border/60 bg-surface-secondary/50 hover:bg-surface-secondary"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-[9px] flex items-center justify-center shrink-0 transition-colors ${
                    isReached ? "bg-[#AF52DE] text-white" : "bg-surface-secondary border border-glass-border text-ink-quaternary"
                  }`}
                >
                  {isReached ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <span className="text-[11px] font-bold">{i + 1}</span>}
                </div>
                <div className="flex-1">
                  <p className="text-subhead font-bold text-ink">{r.label}</p>
                  <p className="text-caption text-ink-tertiary">{r.description}</p>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-[#AF52DE]" />}
              </button>
            );
          })}
        </div>

        <div className="p-5 rounded-[18px] bg-surface-secondary/70 border border-glass-border flex flex-col">
          <p className="text-overline text-ink-tertiary mb-2">Organisational Maturity</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-title font-bold text-ink tracking-tight">
              {INSTITUTION_RUNGS[rungIndex].label}
            </span>
            <span className="text-caption text-ink-tertiary">Rung {rungIndex + 1} of {INSTITUTION_RUNGS.length}</span>
          </div>
          <p className="text-callout text-ink-secondary leading-relaxed mb-4">
            {rungIndex < INSTITUTION_RUNGS.length - 1
              ? `Your next horizon is ${INSTITUTION_RUNGS[rungIndex + 1].label} — ${INSTITUTION_RUNGS[rungIndex + 1].description}`
              : "You are building a legacy. Protect it with systems, succession, and stewardship."}
          </p>
          <div className="mt-auto flex flex-wrap gap-2">
            <Badge variant="brand" size="md" dot>Systems Run the Operation</Badge>
            <Badge variant="info" size="md">Institution-First</Badge>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Framework Detail Modal ─────────────────────────────────────────────────

function FrameworkModal({
  framework,
  onClose,
  onNavigate,
}: {
  framework: FrameworkDefinition;
  onClose: () => void;
  onNavigate: (view: BirichiNexView) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] bg-scrim backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[88vh] overflow-y-auto glass-material-lg rounded-t-[24px] sm:rounded-[24px] border border-glass-border scrollbar-hide"
      >
        {/* Header */}
        <div className="relative p-6 sm:p-8 pb-5 border-b border-glass-border/60">
          <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full blur-[70px] pointer-events-none opacity-70" style={{ backgroundColor: `${framework.color}22` }} />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-9 w-9 rounded-[10px] bg-surface-secondary/80 flex items-center justify-center text-ink-secondary hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-[16px] flex items-center justify-center text-[26px] shrink-0"
              style={{ backgroundColor: `${framework.color}16`, border: `1px solid ${framework.color}30` }}
            >
              {framework.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold tracking-wide" style={{ color: framework.color }}>
                  Framework #{String(framework.number).padStart(2, "0")}
                </span>
                <Badge size="sm" className="!bg-surface-secondary/80">{framework.domain}</Badge>
              </div>
              <h2 className="text-title font-bold text-ink tracking-tight">{framework.name}</h2>
            </div>
          </div>
          <p className="text-callout text-ink-tertiary mt-4 leading-relaxed">{framework.tagline}</p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-4 rounded-[16px] border-l-2 bg-surface-secondary/50" style={{ borderColor: framework.color }}>
            <p className="text-overline text-ink-tertiary mb-1.5 flex items-center gap-1.5">
              <Compass className="h-3 w-3" /> Core Principle
            </p>
            <p className="text-callout text-ink-secondary leading-relaxed">{framework.principle}</p>
          </div>

          <div>
            <p className="text-overline text-ink-tertiary mb-3 flex items-center gap-1.5">
              <ScrollText className="h-3 w-3" /> The {framework.steps.length} Steps
            </p>
            <div className="space-y-2">
              {framework.steps.map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3 p-2.5 rounded-[12px] bg-surface-secondary/40 border border-glass-border/40"
                >
                  <div
                    className="h-6 w-6 rounded-[8px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${framework.color}14` }}
                  >
                    <Check className="h-3 w-3" style={{ color: framework.color }} strokeWidth={2.5} />
                  </div>
                  <span className="text-subhead text-ink leading-snug">{step}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-[16px] bg-surface-secondary/50 border border-glass-border/50">
            <p className="text-overline text-ink-tertiary mb-1.5 flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> When To Apply
            </p>
            <p className="text-callout text-ink-secondary leading-relaxed">{framework.whenToApply}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 sm:p-8 pt-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate("ai-advisor")}
              className="flex-1 h-12 rounded-[14px] bg-emphasis text-on-emphasis text-subhead font-semibold hover:bg-emphasis/85 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Ask BirichiNex AI to apply this
              <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
            </button>
            <button
              onClick={onClose}
              className="h-12 px-6 rounded-[14px] bg-surface-secondary/80 text-subhead font-semibold text-ink-secondary hover:text-ink transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function FrameworkLibraryPage({ onNavigate }: FrameworkLibraryPageProps) {
  const [activeTab, setActiveTab] = useState<"frameworks" | "assessments">("frameworks");
  const [domainFilter, setDomainFilter] = useState<FrameworkDomain | "All">("All");
  const [selected, setSelected] = useState<FrameworkDefinition | null>(null);
  const audit = useStore((s) => s.audit);

  const filtered = useMemo(
    () =>
      FRAMEWORKS.filter(
        (f) => domainFilter === "All" || f.domain === domainFilter,
      ).sort((a, b) => a.number - b.number),
    [domainFilter],
  );

  const suggested = audit
    ? [
        "business-health",
        "founder-success",
        "strategic-decision",
        "growth-flywheel",
      ]
    : [];

  return (
    <CursorSpotlight className="rounded-2xl">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard variant="dark" padding="lg" className="glass-brand-hero">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18)_0%,transparent_70%)] blur-[50px] pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-9 w-9 rounded-[11px] bg-white/15 flex items-center justify-center">
                    <BookOpen className="h-4.5 w-4.5 text-white" strokeWidth={1.5} />
                  </div>
                  <Badge size="sm" className="!bg-white/15 !text-white">The BirichiNex Knowledge Layer</Badge>
                </div>
                <h1 className="text-headline text-white tracking-tight">The Framework Library</h1>
                <p className="text-callout text-white/80 mt-2 max-w-2xl leading-relaxed">
                  The practical bridge between philosophy and execution. Fifteen frameworks,
                  one consistent vocabulary — every principle ready to be applied by the
                  BirichiNex AI on demand.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onNavigate("ai-advisor")}
                  className="h-11 px-5 rounded-[13px] bg-white text-ink dark:text-on-emphasis text-subhead font-bold hover:bg-white/90 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Apply with AI
                </button>
              </div>
            </div>

            {/* The Five Laws */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mt-7">
              {LAWS.map((law) => (
                <motion.div
                  key={law.number}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + law.number * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-[14px] bg-white/10 border border-white/15 p-3 hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[15px]">{law.icon}</span>
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Law {law.number}</span>
                  </div>
                  <p className="text-[12px] font-bold text-white leading-snug">{law.name}</p>
                  <p className="text-[10px] text-white/70 leading-relaxed mt-1">{law.statement}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Tab bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-1.5 bg-surface-secondary/70 rounded-[12px] p-1">
            {(["frameworks", "assessments"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-subhead font-semibold capitalize transition-all ${
                  activeTab === tab ? "bg-surface shadow-sm text-ink" : "text-ink-tertiary hover:text-ink-secondary"
                }`}
              >
                {tab === "frameworks" ? <BookOpen className="h-3.5 w-3.5" /> : <Brain className="h-3.5 w-3.5" />}
                {tab}
              </button>
            ))}
          </div>
          {activeTab === "frameworks" && (
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide max-w-full">
              {(["All", ...DOMAIN_ORDER] as const).map((domain) => (
                <button
                  key={domain}
                  onClick={() => setDomainFilter(domain)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all border ${
                    domainFilter === domain
                      ? "bg-emphasis text-on-emphasis border-ink"
                      : "bg-surface-secondary/60 text-ink-secondary border-glass-border/60 hover:text-ink"
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "frameworks" ? (
            <motion.div
              key="frameworks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filtered.map((framework, i) => {
                const isSuggested = suggested.includes(framework.id);
                return (
                  <motion.div
                    key={framework.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: (i % 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <button
                      onClick={() => setSelected(framework)}
                      className="w-full text-left group h-full"
                    >
                      <GlassCard padding="md" hover className="h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className="h-11 w-11 rounded-[13px] flex items-center justify-center text-[22px] transition-transform group-hover:scale-110 group-hover:-rotate-3"
                            style={{ backgroundColor: `${framework.color}14`, border: `1px solid ${framework.color}25` }}
                          >
                            {framework.icon}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {isSuggested && <Badge size="sm" variant="brand">For You</Badge>}
                            <span className="text-[11px] font-bold text-ink-quaternary">#{String(framework.number).padStart(2, "0")}</span>
                          </div>
                        </div>
                        <h3 className="text-subhead font-bold text-ink leading-snug group-hover:text-brand-dark transition-colors">
                          {framework.name}
                        </h3>
                        <p className="text-caption text-ink-tertiary mt-1.5 leading-relaxed line-clamp-2">
                          {framework.tagline}
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-glass-border/50">
                          <Badge size="sm" className="!bg-surface-secondary/80">{framework.domain}</Badge>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-brand-dark">
                            {framework.steps.length} steps
                            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </GlassCard>
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="assessments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <BusinessHealthAssessment />
              <BuildBeyondBusinessAssessment />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selected && (
          <FrameworkModal
            framework={selected}
            onClose={() => setSelected(null)}
            onNavigate={onNavigate}
          />
        )}
      </AnimatePresence>
    </CursorSpotlight>
  );
}
