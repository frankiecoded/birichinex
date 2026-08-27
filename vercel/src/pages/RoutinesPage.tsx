import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sunrise, CalendarCheck, Flame, ChevronDown, Check, Sparkles,
  BookOpenText, TrendingUp, Clock3, X,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import CursorSpotlight from "../components/three/CursorSpotlight";
import { useStore } from "../store/useStore";
import {
  DAILY_REFLECTION_QUESTIONS,
  WEEKLY_REVIEW_AREAS,
  REVIEW_CYCLES,
  DailyReflection,
  WeeklyReview,
} from "../data/routines";

interface RoutinesPageProps {
  onNavigate: (view: "ai-advisor") => void;
}

// ─── Streak helper ──────────────────────────────────────────────────────────

function computeStreak(dates: string[]): number {
  const unique = Array.from(new Set(dates)).sort();
  if (unique.length === 0) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const seen = new Set(unique);
  let cursor = new Date(today);
  if (!seen.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (seen.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// ─── Routine Answer Input ───────────────────────────────────────────────────

function RoutineInput({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="p-4 rounded-[16px] bg-surface-secondary/40 border border-glass-border/50 focus-within:border-brand/30 transition-colors">
      <p className="text-subhead font-semibold text-ink mb-1">{label}</p>
      <p className="text-caption text-ink-tertiary mb-2.5">{hint}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="Write your reflection..."
        className="w-full bg-surface/70 border border-glass-border rounded-[12px] px-3.5 py-2.5 text-subhead text-ink placeholder:text-ink-quaternary focus:outline-none focus:border-brand/40 resize-none transition-colors"
      />
    </div>
  );
}

// ─── Daily Reflection ───────────────────────────────────────────────────────

function DailyReflectionPanel() {
  const reflections = useStore((s) => s.reflections);
  const addReflection = useStore((s) => s.addReflection);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const todays = reflections.find((r) => r.date === today);
  const streak = computeStreak(reflections.map((r) => r.date));
  const filledCount = DAILY_REFLECTION_QUESTIONS.filter((q) => (answers[q.key] ?? "").trim().length > 0).length;
  const allFilled = filledCount === DAILY_REFLECTION_QUESTIONS.length;

  const save = () => {
    addReflection(answers);
    setSavedId("saved");
    setAnswers({});
    setTimeout(() => setSavedId(null), 3000);
  };

  return (
    <GlassCard padding="lg" variant="elevated">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-8 w-8 rounded-[10px] bg-[#FF9F0A]/12 flex items-center justify-center">
              <Sunrise className="h-4 w-4 text-[#FF9F0A]" strokeWidth={1.5} />
            </div>
            <h3 className="text-subhead font-bold text-ink">The Daily Founder Reflection™️</h3>
          </div>
          <p className="text-caption text-ink-tertiary mt-1.5 max-w-xl">
            Ten minutes a day develops intentional leadership. At the end of every working
            day, answer six questions — reflection turns experience into wisdom.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {streak > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF9F0A]/10 text-[#FF9F0A] text-[12px] font-bold">
              <Flame className="h-3.5 w-3.5" /> {streak} day streak
            </span>
          )}
          {todays ? (
            <Badge variant="success" size="md" dot>Today completed</Badge>
          ) : (
            <Badge variant="warning" size="md">Not yet today</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-3">
          {DAILY_REFLECTION_QUESTIONS.map((q) => (
            <RoutineInput
              key={q.key}
              label={q.label}
              hint={q.hint}
              value={answers[q.key] ?? ""}
              onChange={(v) => setAnswers((prev) => ({ ...prev, [q.key]: v }))}
            />
          ))}
          <div className="flex items-center justify-between pt-1">
            <span className="text-caption text-ink-tertiary">{filledCount} of {DAILY_REFLECTION_QUESTIONS.length} answered</span>
            <button
              onClick={save}
              disabled={!allFilled || Boolean(todays)}
              className="h-11 px-5 rounded-[13px] bg-emphasis text-on-emphasis text-subhead font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-emphasis/85 flex items-center gap-2"
            >
              {savedId ? (
                <><Check className="h-4 w-4" /> Saved</>
              ) : todays ? (
                <><Check className="h-4 w-4" /> Completed</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Save today's reflection</>
              )}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="space-y-2">
          <p className="text-overline text-ink-tertiary mb-2 flex items-center gap-1.5">
            <BookOpenText className="h-3 w-3" /> Recent Reflections
          </p>
          {reflections.length === 0 ? (
            <div className="p-5 rounded-[16px] bg-surface-secondary/50 border border-dashed border-glass-border text-center">
              <p className="text-caption text-ink-quaternary">Your reflections will appear here. Consistency builds wisdom.</p>
            </div>
          ) : (
            reflections.slice(0, 5).map((r: DailyReflection) => (
              <div key={r.id} className="rounded-[14px] bg-surface-secondary/50 border border-glass-border/50 overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-secondary/80 transition-colors"
                >
                  <span className="text-subhead font-semibold text-ink">
                    {new Date(r.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-ink-quaternary transition-transform ${expanded === r.id ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {expanded === r.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="px-4 pb-4 space-y-2"
                    >
                      {DAILY_REFLECTION_QUESTIONS.map((q) => (
                        <div key={q.key}>
                          <p className="text-caption font-semibold text-ink-tertiary">{q.label}</p>
                          <p className="text-subhead text-ink leading-relaxed">{r.answers[q.key] || "—"}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Weekly CEO Review ──────────────────────────────────────────────────────

function WeeklyCEOReviewPanel() {
  const weeklyReviews = useStore((s) => s.weeklyReviews);
  const addWeeklyReview = useStore((s) => s.addWeeklyReview);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filledCount = WEEKLY_REVIEW_AREAS.filter((a) => (answers[a.key] ?? "").trim().length > 0).length;
  const allFilled = filledCount === WEEKLY_REVIEW_AREAS.length;
  const latest = weeklyReviews[0];

  const save = () => {
    addWeeklyReview(answers);
    setSavedId("saved");
    setAnswers({});
    setTimeout(() => setSavedId(null), 3000);
  };

  return (
    <GlassCard padding="lg" variant="elevated">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-8 w-8 rounded-[10px] bg-[#FF6482]/12 flex items-center justify-center">
              <CalendarCheck className="h-4 w-4 text-[#FF6482]" strokeWidth={1.5} />
            </div>
            <h3 className="text-subhead font-bold text-ink">The Weekly CEO Review™️</h3>
          </div>
          <p className="text-caption text-ink-tertiary mt-1.5 max-w-xl">
            Your disciplined weekly operating rhythm. Review progress, performance, decisions,
            risks, and the priorities for the week ahead.
          </p>
        </div>
        <div className="shrink-0">
          {latest ? (
            <Badge variant="success" size="md" dot>Latest: {latest.weekLabel}</Badge>
          ) : (
            <Badge variant="warning" size="md">No review this week</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WEEKLY_REVIEW_AREAS.map((area) => (
              <RoutineInput
                key={area.key}
                label={`${area.icon} ${area.label}`}
                hint={area.hint}
                value={answers[area.key] ?? ""}
                onChange={(v) => setAnswers((prev) => ({ ...prev, [area.key]: v }))}
              />
            ))}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-caption text-ink-tertiary">{filledCount} of {WEEKLY_REVIEW_AREAS.length} areas reviewed</span>
            <button
              onClick={save}
              disabled={!allFilled}
              className="h-11 px-5 rounded-[13px] bg-emphasis text-on-emphasis text-subhead font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-emphasis/85 flex items-center gap-2"
            >
              {savedId ? (
                <><Check className="h-4 w-4" /> Saved</>
              ) : (
                <><TrendingUp className="h-4 w-4" /> Complete this week's review</>
              )}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="space-y-2">
          <p className="text-overline text-ink-tertiary mb-2 flex items-center gap-1.5">
            <Clock3 className="h-3 w-3" /> Past Reviews
          </p>
          {weeklyReviews.length === 0 ? (
            <div className="p-5 rounded-[16px] bg-surface-secondary/50 border border-dashed border-glass-border text-center">
              <p className="text-caption text-ink-quaternary">No reviews yet. A 10-minute weekly review compounds into disciplined execution.</p>
            </div>
          ) : (
            weeklyReviews.slice(0, 6).map((r: WeeklyReview) => (
              <div key={r.id} className="rounded-[14px] bg-surface-secondary/50 border border-glass-border/50 overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-secondary/80 transition-colors"
                >
                  <span className="text-subhead font-semibold text-ink">{r.weekLabel}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-ink-quaternary transition-transform ${expanded === r.id ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {expanded === r.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="px-4 pb-4 space-y-2"
                    >
                      {WEEKLY_REVIEW_AREAS.map((area) => (
                        <div key={area.key}>
                          <p className="text-caption font-semibold text-ink-tertiary">{area.icon} {area.label}</p>
                          <p className="text-subhead text-ink leading-relaxed">{r.answers[area.key] || "—"}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function RoutinesPage({ onNavigate }: RoutinesPageProps) {
  const latestReview = useStore((s) => s.weeklyReviews[0]);

  const nextCycle = useMemo(() => {
    if (!latestReview) return "Start your first Weekly CEO Review";
    return `Next: ${latestReview.weekLabel} + 1 week`;
  }, [latestReview]);

  return (
    <CursorSpotlight className="rounded-2xl">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative space-y-1"
        >
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,150,60,0.12)_0%,transparent_70%)] blur-[60px] pointer-events-none" />
          <div className="flex items-center gap-2">
            <h1 className="text-headline text-gradient-brand tracking-tight">Founder Routines</h1>
            <Badge variant="brand" size="sm">
              <Sparkles className="h-2.5 w-2.5" />
              Operating Rhythm
            </Badge>
          </div>
          <p className="text-callout text-ink-tertiary mt-1 max-w-2xl">
            Review cycles keep execution disciplined and aligned with your long-term objectives.
            {nextCycle}
          </p>
        </motion.div>

        {/* Review Cycles */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {REVIEW_CYCLES.map((cycle) => (
              <GlassCard key={cycle.id} padding="md" hover className="h-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[18px]">{cycle.icon}</span>
                  <p className="text-subhead font-bold text-ink">{cycle.name}</p>
                </div>
                <p className="text-caption text-ink-secondary font-semibold">{cycle.detail}</p>
                <p className="text-caption text-ink-tertiary mt-1 leading-relaxed">{cycle.goal}</p>
                <p className="text-[10px] text-ink-quaternary mt-2">{cycle.cadence}</p>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Daily + Weekly */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <DailyReflectionPanel />
          <WeeklyCEOReviewPanel />
        </motion.div>

        {/* Longer cycles note */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard padding="md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-[11px] bg-[#00C7BE]/12 flex items-center justify-center shrink-0">
                  <Clock3 className="h-4 w-4 text-[#00C7BE]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-subhead font-bold text-ink">Monthly, Quarterly & Annual Reviews</p>
                  <p className="text-caption text-ink-tertiary mt-0.5 max-w-xl">
                    The Monthly Business Review, Quarterly Strategic Review, and Annual Institutional
                    Review compare current performance against your long-term objectives. Your AI
                    Advisor conducts these with you on demand.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("ai-advisor")}
                className="h-10 px-4 rounded-[12px] bg-brand/10 text-brand-dark text-subhead font-semibold hover:bg-brand/20 border border-brand/15 transition-colors flex items-center gap-2 shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Start one with AI
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </CursorSpotlight>
  );
}
