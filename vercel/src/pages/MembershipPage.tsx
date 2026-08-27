import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Check,
  ArrowUpRight,
  X,
  Send,
  Crown,
  CreditCard,
  Smartphone,
  CalendarDays,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { MEMBERSHIP_TIERS, formatPrice } from "../data/platform";
import { useStore } from "../store/useStore";
import type { MembershipTier, BillingPeriod, PaymentMethod, PaymentMode } from "../types";

const TIER_ORDER: MembershipTier[] = ["silver", "gold", "platinum", "enterprise"];

const TIER_DESCS: Record<MembershipTier, string> = {
  silver: "Start stage · 1 team member · Community support",
  gold: "Grow stage · 10 team members · Priority support",
  platinum: "Scale stage · 50 team members · Dedicated support",
  enterprise: "Enterprise · Unlimited team · White-glove service",
};

const METHOD_OPTIONS: { id: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "mpesa", label: "M-Pesa", icon: Smartphone },
];

const inputClass =
  "w-full h-10 px-3 rounded-[10px] bg-surface/72 border border-glass-border text-ink text-subhead placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30";

export default function MembershipPage() {
  const selectedCurrency = useStore((s) => s.selectedCurrency);
  const currentTier = useStore((s) => s.currentTier);
  const subscription = useStore((s) => s.subscription);
  const userEmail = useStore((s) => s.user?.email);
  const activateSubscription = useStore((s) => s.activateSubscription);
  const downgradeToFree = useStore((s) => s.downgradeToFree);
  const addNotification = useStore((s) => s.addNotification);

  // ── Checkout state ────────────────────────────────────────────────────────
  const [checkoutTier, setCheckoutTier] = useState<MembershipTier | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [email, setEmail] = useState("");
  const [checkoutPhase, setCheckoutPhase] = useState<"form" | "simulate" | "processing" | "done" | "failed">("form");
  const [checkoutRef, setCheckoutRef] = useState("");
  const [checkoutMode, setCheckoutMode] = useState<PaymentMode>("simulation");
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutNote, setCheckoutNote] = useState("");

  const [contactModal, setContactModal] = useState(false);
  const [downgradeModal, setDowngradeModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [justActivated, setJustActivated] = useState<MembershipTier | null>(null);

  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const isActive =
    subscription.status === "active" && new Date(subscription.expiresAt).getTime() > Date.now();

  useEffect(() => {
    if (justActivated) {
      const t = setTimeout(() => setJustActivated(null), 4000);
      return () => clearTimeout(t);
    }
  }, [justActivated]);

  useEffect(() => () => { if (pollTimer.current) clearInterval(pollTimer.current); }, []);

  const tierPrice = (tier: MembershipTier): number => {
    const t = MEMBERSHIP_TIERS.find((m) => m.tier === tier);
    return t?.monthlyPrice ?? 0;
  };

  const billedAmount = (tier: MembershipTier, period: BillingPeriod): number =>
    period === "yearly" ? tierPrice(tier) * 10 : tierPrice(tier);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    (reference: string, tier: MembershipTier, period: BillingPeriod) => {
      let attempts = 0;
      stopPolling();
      pollTimer.current = setInterval(async () => {
        attempts += 1;
        try {
          const res = await fetch(`/api/payments/status?reference=${encodeURIComponent(reference)}`);
          const data = await res.json().catch(() => ({}));
          if (data?.status === "paid") {
            stopPolling();
            activateSubscription(tier, period);
            setCheckoutPhase("done");
            setJustActivated(tier);
            addNotification({
              title: "Membership activated",
              body: `Your ${tier} plan is live. Welcome aboard.`,
              type: "system",
              actionView: "membership",
            });
          } else if (data?.status === "failed") {
            stopPolling();
            setCheckoutPhase("failed");
            setCheckoutNote("Payment was declined. No charge was made.");
          } else if (attempts > 24) {
            stopPolling();
            setCheckoutPhase("failed");
            setCheckoutNote("Payment is taking too long. Check your gateway and try again.");
          }
        } catch {
          if (attempts > 24) {
            stopPolling();
            setCheckoutPhase("failed");
            setCheckoutNote("Could not reach the payment service. Try again.");
          }
        }
      }, 1000);
    },
    [activateSubscription, addNotification, stopPolling],
  );

  const handleChooseTier = useCallback((tier: MembershipTier) => {
    if (tier === currentTier) return;
    if (tier === "enterprise") {
      setContactModal(true);
      return;
    }
    if (tier === "silver") {
      if (isActive) setDowngradeModal(true);
      return;
    }
    setCheckoutError("");
    setCheckoutNote("");
    setCheckoutPhase("form");
    setEmail(userEmail ?? "");
    setCheckoutTier(tier);
  }, [currentTier, isActive, userEmail]);

  const createCheckout = useCallback(async () => {
    if (!checkoutTier) return;
    setCheckoutError("");
    const amount = billedAmount(checkoutTier, billingPeriod);
    setCheckoutPhase("processing");
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: checkoutTier,
          billingPeriod,
          method,
          email: email.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.reference) {
        setCheckoutPhase("form");
        setCheckoutError(data?.error || "Checkout could not be started. Please try again.");
        return;
      }
      setCheckoutRef(data.reference);
      setCheckoutMode(data.mode);
      setCheckoutAmount(data.amount ?? amount);
      if (data.redirectUrl) {
        // Live Flutterwave hosted checkout — the user pays on Flutterwave's page
        // and is redirected back here; polling resumes on return.
        window.location.href = data.redirectUrl;
        return;
      }
      setCheckoutPhase("simulate");
    } catch {
      setCheckoutPhase("form");
      setCheckoutError("Could not reach the payment service. Are you connected?");
    }
  }, [checkoutTier, billingPeriod, method, email]);

  const simulatePayment = useCallback(async (approved: boolean) => {
    if (!checkoutRef) return;
    setCheckoutPhase("processing");
    setCheckoutError("");
    try {
      const res = await fetch(approved ? "/api/payments/simulate-pay" : "/api/payments/simulate-fail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: checkoutRef }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCheckoutPhase("simulate");
        setCheckoutError(data?.error || "Simulation request failed.");
        return;
      }
      if (!approved) {
        setCheckoutPhase("failed");
        setCheckoutNote("Payment was declined. No charge was made.");
        return;
      }
      if (checkoutTier) pollStatus(checkoutRef, checkoutTier, billingPeriod);
    } catch {
      setCheckoutPhase("simulate");
      setCheckoutError("Simulation request failed. Try again.");
    }
  }, [checkoutRef, checkoutTier, billingPeriod, pollStatus]);

  const closeCheckout = useCallback(() => {
    stopPolling();
    setCheckoutTier(null);
    setCheckoutPhase("form");
    setCheckoutRef("");
    setCheckoutError("");
    setCheckoutNote("");
  }, [stopPolling]);

  const confirmDowngrade = useCallback(() => {
    downgradeToFree();
    setDowngradeModal(false);
    addNotification({
      title: "Plan cancelled",
      body: "Your membership is now free (Silver). Paid features expire immediately.",
      type: "system",
      actionView: "membership",
    });
  }, [downgradeToFree, addNotification]);

  const handleContactSubmit = () => {
    setContactModal(false);
    setContactForm({ name: "", email: "", message: "" });
    addNotification({
      title: "Request sent",
      body: "Our sales team will prepare a custom Enterprise plan for you.",
      type: "system",
      actionView: "membership",
    });
  };

  const checkoutTierConfig = checkoutTier
    ? MEMBERSHIP_TIERS.find((t) => t.tier === checkoutTier)
    : null;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <CursorSpotlight spotlightSize={500} spotlightColor="rgba(212,175,55,0.03)">
        <div className="relative text-center max-w-2xl mx-auto">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[50px] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.08)_0%,transparent_70%)] blur-[40px] pointer-events-none" />
          <h1 className="text-headline text-gradient-brand">Membership</h1>
          <p className="text-callout text-ink-tertiary mt-2">
            Join the BirichiNex™️ ecosystem. Every tier represents a stage of business growth — not just software features.
          </p>
        </div>

        {/* Current Plan */}
        <GlassCard variant="brand" padding="lg" className="text-center max-w-2xl mx-auto mt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-brand-dark" />
            <span className="text-subhead font-bold text-ink">Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</span>
          </div>
          <p className="text-caption text-ink-tertiary">{TIER_DESCS[currentTier]}</p>
          {isActive ? (
            <p className="text-caption text-success mt-2 font-semibold">
              Active until {new Date(subscription.expiresAt).toLocaleDateString()} · {subscription.billingPeriod} plan
            </p>
          ) : subscription.status === "cancelled" ? (
            <p className="text-caption text-warning mt-2 font-semibold">Membership cancelled — choose a plan to continue</p>
          ) : null}
          {justActivated && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-caption text-success mt-2 font-semibold"
            >
              <Check className="inline h-3.5 w-3.5 mr-1" />
              {justActivated.charAt(0).toUpperCase() + justActivated.slice(1)} activated successfully — payment confirmed.
            </motion.p>
          )}
        </GlassCard>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {MEMBERSHIP_TIERS.map((tier, i) => {
            const isCurrent = tier.tier === currentTier;
            const tierIndex = TIER_ORDER.indexOf(tier.tier);
            const currentIndex = TIER_ORDER.indexOf(currentTier);
            const isDowngrade = tierIndex < currentIndex;

            return (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <TiltCard intensity={tier.tier === "gold" ? 10 : 6}>
                  <GlassCard
                    padding="none"
                    hover
                    className={`h-full flex flex-col ${
                      tier.tier === "gold"
                        ? "animated-gradient-border glow-brand relative overflow-hidden"
                        : ""
                    } ${isCurrent ? "ring-2 ring-brand/40" : ""}`}
                  >
                    {tier.tier === "gold" && (
                      <>
                        <div className="bg-brand text-ink text-center py-1.5 text-caption font-bold">
                          Most Popular
                        </div>
                        <div className="absolute inset-0 pointer-events-none" style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.05) 100%)",
                          mixBlendMode: "screen",
                          opacity: 0,
                          transition: "opacity 0.5s ease",
                        }} />
                      </>
                    )}
                    <div className="p-6 flex flex-col flex-1 relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        {isCurrent ? (
                          <Badge variant="brand" size="md" dot>
                            <Crown className="h-3 w-3" /> Current Plan
                          </Badge>
                        ) : (
                          <Badge variant={tier.tier === "enterprise" ? "default" : "brand"} size="md" dot>
                            {tier.stage.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-title font-bold text-ink mb-1">{tier.label}</h3>
                      <p className="text-caption text-ink-tertiary mb-4">{tier.description}</p>

                      <div className="mb-5">
                        {tier.monthlyPrice !== null ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-headline font-bold text-ink">{formatPrice(tier.monthlyPrice, selectedCurrency, "USD")}</span>
                            <span className="text-caption text-ink-quaternary">/month</span>
                          </div>
                        ) : (
                          <span className="text-title font-bold text-ink">Custom Pricing</span>
                        )}
                      </div>

                      <div className="space-y-2.5 mb-6 flex-1">
                        {tier.features.slice(0, 6).map((feature) => (
                          <div key={feature} className="flex items-start gap-2">
                            <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                            <span className="text-caption text-ink-secondary">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <MagneticButton strength={0.15} className="w-full">
                        {isCurrent ? (
                          <Button variant="brand" fullWidth size="lg" disabled>
                            Current Plan
                          </Button>
                        ) : (
                          <Button
                            variant={isDowngrade ? "secondary" : tier.tier === "gold" ? "brand" : "primary"}
                            fullWidth
                            size="lg"
                            icon={tier.tier === "enterprise" ? <ArrowUpRight className="h-4 w-4" /> : undefined}
                            iconPosition="right"
                            onClick={() => handleChooseTier(tier.tier)}
                          >
                            {tier.tier === "enterprise" ? "Contact Sales" : tier.tier === "silver" ? "Cancel paid plan" : "Upgrade"}
                          </Button>
                        )}
                      </MagneticButton>
                    </div>
                  </GlassCard>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>

        {/* Philosophy */}
        <GlassCard padding="xl" className="text-center max-w-3xl mx-auto mt-8">
          <p className="text-callout text-ink-secondary italic leading-relaxed">
            "Technology should never dictate how businesses operate. Businesses should define technology."
          </p>
          <p className="text-caption text-ink-quaternary mt-3">— BirichiNex™️ Philosophy</p>
        </GlassCard>
      </CursorSpotlight>

      {/* ── Checkout Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {checkoutTier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-scrim backdrop-blur-sm"
            onClick={() => checkoutPhase !== "processing" && closeCheckout()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-4"
            >
              <GlassCard padding="lg" className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-title font-bold text-ink">
                    {checkoutPhase === "done" ? "Payment confirmed" : `Secure checkout — ${checkoutTierConfig?.label ?? checkoutTier}`}
                  </p>
                  <button
                    onClick={closeCheckout}
                    disabled={checkoutPhase === "processing"}
                    className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center hover:bg-surface-secondary transition-colors disabled:opacity-40"
                  >
                    <X className="h-4 w-4 text-ink-secondary" />
                  </button>
                </div>

                {checkoutPhase === "form" && checkoutTierConfig && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 rounded-[14px] bg-brand/5 border border-brand/15">
                      <div>
                        <p className="text-subhead font-bold text-ink">{checkoutTierConfig.label}</p>
                        <p className="text-caption text-ink-tertiary">
                          {billedAmount(checkoutTier, billingPeriod).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                          {" "}· {billingPeriod === "yearly" ? "12 months for the price of 10" : "per month"}
                        </p>
                      </div>
                      <Sparkles className="h-5 w-5 text-brand" />
                    </div>

                    {/* Billing period */}
                    <div>
                      <label className="block text-[12px] font-semibold text-ink-secondary mb-1.5">Billing period</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["monthly", "yearly"] as BillingPeriod[]).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setBillingPeriod(p)}
                            className={`h-11 rounded-[12px] border text-[13px] font-semibold transition-all ${
                              billingPeriod === p
                                ? "border-brand bg-brand/10 text-brand"
                                : "border-glass-border text-ink-tertiary hover:text-ink-secondary"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5 capitalize">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {p}
                            </div>
                            <span className={`text-[11px] font-normal ${billingPeriod === p ? "text-brand/80" : "text-ink-quaternary"}`}>
                              {p === "yearly" ? `$${tierPrice(checkoutTier) * 10} · 2 months free` : `$${tierPrice(checkoutTier)}`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment method */}
                    <div>
                      <label className="block text-[12px] font-semibold text-ink-secondary mb-1.5">Payment method</label>
                      <div className="grid grid-cols-2 gap-2">
                        {METHOD_OPTIONS.map((m) => {
                          const Icon = m.icon;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setMethod(m.id)}
                              className={`h-11 rounded-[12px] border flex items-center justify-center gap-2 text-[13px] font-semibold transition-all ${
                                method === m.id
                                  ? "border-brand bg-brand/10 text-brand"
                                  : "border-glass-border text-ink-tertiary hover:text-ink-secondary"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              {m.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[12px] font-semibold text-ink-secondary mb-1.5">Receipt email</label>
                      <input
                        type="email"
                        className={inputClass}
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    {checkoutError && (
                      <p className="flex items-start gap-1.5 text-[12px] text-error">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        {checkoutError}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <Button variant="secondary" fullWidth onClick={closeCheckout}>Cancel</Button>
                      <Button
                        variant="brand"
                        fullWidth
                        icon={<LockIcon />}
                        onClick={() => void createCheckout()}
                      >
                        Pay ${billedAmount(checkoutTier, billingPeriod)}
                      </Button>
                    </div>
                    <p className="text-[11px] text-ink-quaternary text-center">
                      Secured by Flutterwave · Card & M-Pesa · Money settles to the owner's bank account
                    </p>
                  </div>
                )}

                {checkoutPhase === "simulate" && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-[14px] bg-surface/60 border border-glass-border space-y-1.5">
                      <p className="text-[12px] text-ink-tertiary">Reference</p>
                      <p className="text-[13px] font-mono text-ink break-all">{checkoutRef}</p>
                      <p className="text-[12px] text-ink-tertiary mt-2">Amount</p>
                      <p className="text-[13px] font-semibold text-ink">${checkoutAmount.toFixed(2)} USD</p>
                    </div>
                    <p className="text-caption text-ink-secondary">
                      <Badge variant="info" size="sm">Simulation mode</Badge>{" "}
                      No gateway is configured yet, so this is a simulated Flutterwave checkout. Approve to confirm payment, or decline to test the failure path.
                    </p>
                    {checkoutError && (
                      <p className="flex items-start gap-1.5 text-[12px] text-error">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        {checkoutError}
                      </p>
                    )}
                    <div className="flex gap-3">
                      <Button variant="danger" fullWidth onClick={() => void simulatePayment(false)}>Decline payment</Button>
                      <Button variant="brand" fullWidth icon={<Check className="h-4 w-4" />} onClick={() => void simulatePayment(true)}>
                        Approve payment
                      </Button>
                    </div>
                  </div>
                )}

                {checkoutPhase === "processing" && (
                  <div className="py-8 flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-brand animate-spin" />
                    <p className="text-caption text-ink-secondary">Confirming payment…</p>
                    <p className="text-[11px] font-mono text-ink-quaternary break-all px-6">{checkoutRef}</p>
                  </div>
                )}

                {checkoutPhase === "done" && (
                  <div className="py-6 flex flex-col items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-success/15 flex items-center justify-center">
                      <Check className="h-7 w-7 text-success" strokeWidth={2} />
                    </div>
                    <p className="text-subhead font-bold text-ink">You're on {checkoutTierConfig?.label ?? checkoutTier}</p>
                    <p className="text-caption text-ink-tertiary text-center">
                      Payment confirmed. Your {billingPeriod} plan is active and earnings have been credited to your business wallet.
                    </p>
                    <Button variant="brand" size="md" onClick={closeCheckout} className="mt-2">Done</Button>
                  </div>
                )}

                {checkoutPhase === "failed" && (
                  <div className="py-6 flex flex-col items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-error/15 flex items-center justify-center">
                      <AlertCircle className="h-7 w-7 text-error" strokeWidth={2} />
                    </div>
                    <p className="text-subhead font-bold text-ink">Payment not completed</p>
                    <p className="text-caption text-ink-tertiary text-center">{checkoutNote || "No charge was made. Try again."}</p>
                    <Button variant="brand" size="md" onClick={() => { setCheckoutPhase("form"); setCheckoutError(""); }} className="mt-2">
                      Try again
                    </Button>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Downgrade to free modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {downgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-scrim backdrop-blur-sm"
            onClick={() => setDowngradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm mx-4"
            >
              <GlassCard padding="lg" className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-title font-bold text-ink">Cancel paid plan</p>
                  <button onClick={() => setDowngradeModal(false)} className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center hover:bg-surface-secondary transition-colors">
                    <X className="h-4 w-4 text-ink-secondary" />
                  </button>
                </div>
                <p className="text-callout text-ink-secondary">
                  Downgrade to the free Silver tier? Paid features (procurement, logistics, finance, automation) will be removed immediately.
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" fullWidth onClick={() => setDowngradeModal(false)}>Keep my plan</Button>
                  <Button variant="danger" fullWidth onClick={confirmDowngrade}>Cancel plan</Button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Contact Sales Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {contactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-scrim backdrop-blur-sm"
            onClick={() => setContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-4"
            >
              <GlassCard padding="lg" className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-title font-bold text-ink">Contact Sales</p>
                  <button onClick={() => setContactModal(false)} className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center hover:bg-surface-secondary transition-colors">
                    <X className="h-4 w-4 text-ink-secondary" />
                  </button>
                </div>
                <p className="text-caption text-ink-tertiary">
                  Tell us about your organization and we will create a custom Enterprise plan.
                </p>
                <div className="space-y-3">
                  <input className={inputClass} placeholder="Your name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
                  <input className={inputClass} placeholder="Email address" type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
                  <textarea
                    className="w-full h-24 px-3 py-2 rounded-[10px] bg-surface/72 border border-glass-border text-ink text-subhead placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                    placeholder="Tell us about your needs..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" fullWidth onClick={() => setContactModal(false)}>Cancel</Button>
                  <Button variant="brand" fullWidth icon={<Send className="h-4 w-4" />} onClick={handleContactSubmit}>Send Message</Button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LockIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
