import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, ArrowUpRight, Check } from "lucide-react";
import { useStore } from "../../store/useStore";
import { PAID_PLANS } from "../../types";
import type { BirichiNexView } from "../../types";

const MISSING_FEATURES = [
  "Procurement & purchase orders",
  "Logistics & shipping",
  "Finance & accounting",
  "Workflow automation",
  "Team seats (up to 50)",
];

interface UpgradeReminderProps {
  onNavigate?: (view: BirichiNexView) => void;
}

/**
 * Subtle one-time upgrade nudge for free-tier (Silver) business users.
 * Appears ~7s after the business shell mounts, shows once per account (the
 * dismissal is persisted), and quietly goes away on the X or on the CTA.
 */
export default function UpgradeReminder({ onNavigate }: UpgradeReminderProps) {
  const currentTier = useStore((s) => s.currentTier);
  const subscription = useStore((s) => s.subscription);
  const dismissed = useStore((s) => s.upgradeReminderDismissed);
  const dismissUpgradeReminder = useStore((s) => s.dismissUpgradeReminder);

  const [visible, setVisible] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const hasPaid =
    subscription.status === "active" &&
    new Date(subscription.expiresAt).getTime() > Date.now() &&
    PAID_PLANS.includes(subscription.plan);

  const shouldShow = !dismissed && !hasPaid && currentTier === "silver";

  useEffect(() => {
    if (!shouldShow) return;
    const showTimer = setTimeout(() => setVisible(true), 7000);
    const hideTimer = setTimeout(() => setTimedOut(true), 45_000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [shouldShow]);

  if (!shouldShow || timedOut) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-sm"
        >
          <div className="glass-material-lg rounded-[18px] border border-brand/20 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/8 via-transparent to-[#007AFF]/5 pointer-events-none" />
            <div className="relative p-5">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-[11px] bg-brand/15 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4.5 w-4.5 text-brand" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-ink">You're on the free Silver plan</p>
                  <p className="text-[12px] text-ink-tertiary mt-0.5">
                    Unlock the tools growing businesses run on:
                  </p>
                </div>
                <button
                  onClick={dismissUpgradeReminder}
                  aria-label="Dismiss"
                  className="h-7 w-7 rounded-full bg-surface-secondary/70 flex items-center justify-center text-ink-tertiary hover:text-ink transition-colors shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-3 space-y-1.5">
                {MISSING_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[12px] text-ink-secondary">
                    <Check className="h-3 w-3 text-brand shrink-0" strokeWidth={2} />
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-[12px] text-ink-tertiary">From $49/mo</p>
                <button
                  onClick={() => {
                    dismissUpgradeReminder();
                    onNavigate?.("membership");
                  }}
                  className="h-9 px-3.5 rounded-[10px] bg-brand text-white text-[13px] font-semibold flex items-center gap-1.5 hover:bg-brand-dark transition-colors"
                >
                  Explore Gold
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
