import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Check, ArrowUpRight, X, Send, Crown } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { MEMBERSHIP_TIERS, formatPrice } from "../data/platform";
import { useStore } from "../store/useStore";
import type { MembershipTier } from "../types";

const TIER_ORDER: MembershipTier[] = ["silver", "gold", "platinum", "enterprise"];

const TIER_DESCS: Record<MembershipTier, string> = {
  silver: "Start stage · 1 team member · Community support",
  gold: "Grow stage · 10 team members · Priority support",
  platinum: "Scale stage · 50 team members · Dedicated support",
  enterprise: "Enterprise · Unlimited team · White-glove service",
};

export default function MembershipPage() {
  const selectedCurrency = useStore((s) => s.selectedCurrency);
  const currentTier = useStore((s) => s.currentTier);
  const upgradeTier = useStore((s) => s.upgradeTier);
  const [confirmModal, setConfirmModal] = useState<MembershipTier | null>(null);
  const [contactModal, setContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [upgraded, setUpgraded] = useState<MembershipTier | null>(null);
  const [lastAction, setLastAction] = useState<"upgrade" | "downgrade">("upgrade");

  const handleUpgrade = (tier: MembershipTier) => {
    if (tier === "enterprise") {
      setContactModal(true);
      return;
    }
    setConfirmModal(tier);
  };

  const confirmUpgrade = () => {
    if (confirmModal) {
      const isDowngradeAction = TIER_ORDER.indexOf(confirmModal) < TIER_ORDER.indexOf(currentTier);
      setLastAction(isDowngradeAction ? "downgrade" : "upgrade");
      upgradeTier(confirmModal);
      setUpgraded(confirmModal);
      setConfirmModal(null);
      setTimeout(() => setUpgraded(null), 3000);
    }
  };

  const handleContactSubmit = () => {
    setContactModal(false);
    setContactForm({ name: "", email: "", message: "" });
  };

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
          {upgraded && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-caption text-success mt-2 font-semibold"
            >
              Successfully {lastAction === "downgrade" ? "downgraded" : "upgraded"} to {upgraded.charAt(0).toUpperCase() + upgraded.slice(1)}!
            </motion.p>
          )}
        </GlassCard>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {MEMBERSHIP_TIERS.map((tier, i) => {
            const isActive = tier.tier === currentTier;
            const tierIndex = TIER_ORDER.indexOf(tier.tier);
            const currentIndex = TIER_ORDER.indexOf(currentTier);
            const isUpgrade = tierIndex > currentIndex;
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
                    } ${isActive ? "ring-2 ring-brand/40" : ""}`}
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
                        {isActive ? (
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
                        {isActive ? (
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
                            onClick={() => handleUpgrade(tier.tier)}
                          >
                            {tier.tier === "enterprise" ? "Contact Sales" : isDowngrade ? "Downgrade" : "Upgrade"}
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

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
            onClick={() => setConfirmModal(null)}
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
                {(() => {
                  const isDowngradeAction = TIER_ORDER.indexOf(confirmModal) < TIER_ORDER.indexOf(currentTier);
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-title font-bold text-ink">{isDowngradeAction ? "Confirm Downgrade" : "Confirm Upgrade"}</p>
                        <button
                          onClick={() => setConfirmModal(null)}
                          className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center hover:bg-surface-secondary transition-colors"
                        >
                          <X className="h-4 w-4 text-ink-secondary" />
                        </button>
                      </div>
                      <p className="text-callout text-ink-secondary">
                        {isDowngradeAction ? "Downgrade" : "Upgrade"} to <span className="font-bold text-ink">{confirmModal.charAt(0).toUpperCase() + confirmModal.slice(1)}</span>? {isDowngradeAction ? "Some features may no longer be available." : "Your new features will be available immediately."}
                      </p>
                      <div className="flex gap-3">
                        <Button variant="secondary" fullWidth onClick={() => setConfirmModal(null)}>
                          Cancel
                        </Button>
                        <Button variant={isDowngradeAction ? "secondary" : "brand"} fullWidth onClick={confirmUpgrade}>
                          {isDowngradeAction ? "Confirm Downgrade" : "Confirm Upgrade"}
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Sales Modal */}
      <AnimatePresence>
        {contactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
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
                  <button
                    onClick={() => setContactModal(false)}
                    className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center hover:bg-surface-secondary transition-colors"
                  >
                    <X className="h-4 w-4 text-ink-secondary" />
                  </button>
                </div>
                <p className="text-caption text-ink-tertiary">
                  Tell us about your organization and we will create a custom Enterprise plan.
                </p>
                <div className="space-y-3">
                  <input
                    className="w-full h-10 px-3 rounded-[10px] bg-surface/72 border border-glass-border text-ink text-subhead placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                  <input
                    className="w-full h-10 px-3 rounded-[10px] bg-surface/72 border border-glass-border text-ink text-subhead placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                    placeholder="Email address"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                  <textarea
                    className="w-full h-24 px-3 py-2 rounded-[10px] bg-surface/72 border border-glass-border text-ink text-subhead placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                    placeholder="Tell us about your needs..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" fullWidth onClick={() => setContactModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="brand" fullWidth icon={<Send className="h-4 w-4" />} onClick={handleContactSubmit}>
                    Send Message
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
