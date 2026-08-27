import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot, Brain, ArrowRight, ArrowLeft, Check, Sparkles, X,
  User, Building2, ListChecks, Shield, Rocket,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import {
  DISCOVERY_QUESTIONS,
  computeAudit,
  DiscoveryAnswers,
} from "../../ai/src/discovery";
import { useStore } from "../store/useStore";
import { scoreTone } from "../../ai/src/discovery";

// ─── Radial Gauge ───────────────────────────────────────────────────────────

function RadialGauge({ score, size = 168, label }: { score: number; size?: number; label: string }) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#30D158" : score >= 45 ? "#FF9F0A" : "#FF453A";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(128,128,128,0.14)"
          strokeWidth={stroke}
        />
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
        <span className="text-[40px] font-bold text-ink tracking-tight">{score}</span>
        <span className="text-[10px] text-ink-tertiary uppercase tracking-wider font-semibold">{label}</span>
      </div>
    </div>
  );
}

// ─── Score Bar ──────────────────────────────────────────────────────────────

function ScoreBar({ label, score }: { label: string; score: number }) {
  const tone = scoreTone(score);
  const color = score >= 70 ? "#30D158" : score >= 45 ? "#FF9F0A" : "#FF453A";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-semibold text-ink">{label}</span>
        <span className="flex items-center gap-2">
          <span className="text-[10px] text-ink-quaternary">{tone.label}</span>
          <span className="text-[13px] font-bold" style={{ color }}>{score}</span>
        </span>
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

// ─── Status rotator during analysis ─────────────────────────────────────────

const ANALYSIS_STATUS = [
  "Interviewing your founder profile…",
  "Mapping your business model…",
  "Building your business profile…",
  "Scoring your business health…",
  "Generating your intelligent action plan…",
];

// ─── Main component ─────────────────────────────────────────────────────────

export default function OnboardingFlow({ onComplete, onExit }: { onComplete: () => void; onExit?: () => void }) {
  const runAudit = useStore((s) => s.runAudit);
  const userName = useStore((s) => s.user?.name ?? "Founder");

  const [phase, setPhase] = useState<"intro" | "conversation" | "analyzing" | "results">("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<DiscoveryAnswers>({});
  const [textValue, setTextValue] = useState("");
  const [analysisStatus, setAnalysisStatus] = useState(0);
  const [completed, setCompleted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const totalQuestions = DISCOVERY_QUESTIONS.length;
  const current = DISCOVERY_QUESTIONS[step];

  const answeredQuestions = useMemo(() => {
    const list: typeof DISCOVERY_QUESTIONS = [];
    for (let i = 0; i < step; i++) list.push(DISCOVERY_QUESTIONS[i]);
    return list;
  }, [step]);

  const selectedFor = (id: string): string[] => {
    const value = answers[id];
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const advance = () => {
    setTextValue("");
    if (step + 1 < totalQuestions) {
      setStep(step + 1);
      scrollToBottom();
    } else {
      setAnalysisStatus(0);
      setPhase("analyzing");
    }
  };

  useEffect(() => {
    if (phase !== "analyzing") return;
    const statusTimer = setInterval(() => {
      setAnalysisStatus((s) => Math.min(s + 1, ANALYSIS_STATUS.length - 1));
    }, 650);
    const doneTimer = setTimeout(() => {
      setPhase("results");
    }, ANALYSIS_STATUS.length * 650 + 400);
    return () => {
      clearInterval(statusTimer);
      clearTimeout(doneTimer);
    };
  }, [phase]);

  const selectSingle = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    advance();
  };

  const toggleMulti = (questionId: string, value: string) => {
    setAnswers((prev) => {
      const currentSel = selectedFor(questionId);
      const next = currentSel.includes(value)
        ? currentSel.filter((v) => v !== value)
        : [...currentSel, value];
      return { ...prev, [questionId]: next };
    });
  };

  const submitText = () => {
    if (!textValue.trim()) return;
    setAnswers((prev) => ({ ...prev, [current.id]: textValue.trim() }));
    advance();
  };

  const goBack = () => {
    if (phase === "conversation" && step > 0) {
      setStep(step - 1);
      scrollToBottom();
    }
  };

  const previewAudit = useMemo(() => {
    if (phase !== "results" && phase !== "analyzing") return null;
    return computeAudit(answers, userName);
  }, [phase, answers, userName]);

  const handleEnterOS = () => {
    if (completed) return;
    setCompleted(true);
    runAudit(answers);
    onComplete();
  };

  const multiSelected = current ? selectedFor(current.id) : [];

  return (
    <div className="min-h-screen bg-surface-secondary relative overflow-hidden flex flex-col">
      {/* Ambient glows */}
      <div className="absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.10)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 -left-32 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(255,100,130,0.08)_0%,transparent_70%)] blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-glass-border/60 backdrop-blur-xl bg-surface/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[14px] bg-night flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <div>
            <p className="text-[14px] font-bold text-ink tracking-tight">BirichiNex™️</p>
            <p className="text-[10px] text-ink-tertiary">Business Growth Ecosystem</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === "conversation" && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="brand" size="sm">
                  <Sparkles className="h-2.5 w-2.5" />
                  {current.area}
                </Badge>
                <span className="text-[11px] text-ink-tertiary font-medium">
                  {Math.round((step / totalQuestions) * 100)}% complete
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalQuestions }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step ? "w-5 bg-brand" : i < step ? "w-1.5 bg-brand/50" : "w-1.5 bg-ink-quaternary/30"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          {phase === "conversation" && step > 0 && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-[12px] text-ink-tertiary hover:text-ink transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Previous
            </button>
          )}
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 text-[12px] text-ink-quaternary hover:text-ink-secondary transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Skip for now
            </button>
          )}
        </div>
      </header>

      {/* ─── Body ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col min-h-full">
          <AnimatePresence mode="wait">
            {/* INTRO */}
            {phase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="my-auto"
              >
                <div className="text-center">
                  <div className="relative inline-flex mb-6">
                    <div className="h-20 w-20 rounded-[24px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] flex items-center justify-center shadow-xl shadow-[#FF6482]/25">
                      <Brain className="h-10 w-10 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -inset-1.5 rounded-[28px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] animate-[glowPulse_3s_ease-in-out_infinite] blur-[14px] opacity-30" />
                  </div>
                  <h1 className="text-headline text-ink tracking-tight mb-3">Meet BirichiNex AI</h1>
                  <p className="text-callout text-ink-tertiary max-w-md mx-auto leading-relaxed">
                    I'm your AI Business Advisor. In plain, everyday language I'll ask you about your
                    business — whether you're <span className="text-ink font-semibold">just starting out</span>,
                    a <span className="text-ink font-semibold">seasoned pro</span>, or an
                    <span className="text-ink font-semibold"> expert</span> — then I'll help you structure and
                    start your business right here on the platform.
                  </p>
                  <p className="text-caption text-ink-quaternary mt-3 max-w-sm mx-auto">
                    This intelligent discovery conversation takes about 5 minutes. Answer honestly — it makes my guidance sharper.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-8">
                  {[
                    { icon: User, label: "Founder Profile", color: "#FF6482" },
                    { icon: Building2, label: "Business Profile", color: "#007AFF" },
                    { icon: ListChecks, label: "Action Plan", color: "#30D158" },
                  ].map((item) => (
                    <div key={item.label} className="glass-material rounded-[16px] p-4 border border-glass-border/50 text-center">
                      <div className="h-9 w-9 rounded-[12px] flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${item.color}15` }}>
                        <item.icon className="h-4.5 w-4.5" style={{ color: item.color }} strokeWidth={1.5} />
                      </div>
                      <p className="text-caption font-semibold text-ink">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Button variant="primary" size="lg" fullWidth onClick={() => setPhase("conversation")}>
                    Start Discovery <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* CONVERSATION */}
            {phase === "conversation" && (
              <motion.div
                key="conversation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <div ref={scrollRef} className="space-y-5">
                  {/* Previous Q/A pairs */}
                  {answeredQuestions.map((q) => {
                    const sel = selectedFor(q.id);
                    return (
                      <div key={q.id}>
                        {/* AI bubble */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="shrink-0 h-8 w-8 rounded-[10px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] flex items-center justify-center shadow-md shadow-[#FF6482]/15">
                            <Bot className="h-4 w-4 text-white" strokeWidth={1.5} />
                          </div>
                          <div className="glass-material rounded-[18px] px-4 py-3 border border-glass-border/50 text-[15px] text-ink leading-relaxed">
                            {q.prompt}
                          </div>
                        </div>
                        {/* User bubble */}
                        <div className="flex justify-end mb-1">
                          <div className="bg-emphasis text-on-emphasis rounded-[18px] px-4 py-2.5 text-[14px] shadow-lg shadow-emphasis/10 max-w-[80%]">
                            {q.kind === "text"
                              ? sel[0] ?? ""
                              : sel.map((v) => q.options?.find((o) => o.value === v)?.label ?? v).join(", ")}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Current question */}
                  {current && (
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 h-8 w-8 rounded-[10px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] flex items-center justify-center shadow-md shadow-[#FF6482]/15">
                        <Bot className="h-4 w-4 text-white" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <div className="glass-material rounded-[18px] px-4 py-3.5 border border-glass-border/50">
                          <p className="text-[15px] text-ink font-medium leading-relaxed">{current.prompt}</p>
                          <p className="text-[12px] text-ink-tertiary mt-1.5 flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-brand" />
                            {current.hint}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Answer controls */}
                  {current && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="pl-11"
                    >
                      {current.kind === "text" ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            autoFocus
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") submitText(); }}
                            placeholder={current.placeholder}
                            className="flex-1 h-11 px-4 bg-surface border border-glass-border rounded-[14px] text-[15px] text-ink placeholder:text-ink-quaternary focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
                          />
                          <button
                            onClick={submitText}
                            disabled={!textValue.trim()}
                            className="h-11 w-11 rounded-[14px] bg-emphasis text-on-emphasis flex items-center justify-center disabled:opacity-40 transition-all hover:scale-[1.03] active:scale-95 shrink-0"
                          >
                            <ArrowRight className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ) : current.kind === "single" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {current.options?.map((opt) => (
                            <motion.button
                              key={opt.value}
                              onClick={() => selectSingle(current.id, opt.value)}
                              whileHover={{ scale: 1.015 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex items-center gap-3 p-3 rounded-[14px] border border-glass-border bg-surface/70 hover:border-brand/40 hover:bg-brand/5 transition-all text-left group"
                            >
                              <span className="text-[18px]">{opt.icon}</span>
                              <span className="text-[13px] font-medium text-ink flex-1">{opt.label}</span>
                              <ArrowRight className="h-3.5 w-3.5 text-ink-quaternary group-hover:text-brand transition-colors" />
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {current.options?.map((opt) => {
                              const isSelected = multiSelected.includes(opt.value);
                              return (
                                <button
                                  key={opt.value}
                                  onClick={() => toggleMulti(current.id, opt.value)}
                                  className={`flex items-center gap-3 p-3 rounded-[14px] border transition-all text-left ${
                                    isSelected
                                      ? "border-brand bg-brand/10"
                                      : "border-glass-border bg-surface/70 hover:border-brand/30"
                                  }`}
                                >
                                  <span className="text-[18px]">{opt.icon}</span>
                                  <span className="text-[13px] font-medium text-ink flex-1">{opt.label}</span>
                                  <span
                                    className={`h-5 w-5 rounded-[7px] border flex items-center justify-center transition-all ${
                                      isSelected ? "bg-brand border-brand" : "border-ink/20"
                                    }`}
                                  >
                                    {isSelected && <Check className="h-3 w-3 text-ink" strokeWidth={3} />}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={multiSelected.length === 0}
                              onClick={advance}
                              iconPosition="right"
                              icon={<ArrowRight className="h-3.5 w-3.5" />}
                            >
                              Continue
                            </Button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ANALYZING */}
            {phase === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="my-auto text-center"
              >
                <div className="relative inline-flex mb-8">
                  <div className="h-20 w-20 rounded-[24px] bg-gradient-to-br from-[#FF6482] to-[#FF375F] flex items-center justify-center shadow-xl shadow-[#FF6482]/25">
                    <Bot className="h-10 w-10 text-white animate-pulse" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2.5 w-2.5 rounded-full bg-brand animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={analysisStatus}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-callout text-ink-secondary"
                  >
                    {ANALYSIS_STATUS[analysisStatus]}
                  </motion.p>
                </AnimatePresence>
                <p className="text-caption text-ink-quaternary mt-2">
                  BirichiNex AI is reasoning across your business using the Entrepreneurial Operating System
                </p>
              </motion.div>
            )}

            {/* RESULTS */}
            {phase === "results" && previewAudit && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 mb-4">
                    <Check className="h-3.5 w-3.5 text-success" />
                    <span className="text-[12px] font-semibold text-success">Business Audit Complete</span>
                  </div>
                  <h1 className="text-headline text-ink tracking-tight">Your Business Health Dashboard is Ready</h1>
                  <p className="text-callout text-ink-tertiary mt-2 max-w-lg mx-auto">
                    BirichiNex AI has analyzed your business and built your Founder Profile, Business Profile, and Intelligent Action Plan.
                  </p>
                </div>

                {/* Health Scores */}
                <GlassCard padding="lg" variant="elevated">
                  <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                    <RadialGauge score={previewAudit.scores.businessHealth} label="Business Health" />
                    <div className="flex-1 w-full space-y-3">
                      <ScoreBar label="Founder Readiness" score={previewAudit.scores.founderReadiness} />
                      <ScoreBar label="Business Maturity" score={previewAudit.scores.businessMaturity} />
                      <ScoreBar label="Growth Readiness" score={previewAudit.scores.growthReadiness} />
                      <ScoreBar label="Digital Readiness" score={previewAudit.scores.digitalReadiness} />
                      <ScoreBar label="Marketplace Readiness" score={previewAudit.scores.marketplaceReadiness} />
                    </div>
                  </div>
                </GlassCard>

                {/* Profiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassCard padding="md">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-7 w-7 rounded-[9px] bg-[#FF6482]/12 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-[#FF6482]" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-subhead font-bold text-ink">Founder Profile</h3>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-[14px] bg-surface-secondary flex items-center justify-center text-[24px]">
                        {previewAudit.founderProfile.avatar}
                      </div>
                      <div>
                        <p className="text-subhead font-bold text-ink">{previewAudit.founderProfile.name}</p>
                        <p className="text-caption text-ink-tertiary">{previewAudit.founderProfile.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-caption text-ink-secondary">
                      <p><span className="font-semibold text-ink">Vision:</span> {previewAudit.founderProfile.vision}</p>
                      <p><span className="font-semibold text-ink">Leadership:</span> {previewAudit.founderProfile.leadershipStage}</p>
                      {previewAudit.founderProfile.goals.length > 0 && (
                        <p><span className="font-semibold text-ink">Goals:</span> {previewAudit.founderProfile.goals.join(" · ")}</p>
                      )}
                    </div>
                  </GlassCard>

                  <GlassCard padding="md">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-7 w-7 rounded-[9px] bg-[#007AFF]/12 flex items-center justify-center">
                        <Building2 className="h-3.5 w-3.5 text-[#007AFF]" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-subhead font-bold text-ink">Business Profile</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <Badge variant="brand" size="sm">{previewAudit.businessProfile.growthStage} Stage</Badge>
                      <Badge variant="info" size="sm">{previewAudit.businessProfile.industry}</Badge>
                      <Badge variant="success" size="sm">{previewAudit.businessProfile.revenueStage}</Badge>
                    </div>
                    <div className="space-y-2 text-caption text-ink-secondary">
                      <p><span className="font-semibold text-ink">Business:</span> {previewAudit.businessProfile.name}</p>
                      <p><span className="font-semibold text-ink">Team:</span> {previewAudit.businessProfile.teamSize}</p>
                      <p><span className="font-semibold text-ink">Customers:</span> {previewAudit.businessProfile.customers}</p>
                      <p><span className="font-semibold text-ink">Products:</span> {(previewAudit.businessProfile.products.length ? previewAudit.businessProfile.products : ["—"]).join(", ")}</p>
                      <p><span className="font-semibold text-ink">Digital:</span> {previewAudit.businessProfile.digitalPresence} · <span className="font-semibold text-ink">Marketplace:</span> {previewAudit.businessProfile.marketplaceReadiness}</p>
                    </div>
                  </GlassCard>
                </div>

                {/* Action Plan preview */}
                <GlassCard padding="md">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-7 w-7 rounded-[9px] bg-[#30D158]/12 flex items-center justify-center">
                      <ListChecks className="h-3.5 w-3.5 text-[#30D158]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-subhead font-bold text-ink">Your Intelligent Action Plan</h3>
                  </div>
                  <p className="text-caption text-ink-tertiary mb-4">
                    Top 3 immediate priorities, generated from your weakest areas. Your full 30-day, 90-day, and long-term plan lives on your dashboard.
                  </p>
                  <div className="space-y-2.5">
                    {previewAudit.actionPlan.filter((a) => a.horizon === "now").slice(0, 3).map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-3 p-3 rounded-[14px] bg-surface-secondary/60 border border-glass-border/50"
                      >
                        <div className="h-7 w-7 rounded-full bg-brand/15 text-brand-dark flex items-center justify-center text-[13px] font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-subhead font-semibold text-ink truncate">{item.title}</p>
                          <p className="text-caption text-ink-tertiary truncate">{item.actionLabel}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>

                {/* Institution promise */}
                <div className="flex items-start gap-3 p-4 rounded-[16px] border border-glass-border/50 bg-gradient-to-br from-brand/5 to-transparent">
                  <Shield className="h-5 w-5 text-brand mt-0.5 shrink-0" />
                  <p className="text-caption text-ink-secondary leading-relaxed">
                    <span className="font-semibold text-ink">The BirichiNex Promise:</span> Businesses create value. Institutions create legacy.
                    Every recommendation you'll receive is designed to strengthen your business today and build an institution that outlives you.
                  </p>
                </div>

                <Button variant="primary" size="lg" fullWidth onClick={handleEnterOS}>
                  Enter your BirichiNex™️ OS <Rocket className="h-4 w-4 ml-1" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
