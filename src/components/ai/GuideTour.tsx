import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useStore } from "../../store/useStore";

interface GuideStep {
  title: string;
  body: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
}

const STEPS: GuideStep[] = [
  {
    title: "Welcome to your command centre",
    body: "Hi — I'm your BirichiNex guide. This dashboard is the calmest place to run a business. Let me show you the three things that matter most in under a minute.",
  },
  {
    title: "Your Business Health",
    body: "This gold gauge is your Business Health — an AI score built from your Discovery Conversation. The higher it is, the more ready your business is to grow.",
    target: "guide-health",
    position: "bottom",
  },
  {
    title: "Your next move",
    body: "This is the single most important thing to do today. It's chosen by AI based on your weakest area — tap it and I'll take you straight there.",
    target: "guide-next",
    position: "bottom",
  },
  {
    title: "Find anything, fast",
    body: "Everything lives in nine calm spaces — Home, Sell, Customers, Products, Money, Orders, Grow, Learn and Account. Press ⌘K anywhere to jump straight to any tool.",
    target: "guide-nav",
    position: "right",
  },
  {
    title: "I'm always here",
    body: "This is me — tap the orb any time to ask a question, get advice, or start this tour again. I never sleep, so you don't have to worry alone.",
    target: "guide-copilot",
    position: "left",
  },
  {
    title: "You're all set",
    body: "That's the whole tour. Start with your next move whenever you're ready — I'll be right here the entire way. Go build.",
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function GuideTour() {
  const active = useStore((s) => s.guideActive);
  const step = useStore((s) => s.guideStep);
  const next = useStore((s) => s.nextGuideStep);
  const prev = useStore((s) => s.prevGuideStep);
  const end = useStore((s) => s.endGuide);

  const [rect, setRect] = useState<Rect | null>(null);

  const current = STEPS[step];

  useEffect(() => {
    if (!active) return;

    const measure = () => {
      if (!current.target) {
        setRect(null);
        return;
      }
      const el = document.getElementById(current.target);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect(r.width > 4 && r.height > 4 ? { top: r.top, left: r.left, width: r.width, height: r.height } : null);
    };

    const timer = setTimeout(() => {
      if (current.target) {
        document.getElementById(current.target)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeout(measure, 450);
    }, 60);

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [active, step, current.target]);

  const tooltipStyle = useMemo(() => {
    if (!current.target || !rect) {
      return { center: true as const };
    }
    const gap = 16;
    const margin = 16;
    const cardW = 340;
    const cardH = 240;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = 0;
    let top = 0;
    let placement: "top" | "bottom" | "left" | "right" = current.position ?? "bottom";

    if (placement === "bottom") {
      top = rect.top + rect.height + gap;
      left = rect.left;
    } else if (placement === "top") {
      top = Math.max(rect.top - gap - cardH, margin);
      left = rect.left;
    } else if (placement === "left") {
      top = rect.top + rect.height / 2;
      left = Math.max(rect.left - gap - cardW, margin);
    } else {
      top = rect.top + rect.height / 2;
      left = rect.left + rect.width + gap;
    }

    if (placement === "left" && left + cardW > viewportW - margin) placement = "bottom";
    if (placement === "right" && left + cardW > viewportW - margin) placement = "bottom";
    if (top < margin) top = margin;
    if (top > viewportH - cardH - margin) top = viewportH - cardH - margin;

    const isVertical = placement === "top" || placement === "bottom";
    if (isVertical) left = Math.min(left, viewportW - cardW - margin);
    const style: CSSProperties = { top, left };
    return { center: false, placement, style, isVertical, rect };
  }, [current.target, current.position, rect]);

  if (!active) return null;

  const isLast = step === STEPS.length - 1;

  return (
    <>
      <div className="guide-dim" />

      {rect && current.target && (
        <motion.div
          key={`ring-${step}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="guide-spotlight-ring"
          style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
        />
      )}

      <div className="fixed inset-0 z-[95] pointer-events-none">
        {tooltipStyle.center ? (
          <div className="w-full h-full flex items-center justify-center p-6">
            <motion.div
              key={`card-${step}`}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass-sheet pointer-events-auto rounded-[28px] max-w-md w-full p-7"
            >
              {renderBody()}
            </motion.div>
          </div>
        ) : (
          <motion.div
            key={`tip-${step}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="glass-sheet pointer-events-auto rounded-[22px] w-[340px] p-6"
            style={tooltipStyle.style}
          >
            {renderBody()}
          </motion.div>
        )}
      </div>
    </>
  );

  function renderBody() {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-brand text-[11px] font-bold">BIRICHINEX GUIDE</span>
          </div>
          <button
            onClick={end}
            className="h-7 w-7 rounded-full bg-surface-secondary/80 flex items-center justify-center text-ink-tertiary hover:text-ink transition-colors pointer-events-auto"
            aria-label="Close tour"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <h3 className="text-title font-bold text-ink tracking-tight mb-1.5">{current.title}</h3>
        <p className="text-callout text-ink-secondary leading-relaxed">{current.body}</p>

        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-5 bg-brand" : "w-1.5 bg-ink/15"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="flex items-center gap-1 px-3 h-9 rounded-[10px] text-caption font-semibold text-ink-tertiary hover:text-ink hover:bg-surface-secondary transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={end}
                className="flex items-center gap-1.5 px-5 h-10 rounded-[12px] bg-emphasis text-on-emphasis text-subhead font-semibold hover:bg-emphasis/90 transition-colors"
              >
                Start building
              </button>
            ) : (
              <button
                onClick={next}
                className="flex items-center gap-1.5 px-5 h-10 rounded-[12px] bg-emphasis text-on-emphasis text-subhead font-semibold hover:bg-emphasis/90 transition-colors"
              >
                {step === 0 ? "Show me" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
